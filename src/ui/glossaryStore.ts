/** The glossary dialog: whether it is open and which term to show first. `nonce` changes with every opening so the dialog starts fresh. */
export interface GlossaryState {
  open: boolean;
  term: string | null;
  nonce: number;
}
const CLOSED: GlossaryState = { open: false, term: null, nonce: 0 };
let glossary: GlossaryState = CLOSED;
const glossaryListeners = new Set<() => void>();

export const glossaryDialog = {
  subscribe(fn: () => void): () => void {
    glossaryListeners.add(fn);
    return () => glossaryListeners.delete(fn);
  },
  getSnapshot: (): GlossaryState => glossary,
  getServerSnapshot: (): GlossaryState => CLOSED,
  open(term: string | null = null): void {
    glossary = { open: true, term, nonce: glossary.nonce + 1 };
    glossaryListeners.forEach((l) => l());
  },
  close(): void {
    if (!glossary.open) return;
    glossary = { ...glossary, open: false };
    glossaryListeners.forEach((l) => l());
  },
};

/** The small explanation that opens when a term in a text is tapped: which term, and where the word sits on screen. */
export interface TermPopoverState {
  id: string;
  rect: { left: number; top: number; bottom: number };
}
let popover: TermPopoverState | null = null;
const popoverListeners = new Set<() => void>();

export const termPopover = {
  subscribe(fn: () => void): () => void {
    popoverListeners.add(fn);
    return () => popoverListeners.delete(fn);
  },
  getSnapshot: (): TermPopoverState | null => popover,
  getServerSnapshot: (): TermPopoverState | null => null,
  toggle(id: string, rect: DOMRect): void {
    popover = popover?.id === id ? null : { id, rect: { left: rect.left, top: rect.top, bottom: rect.bottom } };
    popoverListeners.forEach((l) => l());
  },
  close(): void {
    if (!popover) return;
    popover = null;
    popoverListeners.forEach((l) => l());
  },
};
