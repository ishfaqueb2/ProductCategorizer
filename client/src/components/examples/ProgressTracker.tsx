import { ProgressTracker } from "../ProgressTracker";

export default function ProgressTrackerExample() {
  return (
    <ProgressTracker
      currentChunk={3}
      totalChunks={12}
      isProcessing={true}
      onCancel={() => console.log("Cancel processing")}
    />
  );
}
