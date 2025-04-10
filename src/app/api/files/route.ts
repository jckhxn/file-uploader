import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  endpoint: process.env.CLOUDFLARE_URL,
  region: "auto",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

// List files in the bucket
export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    });

    const response = await s3.send(command);

    const files = response.Contents?.map((file) => ({
      name: file.Key,
      url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${file.Key}`,
      size: file.Size,
      lastModified: file.LastModified,
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}

// Delete a file from the bucket
export async function DELETE(req: Request) {
  try {
    const { fileName } = await req.json();

    if (!fileName) {
      return NextResponse.json(
        { error: "Missing fileName parameter" },
        { status: 400 }
      );
    }

    console.log("Deleting file:", fileName);

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
    });

    const response = await s3.send(command);
    console.log("Delete response:", response);

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

// Rename a file in the bucket
export async function PATCH(req: Request) {
  try {
    const { oldFileName, newFileName } = await req.json();

    if (!oldFileName || !newFileName) {
      return NextResponse.json(
        { error: "Missing oldFileName or newFileName parameter" },
        { status: 400 }
      );
    }

    console.log("Renaming file:", oldFileName, "to", newFileName);

    // Copy the file to the new name
    const copyCommand = new CopyObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      CopySource: `${process.env.R2_BUCKET_NAME}/${oldFileName}`,
      Key: newFileName,
    });

    const copyResponse = await s3.send(copyCommand);
    console.log("Copy response:", copyResponse);

    // Delete the old file
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: oldFileName,
    });

    const deleteResponse = await s3.send(deleteCommand);
    console.log("Delete response:", deleteResponse);

    return NextResponse.json({ message: "File renamed successfully" });
  } catch (error) {
    console.error("Error renaming file:", error);
    return NextResponse.json(
      { error: "Failed to rename file" },
      { status: 500 }
    );
  }
}
