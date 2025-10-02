import { ResultsTable } from "../ResultsTable";

export default function ResultsTableExample() {
  const mockProducts = [
    {
      id: "1123",
      name: "Women's Rib Midi Dress",
      taxonomyId: "30",
      taxonomyPath: "Apparel > Women's Clothing > Dresses",
      confidenceScore: 0.94,
      status: "high-confidence" as const,
    },
    {
      id: "1124",
      name: "Belden Wallet",
      taxonomyId: "128",
      taxonomyPath: "Accessories > Wallets",
      confidenceScore: 0.62,
      status: "low-confidence" as const,
    },
    {
      id: "1125",
      name: "Running Shoes",
      taxonomyId: "45",
      taxonomyPath: "Footwear > Athletic > Running",
      confidenceScore: 0.88,
      status: "high-confidence" as const,
    },
    {
      id: "1126",
      name: "Laptop Backpack",
      taxonomyId: "92",
      taxonomyPath: "Bags > Backpacks > Tech",
      confidenceScore: 0.45,
      status: "low-confidence" as const,
    },
  ];

  return (
    <div className="max-w-6xl">
      <ResultsTable products={mockProducts} confidenceThreshold={0.7} />
    </div>
  );
}
