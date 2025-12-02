let selectedVideoData = null;
let selectedAudioData = null;
let currentOrientation = 'horizontal';
let isDropdownOpen = false;
let videoSelectorDropdown = null;
let desktopVideoPlayer = null;
let mobileVideoPlayer = null;
let streamKeyTimeout = null;
let isStreamKeyValid = true;
let currentPlatform = 'Custom';

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  videoSelectorDropdown = document.getElementById('videoSelectorDropdown');
  console.log('Stream modal initialized');
});
function openNewStreamModal() {
  const modal = document.getElementById('newStreamModal');
  document.body.style.overflow = 'hidden';
  modal.classList.remove('hidden');
  const advancedSettingsContent = document.getElementById('advancedSettingsContent');
  const advancedSettingsToggle = document.getElementById('advancedSettingsToggle');
  if (advancedSettingsContent && advancedSettingsToggle) {
    advancedSettingsContent.classList.add('hidden');
    const icon = advancedSettingsToggle.querySelector('i');
    if (icon) icon.style.transform = '';
  }
  requestAnimationFrame(() => {
    modal.classList.add('active');
  });
  
  // Set YouTube as default platform
  const rtmpInput = document.getElementById('rtmpUrl');
  const platformSelector = document.getElementById('platformSelector');
  if (rtmpInput && !rtmpInput.value) {
    rtmpInput.value = 'rtmps://a.rtmp.youtube.com/live2';
    currentPlatform = 'YouTube';
    
    // Update platform icon to YouTube
    if (platformSelector) {
      const icon = platformSelector.querySelector('i');
      if (icon) {
        icon.className = 'ti ti-brand-youtube text-red-500';
      }
    }
  }
  
  loadGalleryVideos();
}
function closeNewStreamModal() {
  const modal = document.getElementById('newStreamModal');
  document.body.style.overflow = 'auto';
  modal.classList.remove('active');
  resetModalForm();
  const advancedSettingsContent = document.getElementById('advancedSettingsContent');
  const advancedSettingsToggle = document.getElementById('advancedSettingsToggle');
  if (advancedSettingsContent && advancedSettingsToggle) {
    advancedSettingsContent.classList.add('hidden');
    const icon = advancedSettingsToggle.querySelector('i');
    if (icon) icon.style.transform = '';
  }
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
  if (desktopVideoPlayer) {
    desktopVideoPlayer.pause();
    desktopVideoPlayer.dispose();
    desktopVideoPlayer = null;
  }
  if (mobileVideoPlayer) {
    mobileVideoPlayer.pause();
    mobileVideoPlayer.dispose();
    mobileVideoPlayer = null;
  }
}
function toggleVideoSelector() {
  const dropdown = document.getElementById('videoSelectorDropdown');
  if (dropdown.classList.contains('hidden')) {
    dropdown.classList.remove('hidden');
    if (!dropdown.dataset.loaded) {
      loadGalleryVideos();
      dropdown.dataset.loaded = 'true';
    }
    const searchInput = document.getElementById('videoSearchInput');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 10);
    }
  } else {
    dropdown.classList.add('hidden');
    const searchInput = document.getElementById('videoSearchInput');
    if (searchInput) {
      searchInput.value = '';
    }
  }
}
function selectVideo(video) {
  selectedVideoData = video;
  const displayText = video.type === 'playlist' ? `[Playlist] ${video.name}` : video.name;
  document.getElementById('selectedVideo').textContent = displayText;
  const videoSelector = document.querySelector('[onclick="toggleVideoSelector()"]');
  videoSelector.classList.remove('border-red-500');
  videoSelector.classList.add('border-gray-600');
  
  const desktopPreview = document.getElementById('videoPreview');
  const desktopEmptyPreview = document.getElementById('emptyPreview');
  const mobilePreview = document.getElementById('videoPreviewMobile');
  const mobileEmptyPreview = document.getElementById('emptyPreviewMobile');
  
  if (desktopVideoPlayer) {
    desktopVideoPlayer.pause();
    desktopVideoPlayer.dispose();
    desktopVideoPlayer = null;
  }
  if (mobileVideoPlayer) {
    mobileVideoPlayer.pause();
    mobileVideoPlayer.dispose();
    mobileVideoPlayer = null;
  }
  
  if (video.type === 'playlist') {
    desktopPreview.classList.add('hidden');
    mobilePreview.classList.add('hidden');
    desktopEmptyPreview.classList.remove('hidden');
    mobileEmptyPreview.classList.remove('hidden');
    
    const desktopEmptyContent = desktopEmptyPreview.querySelector('div');
    const mobileEmptyContent = mobileEmptyPreview.querySelector('div');
    
    if (desktopEmptyContent) {
      desktopEmptyContent.innerHTML = `
        <i class="ti ti-playlist text-4xl text-blue-400 mb-2"></i>
        <p class="text-sm text-gray-300 font-medium">${video.name}</p>
        <p class="text-xs text-blue-300 mt-1">Playlist selected • ${video.duration || 'Unknown duration'}</p>
      `;
    }
    
    if (mobileEmptyContent) {
      mobileEmptyContent.innerHTML = `
        <i class="ti ti-playlist text-4xl text-blue-400 mb-2"></i>
        <p class="text-sm text-gray-300 font-medium">${video.name}</p>
        <p class="text-xs text-blue-300 mt-1">Playlist selected • ${video.duration || 'Unknown duration'}</p>
      `;
    }
  } else {
    desktopPreview.classList.remove('hidden');
    mobilePreview.classList.remove('hidden');
    desktopEmptyPreview.classList.add('hidden');
    mobileEmptyPreview.classList.add('hidden');
    
    const desktopVideoContainer = document.getElementById('videoPreview');
    const mobileVideoContainer = document.getElementById('videoPreviewMobile');
    
    desktopVideoContainer.innerHTML = `
      <video id="videojs-preview-desktop" class="video-js vjs-default-skin vjs-big-play-centered" controls preload="auto">
        <source src="${video.url}" type="video/mp4">
      </video>
    `;
    mobileVideoContainer.innerHTML = `
      <video id="videojs-preview-mobile" class="video-js vjs-default-skin vjs-big-play-centered" controls preload="auto">
        <source src="${video.url}" type="video/mp4">
      </video>
    `;
    
    setTimeout(() => {
      desktopVideoPlayer = videojs('videojs-preview-desktop', {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true
      });
      mobileVideoPlayer = videojs('videojs-preview-mobile', {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true
      });
    }, 10);
  }
  
  document.getElementById('videoSelectorDropdown').classList.add('hidden');
  const hiddenVideoInput = document.getElementById('selectedVideoId');
  if (hiddenVideoInput) {
    hiddenVideoInput.value = video.id;
  }
}
async function loadGalleryVideos() {
  try {
    const container = document.getElementById('videoListContainer');
    if (!container) {
      console.error("Video list container not found");
      return;
    }
    container.innerHTML = '<div class="text-center py-3"><i class="ti ti-loader animate-spin mr-2"></i>Loading content...</div>';
    const response = await fetch('/api/stream/content');
    const content = await response.json();
    window.allStreamVideos = content;
    displayFilteredVideos(content);
    const searchInput = document.getElementById('videoSearchInput');
    if (searchInput) {
      searchInput.removeEventListener('input', handleVideoSearch);
      searchInput.addEventListener('input', handleVideoSearch);
      setTimeout(() => searchInput.focus(), 10);
    } else {
      console.error("Search input element not found");
    }
  } catch (error) {
    console.error('Error loading gallery content:', error);
    const container = document.getElementById('videoListContainer');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-5 text-red-400">
          <i class="ti ti-alert-circle text-2xl mb-2"></i>
          <p>Failed to load content</p>
          <p class="text-xs text-gray-500 mt-1">Please try again</p>
        </div>
      `;
    }
  }
}
function handleVideoSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  console.log("Searching for:", searchTerm);
  if (!window.allStreamVideos) {
    console.error("No content available for search");
    return;
  }
  if (searchTerm === '') {
    displayFilteredVideos(window.allStreamVideos);
    return;
  }
  const filteredContent = window.allStreamVideos.filter(item =>
    item.name.toLowerCase().includes(searchTerm) ||
    (item.type === 'playlist' && item.description && item.description.toLowerCase().includes(searchTerm))
  );
  console.log(`Found ${filteredContent.length} matching items`);
  displayFilteredVideos(filteredContent);
}
function displayFilteredVideos(videos) {
  const container = document.getElementById('videoListContainer');
  container.innerHTML = '';
  if (videos && videos.length > 0) {
    videos.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'w-full flex items-start space-x-3 p-2 rounded hover:bg-dark-600 transition-colors text-left';
      button.onclick = () => selectVideo(item);
      
      if (item.type === 'playlist') {
        button.innerHTML = `
          <div class="w-16 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex-shrink-0 overflow-hidden relative">
            <img src="${item.thumbnail}" alt="" 
              class="w-full h-full object-cover rounded" 
              onerror="this.src='/images/playlist-thumbnail.svg'">
            <div class="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded-bl text-[8px] font-bold">PL</div>
          </div>
          <div class="flex-1 min-w-0 ml-3 text-left">
            <p class="text-sm font-medium text-white truncate flex items-center">
              <i class="ti ti-playlist text-blue-400 mr-1 text-xs"></i>
              ${item.name}
            </p>
            <p class="text-xs text-blue-300">${item.resolution} • ${item.duration}</p>
          </div>
        `;
      } else {
        button.innerHTML = `
          <div class="w-16 h-12 bg-dark-800 rounded flex-shrink-0 overflow-hidden">
            <img src="${item.thumbnail || '/images/default-thumbnail.jpg'}" alt="" 
              class="w-full h-full object-cover rounded" 
              onerror="this.src='/images/default-thumbnail.jpg'">
          </div>
          <div class="flex-1 min-w-0 ml-3 text-left">
            <p class="text-sm font-medium text-white truncate">${item.name}</p>
            <p class="text-xs text-gray-400">${item.resolution} • ${item.duration}</p>
          </div>
        `;
      }
      container.appendChild(button);
    });
  } else {
    container.innerHTML = `
      <div class="text-center py-5 text-gray-400">
        <i class="ti ti-search-off text-2xl mb-2"></i>
        <p>No matching content found</p>
        <p class="text-xs text-gray-500 mt-1">Try different keywords</p>
      </div>
    `;
  }
}
function resetModalForm() {
  const form = document.getElementById('newStreamForm');
  form.reset();
  selectedVideoData = null;
  selectedAudioData = null;
  document.getElementById('selectedVideo').textContent = 'Choose a video...';
  document.getElementById('selectedAudio').innerHTML = '<i class="ti ti-music mr-2"></i>No audio (use video audio)';
  
  // Reset audio info display
  const audioInfoDisplay = document.getElementById('audioInfoDisplay');
  if (audioInfoDisplay) {
    audioInfoDisplay.classList.add('hidden');
  }
  
  // Reset hidden inputs
  const hiddenAudioInput = document.getElementById('selectedAudioId');
  if (hiddenAudioInput) {
    hiddenAudioInput.value = '';
  }
  
  // Set YouTube as default platform after reset
  const rtmpInput = document.getElementById('rtmpUrl');
  const platformSelector = document.getElementById('platformSelector');
  if (rtmpInput) {
    rtmpInput.value = 'rtmps://a.rtmp.youtube.com/live2';
    currentPlatform = 'YouTube';
    
    // Update platform icon to YouTube
    if (platformSelector) {
      const icon = platformSelector.querySelector('i');
      if (icon) {
        icon.className = 'ti ti-brand-youtube text-red-500';
      }
    }
  }
  
  const desktopPreview = document.getElementById('videoPreview');
  const desktopEmptyPreview = document.getElementById('emptyPreview');
  const mobilePreview = document.getElementById('videoPreviewMobile');
  const mobileEmptyPreview = document.getElementById('emptyPreviewMobile');
  desktopPreview.classList.add('hidden');
  mobilePreview.classList.add('hidden');
  desktopEmptyPreview.classList.remove('hidden');
  mobileEmptyPreview.classList.remove('hidden');
  
  const desktopEmptyContent = desktopEmptyPreview.querySelector('div');
  const mobileEmptyContent = mobileEmptyPreview.querySelector('div');
  
  if (desktopEmptyContent) {
    desktopEmptyContent.innerHTML = `
      <i class="ti ti-video text-4xl text-gray-600 mb-2"></i>
      <p class="text-sm text-gray-500">Select a video to preview</p>
    `;
  }
  
  if (mobileEmptyContent) {
    mobileEmptyContent.innerHTML = `
      <i class="ti ti-video text-4xl text-gray-600 mb-2"></i>
      <p class="text-sm text-gray-500">Select a video to preview</p>
    `;
  }
  
  if (isDropdownOpen) {
    toggleVideoSelector();
  }
}
function initModal() {
  const modal = document.getElementById('newStreamModal');
  if (!modal) return;
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeNewStreamModal();
    }
  });
  
  if (videoSelectorDropdown) {
    document.addEventListener('click', (e) => {
      const isClickInsideDropdown = videoSelectorDropdown.contains(e.target);
      const isClickOnButton = e.target.closest('[onclick="toggleVideoSelector()"]');
      if (!isClickInsideDropdown && !isClickOnButton && isDropdownOpen) {
        toggleVideoSelector();
      }
    });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isDropdownOpen) {
        toggleVideoSelector();
      } else if (!modal.classList.contains('hidden')) {
        closeNewStreamModal();
      }
    }
  });
  modal.addEventListener('touchmove', (e) => {
    if (e.target === modal) {
      e.preventDefault();
    }
  }, { passive: false });
}
function setVideoOrientation(orientation) {
  currentOrientation = orientation;
  const buttons = document.querySelectorAll('[onclick^="setVideoOrientation"]');
  buttons.forEach(button => {
    if (button.getAttribute('onclick').includes(orientation)) {
      button.classList.add('bg-primary', 'border-primary', 'text-white');
      button.classList.remove('bg-dark-700', 'border-gray-600');
    } else {
      button.classList.remove('bg-primary', 'border-primary', 'text-white');
      button.classList.add('bg-dark-700', 'border-gray-600');
    }
  });
  updateResolutionDisplay();
}
function updateResolutionDisplay() {
  const select = document.getElementById('resolutionSelect');
  const option = select.options[select.selectedIndex];
  const resolution = option.getAttribute(`data-${currentOrientation}`);
  const quality = option.textContent;
  document.getElementById('currentResolution').textContent = `${resolution} (${quality})`;
}
document.addEventListener('DOMContentLoaded', () => {
  const resolutionSelect = document.getElementById('resolutionSelect');
  if (resolutionSelect) {
    resolutionSelect.addEventListener('change', updateResolutionDisplay);
    setVideoOrientation('horizontal');
  }
});
function toggleStreamKeyVisibility() {
  const streamKeyInput = document.getElementById('streamKey');
  const streamKeyToggle = document.getElementById('streamKeyToggle');
  if (streamKeyInput.type === 'password') {
    streamKeyInput.type = 'text';
    streamKeyToggle.className = 'ti ti-eye-off';
  } else {
    streamKeyInput.type = 'password';
    streamKeyToggle.className = 'ti ti-eye';
  }
}
document.addEventListener('DOMContentLoaded', function () {
  const platformSelector = document.getElementById('platformSelector');
  const platformDropdown = document.getElementById('platformDropdown');
  const rtmpInput = document.getElementById('rtmpUrl');
  if (!platformSelector || !platformDropdown || !rtmpInput) return;
  platformSelector.addEventListener('click', function (e) {
    e.stopPropagation();
    platformDropdown.classList.toggle('hidden');
  });
  const platformOptions = document.querySelectorAll('.platform-option');
  platformOptions.forEach(option => {
    option.addEventListener('click', function () {
      const platformUrl = this.getAttribute('data-url');
      const platformName = this.querySelector('span').textContent;
      rtmpInput.value = platformUrl;
      platformDropdown.classList.add('hidden');
      updatePlatformIcon(this.querySelector('i').className);
    });
  });
  document.addEventListener('click', function (e) {
    if (platformDropdown && !platformDropdown.contains(e.target) &&
      !platformSelector.contains(e.target)) {
      platformDropdown.classList.add('hidden');
    }
  });
  function updatePlatformIcon(iconClass) {
    const currentIcon = platformSelector.querySelector('i');
    const iconParts = iconClass.split(' ');
    const brandIconPart = iconParts.filter(part => part.startsWith('ti-'))[0];
    currentIcon.className = `ti ${brandIconPart} text-center`;
    if (brandIconPart.includes('youtube')) {
      currentIcon.classList.add('text-red-500');
    } else if (brandIconPart.includes('twitch')) {
      currentIcon.classList.add('text-purple-500');
    } else if (brandIconPart.includes('facebook')) {
      currentIcon.classList.add('text-blue-500');
    } else if (brandIconPart.includes('instagram')) {
      currentIcon.classList.add('text-pink-500');
    } else if (brandIconPart.includes('tiktok')) {
      currentIcon.classList.add('text-white');
    } else if (brandIconPart.includes('shopee')) {
      currentIcon.classList.add('text-orange-500');
    } else if (brandIconPart.includes('live-photo')) {
      currentIcon.classList.add('text-teal-500');
    }
  }
  if (typeof showToast !== 'function') {
    window.showToast = function (type, message) {
      console.log(`${type}: ${message}`);
    }
  }
  const streamKeyInput = document.getElementById('streamKey');
  if (streamKeyInput && rtmpInput) {
    rtmpInput.addEventListener('input', function () {
      const url = this.value.toLowerCase();
      if (url.includes('youtube.com')) {
        currentPlatform = 'YouTube';
      } else if (url.includes('facebook.com')) {
        currentPlatform = 'Facebook';
      } else if (url.includes('twitch.tv')) {
        currentPlatform = 'Twitch';
      } else if (url.includes('tiktok.com')) {
        currentPlatform = 'TikTok';
      } else if (url.includes('instagram.com')) {
        currentPlatform = 'Instagram';
      } else if (url.includes('shopee.io')) {
        currentPlatform = 'Shopee Live';
      } else if (url.includes('restream.io')) {
        currentPlatform = 'Restream.io';
      } else {
        currentPlatform = 'Custom';
      }
      if (streamKeyInput.value) {
        validateStreamKeyForPlatform(streamKeyInput.value, currentPlatform);
      }
    });
    streamKeyInput.addEventListener('input', function () {
      clearTimeout(streamKeyTimeout);
      const streamKey = this.value.trim();
      if (!streamKey) {
        return;
      }
      streamKeyTimeout = setTimeout(() => {
        validateStreamKeyForPlatform(streamKey, currentPlatform);
      }, 500);
    });
  }
});
function validateStreamKeyForPlatform(streamKey, platform) {
  if (!streamKey.trim()) {
    return;
  }
  fetch(`/api/streams/check-key?key=${encodeURIComponent(streamKey)}`)
    .then(response => response.json())
    .then(data => {
      const streamKeyInput = document.getElementById('streamKey');
      if (data.isInUse) {
        streamKeyInput.classList.add('border-red-500');
        streamKeyInput.classList.remove('border-gray-600', 'focus:border-primary');
        let errorMsg = document.getElementById('streamKeyError');
        if (!errorMsg) {
          errorMsg = document.createElement('div');
          errorMsg.id = 'streamKeyError';
          errorMsg.className = 'text-xs text-red-500 mt-1';
          streamKeyInput.parentNode.appendChild(errorMsg);
        }
        errorMsg.textContent = 'This stream key is already in use. Please use a different key.';
        isStreamKeyValid = false;
      } else {
        streamKeyInput.classList.remove('border-red-500');
        streamKeyInput.classList.add('border-gray-600', 'focus:border-primary');
        const errorMsg = document.getElementById('streamKeyError');
        if (errorMsg) {
          errorMsg.remove();
        }
        isStreamKeyValid = true;
      }
    })
    .catch(error => {
      console.error('Error validating stream key:', error);
    });
}
document.addEventListener('DOMContentLoaded', initModal);

// Audio Selector Functions
function toggleAudioSelector() {
  const dropdown = document.getElementById('audioSelectorDropdown');
  console.log('Toggle audio selector, dropdown:', dropdown); // Debug
  
  if (!dropdown) {
    console.error('Audio selector dropdown not found!');
    return;
  }
  
  if (dropdown.classList.contains('hidden')) {
    console.log('Opening audio dropdown'); // Debug
    dropdown.classList.remove('hidden');
    
    // Always reload audios when opening dropdown
    console.log('Loading audios...'); // Debug
    loadAudiosForStream();
    
    const searchInput = document.getElementById('audioSearchInput');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 10);
    }
  } else {
    console.log('Closing audio dropdown'); // Debug
    dropdown.classList.add('hidden');
    const searchInput = document.getElementById('audioSearchInput');
    if (searchInput) {
      searchInput.value = '';
    }
  }
}

async function loadAudiosForStream() {
  try {
    const container = document.getElementById('audioListContainer');
    if (!container) {
      console.error("Audio list container not found");
      return;
    }
    
    container.innerHTML = '<div class="text-center py-3"><i class="ti ti-loader animate-spin mr-2"></i>Loading audio...</div>';
    
    const response = await fetch('/api/audios');
    const data = await response.json();
    
    console.log('Audio API response:', data); // Debug log
    
    // API returns array directly, not object with success property
    if (Array.isArray(data)) {
      window.allStreamAudios = data;
      displayFilteredAudios(data);
      
      const searchInput = document.getElementById('audioSearchInput');
      if (searchInput) {
        searchInput.removeEventListener('input', handleAudioSearch);
        searchInput.addEventListener('input', handleAudioSearch);
      }
    } else if (data && data.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5 text-gray-400">
          <i class="ti ti-music-off text-2xl mb-2"></i>
          <p class="text-sm">No audio files available</p>
          <p class="text-xs text-gray-500 mt-1">Upload audio files first</p>
        </div>
      `;
    } else {
      console.error('Unexpected API response format:', data);
      container.innerHTML = `
        <div class="text-center py-5 text-gray-400">
          <i class="ti ti-music-off text-2xl mb-2"></i>
          <p class="text-sm">No audio files available</p>
          <p class="text-xs text-gray-500 mt-1">Upload audio files first</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading audios:', error);
    const container = document.getElementById('audioListContainer');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-5 text-red-400">
          <i class="ti ti-alert-circle text-2xl mb-2"></i>
          <p>Failed to load audio</p>
          <p class="text-xs text-gray-500 mt-1">Please try again</p>
        </div>
      `;
    }
  }
}

function handleAudioSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (!window.allStreamAudios) {
    console.error("No audio available for search");
    return;
  }
  
  if (searchTerm === '') {
    displayFilteredAudios(window.allStreamAudios);
    return;
  }
  
  const filteredAudios = window.allStreamAudios.filter(audio =>
    audio.title.toLowerCase().includes(searchTerm)
  );
  
  displayFilteredAudios(filteredAudios);
}

function displayFilteredAudios(audios) {
  const container = document.getElementById('audioListContainer');
  container.innerHTML = '';
  
  console.log('Displaying audios:', audios); // Debug log
  
  // Add "No Audio" option
  const noAudioButton = document.createElement('button');
  noAudioButton.type = 'button';
  noAudioButton.className = 'w-full flex items-start space-x-3 p-2 rounded hover:bg-dark-600 transition-colors text-left border-b border-gray-700/50';
  noAudioButton.onclick = () => selectAudio(null);
  noAudioButton.innerHTML = `
    <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
      <i class="ti ti-music-off text-gray-400"></i>
    </div>
    <div class="flex-1 min-w-0 ml-3 text-left">
      <p class="text-sm font-medium text-white">No Audio</p>
      <p class="text-xs text-gray-400">Use original video audio</p>
    </div>
  `;
  container.appendChild(noAudioButton);
  
  if (audios && audios.length > 0) {
    console.log(`Rendering ${audios.length} audio items`); // Debug log
    audios.forEach(audio => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'w-full flex items-start space-x-3 p-2 rounded hover:bg-dark-600 transition-colors text-left';
      button.onclick = () => selectAudio(audio);
      
      const duration = formatDuration(audio.duration);
      const fileSize = formatFileSize(audio.file_size);
      
      button.innerHTML = `
        <div class="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0">
          <i class="ti ti-music text-purple-400"></i>
        </div>
        <div class="flex-1 min-w-0 ml-3 text-left">
          <p class="text-sm font-medium text-white truncate">${audio.title}</p>
          <p class="text-xs text-gray-400">${duration} • ${fileSize} • ${audio.format.toUpperCase()}</p>
        </div>
      `;
      container.appendChild(button);
    });
  } else {
    console.log('No audios to display'); // Debug log
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'text-center py-5 text-gray-400';
    emptyDiv.innerHTML = `
      <i class="ti ti-music-off text-2xl mb-2"></i>
      <p class="text-sm">No audio files available</p>
      <p class="text-xs text-gray-500 mt-1">Upload audio files first</p>
    `;
    container.appendChild(emptyDiv);
  }
}

