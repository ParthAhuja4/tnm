import React from 'react';
import { notificationService } from './notification-utils';
import { storage } from './storage-utils';

// File types
type FileType = 'image' | 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'video' | 'audio' | 'archive' | 'code' | 'other';

// MIME type to file type mapping
const MIME_TYPES: Record<string, FileType> = {
  // Images
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'image/bmp': 'image',
  'image/tiff': 'image',
  'image/x-icon': 'image',
  
  // Documents
  'text/plain': 'document',
  'text/html': 'document',
  'text/css': 'document',
  'text/csv': 'document',
  'application/rtf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.oasis.opendocument.text': 'document',
  
  // Spreadsheets
  'application/vnd.ms-excel': 'spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  'application/vnd.oasis.opendocument.spreadsheet': 'spreadsheet',
  'text/csv': 'spreadsheet',
  'text/tab-separated-values': 'spreadsheet',
  
  // Presentations
  'application/vnd.ms-powerpoint': 'presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
  'application/vnd.oasis.opendocument.presentation': 'presentation',
  
  // PDF
  'application/pdf': 'pdf',
  
  // Video
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
  'video/x-ms-wmv': 'video',
  'video/mpeg': 'video',
  'video/3gpp': 'video',
  'video/3gpp2': 'video',
  
  // Audio
  'audio/mpeg': 'audio',
  'audio/ogg': 'audio',
  'audio/wav': 'audio',
  'audio/webm': 'audio',
  'audio/aac': 'audio',
  'audio/midi': 'audio',
  'audio/x-wav': 'audio',
  'audio/x-m4a': 'audio',
  
  // Archives
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/x-tar': 'archive',
  'application/gzip': 'archive',
  'application/x-bzip': 'archive',
  'application/x-bzip2': 'archive',
  
  // Code
  'application/javascript': 'code',
  'application/x-javascript': 'code',
  'application/json': 'code',
  'text/javascript': 'code',
  'text/x-python': 'code',
  'text/x-java-source': 'code',
  'text/x-c': 'code',
  'text/x-c++': 'code',
  'text/x-csharp': 'code',
  'text/x-php': 'code',
  'text/x-ruby': 'code',
  'text/x-go': 'code',
  'text/x-rust': 'code',
  'text/x-swift': 'code',
  'text/x-kotlin': 'code',
  'text/x-scala': 'code',
  'text/x-typescript': 'code',
  'text/x-sql': 'code',
  'text/xml': 'code',
  'application/xml': 'code',
};

// File type icons
const FILE_ICONS: Record<FileType, string> = {
  image: '🖼️',
  document: '📄',
  spreadsheet: '📊',
  presentation: '📝',
  pdf: '📑',
  video: '🎥',
  audio: '🔊',
  archive: '📦',
  code: '💻',
  other: '📎',
};

// File size units
const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

// Get file type from MIME type
export function getFileTypeFromMime(mimeType: string): FileType {
  return MIME_TYPES[mimeType.toLowerCase()] || 'other';
}

// Get file type from file name
export function getFileTypeFromFileName(fileName: string): FileType {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Common file extensions
  const extensionMap: Record<string, FileType> = {
    // Images
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
    bmp: 'image',
    tiff: 'image',
    ico: 'image',
    
    // Documents
    txt: 'document',
    doc: 'document',
    docx: 'document',
    odt: 'document',
    rtf: 'document',
    
    // Spreadsheets
    xls: 'spreadsheet',
    xlsx: 'spreadsheet',
    ods: 'spreadsheet',
    csv: 'spreadsheet',
    tsv: 'spreadsheet',
    
    // Presentations
    ppt: 'presentation',
    pptx: 'presentation',
    odp: 'presentation',
    
    // PDF
    pdf: 'pdf',
    
    // Video
    mp4: 'video',
    webm: 'video',
    ogv: 'video',
    mov: 'video',
    avi: 'video',
    wmv: 'video',
    mpg: 'video',
    mpeg: 'video',
    '3gp': 'video',
    '3g2': 'video',
    
    // Audio
    mp3: 'audio',
    ogg: 'audio',
    wav: 'audio',
    aac: 'audio',
    midi: 'audio',
    m4a: 'audio',
    
    // Archives
    zip: 'archive',
    rar: 'archive',
    '7z': 'archive',
    tar: 'archive',
    gz: 'archive',
    bz: 'archive',
    bz2: 'archive',
    
    // Code
    js: 'code',
    jsx: 'code',
    ts: 'code',
    tsx: 'code',
    json: 'code',
    py: 'code',
    java: 'code',
    c: 'code',
    cpp: 'code',
    cs: 'code',
    php: 'code',
    rb: 'code',
    go: 'code',
    rs: 'code',
    swift: 'code',
    kt: 'code',
    scala: 'code',
    sql: 'code',
    xml: 'code',
    html: 'code',
    css: 'code',
  };
  
  return extensionMap[extension] || 'other';
}

