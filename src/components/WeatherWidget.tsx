import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CloudRain, Sun, Wind, Droplets } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WeatherAlert {
  type: string;
  severity: string;
  message: string;
  action: string;
}

interface WeatherWidgetProps {
  farmId: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export const WeatherWidget = ({ farmId, location, latitude, longitude }: WeatherWidgetProps) => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWeatherAlerts = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('weather-alerts', {
        body: { latitude, longitude, location }
      });

      if (error) throw error;

      if (data.alerts) {
        setAlerts(data.alerts);
        
        // Store alerts in database
        for (const alert of data.alerts) {
          await supabase.from('weather_alerts').insert({
            farm_id: farmId,
            alert_type: alert.type,
            severity: alert.severity,
            message: alert.message,
            action_required: alert.action,
            latitude,
            longitude
          });
        }
      }

      toast.success("Weather alerts updated");
    } catch (error) {
      console.error('Weather alerts error:', error);
      toast.error("Failed to fetch weather alerts");
    }
    
    setIsLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'destructive';
      case 'medium':
      case 'warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'rain':
      case 'flood':
        return <CloudRain className="h-4 w-4" />;
      case 'drought':
      case 'heat':
        return <Sun className="h-4 w-4" />;
      case 'wind':
      case 'storm':
        return <Wind className="h-4 w-4" />;
      default:
        return <Droplets className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('weather.title')}</CardTitle>
          <Button onClick={fetchWeatherAlerts} disabled={isLoading} size="sm">
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.type)}
                    <span className="font-medium">{alert.type}</span>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                {alert.action && (
                  <div className="flex items-start gap-2 text-sm bg-muted p-2 rounded">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{alert.action}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('weather.noAlerts')}</p>
            <Button onClick={fetchWeatherAlerts} className="mt-4" variant="outline">
              Check Weather
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
