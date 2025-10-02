import { Check } from "lucide-react";

export type WizardStep = "upload" | "map" | "taxonomy" | "configure" | "process" | "export";

interface WizardStepperProps {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
}

const steps: { id: WizardStep; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "map", label: "Map Columns" },
  { id: "taxonomy", label: "Taxonomy" },
  { id: "configure", label: "Configure" },
  { id: "process", label: "Process" },
  { id: "export", label: "Export" },
];

export function WizardStepper({ currentStep, completedSteps }: WizardStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full" data-testid="wizard-stepper">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                    ${isCompleted || isPast ? "bg-success text-white" : ""}
                    ${isCurrent && !isCompleted ? "bg-primary text-primary-foreground" : ""}
                    ${!isCurrent && !isCompleted && !isPast ? "bg-muted text-muted-foreground" : ""}
                  `}
                  data-testid={`step-${step.id}`}
                >
                  {isCompleted || isPast ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`
                    text-xs mt-2 font-medium whitespace-nowrap
                    ${isCurrent ? "text-foreground" : "text-muted-foreground"}
                  `}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                    h-0.5 flex-1 mx-2 -mt-6 transition-colors
                    ${isPast || isCompleted ? "bg-success" : "bg-border"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
