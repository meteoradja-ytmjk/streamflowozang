const ScheduleTemplate = require('../models/ScheduleTemplate');
const Stream = require('../models/Stream');
const { db } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const streamingService = require('./streamingService');

// Store active timers
const activeTimers = new Map();
const scheduledStreamsCache = new Map();

/**
 * Initialize recurring scheduler
 * Load all active templates and schedule them
 */
async function initialize() {
  try {
    console.log('[RecurringScheduler] Initializing...');
    
    // Clear existing timers
    activeTimers.forEach(timer => clearTimeout(timer));
    activeTimers.clear();
    
    // Load active templates
    const templates = await ScheduleTemplate.findActive();
    console.log(`[RecurringScheduler] Found ${templates.length} active templates`);
    
    // Schedule each template
    for (const template of templates) {
      await scheduleTemplate(template);
    }
    
    // Check for pending scheduled streams every minute
    setInterval(checkPendingStreams, 60 * 1000);
    
    console.log('[RecurringScheduler] Initialization complete');
  } catch (error) {
    console.error('[RecurringScheduler] Initialization error:', error);
  }
}

/**
 * Schedule a template
 */
async function scheduleTemplate(template) {
  try {
    console.log(`[RecurringScheduler] Scheduling template: ${template.name} (${template.recurrence_type})`);
    
    // Get next scheduled time
    const nextTime = ScheduleTemplate.getNextScheduledTime(template);
    
    if (!nextTime) {
      console.log(`[RecurringScheduler] No next time for template ${template.id}`);
      return;
    }
    
    console.log(`[RecurringScheduler] Next scheduled time: ${nextTime.toISOString()}`);
    
    // Create scheduled stream entry
    await createScheduledStream(template, nextTime);
    
    // Calculate time until next execution
    const now = new Date();
    const timeUntil = nextTime.getTime() - now.getTime();
    
    if (timeUntil > 0) {
      // Schedule the execution
      const timer = setTimeout(async () => {
        await executeScheduledStream(template, nextTime);
        
        // Schedule next occurrence
        if (template.recurrence_type !== 'once') {
          await scheduleTemplate(template);
        }
      }, timeUntil);
      
      activeTimers.set(template.id, timer);
      console.log(`[RecurringScheduler] Template ${template.id} scheduled in ${Math.round(timeUntil / 1000)}s`);
    }
  } catch (error) {
    console.error(`[RecurringScheduler] Error scheduling template ${template.id}:`, error);
  }
}

/**
 * Create scheduled stream entry in database
 */
