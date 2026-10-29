// @vitest-environment jsdom
/**
 * Events filter panel: below md it sits behind a "Filters" disclosure whose
 * name counts the select filters moved away from their defaults.
 * (The md:hidden / md:contents switch is CSS and is checked in the browser.)
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { CvoEvent } from '../types';

const events: CvoEvent[] = [
  { id: 1, title: 'Audit Workshop', date: '2099-09-05', time: '10:00 AM', location: 'Online', committee: 'CVOCA', tags: ['Workshop'], cost: 'Free', description: 'Short.' },
  { id: 2, title: 'GST Update', date: '2099-10-01', time: '6:00 PM', location: 'Mumbai', committee: 'Indirect Tax Committee', tags: ['GST'], cost: '₹500', description: 'Short.' },
];

vi.mock('../utils/fetchWithFallback', () => ({ fetchWithFallback: () => Promise.resolve(events) }));

const { default: Events } = await import('../pages/Events');

afterEach(cleanup);

const renderEvents = () => render(<MemoryRouter><Events /></MemoryRouter>);
const filtersButton = () => screen.findByRole('button', { name: /^Filters/ });

describe('Events: "Filters" disclosure', () => {
  it('starts collapsed and controls the panel holding the select filters', async () => {
    renderEvents();
    const button = await filtersButton();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
    expect(panel).not.toBeNull();
    // `hidden` keeps the collapsed panel out of the tab order and the accessibility tree
    expect(panel!.classList.contains('hidden')).toBe(true);
    await userEvent.setup().click(button);
    expect(panel!.classList.contains('hidden')).toBe(false);
    expect(panel!.classList.contains('grid')).toBe(true);
    expect(within(panel!).getByLabelText('Filter events by organizer')).toBeTruthy();
    expect(within(panel!).getByLabelText('Filter events by time')).toBeTruthy();
    expect(within(panel!).getByLabelText('Filter events by tag')).toBeTruthy();
    // Search stays outside the disclosure
    expect(within(panel!).queryByLabelText('Search events')).toBeNull();
  });

  it('toggles with Enter and Space', async () => {
    const user = userEvent.setup();
    renderEvents();
    const button = await filtersButton();
    button.focus();
    await user.keyboard('{Enter}');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    await user.keyboard(' ');
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('counts the select filters away from their defaults, not the search', async () => {
    const user = userEvent.setup();
    renderEvents();
    const button = await filtersButton();
    expect(button.textContent).toBe('Filters');
    await user.type(screen.getByLabelText('Search events'), 'audit');
    expect(button.textContent).toBe('Filters');
    await user.selectOptions(screen.getByLabelText('Filter events by organizer'), 'CVOCA');
    expect(button.textContent).toBe('Filters (1)');
    await user.selectOptions(screen.getByLabelText('Filter events by time'), 'all');
    await user.selectOptions(screen.getByLabelText('Filter events by tag'), 'Workshop');
    expect(button.textContent).toBe('Filters (3)');
    await user.click(screen.getByRole('button', { name: /Clear/ }));
    expect(button.textContent).toBe('Filters');
  });
});
