# Beta-Launch Deferred Features

Features intentionally hidden for the cheongyak.com beta launch. The UI surfaces are commented out (not deleted) so each feature can be restored by reverting the marked lines once its blocking dependency lands.

**Search marker:** every deferred edit is tagged with the literal string `TODO(beta-deferred)`. To audit or restore a feature, `grep -rn 'TODO(beta-deferred)' src/` lists every restoration point.

---

## Search

**Status:** UI hidden, code preserved. **Blocked by:** backend search endpoint.

The global search overlay (⌘K + header/bottom-nav search button) is fully implemented on the frontend but currently powered by a mock fixture in `src/features/search/components/search-overlay.tsx`. Until the backend ships a real search endpoint that the overlay can call through `apiClientMutator`, exposing the trigger UI would let beta users hit a dead path.

### What is hidden

| Surface | File | What changed |
|---|---|---|
| Mount point | `src/app/layout.tsx` | `<SearchRoot />` replaced with `<Navigation />`; `SearchRoot` import commented. |
| Desktop trigger | `src/shared/components/navigation/navigation.tsx` | Search `<button>` JSX commented (header right). |
| Mobile trigger | `src/shared/components/navigation/navigation.tsx` | Search `<button>` JSX commented (bottom-nav 4th item). |
| `Search` icon import | `src/shared/components/navigation/navigation.tsx` | Removed from `lucide-react` named imports. |
| `handleSearchClick` handler | `src/shared/components/navigation/navigation.tsx` | Local declaration commented. |
| `onSearchOpen` prop runtime use | `src/shared/components/navigation/navigation.tsx` | Signature switched to `_props: NavigationProps`; type kept so SearchRoot still type-checks. |
| `⌘K` keyboard shortcut | `src/app/search-root.tsx` | Component file preserved but no longer mounted (so `useKeyboardShortcut('k', …)` never registers). |

### What is preserved

- `src/app/search-root.tsx` — component intact, deprecation note added.
- `src/features/search/components/search-overlay.tsx` — component intact, deprecation note added.
- `src/features/search/hooks/` — all hooks intact.
- `src/app/api/search/` — route handler intact.
- `src/mocks/handlers/*` search mocks — intact.

### Restoration steps

1. `grep -rn 'TODO(beta-deferred)' src/` to enumerate every restoration point.
2. In `src/app/layout.tsx`: uncomment the `SearchRoot` import and swap `<Navigation />` back to `<SearchRoot />`.
3. In `src/shared/components/navigation/navigation.tsx`:
   - Re-add `Search` to the `lucide-react` named-import list.
   - Restore `function Navigation({ onSearchOpen }: NavigationProps = {})` signature.
   - Uncomment `const handleSearchClick = onSearchOpen ?? (() => undefined);`.
   - Uncomment the desktop and mobile search `<button>` JSX blocks.
4. Remove the `@deprecated` JSDoc blocks in `src/app/search-root.tsx` and `src/features/search/components/search-overlay.tsx`.
5. Verify the search overlay calls the real backend endpoint (replace any mock fixture wiring inside `search-overlay.tsx`).
6. Remove the **Search** row from this document.
