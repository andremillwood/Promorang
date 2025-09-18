// React hook for consistent error handling across components
import { useCallback } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { createErrorHandler } from '@/react-app/utils/errorHandler';
import { useNotifications } from './useNotifications';

export function useErrorHandler(componentName: string) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const errorHandler = createErrorHandler(componentName);

  const handleError = useCallback((
    error: any,
    action: string,
    options?: {
      showToast?: boolean;
      toastMessage?: string;
      forceRedirect?: boolean;
      fallbackToToast?: boolean;
    }
  ) => {
    const {
      showToast: shouldShowToast = false,
      toastMessage,
      forceRedirect = false,
      fallbackToToast = true
    } = options || {};

    console.error(`Error in ${componentName}.${action}:`, error);

    // Determine if this should redirect to error page
    const shouldRedirect = forceRedirect || isRedirectableError(error);

    if (shouldRedirect) {
      try {
        errorHandler.handleError(
          error instanceof Error ? error : new Error(String(error)),
          action,
          user?.id
        );
      } catch (redirectError) {
        console.error('Failed to redirect to error page:', redirectError);
        
        // Fallback to toast if redirect fails
        if (fallbackToToast) {
          showToast(
            toastMessage || getErrorMessage(error),
            'error'
          );
        }
      }
    } else if (shouldShowToast) {
      showToast(
        toastMessage || getErrorMessage(error),
        'error'
      );
    }
  }, [componentName, errorHandler, user?.id, showToast]);

  const handleAsyncOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    action: string,
    options?: {
      onError?: (error: any) => void;
      showToastOnError?: boolean;
      errorMessage?: string;
    }
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      console.error(`Async operation failed in ${componentName}.${action}:`, error);
      
      if (options?.onError) {
        options.onError(error);
      } else {
        handleError(error, action, {
          showToast: options?.showToastOnError,
          toastMessage: options?.errorMessage
        });
      }
      
      return null;
    }
  }, [componentName, handleError]);

  return {
    handleError,
    handleAsyncOperation,
    handleApiError: errorHandler.handleApiError
  };
}

// Determine if an error should redirect to error page
function isRedirectableError(error: any): boolean {
  if (!error) return false;

  const status = error.status || error.response?.status;
  const message = error.message || error.response?.data?.error || String(error);
  const lowerMessage = message.toLowerCase();

  // Critical HTTP status codes
  const criticalStatuses = [500, 502, 503, 504];
  if (criticalStatuses.includes(status)) return true;

  // Critical error messages
  const criticalMessages = [
    'internal server error',
    'service unavailable',
    'database error',
    'authentication failed',
    'permission denied',
    'access denied',
    'chunk load error',
    'module not found',
    'syntax error'
  ];

  return criticalMessages.some(msg => lowerMessage.includes(msg));
}

// Extract user-friendly error message
function getErrorMessage(error: any): string {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  if (error.status) {
    return `Request failed with status ${error.status}`;
  }
  
  return 'An unexpected error occurred';
}
