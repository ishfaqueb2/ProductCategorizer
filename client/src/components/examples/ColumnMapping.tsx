import { ColumnMapping } from "../ColumnMapping";
import { useState } from "react";

export default function ColumnMappingExample() {
  const [mappings, setMappings] = useState({
    id: "product_id",
    name: "title",
    brand: "",
    description: "",
  });

  return (
    <div className="max-w-4xl">
      <ColumnMapping
        detectedColumns={["product_id", "title", "brand_name", "desc", "image_url"]}
        mappings={mappings}
        onMappingChange={(field, column) => {
          console.log(`Mapping ${field} to ${column}`);
          setMappings({ ...mappings, [field]: column });
        }}
      />
    </div>
  );
}
