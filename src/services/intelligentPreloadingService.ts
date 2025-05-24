/**
 * Intelligent Preloading Service
 * Predicts user navigation patterns and preloads resources accordingly
 */

import { performanceService } from './performanceOptimizationService';
import { preloadImages } from './imageOptimizationService';

interface UserFlow {
  from: string;
  to: string;
  count: number;
  lastAccessed: number;
  avgTimeSpent: number;
}

interface PreloadRule {
  trigger: string;
  resources: string[];
  priority: 'high' | 'medium' | 'low';
  condition?: () => boolean;
  delay?: number;
}

interface UserContext {
  isAuthenticated: boolean;
  userRole: 'admin' | 'moderator' | 'user';
  visitCount: number;
  lastVisit: number;
  preferredSections: string[];
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionSpeed: 'slow' | 'medium' | 'fast';
}

class IntelligentPreloadingService {
  private userFlows: Map<string, UserFlow> = new Map();
  private preloadRules: PreloadRule[] = [];
  private userContext: UserContext | null = null;
  private preloadQueue: Map<string, Promise<void>> = new Map();
  private analytics = {
    preloadHits: 0,
    preloadMisses: 0,
    totalPreloads: 0,
    savedTime: 0
  };

  constructor() {
    this.initializePreloadRules();
    this.loadUserFlows();
    this.detectUserContext();
  }

  /**
   * Initialize predefined preload rules based on common user patterns
   */
  private initializePreloadRules(): void {
    this.preloadRules = [
      // Admin users likely to access admin panel
      {
        trigger: 'authentication_success',
        resources: [
          'admin/dashboard',
          'admin/analytics',
          'admin/seo-manager'
        ],
        priority: 'high',
        condition: () => this.userContext?.userRole === 'admin',
        delay: 1000
      },

      // Portfolio viewers likely to check services
      {
        trigger: 'portfolio_view',
        resources: [
          'services',
          'pricing',
          'contact'
        ],
        priority: 'medium',
        delay: 2000
      },

      // Contact form users likely to check portfolio
      {
        trigger: 'contact_form_open',
        resources: [
          'portfolio',
          'reviews',
          'about'
        ],
        priority: 'medium',
        delay: 1500
      },

      // Mobile users get lightweight resources first
      {
        trigger: 'mobile_detected',
        resources: [
          'mobile_optimized_images',
          'essential_data_only'
        ],
        priority: 'high',
        condition: () => this.userContext?.deviceType === 'mobile'
      },

      // Slow connection users get critical resources only
      {
        trigger: 'slow_connection_detected',
        resources: [
          'critical_css',
          'essential_js',
          'compressed_images'
        ],
        priority: 'high',
        condition: () => this.userContext?.connectionSpeed === 'slow'
      },

      // Returning users get personalized content
      {
        trigger: 'returning_user_detected',
        resources: this.getPersonalizedResources(),
        priority: 'medium',
        condition: () => (this.userContext?.visitCount || 0) > 1,
        delay: 500
      }
    ];
  }

  /**
   * Detect user context for intelligent preloading
   */
  private detectUserContext(): void {
    const context: UserContext = {
      isAuthenticated: this.checkAuthStatus(),
      userRole: this.getUserRole(),
      visitCount: this.getVisitCount(),
      lastVisit: this.getLastVisit(),
      preferredSections: this.getPreferredSections(),
      deviceType: this.detectDeviceType(),
      connectionSpeed: this.detectConnectionSpeed()
    };

    this.userContext = context;
    this.saveUserContext(context);
  }

  /**
   * Track user navigation for pattern learning
   */
  trackNavigation(from: string, to: string, timeSpent: number): void {
    const flowKey = `${from}->${to}`;
    const existing = this.userFlows.get(flowKey);

    if (existing) {
      existing.count++;
      existing.lastAccessed = Date.now();
      existing.avgTimeSpent = (existing.avgTimeSpent + timeSpent) / 2;
    } else {
      this.userFlows.set(flowKey, {
        from,
        to,
        count: 1,
        lastAccessed: Date.now(),
        avgTimeSpent: timeSpent
      });
    }

    this.saveUserFlows();
    this.updatePreloadPredictions(to);
  }

