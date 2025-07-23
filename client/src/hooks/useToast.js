import { toast } from 'sonner';

/**
 * Custom hook for using toast notifications
 * @returns {Object} Toast notification methods
 */
const useToast = () => {
  /**
   * Show a success toast notification
   * @param {string} title - Toast title
   * @param {Object} options - Toast options
   */
  const success = (title, options = {}) => {
    toast.success(title, options);
  };

  /**
   * Show an error toast notification
   * @param {string} title - Toast title
   * @param {Object} options - Toast options
   */
  const error = (title, options = {}) => {
    toast.error(title, options);
  };

  /**
   * Show an info toast notification
   * @param {string} title - Toast title
   * @param {Object} options - Toast options
   */
  const info = (title, options = {}) => {
    toast.info(title, options);
  };

  /**
   * Show a warning toast notification
   * @param {string} title - Toast title
   * @param {Object} options - Toast options
   */
  const warning = (title, options = {}) => {
    toast.warning(title, options);
  };

  /**
   * Show a loading toast notification
   * @param {string} title - Toast title
   * @param {Object} options - Toast options
   * @returns {string} Toast ID
   */
  const loading = (title, options = {}) => {
    return toast.loading(title, options);
  };

  /**
   * Show a promise toast notification
   * @param {Promise} promise - Promise to track
   * @param {Object} messages - Toast messages for different states
   * @param {Object} options - Toast options
   */
  const promise = (promise, messages, options = {}) => {
    toast.promise(promise, messages, options);
  };

  /**
   * Dismiss a toast notification
   * @param {string} toastId - Toast ID to dismiss
   */
  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  /**
   * Show a custom toast notification
   * @param {string} title - Toast title
   * @param {Object} options - Toast options
   */
  const custom = (title, options = {}) => {
    toast(title, options);
  };

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    dismiss,
    custom,
  };
};

export default useToast;