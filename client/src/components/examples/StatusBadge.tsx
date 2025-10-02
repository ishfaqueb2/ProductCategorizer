import { StatusBadge } from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="high-confidence" confidence={0.94} />
      <StatusBadge status="low-confidence" confidence={0.62} />
      <StatusBadge status="processing" />
      <StatusBadge status="error" />
    </div>
  );
}
