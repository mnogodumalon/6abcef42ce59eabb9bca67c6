import type { Seifenspender, Standorte, Wartungsprotokoll } from './app';

export type EnrichedStandorte = Standorte & {
  hotelName: string;
};

export type EnrichedSeifenspender = Seifenspender & {
  standortName: string;
};

export type EnrichedWartungsprotokoll = Wartungsprotokoll & {
  seifenspenderName: string;
};
