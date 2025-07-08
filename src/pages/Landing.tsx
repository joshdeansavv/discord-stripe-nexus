
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
      title: "Lightning Fast Setup",
      description: "Complete Discord server setup in seconds with AI automation.",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Sparkles,
      title: "Smart AI Builder",
      description: "AI analyzes your needs and builds the perfect server structure.",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Shield,
      title: "Advanced Moderation",
      description: "Built-in moderation tools and auto-role management systems.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Settings,
      title: "Complete Automation",
      description: "Channels, permissions, bots - everything configured perfectly.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Optimized for gaming, business, education, and social communities.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Crown,
      title: "Premium Features",
      description: "Advanced customization, priority support, and unlimited builds.",
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
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
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
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="container mx-auto text-center relative">
          <div className="animate-fade-in-up">
            <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Discord Server Builder
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-8 max-w-5xl mx-auto leading-tight">
              Build Perfect Discord Servers
              <span className="gradient-primary bg-clip-text text-transparent block mt-2">
                in Seconds with AI
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              BuildForMe uses advanced AI to create fully customized Discord servers instantly. 
              From gaming communities to business teams - we build it all for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="gradient-primary text-white shadow-xl btn-hover focus-ring w-full sm:w-auto">
                  Start Building Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-border text-muted-foreground hover:bg-muted hover:text-foreground btn-hover focus-ring w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Revolutionary Discord Bot Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Experience the future of Discord server creation with intelligent automation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="border-border bg-card/50 backdrop-blur-sm card-hover animate-scale-in" style={{animationDelay: `${index * 0.1}s`}}>
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-foreground text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Everything You Need for $15/month
              </h2>
              <p className="text-lg text-muted-foreground">
                Get access to all premium features with a simple subscription
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={benefit} className="flex items-center space-x-4 animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-foreground font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <Card className="border-border bg-card/50 backdrop-blur-sm p-8">
                <div className="text-center">
                  <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Start?</h3>
                  <p className="text-muted-foreground mb-6">
                    Join thousands of communities using BuildForMe to create amazing Discord servers.
                  </p>
                  <Link to="/auth">
                    <Button className="gradient-primary text-white shadow-lg btn-hover focus-ring w-full">
                      Start Building Now
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/20 text-foreground py-16 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">BuildForMe</span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                The AI-powered Discord server builder that creates perfect communities in seconds.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <div className="space-y-3">
                <Link to="/auth" className="text-muted-foreground hover:text-foreground block transition-colors">Features</Link>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground block transition-colors">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <div className="space-y-3">
                <a href="#" className="text-muted-foreground hover:text-foreground block transition-colors">Help Center</a>
                <a href="#" className="text-muted-foreground hover:text-foreground block transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 BuildForMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
