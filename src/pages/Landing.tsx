
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { ArrowRight, Shield, Zap, Users, Settings, Crown, Star, Bot, Sparkles, CheckCircle, MessageSquare, Server } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Setup",
      description: "Complete Discord server configuration in under 60 seconds.",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Smart algorithms build the perfect server structure for you.",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Shield,
      title: "Auto Moderation",
      description: "Built-in moderation tools and intelligent role management.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Settings,
      title: "Full Automation",
      description: "Channels, permissions, and bots configured perfectly.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Users,
      title: "Community Ready",
      description: "Optimized for gaming, business, and social communities.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Crown,
      title: "Premium Features",
      description: "Advanced customization with unlimited server builds.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const benefits = [
    "AI-powered server building",
    "Custom themes and layouts", 
    "Smart role optimization",
    "Unlimited server builds",
    "24/7 priority support",
    "Advanced bot integration"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">BuildForMe</span>
            </div>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground">
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-4 p-6 w-[500px] bg-card border border-border rounded-xl shadow-xl">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Server className="w-4 h-4 text-primary" />
                            <h4 className="font-medium text-foreground">Server Builder</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">Build complete Discord servers instantly</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <h4 className="font-medium text-foreground">Smart Moderation</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">AI-powered moderation and management</p>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground focus-ring">
                  Login
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="gradient-primary text-white shadow-lg btn-hover focus-ring">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"></div>
        <div className="container mx-auto text-center relative max-w-6xl">
          <div className="animate-fade-in-up space-y-8">
            <Badge className="mb-8 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-6 py-3 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Discord Builder
            </Badge>
            
            <h1 className="text-7xl md:text-8xl font-bold text-foreground leading-[0.9] tracking-tight">
              Build Perfect
              <br />
              <span className="gradient-primary bg-clip-text text-transparent">
                Discord Servers
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              Advanced AI creates fully customized Discord servers instantly. 
              From gaming communities to business teams.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="gradient-primary text-white shadow-xl btn-hover focus-ring w-full sm:w-auto h-14 px-8 text-lg font-semibold">
                  Start Building
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-foreground mb-6 tracking-tight">
              Revolutionary Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Experience intelligent Discord server automation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="border-border/50 bg-card/30 backdrop-blur-sm card-hover animate-scale-in group" style={{animationDelay: `${index * 0.1}s`}}>
                <CardHeader className="pb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-foreground text-2xl font-semibold">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-foreground mb-6 tracking-tight">
              Simple Pricing
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
              Everything you need for $20/month
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={benefit} className="flex items-center space-x-4 animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-foreground font-medium text-lg">{benefit}</span>
                </div>
              ))}
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-10 text-center">
              <div className="w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">Ready to Start?</h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Join thousands of communities using BuildForMe to create amazing Discord servers.
              </p>
              <Link to="/auth">
                <Button className="gradient-primary text-white shadow-lg btn-hover focus-ring w-full h-14 text-lg font-semibold">
                  Start Building
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/20 text-foreground py-16 px-6 border-t border-border/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <span className="font-bold text-2xl">BuildForMe</span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md text-lg">
                The AI-powered Discord server builder that creates perfect communities instantly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground text-lg">Product</h4>
              <div className="space-y-3">
                <Link to="/auth" className="text-muted-foreground hover:text-foreground block transition-colors">Features</Link>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground block transition-colors">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground text-lg">Support</h4>
              <div className="space-y-3">
                <a href="#" className="text-muted-foreground hover:text-foreground block transition-colors">Help Center</a>
                <a href="#" className="text-muted-foreground hover:text-foreground block transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border/30 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 BuildForMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
