import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { WizardStepper, type WizardStep } from "@/components/WizardStepper";
import { FileUpload } from "@/components/FileUpload";
import { ColumnMapping } from "@/components/ColumnMapping";
import { ConfidenceSlider } from "@/components/ConfidenceSlider";
import { ProgressTracker } from "@/components/ProgressTracker";
import { ResultsTable } from "@/components/ResultsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ArrowRight, ArrowLeft } from "lucide-react";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("upload");
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [taxonomyFile, setTaxonomyFile] = useState<File | null>(null);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    setHasApiKey(!!savedKey);
  }, []);

  const detectedColumns = ["product_id", "title", "brand_name", "description", "image_url"];

  const handleNext = () => {
    const steps: WizardStep[] = ["upload", "map", "taxonomy", "configure", "process", "export"];
    const currentIndex = steps.indexOf(currentStep);
    
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep === "configure") {
      startProcessing();
    } else if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: WizardStep[] = ["upload", "map", "taxonomy", "configure", "process", "export"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const startProcessing = () => {
    setIsProcessing(true);
    setCurrentStep("process");
    setProcessingProgress({ current: 0, total: 12 });

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev.current >= prev.total) {
          clearInterval(interval);
          setIsProcessing(false);
          setCompletedSteps([...completedSteps, "process"]);
          setCurrentStep("export");
          setResults([
            {
              id: "1123",
              name: "Women's Rib Midi Dress",
              taxonomyId: "30",
              taxonomyPath: "Apparel > Women's Clothing > Dresses",
              confidenceScore: 0.94,
              status: "high-confidence",
            },
            {
              id: "1124",
              name: "Belden Wallet",
              taxonomyId: "128",
              taxonomyPath: "Accessories > Wallets",
              confidenceScore: 0.62,
              status: "low-confidence",
            },
            {
              id: "1125",
              name: "Running Shoes",
              taxonomyId: "45",
              taxonomyPath: "Footwear > Athletic > Running",
              confidenceScore: 0.88,
              status: "high-confidence",
            },
          ]);
          return prev;
        }
        return { ...prev, current: prev.current + 1 };
      });
    }, 500);
  };

  const handleExport = (type: "all" | "low-confidence") => {
    console.log(`Exporting ${type} results`);
  };

  const canProceed = () => {
    if (currentStep === "upload") return productFile !== null;
    if (currentStep === "map") {
      return columnMappings.id && columnMappings.name && columnMappings.brand && columnMappings.description;
    }
    if (currentStep === "taxonomy") return taxonomyFile !== null;
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header hasApiKey={hasApiKey} onApiKeySave={() => setHasApiKey(true)} />

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight mb-2">
              AI-Powered Product Categorization
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload your products and let AI categorize them into your taxonomy
            </p>
          </div>

          <WizardStepper currentStep={currentStep} completedSteps={completedSteps} />

          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === "upload" && "Upload Product File"}
                {currentStep === "map" && "Map Your Columns"}
                {currentStep === "taxonomy" && "Upload Taxonomy File"}
                {currentStep === "configure" && "Configure Settings"}
                {currentStep === "process" && "Processing"}
                {currentStep === "export" && "Export Results"}
              </CardTitle>
              <CardDescription>
                {currentStep === "upload" && "Upload your product data in CSV or XLSX format"}
                {currentStep === "map" && "Map your file columns to the required fields"}
                {currentStep === "taxonomy" && "Upload your taxonomy hierarchy file"}
                {currentStep === "configure" && "Set confidence threshold for categorization"}
                {currentStep === "process" && "AI is categorizing your products"}
                {currentStep === "export" && "Review and download your categorized products"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === "upload" && (
                <FileUpload
                  title="Drag and drop your product file here"
                  description="or click to browse"
                  selectedFile={productFile}
                  onFileSelect={setProductFile}
                />
              )}

              {currentStep === "map" && (
                <ColumnMapping
                  detectedColumns={detectedColumns}
                  mappings={columnMappings}
                  onMappingChange={(field, column) => {
                    setColumnMappings({ ...columnMappings, [field]: column });
                  }}
                />
              )}

              {currentStep === "taxonomy" && (
                <FileUpload
                  title="Drag and drop your taxonomy file here"
                  description="or click to browse"
                  selectedFile={taxonomyFile}
                  onFileSelect={setTaxonomyFile}
                />
              )}

              {currentStep === "configure" && (
                <ConfidenceSlider
                  value={confidenceThreshold}
                  onChange={setConfidenceThreshold}
                />
              )}

              {currentStep === "export" && (
                <div className="space-y-6">
                  <ResultsTable products={results} confidenceThreshold={confidenceThreshold} />

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleExport("all")}
                      className="flex-1"
                      data-testid="button-export-all"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All Results
                    </Button>
                    <Button
                      onClick={() => handleExport("low-confidence")}
                      variant="outline"
                      className="flex-1"
                      data-testid="button-export-low-confidence"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Low Confidence Only
                    </Button>
                  </div>
                </div>
              )}

              {currentStep !== "process" && currentStep !== "export" && (
                <div className="flex gap-3 pt-4">
                  {currentStep !== "upload" && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      data-testid="button-back"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="ml-auto"
                    data-testid="button-next"
                  >
                    {currentStep === "configure" ? "Start Processing" : "Next"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {isProcessing && (
        <ProgressTracker
          currentChunk={processingProgress.current}
          totalChunks={processingProgress.total}
          isProcessing={isProcessing}
          onCancel={() => {
            setIsProcessing(false);
            setCurrentStep("configure");
          }}
        />
      )}
    </div>
  );
}
