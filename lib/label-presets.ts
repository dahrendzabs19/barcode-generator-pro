import type { LabelPresetId, LabelSize } from "@/types";

/** Available label presets in millimeters. */
export const LABEL_PRESETS: ReadonlyArray<{
  id: LabelPresetId;
  label: string;
  widthMm: number;
  heightMm: number;
}> = [
  { id: "100x50", label: "100 × 50 mm", widthMm: 100, heightMm: 50 },
  { id: "80x50", label: "80 × 50 mm", widthMm: 80, heightMm: 50 },
  { id: "50x30", label: "50 × 30 mm", widthMm: 50, heightMm: 30 },
];

/** Default label size (100 × 50 mm). */
export const DEFAULT_LABEL_SIZE: LabelSize = {
  preset: "100x50",
  widthMm: 100,
  heightMm: 50,
};

/** Resolve a preset id to its dimensions, falling back to custom values. */
export function resolveLabelSize(
  preset: LabelPresetId,
  customWidth: number,
  customHeight: number,
): LabelSize {
  const found = LABEL_PRESETS.find((p) => p.id === preset);
  if (found) {
    return { preset, widthMm: found.widthMm, heightMm: found.heightMm };
  }
  return { preset: "custom", widthMm: customWidth, heightMm: customHeight };
}