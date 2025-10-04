import { Button } from "@/components/ui/button";
import { ArrowRight, Sprout, TrendingUp, MessageSquare, BarChart3, CloudSun, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Intelligent Agriculture Cloud Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-foreground">Transform Your Farm with</span>
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">AI-Powered Intelligence</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Lokey & Co. Agri-Fin combines precision agriculture, real-time monitoring, and AI advisory 
              to maximize yields, optimize resources, and build climate resilience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-primary hover:bg-primary/5">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Four Strategic Pillars</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive AI solutions addressing every aspect of modern farming
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Sprout className="h-8 w-8" />}
              title="Resource Optimization"
              description="Precision irrigation and fertilization with up to 30% water savings through AI-driven scheduling."
              color="success"
            />
            <FeatureCard
              icon={<CloudSun className="h-8 w-8" />}
              title="Risk Mitigation"
              description="Early warning systems for pests, diseases, and weather threats with 90-95% diagnostic accuracy."
              color="warning"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Yield Maximization"
              description="Advanced analytics for 10-20% yield increases through site-specific interventions."
              color="primary"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Economic Resilience"
              description="Market insights and commodity forecasting to stabilize against volatility."
              color="info"
            />
          </div>
        </div>
      </section>

      {/* AI Advisory */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <MessageSquare className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">24/7 AI Agronomist</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold">
                Virtual Expert Advisory
                <br />
                <span className="text-primary">Powered by Gemini AI</span>
              </h2>
              
              <p className="text-muted-foreground text-lg">
                Get instant, expert agronomic advice in your language. Our AI assistant provides 
                personalized recommendations on planting, pest management, fertilization, and more.
              </p>
              
              <ul className="space-y-3">
                <BenefitItem text="Instant responses to complex agronomic questions" />
                <BenefitItem text="Multilingual support for 50+ languages" />
                <BenefitItem text="Trained on decades of agricultural research" />
                <BenefitItem text="Available anytime, anywhere" />
              </ul>
            </div>
            
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-muted-foreground">You</p>
                    <div className="bg-primary/5 rounded-lg p-3">
                      <p className="text-sm">What's the best time to apply nitrogen fertilizer for corn?</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-muted-foreground">AI Agronomist</p>
                    <div className="bg-secondary/5 rounded-lg p-3">
                      <p className="text-sm">For optimal corn nitrogen uptake, I recommend split applications: 30% at planting, 40% at V6 stage, and 30% at V12. This maximizes efficiency and minimizes runoff.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Transform Your Agriculture?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join thousands of farmers worldwide leveraging AI for sustainable, profitable farming
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="shadow-lg hover:shadow-xl">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: string;
}) => (
  <div className="group bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-border hover:border-primary/30">
    <div className={`inline-flex p-3 rounded-lg bg-${color}/10 mb-4 group-hover:scale-110 transition-transform`}>
      <div className={`text-${color}`}>{icon}</div>
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const BenefitItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-2">
    <div className="mt-1 h-5 w-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
      <div className="h-2 w-2 rounded-full bg-success"></div>
    </div>
    <span className="text-muted-foreground">{text}</span>
  </li>
);

export default Index;
