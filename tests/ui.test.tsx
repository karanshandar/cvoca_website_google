import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import SectionHeader from '../components/ui/SectionHeader';
import EmptyState from '../components/ui/EmptyState';
import Stat from '../components/ui/Stat';
import IconTile from '../components/ui/IconTile';
import Button from '../components/ui/Button';
import useDisclosure from '../hooks/useDisclosure';

const render = (node: React.ReactElement) => renderToStaticMarkup(node);
const count = (html: string, needle: string) => html.split(needle).length - 1;

describe('SectionHeader', () => {
  it('renders exactly one h2 with eyebrow and lede when given', () => {
    const html = render(<SectionHeader eyebrow="Don't Miss Out" title="Upcoming Events" lede="Gatherings." />);
    expect(count(html, '<h2')).toBe(1);
    expect(html).toContain('Upcoming Events</h2>');
    expect(html).toContain('Don&#x27;t Miss Out');
    expect(html).toContain('Gatherings.</p>');
  });

  it('omits the eyebrow and lede when not given', () => {
    const html = render(<SectionHeader title="What We Do" />);
    expect(count(html, '<p')).toBe(0);
    expect(count(html, '<span')).toBe(0);
  });

  it('is centred by default and left-aligned on request', () => {
    expect(render(<SectionHeader title="A" />)).toContain('text-center');
    expect(render(<SectionHeader title="A" align="left" />)).not.toContain('text-center');
  });
});

describe('EmptyState', () => {
  it('renders an h3 only when there is a title', () => {
    expect(count(render(<EmptyState title="No events found">msg</EmptyState>), '<h3')).toBe(1);
    expect(count(render(<EmptyState>No records found</EmptyState>), '<h3')).toBe(0);
  });

  it('renders the icon circle only when an icon is given', () => {
    expect(render(<EmptyState icon="calendar" title="t" />)).toContain('<svg');
    expect(render(<EmptyState title="t" />)).not.toContain('<svg');
  });
});

describe('Stat', () => {
  it('shows the value and the label', () => {
    const html = render(<Stat value="2,400+" label="Members" />);
    expect(html).toContain('2,400+');
    expect(html).toContain('Members');
  });

  it('uses the light gradient ramp in dark mode', () => {
    expect(render(<Stat value="1" label="x" />)).toContain('dark:from-primary-light');
  });
});

describe('IconTile', () => {
  it('follows the DESIGN.md icon tile spec', () => {
    const html = render(<IconTile><svg /></IconTile>);
    expect(html).toContain('w-14 h-14 rounded-xl bg-primary/10');
  });
});

describe('Button', () => {
  it('renders a disabled native button with the disabled style', () => {
    const html = render(<Button disabled>Registration Closed</Button>);
    expect(html).toMatch(/^<button[^>]*disabled=""/);
    expect(html).toContain('btn-disabled');
    expect(html).not.toContain('btn-primary');
  });

  it('has on-colour variants for primary-coloured bands', () => {
    const wrap = (node: React.ReactElement) => render(<MemoryRouter>{node}</MemoryRouter>);
    expect(wrap(<Button to="/membership" variant="onPrimary">Join</Button>)).toContain('btn-on-primary');
    expect(wrap(<Button to="/contact" variant="onPrimaryOutline">Contact</Button>)).toContain('btn-on-primary-outline');
  });
});

describe('useDisclosure', () => {
  const Probe: React.FC<{ initialOpen?: boolean }> = ({ initialOpen }) => {
    const { open, triggerProps, panelId } = useDisclosure(initialOpen);
    return (
      <>
        <button {...triggerProps}>toggle</button>
        <div id={panelId}>{open ? 'open' : 'closed'}</div>
      </>
    );
  };

  it('wires aria-expanded and aria-controls to the panel id', () => {
    const html = render(<Probe />);
    expect(html).toContain('aria-expanded="false"');
    const controls = html.match(/aria-controls="([^"]+)"/)?.[1];
    expect(controls).toBeTruthy();
    expect(html).toContain(`id="${controls}"`);
    expect(html).toContain('type="button"');
    expect(html).toContain('closed');
  });

  it('can start open', () => {
    expect(render(<Probe initialOpen />)).toContain('aria-expanded="true"');
  });
});
