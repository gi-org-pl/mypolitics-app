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

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Footer } from './Footer';
import { i18n } from '@lingui/core';

describe('Footer', () => {
  beforeAll(() => {
    // Ensure i18n is initialized for tests
    i18n.load('en', {});
    i18n.activate('en');
  });

  it('renders copyright with current year', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const currentYear = new Date().getFullYear();
    // Using a more flexible matcher since the text might be split
    expect(screen.getByText((content) => content.includes(`© ${currentYear}`))).toBeInTheDocument();
  });

  it('renders myPolitics logo', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByAltText('myPolitics')).toBeInTheDocument();
  });

  it('renders Generacja Innowacja logo with link', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const giLink = screen.getByRole('link', { name: /Generacja Innowacja/i });
    expect(giLink).toHaveAttribute('href', 'https://gi.org.pl');
    expect(giLink).toHaveAttribute('target', '_blank');
  });

  it('renders social links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    // 7 social links
    const links = screen.getAllByRole('link');
    const socialLinks = links.filter(link => 
      link.getAttribute('href')?.startsWith('http') && !link.getAttribute('href')?.includes('gi.org.pl')
    );
    expect(socialLinks).toHaveLength(7);
  });

  it('renders legal links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText(/Regulamin/i)).toBeInTheDocument();
    expect(screen.getByText(/Prywatność/i)).toBeInTheDocument();
    expect(screen.getByText(/O nas/i)).toBeInTheDocument();
  });
});
