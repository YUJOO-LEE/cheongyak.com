import { defineConfig } from 'orval';

/**
 * orval configuration — OpenAPI → typed TanStack Query hooks + Zod schemas.
 *
 * - `input`: URL comes from the `OPENAPI_URL` env var so the hostname
 *   never lands in the public repo. Developers keep the real URL in
 *   `.env.local` (gitignored); CI injects it via a GitHub Actions secret.
 *   The `codegen` script wires `.env.local` through `dotenv-cli`.
 * - `output`: generated files live under `src/shared/api/generated/`.
 *   `mode: single` — the OpenAPI doc's tag is Korean ("청약"), and
 *   `tags-split` mode would create non-ASCII directories that are
 *   awkward to import.
 * - `mutator`: every generated fetch call is routed through
 *   `apiClientMutator` in `src/shared/lib/api-client.ts`, which
 *   centralizes base URL resolution, header defaults, and
 *   `ApiClientError` normalization.
 * - `zod`: a parallel Zod target ships runtime validators alongside the
 *   TS types so callers can opt into validation at the trust boundary.
 */
const openApiUrl = process.env.OPENAPI_URL;
if (!openApiUrl) {
  throw new Error(
    'OPENAPI_URL is required. Run `pnpm codegen` which loads `.env.local`.',
  );
}

export default defineConfig({
  aptSales: {
    input: {
      target: openApiUrl,
    },
    output: {
      mode: 'single',
      target: 'src/shared/api/generated/endpoints.ts',
      schemas: 'src/shared/api/generated/schemas',
      client: 'react-query',
      httpClient: 'fetch',
      clean: ['src/shared/api/generated/schemas'],
      override: {
        mutator: {
          path: 'src/shared/lib/api-client.ts',
          name: 'apiClientMutator',
        },
        query: {
          useQuery: true,
          useSuspenseQuery: true,
          signal: true,
          options: {
            staleTime: 60_000,
          },
        },
      },
    },
  },
  aptSalesZod: {
    input: {
      target: openApiUrl,
    },
    output: {
      mode: 'single',
      target: 'src/shared/api/generated/endpoints.zod.ts',
      client: 'zod',
      fileExtension: '.zod.ts',
      clean: false,
    },
  },
});
