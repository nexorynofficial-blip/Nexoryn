import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Star, Trash2 } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import type { Project } from "../types";
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorBanner, Input, PageHeader, Spinner } from "../components/ui";

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      [p.title, p.slug, p.industry, p.service, ...p.tags].some((f) => f.toLowerCase().includes(q)),
    );
  }, [projects, query]);

  const load = () => {
    setLoading(true);
    api
      .get<{ items: Project[] }>("/api/v1/admin/projects")
      .then((res) => setProjects(res.items))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load projects"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/admin/projects/${pendingDelete.id}`);
      setProjects((prev) => prev.filter((p) => p.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Portfolio case studies shown on the public site."
        actions={
          <Link to="/projects/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        }
      />
      <ErrorBanner message={error} />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, slug, industry, service, tag…" className="pl-9" />
      </div>

      {projects.length === 0 ? (
        <EmptyState message="No projects yet." />
      ) : filtered.length === 0 ? (
        <EmptyState message="No projects match your search." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-white/40">
                <th className="p-4">Title</th>
                <th className="p-4">Industry</th>
                <th className="p-4">Service</th>
                <th className="p-4">Featured</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="p-4">
                    <Link to={`/projects/${p.id}`} className="font-medium text-white hover:text-accent-to">
                      {p.title}
                    </Link>
                    <p className="text-xs text-white/40">/{p.slug}</p>
                  </td>
                  <td className="p-4 text-white/70">{p.industry}</td>
                  <td className="p-4"><Badge>{p.service}</Badge></td>
                  <td className="p-4">
                    {p.isFeatured ? <Star className="h-4 w-4 fill-accent-from text-accent-from" /> : <span className="text-white/20">—</span>}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setPendingDelete(p)} className="text-white/30 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete "${pendingDelete?.title}"?`}
        description="This permanently removes the project and its case study. This can't be undone."
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
