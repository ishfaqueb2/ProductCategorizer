import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function ConfidenceSlider({ value, onChange }: ConfidenceSliderProps) {
  return (
    <div className="space-y-6" data-testid="confidence-slider">
      <div className="text-center">
        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Confidence Threshold
        </Label>
        <div className="text-4xl font-semibold mt-2" data-testid="text-confidence-value">
          {(value * 100).toFixed(0)}%
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Products below this threshold will be flagged for review
        </p>
      </div>

      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={0}
          max={1}
          step={0.05}
          className="w-full"
          data-testid="slider-confidence"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low (0%)</span>
          <span>High (100%)</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="h-2 bg-destructive rounded-full mb-2" />
          <span className="text-muted-foreground">0-30%</span>
        </div>
        <div>
          <div className="h-2 bg-warning rounded-full mb-2" />
          <span className="text-muted-foreground">30-70%</span>
        </div>
        <div>
          <div className="h-2 bg-success rounded-full mb-2" />
          <span className="text-muted-foreground">70-100%</span>
        </div>
      </div>
    </div>
  );
}
