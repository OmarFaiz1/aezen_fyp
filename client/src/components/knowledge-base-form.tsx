import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, BASE_URL } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import axios from "axios";

interface KnowledgeBaseFormProps {
  onSuccess?: () => void;
}

export function KnowledgeBaseForm({ onSuccess }: KnowledgeBaseFormProps) {
  const [type, setType] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);
    setStatusMessage("Starting upload...");

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("User not found");
      const user = JSON.parse(userStr);
      const tenantId = user.tenantId;
      const token = localStorage.getItem("token");

      if (type === "url") {
        setStatusMessage("Ingesting URL...");
        // Simulate progress for URL since it's fast but processing might take time
        const interval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 500);

        await apiRequest("POST", "/kb/ingest/url", { url });

        clearInterval(interval);
        setUploadProgress(100);
        setStatusMessage("URL successfully ingested and learned!");
      } else if (type === "document" && file) {
        const formData = new FormData();
        formData.append("file", file);

        setStatusMessage("Uploading document...");

        // Use axios for upload progress
        await axios.post(`${BASE_URL}/api/kb/ingest/document`, formData, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
            setUploadProgress(percentCompleted);
            if (percentCompleted === 100) {
              setStatusMessage("Processing and learning content...");
            }
          }
        });

        setStatusMessage("Document successfully uploaded and learned!");
      } else {
        console.log("Not implemented yet");
      }

      toast({
        title: "Content Added Successfully",
        description: `Your ${type} has been added to the knowledge base.`,
      });

      // Reset form after a delay to show success state
      setTimeout(() => {
        setType("");
        setContent("");
        setUrl("");
        setFile(null);
        setUploadProgress(0);
        setStatusMessage("");
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
      }, 2000);

      return; // Return early to avoid setting isSubmitting to false immediately

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add content",
      });
      setStatusMessage("Failed to upload.");
    } finally {
      if (statusMessage !== "Document successfully uploaded and learned!" && statusMessage !== "URL successfully ingested and learned!") {
        setIsSubmitting(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast({
        title: "File Selected",
        description: e.target.files[0].name,
      });
    }
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
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.docx"
                    className="cursor-pointer"
                  />
                </div>
                {file && <p className="text-sm text-muted-foreground mt-1">Selected: {file.name}</p>}
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

            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{statusMessage}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!type || (type === "faq" && !content) || (type === "url" && !url) || (type === "document" && !file) || isSubmitting}
              data-testid="button-submit-content"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Add to Knowledge Base"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}