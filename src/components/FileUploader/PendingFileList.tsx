import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Check } from "lucide-react"; // Import icons from Lucide

interface PendingFile {
  file: File;
  name: string;
}

interface PendingFileListProps {
  files: PendingFile[];
  setFiles: React.Dispatch<React.SetStateAction<PendingFile[]>>;
}

const PendingFileList: React.FC<PendingFileListProps> = ({
  files,
  setFiles,
}) => {
  const [editingFile, setEditingFile] = useState<string | null>(null); // Track which file is being edited
  const [newFileName, setNewFileName] = useState<string>(""); // Track the new file name during editing

  const handleRenameSubmit = (oldName: string) => {
    if (newFileName.trim() && newFileName !== oldName) {
      setFiles((prev) =>
        prev.map((file) =>
          file.name === oldName ? { ...file, name: newFileName.trim() } : file
        )
      );
    }
    setEditingFile(null); // Exit editing mode
    setNewFileName(""); // Reset the input value
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Pending Files</h3>
      <ul className="space-y-2">
        {files.map((file) => (
          <li
            key={file.name}
            className="flex items-center justify-between space-x-4"
          >
            {editingFile === file.name ? (
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={() => handleRenameSubmit(file.name)} // Submit on blur
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit(file.name); // Submit on Enter
                }}
                autoFocus
                className="w-full border rounded px-2 py-1"
              />
            ) : (
              <span className="text-gray-700">{file.name}</span>
            )}
            <div className="flex space-x-2">
              {/* Edit Button with Icon */}
              {editingFile === file.name ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRenameSubmit(file.name)} // Submit on click
                  className="flex items-center"
                >
                  <Check className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingFile(file.name); // Enter editing mode
                    setNewFileName(file.name); // Pre-fill the input with the current file name
                  }}
                  className="flex items-center"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}

              {/* Remove Button with Icon */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveFile(file.name)}
                className="flex items-center"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingFileList;
