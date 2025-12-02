const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');

class ScheduleTemplate {
  /**
   * Create a new schedule template
   */
  static create(templateData) {
    const id = uuidv4();
    const {
      name,
      stream_id,
      recurrence_type, // 'once', 'daily', 'weekly', 'monthly'
      recurrence_days, // JSON array untuk weekly: [0,1,2,3,4,5,6] (0=Sunday)
      start_time, // Format: "HH:MM"
      duration_minutes,
      end_date, // Kapan recurring schedule berakhir (optional)
      is_active = true,
      user_id
    } = templateData;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO schedule_templates (
          id, name, stream_id, recurrence_type, recurrence_days,
          start_time, duration_minutes, end_date, is_active, user_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          id, name, stream_id, recurrence_type, 
          recurrence_days ? JSON.stringify(recurrence_days) : null,
          start_time, duration_minutes, end_date, is_active ? 1 : 0, user_id
        ],
        function (err) {
          if (err) {
            console.error('Error creating schedule template:', err.message);
            return reject(err);
          }
          resolve({ id, ...templateData, is_active: is_active ? 1 : 0 });
        }
      );
    });
  }

  /**
   * Find template by ID
   */
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT st.*, s.title as stream_title, s.video_id, s.audio_id
         FROM schedule_templates st
         LEFT JOIN streams s ON st.stream_id = s.id
         WHERE st.id = ?`,
        [id],
        (err, row) => {
          if (err) {
            console.error('Error finding schedule template:', err.message);
            return reject(err);
          }
          if (row) {
            row.is_active = row.is_active === 1;
            if (row.recurrence_days) {
              try {
                row.recurrence_days = JSON.parse(row.recurrence_days);
              } catch (e) {
                row.recurrence_days = null;
              }
            }
          }
          resolve(row);
        }
      );
    });
  }

  /**
   * Find all templates for a user
   */
  static findAll(userId = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT st.*, s.title as stream_title, s.video_id, s.audio_id,
               v.title as video_title, v.thumbnail_path,
               a.title as audio_title
        FROM schedule_templates st
        LEFT JOIN streams s ON st.stream_id = s.id
        LEFT JOIN videos v ON s.video_id = v.id
        LEFT JOIN audios a ON s.audio_id = a.id
      `;
      const params = [];

      if (userId) {
        query += ' WHERE st.user_id = ?';
        params.push(userId);
      }

      query += ' ORDER BY st.created_at DESC';

      db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Error finding schedule templates:', err.message);
          return reject(err);
        }
        if (rows) {
          rows.forEach(row => {
            row.is_active = row.is_active === 1;
            if (row.recurrence_days) {
              try {
                row.recurrence_days = JSON.parse(row.recurrence_days);
              } catch (e) {
                row.recurrence_days = null;
              }
            }
          });
        }
        resolve(rows || []);
      });
    });
  }

  /**
   * Find active templates
   */
  static findActive(userId = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT st.*, s.title as stream_title, s.video_id, s.audio_id
        FROM schedule_templates st
        LEFT JOIN streams s ON st.stream_id = s.id
        WHERE st.is_active = 1
      `;
      const params = [];

      if (userId) {
        query += ' AND st.user_id = ?';
        params.push(userId);
      }

      db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Error finding active templates:', err.message);
          return reject(err);
        }
        if (rows) {
          rows.forEach(row => {
            row.is_active = row.is_active === 1;
            if (row.recurrence_days) {
              try {
                row.recurrence_days = JSON.parse(row.recurrence_days);
              } catch (e) {
                row.recurrence_days = null;
              }
            }
          });
        }
        resolve(rows || []);
      });
    });
  }

  /**
   * Update template
   */
  static update(id, templateData) {
    const fields = [];
    const values = [];

    Object.entries(templateData).forEach(([key, value]) => {
      if (key === 'is_active' && typeof value === 'boolean') {
        fields.push(`${key} = ?`);
        values.push(value ? 1 : 0);
      } else if (key === 'recurrence_days' && Array.isArray(value)) {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    fields.push('updated_at = datetime(\'now\')');
    values.push(id);

    const query = `UPDATE schedule_templates SET ${fields.join(', ')} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.run(query, values, function (err) {
        if (err) {
          console.error('Error updating schedule template:', err.message);
          return reject(err);
        }
        resolve({ id, ...templateData });
      });
    });
  }

  /**
   * Delete template
   */
  static delete(id, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM schedule_templates WHERE id = ? AND user_id = ?',
        [id, userId],
        function (err) {
          if (err) {
            console.error('Error deleting schedule template:', err.message);
            return reject(err);
          }
          resolve({ success: true, deleted: this.changes > 0 });
        }
      );
    });
  }

  /**
   * Toggle active status
   */
  static toggleActive(id, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE schedule_templates 
         SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
             updated_at = datetime('now')
         WHERE id = ? AND user_id = ?`,
        [id, userId],
        function (err) {
          if (err) {
            console.error('Error toggling template status:', err.message);
            return reject(err);
          }
          resolve({ success: true, updated: this.changes > 0 });
        }
      );
    });
  }

  /**
   * Get next scheduled time for a template
   */
  static getNextScheduledTime(template, fromDate = new Date()) {
    const { recurrence_type, recurrence_days, start_time, end_date } = template;
    
    if (!start_time) return null;

    // Parse start_time (HH:MM)
    const [hours, minutes] = start_time.split(':').map(Number);
    
    let nextDate = new Date(fromDate);
    nextDate.setHours(hours, minutes, 0, 0);

    // If time has passed today, start from tomorrow
    if (nextDate <= fromDate) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    // Check end_date
    if (end_date) {
      const endDateTime = new Date(end_date);
      if (nextDate > endDateTime) {
        return null; // Schedule has ended
      }
    }

    switch (recurrence_type) {
      case 'once':
        return nextDate;

      case 'daily':
        return nextDate;

      case 'weekly':
        if (!recurrence_days || recurrence_days.length === 0) {
          return null;
        }
        
        // Find next day that matches recurrence_days
        let daysChecked = 0;
        while (daysChecked < 7) {
          const dayOfWeek = nextDate.getDay();
          if (recurrence_days.includes(dayOfWeek)) {
            return nextDate;
          }
          nextDate.setDate(nextDate.getDate() + 1);
          daysChecked++;
        }
        return null;

      case 'monthly':
        // Same day every month
        return nextDate;

      default:
        return null;
    }
  }
}

module.exports = ScheduleTemplate;
