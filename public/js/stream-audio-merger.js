// Stream Audio Merger - Client Side Script

let selectedVideoId = null;
let selectedAudioId = null;

// Load audios for stream
async function loadAudiosForStream() {
  try {
    const response = await fetch('/api/audios/for-stream');
    const data = await response.json();
    
    if (data.success) {
      return data.audios;
    } else {
      console.error('Failed to load audios:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error loading audios:', error);
    return [];
  }
}

// Check video and audio compatibility
async function checkCompatibility(videoId, audioId) {
  try {
    const response = await fetch('/api/check-video-audio-compatibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ videoId, audioId })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking compatibility:', error);
    return { success: false, error: error.message };
  }
}

// Format duration
function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Show audio selection modal
async function showAudioSelectionModal(videoId) {
  selectedVideoId = videoId;
  
  const audios = await loadAudiosForStream();
  
  if (audios.length === 0) {
    alert('No audio files available. Please upload audio files first.');
    return;
  }
  
  const modal = document.createElement('div');
  modal.id = 'audio-selection-modal';
  modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center';
  
  modal.innerHTML = `
    <div class="bg-dark-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 border border-gray-600/50">
      <div class="flex items-center justify-between p-4 border-b border-gray-600/50">
        <h3 class="text-lg font-medium">Select Audio for Stream</h3>
        <button onclick="closeAudioSelectionModal()" class="rounded-full w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors">
          <i class="ti ti-x"></i>
        </button>
      </div>
      
      <div class="p-6">
        <div class="mb-4">
          <p class="text-sm text-gray-400 mb-2">
            <i class="ti ti-info-circle mr-1"></i>
            Video will automatically loop to match the audio duration
          </p>
        </div>
        
        <div class="space-y-2 max-h-96 overflow-y-auto">
          ${audios.map(audio => `
            <div class="audio-item bg-dark-700/50 p-4 rounded-lg border border-gray-600/30 hover:border-primary/50 cursor-pointer transition-all" data-audio-id="${audio.id}">
              <div class="flex items-center justify-between">
                <div class="flex items-center flex-1">
                  <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
                    <i class="ti ti-music text-blue-400"></i>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium">${audio.title}</h4>
                    <div class="text-xs text-gray-400 mt-1">
                      <span>${formatDuration(audio.duration)}</span>
                      <span class="mx-1">•</span>
                      <span>${formatFileSize(audio.file_size)}</span>
                      <span class="mx-1">•</span>
                      <span>${audio.format.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <button class="select-audio-btn bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm" data-audio-id="${audio.id}">
                  Select
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="flex justify-end p-4 border-t border-gray-600/50">
        <button onclick="closeAudioSelectionModal()" class="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.classList.add('overflow-hidden');
  
  // Add click handlers
  modal.querySelectorAll('.select-audio-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const audioId = btn.dataset.audioId;
      await selectAudioForStream(audioId);
    });
  });
  
  modal.querySelectorAll('.audio-item').forEach(item => {
    item.addEventListener('click', async () => {
      const audioId = item.dataset.audioId;
      await selectAudioForStream(audioId);
    });
  });
}

// Select audio for stream
async function selectAudioForStream(audioId) {
  selectedAudioId = audioId;
  
  // Show loading
  const modal = document.getElementById('audio-selection-modal');
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg';
  loadingDiv.innerHTML = `
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
      <p class="text-white">Checking compatibility...</p>
    </div>
  `;
  modal.querySelector('.bg-dark-800').appendChild(loadingDiv);
  
  // Check compatibility
  const result = await checkCompatibility(selectedVideoId, selectedAudioId);
  
  if (result.success && result.compatible) {
    // Show compatibility info
    showCompatibilityInfo(result);
  } else {
    alert('Error: ' + (result.error || 'Video and audio are not compatible'));
    closeAudioSelectionModal();
  }
}

