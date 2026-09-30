import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Hotels {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    hotel_name?: string;
    strasse?: string;
    hausnummer?: string;
    postleitzahl?: string;
    stadt?: string;
    land?: string;
    ansprechpartner_vorname?: string;
    ansprechpartner_nachname?: string;
    telefon?: string;
    email?: string;
    anzahl_zimmer?: number;
    bemerkungen_hotel?: string;
  };
}

export interface Standorte {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    hotel?: RecordUrl; // applookup -> URL zu 'Hotels' Record
    standort_bezeichnung?: string;
    stockwerk?: string;
    raumtyp?: LookupValue;
    standort_beschreibung?: string;
  };
}

export interface Seifenspender {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    standort?: RecordUrl; // applookup -> URL zu 'Standorte' Record
    seriennummer?: string;
    modell?: string;
    seifentyp?: LookupValue;
    fuellstand?: LookupValue;
    status?: LookupValue;
    installationsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    naechste_wartung?: string; // Format: YYYY-MM-DD oder ISO String
    foto_spender?: string;
    bemerkungen_spender?: string;
  };
}

export interface Wartungsprotokoll {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    seifenspender?: RecordUrl; // applookup -> URL zu 'Seifenspender' Record
    datum_uhrzeit?: string; // Format: YYYY-MM-DD oder ISO String
    massnahme?: LookupValue;
    fuellstand_nach_wartung?: LookupValue;
    durchgefuehrt_von_vorname?: string;
    durchgefuehrt_von_nachname?: string;
    bemerkungen_wartung?: string;
    foto_wartung?: string;
  };
}

