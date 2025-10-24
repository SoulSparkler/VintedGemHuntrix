export function hallmarkToPurity(hallmark: string): { karat: string; percentage: number; metal: string } | null {
  const normalized = hallmark.replace(/\D/g, "");
  const value = parseInt(normalized);

  if (isNaN(value)) return null;

  if (value === 585) return { karat: "14K", percentage: 58.5, metal: "Gold" };
  if (value === 750) return { karat: "18K", percentage: 75.0, metal: "Gold" };
  if (value === 916) return { karat: "22K", percentage: 91.6, metal: "Gold" };
  if (value === 925) return { karat: "Sterling Silver", percentage: 92.5, metal: "Silver" };
  if (value === 999) return { karat: "Fine Gold", percentage: 99.9, metal: "Gold" };

  return null;
}
