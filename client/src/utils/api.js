import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Handles API requests with automatic toast notifications
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {Object} notifications - Custom notification options
 * @returns {Promise<Object>} - Response data
 */
export const apiRequest = async (endpoint, options = {}, notifications = {}) => {
  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage,
    errorMessage,
    loadingMessage = 'Processing request...',
    toastId = 'api-request',
  } = notifications;

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  // Show loading toast if specified
  if (loadingMessage) {
    toast.loading(loadingMessage, { id: toastId });
  }

  try {
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse the response
    const data = await response.json();

    // Handle success
    if (response.ok) {
      if (showSuccessToast) {
        toast.success(successMessage || data.message || 'Operation successful', {
          id: toastId,
          description: data.description,
        });
      } else if (loadingMessage) {
        toast.dismiss(toastId);
      }
      return data;
    }

    // Handle error response
    throw new Error(data.message || 'Something went wrong');
  } catch (error) {
    // Handle error
    if (showErrorToast) {
      toast.error(errorMessage || error.message || 'An error occurred', {
        id: toastId,
      });
    } else if (loadingMessage) {
      toast.dismiss(toastId);
    }
    
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Test the toast notification system
 * @param {string} type - Type of toast (success, error, info, warning)
 */
export const testNotification = async (type = 'success') => {
  try {
    const response = await apiRequest(`/test-notification?type=${type}`, {
      method: 'GET',
    }, {
      showSuccessToast: false,
      loadingMessage: 'Testing notification...',
    });

    // Show the appropriate toast based on the type
    switch (type) {
      case 'success':
        toast.success(response.data.title, {
          description: response.data.description,
        });
        break;
      case 'error':
        toast.error(response.data.title, {
          description: response.data.description,
        });
        break;
      case 'info':
        toast.info(response.data.title, {
          description: response.data.description,
        });
        break;
      case 'warning':
        toast.warning(response.data.title, {
          description: response.data.description,
        });
        break;
      default:
        toast(response.data.title, {
          description: response.data.description,
        });
    }

    return response;
  } catch (error) {
    console.error('Test notification error:', error);
    throw error;
  }
};

export default apiRequest;