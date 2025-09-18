import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Download, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

// todo: remove mock functionality
const mockBilling = {
  plan: 'Pro',
  conversations: 15000,
  conversationsLimit: 30000,
  nextBill: '2023-10-01',
  amount: '$99',
  usage: 50
};

const mockInvoices = [
  { id: 'INV-001', date: '2023-09-01', amount: '$99.00', status: 'paid' },
  { id: 'INV-002', date: '2023-08-01', amount: '$99.00', status: 'paid' },
  { id: 'INV-003', date: '2023-07-01', amount: '$99.00', status: 'paid' },
  { id: 'INV-004', date: '2023-06-01', amount: '$79.00', status: 'paid' },
];

const planTiers = [
  {
    name: 'Basic',
    price: '$49',
    period: '/month',
    features: ['5,000 conversations/month', 'Email support', 'Basic analytics', '1 team member'],
    current: false
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/month',
    features: ['30,000 conversations/month', 'Priority support', 'Advanced analytics', '5 team members', 'API access'],
    current: true,
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Unlimited conversations', '24/7 phone support', 'Custom integrations', 'Unlimited team members', 'SLA guarantee'],
    current: false
  }
];

export function BillingDashboard() {
  const handleDownloadInvoice = (invoiceId: string) => {
    // todo: remove mock functionality
    console.log("Download invoice:", invoiceId);
  };

  const handleUpgradePlan = (planName: string) => {
    // todo: remove mock functionality
    console.log("Upgrade to plan:", planName);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">Billing & Subscriptions</h2>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card data-testid="card-current-plan">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{mockBilling.plan}</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conversations used</span>
                <span>{mockBilling.conversations.toLocaleString()}/{mockBilling.conversationsLimit.toLocaleString()}</span>
              </div>
              <Progress value={mockBilling.usage} className="h-2" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Next billing: {new Date(mockBilling.nextBill).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Amount: {mockBilling.amount}</span>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Manage Subscription
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-usage-stats">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Conversations</span>
                  <span>15,000 / 30,000</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Team Members</span>
                  <span>3 / 5</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>API Calls</span>
                  <span>8,500 / 10,000</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Usage resets on {new Date(mockBilling.nextBill).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-invoice-history">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockInvoices.slice(0, 4).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{invoice.amount}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      data-testid={`button-download-${invoice.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Invoices
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-subscription-plans">
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose the plan that best fits your needs
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planTiers.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={`relative h-full ${plan.current ? 'ring-2 ring-primary' : ''}`}
                  data-testid={`plan-card-${plan.name.toLowerCase()}`}
                >
                  {plan.popular && (
                    <Badge className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      Most Popular
                    </Badge>
                  )}
                  {plan.current && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-0 right-0 m-2"
                    >
                      Current Plan
                    </Badge>
                  )}
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full"
                      variant={plan.current ? "outline" : "default"}
                      disabled={plan.current}
                      onClick={() => handleUpgradePlan(plan.name)}
                      data-testid={`button-plan-${plan.name.toLowerCase()}`}
                    >
                      {plan.current ? "Current Plan" : "Choose Plan"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}