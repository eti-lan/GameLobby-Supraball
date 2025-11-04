// 🔔 Notification System
// Displays toast notifications in the top-right corner

class NotificationSystem {
  constructor() {
    this.container = null;
    this.notifications = [];
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    // Use existing container or create new one
    this.container = document.getElementById('notification-container');
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'notification-container';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 4000) {
    // Wait for container to be ready
    if (!this.container) {
      setTimeout(() => this.show(message, type, duration), 100);
      return null;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    const icon = this.getIcon(type);
    
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" onclick="notificationSystem.remove(this.parentElement)">×</button>
    `;
    
    // Add to container
    this.container.appendChild(notification);
    this.notifications.push(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('notification-show');
    }, 10);
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification);
      }, duration);
    }
    
    return notification;
  }

  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      loading: '⏳'
    };
    return icons[type] || icons.info;
  }

  remove(notification) {
    if (!notification || !notification.parentElement) return;
    
    notification.classList.remove('notification-show');
    notification.classList.add('notification-hide');
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.parentElement.removeChild(notification);
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
          this.notifications.splice(index, 1);
        }
      }
    }, 300);
  }

  clear() {
    this.notifications.forEach(n => this.remove(n));
  }

  // Convenience methods
  success(message, duration = 4000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 4000) {
    return this.show(message, 'info', duration);
  }

  loading(message) {
    return this.show(message, 'loading', 0); // No auto-dismiss
  }
}

// Global instance
const notificationSystem = new NotificationSystem();

// Backwards compatibility - replace old showError/showSuccess
window.showError = function(message) {
  notificationSystem.error(message);
};

window.showSuccess = function(message) {
  notificationSystem.success(message);
};

window.showWarning = function(message) {
  notificationSystem.warning(message);
};

window.showInfo = function(message) {
  notificationSystem.info(message);
};

window.showLoading = function(message) {
  return notificationSystem.loading(message);
};
