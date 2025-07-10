
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, CreditCard, Calendar } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";

const SubscriptionStatus = () => {
  const { subscription, loading, createCheckout, openCustomerPortal, isActive } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span>Subscription Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading subscription status...</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (!subscription) return <Badge variant="secondary">Unknown</Badge>;
    
    switch (subscription.subscription_status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">No Subscription</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="w-5 h-5" />
          <span>Subscription Status</span>
        </CardTitle>
        <CardDescription>
          Manage your Discord Bot Pro subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          {getStatusBadge()}
        </div>

        {subscription?.subscription_end && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isActive ? 'Renews on' : 'Expired on'}: {format(new Date(subscription.subscription_end), 'MMM dd, yyyy')}
            </span>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          {!isActive ? (
            <Button onClick={createCheckout} className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Subscribe Now - $20/month
            </Button>
          ) : (
            <Button onClick={openCustomerPortal} variant="outline" className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          )}
        </div>

        {!isActive && (
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-900 mb-1">Premium Features:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Advanced moderation tools</li>
              <li>• Custom commands</li>
              <li>• Priority support</li>
              <li>• Analytics dashboard</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
