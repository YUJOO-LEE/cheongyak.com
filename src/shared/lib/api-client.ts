/**
 * Thin fetch wrapper for the REST API.
 *
 * ## Base URL policy
 *
 * - Reads `NEXT_PUBLIC_API_URL`; falls back to `http://localhost:3000/api`
 *   so dev works without env setup.
 * - Production values must start with `https://` (or `http://localhost`
 *   in dev). A misconfigured env that points at an arbitrary host aborts
 *   module load via a thrown Error — early + loud is safer than silently
 *   leaking requests.
 *
 * ## Envelope & parsing
 *
 * This client does NOT validate response shape. Every `/main/*` endpoint
 * the backend exposes wraps its payload as `{ data: T }`; callers pair
 * the raw JSON from here with `createEnvelopeParser(Schema, label)` in
 * `shared/types/main-api.ts` so DTO drift is caught at the trust
 * boundary rather than deep inside a mapper.
 *
 * ## Caching (revalidate)
 *
 * The optional `revalidate` option maps straight through to Next's
 * `fetch({ next: { revalidate } })` for server components — treat the
 * unit as seconds. Values are declared as named constants in
 * `shared/lib/revalidate.ts`. Do not pass raw numbers at call sites.
 *
 * ## Error surface
 *
 * Non-2xx responses throw `ApiClientError`:
 *  - 5xx → UI-safe generic Korean message (server details swallowed so
 *          internal errors don't leak).
 *  - 4xx → server-provided `message` is surfaced when present; otherwise
 *          a generic client-side fallback.
 *  - Network errors propagate the underlying `fetch` TypeError untouched.
 *
 * `ApiClientError.code` carries the server's stable machine code (e.g.
 * `LISTING_NOT_FOUND`) for branching in error boundaries.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// 프로덕션에서 NEXT_PUBLIC_API_URL 이 잘못 주입돼 임의 호스트로 요청이 가는 것을 방지.
// 로컬 기본값(localhost)은 dev 편의를 위해 허용.
if (
  API_BASE_URL &&
  !API_BASE_URL.startsWith('https://') &&
  !API_BASE_URL.startsWith('http://localhost')
) {
  throw new Error(
    'NEXT_PUBLIC_API_URL must start with "https://" (or http://localhost for dev).',
  );
}

const GENERIC_SERVER_ERROR =
  '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
const GENERIC_CLIENT_ERROR = '요청을 처리할 수 없습니다.';

/**
 * Wire shape of a backend error payload. Lives here (not in
 * `shared/types/api.ts`) because the only consumer is this module's
 * `ApiClientError`; the public domain types should not leak an
 * HTTP-layer concern.
 */
export interface ApiError {
  status: number;
  code: string;
  message: string;
}

class ApiClientError extends Error {
  status: number;
  code: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = error.status;
    this.code = error.code;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit & { revalidate?: number },
): Promise<T> {
  const { revalidate, ...fetchOptions } = options || {};

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
    next: revalidate !== undefined ? { revalidate } : undefined,
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const isServerError = res.status >= 500;
    const serverMessage =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message?: unknown }).message ?? '')
        : '';
    const serverCode =
      body && typeof body === 'object' && 'code' in body
        ? String((body as { code?: unknown }).code ?? '')
        : '';

    throw new ApiClientError({
      status: res.status,
      code: serverCode || 'UNKNOWN_ERROR',
      // 5xx 는 서버 메시지를 UI 로 그대로 흘리지 않는다(내부 정보 노출 방지).
      // 4xx 는 서버가 주는 사용자용 메시지를 허용하되, 없으면 제네릭 문구.
      message: isServerError
        ? GENERIC_SERVER_ERROR
        : serverMessage || GENERIC_CLIENT_ERROR,
    });
  }

  return res.json();
}

export const apiClient = {
  get: <T>(path: string, options?: { revalidate?: number }) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};

export { ApiClientError };
