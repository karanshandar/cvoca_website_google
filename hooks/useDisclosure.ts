import { useCallback, useId, useState } from 'react';

/**
 * State and ARIA wiring for a show/hide control (accordion, "Read more").
 * Spread `triggerProps` on the <button> and put `panelId` on the panel it controls.
 * A panel that is fully hidden when closed should also get `inert={!open}`.
 */
export default function useDisclosure(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  const panelId = useId();
  const toggle = useCallback(() => setOpen((current) => !current), []);

  return {
    open,
    toggle,
    panelId,
    triggerProps: {
      type: 'button' as const,
      onClick: toggle,
      'aria-expanded': open,
      'aria-controls': panelId,
    },
  };
}
