import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UploadedFile } from "./types";

interface FileListProps {
  files: UploadedFile[];
  onDelete: (fileName: string) => void;
  onRename: (oldName: string, newName: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onDelete, onRename }) => {
  const [editingFile, setEditingFile] = React.useState<string | null>(null);

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
              onBlur={(e) => {
                onRename(file.name, e.target.value.trim());
                setEditingFile(null);
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingFile(file.name)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(file.name)}
            >
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default FileList;
