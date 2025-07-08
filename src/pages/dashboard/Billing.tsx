
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Receipt, ExternalLink } from "lucide-react";
import { format } from "date-fns";

const Billing = () => {
  const { subscription, loading, isActive } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div className="text-white">Loading billing information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
        <p className="text-gray-300">Manage your subscription and billing information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <SubscriptionStatus />
        </div>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Receipt className="w-5 h-5 mr-2 text-green-400" />
              Billing History
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your recent billing and payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-white font-medium mb-2">No billing history</p>
              <p className="text-sm text-gray-400 mb-4">Your billing history will appear here once you have an active subscription</p>
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {subscription && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Calendar className="w-5 h-5 mr-2 text-blue-400" />
              Subscription Details
            </CardTitle>
            <CardDescription className="text-gray-400">
              Current subscription information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col space-y-2">
                <span className="text-sm text-gray-400">Status</span>
                <div className="flex items-center space-x-2">
                  {isActive ? (
                    <Badge className="bg-green-600 text-white hover:bg-green-700">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-600 text-gray-200">Inactive</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <span className="text-sm text-gray-400">Plan</span>
                <span className="text-white font-medium">
                  {subscription.subscription_tier || 'Basic'}
                </span>
              </div>
              
              {subscription.subscription_end && (
                <div className="flex flex-col space-y-2">
                  <span className="text-sm text-gray-400">
                    {isActive ? 'Next billing date' : 'Expired on'}
                  </span>
                  <span className="text-white font-medium">
                    {format(new Date(subscription.subscription_end), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
            Payment Methods
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your payment methods and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-white font-medium mb-2">No payment methods</p>
            <p className="text-sm text-gray-400 mb-4">Add a payment method to start your subscription</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
              <CreditCard className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
