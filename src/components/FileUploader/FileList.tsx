import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UploadedFile } from "./types";
import { Clipboard, Edit, Trash, Check } from "lucide-react"; // Import icons from Lucide

interface FileListProps {
  files: UploadedFile[];
  onDelete: (fileName: string) => void;
  onRename: (oldName: string, newName: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onDelete, onRename }) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null); // Track which link was copied
  const [tooltipOpen, setTooltipOpen] = useState<string | null>(null); // Track which tooltip is open
  const [editingFile, setEditingFile] = useState<string | null>(null); // Track which file is being edited
  const [newFileName, setNewFileName] = useState<string>(""); // Track the new file name during editing

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(url); // Set the copied link
      setTooltipOpen(url); // Keep the tooltip open
      setTimeout(() => {
        setCopiedLink(null); // Reset the copied state
        setTooltipOpen(null); // Close the tooltip
      }, 2000); // Clear the state after 2 seconds
    });
  };

  const handleRenameSubmit = (fileName: string) => {
    if (newFileName.trim() && newFileName !== fileName) {
      onRename(fileName, newFileName.trim());
    }
    setEditingFile(null); // Exit editing mode
    setNewFileName(""); // Reset the input value
  };

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li
          key={file.name}
          className="flex items-center justify-between space-x-4"
        >
          {editingFile === file.name ? (
            <input
              type="text"
              defaultValue={file.name}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={() => handleRenameSubmit(file.name)} // Submit on blur
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit(file.name); // Submit on Enter
              }}
              autoFocus
              className="w-full border rounded px-2 py-1"
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
          <div className="flex space-x-2">
            {/* Edit Button with Icon */}
            {editingFile === file.name ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRenameSubmit(file.name)} // Submit on click
                    className="flex items-center"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="p-2 text-sm font-semibold">Submit</div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingFile(file.name)} // Enter editing mode
                    className="flex items-center"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="p-2 text-sm font-semibold">Edit</div>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Delete Button with Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(file.name)}
                  className="flex items-center"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="p-2 text-sm font-semibold">Delete</div>
              </TooltipContent>
            </Tooltip>

            {/* Copy Link Button with Icon */}
            <Tooltip
              open={tooltipOpen === file.url} // Keep tooltip open after clicking
              onOpenChange={(isOpen) => {
                if (!isOpen) setTooltipOpen(null); // Close tooltip manually
              }}
            >
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(file.url)}
                  className="flex items-center"
                >
                  <Clipboard className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="p-2 text-sm font-semibold">
                  {copiedLink === file.url ? "Copied!" : "Copy to Clipboard"}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default FileList;
