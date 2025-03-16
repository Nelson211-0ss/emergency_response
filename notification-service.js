// Notification Service Class
class NotificationService {
    constructor() {
        this.notifications = [];
        this.subscribers = new Map();
        this.userPreferences = new Map();
        
        // Initialize push notification if supported
        this.initializePushNotifications();
    }

    // Initialize Push Notifications
    async initializePushNotifications() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
        }
    }

    // Set user preferences for notifications
    setUserPreferences(userId, preferences) {
        this.userPreferences.set(userId, {
            region: preferences.region || 'all',
            priority: preferences.priority || ['critical', 'high', 'medium', 'low'],
            channels: preferences.channels || ['push', 'email', 'sms'],
            role: preferences.role || 'responder'
        });
    }

    // Subscribe to notifications
    subscribe(userId, callback) {
        this.subscribers.set(userId, callback);
    }

    // Unsubscribe from notifications
    unsubscribe(userId) {
        this.subscribers.delete(userId);
    }

    // Check if notification matches user preferences
    matchesPreferences(userId, notification) {
        const preferences = this.userPreferences.get(userId);
        if (!preferences) return true;

        return (
            (preferences.region === 'all' || notification.region === preferences.region) &&
            preferences.priority.includes(notification.priority) &&
            (preferences.role === 'all' || notification.targetRole === 'all' || notification.targetRole === preferences.role)
        );
    }

    // Send notification through different channels
    async sendNotification(notification) {
        this.notifications.push(notification);

        // Send to all subscribers based on their preferences
        for (const [userId, callback] of this.subscribers) {
            if (this.matchesPreferences(userId, notification)) {
                callback(notification);

                const preferences = this.userPreferences.get(userId);
                if (preferences) {
                    // Send Push Notification
                    if (preferences.channels.includes('push')) {
                        this.sendPushNotification(notification);
                    }
                    // Send Email
                    if (preferences.channels.includes('email')) {
                        this.sendEmailNotification(notification);
                    }
                    // Send SMS
                    if (preferences.channels.includes('sms')) {
                        this.sendSMSNotification(notification);
                    }
                }
            }
        }
    }

    // Send Push Notification
    async sendPushNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const options = {
                body: notification.description,
                icon: '/path/to/icon.png',
                badge: '/path/to/badge.png',
                tag: notification.id,
                data: notification,
                vibrate: [200, 100, 200]
            };

            try {
                await new Notification(notification.title, options);
            } catch (error) {
                console.error('Error sending push notification:', error);
            }
        }
    }

    // Send Email Notification (Mock implementation)
    async sendEmailNotification(notification) {
        console.log('Sending email notification:', notification);
        // Implement email sending logic here
    }

    // Send SMS Notification (Mock implementation)
    async sendSMSNotification(notification) {
        console.log('Sending SMS notification:', notification);
        // Implement SMS sending logic here
    }

    // Get all notifications for a user
    getNotifications(userId) {
        return this.notifications.filter(notification => 
            this.matchesPreferences(userId, notification)
        );
    }

    // Mark notification as read
    markAsRead(notificationId, userId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.readBy = notification.readBy || new Set();
            notification.readBy.add(userId);
        }
    }
}

// Create and export notification service instance
const notificationService = new NotificationService();
export default notificationService; 