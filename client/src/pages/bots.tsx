// src/pages/bots.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const mockBots = [
  { id: "1", name: "Customer Support Bot", type: "support", createdAt: "2025-11-15" },
  { id: "2", name: "Marketing Bot", type: "marketing", createdAt: "2025-11-10" },
];

export default function BotsPage() {
  const [open, setOpen] = useState(false);
  const [botName, setBotName] = useState("");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bots</h1>
          <p className="text-muted-foreground">Manage all your AI assistants in one place.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Bot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new bot</DialogTitle>
              <DialogDescription>Give your bot a name. You can change it later.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Bot Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Support Assistant"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => { if (botName.trim()) { console.log("Create:", botName); setOpen(false); } }}>
                Create Bot
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {mockBots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bot className="h-16 w-16 text-primary mb-4" />
          <h3 className="text-xl font-semibold">No bots yet</h3>
          <p className="text-muted-foreground max-w-sm">Create your first AI assistant and start automating.</p>
          <Button className="mt-6" size="lg" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Your First Bot
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockBots.map((bot) => (
            <Link key={bot.id} href={`/bots/${bot.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bot.name}</CardTitle>
                      <CardDescription>Active</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Created {new Date(bot.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}