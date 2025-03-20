
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useKeyResults } from '@/hooks/okr/useKeyResults';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Check, AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KeyResult, KRStatus, UpdateKeyResultInput } from '@/types/okr';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface KeyResultsListProps {
  objectiveId: string;
}

interface KeyResultCheckInDialogProps {
  keyResult: KeyResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UpdateKeyResultInput, id: string) => void;
}

const KeyResultCheckInDialog = ({ keyResult, open, onOpenChange, onSave }: KeyResultCheckInDialogProps) => {
  const [currentValue, setCurrentValue] = useState<number>(keyResult.currentValue);
  
  // Calculate progress based on current, start and target values
  const calculateProgress = () => {
    if (keyResult.targetValue === keyResult.startValue) return 0;
    const progress = ((currentValue - keyResult.startValue) / (keyResult.targetValue - keyResult.startValue)) * 100;
    return Math.min(Math.max(0, progress), 100); // Clamp between 0-100
  };
  
  const handleSave = () => {
    onSave({
      currentValue,
      progress: Math.round(calculateProgress())
    }, keyResult.id);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-in Progress</DialogTitle>
          <DialogDescription>
            Update the current value for "{keyResult.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-value">Current Value</Label>
            <Input
              id="current-value"
              type="number"
              value={currentValue}
              onChange={(e) => setCurrentValue(Number(e.target.value))}
              min={keyResult.startValue}
              max={keyResult.targetValue}
            />
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>Start: {keyResult.startValue}{keyResult.unit && ` ${keyResult.unit}`}</span>
              <span>Target: {keyResult.targetValue}{keyResult.unit && ` ${keyResult.unit}`}</span>
            </div>
            <Progress 
              value={calculateProgress()} 
              className="h-2" 
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface KeyResultEditDialogProps {
  keyResult: KeyResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UpdateKeyResultInput, id: string) => void;
}

const KeyResultEditDialog = ({ keyResult, open, onOpenChange, onSave }: KeyResultEditDialogProps) => {
  const [title, setTitle] = useState<string>(keyResult.title);
  const [description, setDescription] = useState<string>(keyResult.description || '');
  const [status, setStatus] = useState<KRStatus>(keyResult.status);
  
  const handleSave = () => {
    onSave({
      title,
      description,
      status
    }, keyResult.id);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Key Result</DialogTitle>
          <DialogDescription>
            Update the details for this key result
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as KRStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="on_track">On Track</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const KeyResultsList = ({ objectiveId }: KeyResultsListProps) => {
  const { keyResults, isLoading, updateKeyResult } = useKeyResults(objectiveId);
  const { toast } = useToast();
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResult | null>(null);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'not_started':
        return <Clock className="h-4 w-4 text-slate-400" />;
      default:
        return null;
    }
  };

  const handleCheckIn = (kr: KeyResult) => {
    setSelectedKeyResult(kr);
    setIsCheckInDialogOpen(true);
  };

  const handleEdit = (kr: KeyResult) => {
    setSelectedKeyResult(kr);
    setIsEditDialogOpen(true);
  };

  const handleSaveCheckIn = (data: UpdateKeyResultInput, id: string) => {
    if (!selectedKeyResult) return;
    
    updateKeyResult.mutate({
      ...data,
      id
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Key result updated successfully"
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
      }
    });
  };

  const handleSaveEdit = (data: UpdateKeyResultInput, id: string) => {
    if (!selectedKeyResult) return;
    
    updateKeyResult.mutate({
      ...data,
      id
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Key result updated successfully"
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Key Results</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : keyResults && keyResults.length > 0 ? (
          <div className="space-y-4">
            {keyResults.map((kr) => (
              <div 
                key={kr.id} 
                className="border rounded-md p-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(kr.status)}
                    <h3 className="font-medium">{kr.title}</h3>
                  </div>
                  <Badge variant="outline">{kr.status.replace('_', ' ')}</Badge>
                </div>
                
                {kr.description && (
                  <p className="text-sm text-muted-foreground mb-2">{kr.description}</p>
                )}
                
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{kr.progress}%</span>
                  </div>
                  <Progress value={kr.progress} className="h-1.5" />
                </div>
                
                <div className="flex justify-between items-center mt-4 text-sm">
                  <div>
                    {kr.unit && (
                      <span className="text-muted-foreground">
                        {kr.startValue} → {kr.currentValue} → {kr.targetValue} {kr.unit}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCheckIn(kr)}
                    >
                      Check-in
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(kr)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="flex justify-center mb-2">
              <PlusCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No key results yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add key results to track progress toward this objective
            </p>
          </div>
        )}
      </CardContent>
      
      {selectedKeyResult && (
        <>
          <KeyResultCheckInDialog 
            keyResult={selectedKeyResult}
            open={isCheckInDialogOpen}
            onOpenChange={setIsCheckInDialogOpen}
            onSave={handleSaveCheckIn}
          />
          
          <KeyResultEditDialog 
            keyResult={selectedKeyResult}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSave={handleSaveEdit}
          />
        </>
      )}
    </Card>
  );
};
