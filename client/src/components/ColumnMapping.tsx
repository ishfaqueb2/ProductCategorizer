import { ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ColumnMappingProps {
  detectedColumns: string[];
  mappings: Record<string, string>;
  onMappingChange: (field: string, column: string) => void;
}

const requiredFields = [
  { id: "id", label: "Product ID", required: true },
  { id: "name", label: "Product Name", required: true },
  { id: "brand", label: "Brand", required: true },
  { id: "description", label: "Description", required: true },
  { id: "images", label: "Images (Optional)", required: false },
];

export function ColumnMapping({
  detectedColumns,
  mappings,
  onMappingChange,
}: ColumnMappingProps) {
  return (
    <div className="space-y-6" data-testid="column-mapping">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6">
        <div>
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
            Your Columns
          </h3>
          <div className="space-y-2">
            {detectedColumns.map((col) => (
              <div
                key={col}
                className="px-4 py-2 bg-muted rounded-md text-sm font-medium"
                data-testid={`detected-column-${col}`}
              >
                {col}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
            Required Fields
          </h3>
          <div className="space-y-4">
            {requiredFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={`field-${field.id}`} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Select
                  value={mappings[field.id] || ""}
                  onValueChange={(value) => onMappingChange(field.id, value)}
                >
                  <SelectTrigger
                    id={`field-${field.id}`}
                    data-testid={`select-field-${field.id}`}
                  >
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    {detectedColumns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
