import { ApiKeyDialog } from "../ApiKeyDialog";
import { Button } from "@/components/ui/button";

export default function ApiKeyDialogExample() {
  return (
    <ApiKeyDialog onSave={(key) => console.log("API key saved:", key.substring(0, 10) + "...")}>
      <Button variant="outline">Configure API Key</Button>
    </ApiKeyDialog>
  );
}
