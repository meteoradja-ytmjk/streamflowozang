const StreamBackup = require('../models/StreamBackup');
const { db } = require('../db/database');

class BackupService {
  /**
   * Auto backup stream configuration before update
   */
  static async autoBackup(streamId, userId, streamData) {
    try {
      await StreamBackup.create(streamId, userId, streamData, 'auto');
      
      // Cleanup old backups (keep last 10)
      await StreamBackup.cleanupOldBackups(streamId, 10);
      
      return { success: true };
    } catch (error) {
      console.error('Auto backup failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manual backup by user
   */
  static async manualBackup(streamId, userId, streamData) {
    try {
      const backup = await StreamBackup.create(streamId, userId, streamData, 'manual');
      return { success: true, backup };
    } catch (error) {
      console.error('Manual backup failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Restore stream from backup
   */
  static async restoreFromBackup(backupId, userId) {
    try {
      const streamData = await StreamBackup.restore(backupId, userId);
      return { success: true, data: streamData };
    } catch (error) {
      console.error('Restore failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export all user configurations to JSON
   */
  static async exportConfig(userId) {
    try {
      const config = await StreamBackup.exportUserConfig(userId);
      return { success: true, config };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Import configurations from JSON
   */
  static async importConfig(userId, configData) {
    return new Promise((resolve, reject) => {
      try {
        if (!configData.streams || !Array.isArray(configData.streams)) {
          return reject(new Error('Invalid configuration format'));
        }

        const imported = [];
        const errors = [];

        // Import each stream
        configData.streams.forEach((stream, index) => {
          const { v4: uuidv4 } = require('uuid');
          const newId = uuidv4();
          const now = new Date().toISOString();

          db.run(
            `INSERT INTO streams (
              id, user_id, title, video_id, audio_id, rtmp_url, stream_key,
              bitrate, fps, resolution, orientation, loop_video,
              use_advanced_settings, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newId,
              userId,
              stream.title + ' (Imported)',
              stream.video_id,
              stream.audio_id,
              stream.rtmp_url,
              stream.stream_key,
              stream.bitrate,
              stream.fps,
              stream.resolution,
              stream.orientation,
              stream.loop_video,
              stream.use_advanced_settings,
              'offline',
              now,
              now
            ],
            function (err) {
              if (err) {
                errors.push({ index, error: err.message });
              } else {
                imported.push(newId);
              }

              // Check if all done
              if (imported.length + errors.length === configData.streams.length) {
                resolve({
                  success: true,
                  imported: imported.length,
                  errors: errors.length,
                  details: { imported, errors }
                });
              }
            }
          );
        });

        if (configData.streams.length === 0) {
          resolve({ success: true, imported: 0, errors: 0 });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Soft delete stream (move to trash)
   */
  static async softDelete(streamId, userId) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      
      db.run(
        `UPDATE streams 
         SET deleted_at = ?, status = 'deleted' 
         WHERE id = ? AND user_id = ?`,
        [now, streamId, userId],
        function (err) {
          if (err) {
            console.error('Soft delete failed:', err);
            return reject(err);
          }
          resolve({ success: true, deleted: this.changes });
        }
      );
    });
  }

  /**
   * Restore deleted stream
   */
  static async restoreDeleted(streamId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE streams 
         SET deleted_at = NULL, status = 'offline' 
         WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL`,
        [streamId, userId],
        function (err) {
          if (err) {
            console.error('Restore deleted failed:', err);
            return reject(err);
          }
          resolve({ success: true, restored: this.changes });
        }
      );
    });
  }

  /**
   * Get deleted streams (trash)
   */
  static async getDeletedStreams(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT s.*, v.title as video_title, v.thumbnail_path
         FROM streams s
         LEFT JOIN videos v ON s.video_id = v.id
         WHERE s.user_id = ? AND s.deleted_at IS NOT NULL
         ORDER BY s.deleted_at DESC`,
        [userId],
        (err, rows) => {
          if (err) {
            console.error('Get deleted streams failed:', err);
            return reject(err);
          }
          resolve(rows || []);
        }
      );
    });
  }

  /**
   * Permanently delete stream
   */
  static async permanentDelete(streamId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM streams 
         WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL`,
        [streamId, userId],
        function (err) {
          if (err) {
            console.error('Permanent delete failed:', err);
            return reject(err);
          }
          resolve({ success: true, deleted: this.changes });
        }
      );
    });
  }

  /**
   * Auto cleanup old deleted streams (older than 30 days)
   */
  static async cleanupOldDeleted() {
    return new Promise((resolve, reject) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      db.run(
        `DELETE FROM streams 
         WHERE deleted_at IS NOT NULL 
         AND deleted_at < ?`,
        [thirtyDaysAgo.toISOString()],
        function (err) {
          if (err) {
            console.error('Cleanup old deleted failed:', err);
            return reject(err);
          }
          resolve({ success: true, deleted: this.changes });
        }
      );
    });
  }
}

module.exports = BackupService;
