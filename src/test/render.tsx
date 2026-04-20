import { type ReactElement, type ReactNode, Suspense } from 'react';
import {
  render as rtlRender,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import {
  QueryClient,
  QueryClientProvider,
  type QueryClient as QueryClientType,
} from '@tanstack/react-query';

interface NuqsWrapperOptions {
  searchParams?: Record<string, string>;
}

interface QueryWrapperOptions {
  queryClient?: QueryClientType;
  suspenseFallback?: ReactNode;
}

export interface RenderWithNuqsOptions
  extends Omit<RenderOptions, 'wrapper'>,
    NuqsWrapperOptions,
    QueryWrapperOptions {}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    },
  });
}

function createWrapper({
  searchParams,
  queryClient,
  suspenseFallback,
}: NuqsWrapperOptions & QueryWrapperOptions = {}) {
  const client = queryClient ?? createQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <NuqsTestingAdapter searchParams={searchParams}>
          <Suspense fallback={suspenseFallback ?? null}>{children}</Suspense>
        </NuqsTestingAdapter>
      </QueryClientProvider>
    );
  };
}

/**
 * Drop-in replacement for @testing-library/react `render` that wraps
 * the UI in a NuqsTestingAdapter + QueryClientProvider + Suspense
 * boundary. `useSuspenseQuery` tests need the QueryClient and the
 * Suspense fallback to resolve; existing `useQueryState`-only tests
 * remain unaffected.
 */
export function renderWithNuqs(
  ui: ReactElement,
  options?: RenderWithNuqsOptions,
): RenderResult {
  const { searchParams, queryClient, suspenseFallback, ...rtlOptions } =
    options ?? {};
  return rtlRender(ui, {
    ...rtlOptions,
    wrapper: createWrapper({ searchParams, queryClient, suspenseFallback }),
  });
}

/**
 * Server-side markup rendering with NuqsTestingAdapter. Kept for tests
 * that only need SSR output; Suspense-driven components should use the
 * async `renderWithNuqs` path instead.
 */
export function renderToStaticMarkupWithNuqs(
  ui: ReactElement,
  options?: NuqsWrapperOptions,
): string {
  const Wrapper = function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NuqsTestingAdapter searchParams={options?.searchParams}>
        {children}
      </NuqsTestingAdapter>
    );
  };
  return renderToStaticMarkup(<Wrapper>{ui}</Wrapper>);
}
