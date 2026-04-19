/**
 * Narrow `unknown` errors to a displayable string without leaking Error
 * objects into caller code (which would surface on Next dev overlays).
 */
export function reasonMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Run `fn`, returning `null` instead of throwing on failure while logging
 * a warn line for observability. `label` uses a `scope/rest` convention:
 * a label of `"home/featured mapping"` produces
 * `[home] featured mapping failed: <reason>`, matching the legacy
 * page-local `tryRun` call sites exactly.
 *
 * Labels without a `/` fall back to `[misc] <label> failed: <reason>`.
 */
export function tryRun<T>(fn: () => T, label: string): T | null {
  try {
    return fn();
  } catch (err) {
    const slash = label.indexOf('/');
    const scope = slash >= 0 ? label.slice(0, slash) : 'misc';
    const rest = slash >= 0 ? label.slice(slash + 1) : label;
    // Error 객체를 그대로 넘기면 Next dev overlay 가 뜨므로 문자열만 기록.
    console.warn(`[${scope}] ${rest} failed: ${reasonMessage(err)}`);
    return null;
  }
}
