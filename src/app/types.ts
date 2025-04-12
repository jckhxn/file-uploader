export interface PendingFile {
  file: File;
  name: string;
}

export interface UploadedFile {
  name: string;
  url: string;
  size?: number;
  lastModified?: string;
}
