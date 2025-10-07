import MaterialBadge from '../MaterialBadge';

export default function MaterialBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-6">
      <MaterialBadge material="14K Gold" />
      <MaterialBadge material="925 Silver" />
      <MaterialBadge material="Real Pearl" />
      <MaterialBadge material="Diamond" />
    </div>
  );
}
