"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  fetchUploadedFiles,
  uploadFile,
  deleteFile,
  renameFile,
} from "@/lib/utils";
import { UploadedFile, PendingFile } from "@/app/types";
import PendingFileList from "./PendingFileList";
import FileList from "./FileList";

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch uploaded files on mount
  useEffect(() => {
    const loadFiles = async () => {
      const files = await fetchUploadedFiles();
      setUploadedFiles(files);
    };
    loadFiles();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        file,
        name: file.name,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleUpload = async () => {
    for (const { file, name } of files) {
      try {
        setUploadStatus((prev) => ({ ...prev, [name]: "uploading" }));
        await uploadFile(file, name);
        setUploadStatus((prev) => ({ ...prev, [name]: "success" }));
      } catch (error) {
        console.error("Error uploading file:", error);
        setUploadStatus((prev) => ({ ...prev, [name]: "error" }));
      }
    }
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    const updatedFiles = await fetchUploadedFiles();
    setUploadedFiles(updatedFiles);
  };

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
          <PendingFileList files={files} setFiles={setFiles} />
          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={files.length === 0}
          >
            Upload Files
          </Button>
          <div className="space-y-2">
            {files.map(({ name }) => (
              <div key={name} className="space-y-1">
                <p className="text-sm">{name}</p>
                <div className="w-full bg-gray-200 rounded h-2">
                  {uploadStatus[name] && ( // Only show the progress bar if uploadStatus exists for the file
                    <div
                      className={`h-2 rounded ${
                        uploadStatus[name] === "uploading"
                          ? "bg-blue-500 animate-pulse"
                          : uploadStatus[name] === "success"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width:
                          uploadStatus[name] === "uploading"
                            ? "50%"
                            : uploadStatus[name] === "success"
                            ? "100%"
                            : "0%",
                      }}
                    ></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <FileList
            files={uploadedFiles}
            onDelete={async (fileName) => {
              await deleteFile(fileName);
              setUploadedFiles((prev) =>
                prev.filter((file) => file.name !== fileName)
              );
            }}
            onRename={async (oldName, newName) => {
              await renameFile(oldName, newName);
              setUploadedFiles((prev) =>
                prev.map((file) =>
                  file.name === oldName
                    ? {
                        ...file,
                        name: newName,
                        url: file.url.replace(oldName, newName),
                      }
                    : file
                )
              );
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
