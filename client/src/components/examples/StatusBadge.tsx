import StatusBadge from '../StatusBadge';

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-6">
      <StatusBadge status="active" />
      <StatusBadge status="paused" />
      <StatusBadge status="scanning" />
    </div>
  );
}
