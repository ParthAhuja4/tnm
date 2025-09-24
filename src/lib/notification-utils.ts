import { toast, ToastOptions, ToastType, ToastPosition } from 'sonner';
import { useCallback } from 'react';
import { useI18n } from './i18n';

// Types
type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';
type NotificationPosition = ToastPosition;
type NotificationOptions = Omit<ToastOptions, 'position'> & {
  position?: NotificationPosition;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
};

// Default options
const DEFAULT_OPTIONS: ToastOptions = {
  duration: 5000,
  position: 'top-right',
  dismissible: true,
};

// Notification utility class
class NotificationService {
  private static instance: NotificationService;
  private defaultOptions: ToastOptions;

  private constructor(options: ToastOptions = {}) {
    this.defaultOptions = { ...DEFAULT_OPTIONS, ...options };
  }

  public static getInstance(options?: ToastOptions): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(options);
    }
    return NotificationService.instance;
  }

  private getMergedOptions(options: ToastOptions = {}): ToastOptions {
    return { ...this.defaultOptions, ...options };
  }

  public success(message: string, options: ToastOptions = {}) {
    toast.success(message, this.getMergedOptions(options));
  }

  public error(message: string, options: ToastOptions = {}) {
    toast.error(message, this.getMergedOptions(options));
  }

  public warning(message: string, options: ToastOptions = {}) {
    toast.warning(message, this.getMergedOptions(options));
  }

  public info(message: string, options: ToastOptions = {}) {
    toast.info(message, this.getMergedOptions(options));
  }

  public loading(message: string, options: ToastOptions = {}) {
    toast.loading(message, this.getMergedOptions(options));
  }

  public promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options: ToastOptions = {}
  ): Promise<T> {
    return toast.promise(promise, messages, this.getMergedOptions(options));
  }

  public dismiss(id?: string) {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }

  public clear() {
    toast.dismiss();
  }

  // Shortcut methods
  public static success = (message: string, options?: ToastOptions) => 
    NotificationService.getInstance().success(message, options);
  
  public static error = (message: string, options?: ToastOptions) => 
    NotificationService.getInstance().error(message, options);
  
  public static warning = (message: string, options?: ToastOptions) => 
    NotificationService.getInstance().warning(message, options);
  
  public static info = (message: string, options?: ToastOptions) => 
    NotificationService.getInstance().info(message, options);
  
  public static loading = (message: string, options?: ToastOptions) => 
    NotificationService.getInstance().loading(message, options);
  
  public static promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => NotificationService.getInstance().promise(promise, messages, options);
  
  public static dismiss = (id?: string) => 
    NotificationService.getInstance().dismiss(id);
  
  public static clear = () => 
    NotificationService.getInstance().clear();
}

// React hook for notifications
export function useNotifications() {
  const { t } = useI18n();
  
  const notify = useCallback((
    type: NotificationType,
    message: string,
    options: NotificationOptions = {}
  ) => {
    const { position, duration, ...rest } = options;
    const toastOptions: ToastOptions = {
      position: position || DEFAULT_OPTIONS.position,
      duration: duration || DEFAULT_OPTIONS.duration,
      ...rest,
    };
    
    switch (type) {
      case 'success':
        NotificationService.success(message, toastOptions);
        break;
      case 'error':
        NotificationService.error(message, toastOptions);
        break;
      case 'warning':
        NotificationService.warning(message, toastOptions);
        break;
      case 'info':
        NotificationService.info(message, toastOptions);
        break;
      case 'loading':
        NotificationService.loading(message, toastOptions);
        break;
      default:
        NotificationService.info(message, toastOptions);
    }
  }, []);
  
  const notifySuccess = useCallback((message: string, options?: NotificationOptions) => {
    notify('success', message, options);
  }, [notify]);
  
  const notifyError = useCallback((message: string, options?: NotificationOptions) => {
    notify('error', message, options);
  }, [notify]);
  
  const notifyWarning = useCallback((message: string, options?: NotificationOptions) => {
    notify('warning', message, options);
  }, [notify]);
  
  const notifyInfo = useCallback((message: string, options?: NotificationOptions) => {
    notify('info', message, options);
  }, [notify]);
  
  const notifyLoading = useCallback((message: string, options?: NotificationOptions) => {
    notify('loading', message, options);
  }, [notify]);
  
  const notifyPromise = useCallback(<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: NotificationOptions
  ) => {
    const { position, ...rest } = options || {};
    return NotificationService.promise(promise, messages, {
      position: position || DEFAULT_OPTIONS.position,
      ...rest,
    });
  }, []);
  
  const dismissNotification = useCallback((id?: string) => {
    NotificationService.dismiss(id);
  }, []);
  
  const clearNotifications = useCallback(() => {
    NotificationService.clear();
  }, []);
  
  // Common notification patterns
  const notifySuccessT = useCallback((key: string, values?: Record<string, any>, options?: NotificationOptions) => {
    notifySuccess(t(key, values), options);
  }, [notifySuccess, t]);
  
  const notifyErrorT = useCallback((key: string, values?: Record<string, any>, options?: NotificationOptions) => {
    notifyError(t(key, values), options);
  }, [notifyError, t]);
  
  const notifyWarningT = useCallback((key: string, values?: Record<string, any>, options?: NotificationOptions) => {
    notifyWarning(t(key, values), options);
  }, [notifyWarning, t]);
  
  const notifyInfoT = useCallback((key: string, values?: Record<string, any>, options?: NotificationOptions) => {
    notifyInfo(t(key, values), options);
  }, [notifyInfo, t]);
  
  const notifyLoadingT = useCallback((key: string, values?: Record<string, any>, options?: NotificationOptions) => {
    notifyLoading(t(key, values), options);
  }, [notifyLoading, t]);
  
  return {
    // Direct notification methods
    notify,
    success: notifySuccess,
    error: notifyError,
    warning: notifyWarning,
    info: notifyInfo,
    loading: notifyLoading,
    promise: notifyPromise,
    dismiss: dismissNotification,
    clear: clearNotifications,
    
    // I18n-aware notification methods
    notifyT: notifyInfoT,
    successT: notifySuccessT,
    errorT: notifyErrorT,
    warningT: notifyWarningT,
    infoT: notifyInfoT,
    loadingT: notifyLoadingT,
    
    // Singleton instance (for use outside of React components)
    instance: NotificationService.getInstance(),
  };
}

// Export the singleton instance
export const notificationService = NotificationService.getInstance();

// Export types
export type { NotificationType, NotificationOptions, NotificationPosition };
