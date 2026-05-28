import "@testing-library/jest-dom";
import { vi } from 'vitest';

// Mocking Lingui macros BEFORE anything else to avoid build-time macro evaluation issues in Vitest
vi.mock('@lingui/core/macro', () => ({
  msg: (strings: TemplateStringsArray | string, ...values: unknown[]) => {
    if (typeof strings === 'string') return strings;
    if (Array.isArray(strings)) {
      return strings.reduce((acc, str, i) => acc + (str as string) + (values[i] ?? ''), '');
    }
    return strings;
  },
  t: (strings: TemplateStringsArray | string, ...values: unknown[]) => {
    if (typeof strings === 'string') return strings;
    if (Array.isArray(strings)) {
      return strings.reduce((acc, str, i) => acc + (str as string) + (values[i] ?? ''), '');
    }
    return strings;
  },
}));
