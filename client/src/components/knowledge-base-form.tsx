import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function KnowledgeBaseForm() {
  const [type, setType] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // todo: remove mock functionality
    console.log("Knowledge Base submission:", { type, content, url });
    toast({
      title: "Content Added Successfully",
      description: `Your ${type} has been added to the knowledge base.`,
    });
    setType("");
    setContent("");
    setUrl("");
  };

  const handleFileUpload = () => {
    // todo: remove mock functionality  
    console.log("File upload triggered");
    toast({
      title: "File Upload",
      description: "File upload simulation - feature ready for integration.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card data-testid="card-knowledge-base-form">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Knowledge Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="content-type">Content Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger data-testid="select-content-type">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faq">FAQ</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="url">Website URL</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "url" && (
              <div>
                <Label htmlFor="url-input">Website URL</Label>
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  data-testid="input-url"
                />
              </div>
            )}

            {type === "document" && (
              <div>
                <Label>Upload Document</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFileUpload}
                  className="w-full h-20 border-dashed"
                  data-testid="button-file-upload"
                >
                  <Upload className="h-6 w-6 mr-2" />
                  Click to upload or drag and drop
                </Button>
              </div>
            )}

            {(type === "faq" || type === "database") && (
              <div>
                <Label htmlFor="content-input">Content</Label>
                <Textarea
                  id="content-input"
                  placeholder="Enter your content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  data-testid="textarea-content"
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={!type || (type === "faq" && !content) || (type === "url" && !url)}
              data-testid="button-submit-content"
            >
              Add to Knowledge Base
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}