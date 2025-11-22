// Centralized error handling utilities
import { handleCriticalError } from './errorEncoder';

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Only redirect for critical errors, not minor network issues
    const error = event.reason;
    if (shouldRedirectToErrorPage(error)) {
      handleCriticalError(
        error instanceof Error ? error : new Error(String(error)),
        'Promise',
        'unhandled_rejection'
      );
    }
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global JavaScript error:', event.error);
    
    if (shouldRedirectToErrorPage(event.error)) {
      handleCriticalError(
        event.error || new Error(event.message),
        'JavaScript',
        'global_error'
      );
    }
  });
}

// Determine if an error should redirect to error page
function shouldRedirectToErrorPage(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || String(error);
  const lowerMessage = errorMessage.toLowerCase();
  
  // Don't redirect for common network/temporary issues
  const temporaryIssues = [
    'network',
    'fetch',
    'timeout',
    'aborted',
    'cors',
    'load',
    'script error',
    'non-error promise rejection'
  ];
  
  if (temporaryIssues.some(issue => lowerMessage.includes(issue))) {
    return false;
  }
  
  // Redirect for critical application errors
  const criticalErrors = [
    'chunk',
    'module',
    'syntax',
    'reference',
    'type',
    'security',
    'permission'
  ];
  
  return criticalErrors.some(critical => lowerMessage.includes(critical));
}

// Wrapper for async operations that should redirect on failure
export async function withErrorRedirect<T>(
  operation: () => Promise<T>,
  component: string,
  action: string,
  userId?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${component}.${action}:`, error);
    handleCriticalError(
      error instanceof Error ? error : new Error(String(error)),
      component,
      action,
      userId
    );
    throw error; // Re-throw to prevent further execution
  }
}

// Handle API errors with smart error page redirection
export function handleApiError(
  error: any,
  component: string,
  action: string,
  userId?: string
): void {
  console.error(`API Error in ${component}.${action}:`, error);
  
  // Check if it's a critical API error that warrants error page
  const status = error.status || error.response?.status;
  const message = error.message || error.response?.data?.error || String(error);
  
  // Critical errors that should redirect
  const criticalStatuses = [500, 502, 503, 504];
  const criticalMessages = [
    'internal server error',
    'service unavailable',
    'gateway timeout',
    'database error',
    'authentication failed'
  ];
  
  const isCritical = 
    criticalStatuses.includes(status) ||
    criticalMessages.some(msg => message.toLowerCase().includes(msg));
  
  if (isCritical) {
    handleCriticalError(
      new Error(`API Error (${status}): ${message}`),
      component,
      action,
      userId
    );
  }
}

// Enhanced error boundaries for specific components
export function createErrorHandler(component: string) {
  return {
    handleError: (error: Error, action: string, userId?: string) => {
      handleCriticalError(error, component, action, userId);
    },
    
    handleApiError: (error: any, action: string, userId?: string) => {
      handleApiError(error, component, action, userId);
    },
    
    withErrorHandling: async <T>(
      operation: () => Promise<T>,
      action: string,
      userId?: string
    ): Promise<T> => {
      return withErrorRedirect(operation, component, action, userId);
    }
  };
}
