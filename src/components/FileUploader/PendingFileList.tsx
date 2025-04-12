import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PendingFile } from "./types";

interface PendingFileListProps {
  files: PendingFile[];
  setFiles: React.Dispatch<React.SetStateAction<PendingFile[]>>;
}

const PendingFileList: React.FC<PendingFileListProps> = ({
  files,
  setFiles,
}) => {
  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number, newName: string) => {
    setFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, name: newName } : file))
    );
  };

  return (
    <ul className="space-y-2">
      {files.map(({ name }, index) => (
        <li key={index} className="flex items-center justify-between space-x-4">
          <Input
            value={name}
            onChange={(e) => handleEdit(index, e.target.value)}
            className="w-full"
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleRemove(index)}
          >
            Remove
          </Button>
        </li>
      ))}
    </ul>
  );
};

export default PendingFileList;
