import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CropHealthMonitorProps {
  farmId: string;
  onComplete?: () => void;
}

export const CropHealthMonitor = ({ farmId, onComplete }: CropHealthMonitorProps) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const handleImageCapture = async (file: File) => {
    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${farmId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('crop-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('crop-images')
        .getPublicUrl(fileName);

      setCapturedImages(prev => [...prev, publicUrl]);
      toast.success("Image uploaded successfully");

      // Analyze the image with AI
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result?.toString().split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('ai-agronomist', {
          body: {
            messages: [{ role: 'user', content: 'Analyze this crop image for health, pests, diseases, and provide recommendations.' }],
            image: base64Image
          }
        });

        if (error) {
          console.error('AI analysis error:', error);
        }
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload image");
    }
    
    setIsUploading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('farms.cropHealth')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => document.getElementById('crop-camera-input')?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Camera className="mr-2 h-4 w-4" />
            )}
            {t('farms.takePhoto')}
          </Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById('crop-upload-input')?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {t('farms.uploadImage')}
          </Button>
        </div>

        <input
          id="crop-camera-input"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageCapture(file);
          }}
        />
        <input
          id="crop-upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageCapture(file);
          }}
        />

        {capturedImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {capturedImages.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Crop ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {capturedImages.length > 0 && onComplete && (
          <Button onClick={onComplete} className="w-full">
            Complete
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
