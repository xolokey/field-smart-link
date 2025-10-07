import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Leaf, User, Mic, MicOff, Image, FileText, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AudioRecorder, blobToBase64 } from "@/utils/audioRecorder";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

const AIAdvisor = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI agricultural advisor. I can help you with crop management, pest control, soil health, irrigation, and more. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRecorder = useRef<AudioRecorder>(new AudioRecorder());
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceInput = async () => {
    if (isRecording) {
      try {
        const audioBlob = await audioRecorder.current.stop();
        setIsRecording(false);
        
        toast.info(t('aiAdvisor.processing'));
        
        const base64Audio = await blobToBase64(audioBlob);
        
        const { data, error } = await supabase.functions.invoke('voice-transcribe', {
          body: { audio: base64Audio, language: i18n.language }
        });

        if (error) throw error;
        
        setInput(data.text);
        toast.success("Transcription complete");
      } catch (error) {
        console.error('Voice input error:', error);
        toast.error("Voice input failed");
      }
    } else {
      try {
        await audioRecorder.current.start();
        setIsRecording(true);
        toast.info(t('aiAdvisor.listening'));
      } catch (error) {
        console.error('Microphone error:', error);
        toast.error("Could not access microphone");
      }
    }
  };

  const handleSpeak = async (text: string) => {
    try {
      console.log('Starting TTS for text:', text.substring(0, 50) + '...');
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: text.substring(0, 1000), language: i18n.language }
      });

      console.log('TTS response:', { hasData: !!data, error });

      if (error) {
        console.error('TTS error:', error);
        throw error;
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      await audio.play();
      console.log('Audio playback started');
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error("Voice output failed. Please check console for details.");
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage && !selectedDoc) || isLoading) return;

    const userMessage: Message = { 
      role: "user", 
      content: input || (selectedImage ? "Image analysis request" : "Document analysis request")
    };
    
    if (selectedImage) {
      userMessage.imageUrl = URL.createObjectURL(selectedImage);
    }

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const SUPABASE_URL = (import.meta as any)?.env?.VITE_SUPABASE_URL || 'https://mkwoefwcndwfxzlwfpnn.supabase.co';
      const SUPABASE_KEY = (import.meta as any)?.env?.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rd29lZndjbmR3Znh6bHdmcG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NzQyMjUsImV4cCI6MjA3NTA1MDIyNX0.quh7s_D3ZBPgg0hg0g8nK-qvjYyVf8idhiOrGRwlavk';
      const CHAT_URL = `${SUPABASE_URL}/functions/v1/ai-agronomist`;
      
      let bodyData: any = { 
        messages: [...messages, userMessage].map(m => ({ 
          role: m.role, 
          content: m.content 
        })),
        language: i18n.language
      };

      if (selectedImage) {
        const base64Image = await blobToBase64(selectedImage);
        bodyData.image = base64Image;
      }

      if (selectedDoc) {
        const base64Doc = await blobToBase64(selectedDoc);
        bodyData.document = base64Doc;
        bodyData.documentName = selectedDoc.name;
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (response.status === 402) {
          toast.error("AI usage credits exhausted. Please add credits to continue.");
        } else {
          throw new Error("Failed to get response");
        }
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let textBuffer = "";
      let streamDone = false;

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setSelectedImage(null);
      setSelectedDoc(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get response from AI advisor");
      setMessages(prev => prev.slice(0, -1));
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('aiAdvisor.title')}</h1>
            <p className="text-muted-foreground">{t('aiAdvisor.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => i18n.changeLanguage('en')}
              className={i18n.language === 'en' ? 'bg-primary text-primary-foreground' : ''}
            >
              English
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => i18n.changeLanguage('ta')}
              className={i18n.language === 'ta' ? 'bg-primary text-primary-foreground' : ''}
            >
              தமிழ்
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => i18n.changeLanguage('hi')}
              className={i18n.language === 'hi' ? 'bg-primary text-primary-foreground' : ''}
            >
              हिंदी
            </Button>
          </div>
        </div>

        <Card className="flex flex-col h-[calc(100vh-250px)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div
                    className={`rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.imageUrl && (
                      <img src={message.imageUrl} alt="Uploaded" className="max-w-xs rounded mb-2" />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "assistant" && message.content && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpeak(message.content)}
                      className="self-start"
                      title={t('aiAdvisor.voiceOutput')}
                    >
                      <Volume2 className="h-3 w-3 mr-1" />
                      {t('aiAdvisor.voiceOutput')}
                    </Button>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-secondary" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">{t('aiAdvisor.thinking')}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4 space-y-2">
            {(selectedImage || selectedDoc) && (
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                {selectedImage && <span>📷 {selectedImage.name}</span>}
                {selectedDoc && <span>📄 {selectedDoc.name}</span>}
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              />
              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => setSelectedDoc(e.target.files?.[0] || null)}
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => imageInputRef.current?.click()}
                disabled={isLoading}
                title={t('aiAdvisor.uploadImage')}
              >
                <Image className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => docInputRef.current?.click()}
                disabled={isLoading}
                title={t('aiAdvisor.uploadDocument')}
              >
                <FileText className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
                title={t('aiAdvisor.voiceInput')}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>

              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t('aiAdvisor.placeholder')}
                className="min-h-[60px] resize-none flex-1"
                disabled={isLoading || isRecording}
              />
              
              <Button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage && !selectedDoc) || isLoading || isRecording}
                className="bg-gradient-primary"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIAdvisor;
