"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const FileUploader = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; url: string; size?: number; lastModified?: string }[]
  >([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const uploadFileToR2 = async (file: File) => {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
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

      // Construct the public URL
      const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${file.name}`;

      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          url: publicUrl,
          size: file.size,
          lastModified: new Date().toLocaleString(),
        },
      ]);
      setUploadStatus((prev) => ({ ...prev, [file.name]: "success" }));
    } catch (error) {
      console.error(error);
      setUploadStatus((prev) => ({ ...prev, [file.name]: "error" }));
    }
  };

  const handleUpload = () => {
    files.forEach((file) => {
      if (!uploadStatus[file.name]) {
        setUploadStatus((prev) => ({ ...prev, [file.name]: "uploading" }));
        uploadFileToR2(file);
      }
    });
  };

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch("/api/files");
      if (!response.ok) {
        throw new Error("Failed to fetch uploaded files");
      }

      const { files } = await response.json();

      // Construct public URLs for the files
      const updatedFiles = files?.map((file: any) => ({
        ...file,
        url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${file.name}`,
      }));

      setUploadedFiles(updatedFiles);
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
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

  const handleEdit = async (fileName: string, newFileName: string) => {
    try {
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
    } catch (error) {
      console.error("Failed to rename file:", error);
    }
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  return (
    <Card className="max-w-3xl mx-auto p-4">
      <CardHeader>
        <CardTitle>File Uploader</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input type="file" multiple onChange={handleFileChange} />
          <Button onClick={handleUpload} className="w-full">
            Upload Files
          </Button>
          <div className="space-y-2">
            {files?.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between"
              >
                <p className="text-sm">{file.name}</p>
                <Progress
                  value={
                    uploadStatus[file.name] === "success"
                      ? 100
                      : uploadStatus[file.name] === "uploading"
                      ? 50
                      : 0
                  }
                  className="w-1/2"
                />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Uploaded Files</h3>
            <ul className="space-y-2">
              {uploadedFiles?.map((file) => (
                <li
                  key={file.name}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center space-x-2">
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
                          {file.url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-32 h-32 object-cover rounded"
                            />
                          ) : (
                            <p className="text-sm font-semibold">{file.name}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Size: {(file.size / 1024).toFixed(2)} KB
                          </p>
                          <p className="text-xs text-gray-500">
                            Last Modified: {file.lastModified}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newFileName = prompt(
                          "Enter new file name:",
                          file.name
                        );
                        if (newFileName) handleEdit(file.name, newFileName);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(file.name)}
                    >
                      Delete
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