// Show compatibility info
function showCompatibilityInfo(compatibilityData) {
  const modal = document.getElementById('audio-selection-modal');
  const content = modal.querySelector('.bg-dark-800');
  
  content.innerHTML = `
    <div class="flex items-center justify-between p-4 border-b border-gray-600/50">
      <h3 class="text-lg font-medium">Compatibility Check</h3>
      <button onclick="closeAudioSelectionModal()" class="rounded-full w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors">
        <i class="ti ti-x"></i>
      </button>
    </div>
    
    <div class="p-6">
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <i class="ti ti-check text-green-400 text-2xl mr-3"></i>
          <div>
            <h4 class="font-medium text-green-400">Compatible!</h4>
            <p class="text-sm text-gray-300 mt-1">${compatibilityData.message}</p>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-dark-700/50 p-4 rounded-lg">
          <h5 class="text-sm font-medium text-gray-400 mb-2">Video Info</h5>
          <div class="space-y-1 text-sm">
            <div><span class="text-gray-400">Duration:</span> <span class="text-white">${formatDuration(compatibilityData.video.duration)}</span></div>
            <div><span class="text-gray-400">Resolution:</span> <span class="text-white">${compatibilityData.video.width}x${compatibilityData.video.height}</span></div>
            <div><span class="text-gray-400">Codec:</span> <span class="text-white">${compatibilityData.video.codec}</span></div>
          </div>
        </div>
        
        <div class="bg-dark-700/50 p-4 rounded-lg">
          <h5 class="text-sm font-medium text-gray-400 mb-2">Audio Info</h5>
          <div class="space-y-1 text-sm">
            <div><span class="text-gray-400">Duration:</span> <span class="text-white">${formatDuration(compatibilityData.audio.duration)}</span></div>
            <div><span class="text-gray-400">Sample Rate:</span> <span class="text-white">${compatibilityData.audio.sampleRate} Hz</span></div>
            <div><span class="text-gray-400">Channels:</span> <span class="text-white">${compatibilityData.audio.channels}</span></div>
          </div>
        </div>
      </div>
      
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div class="flex items-start">
          <i class="ti ti-info-circle text-blue-400 text-xl mr-3 mt-0.5"></i>
          <div class="text-sm">
            <p class="text-gray-300">The video will loop <strong class="text-white">${compatibilityData.loopCount} time(s)</strong> to match the audio duration.</p>
            <p class="text-gray-400 mt-1">Total stream duration will be approximately <strong class="text-white">${formatDuration(compatibilityData.audio.duration)}</strong></p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex justify-end gap-3 p-4 border-t border-gray-600/50">
      <button onclick="closeAudioSelectionModal()" class="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors">
        Cancel
      </button>
      <button onclick="confirmAudioSelection()" class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors">
        <i class="ti ti-check mr-2"></i>
        Use This Audio
      </button>
    </div>
  `;
}

// Confirm audio selection
function confirmAudioSelection() {
  // Set audio ID in the stream form
  const audioInput = document.getElementById('streamAudioId');
  if (audioInput) {
    audioInput.value = selectedAudioId;
  }
  
  // Show selected audio indicator
  const indicator = document.getElementById('selected-audio-indicator');
  if (indicator) {
    indicator.classList.remove('hidden');
    indicator.querySelector('.audio-name').textContent = 'Audio selected';
  }
  
  closeAudioSelectionModal();
  
  // Show success message
  if (typeof showToast === 'function') {
    showToast('success', 'Audio selected successfully! Video will loop to match audio duration.');
  }
}

// Close audio selection modal
function closeAudioSelectionModal() {
  const modal = document.getElementById('audio-selection-modal');
  if (modal) {
    modal.remove();
    document.body.classList.remove('overflow-hidden');
  }
}

// Export functions
if (typeof window !== 'undefined') {
  window.showAudioSelectionModal = showAudioSelectionModal;
  window.closeAudioSelectionModal = closeAudioSelectionModal;
  window.confirmAudioSelection = confirmAudioSelection;
}
