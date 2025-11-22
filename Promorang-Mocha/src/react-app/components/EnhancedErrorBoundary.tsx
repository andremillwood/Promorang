// Enhanced error boundary that captures more context and redirects to error page
import { Component, ErrorInfo, ReactNode } from 'react';
import { createErrorInfo, navigateToErrorPage } from '@/react-app/utils/errorEncoder';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  userId?: string;
}

interface State {
  hasError: boolean;
}

export default class EnhancedErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Enhanced Error Boundary caught error:', error, errorInfo);
    
    // Create detailed error information
    const errorData = createErrorInfo(
      error,
      this.props.componentName || 'Component',
      'render',
      this.props.userId
    );
    
    // Add component stack to error data
    errorData.stack = error.stack + '\n\nComponent Stack:' + errorInfo.componentStack;
    
    // Navigate to error page
    navigateToErrorPage(errorData);
  }

  public render() {
    if (this.state.hasError) {
      // Show fallback UI briefly before redirect
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to error page...</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