// Get file type from file object
export function getFileType(file: File): FileType {
  if (file.type) {
    const typeFromMime = getFileTypeFromMime(file.type);
    if (typeFromMime !== 'other') {
      return typeFromMime;
    }
  }
  
  return getFileTypeFromFileName(file.name);
}

// Get file icon
export function getFileIcon(file: File | string): string {
  const fileType = typeof file === 'string' 
    ? getFileTypeFromFileName(file) 
    : getFileType(file);
  
  return FILE_ICONS[fileType];
}

// Format file size
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + FILE_SIZE_UNITS[i];
}

// Read file as data URL
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    
    reader.readAsDataURL(file);
  });
}

// Read file as text
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    
    reader.readAsText(file);
  });
}

// Read file as array buffer
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    
    reader.readAsArrayBuffer(file);
  });
}

// Download file
export function downloadFile(data: Blob | string, fileName: string): void {
  const url = typeof data === 'string' 
    ? data 
    : URL.createObjectURL(new Blob([data]));
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    if (typeof data !== 'string') {
      URL.revokeObjectURL(url);
    }
  }, 100);
}

// Upload file to server
export async function uploadFile(
  file: File, 
  url: string, 
  options: {
    headers?: Record<string, string>;
    onProgress?: (progress: number) => void;
    fieldName?: string;
    additionalData?: Record<string, any>;
  } = {}
): Promise<any> {
  const {
    headers = {},
    onProgress,
    fieldName = 'file',
    additionalData = {},
  } = options;
  
  const formData = new FormData();
  formData.append(fieldName, file);
  
  // Append additional data to form data
  Object.entries(additionalData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value instanceof Blob ? value : String(value));
    }
  });
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', url, true);
    
    // Set headers
    Object.entries({
      'Accept': 'application/json',
      ...headers,
    }).forEach(([key, value]) => {
      if (value) {
        xhr.setRequestHeader(key, value);
      }
    });
    
    // Track upload progress
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
          resolve(response);
        } catch (error) {
          resolve({});
        }
      } else {
        let errorMessage = 'Upload failed';
        try {
          const errorResponse = xhr.responseText ? JSON.parse(xhr.responseText) : {};
          errorMessage = errorResponse.message || errorMessage;
        } catch (e) {
          // Ignore JSON parse error
        }
        
        reject(new Error(errorMessage));
      }
    };
    
    xhr.onerror = () => {
      reject(new Error('Network error occurred'));
    };
    
    xhr.send(formData);
  });
}

// Check if file is an image
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

// Check if file is a video
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

// Check if file is an audio file
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}

// Check if file is a PDF
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}

// Check if file is a document
export function isDocumentFile(file: File): boolean {
  return [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'application/rtf',
    'text/plain',
  ].includes(file.type);
}

// Check if file is a spreadsheet
export function isSpreadsheetFile(file: File): boolean {
  return [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet',
    'text/csv',
    'text/tab-separated-values',
  ].includes(file.type);
}

// Check if file is a presentation
export function isPresentationFile(file: File): boolean {
  return [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.presentation',
  ].includes(file.type);
}

// Check if file is an archive
export function isArchiveFile(file: File): boolean {
  return [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-bzip',
    'application/x-bzip2',
  ].includes(file.type);
}

// Check if file is a code file
export function isCodeFile(file: File): boolean {
  return [
    'application/javascript',
    'application/x-javascript',
    'application/json',
    'text/javascript',
    'text/x-python',
    'text/x-java-source',
    'text/x-c',
    'text/x-c++',
    'text/x-csharp',
    'text/x-php',
    'text/x-ruby',
    'text/x-go',
    'text/x-rust',
    'text/x-swift',
    'text/x-kotlin',
    'text/x-scala',
    'text/x-typescript',
    'text/x-sql',
    'text/xml',
    'application/xml',
  ].includes(file.type);
}

// Get file extension
export function getFileExtension(file: File): string {
  const parts = file.name.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

// File validator
export function validateFile(
  file: File, 
  options: {
    allowedTypes?: string[];
    maxSize?: number; // in bytes
    minSize?: number; // in bytes
    allowedExtensions?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { 
    allowedTypes = [], 
    maxSize = 10 * 1024 * 1024, // 10MB default
    minSize = 0,
    allowedExtensions = [],
  } = options;
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${formatFileSize(maxSize)}.`,
    };
  }
  
  if (file.size < minSize) {
    return {
      valid: false,
      error: `File is too small. Minimum size is ${formatFileSize(minSize)}.`,
    };
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}.`,
    };
  }
  
  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = getFileExtension(file);
    if (!extension || !allowedExtensions.includes(extension.toLowerCase())) {
      return {
        valid: false,
        error: `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}.`,
      };
    }
  }
  
  return { valid: true };
}

// File preview component props
type FilePreviewProps = {
  file: File | string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  alt?: string;
  onError?: () => void;
  onLoad?: () => void;
};

