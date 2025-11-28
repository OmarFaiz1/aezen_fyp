import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Settings, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// todo: remove mock functionality
const mockTeamMembers = [
  { id: '22L-7492', name: 'Alina Baber', role: 'Admin', email: 'alina@aezen.com', phone: '+1234567890', status: 'active', permissions: ['analytics', 'user_management', 'billing'] },
  { id: '22L-7493', name: 'Ali Akhtar', role: 'Agent', email: 'Ali@aezen.com', phone: '+1234567891', status: 'active', permissions: ['conversations', 'tickets'] },
  { id: '22L-7494', name: 'Sarah', role: 'Manager', email: 'sarah@aezen.com', phone: '+1234567892', status: 'inactive', permissions: ['analytics', 'team_management'] },
  { id: '22L-7495', name: 'Sharjeel', role: 'Agent', email: 'Sarah@aezen.com', phone: '+1234567893', status: 'active', permissions: ['conversations', 'knowledge_base'] },
];

const roleColors = {
  Admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  Manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Agent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Owner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

export function TeamGrid() {
  const [members, setMembers] = useState(mockTeamMembers);
  const { toast } = useToast();

  const toggleMemberStatus = (id: string) => {
    setMembers(members.map(member => 
      member.id === id 
        ? { ...member, status: member.status === 'active' ? 'inactive' : 'active' }
        : member
    ));
    // todo: remove mock functionality
    console.log("Toggle member status:", id);
    toast({
      title: "Status Updated",
      description: "Team member status has been updated.",
    });
  };

  const addNewMember = () => {
    // todo: remove mock functionality
    console.log("Add new member");
    toast({
      title: "Add Team Member",
      description: "New member form would open here.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card data-testid="card-team-grid">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
            <Button 
              onClick={addNewMember}
              data-testid="button-add-member"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="h-full hover-elevate"
                  data-testid={`team-member-card-${member.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {member.id}</p>
                        </div>
                      </div>
                      <Switch
                        checked={member.status === 'active'}
                        onCheckedChange={() => toggleMemberStatus(member.id)}
                        data-testid={`switch-status-${member.id}`}
                      />
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <Badge 
                        variant="secondary"
                        className={roleColors[member.role as keyof typeof roleColors]}
                      >
                        {member.role}
                      </Badge>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="text-muted-foreground">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span className="text-muted-foreground">{member.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">PERMISSIONS</p>
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.map((permission) => (
                          <Badge 
                            key={permission} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-3"
                      data-testid={`button-edit-member-${member.id}`}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
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