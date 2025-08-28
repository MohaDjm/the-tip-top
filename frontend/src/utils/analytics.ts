// Analytics tracking utility
interface TrackingEvent {
  eventType: 'page_view' | 'cta_click' | 'newsletter_subscribe';
  eventData: {
    page?: string;
    cta?: string;
    button?: string;
    url?: string;
    [key: string]: any;
  };
  userId?: string;
  sessionId?: string;
}

class Analytics {
  private baseUrl: string;
  private sessionId: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? '/api' 
      : 'http://localhost:3002/api';
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string | undefined {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      }
    } catch (error) {
      console.warn('Could not extract user ID from token');
    }
    return undefined;
  }

  async track(event: TrackingEvent): Promise<void> {
    try {
      const trackingData = {
        ...event,
        userId: event.userId || this.getUserId(),
        sessionId: event.sessionId || this.sessionId
      };

      await fetch(`${this.baseUrl}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Track page views
  trackPageView(page: string, additionalData?: Record<string, any>): void {
    this.track({
      eventType: 'page_view',
      eventData: {
        page,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    });
  }

  // Track CTA clicks
  trackCTAClick(ctaName: string, additionalData?: Record<string, any>): void {
    this.track({
      eventType: 'cta_click',
      eventData: {
        cta: ctaName,
        button: ctaName,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    });
  }

  // Track newsletter subscriptions
  trackNewsletterSubscribe(email: string, additionalData?: Record<string, any>): void {
    this.track({
      eventType: 'newsletter_subscribe',
      eventData: {
        email,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    });
  }
}

// Create singleton instance
const analytics = new Analytics();

export default analytics;

// Hook for React components
export const useAnalytics = () => {
  return {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackCTAClick: analytics.trackCTAClick.bind(analytics),
    trackNewsletterSubscribe: analytics.trackNewsletterSubscribe.bind(analytics)
  };
};
