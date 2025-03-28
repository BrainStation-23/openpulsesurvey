
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Download, ChevronDown, ChevronUp } from "lucide-react";
import { ProcessingResult } from "../../utils/csvProcessor";
import { ImportError, ImportResult, convertValidationErrorsToImportErrors } from "../../utils/errorReporting";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProcessingResultViewProps {
  processingResult: ProcessingResult | null;
  importResult: ImportResult | null;
  onDownloadErrors: (errors: ImportError[]) => void;
  onStartImport: () => void;
}

export function ProcessingResultView({
  processingResult,
  importResult,
  onDownloadErrors,
  onStartImport,
}: ProcessingResultViewProps) {
  const [errorsExpanded, setErrorsExpanded] = useState(false);
  
  if (!processingResult && !importResult) return null;

  const handleDownloadErrors = () => {
    if (processingResult?.errors) {
      onDownloadErrors(convertValidationErrorsToImportErrors(processingResult.errors));
    } else if (importResult?.errors) {
      onDownloadErrors(importResult.errors);
    }
  };

  const getErrors = (): ImportError[] => {
    if (processingResult?.errors) {
      return convertValidationErrorsToImportErrors(processingResult.errors);
    } else if (importResult?.errors) {
      return importResult.errors;
    }
    return [];
  };

  const errors = getErrors();

  return (
    <div className="space-y-4">
      {processingResult && !importResult && (
        <>
          <Alert variant={processingResult.errors.length > 0 ? "destructive" : "default"}>
            <AlertDescription className="flex items-center gap-2">
              {processingResult.errors.length > 0 ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Found {processingResult.errors.length} validation errors
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  File validated successfully
                </>
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              New users to create: {processingResult.newUsers.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Existing users to update: {processingResult.existingUsers.length}
            </p>
          </div>

          {processingResult.errors.length > 0 && (
            <Collapsible 
              open={errorsExpanded} 
              onOpenChange={setErrorsExpanded}
              className="border rounded-md"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-3 text-sm"
                >
                  <span>View {processingResult.errors.length} Errors</span>
                  {errorsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ScrollArea className="h-[200px] p-3 border-t">
                  <ul className="space-y-2">
                    {errors.map((error, index) => (
                      <li key={index} className="border-b border-gray-100 pb-2 text-sm">
                        <span className="font-medium">Row {error.row}: </span>
                        <span className="text-red-600">{error.message}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="flex space-x-2">
            {processingResult.errors.length > 0 && (
              <Button
                onClick={handleDownloadErrors}
                className="flex-1"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Error Report
              </Button>
            )}

            <Button
              onClick={onStartImport}
              className={processingResult.errors.length > 0 ? "flex-1" : "w-full"}
              disabled={processingResult.errors.length > 0}
            >
              Start Import
            </Button>
          </div>
        </>
      )}

      {importResult && (
        <div className="space-y-4">
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Import completed: {importResult.successful} successful, {importResult.failed} failed
            </AlertDescription>
          </Alert>

          {importResult.failed > 0 && (
            <>
              <Collapsible 
                open={errorsExpanded} 
                onOpenChange={setErrorsExpanded}
                className="border rounded-md"
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full flex items-center justify-between p-3 text-sm"
                  >
                    <span>View {importResult.failed} Failed Imports</span>
                    {errorsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ScrollArea className="h-[200px] p-3 border-t">
                    <ul className="space-y-2">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="border-b border-gray-100 pb-2 text-sm">
                          <span className="font-medium">Row {error.row}: </span>
                          <span className="text-red-600">{error.message}</span>
                          {error.data && (
                            <div className="mt-1 text-xs text-gray-500 pl-4">
                              {Object.entries(error.data)
                                .filter(([_, value]) => value)
                                .map(([key, value]) => (
                                  <div key={key}>{key}: {value}</div>
                                ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>

              <Button
                onClick={handleDownloadErrors}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Error Report
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
