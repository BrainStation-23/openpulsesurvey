
import { Upload, FileCheck, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { processCSVFile, type ProcessingResult } from "../../utils/csvProcessor";

interface UploadAreaProps {
  isProcessing: boolean;
  onProcessingComplete: (file: File) => void;
}

export function UploadArea({ isProcessing, onProcessingComplete }: UploadAreaProps) {
  const [validationProgress, setValidationProgress] = useState({
    stage: "idle", // idle, reading, validating, complete
    progress: 0,
    rowsProcessed: 0,
    totalRows: 0,
    errors: [] as { row: number; errors: string[] }[]
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      try {
        // Update UI to show file reading stage
        setValidationProgress({
          stage: "reading",
          progress: 10,
          rowsProcessed: 0,
          totalRows: 0,
          errors: []
        });

        // Process the CSV file using the actual processor
        const result = await processCSVFile(selectedFile);

        // Update progress based on actual validation results
        setValidationProgress({
          stage: "validating",
          progress: result.errors.length > 0 ? 75 : 100,
          rowsProcessed: result.newUsers.length + result.existingUsers.length,
          totalRows: result.newUsers.length + result.existingUsers.length,
          errors: result.errors
        });

        // Complete processing
        setValidationProgress({
          stage: "complete",
          progress: 100,
          rowsProcessed: result.newUsers.length + result.existingUsers.length,
          totalRows: result.newUsers.length + result.existingUsers.length,
          errors: result.errors
        });

        // Call the processing complete callback
        onProcessingComplete(selectedFile);

        // Show toast for validation results
        if (result.errors.length > 0) {
          toast.error(`Found ${result.errors.length} validation errors in the CSV file`);
        } else {
          toast.success(`Successfully processed ${result.newUsers.length + result.existingUsers.length} users`);
        }
      } catch (error) {
        console.error("Error processing file:", error);
        toast.error("Failed to process file. Please try again.");
        
        setValidationProgress({
          stage: "idle",
          progress: 0,
          rowsProcessed: 0,
          totalRows: 0,
          errors: []
        });
      }
    }
  };

  const getValidationStatusMessage = () => {
    switch (validationProgress.stage) {
      case "reading":
        return "Reading file contents...";
      case "validating":
        return `Validating rows: ${validationProgress.rowsProcessed} of ${validationProgress.totalRows} rows`;
      case "complete":
        return validationProgress.errors.length > 0 
          ? `Validation complete with ${validationProgress.errors.length} errors` 
          : "Validation complete!";
      default:
        return "Processing file...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-4">
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner />
              <p className="text-sm text-gray-500">{getValidationStatusMessage()}</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">CSV file only</p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isProcessing}
        />
      </label>

      {isProcessing && validationProgress.stage !== "idle" && (
        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{validationProgress.stage === "reading" ? "Reading file" : "Validating data"}</span>
            <span>{validationProgress.progress}%</span>
          </div>
          <Progress 
            value={validationProgress.progress} 
            className="h-2"
            indicatorClassName={validationProgress.stage === "complete" ? "bg-green-500" : undefined}
          />
          
          {validationProgress.stage === "complete" && (
            <div className="flex items-center justify-center text-sm gap-1.5">
              {validationProgress.errors.length > 0 ? (
                <div className="text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  <span>{validationProgress.errors.length} validation errors</span>
                </div>
              ) : (
                <div className="text-green-600 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4" />
                  <span>File validated successfully</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
