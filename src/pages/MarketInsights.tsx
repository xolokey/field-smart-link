import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp, TrendingDown, Activity, Newspaper, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MarketData {
  commodity: string;
  price: number;
  change: number;
  region: string;
}

interface NewsItem {
  title: string;
  summary: string;
  date: string;
  source: string;
}

interface EventItem {
  title: string;
  date: string;
  location: string;
  description: string;
}

const MarketInsights = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<{ latitude: number; longitude: number; name: string } | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const detectLocation = () => {
    setIsLoadingLocation(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const locationName = data.address?.country || data.address?.state || 'Unknown';
            
            setLocation({ latitude, longitude, name: locationName });
            toast.success(`Location detected: ${locationName}`);
            fetchMarketData(latitude, longitude, locationName);
          } catch (error) {
            console.error('Error getting location name:', error);
            setLocation({ latitude, longitude, name: 'Unknown' });
            toast.error("Could not determine location name");
          }
          
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error("Could not access your location");
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
    }
  };

  const fetchMarketData = async (latitude: number, longitude: number, locationName: string) => {
    setIsLoadingData(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('weather-alerts', {
        body: { latitude, longitude, location: locationName }
      });

      if (error) throw error;

      // USD to INR conversion rate (approximate)
      const USD_TO_INR = 83;
      // 1 quintal = 100 kg
      
      const mockMarketData: MarketData[] = [
        { commodity: "Rice (Basmati)", price: 45.20 * USD_TO_INR, change: 2.3, region: locationName },
        { commodity: "Wheat", price: 38.50 * USD_TO_INR, change: -1.2, region: locationName },
        { commodity: "Corn (Maize)", price: 32.80 * USD_TO_INR, change: 0.8, region: locationName },
        { commodity: "Soybeans", price: 52.40 * USD_TO_INR, change: 3.1, region: locationName },
        { commodity: "Cotton", price: 78.90 * USD_TO_INR, change: -0.5, region: locationName },
        { commodity: "Sugarcane", price: 28.50 * USD_TO_INR, change: 1.8, region: locationName },
        { commodity: "Groundnut", price: 65.30 * USD_TO_INR, change: 2.5, region: locationName },
        { commodity: "Turmeric", price: 95.20 * USD_TO_INR, change: -2.1, region: locationName },
        { commodity: "Chilli", price: 88.40 * USD_TO_INR, change: 3.7, region: locationName },
        { commodity: "Onion", price: 25.60 * USD_TO_INR, change: 5.2, region: locationName },
        { commodity: "Tomato", price: 22.30 * USD_TO_INR, change: -4.8, region: locationName },
        { commodity: "Potato", price: 18.70 * USD_TO_INR, change: 1.3, region: locationName }
      ];
      
      setMarketData(mockMarketData);

      const mockNews: NewsItem[] = [
        {
          title: "New Irrigation Technology Reduces Water Usage by 40%",
          summary: "Farmers adopting drip irrigation systems report significant water savings and improved crop yields.",
          date: "2025-10-06",
          source: "Agricultural Times"
        },
        {
          title: "Government Announces Subsidy for Organic Farming",
          summary: "New policy provides financial support for farmers transitioning to organic farming methods.",
          date: "2025-10-05",
          source: "Farm News Daily"
        },
        {
          title: "Rice Prices Expected to Rise in Q4 2025",
          summary: "Market analysts predict a 15% increase in rice prices due to increased global demand.",
          date: "2025-10-04",
          source: "Commodity Market Watch"
        }
      ];

      const mockEvents: EventItem[] = [
        {
          title: "Annual Agricultural Technology Expo",
          date: "2025-10-20",
          location: "Chennai Trade Center",
          description: "Exhibition showcasing latest farming equipment and technologies"
        },
        {
          title: "Organic Farming Workshop",
          date: "2025-10-25",
          location: "Cuddalore District Office",
          description: "Free workshop on transitioning to organic farming practices"
        },
        {
          title: "Crop Insurance Awareness Session",
          date: "2025-11-01",
          location: "Online Webinar",
          description: "Learn about government crop insurance schemes and benefits"
        }
      ];

      setNews(mockNews);
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast.error("Failed to fetch market insights");
    }
    
    setIsLoadingData(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('marketInsights.title')}</h1>
            <p className="text-muted-foreground">{t('marketInsights.subtitle')}</p>
          </div>
          <Button onClick={detectLocation} disabled={isLoadingLocation}>
            <MapPin className="mr-2 h-4 w-4" />
            {isLoadingLocation ? "Detecting..." : t('marketInsights.detectLocation')}
          </Button>
        </div>

        {location && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t('marketInsights.yourLocation')}: {location.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {marketData.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{item.commodity}</span>
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">₹{item.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">/100kg</span>
                  </div>
                  <div className={`flex items-center gap-1 ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-medium">{Math.abs(item.change)}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Region: {item.region}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {news.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              {t('marketInsights.news')}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {news.map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.summary}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {events.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              {t('marketInsights.events')}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{item.date}</span>
                      <span>•</span>
                      <MapPin className="h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!location && !isLoadingData && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Click "Detect My Location" to see market insights for your region
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketInsights;
