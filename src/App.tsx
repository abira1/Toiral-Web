import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider } from './contexts/ContentContext';
import { TourProvider } from './contexts/TourContext';
import { SimplifiedLoadingScreen } from './components/SimplifiedLoadingScreen';
import { useAuth } from './contexts/AuthContext';
import { useContent } from './contexts/ContentContext';
import { ErrorBoundary } from './components/ErrorBoundary';
// import { onForegroundMessage, displayNotification } from './firebase/fcmInit'; // Temporarily disabled
import { AdManager } from './components/ads/AdManager';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { ResourceHints } from './components/ResourceHints';
import { ScriptManager } from './components/ScriptManager';
import { ImagePreloader } from './components/ImagePreloader';
import { SEOHead } from './components/SEOHead';
import { MobileWelcomeMessage } from './components/MobileWelcomeMessage';
import { DataRefreshIndicator } from './components/DataRefreshIndicator';
import './styles/highContrast.css';

// Lazy-loaded components
const Windows95Desktop = lazy(() => import('./components/Windows95Desktop').then(module => ({ default: module.Windows95Desktop })));
const AdminLogin = lazy(() => import('./components/AdminLogin').then(module => ({ default: module.AdminLogin })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const ResetTheme = lazy(() => import('./resetTheme').then(module => ({ default: module.ResetTheme })));
const AddPricingSection = lazy(() => import('./AddPricingSection').then(module => ({ default: module.AddPricingSection })));
const TestAd = lazy(() => import('./components/ads/TestAd').then(module => ({ default: module.TestAd })));
const TeamMembersPage = lazy(() => import('./pages/TeamMembersPage'));
const PortfolioManagerPage = lazy(() => import('./pages/PortfolioManagerPage'));
const RobotsRoute = lazy(() => import('./routes/RobotsRoute'));
const SitemapRoute = lazy(() => import('./routes/SitemapRoute'));

// Tour, keyboard, accessibility, and theme components
import { TourManager } from './components/tour/TourManager';
import { KeyboardShortcutsManager } from './components/keyboard/KeyboardShortcutsManager';
import { AccessibilityManager } from './components/accessibility/AccessibilityManager';
import { ThemeManager } from './components/theme/ThemeManager';
import { ThemeColorManager } from './components/ThemeColorManager';

// Loading fallback for lazy-loaded components
function PageLoadingFallback() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-teal-600">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-mono text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}
function ProtectedRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const {
    isAdminAuthenticated,
    isAdminUser,
    isModeratorUser
  } = useAuth();

  // Allow access if user is authenticated as admin via password, via email, or is a moderator
  return (isAdminAuthenticated || isAdminUser || isModeratorUser) ? children : <Navigate to="/not-found" replace />;
}
// FCM message handler component - temporarily disabled to fix JS errors
/*
function FCMHandler() {
  useEffect(() => {
    // Only set up FCM if we're in a browser environment
    if (typeof window !== 'undefined') {
      try {
        // Set up FCM message handler for foreground messages
        const unsubscribe = onForegroundMessage((payload) => {
          console.log('Received foreground message:', payload);

          // Display notification for foreground messages
          if (payload.notification) {
            const { title, body } = payload.notification;
            displayNotification(
              title || 'New Notification',
              body || 'You have a new notification',
              payload.notification.image
            );
          }
        });

        // Clean up subscription on unmount
        return () => {
          if (unsubscribe) {
            unsubscribe();
          }
        };
      } catch (error) {
        console.error('Error setting up FCM handler:', error);
      }
    }
  }, []);

  return null; // This component doesn't render anything
}
*/

export function App() {
  const [isLoading, setIsLoading] = useState(true);

  // AppContent component to use hooks inside the router
  const AppContent = () => {
    const { refreshData } = useContent();

    // Set up periodic background data refresh
    useEffect(() => {
      // Refresh data every 5 minutes
      const refreshInterval = setInterval(() => {
        refreshData();
      }, 5 * 60 * 1000);

      return () => clearInterval(refreshInterval);
    }, [refreshData]);

    return (
      <>
        {/* Data refresh indicator */}
        <DataRefreshIndicator />

        {/* Ad Manager for displaying ads - it has internal checks for admin pages */}
        <AdManager />

        {/* Tour Manager for guided tours */}
        <TourManager />

        {/* Keyboard Shortcuts Manager */}
        <KeyboardShortcutsManager />

        {/* Accessibility Manager */}
        <AccessibilityManager />

        {/* Theme Manager */}
        <ThemeManager />

        {/* Theme Color Manager to fix blue line on mobile */}
        <ThemeColorManager />

        {/* SEO Head for meta tags */}
        <SEOHead />

        {/* Mobile Welcome Message - only shows on first visit */}
        <MobileWelcomeMessage />

        <Routes>
          <Route path="/" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Windows95Desktop />
            </Suspense>
          } />
          <Route path="/login" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <AdminLogin />
            </Suspense>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingFallback />}>
                <AdminPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingFallback />}>
                <NotificationsPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/not-found" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <NotFoundPage />
            </Suspense>
          } />
          <Route path="/reset-theme" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <ResetTheme />
            </Suspense>
          } />
          <Route path="/add-pricing" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <AddPricingSection />
            </Suspense>
          } />
          <Route path="/test-ads" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <TestAd />
            </Suspense>
          } />
          <Route path="/team-members" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingFallback />}>
                <TeamMembersPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/portfolio-manager" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingFallback />}>
                <PortfolioManagerPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/robots.txt" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <RobotsRoute />
            </Suspense>
          } />
          <Route path="/sitemap.xml" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <SitemapRoute />
            </Suspense>
          } />
          {/* Catch all route for 404 */}
          <Route path="*" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <NotFoundPage />
            </Suspense>
          } />
        </Routes>
      </>
    );
  };

  return <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ContentProvider>
            <TourProvider>
              {/* Resource hints for critical assets */}
              <ResourceHints
                preloadImages={[
                  '/toiral.png'
                ]}
                preconnectUrls={[
                  'https://firebaseio.com',
                  'https://i.postimg.cc',
                  'https://via.placeholder.com'
                ]}
              />

              {/* Preload important images */}
              <ImagePreloader urls={[
                '/toiral.png',
                'https://i.postimg.cc/hGrDrFBc/Profile-Custom-2.png',
                'https://i.postimg.cc/15k3RcBh/Portfolio.png',
                'https://i.postimg.cc/W3N3LNnd/Appoinment.png',
                'https://i.postimg.cc/cLf4vgkK/Review.png',
                'https://i.postimg.cc/RCb0yzn0/Contact.png',
                'https://i.postimg.cc/wTC4SC9S/e11d1a19-062b-4b8b-b88a-42e855baa176-removebg-preview.png',
                'https://i.postimg.cc/7hbZhKjD/Chat.png'
              ]} />

              {/* Optimized third-party script loading */}
              <ScriptManager visibilityTarget="root" />

              {/* FCM Handler for notifications - temporarily disabled to fix JS errors */}
              {/* {process.env.NODE_ENV === 'production' && <FCMHandler />} */}

              {/* Performance Monitor - enabled in development and for admins */}
              <PerformanceMonitor
                enabled={process.env.NODE_ENV === 'development' || window.location.search.includes('debug=true')}
                showOverlay={false}
              />

              {isLoading ? (
                <SimplifiedLoadingScreen onLoadingComplete={() => setIsLoading(false)} />
              ) : (
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              )}
            </TourProvider>
          </ContentProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>;
}