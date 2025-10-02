import { Key, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { ApiKeyDialog } from "./ApiKeyDialog";

interface HeaderProps {
  hasApiKey: boolean;
  onApiKeySave: (apiKey: string) => void;
}

export function Header({ hasApiKey, onApiKeySave }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">P</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Product Categorizer</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Taxonomy</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ApiKeyDialog onSave={onApiKeySave}>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              data-testid="button-api-key-status"
            >
              <Key className="h-4 w-4" />
              {hasApiKey ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="hidden sm:inline">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="hidden sm:inline">Configure</span>
                </>
              )}
            </Button>
          </ApiKeyDialog>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
