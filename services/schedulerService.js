const Stream = require('../models/Stream');
const scheduledTerminations = new Map();
const scheduledStarts = new Map();
const SCHEDULE_LOOKAHEAD_SECONDS = 300; // 5 minutes lookahead
const SCHEDULE_CHECK_INTERVAL = 10 * 1000; // Check every 10 seconds
let streamingService = null;
let initialized = false;
let scheduleIntervalId = null;
let durationIntervalId = null;
function init(streamingServiceInstance) {
  if (initialized) {
    console.log('Stream scheduler already initialized');
    return;
  }
  streamingService = streamingServiceInstance;
  initialized = true;
  console.log('Stream scheduler initialized');
  // Check scheduled streams more frequently (every 10 seconds)
  scheduleIntervalId = setInterval(checkScheduledStreams, SCHEDULE_CHECK_INTERVAL);
  durationIntervalId = setInterval(checkStreamDurations, 60 * 1000);
  checkScheduledStreams();
  checkStreamDurations();
}
async function checkScheduledStreams() {
  try {
    if (!streamingService) {
      console.error('StreamingService not initialized in scheduler');
      return;
    }
    const now = new Date();
    const lookAheadTime = new Date(now.getTime() + SCHEDULE_LOOKAHEAD_SECONDS * 1000);
    const streams = await Stream.findScheduledInRange(now, lookAheadTime);
    
    for (const stream of streams) {
      // Skip if already scheduled
      if (scheduledStarts.has(stream.id)) {
        continue;
      }
      
      const scheduleTime = new Date(stream.schedule_time);
      const timeUntilStart = scheduleTime.getTime() - now.getTime();
      
      // If schedule time is in the past or within 5 seconds, start immediately
      if (timeUntilStart <= 5000) {
        console.log(`Starting scheduled stream immediately: ${stream.id} - ${stream.title}`);
        startScheduledStream(stream.id);
      } else {
        // Schedule for future start
        console.log(`Scheduling stream ${stream.id} to start in ${Math.round(timeUntilStart / 1000)} seconds`);
        const timeoutId = setTimeout(() => {
          startScheduledStream(stream.id);
          scheduledStarts.delete(stream.id);
        }, timeUntilStart);
        
        scheduledStarts.set(stream.id, timeoutId);
      }
    }
  } catch (error) {
    console.error('Error checking scheduled streams:', error);
  }
}

async function startScheduledStream(streamId) {
  try {
    console.log(`Starting scheduled stream: ${streamId}`);
    const result = await streamingService.startStream(streamId);
    if (result.success) {
      console.log(`Successfully started scheduled stream: ${streamId}`);
    } else {
      console.error(`Failed to start scheduled stream ${streamId}: ${result.error}`);
    }
  } catch (error) {
    console.error(`Error starting scheduled stream ${streamId}:`, error);
  }
}
async function checkStreamDurations() {
  try {
    if (!streamingService) {
      console.error('StreamingService not initialized in scheduler');
      return;
    }
    const liveStreams = await Stream.findAll(null, 'live');
    for (const stream of liveStreams) {
      if (stream.duration && stream.start_time && !scheduledTerminations.has(stream.id)) {
        const startTime = new Date(stream.start_time);
        const durationMs = stream.duration * 60 * 1000;
        const shouldEndAt = new Date(startTime.getTime() + durationMs);
        const now = new Date();
        if (shouldEndAt <= now) {
          console.log(`Stream ${stream.id} exceeded duration, stopping now`);
          await streamingService.stopStream(stream.id);
        } else {
          const timeUntilEnd = shouldEndAt.getTime() - now.getTime();
          scheduleStreamTermination(stream.id, timeUntilEnd / 60000);
        }
      }
    }
  } catch (error) {
    console.error('Error checking stream durations:', error);
  }
}
function scheduleStreamTermination(streamId, durationMinutes) {
  if (!streamingService) {
    console.error('StreamingService not initialized in scheduler');
    return;
  }
  if (typeof durationMinutes !== 'number' || Number.isNaN(durationMinutes)) {
    console.error(`Invalid duration provided for stream ${streamId}: ${durationMinutes}`);
    return;
  }
  if (scheduledTerminations.has(streamId)) {
    clearTimeout(scheduledTerminations.get(streamId));
  }
  const clampedMinutes = Math.max(0, durationMinutes);
  const durationMs = clampedMinutes * 60 * 1000;
  console.log(`Scheduling termination for stream ${streamId} after ${clampedMinutes} minutes`);
  const timeoutId = setTimeout(async () => {
    try {
      console.log(`Terminating stream ${streamId} after ${clampedMinutes} minute duration`);
      await streamingService.stopStream(streamId);
      scheduledTerminations.delete(streamId);
    } catch (error) {
      console.error(`Error terminating stream ${streamId}:`, error);
    }
  }, durationMs);
  scheduledTerminations.set(streamId, timeoutId);
}
function cancelStreamTermination(streamId) {
  if (scheduledTerminations.has(streamId)) {
    clearTimeout(scheduledTerminations.get(streamId));
    scheduledTerminations.delete(streamId);
    console.log(`Cancelled scheduled termination for stream ${streamId}`);
    return true;
  }
  return false;
}

function cancelScheduledStart(streamId) {
  if (scheduledStarts.has(streamId)) {
    clearTimeout(scheduledStarts.get(streamId));
    scheduledStarts.delete(streamId);
    console.log(`Cancelled scheduled start for stream ${streamId}`);
    return true;
  }
  return false;
}

function handleStreamStopped(streamId) {
  cancelStreamTermination(streamId);
  cancelScheduledStart(streamId);
  return true;
}

module.exports = {
  init,
  scheduleStreamTermination,
  cancelStreamTermination,
  cancelScheduledStart,
  handleStreamStopped
};
