import { FileUpload } from "../FileUpload";
import { useState } from "react";

export default function FileUploadExample() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="max-w-2xl">
      <FileUpload
        title="Drag and drop your product file here"
        description="or click to browse"
        selectedFile={file}
        onFileSelect={(f) => {
          console.log("File selected:", f?.name);
          setFile(f);
        }}
      />
    </div>
  );
}
