/** The four Seat colours, in the order a Room hands them out. */
export const SEAT_COLOURS = [
  'oklch(0.62 0.16 30)',
  'oklch(0.58 0.15 255)',
  'oklch(0.6 0.13 155)',
  'oklch(0.6 0.17 320)',
] as const

/** The colour of one Seat: its index, wrapped to the palette. */
export const seatColour = (index: number): string =>
  SEAT_COLOURS[index % SEAT_COLOURS.length] ?? SEAT_COLOURS[0]
