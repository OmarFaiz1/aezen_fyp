import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Globe, Database, Search, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface KnowledgeItem {
  id: string;
  type: string;
  content: string;
  uploadedAt: string;
}

interface KnowledgeBaseListProps {
  refreshTrigger?: number;
}

const typeIcons = {
  URL: Globe,
  Database: Database,
  pdf: FileText,
  website: Globe
};

const typeColors = {
  FAQ: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Document: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  URL: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Database: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  pdf: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  website: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

export function KnowledgeBaseList({ refreshTrigger = 0 }: KnowledgeBaseListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest("GET", "/kb/status");
      const data = await res.json();

      const newItems: KnowledgeItem[] = [];

      // Map items from new backend format
      if (data.items) {
        data.items.forEach((item: any) => {
          newItems.push({
            id: item.id,
            type: item.type,
            content: item.name,
            uploadedAt: item.uploadedAt || new Date().toISOString()
          });
        });
      } else {
        // Fallback for old format (just in case)
        if (data.files) {
          data.files.forEach((f: string, i: number) => {
            newItems.push({
              id: `file-${i}`,
              type: 'pdf',
              content: f,
              uploadedAt: new Date().toISOString()
            });
          });
        }
        if (data.websites) {
          data.websites.forEach((w: string, i: number) => {
            newItems.push({
              id: `web-${i}`,
              type: 'website',
              content: w,
              uploadedAt: new Date().toISOString()
            });
          });
        }
      }

      setItems(newItems);
    } catch (error: any) {
      console.error("Failed to fetch KB status", error);
      setError("Failed to load knowledge base content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const filteredItems = items.filter(item =>
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await apiRequest("POST", `/kb/delete/${id}`, {});
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Failed to delete item", err);
      alert("Failed to delete item");
    }
  };

  const handleEdit = (id: string) => {
    // todo: implement edit
    console.log("Edit item:", id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card data-testid="card-knowledge-base-list">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Knowledge Base Content</CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-knowledge"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {filteredItems.length === 0 && !isLoading && !error && (
              <p className="text-center text-muted-foreground py-4">No content found.</p>
            )}

            {filteredItems.map((item) => {
              const Icon = typeIcons[item.type as keyof typeof typeIcons] || FileText;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                  data-testid={`knowledge-item-${item.id}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.content}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {new Date(item.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={typeColors[item.type as keyof typeof typeColors]}
                    >
                      {item.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      data-testid={`button-delete-${item.id}`}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}