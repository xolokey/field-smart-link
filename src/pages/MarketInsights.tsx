import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const MarketInsights = () => {
  const commodities = [
    { name: "Wheat", price: 245.50, change: 2.3, trend: "up" },
    { name: "Corn", price: 189.75, change: -1.2, trend: "down" },
    { name: "Soybeans", price: 512.30, change: 0.5, trend: "up" },
    { name: "Rice", price: 356.80, change: 0, trend: "stable" },
    { name: "Cotton", price: 178.40, change: 3.1, trend: "up" },
    { name: "Coffee", price: 423.60, change: -2.4, trend: "down" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Market Insights</h1>
          <p className="text-muted-foreground">Real-time commodity prices and market trends</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commodities.map((commodity) => (
            <Card key={commodity.name} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{commodity.name}</h3>
                    <p className="text-2xl font-bold mt-2">
                      ${commodity.price.toFixed(2)}
                      <span className="text-sm text-muted-foreground ml-1">/ton</span>
                    </p>
                  </div>
                  <div className={`
                    p-2 rounded-lg
                    ${commodity.trend === 'up' ? 'bg-success/10' : 
                      commodity.trend === 'down' ? 'bg-destructive/10' : 'bg-muted'}
                  `}>
                    {commodity.trend === 'up' && <TrendingUp className="h-5 w-5 text-success" />}
                    {commodity.trend === 'down' && <TrendingDown className="h-5 w-5 text-destructive" />}
                    {commodity.trend === 'stable' && <Minus className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
                
                <div className={`text-sm font-medium ${
                  commodity.change > 0 ? 'text-success' : 
                  commodity.change < 0 ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {commodity.change > 0 && '+'}{commodity.change}% today
                </div>

                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Last updated: 2 hours ago
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Market Analysis</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-info/5 border border-info/20">
              <h3 className="font-medium text-info mb-2">Market Trend</h3>
              <p className="text-sm text-muted-foreground">
                Agricultural commodity prices are showing mixed signals this week. Wheat and cotton prices 
                are trending upward due to increased demand and favorable weather conditions in key growing regions.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
              <h3 className="font-medium text-warning mb-2">Advisory</h3>
              <p className="text-sm text-muted-foreground">
                Consider hedging strategies for corn and coffee positions as prices show volatility. 
                Monitor weather forecasts for potential impacts on supply chains.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MarketInsights;
