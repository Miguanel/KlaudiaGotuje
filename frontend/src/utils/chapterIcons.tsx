import type { IconType } from 'react-icons';
import {
  GiCookingPot, GiAvocado, GiSteak, GiWheat, GiPumpkin, GiCarrot, GiHoneyJar, GiStopwatch, GiCrown,
} from 'react-icons/gi';

// Ikony rozdziałów – dopasowanie po początku nazwy (odporne na drobne zmiany w nazwach).
const ICONS: Array<[string, IconType]> = [
  ['kategorie dań', GiCookingPot],
  ['diety', GiAvocado],
  ['mięso', GiSteak],
  ['mączna', GiWheat],
  ['sezonowe', GiPumpkin],
  ['składniki', GiCarrot],
  ['spiżarnia', GiHoneyJar],
  ['sprzęt', GiStopwatch],
];

export function chapterIcon(name: string): IconType {
  const n = name.toLowerCase();
  return ICONS.find(([key]) => n.startsWith(key))?.[1] ?? GiCrown;
}
