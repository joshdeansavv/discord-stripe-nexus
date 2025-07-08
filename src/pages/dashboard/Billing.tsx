
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
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div className="text-foreground">Loading billing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg">
          <SubscriptionStatus />
        </div>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Receipt className="w-5 h-5 text-primary" />
              Billing History
            </CardTitle>
            <CardDescription>
              Recent payments and invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Receipt className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-foreground font-medium mb-1">No billing history</p>
              <p className="text-sm text-muted-foreground mb-3">History will appear after subscription</p>
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {subscription && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Calendar className="w-5 h-5 text-primary" />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Status</span>
                <div>
                  {isActive ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="text-foreground font-medium block">
                  {subscription.subscription_tier || 'Basic'}
                </span>
              </div>
              
              {subscription.subscription_end && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">
                    {isActive ? 'Next billing' : 'Expired'}
                  </span>
                  <span className="text-foreground font-medium block">
                    {format(new Date(subscription.subscription_end), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CreditCard className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-foreground font-medium mb-1">No payment methods</p>
            <p className="text-sm text-muted-foreground mb-3">Add a payment method to subscribe</p>
            <Button className="gap-2">
              <CreditCard className="w-4 h-4" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
