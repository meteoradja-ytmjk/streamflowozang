// Schedules Management Script

let templates = [];
let streams = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadStreams();
  loadTemplates();
  loadStatistics();
  loadUpcoming();
});

// Show toast notification
function showToast(type, message) {
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toast-icon');
  const toastMessage = document.getElementById('toast-message');
  
  if (type === 'success') {
    toastIcon.className = 'ti ti-check text-green-400 mr-2';
  } else if (type === 'error') {
    toastIcon.className = 'ti ti-x text-red-400 mr-2';
  } else if (type === 'info') {
    toastIcon.className = 'ti ti-info-circle text-blue-400 mr-2';
  }
  
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Load streams for dropdown
async function loadStreams() {
  try {
    const response = await fetch('/api/streams');
    const data = await response.json();
    
    if (data.success) {
      streams = data.streams;
      populateStreamDropdown();
    }
  } catch (error) {
    console.error('Error loading streams:', error);
  }
}

// Populate stream dropdown
function populateStreamDropdown() {
  const select = document.getElementById('scheduleStream');
  select.innerHTML = '<option value="">Choose a stream...</option>';
  
  streams.forEach(stream => {
    const option = document.createElement('option');
    option.value = stream.id;
    option.textContent = stream.title;
    select.appendChild(option);
  });
}

// Load templates
async function loadTemplates() {
  try {
    const response = await fetch('/api/schedule-templates');
    const data = await response.json();
    
    if (data.success) {
      templates = data.templates;
      renderTemplates();
    }
  } catch (error) {
    console.error('Error loading templates:', error);
    showToast('error', 'Failed to load schedule templates');
  }
}

// Render templates
function renderTemplates() {
  const container = document.getElementById('templates-list');
  
  if (templates.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-gray-800 rounded-lg">
        <i class="ti ti-calendar-off text-6xl text-gray-600 mb-3"></i>
        <h3 class="text-xl font-medium text-gray-300 mb-1">No schedules yet</h3>
        <p class="text-gray-500 mb-4">Create your first recurring schedule</p>
        <button onclick="openCreateScheduleModal()" class="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
          <i class="ti ti-calendar-plus mr-2"></i>
          Create Schedule
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = templates.map(template => `
    <div class="bg-gray-800 rounded-lg p-4 ${!template.is_active ? 'opacity-60' : ''}">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-lg font-medium">${template.name}</h3>
            <span class="px-2 py-0.5 text-xs rounded-full ${getRecurrenceBadgeClass(template.recurrence_type)}">
              ${getRecurrenceLabel(template.recurrence_type)}
            </span>
            ${template.is_active ? 
              '<span class="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">Active</span>' :
              '<span class="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400">Inactive</span>'
            }
          </div>
          
          <div class="text-sm text-gray-400 space-y-1">
            <div class="flex items-center gap-2">
              <i class="ti ti-video"></i>
              <span>${template.stream_title || 'Unknown Stream'}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="ti ti-clock"></i>
              <span>${template.start_time} • ${formatDurationFromMinutes(template.duration_minutes)}</span>
            </div>
            ${template.recurrence_type === 'weekly' && template.recurrence_days ? `
              <div class="flex items-center gap-2">
                <i class="ti ti-calendar"></i>
                <span>${formatRecurrenceDays(template.recurrence_days)}</span>
              </div>
            ` : ''}
            ${template.end_date ? `
              <div class="flex items-center gap-2">
                <i class="ti ti-calendar-event"></i>
                <span>Ends: ${new Date(template.end_date).toLocaleDateString()}</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <button onclick="toggleTemplate('${template.id}')" 
                  class="p-2 rounded-lg ${template.is_active ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'} transition-colors"
                  title="${template.is_active ? 'Deactivate' : 'Activate'}">
            <i class="ti ti-${template.is_active ? 'pause' : 'play'}"></i>
          </button>
          <button onclick="editTemplate('${template.id}')" 
                  class="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  title="Edit">
            <i class="ti ti-edit"></i>
          </button>
          <button onclick="deleteTemplate('${template.id}')" 
                  class="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Delete">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Get recurrence badge class
function getRecurrenceBadgeClass(type) {
  const classes = {
    'once': 'bg-gray-500/20 text-gray-400',
    'daily': 'bg-blue-500/20 text-blue-400',
    'weekly': 'bg-purple-500/20 text-purple-400',
    'monthly': 'bg-pink-500/20 text-pink-400'
  };
  return classes[type] || 'bg-gray-500/20 text-gray-400';
}

// Get recurrence label
function getRecurrenceLabel(type) {
  const labels = {
    'once': 'Once',
    'daily': 'Daily',
    'weekly': 'Weekly',
    'monthly': 'Monthly'
  };
  return labels[type] || type;
}

// Format recurrence days
function formatRecurrenceDays(days) {
  if (!days || !Array.isArray(days)) return '';
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map(d => dayNames[d]).join(', ');
}

// Format duration from minutes
function formatDurationFromMinutes(totalMinutes) {
  if (!totalMinutes) return '0 minutes';
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  let result = '';
  if (hours > 0) {
    result += `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    if (hours > 0) result += ' ';
    result += `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  
  return result || '0 minutes';
}

// Load statistics
async function loadStatistics() {
  try {
    const response = await fetch('/api/schedule-templates/statistics');
    const data = await response.json();
    
    if (data.success) {
      const stats = data.statistics;
      document.getElementById('stat-active').textContent = templates.filter(t => t.is_active).length;
      document.getElementById('stat-upcoming').textContent = stats.pending_count || 0;
      document.getElementById('stat-completed').textContent = stats.completed_count || 0;
      document.getElementById('stat-failed').textContent = stats.failed_count || 0;
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

// Load upcoming streams
async function loadUpcoming() {
  try {
    const response = await fetch('/api/schedule-templates/upcoming?limit=20');
    const data = await response.json();
    
    if (data.success) {
      renderUpcoming(data.upcoming);
    }
  } catch (error) {
    console.error('Error loading upcoming streams:', error);
  }
}

// Render upcoming streams
function renderUpcoming(upcoming) {
  const container = document.getElementById('upcoming-list');
  
  if (upcoming.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-gray-800 rounded-lg">
        <i class="ti ti-calendar-off text-6xl text-gray-600 mb-3"></i>
        <p class="text-gray-400">No upcoming scheduled streams</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = upcoming.map(item => `
    <div class="bg-gray-800 rounded-lg p-4">
      <div class="flex items-center gap-4">
        ${item.thumbnail_path ? 
          `<img src="${item.thumbnail_path}" class="w-20 h-20 object-cover rounded-lg">` :
          `<div class="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
            <i class="ti ti-video text-3xl text-gray-500"></i>
          </div>`
        }
        <div class="flex-1">
          <h4 class="font-medium">${item.stream_title}</h4>
          <p class="text-sm text-gray-400 mt-1">
            <i class="ti ti-calendar mr-1"></i>
            ${new Date(item.scheduled_time).toLocaleString()}
          </p>
          <p class="text-sm text-gray-400">
            <i class="ti ti-clock mr-1"></i>
            ${formatDurationFromMinutes(item.duration_minutes)}
          </p>
          ${item.template_name ? 
            `<p class="text-xs text-blue-400 mt-1">
              <i class="ti ti-repeat mr-1"></i>
              ${item.template_name} (${item.recurrence_type})
            </p>` : ''
          }
        </div>
      </div>
    </div>
  `).join('');
}

// Load history
async function loadHistory() {
  try {
    const response = await fetch('/api/schedule-templates/history?limit=50');
    const data = await response.json();
    
    if (data.success) {
      renderHistory(data.history);
    }
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

// Render history
function renderHistory(history) {
  const container = document.getElementById('history-list');
  
  if (history.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-gray-800 rounded-lg">
        <i class="ti ti-history text-6xl text-gray-600 mb-3"></i>
        <p class="text-gray-400">No schedule history yet</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = history.map(item => `
    <div class="bg-gray-800 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium">${item.stream_title}</h4>
          <p class="text-sm text-gray-400 mt-1">
            ${new Date(item.scheduled_time).toLocaleString()}
          </p>
          ${item.template_name ? 
            `<p class="text-xs text-gray-500 mt-1">${item.template_name}</p>` : ''
          }
        </div>
        <span class="px-3 py-1 text-sm rounded-full ${getStatusBadgeClass(item.status)}">
          ${item.status}
        </span>
      </div>
    </div>
  `).join('');
}

// Get status badge class
function getStatusBadgeClass(status) {
  const classes = {
    'completed': 'bg-green-500/20 text-green-400',
    'failed': 'bg-red-500/20 text-red-400',
    'cancelled': 'bg-gray-500/20 text-gray-400'
  };
  return classes[status] || 'bg-gray-500/20 text-gray-400';
}

// Switch tab
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active', 'border-primary', 'text-primary');
    btn.classList.add('border-transparent', 'text-gray-400');
  });
  
  const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  activeBtn.classList.add('active', 'border-primary', 'text-primary');
  activeBtn.classList.remove('border-transparent', 'text-gray-400');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
  });
  
  document.getElementById(`${tabName}-tab`).classList.remove('hidden');
  
  // Load data for tab
  if (tabName === 'history') {
    loadHistory();
  } else if (tabName === 'upcoming') {
    loadUpcoming();
  }
}

// Open create schedule modal
function openCreateScheduleModal() {
  document.getElementById('scheduleId').value = '';
  document.getElementById('scheduleForm').reset();
  document.getElementById('modal-title').textContent = 'Create Recurring Schedule';
  document.getElementById('weeklyDaysContainer').classList.add('hidden');
  
  // Set default duration to 1 hour
  document.getElementById('durationHours').value = 1;
  document.getElementById('durationMinutesInput').value = 0;
  updateTotalDuration();
  
  document.getElementById('scheduleModal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

// Close schedule modal
function closeScheduleModal() {
  document.getElementById('scheduleModal').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

// Handle recurrence change
function handleRecurrenceChange() {
  const type = document.getElementById('recurrenceType').value;
  const weeklyContainer = document.getElementById('weeklyDaysContainer');
  
  if (type === 'weekly') {
    weeklyContainer.classList.remove('hidden');
  } else {
    weeklyContainer.classList.add('hidden');
  }
}

// Update total duration display
function updateTotalDuration() {
  const hours = parseInt(document.getElementById('durationHours').value) || 0;
  const minutes = parseInt(document.getElementById('durationMinutesInput').value) || 0;
  
  const totalMinutes = (hours * 60) + minutes;
  
  let displayText = '';
  if (hours > 0) {
    displayText += `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    if (hours > 0) displayText += ' ';
    displayText += `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  if (totalMinutes === 0) {
    displayText = '0 minutes';
  }
  
  document.getElementById('totalDuration').textContent = displayText;
}

// Add event listeners for duration inputs
document.addEventListener('DOMContentLoaded', function() {
  const hoursInput = document.getElementById('durationHours');
  const minutesInput = document.getElementById('durationMinutesInput');
  
  if (hoursInput && minutesInput) {
    hoursInput.addEventListener('input', updateTotalDuration);
    minutesInput.addEventListener('input', updateTotalDuration);
    updateTotalDuration();
  }
});

// Save schedule
async function saveSchedule() {
  try {
    const form = document.getElementById('scheduleForm');
    const scheduleId = document.getElementById('scheduleId').value;
    
    // Calculate total duration in minutes
    const hours = parseInt(document.getElementById('durationHours').value) || 0;
    const minutes = parseInt(document.getElementById('durationMinutesInput').value) || 0;
    const totalMinutes = (hours * 60) + minutes;
    
    if (totalMinutes === 0) {
      showToast('error', 'Duration must be at least 1 minute');
      return;
    }
    
    const formData = {
      name: document.getElementById('scheduleName').value,
      streamId: document.getElementById('scheduleStream').value,
      recurrenceType: document.getElementById('recurrenceType').value,
      startTime: document.getElementById('startTime').value,
      durationMinutes: totalMinutes,
      endDate: document.getElementById('endDate').value || null
    };
    
    // Get recurrence days for weekly
    if (formData.recurrenceType === 'weekly') {
      const checkedDays = Array.from(document.querySelectorAll('input[name="recurrenceDays"]:checked'))
        .map(cb => parseInt(cb.value));
      
      if (checkedDays.length === 0) {
        showToast('error', 'Please select at least one day for weekly schedule');
        return;
      }
      
      formData.recurrenceDays = checkedDays;
    }
    
    const url = scheduleId ? `/api/schedule-templates/${scheduleId}` : '/api/schedule-templates';
    const method = scheduleId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('success', data.message);
      closeScheduleModal();
      loadTemplates();
      loadStatistics();
      loadUpcoming();
    } else {
      showToast('error', data.error || 'Failed to save schedule');
    }
  } catch (error) {
    console.error('Error saving schedule:', error);
    showToast('error', 'An error occurred while saving schedule');
  }
}

// Edit template
function editTemplate(templateId) {
  const template = templates.find(t => t.id === templateId);
  if (!template) return;
  
  document.getElementById('scheduleId').value = template.id;
  document.getElementById('scheduleName').value = template.name;
  document.getElementById('scheduleStream').value = template.stream_id;
  document.getElementById('recurrenceType').value = template.recurrence_type;
  document.getElementById('startTime').value = template.start_time;
  
  // Convert minutes to hours and minutes
  const totalMinutes = template.duration_minutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  document.getElementById('durationHours').value = hours;
  document.getElementById('durationMinutesInput').value = minutes;
  updateTotalDuration();
  
  document.getElementById('endDate').value = template.end_date || '';
  
  handleRecurrenceChange();
  
  if (template.recurrence_type === 'weekly' && template.recurrence_days) {
    document.querySelectorAll('input[name="recurrenceDays"]').forEach(cb => {
      cb.checked = template.recurrence_days.includes(parseInt(cb.value));
    });
  }
  
  document.getElementById('modal-title').textContent = 'Edit Recurring Schedule';
  document.getElementById('scheduleModal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

// Toggle template
async function toggleTemplate(templateId) {
  try {
    const response = await fetch(`/api/schedule-templates/${templateId}/toggle`, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('success', data.message);
      loadTemplates();
      loadStatistics();
    } else {
      showToast('error', data.error || 'Failed to toggle schedule');
    }
  } catch (error) {
    console.error('Error toggling template:', error);
    showToast('error', 'An error occurred');
  }
}

// Delete template
async function deleteTemplate(templateId) {
  if (!confirm('Are you sure you want to delete this schedule? All pending scheduled streams will be cancelled.')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/schedule-templates/${templateId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('success', data.message);
      loadTemplates();
      loadStatistics();
      loadUpcoming();
    } else {
      showToast('error', data.error || 'Failed to delete schedule');
    }
  } catch (error) {
    console.error('Error deleting template:', error);
    showToast('error', 'An error occurred');
  }
}