  /**
   * Trigger intelligent preloading based on current context
   */
  async triggerPreload(trigger: string, currentPage?: string): Promise<void> {
    const applicableRules = this.preloadRules.filter(rule => {
      return rule.trigger === trigger && (!rule.condition || rule.condition());
    });

    for (const rule of applicableRules) {
      const delay = rule.delay || 0;
      
      setTimeout(async () => {
        await this.executePreload(rule, currentPage);
      }, delay);
    }

    // Also check for learned patterns
    if (currentPage) {
      await this.preloadBasedOnPatterns(currentPage);
    }
  }

  /**
   * Execute preload for a specific rule
   */
  private async executePreload(rule: PreloadRule, currentPage?: string): Promise<void> {
    for (const resource of rule.resources) {
      const preloadKey = `${rule.trigger}-${resource}`;
      
      if (this.preloadQueue.has(preloadKey)) {
        continue; // Already preloading
      }

      const preloadPromise = this.preloadResource(resource, rule.priority);
      this.preloadQueue.set(preloadKey, preloadPromise);
      
      try {
        await preloadPromise;
        this.analytics.preloadHits++;
      } catch (error) {
        console.warn(`Preload failed for ${resource}:`, error);
        this.analytics.preloadMisses++;
      } finally {
        this.preloadQueue.delete(preloadKey);
        this.analytics.totalPreloads++;
      }
    }
  }

  /**
   * Preload based on learned user patterns
   */
  private async preloadBasedOnPatterns(currentPage: string): Promise<void> {
    const predictions = this.getPredictedPages(currentPage);
    
    for (const prediction of predictions.slice(0, 3)) { // Top 3 predictions
      if (prediction.confidence > 0.3) { // 30% confidence threshold
        await this.preloadResource(prediction.page, 'low');
      }
    }
  }

