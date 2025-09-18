import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings, Globe, Shield, Bell, Database } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// todo: remove mock functionality
const mockAuditLogs = [
  { id: 1, action: 'User login', user: 'admin@aezen.com', timestamp: '2023-09-01 10:30:00', ip: '192.168.1.1' },
  { id: 2, action: 'Settings updated', user: 'admin@aezen.com', timestamp: '2023-09-01 09:15:00', ip: '192.168.1.1' },
  { id: 3, action: 'Team member added', user: 'manager@aezen.com', timestamp: '2023-08-31 16:45:00', ip: '192.168.1.2' },
  { id: 4, action: 'Knowledge base updated', user: 'agent@aezen.com', timestamp: '2023-08-31 14:20:00', ip: '192.168.1.3' },
];

export function SettingsForm() {
  const [language, setLanguage] = useState("en");
  const [dataRetention, setDataRetention] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [companyName, setCompanyName] = useState("AEZEN Corp");
  const [timezone, setTimezone] = useState("UTC");
  const { toast } = useToast();

  const handleSave = () => {
    // todo: remove mock functionality
    console.log("Save settings:", {
      language,
      dataRetention,
      analytics,
      emailNotifications,
      pushNotifications,
      companyName,
      timezone
    });
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your application preferences and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-general-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                data-testid="input-company-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger data-testid="select-timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="CET">Central European Time</SelectItem>
                  <SelectItem value="JST">Japan Standard Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-notification-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates about important events</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                data-testid="switch-email-notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
                data-testid="switch-push-notifications"
              />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-privacy-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-retention">Data Retention</Label>
                <p className="text-sm text-muted-foreground">Automatically delete old conversation data</p>
              </div>
              <Switch
                id="data-retention"
                checked={dataRetention}
                onCheckedChange={setDataRetention}
                data-testid="switch-data-retention"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics">Analytics Collection</Label>
                <p className="text-sm text-muted-foreground">Allow collection of usage analytics</p>
              </div>
              <Switch
                id="analytics"
                checked={analytics}
                onCheckedChange={setAnalytics}
                data-testid="switch-analytics"
              />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-audit-logs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAuditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-muted-foreground">{log.user}</p>
                  </div>
                  <div className="text-right">
                    <p>{new Date(log.timestamp).toLocaleDateString()}</p>
                    <p className="text-muted-foreground">{log.ip}</p>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <Button variant="outline" className="w-full">
              View Full Audit Log
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} data-testid="button-save-settings">
          Save Settings
        </Button>
      </div>
    </motion.div>
  );
}