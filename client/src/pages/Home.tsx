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
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("upload");
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [taxonomyFile, setTaxonomyFile] = useState<File | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    setHasApiKey(!!savedKey);
  }, []);

  useEffect(() => {
    if (productFile) {
      uploadProductFile();
    }
  }, [productFile]);

  const uploadProductFile = async () => {
    if (!productFile) return;

    const formData = new FormData();
    formData.append("file", productFile);

    try {
      const response = await fetch("/api/upload/product", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload file");

      const data = await response.json();
      setDetectedColumns(data.headers);
      toast({
        title: "File uploaded",
        description: `Detected ${data.rowCount} products with ${data.headers.length} columns`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    }
  };

  const handleNext = () => {
    const steps: WizardStep[] = ["upload", "map", "taxonomy", "configure", "process", "export"];
    const currentIndex = steps.findIndex((s) => s === currentStep);
    
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
    const currentIndex = steps.findIndex((s) => s === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const startProcessing = async () => {
    if (!productFile || !taxonomyFile) {
      toast({
        variant: "destructive",
        title: "Missing files",
        description: "Both product and taxonomy files are required",
      });
      return;
    }

    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "API key required",
        description: "Please configure your Gemini API key first",
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep("process");

    try {
      const formData = new FormData();
      formData.append("productFile", productFile);
      formData.append("taxonomyFile", taxonomyFile);
      formData.append("columnMappings", JSON.stringify(columnMappings));
      formData.append("confidenceThreshold", confidenceThreshold.toString());

      const sessionResponse = await fetch("/api/sessions", {
        method: "POST",
        body: formData,
      });

      if (!sessionResponse.ok) throw new Error("Failed to create session");

      const sessionData = await sessionResponse.json();
      setSessionId(sessionData.sessionId);

      const totalChunks = Math.ceil(sessionData.totalProducts / 500);
      setProcessingProgress({ current: 0, total: totalChunks });

      const categorizeResponse = await fetch(`/api/sessions/${sessionData.sessionId}/categorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      if (!categorizeResponse.ok) throw new Error("Categorization failed");

      const result = await categorizeResponse.json();
      setResults(result.products);
      setProcessingProgress({ current: totalChunks, total: totalChunks });
      setIsProcessing(false);
      setCompletedSteps([...completedSteps, "process"]);
      setCurrentStep("export");

      toast({
        title: "Processing complete",
        description: `Successfully categorized ${result.products.length} products`,
      });
    } catch (error: any) {
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: error.message,
      });
      setCurrentStep("configure");
    }
  };

  const handleExport = async (type: "all" | "low-confidence", format: "csv" | "xlsx") => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/export?filter=${type}&format=${format}`
      );

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-${sessionId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Downloaded ${type === "all" ? "all" : "low confidence"} results as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error.message,
      });
    }
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleExport("all", "csv")}
                      variant="default"
                      data-testid="button-export-all-csv"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All (CSV)
                    </Button>
                    <Button
                      onClick={() => handleExport("all", "xlsx")}
                      variant="default"
                      data-testid="button-export-all-xlsx"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All (XLSX)
                    </Button>
                    <Button
                      onClick={() => handleExport("low-confidence", "csv")}
                      variant="outline"
                      data-testid="button-export-low-csv"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Low Confidence (CSV)
                    </Button>
                    <Button
                      onClick={() => handleExport("low-confidence", "xlsx")}
                      variant="outline"
                      data-testid="button-export-low-xlsx"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Low Confidence (XLSX)
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
