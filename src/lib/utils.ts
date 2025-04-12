import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UploadedFile } from "@/components/FileUploader/types";

const API_BASE_URL = "/api/files";

export const fetchUploadedFiles = async (): Promise<UploadedFile[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch uploaded files");
  }
  const { files } = await response.json();
  return files.map((file: any) => ({
    name: file.name,
    url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${file.name}`,
    size: file.size,
    lastModified: file.lastModified,
  }));
};

export const uploadFile = async (
  file: File,
  fileName: string
): Promise<void> => {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, fileType: file.type }),
  });
  if (!response.ok) {
    throw new Error("Failed to get upload URL");
  }
  const { uploadUrl } = await response.json();
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file");
  }
};

export const deleteFile = async (fileName: string): Promise<void> => {
  const response = await fetch(API_BASE_URL, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete file");
  }
};

export const renameFile = async (
  oldName: string,
  newName: string
): Promise<void> => {
  const response = await fetch(API_BASE_URL, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldFileName: oldName, newFileName: newName }),
  });
  if (!response.ok) {
    throw new Error("Failed to rename file");
  }
};
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
