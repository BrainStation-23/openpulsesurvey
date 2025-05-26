
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TextResponsesViewerProps {
  questionTitle: string;
  responses: string[];
  onClose: () => void;
}

export function TextResponsesViewer({ questionTitle, responses, onClose }: TextResponsesViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const filteredResponses = searchQuery 
    ? responses.filter(response => 
        response.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : responses;
    
  const handleExport = () => {
    // Log export action
    console.log('Exporting text responses for:', questionTitle);
    
    // Create CSV content
    const csvContent = 
      'Response\n' + 
      responses.map(response => `"${response.replace(/"/g, '""')}"`).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${questionTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export completed",
      description: `${responses.length} responses have been exported to CSV.`,
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{questionTitle}</CardTitle>
          <CardDescription>
            {responses.length} text {responses.length === 1 ? 'response' : 'responses'}
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search responses..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        
        <div className="rounded-md border">
          <ScrollArea className="h-[400px] rounded-md">
            {filteredResponses.length > 0 ? (
              <div className="p-4 space-y-4">
                {filteredResponses.map((response, index) => (
                  <div key={index} className="p-3 rounded-md bg-muted/50">
                    <p className="text-sm">{response}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery 
                  ? "No responses match your search criteria." 
                  : "No text responses available."}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
