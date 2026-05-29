import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SurveyNewsletter  from './SurveyNewsletter';

vi.mock('@lingui/macro', () => ({
  t: (chunks: TemplateStringsArray | string) => typeof chunks === 'string' ? chunks : chunks.join(''),
  msg: (chunks: TemplateStringsArray | string) => typeof chunks === 'string' ? chunks : chunks.join(''),
}));

describe('SurveyNewsletter', () => {
  const defaultProps = {
    email: '',
    onEmailChange: vi.fn(),
    consent: false,
    onConsentChange: vi.fn(),
  };

  describe('given the component is rendered with initial values', () => {
    it('displays the provided email value in the input', () => {
      render(<SurveyNewsletter {...defaultProps} email="test@example.com" />);
      
      // Zmieniamy na getByRole('textbox') - znajdzie dokładnie tag <input type="email">
      const emailInput = screen.getByRole('textbox');
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('reflects the provided consent state in the checkbox', () => {
      render(<SurveyNewsletter {...defaultProps} consent={true} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('renders the form structure correctly and does not render any submit button', () => {
      render(<SurveyNewsletter {...defaultProps} />);

      // Sprawdzamy obecność elementów za pomocą ich ról
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();

      const submitButton = screen.queryByRole('button');
      expect(submitButton).not.toBeInTheDocument();
    });
  });

  describe('when the user types in the email input', () => {
    it('calls onEmailChange with the new value', async () => {
      const onEmailChangeMock = vi.fn();
      render(<SurveyNewsletter {...defaultProps} onEmailChange={onEmailChangeMock} />);

      const emailInput = screen.getByRole('textbox');
      
      // Symulujemy wpisanie litery 'x'
      await userEvent.type(emailInput, 'x');

      expect(onEmailChangeMock).toHaveBeenCalledWith('x');
    });
  });

  describe('when the user toggles the consent checkbox', () => {
    it('calls onConsentChange with the new value', async () => {
      const onConsentChangeMock = vi.fn();
      render(<SurveyNewsletter {...defaultProps} consent={false} onConsentChange={onConsentChangeMock} />);

      const checkbox = screen.getByRole('checkbox');
      
      await userEvent.click(checkbox);

      expect(onConsentChangeMock).toHaveBeenCalledWith(true);
    });
  });
});