import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { IntlProvider as ReactIntlProvider } from 'react-intl';
import { storage } from './storage-utils';

// Supported languages
const SUPPORTED_LOCALES = ['en', 'es', 'fr'] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

// Default locale
const DEFAULT_LOCALE: Locale = 'en';

// Translation messages
const MESSAGES: Record<Locale, Record<string, string>> = {
  en: {
    'app.title': 'Ads Analytics Platform',
    'app.description': 'Comprehensive advertising analytics and insights',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search...',
    'common.noResults': 'No results found',
    'common.select': 'Select...',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.duration': 'Duration',
    'common.createdAt': 'Created At',
    'common.updatedAt': 'Updated At',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.phone': 'Phone',
    'common.address': 'Address',
    'common.description': 'Description',
    'common.required': 'This field is required',
    'common.invalidEmail': 'Please enter a valid email address',
    'common.invalidPhone': 'Please enter a valid phone number',
    'common.invalidUrl': 'Please enter a valid URL',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.on': 'On',
    'common.off': 'Off',
    'common.enabled': 'Enabled',
    'common.disabled': 'Disabled',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.pending': 'Pending',
    'common.completed': 'Completed',
    'common.failed': 'Failed',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.confirm': 'Are you sure?',
    'common.confirmDelete': 'Are you sure you want to delete this item?',
    'common.confirmAction': 'Are you sure you want to perform this action?',
    'common.confirmLeave': 'You have unsaved changes. Are you sure you want to leave?',
    'common.unsavedChanges': 'You have unsaved changes',
    'common.unsavedChangesConfirm': 'You have unsaved changes. Are you sure you want to continue?',
    'common.selectFile': 'Select a file',
    'common.dragAndDrop': 'Drag and drop a file here, or click to select',
    'common.browse': 'Browse',
    'common.uploading': 'Uploading...',
    'common.uploadComplete': 'Upload complete',
    'common.uploadFailed': 'Upload failed',
    'common.download': 'Download',
    'common.print': 'Print',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.clear': 'Clear',
    'common.apply': 'Apply',
    'common.reset': 'Reset',
    'common.close': 'Close',
    'common.more': 'More',
    'common.less': 'Less',
    'common.expand': 'Expand',
    'common.collapse': 'Collapse',
    'common.showMore': 'Show more',
    'common.showLess': 'Show less',
    'common.loadMore': 'Load more',
    'common.loadingMore': 'Loading more...',
    'common.noMoreItems': 'No more items to load',
    'common.items': 'items',
    'common.of': 'of',
    'common.page': 'Page',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.first': 'First',
    'common.last': 'Last',
    'common.jumpTo': 'Jump to',
    'common.rowsPerPage': 'Rows per page',
    'common.selected': 'selected',
    'common.selectAll': 'Select all',
    'common.selectNone': 'Select none',
    'common.selectRow': 'Select row',
    'common.deselectRow': 'Deselect row',
    'common.toggleSelectAll': 'Toggle select all',
    'common.toggleSelectRow': 'Toggle select row',
    'common.toggleSelectCell': 'Toggle select cell',
    'common.toggleExpand': 'Toggle expand',
    'common.toggleExpandAll': 'Toggle expand all',
    'common.toggleGroupBy': 'Toggle group by',
    'common.toggleFilters': 'Toggle filters',
    'common.toggleSortBy': 'Toggle sort by',
    'common.toggleDense': 'Toggle dense',
    'common.toggleFullscreen': 'Toggle fullscreen',
    'common.toggleTheme': 'Toggle theme',
    'common.toggleLanguage': 'Toggle language',
    'common.toggleSidebar': 'Toggle sidebar',
    'common.toggleMenu': 'Toggle menu',
    'common.toggleNotifications': 'Toggle notifications',
    'common.toggleUserMenu': 'Toggle user menu',
    'common.toggleSearch': 'Toggle search',
    'common.toggleSettings': 'Toggle settings',
    'common.toggleHelp': 'Toggle help',
    'common.toggleInfo': 'Toggle info',
    'common.toggleWarning': 'Toggle warning',
    'common.toggleError': 'Toggle error',
    'common.toggleSuccess': 'Toggle success',
    'common.toggleLoading': 'Toggle loading',
    'common.toggleDisabled': 'Toggle disabled',
    'common.toggleReadOnly': 'Toggle read only',
    'common.toggleRequired': 'Toggle required',
    'common.toggleHidden': 'Toggle hidden',
    'common.toggleVisible': 'Toggle visible',
    'common.toggleActive': 'Toggle active',
    'common.toggleInactive': 'Toggle inactive',
    'common.toggleEnabled': 'Toggle enabled',
    'common.toggleDisabled': 'Toggle disabled',
    'common.toggleOn': 'Toggle on',
    'common.toggleOff': 'Toggle off',
    'common.toggleTrue': 'Toggle true',
    'common.toggleFalse': 'Toggle false',
    'common.toggleYes': 'Toggle yes',
    'common.toggleNo': 'Toggle no',
    'common.toggleOpen': 'Toggle open',
    'common.toggleClose': 'Toggle close',
    'common.toggleExpand': 'Toggle expand',
    'common.toggleCollapse': 'Toggle collapse',
    'common.toggleMore': 'Toggle more',
    'common.toggleLess': 'Toggle less',
    'common.toggleUp': 'Toggle up',
    'common.toggleDown': 'Toggle down',
    'common.toggleLeft': 'Toggle left',
    'common.toggleRight': 'Toggle right',
    'common.togglePrevious': 'Toggle previous',
    'common.toggleNext': 'Toggle next',
    'common.toggleFirst': 'Toggle first',
    'common.toggleLast': 'Toggle last',
    'common.togglePlay': 'Toggle play',
    'common.togglePause': 'Toggle pause',
    'common.toggleStop': 'Toggle stop',
    'common.toggleRecord': 'Toggle record',
    'common.toggleMute': 'Toggle mute',
    'common.toggleVolume': 'Toggle volume',
    'common.toggleFullscreen': 'Toggle fullscreen',
    'common.toggleMinimize': 'Toggle minimize',
    'common.toggleMaximize': 'Toggle maximize',
    'common.toggleRestore': 'Toggle restore',
    'common.toggleClose': 'Toggle close',
    'common.toggleHelp': 'Toggle help',
    'common.toggleInfo': 'Toggle info',
    'common.toggleWarning': 'Toggle warning',
    'common.toggleError': 'Toggle error',
    'common.toggleSuccess': 'Toggle success',
    'common.toggleLoading': 'Toggle loading',
    'common.toggleDisabled': 'Toggle disabled',
    'common.toggleReadOnly': 'Toggle read only',
    'common.toggleRequired': 'Toggle required',
    'common.toggleHidden': 'Toggle hidden',
    'common.toggleVisible': 'Toggle visible',
    'common.toggleActive': 'Toggle active',
    'common.toggleInactive': 'Toggle inactive',
    'common.toggleEnabled': 'Toggle enabled',
    'common.toggleDisabled': 'Toggle disabled',
    'common.toggleOn': 'Toggle on',
    'common.toggleOff': 'Toggle off',
    'common.toggleTrue': 'Toggle true',
    'common.toggleFalse': 'Toggle false',
    'common.toggleYes': 'Toggle yes',
    'common.toggleNo': 'Toggle no',
  },
  es: {
    'app.title': 'Plataforma de Análisis de Anuncios',
    'app.description': 'Análisis y conocimientos integrales de publicidad',
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.retry': 'Reintentar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.search': 'Buscar...',
    'common.noResults': 'No se encontraron resultados',
    'common.select': 'Seleccionar...',
  },
  fr: {
    'app.title': 'Plateforme d\'Analyse des Publicités',
    'app.description': 'Analyse et informations complètes sur la publicité',
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.retry': 'Réessayer',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.search': 'Rechercher...',
    'common.noResults': 'Aucun résultat trouvé',
    'common.select': 'Sélectionner...',
  },
};

