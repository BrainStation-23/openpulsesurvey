
import { Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProcessingProgress } from "./ProcessingProgress";
import { type ProcessingProgressEvent } from "../../utils/csvProcessor";

interface UploadAreaProps {
  isProcessing: boolean;
  processingProgress: ProcessingProgressEvent | null;
  onProcessingComplete: (file: File) => void;
}

export function UploadArea({ isProcessing, processingProgress, onProcessingComplete }: UploadAreaProps) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onProcessingComplete(selectedFile);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {isProcessing ? (
        <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <ProcessingProgress progress={processingProgress} />
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">CSV file only</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </label>
      )}
    </div>
  );
}
