import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Plus, Camera, Upload, Loader as Loader2, CircleAlert as AlertCircle } from "lucide-react";

interface Farm {
  id: string;
  name: string;
  location: string;
  size_hectares: number;
  latitude?: number | null;
  longitude?: number | null;
}

interface Crop {
  id: string;
  name: string;
  variety: string;
  planting_date: string;
  expected_harvest_date: string;
  area_hectares: number;
  status: string;
}

interface CropMonitoring {
  id: string;
  crop_id: string;
  monitoring_date: string;
  health_score: number;
  soil_moisture: number;
  temperature: number;
  notes: string;
  image_urls: string[];
  alert_level: string;
}

interface WeatherAlert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  action_required: string;
  created_at: string;
  is_active: boolean;
}

const FarmDetails = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [monitoring, setMonitoring] = useState<CropMonitoring[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [isAddMonitoringOpen, setIsAddMonitoringOpen] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [cropFormData, setCropFormData] = useState({
    name: "",
    variety: "",
    planting_date: "",
    expected_harvest_date: "",
    area_hectares: "",
  });

  const [monitoringFormData, setMonitoringFormData] = useState({
    health_score: "",
    soil_moisture: "",
    temperature: "",
    notes: "",
    images: [] as File[],
  });

  useEffect(() => {
    if (farmId) {
      loadFarmDetails();
      loadCrops();
      loadMonitoring();
      loadAlerts();
    }
  }, [farmId]);

  const loadFarmDetails = async () => {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('id', farmId)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load farm details");
      console.error(error);
    } else {
      setFarm(data);
    }
  };

  const loadCrops = async () => {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load crops");
      console.error(error);
    } else {
      setCrops(data || []);
    }
  };

  const loadMonitoring = async () => {
    const { data, error } = await supabase
      .from('crop_monitoring')
      .select(`
        *,
        crops!inner(farm_id)
      `)
      .eq('crops.farm_id', farmId)
      .order('monitoring_date', { ascending: false });

    if (error) {
      toast.error("Failed to load monitoring data");
      console.error(error);
    } else {
      setMonitoring(data || []);
    }
  };

  const loadAlerts = async () => {
    const { data, error } = await supabase
      .from('weather_alerts')
      .select('*')
      .eq('farm_id', farmId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setAlerts(data || []);
    }
  };

  const handleShareLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const { error } = await supabase
          .from('farms')
          .update({ latitude, longitude })
          .eq('id', farmId);

        if (error) {
          toast.error("Failed to update location");
          console.error(error);
        } else {
          toast.success("Location updated successfully");
          loadFarmDetails();
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        toast.error("Failed to get location: " + error.message);
        setIsLoadingLocation(false);
      }
    );
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('crops')
      .insert([
        {
          farm_id: farmId,
          name: cropFormData.name,
          variety: cropFormData.variety,
          planting_date: cropFormData.planting_date,
          expected_harvest_date: cropFormData.expected_harvest_date,
          area_hectares: parseFloat(cropFormData.area_hectares),
        }
      ]);

    if (error) {
      toast.error("Failed to add crop");
      console.error(error);
    } else {
      toast.success("Crop added successfully");
      setIsAddCropOpen(false);
      setCropFormData({ name: "", variety: "", planting_date: "", expected_harvest_date: "", area_hectares: "" });
      loadCrops();
    }
  };

  const uploadImages = async (cropId: string, files: File[]): Promise<string[]> => {
    const imageUrls: string[] = [];
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return imageUrls;

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${cropId}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('crop-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error("Failed to upload image:", uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('crop-images')
        .getPublicUrl(fileName);

      imageUrls.push(publicUrl);
    }

    return imageUrls;
  };

  const handleAddMonitoring = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCropId) {
      toast.error("Please select a crop");
      return;
    }

    setUploadingImages(true);
    const imageUrls = await uploadImages(selectedCropId, monitoringFormData.images);
    setUploadingImages(false);

    const { error } = await supabase
      .from('crop_monitoring')
      .insert([
        {
          crop_id: selectedCropId,
          health_score: parseInt(monitoringFormData.health_score),
          soil_moisture: parseFloat(monitoringFormData.soil_moisture),
          temperature: parseFloat(monitoringFormData.temperature),
          notes: monitoringFormData.notes,
          image_urls: imageUrls,
          alert_level: parseInt(monitoringFormData.health_score) < 50 ? 'critical' :
                      parseInt(monitoringFormData.health_score) < 70 ? 'warning' : 'normal',
        }
      ]);

    if (error) {
      toast.error("Failed to add monitoring data");
      console.error(error);
    } else {
      toast.success("Monitoring data added successfully");
      setIsAddMonitoringOpen(false);
      setMonitoringFormData({ health_score: "", soil_moisture: "", temperature: "", notes: "", images: [] });
      setSelectedCropId("");
      loadMonitoring();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMonitoringFormData({ ...monitoringFormData, images: files });
  };

  if (!farm) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/farms')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{farm.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>{farm.location}</span>
                {farm.latitude && farm.longitude && (
                  <Badge variant="outline" className="ml-2">GPS Enabled</Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleShareLocation}
            disabled={isLoadingLocation}
            variant="outline"
          >
            {isLoadingLocation ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="mr-2 h-4 w-4" />
            )}
            {farm.latitude ? 'Update Location' : 'Share Location'}
          </Button>
        </div>

        {alerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <AlertCircle className="h-5 w-5" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 bg-white rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        {alert.alert_type}
                      </Badge>
                      <span className="text-sm font-medium">{alert.severity}</span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    {alert.action_required && (
                      <p className="text-sm text-orange-700 font-medium">Action: {alert.action_required}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="crops" className="space-y-4">
          <TabsList>
            <TabsTrigger value="crops">Crops</TabsTrigger>
            <TabsTrigger value="monitoring">Health Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="crops" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Active Crops</h2>
              <Dialog open={isAddCropOpen} onOpenChange={setIsAddCropOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Crop
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Crop</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddCrop} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="crop-name">Crop Name</Label>
                      <Input
                        id="crop-name"
                        value={cropFormData.name}
                        onChange={(e) => setCropFormData({ ...cropFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="variety">Variety</Label>
                      <Input
                        id="variety"
                        value={cropFormData.variety}
                        onChange={(e) => setCropFormData({ ...cropFormData, variety: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="planting-date">Planting Date</Label>
                      <Input
                        id="planting-date"
                        type="date"
                        value={cropFormData.planting_date}
                        onChange={(e) => setCropFormData({ ...cropFormData, planting_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="harvest-date">Expected Harvest Date</Label>
                      <Input
                        id="harvest-date"
                        type="date"
                        value={cropFormData.expected_harvest_date}
                        onChange={(e) => setCropFormData({ ...cropFormData, expected_harvest_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Area (Hectares)</Label>
                      <Input
                        id="area"
                        type="number"
                        step="0.01"
                        value={cropFormData.area_hectares}
                        onChange={(e) => setCropFormData({ ...cropFormData, area_hectares: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-primary">
                      Add Crop
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {crops.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No crops added yet</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crops.map((crop) => (
                  <Card key={crop.id}>
                    <CardHeader>
                      <CardTitle>{crop.name}</CardTitle>
                      <CardDescription>{crop.variety}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Area:</span>
                        <span className="font-medium">{crop.area_hectares} hectares</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Planted:</span>
                        <span className="font-medium">{new Date(crop.planting_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Harvest:</span>
                        <span className="font-medium">{new Date(crop.expected_harvest_date).toLocaleDateString()}</span>
                      </div>
                      <Badge variant={crop.status === 'active' ? 'default' : 'secondary'}>
                        {crop.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Health Monitoring</h2>
              <Dialog open={isAddMonitoringOpen} onOpenChange={setIsAddMonitoringOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary" disabled={crops.length === 0}>
                    <Camera className="mr-2 h-4 w-4" />
                    Add Monitoring
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Weekly Crop Health Monitoring</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddMonitoring} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="crop-select">Select Crop</Label>
                      <select
                        id="crop-select"
                        className="w-full p-2 border rounded-md"
                        value={selectedCropId}
                        onChange={(e) => setSelectedCropId(e.target.value)}
                        required
                      >
                        <option value="">Choose a crop...</option>
                        {crops.map((crop) => (
                          <option key={crop.id} value={crop.id}>
                            {crop.name} - {crop.variety}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="health-score">Health Score (0-100)</Label>
                      <Input
                        id="health-score"
                        type="number"
                        min="0"
                        max="100"
                        value={monitoringFormData.health_score}
                        onChange={(e) => setMonitoringFormData({ ...monitoringFormData, health_score: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="soil-moisture">Soil Moisture (%)</Label>
                      <Input
                        id="soil-moisture"
                        type="number"
                        step="0.01"
                        value={monitoringFormData.soil_moisture}
                        onChange={(e) => setMonitoringFormData({ ...monitoringFormData, soil_moisture: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={monitoringFormData.temperature}
                        onChange={(e) => setMonitoringFormData({ ...monitoringFormData, temperature: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="images">Crop Images</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <input
                          id="images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <label htmlFor="images" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {monitoringFormData.images.length > 0
                              ? `${monitoringFormData.images.length} image(s) selected`
                              : 'Click to upload crop images'}
                          </p>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={monitoringFormData.notes}
                        onChange={(e) => setMonitoringFormData({ ...monitoringFormData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-primary" disabled={uploadingImages}>
                      {uploadingImages ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading Images...
                        </>
                      ) : (
                        'Add Monitoring Data'
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {monitoring.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No monitoring data yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {monitoring.map((record) => {
                  const crop = crops.find(c => c.id === record.crop_id);
                  return (
                    <Card key={record.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{crop?.name || 'Unknown Crop'}</CardTitle>
                          <Badge variant={
                            record.alert_level === 'critical' ? 'destructive' :
                            record.alert_level === 'warning' ? 'default' : 'secondary'
                          }>
                            {record.alert_level}
                          </Badge>
                        </div>
                        <CardDescription>
                          {new Date(record.monitoring_date).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Health Score</p>
                            <p className="text-2xl font-bold">{record.health_score}</p>
                          </div>
                          {record.soil_moisture && (
                            <div>
                              <p className="text-sm text-muted-foreground">Soil Moisture</p>
                              <p className="text-2xl font-bold">{record.soil_moisture}%</p>
                            </div>
                          )}
                          {record.temperature && (
                            <div>
                              <p className="text-sm text-muted-foreground">Temperature</p>
                              <p className="text-2xl font-bold">{record.temperature}°C</p>
                            </div>
                          )}
                        </div>
                        {record.notes && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                            <p className="text-sm">{record.notes}</p>
                          </div>
                        )}
                        {record.image_urls && record.image_urls.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Images:</p>
                            <div className="grid grid-cols-3 gap-2">
                              {record.image_urls.map((url, idx) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`Crop monitoring ${idx + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FarmDetails;
