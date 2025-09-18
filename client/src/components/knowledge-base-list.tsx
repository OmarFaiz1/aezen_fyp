import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Link, Database, Trash2, Edit, Search } from "lucide-react";
import { motion } from "framer-motion";

// todo: remove mock functionality
const mockKnowledgeItems = [
  { id: 1, type: 'FAQ', content: 'What is shipping policy?', uploadedAt: '2023-09-01' },
  { id: 2, type: 'Document', content: 'Product catalog 2024.pdf', uploadedAt: '2023-09-02' },
  { id: 3, type: 'URL', content: 'https://company.com/support', uploadedAt: '2023-09-03' },
  { id: 4, type: 'Database', content: 'Customer support database connection', uploadedAt: '2023-09-04' },
];

const typeIcons = {
  FAQ: FileText,
  Document: FileText,
  URL: Link,
  Database: Database,
};

const typeColors = {
  FAQ: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Document: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  URL: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Database: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

export function KnowledgeBaseList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState(mockKnowledgeItems);

  const filteredItems = items.filter(item =>
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    // todo: remove mock functionality
    console.log("Delete item:", id);
    setItems(items.filter(item => item.id !== id));
  };

  const handleEdit = (id: number) => {
    // todo: remove mock functionality
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
          <CardTitle>Knowledge Base Content</CardTitle>
          <div className="relative">
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
            {filteredItems.map((item) => {
              const Icon = typeIcons[item.type as keyof typeof typeIcons];
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
                      onClick={() => handleEdit(item.id)}
                      data-testid={`button-edit-${item.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      data-testid={`button-delete-${item.id}`}
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