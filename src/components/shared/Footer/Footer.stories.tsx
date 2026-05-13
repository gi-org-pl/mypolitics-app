import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router';
import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Shared/Footer',
  component: Footer,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