function selectAudio(audio) {
  selectedAudioData = audio;
  
  const selectedAudioDisplay = document.getElementById('selectedAudio');
  const audioInfoDisplay = document.getElementById('audioInfoDisplay');
  const audioInfoText = document.getElementById('audioInfoText');
  const hiddenAudioInput = document.getElementById('selectedAudioId');
  
  if (audio) {
    selectedAudioDisplay.innerHTML = `<i class="ti ti-music mr-2 text-purple-400"></i>${audio.title}`;
    
    if (hiddenAudioInput) {
      hiddenAudioInput.value = audio.id;
    }
    
    // Show audio info
    if (audioInfoDisplay && audioInfoText) {
      audioInfoDisplay.classList.remove('hidden');
      audioInfoText.innerHTML = `
        <strong>Audio selected:</strong> ${audio.title}<br>
        <strong>Duration:</strong> ${formatDuration(audio.duration)} • 
        <strong>Format:</strong> ${audio.format.toUpperCase()}<br>
        <span class="text-purple-300">Video will loop to match audio duration</span>
      `;
    }
    
    // Change border color to purple
    const audioSelector = document.querySelector('[onclick="toggleAudioSelector()"]');
    if (audioSelector) {
      audioSelector.classList.remove('border-gray-600');
      audioSelector.classList.add('border-purple-500');
    }
  } else {
    selectedAudioDisplay.innerHTML = '<i class="ti ti-music mr-2"></i>No audio (use video audio)';
    
    if (hiddenAudioInput) {
      hiddenAudioInput.value = '';
    }
    
    if (audioInfoDisplay) {
      audioInfoDisplay.classList.add('hidden');
    }
    
    // Reset border color
    const audioSelector = document.querySelector('[onclick="toggleAudioSelector()"]');
    if (audioSelector) {
      audioSelector.classList.remove('border-purple-500');
      audioSelector.classList.add('border-gray-600');
    }
  }
  
  document.getElementById('audioSelectorDropdown').classList.add('hidden');
}

// Helper functions
function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


// Make audio functions globally available
if (typeof window !== 'undefined') {
  window.toggleAudioSelector = toggleAudioSelector;
  window.selectAudio = selectAudio;
  window.loadAudiosForStream = loadAudiosForStream;
  console.log('Audio selector functions registered globally');
}
