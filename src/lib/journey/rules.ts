/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'hotels' | 'standorte' | 'seifenspender' | 'wartungsprotokoll';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "hotels": "hotel_name" | "strasse" | "hausnummer" | "postleitzahl" | "stadt" | "land" | "ansprechpartner_vorname" | "ansprechpartner_nachname" | "telefon" | "email" | "bemerkungen_hotel";
  "standorte": "standort_bezeichnung" | "stockwerk" | "standort_beschreibung";
  "seifenspender": "seriennummer" | "modell" | "bemerkungen_spender";
  "wartungsprotokoll": "durchgefuehrt_von_vorname" | "durchgefuehrt_von_nachname" | "bemerkungen_wartung";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "hotels": never;
  "standorte": "hotel";
  "seifenspender": "standort";
  "wartungsprotokoll": "seifenspender";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "hotels": {
    "key": "hotels",
    "appId": "6abcef239a500446ab499824",
    "label": "Hotels",
    "pascal": "Hotels",
    "single": "Hotel"
  },
  "standorte": {
    "key": "standorte",
    "appId": "6abcef2826db8be1506688f9",
    "label": "Standorte",
    "pascal": "Standorte",
    "single": "StandorteEntry"
  },
  "seifenspender": {
    "key": "seifenspender",
    "appId": "6abcef281a43c0ac9e8208b3",
    "label": "Seifenspender",
    "pascal": "Seifenspender",
    "single": "SeifenspenderEntry"
  },
  "wartungsprotokoll": {
    "key": "wartungsprotokoll",
    "appId": "6abcef29ec71f2fbda1c18ef",
    "label": "Wartungsprotokoll",
    "pascal": "Wartungsprotokoll",
    "single": "WartungsprotokollEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "hotels": {
    "hotel_name": {
      "key": "hotel_name",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Hotelname",
      "writable": true,
      "maxLength": 4000
    },
    "strasse": {
      "key": "strasse",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Straße",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-line1"
    },
    "hausnummer": {
      "key": "hausnummer",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Hausnummer",
      "writable": true,
      "maxLength": 4000
    },
    "postleitzahl": {
      "key": "postleitzahl",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Postleitzahl",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "postal-code"
    },
    "stadt": {
      "key": "stadt",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Stadt",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-level2"
    },
    "land": {
      "key": "land",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Land",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "country-name"
    },
    "ansprechpartner_vorname": {
      "key": "ansprechpartner_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname Ansprechpartner",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "ansprechpartner_nachname": {
      "key": "ansprechpartner_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname Ansprechpartner",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefonnummer",
      "writable": true,
      "autoComplete": "tel"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": false,
      "label": "E-Mail-Adresse",
      "writable": true,
      "autoComplete": "email"
    },
    "anzahl_zimmer": {
      "key": "anzahl_zimmer",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Anzahl Zimmer",
      "writable": true
    },
    "bemerkungen_hotel": {
      "key": "bemerkungen_hotel",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bemerkungen",
      "writable": true
    }
  },
  "standorte": {
    "hotel": {
      "key": "hotel",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Hotel",
      "writable": true,
      "targetAppId": "6abcef239a500446ab499824",
      "targetEntity": "hotels"
    },
    "standort_bezeichnung": {
      "key": "standort_bezeichnung",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Bezeichnung des Standorts",
      "writable": true,
      "maxLength": 4000
    },
    "stockwerk": {
      "key": "stockwerk",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Stockwerk",
      "writable": true,
      "maxLength": 4000
    },
    "raumtyp": {
      "key": "raumtyp",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Raumtyp",
      "writable": true,
      "options": [
        "hotelzimmer",
        "oeffentliche_toilette",
        "restaurant",
        "spa_wellness",
        "konferenzraum",
        "lobby",
        "personalbereich",
        "sonstiges"
      ]
    },
    "standort_beschreibung": {
      "key": "standort_beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    }
  },
  "seifenspender": {
    "standort": {
      "key": "standort",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Standort",
      "writable": true,
      "targetAppId": "6abcef2826db8be1506688f9",
      "targetEntity": "standorte"
    },
    "seriennummer": {
      "key": "seriennummer",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Seriennummer",
      "writable": true,
      "maxLength": 4000
    },
    "modell": {
      "key": "modell",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Modell / Hersteller",
      "writable": true,
      "maxLength": 4000
    },
    "seifentyp": {
      "key": "seifentyp",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Seifentyp",
      "writable": true,
      "options": [
        "fluessigseife",
        "schaumseife",
        "desinfektionsmittel",
        "handlotion",
        "sonstiges_seife"
      ]
    },
    "fuellstand": {
      "key": "fuellstand",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Aktueller Füllstand",
      "writable": true,
      "options": [
        "voll",
        "mittel",
        "niedrig",
        "leer"
      ]
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "aktiv",
        "status_leer",
        "defekt",
        "ausser_betrieb"
      ]
    },
    "installationsdatum": {
      "key": "installationsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Installationsdatum",
      "writable": true
    },
    "naechste_wartung": {
      "key": "naechste_wartung",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Nächste geplante Wartung",
      "writable": true
    },
    "foto_spender": {
      "key": "foto_spender",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Foto des Seifenspenders",
      "writable": false
    },
    "bemerkungen_spender": {
      "key": "bemerkungen_spender",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bemerkungen",
      "writable": true
    }
  },
  "wartungsprotokoll": {
    "seifenspender": {
      "key": "seifenspender",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Seifenspender",
      "writable": true,
      "targetAppId": "6abcef281a43c0ac9e8208b3",
      "targetEntity": "seifenspender"
    },
    "datum_uhrzeit": {
      "key": "datum_uhrzeit",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": true,
      "label": "Datum und Uhrzeit der Maßnahme",
      "writable": true
    },
    "massnahme": {
      "key": "massnahme",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Art der Maßnahme",
      "writable": true,
      "options": [
        "nachfuellung",
        "reinigung",
        "reparatur",
        "austausch",
        "inspektion",
        "sonstiges_massnahme"
      ]
    },
    "fuellstand_nach_wartung": {
      "key": "fuellstand_nach_wartung",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Füllstand nach Maßnahme",
      "writable": true,
      "options": [
        "voll_nach",
        "mittel_nach",
        "niedrig_nach",
        "leer_nach"
      ]
    },
    "durchgefuehrt_von_vorname": {
      "key": "durchgefuehrt_von_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname der durchführenden Person",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "durchgefuehrt_von_nachname": {
      "key": "durchgefuehrt_von_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname der durchführenden Person",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "bemerkungen_wartung": {
      "key": "bemerkungen_wartung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bemerkungen zur Maßnahme",
      "writable": true
    },
    "foto_wartung": {
      "key": "foto_wartung",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Foto (optional)",
      "writable": false
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "hotels": [],
  "standorte": [
    {
      "kind": "record",
      "field": "hotel",
      "targetEntity": "hotels"
    }
  ],
  "seifenspender": [
    {
      "kind": "choice",
      "field": "seifentyp",
      "count": 5
    },
    {
      "kind": "choice",
      "field": "fuellstand",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    },
    {
      "kind": "record",
      "field": "standort",
      "targetEntity": "standorte"
    }
  ],
  "wartungsprotokoll": [
    {
      "kind": "choice",
      "field": "massnahme",
      "count": 6
    },
    {
      "kind": "choice",
      "field": "fuellstand_nach_wartung",
      "count": 4
    },
    {
      "kind": "record",
      "field": "seifenspender",
      "targetEntity": "seifenspender"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "hotels": [
    "hotel_name"
  ],
  "standorte": [
    "standort_bezeichnung"
  ],
  "seifenspender": [
    "seriennummer"
  ],
  "wartungsprotokoll": [
    "durchgefuehrt_von_vorname"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
