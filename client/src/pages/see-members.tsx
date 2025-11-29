import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Search, Filter, Mail, Phone, Shield, Ticket } from "lucide-react";
import { motion } from "framer-motion";

export default function SeeMembers() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [assignmentFilter, setAssignmentFilter] = useState("all"); // 'all', 'ai', 'manual'
    const [selectedMember, setSelectedMember] = useState<any>(null);

    const { data: members, isLoading } = useQuery({
        queryKey: ["/team/members"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/team/members");
            return res.json();
        },
    });

    const { data: specialRoles } = useQuery({
        queryKey: ["/team/special-roles"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/team/special-roles");
            return res.json();
        },
    });

    // Fetch all tickets to support filtering
    const { data: allTickets } = useQuery({
        queryKey: ["/tickets"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/tickets");
            return res.json();
        },
    });

    // Filter tickets for the selected member from allTickets
    const memberTickets = allTickets?.filter((t: any) => t.assignedTo?.id === selectedMember?.id) || [];

    const filteredMembers = members?.filter((member: any) => {
        const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || member.specialRole === roleFilter;

        let matchesAssignment = true;
        if (assignmentFilter !== "all" && allTickets) {
            const memberTickets = allTickets.filter((t: any) => t.assignedTo?.id === member.id);
            if (assignmentFilter === "ai") {
                matchesAssignment = memberTickets.some((t: any) => t.assignedByType === 'ai');
            } else if (assignmentFilter === "human") {
                matchesAssignment = memberTickets.some((t: any) => t.assignedByType === 'human');
            }
        }

        return matchesSearch && matchesRole && matchesAssignment;
    });

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">See Members</h1>
                    <p className="text-muted-foreground mt-2">
                        View all team members and their assigned tasks.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center bg-card p-4 rounded-lg border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-4">
                    <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                        <SelectTrigger className="w-[200px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filter by Assignment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Assignments</SelectItem>
                            <SelectItem value="ai">Assigned by AI</SelectItem>
                            <SelectItem value="human">Assigned by Human</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[200px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {specialRoles?.map((role: string) => (
                                <SelectItem key={role} value={role}>
                                    {role}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers?.map((member: any) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSelectedMember(member)}
                        className="cursor-pointer"
                    >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                                {member.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-lg">{member.name || "Unknown"}</h3>
                                            <p className="text-sm text-muted-foreground">{member.role}</p>
                                        </div>
                                    </div>
                                    {member.specialRole && (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                            {member.specialRole}
                                        </Badge>
                                    )}
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        {member.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Shield className="h-4 w-4" />
                                        {member.permissions?.length || 0} Permissions
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Member Details</DialogTitle>
                        <DialogDescription>
                            Detailed information and assigned tickets.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedMember && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-xl">
                                        {selectedMember.name?.split(' ').map((n: string) => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedMember.name}</h2>
                                    <p className="text-muted-foreground">{selectedMember.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge>{selectedMember.role}</Badge>
                                        {selectedMember.specialRole && (
                                            <Badge variant="outline">{selectedMember.specialRole}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Ticket className="h-5 w-5" />
                                    Assigned Tickets
                                </h3>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {memberTickets?.length > 0 ? (
                                        memberTickets.map((ticket: any) => (
                                            <div key={ticket.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded mr-2">
                                                            {ticket.ticketNumber}
                                                        </span>
                                                        <span className="font-medium">{ticket.title}</span>
                                                    </div>
                                                    <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                                                        {ticket.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                    {ticket.description}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>Priority: {ticket.priority}</span>
                                                    <div className="flex items-center gap-1">
                                                        <span>Assigned by:</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {ticket.assignedByType === 'ai' ? '🤖 AI' : `👤 ${ticket.assignedByUser?.name || 'Human'}`}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">
                                            No tickets assigned to this member.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
