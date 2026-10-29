// Minimal types for the Workers runtime module used by the /api endpoints (lib/api.ts).
// `npm run generate-types` (wrangler types) can replace this with the full generated set.
declare module 'cloudflare:workers' {
  export const env: Record<string, string | undefined>;
}
