
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";

interface NotificationDialogProps {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onSend: (message: string) => void;
  isSending: boolean;
  isAnonymous: boolean;
}

export function NotificationDialog({
  isOpen,
  selectedCount,
  onClose,
  onSend,
  isSending,
  isAnonymous,
}: NotificationDialogProps) {
  const [customMessage, setCustomMessage] = useState("");

  const handleSend = () => {
    onSend(customMessage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Assignment Notification
          </DialogTitle>
          <DialogDescription>
            You are about to send assignment notifications to {selectedCount}{" "}
            {selectedCount === 1 ? "recipient" : "recipients"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isAnonymous ? (
            <div className="rounded-md bg-green-50 p-4 text-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-green-500">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-green-800">Anonymous Survey</h3>
                  <p className="mt-1 text-green-700">
                    Recipients will be informed that their responses will remain anonymous.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-red-50 p-4 text-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-red-500">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-red-800">Non-Anonymous Survey</h3>
                  <p className="mt-1 text-red-700">
                    Recipients will be warned that their responses are not anonymous.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Add a custom message (optional)</h4>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter an optional message to include in the notification email..."
              className="h-24"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? "Sending..." : "Send Notifications"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