// Type for translation keys
type MessageKey = keyof typeof MESSAGES[Locale];

// Context type
type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, values?: Record<string, any>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
};

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Storage key for user preference
const LOCALE_STORAGE_KEY = 'i18n_locale';

// Provider props
type I18nProviderProps = {
  children: ReactNode;
  defaultLocale?: Locale;
};

export function I18nProvider({ children, defaultLocale }: I18nProviderProps) {
  // Get user's preferred language from browser or storage
  const getPreferredLocale = (): Locale => {
    // Check if locale is stored in localStorage
    const storedLocale = storage.get<Locale>(LOCALE_STORAGE_KEY);
    if (storedLocale && isSupportedLocale(storedLocale)) {
      return storedLocale;
    }

    // Get browser language
    const browserLanguage = navigator.language.split('-')[0] as Locale;
    if (isSupportedLocale(browserLanguage)) {
      return browserLanguage;
    }

    // Fallback to default or English
    return defaultLocale || DEFAULT_LOCALE;
  };

  const [locale, setLocale] = useState<Locale>(getPreferredLocale());
  const [messages, setMessages] = useState<Record<string, string>>(MESSAGES[locale]);

  // Check if a locale is supported
  const isSupportedLocale = (locale: string): locale is Locale => {
    return SUPPORTED_LOCALES.includes(locale as Locale);
  };

  // Change locale
  const changeLocale = (newLocale: Locale) => {
    if (!isSupportedLocale(newLocale)) {
      console.warn(`Locale '${newLocale}' is not supported. Falling back to '${DEFAULT_LOCALE}'.`);
      newLocale = DEFAULT_LOCALE;
    }

    setLocale(newLocale);
    setMessages(MESSAGES[newLocale]);
    storage.set(LOCALE_STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  };

  // Translation function
  const t = (key: MessageKey, values?: Record<string, any>): string => {
    let message = messages[key] || MESSAGES[DEFAULT_LOCALE][key] || key;

    // Replace placeholders with values
    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        message = message.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return message;
  };

  // Format number
  const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}): string => {
    return new Intl.NumberFormat(locale, options).format(value);
  };

  // Format currency
  const formatCurrency = (
    value: number, 
    currency: string = 'USD', 
    options: Intl.NumberFormatOptions = {}
  ): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      ...options,
    }).format(value);
  };

  // Format date
  const formatDate = (
    date: Date | string, 
    options: Intl.DateTimeFormatOptions = {}
  ): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    }).format(dateObj);
  };

  // Format time
  const formatTime = (
    date: Date | string, 
    options: Intl.DateTimeFormatOptions = {}
  ): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    }).format(dateObj);
  };

  // Format relative time
  const formatRelativeTime = (
    value: number, 
    unit: Intl.RelativeTimeFormatUnit
  ): string => {
    return new Intl.RelativeTimeFormat(locale, {
      numeric: 'auto',
    }).format(value, unit);
  };

  // Set initial locale on mount
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      locale,
      setLocale: changeLocale,
      t,
      formatNumber,
      formatCurrency,
      formatDate,
      formatTime,
      formatRelativeTime,
    }),
    [locale, messages]
  );

  return (
    <I18nContext.Provider value={contextValue}>
      <ReactIntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={messages}>
        {children}
      </ReactIntlProvider>
    </I18nContext.Provider>
  );
}

// Hook to use the i18n context
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Higher-order component for class components
export function withI18n<P extends object>(
  WrappedComponent: React.ComponentType<P & { i18n: I18nContextType }>
) {
  return function WithI18n(props: P) {
    const i18n = useI18n();
    return <WrappedComponent {...props} i18n={i18n} />;
  };
}

// Utility function to get supported locales
export function getSupportedLocales(): readonly Locale[] {
  return SUPPORTED_LOCALES;
}

// Utility function to get default locale
export function getDefaultLocale(): Locale {
  return DEFAULT_LOCALE;
}
