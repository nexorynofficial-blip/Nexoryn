// Manages the full set of images for an Automation or Brand & Graphic Design
// project as one thing: add as many as needed, pick which one is the
// thumbnail (Project.photoId — shown on the portfolio card and the case
// study sidebar), and every image added — including the thumbnail — ends up
// in the case study's Gallery tab. There is deliberately no separate "Photo"
// field and "Gallery" tab for these two services: one list, one place to
// manage it, so the thumbnail is never accidentally left out of the gallery
// or vice versa.
import { useState } from "react";
import { ImageIcon, Plus, Star, Trash2 } from "lucide-react";
import type { Asset } from "../types";
import { Button, Input } from "./ui";
import { AssetPicker } from "./AssetPicker";

export interface MediaItem {
  asset: Asset;
  alt: string;
}

/** Prefix used for a gallery image carried over from before this uploader
 *  existed, whose exact URL has no matching row in the Asset table (every
 *  image added through this uploader always does — it only ever adds real
 *  Assets from the picker/upload). Such an item can be kept, edited, and
 *  removed like any other, but not set as the thumbnail: Project.photoId is
 *  a real foreign key, and there's no genuine Asset id to point it at. See
 *  the hydration logic in ProjectForm.tsx that builds these. */
export const UNRESOLVED_MEDIA_PREFIX = "unresolved:";
const UNRESOLVED_PREFIX = UNRESOLVED_MEDIA_PREFIX;

function isResolvable(item: MediaItem): boolean {
  return !item.asset.id.startsWith(UNRESOLVED_PREFIX);
}

export function galleryFromMediaItems(items: MediaItem[]) {
  return items.map((item) => ({
    src: item.asset.url,
    alt: item.alt.trim() || item.asset.altText,
    width: item.asset.width ?? undefined,
    height: item.asset.height ?? undefined,
  }));
}

export function MultiImageUploader({
  items,
  thumbnailId,
  onChange,
}: {
  items: MediaItem[];
  thumbnailId: string | null;
  onChange: (items: MediaItem[], thumbnailId: string | null) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const addAsset = (asset: Asset) => {
    const next = [...items, { asset, alt: asset.altText }];
    // First image added becomes the thumbnail by default — a project can't
    // realistically be saved without one anyway, so this saves a click on
    // the common case of adding just one image so far.
    onChange(next, thumbnailId ?? asset.id);
    setPickerOpen(false);
  };

  const removeAt = (index: number) => {
    const removed = items[index];
    const next = items.filter((_, j) => j !== index);
    const nextThumbnail =
      removed.asset.id === thumbnailId ? (next[0]?.asset.id ?? null) : thumbnailId;
    onChange(next, nextThumbnail);
  };

  const setAlt = (index: number, alt: string) => {
    onChange(
      items.map((it, j) => (j === index ? { ...it, alt } : it)),
      thumbnailId,
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item, i) => {
          const isThumbnail = item.asset.id === thumbnailId;
          const resolvable = isResolvable(item);
          return (
            <div
              key={item.asset.id}
              className={`flex gap-3 rounded-lg border p-3 ${
                isThumbnail ? "border-accent-from/60 bg-accent-from/5" : "border-white/10"
              }`}
            >
              <img
                src={item.asset.url}
                alt={item.alt}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
                onError={(e) => (e.currentTarget.style.opacity = "0.15")}
              />
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Alt text"
                  value={item.alt}
                  onChange={(e) => setAlt(i, e.target.value)}
                />
                {resolvable ? (
                  <button
                    type="button"
                    onClick={() => onChange(items, item.asset.id)}
                    className={`flex items-center gap-1.5 text-xs transition ${
                      isThumbnail ? "text-accent-to" : "text-white/40 hover:text-white"
                    }`}
                  >
                    <Star className={`h-3.5 w-3.5 ${isThumbnail ? "fill-current" : ""}`} />
                    {isThumbnail ? "Thumbnail" : "Set as thumbnail"}
                  </button>
                ) : (
                  <p className="text-[11px] text-white/30">
                    From before this uploader — can't be the thumbnail. Remove and re-add via "Add
                    photo" if you need to.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="shrink-0 self-start text-white/30 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-white/15 text-white/20 sm:col-span-2">
            <ImageIcon className="mr-2 h-5 w-5" /> No images yet
          </div>
        )}
      </div>

      <Button type="button" variant="ghost" onClick={() => setPickerOpen(true)} className="mt-3">
        <Plus className="h-3.5 w-3.5" /> Add photo
      </Button>

      {pickerOpen && <AssetPicker onSelect={addAsset} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}
