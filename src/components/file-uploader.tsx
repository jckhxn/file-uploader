"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  endpoint: process.env.CLOUDFLARE_URL,
  region: "auto",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    });

    const response = await s3.send(command);

    const files = response.Contents?.map((file) => ({
      name: file.Key,
      size: file.Size,
      lastModified: file.LastModified,
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export const FileUploader = () => {
  const [files, setFiles] = useState<{ file: File; name: string }[]>([]);
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; url: string; size?: number; lastModified?: string }[]
  >([]);
  const [editingFile, setEditingFile] = useState<string | null>(null); // Track which file is being edited
  const [showProgress, setShowProgress] = useState(false); // Control progress bar visibility
  const [copiedLink, setCopiedLink] = useState<string | null>(null); // Track which link was copied
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for file input

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        file,
        name: file.name, // Default to the original file name
      }));
      setFiles((prev) => [...prev, ...newFiles]); // Append new files to the existing list
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch("/api/files"); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error("Failed to fetch uploaded files");
      }

      const { files } = await response.json();

      // Construct public URLs for the files
      const updatedFiles = files?.map((file: any) => ({
        name: file.name,
        url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${file.name}`,
        size: file.size,
        lastModified: file.lastModified,
      }));

      setUploadedFiles(updatedFiles);
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
    }
  };

  const handleUpload = async () => {
    setShowProgress(true); // Show progress bar when upload starts
    for (const { file, name } of files) {
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: name, fileType: file.type }),
        });

        if (!response.ok) {
          throw new Error("Failed to get upload URL");
        }

        const { uploadUrl } = await response.json();

        // Upload the file to the signed URL
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file");
        }

        // Update the upload status
        setUploadStatus((prev) => ({
          ...prev,
          [name]: "success",
        }));
      } catch (error) {
        console.error(error);

        // Update the upload status to "error"
        setUploadStatus((prev) => ({
          ...prev,
          [name]: "error",
        }));
      }
    }
    setShowProgress(false); // Hide progress bar after all uploads are complete
    setFiles([]); // Clear the files state
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    fetchUploadedFiles(); // Refresh the uploaded files list
  };

  const handleEdit = async (fileName: string, newFileName: string) => {
    try {
      if (!newFileName || newFileName === fileName) {
        setEditingFile(null); // Exit edit mode if no changes
        return;
      }

      const response = await fetch(`/api/files`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldFileName: fileName, newFileName }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename file");
      }

      // Update the file name in the UI only after successful renaming
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.name === fileName
            ? {
                ...file,
                name: newFileName,
                url: file.url.replace(fileName, newFileName),
              }
            : file
        )
      );
      setEditingFile(null); // Exit edit mode
    } catch (error) {
      console.error("Failed to rename file:", error);
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const response = await fetch(`/api/files`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      // Remove the file from the UI only after successful deletion
      setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName));
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopiedLink(url); // Set the copied link
        setTimeout(() => setCopiedLink(null), 2000); // Clear the message after 2 seconds
      },
      (err) => {
        console.error("Failed to copy link: ", err);
      }
    );
  };

  useEffect(() => {
    fetchUploadedFiles(); // Fetch files on component mount
  }, []);

  return (
    <Card className="max-w-3xl mx-auto p-4">
      <CardHeader>
        <CardTitle>File Uploader</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
          />
          <ul className="space-y-2">
            {files.map(({ file, name }, index) => (
              <li key={index} className="flex items-center space-x-2">
                <Input
                  defaultValue={name}
                  onChange={(e) => {
                    const newName = e.target.value.trim();
                    setFiles((prev) =>
                      prev.map((f, i) =>
                        i === index ? { ...f, name: newName } : f
                      )
                    );
                  }}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
          <Button onClick={handleUpload} className="w-full">
            Upload Files
          </Button>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Uploaded Files</h3>
            <ul className="space-y-2">
              {uploadedFiles?.map((file) => (
                <li
                  key={file.name}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center space-x-2">
                    {editingFile === file.name ? (
                      <Input
                        defaultValue={file.name}
                        onBlur={(e) =>
                          handleEdit(file.name, e.target.value.trim())
                        }
                        autoFocus
                        className="w-full"
                      />
                    ) : (
                      <Tooltip>
                        <TooltipTrigger>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            {file.name}
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="p-2">
                            <p className="text-sm font-semibold">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              Size: {(file.size / 1024).toFixed(2)} KB
                            </p>
                            <p className="text-xs text-gray-500">
                              Last Modified: {file.lastModified}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    {editingFile === file.name ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingFile(null)}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingFile(file.name)}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(file.name)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(file.url)}
                    >
                      {copiedLink === file.url ? "Copied!" : "Copy Link"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
