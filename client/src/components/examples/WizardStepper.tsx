import { WizardStepper } from "../WizardStepper";

export default function WizardStepperExample() {
  return (
    <div className="max-w-4xl">
      <WizardStepper currentStep="configure" completedSteps={["upload", "map", "taxonomy"]} />
    </div>
  );
}
