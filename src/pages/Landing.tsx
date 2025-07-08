
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { ArrowRight, Shield, Zap, Users, Settings, Crown, Star, Bot, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">BuildForMe</span>
            </div>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-300">Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px] bg-gray-800">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-white">AI Server Builder</h4>
                          <p className="text-sm text-gray-400">Build complete servers in seconds</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-white">Smart Role Analysis</h4>
                          <p className="text-sm text-gray-400">Auto-fix and optimize server roles</p>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost" className="text-gray-300 hover:text-white">Login</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-purple-900/50 text-purple-200 hover:bg-purple-900/50 border-purple-700">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Discord Server Builder
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-6 max-w-4xl mx-auto">
            Build Discord Servers in
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Seconds with AI</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            BuildForMe uses advanced AI to create fully customized Discord servers instantly. 
            From custom themes to optimized role structures - we build it all for you.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Add to Discord
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Revolutionary AI Server Building
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience the future of Discord server creation with our intelligent automation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-gray-700 bg-gray-800 hover:bg-gray-750 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Lightning Fast Setup</CardTitle>
                <CardDescription className="text-gray-400">
                  Complete server setup in seconds, not hours. Our AI handles everything instantly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-700 bg-gray-800 hover:bg-gray-750 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Custom AI Themes</CardTitle>
                <CardDescription className="text-gray-400">
                  Generate unique server themes tailored to your community's personality and needs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-700 bg-gray-800 hover:bg-gray-750 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Smart Role Analysis</CardTitle>
                <CardDescription className="text-gray-400">
                  AI analyzes and optimizes your server roles, fixing permissions and structure automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-700 bg-gray-800 hover:bg-gray-750 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-900/50 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-yellow-400" />
                </div>
                <CardTitle className="text-white">Complete Automation</CardTitle>
                <CardDescription className="text-gray-400">
                  From channels to permissions, categories to bots - everything configured perfectly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-700 bg-gray-800 hover:bg-gray-750 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-red-900/50 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-red-400" />
                </div>
                <CardTitle className="text-white">Community Optimized</CardTitle>
                <CardDescription className="text-gray-400">
                  AI understands your community type and builds the perfect server structure.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-700 bg-gray-800 hover:bg-gray-750 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-indigo-400" />
                </div>
                <CardTitle className="text-white">Premium Features</CardTitle>
                <CardDescription className="text-gray-400">
                  Advanced AI capabilities, priority support, and unlimited server builds.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your Perfect Server?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of communities using BuildForMe to create amazing Discord servers in seconds.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Start Building Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4 border-t border-gray-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">BuildForMe</span>
              </div>
              <p className="text-gray-400">
                The AI-powered Discord server builder that creates perfect communities in seconds.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <Link to="/auth" className="text-gray-400 hover:text-white block">Features</Link>
                <Link to="/auth" className="text-gray-400 hover:text-white block">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className="text-gray-400 hover:text-white block">Help Center</a>
                <a href="#" className="text-gray-400 hover:text-white block">Contact Us</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BuildForMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
