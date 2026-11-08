/* ==========================================================================
   A Seat's name. Nobody has to invent one: the first time a browser opens a
   Room it picks two words, and the player can change them in the Room panel.
   ========================================================================== */

/** The longest name a Seat may take. The Room trims to the same length. */
export const ROOM_NAME_LENGTH = 24

const ADJECTIVES = [
  'Marvelous',
  'Bold',
  'Brave',
  'Calm',
  'Clever',
  'Cosmic',
  'Curious',
  'Dapper',
  'Daring',
  'Eager',
  'Electric',
  'Fancy',
  'Fuzzy',
  'Gentle',
  'Golden',
  'Hardy',
  'Humble',
  'Jolly',
  'Keen',
  'Kindly',
  'Lively',
  'Lucky',
  'Mellow',
  'Merry',
  'Nimble',
  'Noble',
  'Plucky',
  'Quick',
  'Quiet',
  'Rapid',
  'Sunny',
  'Swift',
] as const

const ANIMALS = [
  'Monkey',
  'Badger',
  'Beaver',
  'Bison',
  'Cobra',
  'Condor',
  'Cougar',
  'Coyote',
  'Dolphin',
  'Eagle',
  'Falcon',
  'Ferret',
  'Finch',
  'Fox',
  'Gecko',
  'Heron',
  'Ibis',
  'Jaguar',
  'Koala',
  'Lemur',
  'Lynx',
  'Magpie',
  'Marmot',
  'Moose',
  'Narwhal',
  'Newt',
  'Osprey',
  'Otter',
  'Panda',
  'Parrot',
  'Puffin',
  'Quokka',
  'Raccoon',
  'Raven',
  'Salmon',
  'Seal',
  'Sloth',
  'Sparrow',
  'Tapir',
  'Tiger',
  'Toad',
  'Turtle',
  'Vulture',
  'Walrus',
  'Weasel',
  'Whale',
  'Wolf',
  'Wombat',
  'Yak',
  'Zebra',
] as const

const pick = <T>(words: ReadonlyArray<T>, random: () => number): T =>
  words[Math.min(words.length - 1, Math.floor(random() * words.length))] as T

/** A name like `MarvelousMonkey`, from any source of numbers in [0, 1). */
export const randomName = (random: () => number = Math.random): string =>
  `${pick(ADJECTIVES, random)}${pick(ANIMALS, random)}`
