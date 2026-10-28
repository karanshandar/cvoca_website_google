/**
 * Turns a contact.json entry into a link target, so phone numbers and
 * emails can be tapped. Other entries (address, hours) get no link.
 */
export function getContactHref(id: string, value: string): string | undefined {
  if (id === 'mobile') {
    return `tel:${value.replace(/[^\d+]/g, '')}`;
  }
  if (id === 'email') {
    return `mailto:${value}`;
  }
  return undefined;
}
