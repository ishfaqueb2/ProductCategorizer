import { StatusBadge } from "./StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Product {
  id: string;
  name: string;
  taxonomyId?: string;
  taxonomyPath?: string;
  confidenceScore?: number;
  status: "high-confidence" | "low-confidence" | "processing" | "error";
}

interface ResultsTableProps {
  products: Product[];
  confidenceThreshold: number;
}

export function ResultsTable({ products, confidenceThreshold }: ResultsTableProps) {
  return (
    <div className="border rounded-lg" data-testid="results-table">
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="font-semibold">Product ID</TableHead>
              <TableHead className="font-semibold">Product Name</TableHead>
              <TableHead className="font-semibold">Taxonomy ID</TableHead>
              <TableHead className="font-semibold">Taxonomy Path</TableHead>
              <TableHead className="font-semibold">Confidence</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => {
              const isLowConfidence =
                product.confidenceScore !== undefined &&
                product.confidenceScore < confidenceThreshold;

              return (
                <TableRow
                  key={product.id}
                  className={`
                    ${isLowConfidence ? "bg-warning/5 border-l-4 border-l-warning" : ""}
                    ${index % 2 === 0 && !isLowConfidence ? "bg-card" : ""}
                  `}
                  data-testid={`row-product-${product.id}`}
                >
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.taxonomyId || "-"}
                  </TableCell>
                  <TableCell className="text-sm">{product.taxonomyPath || "-"}</TableCell>
                  <TableCell>
                    {product.confidenceScore !== undefined ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              product.confidenceScore >= 0.7
                                ? "bg-success"
                                : product.confidenceScore >= 0.3
                                  ? "bg-warning"
                                  : "bg-destructive"
                            }`}
                            style={{ width: `${product.confidenceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {(product.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={product.status}
                      confidence={product.confidenceScore}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
