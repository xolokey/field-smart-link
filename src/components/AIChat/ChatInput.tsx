import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Mic, 
  MicOff, 
  Image, 
  FileText, 
  X, 
  Loader2,
  Paperclip,
  Smile
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceInput: () => void;
  onImageUpload: (file: File) => void;
  onDocumentUpload: (file: File) => void;
  isLoading?: boolean;
  isRecording?: boolean;
  selectedImage?: File | null;
  selectedDocument?: File | null;
  onRemoveImage?: () => void;
  onRemoveDocument?: () => void;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onVoiceInput,
  onImageUpload,
  onDocumentUpload,
  isLoading = false,
  isRecording = false,
  selectedImage,
  selectedDocument,
  onRemoveImage,
  onRemoveDocument,
  placeholder = "Ask me anything about agriculture...",
  maxLength = 2000
}: ChatInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend()) {
        onSend();
      }
    }
  };

  const canSend = () => {
    return (value.trim() || selectedImage || selectedDocument) && !isLoading && !isRecording;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image file too large. Maximum size is 10MB.');
        return;
      }
      onImageUpload(file);
    }
    e.target.value = '';
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Document file too large. Maximum size is 10MB.');
        return;
      }
      onDocumentUpload(file);
    }
    e.target.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (!file) return;

    if (file.type.startsWith('image/')) {
      onImageUpload(file);
    } else if (
      file.type === 'application/pdf' ||
      file.type.startsWith('text/') ||
      file.name.endsWith('.doc') ||
      file.name.endsWith('.docx')
    ) {
      onDocumentUpload(file);
    } else {
      toast.error('Unsupported file type. Please upload images, PDFs, or text documents.');
    }
  }, [onImageUpload, onDocumentUpload]);

  const insertSuggestion = (suggestion: string) => {
    const newValue = value + (value ? ' ' : '') + suggestion;
    onChange(newValue);
    textareaRef.current?.focus();
  };

  const quickSuggestions = [
    "What's the best fertilizer for tomatoes?",
    "How to identify pest damage?",
    "When should I harvest corn?",
    "Soil pH requirements for crops",
  ];

  return (
    <Card className={cn(
      'border-2 transition-colors',
      isDragOver && 'border-primary bg-primary/5',
      isRecording && 'border-red-500 bg-red-50'
    )}>
      {/* File Attachments */}
      {(selectedImage || selectedDocument) && (
        <div className="p-3 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {selectedImage && (
              <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
                <Image className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate max-w-32">{selectedImage.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveImage}
                  className="h-5 w-5 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {selectedDocument && (
              <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate max-w-32">{selectedDocument.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveDocument}
                  className="h-5 w-5 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Suggestions */}
      {!value && !selectedImage && !selectedDocument && (
        <div className="p-3 border-b border-border">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground mb-1">Quick suggestions:</span>
            {quickSuggestions.slice(0, 2).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => insertSuggestion(suggestion)}
                className="h-6 text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div
        className="p-3"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex gap-2">
          {/* File Upload Buttons */}
          <div className="flex flex-col gap-1">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageChange}
            />
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleDocumentChange}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              disabled={isLoading || isRecording}
              title="Upload image"
              className="h-8 w-8 p-0"
            >
              <Image className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => documentInputRef.current?.click()}
              disabled={isLoading || isRecording}
              title="Upload document"
              className="h-8 w-8 p-0"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening..." : placeholder}
              className="min-h-[60px] max-h-32 resize-none pr-12"
              disabled={isLoading || isRecording}
              maxLength={maxLength}
            />
            
            {/* Character Count */}
            {value.length > maxLength * 0.8 && (
              <div className="absolute bottom-2 right-2">
                <Badge 
                  variant={value.length >= maxLength ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {value.length}/{maxLength}
                </Badge>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onVoiceInput}
              disabled={isLoading}
              className={cn(
                "h-8 w-8 p-0",
                isRecording && "bg-red-500 text-white hover:bg-red-600"
              )}
              title={isRecording ? "Stop recording" : "Voice input"}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={onSend}
              disabled={!canSend()}
              size="sm"
              className="h-8 w-8 p-0 bg-gradient-primary"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Drag & Drop Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Paperclip className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-primary">Drop files here to upload</p>
              <p className="text-xs text-muted-foreground">Images, PDFs, and documents supported</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}