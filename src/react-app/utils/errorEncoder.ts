// Error encoding utilities for user-friendly error codes
import { encode as base64Encode, decode as base64Decode } from 'js-base64';

export interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  component?: string;
  action?: string;
}

// Generate a short, user-friendly error code
export function generateErrorCode(errorInfo: ErrorInfo): string {
  // Create a unique identifier based on error info
  const data = `${errorInfo.message}|${errorInfo.timestamp}|${errorInfo.url}`;
  
  // Use a simple hash to create a shorter code
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive number and format as 8-digit hex
  const positiveHash = Math.abs(hash);
  const shortCode = positiveHash.toString(16).toUpperCase().slice(-8).padStart(8, '0');
  
  return `ERR-${shortCode}`;
}

// Encode error information into a base64 string for URL
export function encodeErrorInfo(errorInfo: ErrorInfo): string {
  try {
    const jsonString = JSON.stringify(errorInfo);
    return base64Encode(jsonString);
  } catch (e) {
    console.error('Failed to encode error info:', e);
    return '';
  }
}

// Decode error information from base64 string
export function decodeErrorInfo(encoded: string): ErrorInfo | null {
  try {
    const jsonString = base64Decode(encoded);
    return JSON.parse(jsonString) as ErrorInfo;
  } catch (e) {
    console.error('Failed to decode error info:', e);
    return null;
  }
}

// Create error info object from various error sources
export function createErrorInfo(
  error: Error | string,
  component?: string,
  action?: string,
  userId?: string
): ErrorInfo {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'object' ? error.stack : undefined;
  
  return {
    message: errorMessage,
    stack,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    userId,
    component,
    action
  };
}

// Navigate to error page with encoded error info
export function navigateToErrorPage(errorInfo: ErrorInfo): void {
  const code = generateErrorCode(errorInfo);
  const encoded = encodeErrorInfo(errorInfo);
  
  // Use replace to prevent back navigation to broken state
  window.location.replace(`/error?code=${code}&data=${encoded}`);
}

// Handle critical errors by redirecting to error page
export function handleCriticalError(
  error: Error | string,
  component?: string,
  action?: string,
  userId?: string
): void {
  const errorInfo = createErrorInfo(error, component, action, userId);
  navigateToErrorPage(errorInfo);
}
