export const ADULT_TOOTH_NAMES: Record<number, string> = {
  // Upper Right
  1: 'Upper Right Third Molar',
  2: 'Upper Right Second Molar',
  3: 'Upper Right First Molar',
  4: 'Upper Right Second Premolar',
  5: 'Upper Right First Premolar',
  6: 'Upper Right Canine',
  7: 'Upper Right Lateral Incisor',
  8: 'Upper Right Central Incisor',
  // Upper Left
  9: 'Upper Left Central Incisor',
  10: 'Upper Left Lateral Incisor',
  11: 'Upper Left Canine',
  12: 'Upper Left First Premolar',
  13: 'Upper Left Second Premolar',
  14: 'Upper Left First Molar',
  15: 'Upper Left Second Molar',
  16: 'Upper Left Third Molar',
  // Lower Left
  17: 'Lower Left Third Molar',
  18: 'Lower Left Second Molar',
  19: 'Lower Left First Molar',
  20: 'Lower Left Second Premolar',
  21: 'Lower Left First Premolar',
  22: 'Lower Left Canine',
  23: 'Lower Left Lateral Incisor',
  24: 'Lower Left Central Incisor',
  // Lower Right
  25: 'Lower Right Central Incisor',
  26: 'Lower Right Lateral Incisor',
  27: 'Lower Right Canine',
  28: 'Lower Right First Premolar',
  29: 'Lower Right Second Premolar',
  30: 'Lower Right First Molar',
  31: 'Lower Right Second Molar',
  32: 'Lower Right Third Molar',
};

export const PEDIATRIC_TOOTH_NAMES: Record<string, string> = {
  'A': 'Upper Right Second Molar',
  'B': 'Upper Right First Molar',
  'C': 'Upper Right Canine',
  'D': 'Upper Right Lateral Incisor',
  'E': 'Upper Right Central Incisor',
  'F': 'Upper Left Central Incisor',
  'G': 'Upper Left Lateral Incisor',
  'H': 'Upper Left Canine',
  'I': 'Upper Left First Molar',
  'J': 'Upper Left Second Molar',
  'K': 'Lower Left Second Molar',
  'L': 'Lower Left First Molar',
  'M': 'Lower Left Canine',
  'N': 'Lower Left Lateral Incisor',
  'O': 'Lower Left Central Incisor',
  'P': 'Lower Right Central Incisor',
  'Q': 'Lower Right Lateral Incisor',
  'R': 'Lower Right Canine',
  'S': 'Lower Right First Molar',
  'T': 'Lower Right Second Molar',
};

export function getToothName(tooth: number | string, isPediatric: boolean): string {
  if (isPediatric) {
    return PEDIATRIC_TOOTH_NAMES[tooth as string] || `Tooth ${tooth}`;
  }
  return ADULT_TOOTH_NAMES[tooth as number] || `Tooth ${tooth}`;
}
