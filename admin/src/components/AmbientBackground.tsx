// Two soft, slowly-drifting gradient blobs behind the app shell — pure CSS
// (see .admin-blob* in index.css), fixed and non-interactive.
export function AmbientBackground() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden">
      <div className="admin-blob admin-blob-a" />
      <div className="admin-blob admin-blob-b" />
    </div>
  );
}
