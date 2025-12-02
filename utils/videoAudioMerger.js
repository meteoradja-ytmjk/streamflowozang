const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Merge video dan audio untuk streaming
 * Video akan di-loop mengikuti durasi audio
 */
const mergeVideoAudioForStream = (videoPath, audioPath, outputPath, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      videoBitrate = '2500k',
      audioBitrate = '128k',
      resolution = '1280x720',
      fps = 30,
      onProgress = null
    } = options;

    // Dapatkan durasi audio terlebih dahulu
    ffmpeg.ffprobe(audioPath, (err, audioMetadata) => {
      if (err) {
        return reject(new Error('Failed to get audio duration: ' + err.message));
      }

      const audioDuration = audioMetadata.format.duration;

      // Dapatkan durasi video
      ffmpeg.ffprobe(videoPath, (err, videoMetadata) => {
        if (err) {
          return reject(new Error('Failed to get video duration: ' + err.message));
        }

        const videoDuration = videoMetadata.format.duration;
        const loopCount = Math.ceil(audioDuration / videoDuration);

        console.log(`Audio duration: ${audioDuration}s, Video duration: ${videoDuration}s, Loop count: ${loopCount}`);

        // Merge video (looped) dengan audio
        const command = ffmpeg();

        // Input video dengan loop
        command.input(videoPath)
          .inputOptions([
            '-stream_loop', (loopCount - 1).toString()
          ]);

        // Input audio
        command.input(audioPath);

        // Output options
        command
          .outputOptions([
            '-map', '0:v:0',  // Video dari input pertama
            '-map', '1:a:0',  // Audio dari input kedua
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-b:v', videoBitrate,
            '-maxrate', videoBitrate,
            '-bufsize', (parseInt(videoBitrate) * 2) + 'k',
            '-c:a', 'aac',
            '-b:a', audioBitrate,
            '-ar', '44100',
            '-shortest',  // Potong video sesuai durasi audio
            '-r', fps.toString(),
            '-s', resolution,
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart'
          ])
          .output(outputPath);

        // Progress callback
        if (onProgress) {
          command.on('progress', (progress) => {
            onProgress({
              percent: progress.percent || 0,
              currentTime: progress.timemark,
              targetSize: progress.targetSize
            });
          });
        }

        // Error handling
        command.on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(new Error('Failed to merge video and audio: ' + err.message));
        });

        // Success
        command.on('end', () => {
          console.log('Video and audio merged successfully');
          resolve({
            outputPath,
            duration: audioDuration,
            loopCount
          });
        });

        // Start processing
        command.run();
      });
    });
  });
};

/**
 * Stream video dan audio secara real-time untuk RTMP
 * Tidak membuat file output, langsung stream ke RTMP
 */
const streamVideoAudioToRTMP = (videoPath, audioPath, rtmpUrl, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      videoBitrate = '2500k',
      audioBitrate = '128k',
      resolution = '1280x720',
      fps = 30,
      onProgress = null,
      onStart = null
    } = options;

    // Dapatkan durasi audio
    ffmpeg.ffprobe(audioPath, (err, audioMetadata) => {
      if (err) {
        return reject(new Error('Failed to get audio duration: ' + err.message));
      }

      const audioDuration = audioMetadata.format.duration;

      // Dapatkan durasi video
      ffmpeg.ffprobe(videoPath, (err, videoMetadata) => {
        if (err) {
          return reject(new Error('Failed to get video duration: ' + err.message));
        }

        const videoDuration = videoMetadata.format.duration;
        const loopCount = Math.ceil(audioDuration / videoDuration);

        console.log(`Streaming - Audio: ${audioDuration}s, Video: ${videoDuration}s, Loops: ${loopCount}`);

        const command = ffmpeg();

        // Input video dengan infinite loop
        command.input(videoPath)
          .inputOptions([
            '-stream_loop', '-1',  // Infinite loop
            '-re'  // Read input at native frame rate
          ]);

        // Input audio
        command.input(audioPath)
          .inputOptions(['-re']);

        // Output ke RTMP
        command
          .outputOptions([
            '-map', '0:v:0',
            '-map', '1:a:0',
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-tune', 'zerolatency',
            '-b:v', videoBitrate,
            '-maxrate', videoBitrate,
            '-bufsize', (parseInt(videoBitrate) * 2) + 'k',
            '-c:a', 'aac',
            '-b:a', audioBitrate,
            '-ar', '44100',
            '-shortest',
            '-r', fps.toString(),
            '-s', resolution,
            '-pix_fmt', 'yuv420p',
            '-f', 'flv',
            '-flvflags', 'no_duration_filesize'
          ])
          .output(rtmpUrl);

        // Progress callback
        if (onProgress) {
          command.on('progress', (progress) => {
            onProgress({
              frames: progress.frames,
              currentFps: progress.currentFps,
              currentKbps: progress.currentKbps,
              targetSize: progress.targetSize,
              timemark: progress.timemark
            });
          });
        }

        // Start callback
        if (onStart) {
          command.on('start', (commandLine) => {
            console.log('FFmpeg command:', commandLine);
            onStart(commandLine);
          });
        }

        // Error handling
        command.on('error', (err, stdout, stderr) => {
          console.error('FFmpeg error:', err.message);
          console.error('FFmpeg stderr:', stderr);
          reject(err);
        });

        // End (ketika audio selesai)
        command.on('end', () => {
          console.log('Streaming finished');
          resolve({
            duration: audioDuration,
            loopCount
          });
        });

        // Start streaming
        command.run();

        // Return command object untuk bisa di-stop
        resolve({
          command,
          duration: audioDuration,
          stop: () => {
            command.kill('SIGKILL');
          }
        });
      });
    });
  });
};

/**
 * Cek kompatibilitas video dan audio
 */
const checkCompatibility = async (videoPath, audioPath) => {
  return new Promise((resolve, reject) => {
    Promise.all([
      new Promise((res, rej) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
          if (err) return rej(err);
          res(metadata);
        });
      }),
      new Promise((res, rej) => {
        ffmpeg.ffprobe(audioPath, (err, metadata) => {
          if (err) return rej(err);
          res(metadata);
        });
      })
    ])
      .then(([videoMetadata, audioMetadata]) => {
        const videoStream = videoMetadata.streams.find(s => s.codec_type === 'video');
        const audioStream = audioMetadata.streams.find(s => s.codec_type === 'audio');

        resolve({
          compatible: true,
          video: {
            duration: videoMetadata.format.duration,
            codec: videoStream?.codec_name,
            width: videoStream?.width,
            height: videoStream?.height,
            fps: videoStream?.avg_frame_rate
          },
          audio: {
            duration: audioMetadata.format.duration,
            codec: audioStream?.codec_name,
            sampleRate: audioStream?.sample_rate,
            channels: audioStream?.channels
          },
          loopCount: Math.ceil(audioMetadata.format.duration / videoMetadata.format.duration)
        });
      })
      .catch(reject);
  });
};

module.exports = {
  mergeVideoAudioForStream,
  streamVideoAudioToRTMP,
  checkCompatibility
};
