import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Footer } from './Footer';
import { i18n } from '@lingui/core';

describe('Footer', () => {
  beforeAll(() => {
    // Ensure i18n is initialized for tests
    i18n.load('pl', {});
    i18n.activate('pl');
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
    expect(screen.getByTestId('footer-mypolitics-logo')).toBeInTheDocument();
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
