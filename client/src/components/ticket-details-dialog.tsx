import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TicketDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticketId: string | null;
}

export function TicketDetailsDialog({ open, onOpenChange, ticketId }: TicketDetailsDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("low");
    const [status, setStatus] = useState("open");
    const [assignedToId, setAssignedToId] = useState("");

    // Fetch ticket details
    const { data: ticket } = useQuery<any>({
        queryKey: [`/api/tickets/${ticketId}`],
        enabled: !!ticketId,
    });

    // Fetch team members for assignment
    const { data: members = [] } = useQuery<any[]>({
        queryKey: ["/api/team/members"],
    });

    useEffect(() => {
        if (ticket) {
            setTitle(ticket.title);
            setDescription(ticket.description || "");
            setPriority(ticket.priority);
            setStatus(ticket.status);
            setAssignedToId(ticket.assignedToId || "");
        }
    }, [ticket]);

    const updateTicketMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("PATCH", `/api/tickets/${ticketId}`, data);
        },
        onSuccess: () => {
            toast({
                title: "Ticket Updated",
                description: "The ticket has been successfully updated.",
            });
            onOpenChange(false);
            queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
            queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}`] });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update ticket. Please try again.",
                variant: "destructive",
            });
        }
    });

    const handleSubmit = () => {
        if (!title) {
            toast({
                title: "Validation Error",
                description: "Please enter a reason for the ticket.",
                variant: "destructive",
            });
            return;
        }

        updateTicketMutation.mutate({
            title,
            description,
            priority,
            status,
            assignedToId: assignedToId || null,
        });
    };

    if (!ticket) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Ticket Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ticket-number" className="text-right">
                            Ticket #
                        </Label>
                        <Input
                            id="ticket-number"
                            value={ticket.ticketNumber}
                            disabled
                            className="col-span-3 bg-muted"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Input
                            id="date"
                            value={new Date(ticket.createdAt).toLocaleString()}
                            disabled
                            className="col-span-3 bg-muted"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right">
                            Reason
                        </Label>
                        <Textarea
                            id="reason"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="assign-to" className="text-right">
                            Assign To
                        </Label>
                        <Select value={assignedToId} onValueChange={setAssignedToId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                            <SelectContent>
                                {members.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.name} ({member.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Severity</Label>
                        <RadioGroup value={priority} onValueChange={setPriority} className="col-span-3 flex flex-col gap-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="low" id="low" />
                                <Label htmlFor="low">Low</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="medium" id="medium" />
                                <Label htmlFor="medium">Medium</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="high" id="high" />
                                <Label htmlFor="high">High</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="critical" id="critical" />
                                <Label htmlFor="critical">Critical</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={updateTicketMutation.isPending}>
                        {updateTicketMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
