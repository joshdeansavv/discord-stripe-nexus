
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Receipt } from "lucide-react";
import { format } from "date-fns";

const Billing = () => {
  const { subscription, loading, isActive } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div className="text-foreground">Loading billing information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SubscriptionStatus />
        
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-primary" />
              Billing History
            </CardTitle>
            <CardDescription>
              Your recent billing and payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-foreground font-medium mb-2">No billing history</p>
              <p className="text-sm">Your billing history will appear here once you have an active subscription</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {subscription && (
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              Subscription Details
            </CardTitle>
            <CardDescription>
              Current subscription information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col space-y-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center space-x-2">
                  {isActive ? (
                    <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="text-foreground font-medium">
                  {subscription.subscription_tier || 'Basic'}
                </span>
              </div>
              
              {subscription.subscription_end && (
                <div className="flex flex-col space-y-2">
                  <span className="text-sm text-muted-foreground">
                    {isActive ? 'Next billing date' : 'Expired on'}
                  </span>
                  <span className="text-foreground font-medium">
                    {format(new Date(subscription.subscription_end), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Billing;
