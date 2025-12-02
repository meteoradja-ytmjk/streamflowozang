/**
 * Mobile Touch Gestures & Enhancements
 * Provides swipe gestures, touch-friendly controls, and mobile optimizations
 */

class MobileGestures {
  constructor() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.minSwipeDistance = 50;
    this.maxVerticalDistance = 100;
    
    this.init();
  }

  init() {
    // Detect if mobile
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (this.isMobile) {
      this.setupTouchEvents();
      this.setupMobileOptimizations();
      this.setupPullToRefresh();
    }
    
    // Setup for all devices
    this.setupKeyboardShortcuts();
  }

  setupTouchEvents() {
    document.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.touchEndY = e.changedTouches[0].screenY;
      this.handleGesture();
    }, { passive: true });
  }

  handleGesture() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if it's a horizontal swipe
    if (absDeltaX > this.minSwipeDistance && absDeltaY < this.maxVerticalDistance) {
      if (deltaX > 0) {
        this.onSwipeRight();
      } else {
        this.onSwipeLeft();
      }
    }

    // Check if it's a vertical swipe
    if (absDeltaY > this.minSwipeDistance && absDeltaX < this.maxVerticalDistance) {
      if (deltaY > 0) {
        this.onSwipeDown();
      } else {
        this.onSwipeUp();
      }
    }
  }

  onSwipeLeft() {
    // Navigate to next page or close modal
    const modal = document.querySelector('.modal-overlay:not(.hidden)');
    if (modal) {
      // Close modal on swipe left
      const closeBtn = modal.querySelector('[onclick*="close"]');
      if (closeBtn) closeBtn.click();
    }
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('swipeLeft'));
  }

  onSwipeRight() {
    // Navigate back or open sidebar
    const currentPath = window.location.pathname;
    
    // Don't go back on login/setup pages
    if (currentPath === '/login' || currentPath === '/setup-account') {
      return;
    }
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('swipeRight'));
  }

  onSwipeUp() {
    // Scroll to top or show more options
    document.dispatchEvent(new CustomEvent('swipeUp'));
  }

  onSwipeDown() {
    // Pull to refresh handled separately
    document.dispatchEvent(new CustomEvent('swipeDown'));
  }

  setupMobileOptimizations() {
    // Add mobile-specific class to body
    document.body.classList.add('mobile-device');

    // Prevent double-tap zoom on buttons
    document.querySelectorAll('button, a, input[type="button"], input[type="submit"]').forEach(el => {
      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        el.click();
      }, { passive: false });
    });

    // Optimize video preview for mobile
    this.optimizeVideoPreview();

    // Add touch feedback
    this.addTouchFeedback();

    // Optimize modals for mobile
    this.optimizeModals();
  }

  optimizeVideoPreview() {
    // Lazy load video previews on mobile
    const videoContainers = document.querySelectorAll('[id*="videoPreview"]');
    
    videoContainers.forEach(container => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const video = entry.target.querySelector('video');
            if (video && !video.src) {
              const source = video.querySelector('source');
              if (source && source.dataset.src) {
                source.src = source.dataset.src;
                video.load();
              }
            }
          }
        });
      }, { threshold: 0.5 });

      observer.observe(container);
    });
  }

  addTouchFeedback() {
    // Add ripple effect on touch
    document.addEventListener('touchstart', (e) => {
      const target = e.target.closest('button, a, .clickable');
      if (!target) return;

      const ripple = document.createElement('span');
      ripple.className = 'touch-ripple';
      
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.touches[0].clientX - rect.left - size / 2;
      const y = e.touches[0].clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      target.style.position = 'relative';
      target.style.overflow = 'hidden';
      target.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    }, { passive: true });

    // Add CSS for ripple effect
    if (!document.getElementById('touch-ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'touch-ripple-styles';
      style.textContent = `
        .touch-ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        }
        
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .mobile-device button,
        .mobile-device a {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
      `;
      document.head.appendChild(style);
    }
  }

  optimizeModals() {
    // Make modals swipeable to close
    const modals = document.querySelectorAll('.modal-overlay');
    
    modals.forEach(modal => {
      let startY = 0;
      let currentY = 0;
      
      const modalContent = modal.querySelector('.modal-container');
      if (!modalContent) return;

      modalContent.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
      }, { passive: true });

      modalContent.addEventListener('touchmove', (e) => {
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;

        // Only allow swipe down
        if (deltaY > 0) {
          modalContent.style.transform = `translateY(${deltaY}px)`;
          modalContent.style.transition = 'none';
        }
      }, { passive: true });

      modalContent.addEventListener('touchend', () => {
        const deltaY = currentY - startY;

        if (deltaY > 100) {
          // Close modal
          const closeBtn = modal.querySelector('[onclick*="close"]');
          if (closeBtn) closeBtn.click();
        }

        // Reset position
        modalContent.style.transform = '';
        modalContent.style.transition = '';
      }, { passive: true });
    });
  }

  setupPullToRefresh() {
    let startY = 0;
    let pulling = false;
    const threshold = 80;

    // Create pull to refresh indicator
    const indicator = document.createElement('div');
    indicator.id = 'pull-to-refresh';
    indicator.innerHTML = `
      <div class="pull-indicator">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
        </svg>
        <span class="pull-text">Pull to refresh</span>
      </div>
    `;
    document.body.insertBefore(indicator, document.body.firstChild);

    // Add CSS
    if (!document.getElementById('pull-to-refresh-styles')) {
      const style = document.createElement('style');
      style.id = 'pull-to-refresh-styles';
      style.textContent = `
        #pull-to-refresh {
          position: fixed;
          top: -80px;
          left: 0;
          right: 0;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(31, 41, 55, 0.95);
          z-index: 9999;
          transition: transform 0.3s;
        }
        
        #pull-to-refresh.pulling {
          transform: translateY(80px);
        }
        
        #pull-to-refresh.refreshing .spinner {
          animation: spin 1s linear infinite;
        }
        
        .pull-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .spinner {
          width: 32px;
          height: 32px;
        }
        
        .spinner circle {
          stroke: #3b82f6;
          stroke-linecap: round;
          stroke-dasharray: 125;
          stroke-dashoffset: 125;
        }
        
        #pull-to-refresh.pulling .spinner circle {
          stroke-dashoffset: 0;
          transition: stroke-dashoffset 0.3s;
        }
        
        .pull-text {
          color: #9ca3af;
          font-size: 14px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (window.scrollY === 0) {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;

        if (deltaY > 0 && deltaY < threshold * 2) {
          pulling = true;
          indicator.classList.add('pulling');
          
          if (deltaY > threshold) {
            indicator.querySelector('.pull-text').textContent = 'Release to refresh';
          } else {
            indicator.querySelector('.pull-text').textContent = 'Pull to refresh';
          }
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (pulling) {
        const currentY = e.changedTouches[0].clientY;
        const deltaY = currentY - startY;

        if (deltaY > threshold) {
          // Trigger refresh
          indicator.classList.add('refreshing');
          indicator.querySelector('.pull-text').textContent = 'Refreshing...';
          
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          indicator.classList.remove('pulling');
        }

        pulling = false;
      }
    }, { passive: true });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K: Quick search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        if (searchInput) searchInput.focus();
      }

      // Ctrl/Cmd + N: New stream
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const newStreamBtn = document.querySelector('[onclick*="openNewStreamModal"]');
        if (newStreamBtn) newStreamBtn.click();
      }

      // Escape: Close modal
      if (e.key === 'Escape') {
        const modal = document.querySelector('.modal-overlay:not(.hidden)');
        if (modal) {
          const closeBtn = modal.querySelector('[onclick*="close"]');
          if (closeBtn) closeBtn.click();
        }
      }
    });
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobileGestures = new MobileGestures();
  });
} else {
  window.mobileGestures = new MobileGestures();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileGestures;
}