async function createScheduledStream(template, scheduledTime) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    
    db.run(
      `INSERT INTO scheduled_streams (
        id, template_id, stream_id, scheduled_time, 
        duration_minutes, status, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        template.id,
        template.stream_id,
        scheduledTime.toISOString(),
        template.duration_minutes,
        'pending',
        template.user_id
      ],
      function (err) {
        if (err) {
          console.error('Error creating scheduled stream:', err.message);
          return reject(err);
        }
        console.log(`[RecurringScheduler] Created scheduled stream ${id}`);
        resolve({ id });
      }
    );
  });
}

/**
 * Execute scheduled stream
 */
async function executeScheduledStream(template, scheduledTime) {
  try {
    console.log(`[RecurringScheduler] Executing scheduled stream for template ${template.id}`);
    
    // Update stream schedule_time
    await Stream.update(template.stream_id, {
      schedule_time: scheduledTime.toISOString(),
      duration: template.duration_minutes,
      status: 'scheduled'
    });
    
    // Start the stream
    const result = await streamingService.startStream(template.stream_id);
    
    if (result.success) {
      console.log(`[RecurringScheduler] Stream ${template.stream_id} started successfully`);
      
      // Update scheduled stream status
      await updateScheduledStreamStatus(template.id, scheduledTime, 'running');
      
      // Schedule auto-stop after duration
      if (template.duration_minutes > 0) {
        setTimeout(async () => {
          console.log(`[RecurringScheduler] Auto-stopping stream ${template.stream_id} after ${template.duration_minutes} minutes`);
          await streamingService.stopStream(template.stream_id);
          await updateScheduledStreamStatus(template.id, scheduledTime, 'completed');
        }, template.duration_minutes * 60 * 1000);
      }
    } else {
      console.error(`[RecurringScheduler] Failed to start stream: ${result.error}`);
      await updateScheduledStreamStatus(template.id, scheduledTime, 'failed');
    }
  } catch (error) {
    console.error(`[RecurringScheduler] Error executing scheduled stream:`, error);
    await updateScheduledStreamStatus(template.id, scheduledTime, 'failed');
  }
}

/**
 * Update scheduled stream status
 */
async function updateScheduledStreamStatus(templateId, scheduledTime, status) {
  return new Promise((resolve, reject) => {
    const updateFields = { status };
    
    if (status === 'running') {
      updateFields.started_at = new Date().toISOString();
    } else if (status === 'completed' || status === 'failed') {
      updateFields.ended_at = new Date().toISOString();
    }
    
    const fields = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateFields);
    values.push(templateId, scheduledTime.toISOString());
    
    db.run(
      `UPDATE scheduled_streams 
       SET ${fields}
       WHERE template_id = ? AND scheduled_time = ?`,
      values,
      function (err) {
        if (err) {
          console.error('Error updating scheduled stream status:', err.message);
          return reject(err);
        }
        resolve({ success: true });
      }
    );
  });
}

/**
 * Check for pending scheduled streams
 * This is a backup mechanism in case timers fail
 */
async function checkPendingStreams() {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const pendingStreams = await new Promise((resolve, reject) => {
      db.all(
        `SELECT ss.*, st.name as template_name, st.stream_id, st.duration_minutes
         FROM scheduled_streams ss
         LEFT JOIN schedule_templates st ON ss.template_id = st.id
         WHERE ss.status = 'pending' 
         AND ss.scheduled_time <= ?
         AND ss.scheduled_time >= ?`,
        [now.toISOString(), fiveMinutesAgo.toISOString()],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
    
    for (const stream of pendingStreams) {
      console.log(`[RecurringScheduler] Found pending stream ${stream.id}, executing...`);
      
      const template = await ScheduleTemplate.findById(stream.template_id);
      if (template) {
        await executeScheduledStream(template, new Date(stream.scheduled_time));
      }
    }
  } catch (error) {
    console.error('[RecurringScheduler] Error checking pending streams:', error);
  }
}

/**
 * Reschedule a template (when updated)
 */
async function rescheduleTemplate(templateId) {
  try {
    // Clear existing timer
    if (activeTimers.has(templateId)) {
      clearTimeout(activeTimers.get(templateId));
      activeTimers.delete(templateId);
    }
    
    // Load template
    const template = await ScheduleTemplate.findById(templateId);
    
    if (template && template.is_active) {
      await scheduleTemplate(template);
    }
  } catch (error) {
    console.error(`[RecurringScheduler] Error rescheduling template ${templateId}:`, error);
  }
}

/**
 * Cancel a template's scheduled streams
 */
async function cancelTemplate(templateId) {
  try {
    // Clear timer
    if (activeTimers.has(templateId)) {
      clearTimeout(activeTimers.get(templateId));
      activeTimers.delete(templateId);
    }
    
    // Cancel pending scheduled streams
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE scheduled_streams 
         SET status = 'cancelled'
         WHERE template_id = ? AND status = 'pending'`,
        [templateId],
        function (err) {
          if (err) return reject(err);
          resolve({ success: true });
        }
      );
    });
    
    console.log(`[RecurringScheduler] Template ${templateId} cancelled`);
  } catch (error) {
    console.error(`[RecurringScheduler] Error cancelling template ${templateId}:`, error);
  }
}

/**
 * Get upcoming scheduled streams
 */
async function getUpcomingStreams(userId, limit = 10) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT ss.*, st.name as template_name, st.recurrence_type,
              s.title as stream_title, v.title as video_title, v.thumbnail_path
       FROM scheduled_streams ss
       LEFT JOIN schedule_templates st ON ss.template_id = st.id
       LEFT JOIN streams s ON ss.stream_id = s.id
       LEFT JOIN videos v ON s.video_id = v.id
       WHERE ss.user_id = ? AND ss.status = 'pending'
       AND ss.scheduled_time >= datetime('now')
       ORDER BY ss.scheduled_time ASC
       LIMIT ?`,
      [userId, limit],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

/**
 * Get schedule history
 */
async function getScheduleHistory(userId, limit = 50) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT ss.*, st.name as template_name, st.recurrence_type,
              s.title as stream_title
       FROM scheduled_streams ss
       LEFT JOIN schedule_templates st ON ss.template_id = st.id
       LEFT JOIN streams s ON ss.stream_id = s.id
       WHERE ss.user_id = ? 
       AND ss.status IN ('completed', 'failed', 'cancelled')
       ORDER BY ss.scheduled_time DESC
       LIMIT ?`,
      [userId, limit],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

/**
 * Get statistics
 */
async function getStatistics(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'running' THEN 1 END) as running_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
       FROM scheduled_streams
       WHERE user_id = ?`,
      [userId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || {});
      }
    );
  });
}

module.exports = {
  initialize,
  scheduleTemplate,
  rescheduleTemplate,
  cancelTemplate,
  getUpcomingStreams,
  getScheduleHistory,
  getStatistics,
  checkPendingStreams
};
