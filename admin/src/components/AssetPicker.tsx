import { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import type { Asset } from "../types";
import { Button, Card, ErrorBanner, Field, Input, Spinner } from "./ui";

export function AssetPicker({ onSelect, onClose }: { onSelect: (asset: Asset) => void; onClose: () => void }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<{ items: Asset[] }>("/api/v1/admin/assets")
      .then((res) => setAssets(res.items))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load assets"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async () => {
    if (!file || !altText.trim()) {
      setError("Choose a file and enter alt text first.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", altText.trim());
      const asset = await api.upload<Asset>("/api/v1/admin/assets", formData);
      setFile(null);
      setAltText("");
      onSelect(asset);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <Card className="flex max-h-[80vh] w-full max-w-2xl flex-col p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Choose an image</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ErrorBanner message={error} />

        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-white/10 p-4">
          <Field label="New file">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-xs text-white/60"
            />
          </Field>
          <Field label="Alt text">
            <Input value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe the image" />
          </Field>
          <Button onClick={handleUpload} loading={uploading}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => onSelect(asset)}
                  className="group overflow-hidden rounded-lg border border-white/10 text-left transition hover:border-accent-from/60"
                >
                  <div className="aspect-square bg-black/40">
                    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                    <img src={asset.url} alt={asset.altText} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.opacity = "0.15")} />
                  </div>
                  <p className="truncate p-1.5 text-[11px] text-white/50 group-hover:text-white">{asset.altText}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
