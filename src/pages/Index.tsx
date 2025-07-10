import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight, 
  Check,
  Star,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();

  console.log('🏠 Index component rendering with:', { hasUser: !!user, loading });

  // Show loading spinner while auth is initializing
  if (loading) {
    console.log('⏳ Index showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('✅ Index rendering main content');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">BuildForMe</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link to="/dashboard">
                <Button className="gradient-primary text-white">
                  Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="gradient-primary text-white">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            🎉 Now Available - AI Discord Bot Builder
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Build Discord Servers
            <br />
            <span className="gradient-text">with AI Power</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create, manage, and optimize your Discord servers with AI-powered automation. 
            Perfect roles, channels, and permissions in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary text-white shadow-xl hover:shadow-2xl transition-all">
                <Sparkles className="mr-2 w-5 h-5" />
                Start Building Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-border">
              <MessageSquare className="mr-2 w-5 h-5" />
              See Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose BuildForMe?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful AI tools designed to make Discord server management effortless
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-foreground">AI Server Builder</CardTitle>
                <CardDescription>
                  Create complete Discord servers with channels, roles, and permissions in seconds
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-foreground">Instant Setup</CardTitle>
                <CardDescription>
                  No coding required. Just describe what you want and watch it build automatically
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-foreground">Smart Security</CardTitle>
                <CardDescription>
                  AI-optimized permission systems that keep your server secure and organized
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-foreground">Community Focus</CardTitle>
                <CardDescription>
                  Designed specifically for Discord communities with best practices built-in
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-foreground">Premium Quality</CardTitle>
                <CardDescription>
                  Professional-grade server setups that scale with your community growth
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-foreground">24/7 Support</CardTitle>
                <CardDescription>
                  Get help whenever you need it with our dedicated support team
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more power
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-3xl font-bold text-foreground">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">1 Discord server</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Basic AI building</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Community support</span>
                  </div>
                </div>
                <Link to="/auth" className="block">
                  <Button className="w-full" variant="outline">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-primary/20 backdrop-blur-sm ring-2 ring-primary/20 relative">
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-foreground">Pro</CardTitle>
                <CardDescription>For growing communities</CardDescription>
                <div className="text-3xl font-bold text-foreground">$15<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Unlimited servers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Advanced AI features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Custom themes</span>
                  </div>
                </div>
                <Link to="/auth" className="block">
                  <Button className="w-full gradient-primary text-white">
                    Start Pro Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Enterprise</CardTitle>
                <CardDescription>For large organizations</CardDescription>
                <div className="text-3xl font-bold text-foreground">Custom</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Everything in Pro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">White-label solution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Dedicated support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Custom integrations</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Build Amazing Discord Servers?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of community builders who trust BuildForMe to create engaging Discord experiences.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gradient-primary text-white shadow-xl hover:shadow-2xl transition-all">
              <Sparkles className="mr-2 w-5 h-5" />
              Start Building Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-4">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 gradient-primary rounded flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">BuildForMe</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 BuildForMe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
