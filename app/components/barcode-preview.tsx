"use client";

import { useEffect, useState } from "react";
import { barcodeSvg } from "@/lib/exports";

interface BarcodePreviewProps {
  value: string;
}

export function BarcodePreview({ value }: BarcodePreviewProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    void barcodeSvg(value).then((result) => {
      if (active) {
        setSvg(result);
        setError("");
      }
    }).catch(() => {
      if (active) setError("This value cannot be rendered with the selected barcode type.");
    });
    return () => { active = false; };
  }, [value]);

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!svg) return <div className="h-36 animate-pulse rounded-xl bg-slate-100" />;
  return <div className="flex min-h-36 items-center justify-center [&_svg]:max-h-44 [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}
