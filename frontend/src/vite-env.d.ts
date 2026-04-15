/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL du backend Quantara (ex. http://127.0.0.1:8000). Si absent, l’app reste sur les mocks. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

