// @vitest-environment jsdom
/**
 * Show/hide controls (all built on hooks/useDisclosure.ts): clicking, Enter and
 * Space flip aria-expanded, and the collapsed About accordion body stays inert.
 */
import { describe, it, expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { CommitteeAccordion, AnnualReportsSection } from '../pages/About';
import { EventCard } from '../pages/Events';
import { BentoCard } from '../pages/DigitalOutreach';
import type { AnnualReport, Committee, CvoEvent, OutreachInitiative } from '../types';

afterEach(cleanup);

const noop = () => {};
const renderInRouter = (node: React.ReactElement) => render(<MemoryRouter>{node}</MemoryRouter>);

const expanded = (button: HTMLElement) => button.getAttribute('aria-expanded');
const panelOf = (button: HTMLElement) => document.getElementById(button.getAttribute('aria-controls') ?? '');

/** Enter and then Space on the focused button each flip it: closed → open → closed. */
async function expectKeyboardToggles(button: HTMLElement) {
  const user = userEvent.setup();
  button.focus();
  expect(expanded(button)).toBe('false');
  await user.keyboard('{Enter}');
  expect(expanded(button)).toBe('true');
  await user.keyboard(' ');
  expect(expanded(button)).toBe('false');
}

const longText = (length: number) => 'Practical session on audits. '.repeat(Math.ceil(length / 29)).slice(0, length);

describe('About: committee accordion', () => {
  const committee: Committee = {
    name: 'Audit Committee',
    chairperson: { name: 'CA Chair', nativePlace: 'Bidada' },
    convenors: [{ name: 'CA Convenor', nativePlace: 'Rayan' }],
  };
  const trigger = () => screen.getByRole('button', { name: /Audit Committee/ });

  it('starts collapsed with an inert body', () => {
    render(<CommitteeAccordion committee={committee} />);
    expect(expanded(trigger())).toBe('false');
    expect(panelOf(trigger())?.hasAttribute('inert')).toBe(true);
  });

  it('opens and closes on click, and inert follows', async () => {
    const user = userEvent.setup();
    render(<CommitteeAccordion committee={committee} />);
    await user.click(trigger());
    expect(expanded(trigger())).toBe('true');
    expect(panelOf(trigger())?.hasAttribute('inert')).toBe(false);
    await user.click(trigger());
    expect(expanded(trigger())).toBe('false');
    expect(panelOf(trigger())?.hasAttribute('inert')).toBe(true);
  });

  it('toggles with Enter and Space', async () => {
    render(<CommitteeAccordion committee={committee} />);
    await expectKeyboardToggles(trigger());
    expect(panelOf(trigger())?.hasAttribute('inert')).toBe(true);
  });
});

describe('About: annual reports "View Archive"', () => {
  const reports: AnnualReport[] = [
    { year: '2024-25', title: 'Annual Report 2024-25', link: 'https://example.org/1' },
    { year: '2023-24', title: 'Annual Report 2023-24', link: 'https://example.org/2' },
    { year: '2022-23', title: 'Annual Report 2022-23', link: 'https://example.org/3' },
  ];
  const trigger = () => screen.getByRole('button', { name: /Archive/ });

  it('shows the archive on click and hides it again', async () => {
    const user = userEvent.setup();
    render(<AnnualReportsSection reports={reports} />);
    expect(expanded(trigger())).toBe('false');
    expect(panelOf(trigger())?.classList.contains('hidden')).toBe(true);

    await user.click(trigger());
    expect(expanded(trigger())).toBe('true');
    expect(trigger().textContent).toContain('Hide Archive');
    expect(panelOf(trigger())?.classList.contains('hidden')).toBe(false);

    await user.click(trigger());
    expect(expanded(trigger())).toBe('false');
    expect(trigger().textContent).toContain('View Archive');
  });

  it('toggles with Enter and Space', async () => {
    render(<AnnualReportsSection reports={reports} />);
    await expectKeyboardToggles(trigger());
  });
});

describe('Events: "Expand" description', () => {
  const event: CvoEvent = {
    id: 1,
    title: 'Audit Workshop',
    date: '2026-09-05',
    time: '10:00 AM - 1:00 PM',
    location: 'Online',
    committee: 'CVOCA',
    tags: ['Workshop'],
    cost: 'Free',
    description: longText(200),
  };
  const trigger = () => screen.getByRole('button', { name: /Expand|Collapse/ });

  it('expands on click and collapses again', async () => {
    const user = userEvent.setup();
    renderInRouter(<EventCard event={event} onImageClick={noop} />);
    expect(expanded(trigger())).toBe('false');
    await user.click(trigger());
    expect(expanded(trigger())).toBe('true');
    expect(trigger().textContent).toContain('Collapse');
    expect(panelOf(trigger())?.textContent).toBe(event.description);
    await user.click(trigger());
    expect(expanded(trigger())).toBe('false');
  });

  it('toggles with Enter and Space', async () => {
    renderInRouter(<EventCard event={event} onImageClick={noop} />);
    await expectKeyboardToggles(trigger());
  });

  it('shows no button for a short description', () => {
    renderInRouter(<EventCard event={{ ...event, description: 'Short.' }} onImageClick={noop} />);
    expect(screen.queryByRole('button', { name: /Expand/ })).toBeNull();
  });
});

describe('Digital Outreach: "Read More"', () => {
  const initiative: OutreachInitiative = {
    category: 'Education',
    iconPath: 'M0 0h24v24H0z',
    image: '/images/outreach.webp',
    title: 'Mentorship',
    description: longText(400),
    features: ['Weekly sessions'],
  };
  const trigger = () => screen.getByRole('button', { name: /Read (More|Less)/ });

  it('shows the full text on click and truncates it again', async () => {
    const user = userEvent.setup();
    renderInRouter(<BentoCard initiative={initiative} onImageClick={noop} index={0} />);
    expect(expanded(trigger())).toBe('false');
    expect(panelOf(trigger())?.textContent).toBe(`${initiative.description.substring(0, 250)}...`);

    await user.click(trigger());
    expect(expanded(trigger())).toBe('true');
    expect(trigger().textContent).toBe('Read Less');
    expect(panelOf(trigger())?.textContent).toBe(initiative.description);

    await user.click(trigger());
    expect(expanded(trigger())).toBe('false');
  });

  it('toggles with Enter and Space', async () => {
    renderInRouter(<BentoCard initiative={initiative} onImageClick={noop} index={0} />);
    await expectKeyboardToggles(trigger());
  });
});

describe('Header: mobile menu', () => {
  // jsdom has no matchMedia; the open menu listens for the desktop breakpoint, which never matches here
  beforeAll(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false, media: query, onchange: null,
      addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop, dispatchEvent: () => false,
    }));
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  /** Navigates without touching the menu, like the browser's back/forward buttons. */
  const GoToEvents = () => {
    const navigate = useNavigate();
    return <button type="button" onClick={() => navigate('/events')}>outside navigation</button>;
  };

  it('closes when the route changes from outside the menu', async () => {
    const user = userEvent.setup();
    renderInRouter(<><Header theme="light" toggleTheme={noop} /><GoToEvents /></>);
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(expanded(screen.getByRole('button', { name: 'Close menu' }))).toBe('true');
    await user.click(screen.getByRole('button', { name: 'outside navigation' }));
    expect(expanded(screen.getByRole('button', { name: 'Open menu' }))).toBe('false');
  });
});
