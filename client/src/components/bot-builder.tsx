import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Save, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// todo: remove mock functionality
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start Conversation' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    data: { label: 'Detect Intent' },
    position: { x: 250, y: 125 },
  },
  {
    id: '3',
    data: { label: 'Product Info Response' },
    position: { x: 100, y: 225 },
  },
  {
    id: '4',
    data: { label: 'Order Status Response' },
    position: { x: 400, y: 225 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3', label: 'product_query' },
  { id: 'e2-4', source: '2', target: '4', label: 'order_status' },
];

const flowTemplates = [
  { id: 'order-query', name: 'Order Query Flow', description: 'Handle order status inquiries' },
  { id: 'product-info', name: 'Product Information', description: 'Provide product details and pricing' },
  { id: 'support-escalation', name: 'Support Escalation', description: 'Route complex issues to human agents' },
  { id: 'shipping-info', name: 'Shipping Information', description: 'Handle shipping and delivery questions' },
];

export function BotBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const { toast } = useToast();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = () => {
    // todo: remove mock functionality
    console.log("Save flow:", { nodes, edges });
    toast({
      title: "Flow Saved",
      description: "Your bot flow has been saved successfully.",
    });
  };

  const handleTest = () => {
    // todo: remove mock functionality
    console.log("Test flow:", { nodes, edges });
    toast({
      title: "Flow Testing",
      description: "Bot flow test initiated - check console for details.",
    });
  };

  const loadTemplate = (templateId: string) => {
    // todo: remove mock functionality
    console.log("Load template:", templateId);
    toast({
      title: "Template Loaded",
      description: `${templateId} template has been loaded.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bot Builder</h2>
          <p className="text-muted-foreground">Create and customize conversation flows</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleTest} variant="outline" data-testid="button-test-flow">
            <Play className="h-4 w-4 mr-2" />
            Test Flow
          </Button>
          <Button onClick={handleSave} data-testid="button-save-flow">
            <Save className="h-4 w-4 mr-2" />
            Save Flow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <Card data-testid="card-flow-templates">
            <CardHeader>
              <CardTitle className="text-base">Flow Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger data-testid="select-template">
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  {flowTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedTemplate && (
                <Button
                  onClick={() => loadTemplate(selectedTemplate)}
                  className="w-full"
                  variant="outline"
                  data-testid="button-load-template"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Load Template
                </Button>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="cursor-pointer hover-elevate">Intent Detection</Badge>
                  <Badge variant="secondary" className="cursor-pointer hover-elevate">Response</Badge>
                  <Badge variant="secondary" className="cursor-pointer hover-elevate">Condition</Badge>
                  <Badge variant="secondary" className="cursor-pointer hover-elevate">API Call</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card data-testid="card-flow-canvas">
            <CardContent className="p-0">
              <div style={{ width: '100%', height: '500px' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                >
                  <Controls />
                  <MiniMap />
                  <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}