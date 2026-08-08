/// <reference types="vite/client" />

declare module 'react-dom/client';

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