// File preview component
export function FilePreview({ 
  file, 
  className, 
  style, 
  width = '100%', 
  height = 'auto',
  alt = 'Preview',
  onError,
  onLoad,
}: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  
  // Generate preview URL
  React.useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    
    // If file is a string, use it as the URL
    if (typeof file === 'string') {
      setPreviewUrl(file);
      setLoading(false);
      return;
    }
    
    // Create object URL for the file
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setLoading(false);
    
    // Clean up object URL on unmount
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);
  
  // Handle image load error
  const handleError = () => {
    setError(true);
    if (onError) onError();
  };
  
  // Handle image load
  const handleLoad = () => {
    setLoading(false);
    if (onLoad) onLoad();
  };
  
  // Render appropriate preview based on file type
  const renderPreview = () => {
    if (!file) {
      return <div className="file-preview-empty">No file selected</div>;
    }
    
    const fileObj = typeof file === 'string' ? { type: '', name: file } : file;
    const fileType = typeof file === 'string' 
      ? getFileTypeFromFileName(file) 
      : getFileType(fileObj);
    
    // If we have an error or loading state
    if (error) {
      return (
        <div className="file-preview-error">
          <div className="file-icon">{FILE_ICONS[fileType]}</div>
          <div className="file-name">{fileObj.name || 'File'}</div>
          <div className="file-error">Preview not available</div>
        </div>
      );
    }
    
    // If still loading
    if (loading) {
      return <div className="file-preview-loading">Loading preview...</div>;
    }
    
    // Render based on file type
    switch (fileType) {
      case 'image':
        return (
          <img
            src={previewUrl}
            alt={alt}
            className={className}
            style={style}
            width={width}
            height={height}
            onError={handleError}
            onLoad={handleLoad}
          />
        );
        
      case 'video':
        return (
          <video
            src={previewUrl}
            controls
            className={className}
            style={style}
            width={width}
            height={height}
            onError={handleError}
            onLoad={handleLoad}
          >
            Your browser does not support the video tag.
          </video>
        );
        
      case 'audio':
        return (
          <div className="file-preview-audio">
            <div className="file-icon">{FILE_ICONS.audio}</div>
            <div className="file-name">{fileObj.name || 'Audio File'}</div>
            <audio
              src={previewUrl}
              controls
              className={className}
              style={style}
              onError={handleError}
              onLoad={handleLoad}
            />
          </div>
        );
        
      case 'pdf':
        return (
          <div className="file-preview-pdf">
            <div className="file-icon">{FILE_ICONS.pdf}</div>
            <div className="file-name">{fileObj.name || 'PDF Document'}</div>
            <iframe
              src={`${previewUrl}#view=fitH`}
              title={alt}
              className={className}
              style={style}
              width={width}
              height={height}
              onError={handleError}
            />
          </div>
        );
        
      default:
        return (
          <div className="file-preview-generic">
            <div className="file-icon">{FILE_ICONS[fileType]}</div>
            <div className="file-name">{fileObj.name || 'File'}</div>
            <div className="file-type">{fileType.toUpperCase()}</div>
            {typeof file !== 'string' && (
              <div className="file-size">{formatFileSize(file.size)}</div>
            )}
          </div>
        );
    }
  };
  
  return (
    <div className={`file-preview file-type-${fileType} ${className || ''}`} style={style}>
      {renderPreview()}
    </div>
  );
}

// File uploader hook
export function useFileUpload(options: {
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (response: any) => void;
  onUploadError?: (error: Error) => void;
  uploadUrl: string;
  fieldName?: string;
  headers?: Record<string, string>;
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}) {
  const {
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
    uploadUrl,
    fieldName = 'file',
    headers = {},
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = [],
    allowedExtensions = [],
  } = options;
  
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<Error | null>(null);
  const [response, setResponse] = React.useState<any>(null);
  
  const uploadFile = React.useCallback(async (file: File, additionalData: Record<string, any> = {}) => {
    // Reset state
    setError(null);
    setResponse(null);
    setProgress(0);
    setIsUploading(true);
    
    // Validate file
    const validation = validateFile(file, {
      maxSize,
      allowedTypes,
      allowedExtensions,
    });
    
    if (!validation.valid) {
      const error = new Error(validation.error || 'Invalid file');
      setError(error);
      if (onUploadError) onUploadError(error);
      setIsUploading(false);
      throw error;
    }
    
    // Start upload
    if (onUploadStart) onUploadStart();
    
    try {
      const result = await uploadFile(file, uploadUrl, {
        headers,
        fieldName,
        additionalData,
        onProgress: (progress) => {
          setProgress(progress);
          if (onUploadProgress) onUploadProgress(progress);
        },
      });
      
      setResponse(result);
      if (onUploadComplete) onUploadComplete(result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Upload failed');
      setError(err);
      if (onUploadError) onUploadError(err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [
    uploadUrl,
    fieldName,
    headers,
    maxSize,
    allowedTypes,
    allowedExtensions,
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
  ]);
  
  return {
    uploadFile,
    isUploading,
    progress,
    error,
    response,
    reset: () => {
      setError(null);
      setResponse(null);
      setProgress(0);
    },
  };
}
