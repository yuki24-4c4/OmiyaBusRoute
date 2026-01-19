/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ODPT_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


