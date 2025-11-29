import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function AiTicketManagement() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingTrigger, setEditingTrigger] = useState<any>(null);
    const [formData, setFormData] = useState({
        keyword: "",
        intent: "",
        assignedRole: "",
    });

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: config } = useQuery({
        queryKey: ["/ai-tickets/config"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/ai-tickets/config");
            return res.json();
        },
    });

    const { data: triggers = [], isLoading } = useQuery({
        queryKey: ["/ai-tickets/triggers"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/ai-tickets/triggers");
            return res.json();
        },
    });

    const { data: specialRoles = [] } = useQuery({
        queryKey: ["/team/special-roles"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/team/special-roles");
            return res.json();
        },
    });

    const toggleMutation = useMutation({
        mutationFn: async (enabled: boolean) => {
            await apiRequest("POST", "/ai-tickets/config/toggle", { enabled });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/ai-tickets/config"] });
            toast({ title: "Settings updated" });
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/ai-tickets/triggers", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/ai-tickets/triggers"] });
            setIsAddOpen(false);
            resetForm();
            toast({ title: "Trigger created successfully" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("PUT", `/ai-tickets/triggers/${editingTrigger.id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/ai-tickets/triggers"] });
            setEditingTrigger(null);
            resetForm();
            toast({ title: "Trigger updated successfully" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/ai-tickets/triggers/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/ai-tickets/triggers"] });
            toast({ title: "Trigger deleted successfully" });
        },
    });

    const resetForm = () => {
        setFormData({ keyword: "", intent: "", assignedRole: "" });
    };

    const handleSubmit = () => {
        if (!formData.keyword || !formData.intent || !formData.assignedRole) {
            toast({ title: "Please fill all fields", variant: "destructive" });
            return;
        }

        if (editingTrigger) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const openEdit = (trigger: any) => {
        setEditingTrigger(trigger);
        setFormData({
            keyword: trigger.keyword,
            intent: trigger.intent,
            assignedRole: trigger.assignedRole,
        });
        setIsAddOpen(true);
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Bot className="h-8 w-8" />
                        AI Ticket Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Configure keywords and intents for automatic ticket creation.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="ai-mode"
                            checked={config?.aiTicketingEnabled}
                            onCheckedChange={(checked) => toggleMutation.mutate(checked)}
                        />
                        <label htmlFor="ai-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            AI Ticketing {config?.aiTicketingEnabled ? "On" : "Off"}
                        </label>
                    </div>
                    <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Trigger
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Triggers</CardTitle>
                    <CardDescription>
                        The AI will monitor messages for these keywords and intents.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Keyword</TableHead>
                                <TableHead>Intent Description</TableHead>
                                <TableHead>Assigned Role</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {triggers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No triggers configured. Add one to start automating tickets.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                triggers.map((trigger: any) => (
                                    <TableRow key={trigger.id}>
                                        <TableCell className="font-medium">
                                            <Badge variant="outline">{trigger.keyword}</Badge>
                                        </TableCell>
                                        <TableCell>{trigger.intent}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{trigger.assignedRole}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(trigger)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => deleteMutation.mutate(trigger.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={(open) => {
                setIsAddOpen(open);
                if (!open) {
                    setEditingTrigger(null);
                    resetForm();
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTrigger ? "Edit Trigger" : "Add New Trigger"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Keyword</label>
                            <Input
                                placeholder="e.g., Refund"
                                value={formData.keyword}
                                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                The primary keyword to look for.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">User Intent</label>
                            <Input
                                placeholder="e.g., User wants their money back for a failed transaction"
                                value={formData.intent}
                                onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Describe what the user is trying to achieve. The AI uses this to match even if spelling is wrong.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assign to Role</label>
                            <Select
                                value={formData.assignedRole}
                                onValueChange={(val) => setFormData({ ...formData, assignedRole: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {specialRoles.map((role: string) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>
                            {editingTrigger ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
