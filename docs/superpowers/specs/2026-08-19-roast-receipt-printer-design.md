# Roast Receipt Printer Design

## Scope

Refactor the receipt area of the Knockout Card on `/roast` into a compact printer presentation. The homepage, backend contracts, live data shape, and other exploration variants remain unchanged.

## Layout

- Desktop keeps the printer in the left Bento column below the username card.
- Mobile stacks the printer below the username card at the available width.
- The printer reserves its final height from the first render to avoid layout shift.

## Visual model

`RoastReceiptPrinter` owns the printer shell and the receipt paper. The shell uses the existing Basalt surface tokens and contains a rounded dark slot. Bone paper is layered behind the slot and revealed downward. Signal Red is limited to the live indicator, grade, and small active details.

The receipt content is divided into stable sections: GrillMe header, roast status and receipt number, evidence, scores, grade, barcode, and the closing GrillMe message.

## Motion and data flow

The existing `revealPhase` remains the timing contract:

1. Printer is idle and the slot is visible.
2. Header and receipt identity emerge.
3. Evidence values appear.
4. Score section resolves.
5. Grade, barcode, and footer finish the receipt.

The component is SSR-safe and renders the same structural shell before hydration. CSS transitions use opacity, transform, and clipping only. Reduced-motion users receive the same final information without nonessential motion.

## Validation

Preserve the existing roast explorer interactions and viewport guarantees. Add focused browser assertions for the printer shell, slot, receipt content, and final barcode/footer state, then run the repository roast validation commands.
