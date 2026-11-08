/** Below this zoom the rows are a few pixels tall and are left out. */
export const ROWS_GONE = 0.3
/** At this zoom the rows are at full strength. */
export const ROWS_FULL = 0.38
/** At or above this zoom a Node is a whole card. */
export const CHIP_NONE = 0.36
/** The zoom span over which a card becomes a chip, whole at the zoom its rows are gone. */
export const CHIP_BAND = 0.06

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

/** How much of a card's rows to draw at `zoom`: 0 far out, 1 up close. */
export const rowsAt = (zoom: number): number =>
  clamp01((zoom - ROWS_GONE) / (ROWS_FULL - ROWS_GONE))

/** How much of the chip to draw at `zoom`: 1 far out, 0 when the card is whole. */
export const chipAt = (zoom: number): number => clamp01((CHIP_NONE - zoom) / CHIP_BAND)
