/**
 * Core domain types for Barcode Generator Pro.
 */

/** Supported barcode symbologies. */
export type BarcodeType = "code128" | "ean13" | "qrcode";

/** A single row parsed from an imported spreadsheet. */
export interface ProductRow {
  /** Stable unique id used as React key. */
  id: string;
  /** The barcode value to encode. */
  barcode: string;
  /** Human readable product name. */
  productName: string;
  /** Whether the row passed validation. */
  valid: boolean;
  /** Validation error message (if any). */
  error?: string;
  /** Any extra columns from the spreadsheet, preserved verbatim. */
  extra: Record<string, string>;
}

/** Label size preset identifiers. */
export type LabelPresetId = "100x50" | "80x50" | "50x30" | "custom";

/** Label dimensions in millimeters. */
export interface LabelSize {
  /** Preset id, or "custom". */
  preset: LabelPresetId;
  /** Width in millimeters. */
  widthMm: number;
  /** Height in millimeters. */
  heightMm: number;
}

/** All settings that influence barcode rendering and export. */
export interface GeneratorSettings {
  /** Active barcode symbology. */
  barcodeType: BarcodeType;
  /** Label dimensions. */
  labelSize: LabelSize;
  /** Whether to render the human-readable text under the barcode. */
  showText: boolean;
  /** Optional title printed above each label in the PDF. */
  showProductName: boolean;
  /** Horizontal padding inside the label in millimeters. */
  paddingMm: number;
  scale: number;
  barcodeHeightMm: number;
  quietZoneMm: number;
  background: string;
  textAlign: "left" | "center" | "right";
  printMarginMm: number;
  itemSpacingMm: number;
  fontFamily: "Helvetica" | "Helvetica-Bold" | "Courier" | "Times-Roman";
  fontSizePt: number;
}

/** Result of parsing an Excel file. */
export interface ParseResult {
  rows: ProductRow[];
  /** Total rows read (including invalid). */
  total: number;
  /** Number of valid rows. */
  validCount: number;
  /** Column headers found in the file. */
  headers: string[];
  /** Error message if parsing failed entirely. */
  error?: string;
}

/** Request body for the PDF generation endpoint. */
export interface PdfRequest {
  rows: Array<{ barcode: string; productName: string }>;
  settings: GeneratorSettings;
}

/** Request body for the PNG/SVG ZIP endpoints. */
export interface BatchRequest {
  rows: Array<{ barcode: string; productName: string }>;
  settings: GeneratorSettings;
}
