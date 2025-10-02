import { useState, useEffect } from "react";
import { Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiKeyDialogProps {
  children: React.ReactNode;
  onSave: (apiKey: string) => void;
}

export function ApiKeyDialog({ children, onSave }: ApiKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gemini_api_key");
    if (saved) setApiKey(saved);
  }, [open]);

  const handleSave = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    onSave(apiKey);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent data-testid="dialog-api-key">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gemini API Key
          </DialogTitle>
          <DialogDescription>
            Enter your Gemini API key to enable AI-powered product categorization. Your
            key is stored locally and never sent to our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Gemini API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              data-testid="input-api-key"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Don't have an API key?{" "}
            <a
              href="https://ai.google.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Get one from Google AI Studio
            </a>
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-api-key">
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
