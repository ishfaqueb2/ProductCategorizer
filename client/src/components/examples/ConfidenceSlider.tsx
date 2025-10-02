import { ConfidenceSlider } from "../ConfidenceSlider";
import { useState } from "react";

export default function ConfidenceSliderExample() {
  const [value, setValue] = useState(0.7);

  return (
    <div className="max-w-2xl">
      <ConfidenceSlider
        value={value}
        onChange={(v) => {
          console.log("Confidence threshold:", v);
          setValue(v);
        }}
      />
    </div>
  );
}
