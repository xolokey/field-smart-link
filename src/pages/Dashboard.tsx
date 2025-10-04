import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, TrendingUp, AlertTriangle, CloudSun, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFarms: 0,
    activeCrops: 0,
    alerts: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [farmsResult, cropsResult, monitoringResult] = await Promise.all([
      supabase.from('farms').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('crops').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('crop_monitoring').select('id', { count: 'exact' }).in('alert_level', ['warning', 'critical']),
    ]);

    setStats({
      totalFarms: farmsResult.count || 0,
      activeCrops: cropsResult.count || 0,
      alerts: monitoringResult.count || 0,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your agricultural operations</p>
          </div>
          <Link to="/farms">
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Farm
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Farms"
            value={stats.totalFarms}
            icon={<Sprout className="h-6 w-6 text-primary" />}
            gradient="bg-primary/10"
          />
          <StatCard
            title="Active Crops"
            value={stats.activeCrops}
            icon={<TrendingUp className="h-6 w-6 text-success" />}
            gradient="bg-success/10"
          />
          <StatCard
            title="Active Alerts"
            value={stats.alerts}
            icon={<AlertTriangle className="h-6 w-6 text-warning" />}
            gradient="bg-warning/10"
          />
          <StatCard
            title="Weather"
            value="22°C"
            subtitle="Partly Cloudy"
            icon={<CloudSun className="h-6 w-6 text-info" />}
            gradient="bg-info/10"
          />
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              title="AI Agronomist"
              description="Get expert agricultural advice instantly"
              href="/ai-advisor"
              color="primary"
            />
            <QuickActionCard
              title="Crop Monitoring"
              description="Track health and growth of your crops"
              href="/farms"
              color="success"
            />
            <QuickActionCard
              title="Market Insights"
              description="View commodity prices and trends"
              href="/market-insights"
              color="secondary"
            />
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sprout className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Add Your First Farm</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Create a farm profile to start tracking your agricultural operations
                </p>
                <Link to="/farms">
                  <Button size="sm" variant="outline">Add Farm</Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
              <div className="p-2 rounded-lg bg-secondary/10">
                <CloudSun className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Try AI Advisory</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Ask our AI agronomist any farming questions - from pest control to fertilization
                </p>
                <Link to="/ai-advisor">
                  <Button size="sm" variant="outline">Chat with AI</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradient 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ReactNode; 
  gradient: string;
}) => (
  <Card className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${gradient}`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  </Card>
);

const QuickActionCard = ({ 
  title, 
  description, 
  href, 
  color 
}: { 
  title: string; 
  description: string; 
  href: string;
  color: string;
}) => (
  <Link to={href}>
    <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary/20">
      <h3 className={`font-semibold mb-2 text-${color}`}>{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  </Link>
);

export default Dashboard;
