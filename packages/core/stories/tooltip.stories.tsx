import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Tooltip, TooltipProps } from '../components/Tooltip/Tooltip';

export default {
  title: 'Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The wrapper is keyboard-focusable by default. If its child already has a tab stop, pass `tabIndex={-1}` to avoid an extra one.',
      },
    },
  },
  argTypes: {
    delay: {
      control: { type: 'number', step: 100 },
    },
  },
} satisfies Meta<TooltipProps>;

type Story = StoryObj<TooltipProps>;

function formatDate(date: Date): string {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${day.toString().padStart(2, '0')} ${monthNames[monthIndex]} ${year}`;
}

export const Simple: Story = {
  render: args => (
    <>
      <br />
      <br />
      <br />
      <Tooltip {...args}>
        <span>Hover me</span>
      </Tooltip>
    </>
  ),

  args: {
    delay: 1000,
    text: formatDate(new Date()),
  },
  play: async ({ args, canvas, userEvent }) => {
    const target = canvas.getByText('Hover me');
    const tooltip = target.parentElement as HTMLElement;
    const delay = args.delay!;
    const text = args.text!;
    const tip = canvas.getByRole('tooltip', { hidden: true });

    await expect(tip).toHaveTextContent(text);
    await expect(tip).not.toBeVisible();
    await expect(tooltip).toHaveAttribute('aria-describedby', tip.id);

    await userEvent.hover(target);
    await expect(tip).not.toBeVisible();
    await waitFor(() => expect(tip).toBeVisible(), {
      timeout: delay * 2,
    });

    await userEvent.unhover(target);
    await waitFor(() => expect(tip).not.toBeVisible());

    await userEvent.hover(target);
    await userEvent.unhover(target);
    await new Promise(resolve => setTimeout(resolve, delay * 1.5));
    await expect(tip).not.toBeVisible();

    tooltip.focus();
    await expect(tooltip).toHaveAttribute('aria-describedby', tip.id);
    await expect(tip).not.toBeVisible();
    await waitFor(() => expect(tip).toBeVisible(), {
      timeout: delay * 2,
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(tip).not.toBeVisible());
    await expect(tooltip).toHaveAttribute('aria-describedby', tip.id);

    tooltip.blur();
    tooltip.focus();
    await waitFor(() => expect(tip).toBeVisible(), {
      timeout: delay * 2,
    });
    tooltip.blur();
    await waitFor(() => expect(tip).not.toBeVisible());

    tooltip.focus();
    tooltip.blur();
    await new Promise(resolve => setTimeout(resolve, delay * 1.5));
    await expect(tip).not.toBeVisible();
  },

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/2cbigNitjcruBDZT12ixIq/React95-Design-Kit?node-id=3%3A19',
    },
  },
};
