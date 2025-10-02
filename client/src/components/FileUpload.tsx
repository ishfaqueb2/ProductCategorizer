import { Upload, FileSpreadsheet, X } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  title: string;
  description: string;
  selectedFile?: File | null;
}

export function FileUpload({
  onFileSelect,
  accept = ".csv,.xlsx",
  title,
  description,
  selectedFile,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = "";
    onFileSelect(null as any);
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer
        hover-elevate
        ${isDragging ? "border-primary bg-primary/5" : "border-border"}
        ${selectedFile ? "bg-card" : ""}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      data-testid="file-upload-zone"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-file"
      />

      {selectedFile ? (
        <div className="flex flex-col items-center">
          <FileSpreadsheet className="h-16 w-16 text-success mb-4" />
          <h3 className="text-lg font-semibold mb-2">{selectedFile.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            data-testid="button-remove-file"
          >
            <X className="h-4 w-4 mr-2" />
            Remove File
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Upload className="h-24 w-24 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="flex gap-2">
            <Badge variant="secondary">CSV</Badge>
            <Badge variant="secondary">XLSX</Badge>
          </div>
        </div>
      )}
    </div>
  );
}
