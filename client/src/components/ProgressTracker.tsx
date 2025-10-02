import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgressTrackerProps {
  currentChunk: number;
  totalChunks: number;
  isProcessing: boolean;
  onCancel?: () => void;
}

export function ProgressTracker({
  currentChunk,
  totalChunks,
  isProcessing,
  onCancel,
}: ProgressTrackerProps) {
  const progress = totalChunks > 0 ? (currentChunk / totalChunks) * 100 : 0;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      data-testid="progress-tracker"
    >
      <div className="bg-card rounded-lg p-8 shadow-2xl max-w-md w-full mx-4 border border-card-border">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>

          <div className="space-y-2 w-full">
            <h3 className="text-xl font-semibold">Processing Products</h3>
            <p className="text-muted-foreground" data-testid="text-chunk-progress">
              Processing chunk {currentChunk} of {totalChunks}
            </p>
          </div>

          <div className="w-full space-y-2">
            <Progress value={progress} className="h-2" data-testid="progress-bar" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentChunk} chunks</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Categorizing products using AI...
          </p>

          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={!isProcessing}
              data-testid="button-cancel-processing"
            >
              Cancel Processing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
