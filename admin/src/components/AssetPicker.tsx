import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ImagePlus, Trash2, Upload, X } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import type { Asset } from "../types";
import { Button, Card, ErrorBanner, Input, Spinner } from "./ui";

interface PendingFile {
  key: string;
  file: File;
  preview: string;
  alt: string;
}

type PickerProps = {
  onClose: () => void;
} & (
  | { onSelect: (asset: Asset) => void; onSelectMany?: undefined }
  // Multi mode: several files can be chosen and uploaded at once (each with its
  // own alt text), and existing library images can be ticked instead of
  // clicked-to-close. Everything comes back through one callback.
  | { onSelectMany: (assets: Asset[]) => void; onSelect?: undefined }
);

export function AssetPicker(props: PickerProps) {
  const { onClose } = props;
  const multiple = props.onSelectMany !== undefined;

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get<{ items: Asset[] }>("/api/v1/admin/assets")
      .then((res) => setAssets(res.items))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load assets"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !uploading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, uploading]);

  // Preview URLs are object URLs — release them when the dialog goes away.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(() => () => pendingRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const incoming = Array.from(list).map((file) => ({
      key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: URL.createObjectURL(file),
      alt: "",
    }));
    setPending((prev) => (multiple ? [...prev, ...incoming] : incoming));
    if (!multiple) revokePreviews(pending);
    setError("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const removePending = (key: string) => {
    setPending((prev) => {
      prev.filter((p) => p.key === key).forEach((p) => URL.revokeObjectURL(p.preview));
      return prev.filter((p) => p.key !== key);
    });
  };

  const setAlt = (key: string, alt: string) =>
    setPending((prev) => prev.map((p) => (p.key === key ? { ...p, alt } : p)));

  const toggleSelected = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const finish = (chosen: Asset[]) => {
    if (props.onSelectMany) props.onSelectMany(chosen);
    else if (chosen[0]) props.onSelect(chosen[0]);
  };

  const handleUpload = async () => {
    if (!pending.length) return;
    if (pending.some((p) => !p.alt.trim())) {
      setError("Every photo needs its own alt text before uploading.");
      return;
    }
    setUploading(true);
    setError("");

    const uploaded: Asset[] = [];
    const failed: PendingFile[] = [];
    let failureMessage = "";
    for (const item of pending) {
      try {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("altText", item.alt.trim());
        uploaded.push(await api.upload<Asset>("/api/v1/admin/assets", formData));
        URL.revokeObjectURL(item.preview);
      } catch (err) {
        failed.push(item);
        failureMessage ||= err instanceof ApiRequestError ? err.message : "Upload failed";
      }
    }
    setUploading(false);

    if (!failed.length) {
      finish(multiple ? [...selectedAssets(), ...uploaded] : uploaded);
      return;
    }

    // Partial failure: keep what worked (it's in the library now and ticked),
    // leave the failed files in place so they can be retried.
    setAssets((prev) => [...uploaded, ...prev]);
    setSelectedIds((prev) => [...prev, ...uploaded.map((a) => a.id)]);
    setPending(failed);
    setError(`${failed.length} of ${failed.length + uploaded.length} failed to upload: ${failureMessage}`);
  };

  const selectedAssets = () => assets.filter((a) => selectedIds.includes(a.id));

  const uploadLabel = pending.length > 1 ? `Upload ${pending.length} photos` : "Upload";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <Card
        className="flex max-h-[85vh] w-full max-w-2xl flex-col p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={multiple ? "Choose images" : "Choose an image"}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{multiple ? "Add photos" : "Choose an image"}</h3>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ErrorBanner message={error} />

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <div className="rounded-lg border border-dashed border-white/15 p-4">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple={multiple}
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={() => fileInput.current?.click()} disabled={uploading}>
                <ImagePlus className="h-4 w-4" />
                {pending.length ? (multiple ? "Choose more files" : "Choose a different file") : multiple ? "Choose files" : "Choose file"}
              </Button>
              <span className="text-xs text-white/40">
                {pending.length
                  ? `${pending.length} file${pending.length === 1 ? "" : "s"} ready`
                  : multiple
                    ? "Select as many images as you like"
                    : "No file chosen"}
              </span>
            </div>

            {pending.length > 0 && (
              <div className="mt-4 space-y-3">
                {pending.map((p) => (
                  <div key={p.key} className="flex items-center gap-3 rounded-lg border border-white/10 p-2.5">
                    <img src={p.preview} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="truncate text-[11px] text-white/40">{p.file.name}</p>
                      <Input
                        className="w-full"
                        value={p.alt}
                        onChange={(e) => setAlt(p.key, e.target.value)}
                        placeholder="Alt text — describe this image"
                        disabled={uploading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePending(p.key)}
                      disabled={uploading}
                      className="shrink-0 text-white/30 hover:text-red-400 disabled:opacity-40"
                      aria-label={`Remove ${p.file.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button type="button" onClick={handleUpload} loading={uploading}>
                  <Upload className="h-4 w-4" />
                  {uploadLabel}
                </Button>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/50">
              {multiple ? "Or pick from your library" : "Your library"}
            </p>
            {loading ? (
              <Spinner />
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {assets.map((asset) => {
                  const selected = selectedIds.includes(asset.id);
                  return (
                    <button
                      type="button"
                      key={asset.id}
                      onClick={() => (multiple ? toggleSelected(asset.id) : finish([asset]))}
                      className={`group relative overflow-hidden rounded-lg border text-left transition ${
                        selected ? "border-accent-from" : "border-white/10 hover:border-accent-from/60"
                      }`}
                    >
                      <div className="aspect-square bg-black/40">
                        <img src={asset.url} alt={asset.altText} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.opacity = "0.15")} />
                      </div>
                      {selected && (
                        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-from text-black">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <p className="truncate p-1.5 text-[11px] text-white/50 group-hover:text-white">{asset.altText}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {multiple && (
          <div className="mt-4 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button type="button" onClick={() => finish(selectedAssets())} disabled={uploading || !selectedIds.length}>
              Add {selectedIds.length || ""} selected
            </Button>
          </div>
        )}
      </Card>
    </div>,
    document.body,
  );
}

function revokePreviews(list: PendingFile[]) {
  list.forEach((p) => URL.revokeObjectURL(p.preview));
}
