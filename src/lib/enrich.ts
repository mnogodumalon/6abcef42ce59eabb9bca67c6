import type { EnrichedSeifenspender, EnrichedStandorte, EnrichedWartungsprotokoll } from '@/types/enriched';
import type { Hotels, Seifenspender, Standorte, Wartungsprotokoll } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface StandorteMaps {
  hotelsMap: Map<string, Hotels>;
}

export function enrichStandorte(
  standorte: Standorte[],
  maps: StandorteMaps
): EnrichedStandorte[] {
  return standorte.map(r => ({
    ...r,
    hotelName: resolveDisplay(r.fields.hotel, maps.hotelsMap, 'hotel_name'),
  }));
}

interface SeifenspenderMaps {
  standorteMap: Map<string, Standorte>;
}

export function enrichSeifenspender(
  seifenspender: Seifenspender[],
  maps: SeifenspenderMaps
): EnrichedSeifenspender[] {
  return seifenspender.map(r => ({
    ...r,
    standortName: resolveDisplay(r.fields.standort, maps.standorteMap, 'standort_bezeichnung'),
  }));
}

interface WartungsprotokollMaps {
  seifenspenderMap: Map<string, Seifenspender>;
}

export function enrichWartungsprotokoll(
  wartungsprotokoll: Wartungsprotokoll[],
  maps: WartungsprotokollMaps
): EnrichedWartungsprotokoll[] {
  return wartungsprotokoll.map(r => ({
    ...r,
    seifenspenderName: resolveDisplay(r.fields.seifenspender, maps.seifenspenderMap, 'seriennummer'),
  }));
}
