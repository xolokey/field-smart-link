import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Droplets, Sun, Leaf, DollarSign } from "lucide-react";

const Analytics = () => {
  const { t } = useTranslation();

  // Yield data by crop
  const yieldData = [
    { crop: "Rice", yield: 4.2, lastYear: 3.8 },
    { crop: "Wheat", yield: 3.5, lastYear: 3.3 },
    { crop: "Corn", yield: 5.8, lastYear: 5.2 },
    { crop: "Soybeans", yield: 2.9, lastYear: 2.7 },
    { crop: "Cotton", yield: 1.8, lastYear: 1.6 },
  ];

  // Revenue trends over months
  const revenueData = [
    { month: "Jan", revenue: 45000, expenses: 32000 },
    { month: "Feb", revenue: 52000, expenses: 35000 },
    { month: "Mar", revenue: 48000, expenses: 33000 },
    { month: "Apr", revenue: 61000, expenses: 38000 },
    { month: "May", revenue: 72000, expenses: 42000 },
    { month: "Jun", revenue: 68000, expenses: 40000 },
  ];

  // Crop distribution
  const cropDistribution = [
    { name: "Rice", value: 35, color: "hsl(var(--primary))" },
    { name: "Wheat", value: 25, color: "hsl(var(--secondary))" },
    { name: "Corn", value: 20, color: "hsl(var(--accent))" },
    { name: "Soybeans", value: 12, color: "hsl(var(--info))" },
    { name: "Cotton", value: 8, color: "hsl(var(--warning))" },
  ];

  // Water usage data
  const waterUsageData = [
    { month: "Jan", usage: 1200 },
    { month: "Feb", usage: 1350 },
    { month: "Mar", usage: 1450 },
    { month: "Apr", usage: 1600 },
    { month: "May", usage: 1800 },
    { month: "Jun", usage: 1700 },
  ];

  const stats = [
    {
      title: "Total Revenue",
      value: "₹3,46,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Average Yield",
      value: "3.64 T/ha",
      change: "+8.3%",
      trend: "up",
      icon: Leaf,
      color: "text-primary",
    },
    {
      title: "Water Usage",
      value: "9,100 L",
      change: "-5.2%",
      trend: "down",
      icon: Droplets,
      color: "text-info",
    },
    {
      title: "Growing Days",
      value: "156 days",
      change: "+2 days",
      trend: "up",
      icon: Sun,
      color: "text-warning",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Farm Analytics</h1>
          <p className="text-muted-foreground">Track your farm's performance and insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-success' : 'text-info'}`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{stat.change}</span>
                    <span className="text-muted-foreground">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="yield">Yield</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Revenue & Expenses</CardTitle>
                <CardDescription>Monthly financial overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorExpenses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yield" className="space-y-4">
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Crop Yield Comparison</CardTitle>
                <CardDescription>Current year vs last year (tonnes/hectare)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={yieldData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="crop" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="yield" fill="hsl(var(--primary))" name="This Year" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="lastYear" fill="hsl(var(--muted))" name="Last Year" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Crop Distribution</CardTitle>
                <CardDescription>Percentage of total farm area by crop</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={cropDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {cropDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Water Usage Trends</CardTitle>
                <CardDescription>Monthly water consumption (cubic meters)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={waterUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="usage" 
                      stroke="hsl(var(--info))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--info))', r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
