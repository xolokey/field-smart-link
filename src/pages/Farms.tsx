import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, Maximize2 } from "lucide-react";
import { toast } from "sonner";

interface Farm {
  id: string;
  name: string;
  location: string;
  size_hectares: number;
  created_at: string;
}

const Farms = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    size_hectares: "",
  });

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load farms");
      console.error(error);
    } else {
      setFarms(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('farms')
      .insert([
        {
          user_id: user.id,
          name: formData.name,
          location: formData.location,
          size_hectares: parseFloat(formData.size_hectares),
        }
      ]);

    if (error) {
      toast.error("Failed to create farm");
      console.error(error);
    } else {
      toast.success("Farm created successfully");
      setIsOpen(false);
      setFormData({ name: "", location: "", size_hectares: "" });
      loadFarms();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Farms</h1>
            <p className="text-muted-foreground">Manage your agricultural operations</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Farm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Farm</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Farm Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size (Hectares)</Label>
                  <Input
                    id="size"
                    type="number"
                    step="0.01"
                    value={formData.size_hectares}
                    onChange={(e) => setFormData({ ...formData, size_hectares: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary">
                  Create Farm
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {farms.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No farms yet</h3>
              <p className="text-muted-foreground">
                Get started by adding your first farm to begin tracking your agricultural operations
              </p>
              <Button onClick={() => setIsOpen(true)} className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Farm
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <Card key={farm.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">{farm.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {farm.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Maximize2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">{farm.size_hectares} hectares</span>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/farms/${farm.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Farms;
