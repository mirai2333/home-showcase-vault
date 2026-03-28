"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2, Link as LinkIcon, DollarSign, Tag, AlignLeft, ShoppingBag, Globe } from "lucide-react";
import { extractFromImage } from "@/app/actions/ai-actions";

export function AddForm() {
  const [isParsing, setIsParsing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [parsed, setParsed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    platform: "",
    shop: "",
    originalUrl: "",
  });

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 2560;
          const MAX_HEIGHT = 1440;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Quality 0.9 and 2560px max to keep high detail for AI while staying around 2MB
          const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 3MB as originally requested
    if (file.size > 3 * 1024 * 1024) {
      setError("File is too large. Please upload an image under 3MB.");
      return;
    }

    setIsCompressing(true);
    setIsParsing(false);
    setError(null);

    try {
      // Compress the image before sending to AI - targeting 2MB as requested
      const compressedBase64 = await compressImage(file);

      setIsCompressing(false);
      setIsParsing(true);

      // Call AI action
      const result = await extractFromImage(compressedBase64);

      setFormData({
        ...formData,
        name: result.name || result.shop || "New Item",
        category: result.category || "",
        description: result.description || "",
        platform: result.platform || "",
        shop: result.shop || "",
      });
      setParsed(true);
    } catch (err) {
      console.error("Extraction failed:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze image");
    } finally {
      setIsParsing(false);
      setIsCompressing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
      {/* Upload Column */}
      <div className="md:col-span-2 space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <div
          onClick={handleTriggerUpload}
          className={`aspect-4/5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 ${isParsing || isCompressing ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"} ${parsed ? "bg-muted border-solid" : ""} ${error ? "border-red-500 bg-red-50/10" : ""}`}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center gap-4 text-primary animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-medium tracking-wide">Compressing...</span>
            </div>
          ) : isParsing ? (
            <div className="flex flex-col items-center gap-4 text-primary animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-medium tracking-wide">Analyzing Screenshot...</span>
            </div>
          ) : parsed ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <UploadCloud className="w-8 h-8 opacity-50" />
              <span className="text-sm tracking-wide">Analysis complete.</span>
              <button
                className="mt-2 text-xs font-medium text-primary hover:underline underline-offset-4"
                onClick={(e) => { e.stopPropagation(); setParsed(false); setFormData({ ...formData, name: "", price: "", category: "", description: "", platform: "", shop: "" }); setError(null); }}
              >
                Upload another
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="p-4 bg-muted rounded-full mb-2">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="font-medium text-foreground">
                {error ? "Try another screenshot" : "Click to upload screenshot"}
              </span>
              <span className="text-xs text-muted-foreground max-w-xs text-balance">
                {error ? <span className="text-red-500">{error}</span> : "AI will extract store name and product types from your video screenshot."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Form Column */}
      <div className="md:col-span-3">
        <form className="space-y-6 bg-background rounded-2xl">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 ml-1">Title</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Product name"
                className="w-full bg-transparent border-b border-border text-2xl md:text-3xl font-serif px-1 py-2 focus:outline-hidden focus:border-primary transition-colors placeholder:text-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              {/* Platform */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 ml-1">
                  <Globe className="w-3.5 h-3.5" /> Platform
                </label>
                <input
                  type="text"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  placeholder="e.g. Taobao, Amazon"
                  className="w-full bg-muted/50 border border-transparent focus:border-border focus:bg-transparent rounded-lg px-3 py-2.5 text-sm font-medium outline-hidden transition-all"
                />
              </div>

              {/* Shop */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 ml-1">
                  <ShoppingBag className="w-3.5 h-3.5" /> Shop
                </label>
                <input
                  type="text"
                  name="shop"
                  value={formData.shop}
                  onChange={handleChange}
                  placeholder="Store name"
                  className="w-full bg-muted/50 border border-transparent focus:border-border focus:bg-transparent rounded-lg px-3 py-2.5 text-sm font-medium outline-hidden transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 ml-1">
                  <Tag className="w-3.5 h-3.5" /> Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Furniture"
                  className="w-full bg-muted/50 border border-transparent focus:border-border focus:bg-transparent rounded-lg px-3 py-2.5 text-sm font-medium outline-hidden transition-all"
                />
              </div>

              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 ml-1">
                  <DollarSign className="w-3.5 h-3.5" /> Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full bg-muted/50 border border-transparent focus:border-border focus:bg-transparent rounded-lg px-3 py-2.5 text-sm font-medium outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Original URL */}
            <div className="pt-4">
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 ml-1">
                <LinkIcon className="w-3.5 h-3.5" /> Original URL
              </label>
              <input
                type="url"
                name="originalUrl"
                value={formData.originalUrl}
                onChange={handleChange}
                placeholder="https://original-store.com/item"
                className="w-full bg-muted/50 border border-transparent focus:border-border focus:bg-transparent rounded-lg px-3 py-2.5 text-sm font-medium outline-hidden transition-all"
              />
            </div>

            {/* Description */}
            <div className="pt-4">
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 ml-1">
                <AlignLeft className="w-3.5 h-3.5" /> Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add notes about why you saved this..."
                rows={4}
                className="w-full bg-transparent border border-border rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-primary transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              className="w-full bg-foreground text-background font-medium py-4 rounded-xl shadow-lg hover:bg-foreground/90 transition-all hover:-translate-y-0.5"
            >
              Add to Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
