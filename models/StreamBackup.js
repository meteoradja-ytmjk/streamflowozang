const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');

class StreamBackup {
  /**
   * Create a backup of stream configuration
   */
  static async create(streamId, userId, streamData, backupType = 'auto') {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      db.run(
        `INSERT INTO stream_backups (
          id, stream_id, user_id, backup_data, backup_type, 
          version, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          streamId,
          userId,
          JSON.stringify(streamData),
          backupType,
          1,
          now
        ],
        function (err) {
          if (err) {
            console.error('Error creating stream backup:', err.message);
            return reject(err);
          }
          resolve({ id, stream_id: streamId, created_at: now });
        }
      );
    });
  }

  /**
   * Get all backups for a stream
   */
  static async findByStreamId(streamId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM stream_backups 
         WHERE stream_id = ? 
         ORDER BY created_at DESC`,
        [streamId],
        (err, rows) => {
          if (err) {
            console.error('Error finding stream backups:', err.message);
            return reject(err);
          }
          resolve(rows || []);
        }
      );
    });
  }

  /**
   * Get all backups for a user
   */
  static async findByUserId(userId, limit = 50) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT sb.*, s.title as stream_title 
         FROM stream_backups sb
         LEFT JOIN streams s ON sb.stream_id = s.id
         WHERE sb.user_id = ? 
         ORDER BY sb.created_at DESC
         LIMIT ?`,
        [userId, limit],
        (err, rows) => {
          if (err) {
            console.error('Error finding user backups:', err.message);
            return reject(err);
          }
          resolve(rows || []);
        }
      );
    });
  }

  /**
   * Get a specific backup
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM stream_backups WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            console.error('Error finding backup:', err.message);
            return reject(err);
          }
          resolve(row);
        }
      );
    });
  }

  /**
   * Restore stream from backup
   */
  static async restore(backupId, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const backup = await this.findById(backupId);
        
        if (!backup) {
          return reject(new Error('Backup not found'));
        }

        if (backup.user_id !== userId) {
          return reject(new Error('Unauthorized'));
        }

        const streamData = JSON.parse(backup.backup_data);
        resolve(streamData);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Delete old backups (keep last N backups per stream)
   */
  static async cleanupOldBackups(streamId, keepCount = 10) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM stream_backups 
         WHERE stream_id = ? 
         AND id NOT IN (
           SELECT id FROM stream_backups 
           WHERE stream_id = ? 
           ORDER BY created_at DESC 
           LIMIT ?
         )`,
        [streamId, streamId, keepCount],
        function (err) {
          if (err) {
            console.error('Error cleaning up backups:', err.message);
            return reject(err);
          }
          resolve({ deleted: this.changes });
        }
      );
    });
  }

  /**
   * Delete backup
   */
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM stream_backups WHERE id = ?',
        [id],
        function (err) {
          if (err) {
            console.error('Error deleting backup:', err.message);
            return reject(err);
          }
          resolve({ success: true, deleted: this.changes });
        }
      );
    });
  }

  /**
   * Export all user configurations
   */
  static async exportUserConfig(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT s.*, v.title as video_title, v.filepath as video_path
         FROM streams s
         LEFT JOIN videos v ON s.video_id = v.id
         WHERE s.user_id = ? AND s.deleted_at IS NULL`,
        [userId],
        (err, rows) => {
          if (err) {
            console.error('Error exporting config:', err.message);
            return reject(err);
          }
          
          const exportData = {
            version: '1.0',
            exported_at: new Date().toISOString(),
            user_id: userId,
            streams: rows || []
          };
          
          resolve(exportData);
        }
      );
    });
  }
}

module.exports = StreamBackup;
