import type { BarcodeType, GeneratorSettings } from "@/types";

export const BARCODE_TYPES: ReadonlyArray<{ id: BarcodeType; label: string; description: string }> = [
  { id: "code128", label: "Code 128", description: "Flexible alphanumeric barcode" },
  { id: "ean13", label: "EAN-13", description: "Retail code with checksum validation" },
  { id: "qrcode", label: "QR Code", description: "Two-dimensional code for text and URLs" },
];

export const DEFAULT_SETTINGS: GeneratorSettings = {
  barcodeType: "code128",
  labelSize: { preset: "100x50", widthMm: 100, heightMm: 50 },
  showText: true,
  showProductName: true,
  paddingMm: 3,
  scale: 3,
  barcodeHeightMm: 14,
  quietZoneMm: 3,
  background: "#ffffff",
  textAlign: "center",
  printMarginMm: 3,
  itemSpacingMm: 2,
  fontFamily: "Helvetica",
  fontSizePt: 9,
};

export function validateBarcode(type: BarcodeType, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Barcode value is empty.";
  if (type === "code128") return trimmed.length <= 80 ? null : "Code 128 values should be 80 characters or fewer.";
  if (type === "qrcode") return trimmed.length <= 1500 ? null : "QR Code payload exceeds 1500 characters.";
  if (!/^\d{12,13}$/.test(trimmed)) return "EAN-13 requires 12 or 13 numeric digits.";
  if (trimmed.length === 13 && !isValidEan13Checksum(trimmed)) return "EAN-13 checksum digit is incorrect.";
  return null;
}

function isValidEan13Checksum(value: string): boolean {
  const sum = [...value.slice(0, 12)].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === Number(value[12]);
}

export interface BarcodeRenderOptions {
  bcid: string;
  text: string;
  scale: number;
  height: number;
  includetext: boolean;
  textxalign: "left" | "center" | "right";
  paddingwidth: number;
  paddingheight: number;
  guardwhitespace?: boolean;
  backgroundcolor: string;
}

export function buildBarcodeOptions(value: string, settings: GeneratorSettings, scale: number): BarcodeRenderOptions {
  return {
    bcid: settings.barcodeType,
    text: value,
    scale,
    height: settings.barcodeType === "qrcode" ? 10 : settings.barcodeHeightMm,
    includetext: settings.barcodeType === "qrcode" ? false : settings.showText,
    textxalign: settings.textAlign,
    paddingwidth: settings.paddingMm + settings.quietZoneMm,
    paddingheight: settings.paddingMm + settings.quietZoneMm,
    backgroundcolor: settings.background.replace("#", ""),
    ...(settings.barcodeType === "ean13" ? { guardwhitespace: true } : {}),
  };
}
