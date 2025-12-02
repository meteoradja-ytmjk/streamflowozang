const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const getAudioInfo = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('Error getting audio info:', err);
        return reject(err);
      }

      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
      
      if (!audioStream) {
        return reject(new Error('No audio stream found'));
      }

      const info = {
        duration: metadata.format.duration || 0,
        format: metadata.format.format_name || 'unknown',
        bitrate: audioStream.bit_rate || metadata.format.bit_rate || 0,
        sample_rate: audioStream.sample_rate || 0,
        channels: audioStream.channels || 0
      };

      resolve(info);
    });
  });
};

module.exports = {
  getAudioInfo
};
