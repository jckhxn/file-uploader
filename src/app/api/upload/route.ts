import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { UploadedFile } from "@/app/types";
const API_BASE_URL = `/api/upload`;
const s3 = new S3Client({
  endpoint: process.env.CLOUDFLARE_URL, // Base URL of your R2 storage
  region: "auto", // Cloudflare R2 uses "auto" for region
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Missing fileName or fileType" },
        { status: 400 }
      );
    }

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME, // Name of your R2 bucket
      Key: fileName, // File name (key) in the bucket
      ContentType: fileType, // MIME type of the file
    });

    console.log("Generating signed URL for:", fileName);

    // Generate a signed URL for uploading the file
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const fileUrl = `${process.env.CLOUDFLARE_URL}/${process.env.R2_BUCKET_NAME}/${fileName}`;

    console.log("Signed URL generated successfully:", uploadUrl);

    return NextResponse.json({ uploadUrl, fileUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

export const fetchUploadedFiles = async (): Promise<UploadedFile[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch uploaded files");
  }
  const { files }: { files: UploadedFile[] } = await response.json(); // Specify the type here
  return files.map((file: UploadedFile) => ({
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
  const response = await fetch(API_BASE_URL, {
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
