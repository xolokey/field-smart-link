import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  User, 
  Volume2, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Share2,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  metadata?: {
    model?: string;
    tokens?: number;
    confidence?: number;
    processingTime?: number;
  };
}

interface ChatMessageProps {
  message: ChatMessage;
  onSpeak?: (text: string) => void;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  isStreaming?: boolean;
}

export function ChatMessage({ 
  message, 
  onSpeak, 
  onFeedback,
  isStreaming = false 
}: ChatMessageProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success('Message copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Agricultural Advice',
          text: message.content,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      handleCopy();
    }
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    onFeedback?.(message.id, type);
    toast.success(`Thank you for your feedback!`);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 group',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
          <Leaf className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={cn(
        'flex flex-col gap-2 max-w-[85%] md:max-w-[75%]',
        message.role === 'user' && 'items-end'
      )}>
        {/* Message Content */}
        <Card className={cn(
          'p-4 relative',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted border-border',
          isStreaming && 'animate-pulse'
        )}>
          {message.imageUrl && (
            <img 
              src={message.imageUrl} 
              alt="Uploaded content" 
              className="max-w-xs rounded-lg mb-3 border border-border" 
            />
          )}
          
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm whitespace-pre-wrap leading-relaxed m-0">
              {message.content}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
              )}
            </p>
          </div>

          {/* Metadata */}
          {message.metadata && (
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
              {message.metadata.confidence && (
                <Badge variant="secondary" className="text-xs">
                  Confidence: {Math.round(message.metadata.confidence * 100)}%
                </Badge>
              )}
              {message.metadata.processingTime && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {message.metadata.processingTime}ms
                </Badge>
              )}
            </div>
          )}
        </Card>

        {/* Message Actions */}
        <div className={cn(
          'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
          message.role === 'user' && 'flex-row-reverse'
        )}>
          <span className="text-xs text-muted-foreground px-2">
            {formatTime(message.timestamp)}
          </span>

          {message.role === 'assistant' && (
            <>
              {onSpeak && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSpeak(message.content)}
                  className="h-7 px-2"
                  title="Read aloud"
                >
                  <Volume2 className="h-3 w-3" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2"
                title="Copy message"
              >
                <Copy className="h-3 w-3" />
              </Button>

              {onFeedback && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback('positive')}
                    className={cn(
                      'h-7 px-2',
                      feedback === 'positive' && 'text-green-600 bg-green-50'
                    )}
                    title="Helpful"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback('negative')}
                    className={cn(
                      'h-7 px-2',
                      feedback === 'negative' && 'text-red-600 bg-red-50'
                    )}
                    title="Not helpful"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-3 w-3 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="h-3 w-3 mr-2" />
                    Copy
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="h-4 w-4 text-secondary" />
        </div>
      )}
    </div>
  );
}