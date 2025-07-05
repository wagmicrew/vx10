'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class VX10ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('VX10 Error Boundary caught an error:', error, errorInfo);
    }

    // Report error to monitoring service in production
    this.reportError(error, errorInfo);
  }

  reportError(error: Error, errorInfo: ErrorInfo) {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
    };

    // Send to your error monitoring service
    // This could be Sentry, LogRocket, or your own API
    if (typeof window !== 'undefined') {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      }).catch(reportingError => {
        console.error('Failed to report error:', reportingError);
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Något gick fel
            </h1>
            <p className="text-gray-600 mb-4">
              Vi beklagar, men något oväntat inträffade. Vår utvecklingsteam har informerats.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-100 p-3 rounded text-sm mb-4">
                <summary className="cursor-pointer font-semibold">
                  Teknisk information (utvecklingsläge)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\nComponent Stack:'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
            
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Ladda om sidan
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Gå till startsidan
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Network error monitor
export const NetworkMonitor: React.FC = () => {
  React.useEffect(() => {
    // Monitor failed network requests
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Log 400+ status codes
        if (response.status >= 400) {
          const errorData = {
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString(),
            requestInfo: args[1] || {}
          };

          console.error('Network request failed:', errorData);
          
          // Send to error monitoring
          if (response.status >= 500) {
            fetch('/api/errors', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'network_error',
                ...errorData
              })
            }).catch(() => {/* Ignore reporting errors */});
          }
        }
        
        return response;
      } catch (error) {
        console.error('Network request error:', error);
        throw error;
      }
    };

    // Monitor resource loading errors
    const handleResourceError = (event: ErrorEvent) => {
      const target = event.target as HTMLElement & { src?: string; href?: string };
      if (target?.tagName) {
        console.error('Resource failed to load:', {
          tag: target.tagName,
          src: target.src || target.href,
          error: event.error
        });
      }
    };

    window.addEventListener('error', handleResourceError, true);

    // Monitor unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener('error', handleResourceError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
};

// Performance monitor
export const PerformanceMonitor: React.FC = () => {
  React.useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'web-vital' in window) {
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        const vitalsHandler = (metric: { name: string; value: number }) => {
          console.log('Web Vital:', metric);
          
          // Report poor scores
          const thresholds: Record<string, number> = {
            CLS: 0.1,
            FID: 100,
            FCP: 1800,
            LCP: 2500,
            TTFB: 800
          };

          if (metric.value > thresholds[metric.name]) {
            fetch('/api/errors', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'performance_issue',
                metric: metric.name,
                value: metric.value,
                threshold: thresholds[metric.name],
                timestamp: new Date().toISOString()
              })
            }).catch(() => {/* Ignore reporting errors */});
          }
        };

        onCLS(vitalsHandler);
        onFID(vitalsHandler);
        onFCP(vitalsHandler);
        onLCP(vitalsHandler);
        onTTFB(vitalsHandler);
      });
    }
  }, []);

  return null;
};

export default VX10ErrorBoundary;
