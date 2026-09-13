/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_NEXORYN_AGENT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
