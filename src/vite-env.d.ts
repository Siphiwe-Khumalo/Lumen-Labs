/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** HTTPS endpoint that receives project enquiries. Empty until configured. */
  readonly VITE_FORM_ENDPOINT?: string
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
