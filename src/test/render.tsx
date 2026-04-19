import { type ReactElement, type ReactNode } from 'react';
import {
  render as rtlRender,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';

interface NuqsWrapperOptions {
  searchParams?: Record<string, string>;
}

function createWrapper({ searchParams }: NuqsWrapperOptions = {}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NuqsTestingAdapter searchParams={searchParams}>
        {children}
      </NuqsTestingAdapter>
    );
  };
}

export interface RenderWithNuqsOptions
  extends Omit<RenderOptions, 'wrapper'>,
    NuqsWrapperOptions {}

/**
 * Drop-in replacement for @testing-library/react `render` that wraps the UI
 * in a NuqsTestingAdapter. Tests that read or mutate URL state via
 * `useQueryState` must use this wrapper to avoid adapter lookup errors.
 */
export function renderWithNuqs(
  ui: ReactElement,
  options?: RenderWithNuqsOptions,
): RenderResult {
  const { searchParams, ...rtlOptions } = options ?? {};
  return rtlRender(ui, {
    ...rtlOptions,
    wrapper: createWrapper({ searchParams }),
  });
}

/**
 * Server-side markup rendering with NuqsTestingAdapter. Mirrors
 * renderToStaticMarkup's signature so SSR assertions keep working after the
 * nuqs migration.
 */
export function renderToStaticMarkupWithNuqs(
  ui: ReactElement,
  options?: NuqsWrapperOptions,
): string {
  const Wrapper = createWrapper(options);
  return renderToStaticMarkup(<Wrapper>{ui}</Wrapper>);
}