export const APP_IDS = {
  HOTELS: '6abcef239a500446ab499824',
  STANDORTE: '6abcef2826db8be1506688f9',
  SEIFENSPENDER: '6abcef281a43c0ac9e8208b3',
  WARTUNGSPROTOKOLL: '6abcef29ec71f2fbda1c18ef',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'standorte': {
    raumtyp: [{ key: "hotelzimmer", get label() { return lookupLabel('standorte', 'raumtyp', "hotelzimmer") ?? "Hotelzimmer"; } }, { key: "oeffentliche_toilette", get label() { return lookupLabel('standorte', 'raumtyp', "oeffentliche_toilette") ?? "Öffentliche Toilette"; } }, { key: "restaurant", get label() { return lookupLabel('standorte', 'raumtyp', "restaurant") ?? "Restaurant"; } }, { key: "spa_wellness", get label() { return lookupLabel('standorte', 'raumtyp', "spa_wellness") ?? "Spa / Wellness"; } }, { key: "konferenzraum", get label() { return lookupLabel('standorte', 'raumtyp', "konferenzraum") ?? "Konferenzraum"; } }, { key: "lobby", get label() { return lookupLabel('standorte', 'raumtyp', "lobby") ?? "Lobby"; } }, { key: "personalbereich", get label() { return lookupLabel('standorte', 'raumtyp', "personalbereich") ?? "Personalbereich"; } }, { key: "sonstiges", get label() { return lookupLabel('standorte', 'raumtyp', "sonstiges") ?? "Sonstiges"; } }],
  },
  'seifenspender': {
    seifentyp: [{ key: "fluessigseife", get label() { return lookupLabel('seifenspender', 'seifentyp', "fluessigseife") ?? "Flüssigseife"; } }, { key: "schaumseife", get label() { return lookupLabel('seifenspender', 'seifentyp', "schaumseife") ?? "Schaumseife"; } }, { key: "desinfektionsmittel", get label() { return lookupLabel('seifenspender', 'seifentyp', "desinfektionsmittel") ?? "Desinfektionsmittel"; } }, { key: "handlotion", get label() { return lookupLabel('seifenspender', 'seifentyp', "handlotion") ?? "Handlotion"; } }, { key: "sonstiges_seife", get label() { return lookupLabel('seifenspender', 'seifentyp', "sonstiges_seife") ?? "Sonstiges"; } }],
    fuellstand: [{ key: "voll", get label() { return lookupLabel('seifenspender', 'fuellstand', "voll") ?? "Voll (75–100 %)"; } }, { key: "mittel", get label() { return lookupLabel('seifenspender', 'fuellstand', "mittel") ?? "Mittel (25–74 %)"; } }, { key: "niedrig", get label() { return lookupLabel('seifenspender', 'fuellstand', "niedrig") ?? "Niedrig (unter 25 %)"; } }, { key: "leer", get label() { return lookupLabel('seifenspender', 'fuellstand', "leer") ?? "Leer"; } }],
    status: [{ key: "aktiv", get label() { return lookupLabel('seifenspender', 'status', "aktiv") ?? "Aktiv"; } }, { key: "status_leer", get label() { return lookupLabel('seifenspender', 'status', "status_leer") ?? "Leer"; } }, { key: "defekt", get label() { return lookupLabel('seifenspender', 'status', "defekt") ?? "Defekt"; } }, { key: "ausser_betrieb", get label() { return lookupLabel('seifenspender', 'status', "ausser_betrieb") ?? "Außer Betrieb"; } }],
  },
  'wartungsprotokoll': {
    massnahme: [{ key: "nachfuellung", get label() { return lookupLabel('wartungsprotokoll', 'massnahme', "nachfuellung") ?? "Nachfüllung"; } }, { key: "reinigung", get label() { return lookupLabel('wartungsprotokoll', 'massnahme', "reinigung") ?? "Reinigung"; } }, { key: "reparatur", get label() { return lookupLabel('wartungsprotokoll', 'massnahme', "reparatur") ?? "Reparatur"; } }, { key: "austausch", get label() { return lookupLabel('wartungsprotokoll', 'massnahme', "austausch") ?? "Austausch"; } }, { key: "inspektion", get label() { return lookupLabel('wartungsprotokoll', 'massnahme', "inspektion") ?? "Inspektion"; } }, { key: "sonstiges_massnahme", get label() { return lookupLabel('wartungsprotokoll', 'massnahme', "sonstiges_massnahme") ?? "Sonstiges"; } }],
    fuellstand_nach_wartung: [{ key: "voll_nach", get label() { return lookupLabel('wartungsprotokoll', 'fuellstand_nach_wartung', "voll_nach") ?? "Voll (75–100 %)"; } }, { key: "mittel_nach", get label() { return lookupLabel('wartungsprotokoll', 'fuellstand_nach_wartung', "mittel_nach") ?? "Mittel (25–74 %)"; } }, { key: "niedrig_nach", get label() { return lookupLabel('wartungsprotokoll', 'fuellstand_nach_wartung', "niedrig_nach") ?? "Niedrig (unter 25 %)"; } }, { key: "leer_nach", get label() { return lookupLabel('wartungsprotokoll', 'fuellstand_nach_wartung', "leer_nach") ?? "Leer"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'hotels': {
    'hotel_name': 'string/text',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'postleitzahl': 'string/text',
    'stadt': 'string/text',
    'land': 'string/text',
    'ansprechpartner_vorname': 'string/text',
    'ansprechpartner_nachname': 'string/text',
    'telefon': 'string/tel',
    'email': 'string/email',
    'anzahl_zimmer': 'number',
    'bemerkungen_hotel': 'string/textarea',
  },
  'standorte': {
    'hotel': 'applookup/select',
    'standort_bezeichnung': 'string/text',
    'stockwerk': 'string/text',
    'raumtyp': 'lookup/select',
    'standort_beschreibung': 'string/textarea',
  },
  'seifenspender': {
    'standort': 'applookup/select',
    'seriennummer': 'string/text',
    'modell': 'string/text',
    'seifentyp': 'lookup/select',
    'fuellstand': 'lookup/radio',
    'status': 'lookup/radio',
    'installationsdatum': 'date/date',
    'naechste_wartung': 'date/date',
    'foto_spender': 'file',
    'bemerkungen_spender': 'string/textarea',
  },
  'wartungsprotokoll': {
    'seifenspender': 'applookup/select',
    'datum_uhrzeit': 'date/datetimeminute',
    'massnahme': 'lookup/select',
    'fuellstand_nach_wartung': 'lookup/radio',
    'durchgefuehrt_von_vorname': 'string/text',
    'durchgefuehrt_von_nachname': 'string/text',
    'bemerkungen_wartung': 'string/textarea',
    'foto_wartung': 'file',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateHotels = StripLookup<Hotels['fields']>;
export type CreateStandorte = StripLookup<Standorte['fields']>;
export type CreateSeifenspender = StripLookup<Seifenspender['fields']>;
export type CreateWartungsprotokoll = StripLookup<Wartungsprotokoll['fields']>;