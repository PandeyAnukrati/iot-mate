import { useState } from 'react';
import { toast } from 'sonner';
import { testNotification } from '../utils/api';

const ToastTester = () => {
  const [loading, setLoading] = useState(false);

  // Function to show a simple toast
  const showSimpleToast = (type) => {
    switch (type) {
      case 'success':
        toast.success('Success Toast', {
          description: 'This is a success toast notification',
        });
        break;
      case 'error':
        toast.error('Error Toast', {
          description: 'This is an error toast notification',
        });
        break;
      case 'info':
        toast.info('Info Toast', {
          description: 'This is an info toast notification',
        });
        break;
      case 'warning':
        toast.warning('Warning Toast', {
          description: 'This is a warning toast notification',
        });
        break;
      default:
        toast('Default Toast', {
          description: 'This is a default toast notification',
        });
    }
  };

  // Function to test API notification
  const testApiNotification = async (type) => {
    setLoading(true);
    try {
      await testNotification(type);
    } catch (error) {
      console.error('Error testing notification:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to show a promise toast
  const showPromiseToast = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ message: 'Data loaded successfully!' });
        }, 2000);
      }),
      {
        loading: 'Loading data...',
        success: (data) => data.message,
        error: 'Error loading data',
      }
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Toast Notification Tester</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Simple Toasts</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => showSimpleToast('success')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Success
          </button>
          <button
            onClick={() => showSimpleToast('error')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Error
          </button>
          <button
            onClick={() => showSimpleToast('info')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Info
          </button>
          <button
            onClick={() => showSimpleToast('warning')}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Warning
          </button>
          <button
            onClick={() => showSimpleToast()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Default
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">API Toasts</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => testApiNotification('success')}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            API Success
          </button>
          <button
            onClick={() => testApiNotification('error')}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            API Error
          </button>
          <button
            onClick={() => testApiNotification('info')}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            API Info
          </button>
          <button
            onClick={() => testApiNotification('warning')}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            API Warning
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Promise Toast</h3>
        <button
          onClick={showPromiseToast}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Show Promise Toast
        </button>
      </div>
    </div>
  );
};

export default ToastTester;