  /**
   * Get predicted next pages based on user patterns
   */
  private getPredictedPages(currentPage: string): Array<{page: string, confidence: number}> {
    const predictions: Array<{page: string, confidence: number}> = [];
    
    this.userFlows.forEach((flow, key) => {
      if (flow.from === currentPage) {
        const confidence = this.calculateConfidence(flow);
        predictions.push({
          page: flow.to,
          confidence
        });
      }
    });

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate confidence score for a user flow
   */
  private calculateConfidence(flow: UserFlow): number {
    const recency = Math.max(0, 1 - (Date.now() - flow.lastAccessed) / (7 * 24 * 60 * 60 * 1000)); // 7 days
    const frequency = Math.min(1, flow.count / 10); // Normalize to max 10 visits
    const timeSpent = Math.min(1, flow.avgTimeSpent / 30000); // Normalize to 30 seconds
    
    return (recency * 0.4 + frequency * 0.4 + timeSpent * 0.2);
  }

  /**
   * Preload a specific resource
   */
  private async preloadResource(resource: string, priority: 'high' | 'medium' | 'low'): Promise<void> {
    const startTime = performance.now();

    try {
      if (resource.includes('image')) {
        await this.preloadImages(resource, priority);
      } else if (resource.includes('data')) {
        await this.preloadData(resource, priority);
      } else if (resource.includes('component')) {
        await this.preloadComponent(resource);
      }

      const loadTime = performance.now() - startTime;
      this.analytics.savedTime += loadTime;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Preload images with priority
   */
  private async preloadImages(resource: string, priority: 'high' | 'medium' | 'low'): Promise<void> {
    const imageUrls = this.getImageUrlsForResource(resource);
    await preloadImages(imageUrls, { priority, maxConcurrent: 2 });
  }

  /**
   * Preload data with caching
   */
  private async preloadData(resource: string, priority: 'high' | 'medium' | 'low'): Promise<void> {
    const dataPaths = this.getDataPathsForResource(resource);
    
    for (const path of dataPaths) {
      await performanceService.getData(path);
    }
  }

  /**
   * Preload React components
   */
  private async preloadComponent(resource: string): Promise<void> {
    const componentMap: Record<string, () => Promise<any>> = {
      'admin/dashboard': () => import('../pages/AdminPage'),
      'admin/analytics': () => import('../components/admin/AnalyticsDashboard'),
      'admin/seo-manager': () => import('../components/admin/SEOManager'),
      'portfolio': () => import('../components/PortfolioDisplay'),
      'services': () => import('../components/ServicesDisplay'),
      'contact': () => import('../components/ContactForm'),
      'reviews': () => import('../components/ReviewForm')
    };

    const loader = componentMap[resource];
    if (loader) {
      await loader();
    }
  }

  /**
   * Get personalized resources based on user preferences
   */
  private getPersonalizedResources(): string[] {
    if (!this.userContext) return [];

    const resources: string[] = [];
    
    // Add preferred sections
    this.userContext.preferredSections.forEach(section => {
      resources.push(`${section}_data`, `${section}_images`);
    });

    // Add role-based resources
    if (this.userContext.userRole === 'admin') {
      resources.push('admin/dashboard', 'admin/analytics');
    }

    return resources;
  }

  /**
   * Helper methods for context detection
   */
  private checkAuthStatus(): boolean {
    return localStorage.getItem('authToken') !== null;
  }

  private getUserRole(): 'admin' | 'moderator' | 'user' {
    return localStorage.getItem('userRole') as any || 'user';
  }

  private getVisitCount(): number {
    const count = localStorage.getItem('visitCount');
    return count ? parseInt(count) : 0;
  }

  private getLastVisit(): number {
    const lastVisit = localStorage.getItem('lastVisit');
    return lastVisit ? parseInt(lastVisit) : 0;
  }

  private getPreferredSections(): string[] {
    const sections = localStorage.getItem('preferredSections');
    return sections ? JSON.parse(sections) : [];
  }

  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private detectConnectionSpeed(): 'slow' | 'medium' | 'fast' {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
      if (effectiveType === '3g') return 'medium';
      return 'fast';
    }
    return 'medium'; // Default assumption
  }

  /**
   * Resource mapping helpers
   */
  private getImageUrlsForResource(resource: string): string[] {
    const imageMap: Record<string, string[]> = {
      'portfolio': [
        'https://i.postimg.cc/15k3RcBh/Portfolio.png'
      ],
      'services': [
        'https://i.postimg.cc/W3N3LNnd/Appoinment.png'
      ],
      'contact': [
        'https://i.postimg.cc/RCb0yzn0/Contact.png'
      ]
    };
    
    return imageMap[resource] || [];
  }

  private getDataPathsForResource(resource: string): string[] {
    const dataMap: Record<string, string[]> = {
      'portfolio': ['portfolio'],
      'services': ['services', 'pricing'],
      'contact': ['contact', 'contactInfo'],
      'admin/dashboard': ['analytics', 'seo'],
      'reviews': ['reviews', 'testimonialSettings']
    };
    
    return dataMap[resource] || [];
  }

  /**
   * Persistence methods
   */
  private loadUserFlows(): void {
    const stored = localStorage.getItem('userFlows');
    if (stored) {
      const flows = JSON.parse(stored);
      this.userFlows = new Map(Object.entries(flows));
    }
  }

  private saveUserFlows(): void {
    const flows = Object.fromEntries(this.userFlows);
    localStorage.setItem('userFlows', JSON.stringify(flows));
  }

  private saveUserContext(context: UserContext): void {
    localStorage.setItem('userContext', JSON.stringify(context));
  }

  private updatePreloadPredictions(currentPage: string): void {
    // Update visit count and last visit
    const visitCount = this.getVisitCount() + 1;
    localStorage.setItem('visitCount', visitCount.toString());
    localStorage.setItem('lastVisit', Date.now().toString());

    // Update preferred sections
    const preferred = this.getPreferredSections();
    if (!preferred.includes(currentPage)) {
      preferred.push(currentPage);
      localStorage.setItem('preferredSections', JSON.stringify(preferred.slice(-5))); // Keep last 5
    }
  }

  /**
   * Get analytics data
   */
  getAnalytics() {
    const hitRate = this.analytics.totalPreloads > 0 
      ? (this.analytics.preloadHits / this.analytics.totalPreloads) * 100 
      : 0;

    return {
      ...this.analytics,
      hitRate: Math.round(hitRate * 100) / 100,
      avgSavedTime: this.analytics.preloadHits > 0 
        ? this.analytics.savedTime / this.analytics.preloadHits 
        : 0
    };
  }

  /**
   * Reset analytics
   */
  resetAnalytics(): void {
    this.analytics = {
      preloadHits: 0,
      preloadMisses: 0,
      totalPreloads: 0,
      savedTime: 0
    };
  }
}

// Export singleton instance
export const intelligentPreloadingService = new IntelligentPreloadingService();
