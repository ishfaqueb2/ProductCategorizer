import { Header } from "../Header";
import { useState } from "react";

export default function HeaderExample() {
  const [hasApiKey, setHasApiKey] = useState(false);

  return (
    <div className="min-h-screen">
      <Header
        hasApiKey={hasApiKey}
        onApiKeySave={(key) => {
          console.log("API key saved");
          setHasApiKey(true);
        }}
      />
    </div>
  );
}
