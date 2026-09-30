/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'hotels'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.hotels.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.hotels.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.hotels.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.hotels              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   hotels: hotel_name, strasse, hausnummer, postleitzahl, stadt, land, ansprechpartner_vorname, ansprechpartner_nachname, …  ·  ← standorte (list + contextual +)
 *   standorte: hotel, standort_bezeichnung, stockwerk, raumtyp, standort_beschreibung  ·  → hotels · ← seifenspender (list + contextual +)
 *   seifenspender: standort, seriennummer, modell, seifentyp, fuellstand, status, installationsdatum, naechste_wartung, …  ·  → standorte · ← wartungsprotokoll (list + contextual +)
 *   wartungsprotokoll: seifenspender, datum_uhrzeit, massnahme, fuellstand_nach_wartung, durchgefuehrt_von_vorname, durchgefuehrt_von_nachname, bemerkungen_wartung, foto_wartung  ·  → seifenspender
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Hotels, Standorte, Seifenspender, Wartungsprotokoll } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichStandorte, enrichSeifenspender, enrichWartungsprotokoll } from '@/lib/enrich';
import type { EnrichedStandorte, EnrichedSeifenspender, EnrichedWartungsprotokoll } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { HotelsDialog, type HotelsDialogDefaults } from '@/components/dialogs/HotelsDialog';
import { HotelsDetails } from '@/components/details/HotelsDetails';
import { StandorteDialog, type StandorteDialogDefaults } from '@/components/dialogs/StandorteDialog';
import { StandorteDetails } from '@/components/details/StandorteDetails';
import { SeifenspenderDialog, type SeifenspenderDialogDefaults } from '@/components/dialogs/SeifenspenderDialog';
import { SeifenspenderDetails } from '@/components/details/SeifenspenderDetails';
import { WartungsprotokollDialog, type WartungsprotokollDialogDefaults } from '@/components/dialogs/WartungsprotokollDialog';
import { WartungsprotokollDetails } from '@/components/details/WartungsprotokollDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'hotels'; record: Hotels }
  | { type: 'standorte'; record: EnrichedStandorte }
  | { type: 'seifenspender'; record: EnrichedSeifenspender }
  | { type: 'wartungsprotokoll'; record: EnrichedWartungsprotokoll };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  hotels: EntityCrudApi<Hotels, HotelsDialogDefaults>;
  standorte: EntityCrudApi<Standorte, StandorteDialogDefaults>;
  seifenspender: EntityCrudApi<Seifenspender, SeifenspenderDialogDefaults>;
  wartungsprotokoll: EntityCrudApi<Wartungsprotokoll, WartungsprotokollDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { hotels: Hotels[]; standorte: EnrichedStandorte[]; seifenspender: EnrichedSeifenspender[]; wartungsprotokoll: EnrichedWartungsprotokoll[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  const [hotelsDialog, setHotelsDialog] = useState<{ defaults?: HotelsDialogDefaults; editing?: Hotels } | null>(null);
  const [standorteDialog, setStandorteDialog] = useState<{ defaults?: StandorteDialogDefaults; editing?: Standorte } | null>(null);
  const [seifenspenderDialog, setSeifenspenderDialog] = useState<{ defaults?: SeifenspenderDialogDefaults; editing?: Seifenspender } | null>(null);
  const [wartungsprotokollDialog, setWartungsprotokollDialog] = useState<{ defaults?: WartungsprotokollDialogDefaults; editing?: Wartungsprotokoll } | null>(null);
  const enrichedStandorte = useMemo(() => enrichStandorte(data.standorte, { hotelsMap: data.hotelsMap }), [data.standorte, data.hotelsMap]);
  const enrichedSeifenspender = useMemo(() => enrichSeifenspender(data.seifenspender, { standorteMap: data.standorteMap }), [data.seifenspender, data.standorteMap]);
  const enrichedWartungsprotokoll = useMemo(() => enrichWartungsprotokoll(data.wartungsprotokoll, { seifenspenderMap: data.seifenspenderMap }), [data.wartungsprotokoll, data.seifenspenderMap]);

  function detailHotels(record: Hotels, push = false) {
    const item: OverlayItem = { type: 'hotels', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitHotels(fields: Hotels['fields']) {
    const editing = hotelsDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setHotels(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateHotel(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('hotels')} — ${t('crud_updated')}`, async () => {
        data.setHotels(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateHotel(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createHotel(fields);
      undoToast(`${appLabel('hotels')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailStandorte(record: Standorte, push = false) {
    const rec = enrichedStandorte.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'standorte', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitStandorte(fields: Standorte['fields']) {
    const editing = standorteDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setStandorte(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateStandorteEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('standorte')} — ${t('crud_updated')}`, async () => {
        data.setStandorte(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateStandorteEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createStandorteEntry(fields);
      undoToast(`${appLabel('standorte')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailSeifenspender(record: Seifenspender, push = false) {
    const rec = enrichedSeifenspender.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'seifenspender', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitSeifenspender(fields: Seifenspender['fields']) {
    const editing = seifenspenderDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setSeifenspender(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateSeifenspenderEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('seifenspender')} — ${t('crud_updated')}`, async () => {
        data.setSeifenspender(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateSeifenspenderEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createSeifenspenderEntry(fields);
      undoToast(`${appLabel('seifenspender')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailWartungsprotokoll(record: Wartungsprotokoll, push = false) {
    const rec = enrichedWartungsprotokoll.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'wartungsprotokoll', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitWartungsprotokoll(fields: Wartungsprotokoll['fields']) {
    const editing = wartungsprotokollDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setWartungsprotokoll(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateWartungsprotokollEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('wartungsprotokoll')} — ${t('crud_updated')}`, async () => {
        data.setWartungsprotokoll(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateWartungsprotokollEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createWartungsprotokollEntry(fields);
      undoToast(`${appLabel('wartungsprotokoll')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <HotelsDialog
        open={hotelsDialog !== null}
        onClose={() => setHotelsDialog(null)}
        onSubmit={submitHotels}
        defaultValues={hotelsDialog?.defaults}
        recordId={hotelsDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Hotels']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Hotels']}
      />
      <StandorteDialog
        open={standorteDialog !== null}
        onClose={() => setStandorteDialog(null)}
        onSubmit={submitStandorte}
        defaultValues={standorteDialog?.defaults}
        recordId={standorteDialog?.editing?.record_id}
        hotelsList={data.hotels}
        enablePhotoScan={AI_PHOTO_SCAN['Standorte']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Standorte']}
      />
      <SeifenspenderDialog
        open={seifenspenderDialog !== null}
        onClose={() => setSeifenspenderDialog(null)}
        onSubmit={submitSeifenspender}
        defaultValues={seifenspenderDialog?.defaults}
        recordId={seifenspenderDialog?.editing?.record_id}
        standorteList={data.standorte}
        enablePhotoScan={AI_PHOTO_SCAN['Seifenspender']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Seifenspender']}
      />
      <WartungsprotokollDialog
        open={wartungsprotokollDialog !== null}
        onClose={() => setWartungsprotokollDialog(null)}
        onSubmit={submitWartungsprotokoll}
        defaultValues={wartungsprotokollDialog?.defaults}
        recordId={wartungsprotokollDialog?.editing?.record_id}
        seifenspenderList={data.seifenspender}
        enablePhotoScan={AI_PHOTO_SCAN['Wartungsprotokoll']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Wartungsprotokoll']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'hotels') {
            return (
              <>
                <RecordHeader title={top.record.fields.hotel_name ?? appLabel('hotels')} subtitle={undefined} />
                <HotelsDetails
                  record={top.record}
                  standorteList={data.standorte}
                  onOpenStandorte={(r) => detailStandorte(r, true)}
                  onAddStandorte={() => setStandorteDialog({ defaults: { hotel: createRecordUrl(APP_IDS.HOTELS, top.record.record_id) } })}
                />
              </>
            );
          }
          if (top.type === 'standorte') {
            return (
              <>
                <RecordHeader title={top.record.fields.standort_bezeichnung ?? appLabel('standorte')} subtitle={undefined} />
                <StandorteDetails
                  record={top.record}
                  hotelsList={data.hotels}
                  onOpenHotels={(r) => detailHotels(r, true)}
                  seifenspenderList={data.seifenspender}
                  onOpenSeifenspender={(r) => detailSeifenspender(r, true)}
                  onAddSeifenspender={() => setSeifenspenderDialog({ defaults: { standort: createRecordUrl(APP_IDS.STANDORTE, top.record.record_id) } })}
                />
              </>
            );
          }
          if (top.type === 'seifenspender') {
            return (
              <>
                <RecordHeader title={top.record.fields.seriennummer ?? appLabel('seifenspender')} subtitle={top.record.fields.installationsdatum ? formatDate(top.record.fields.installationsdatum) : undefined} />
                <SeifenspenderDetails
                  record={top.record}
                  standorteList={data.standorte}
                  onOpenStandorte={(r) => detailStandorte(r, true)}
                  wartungsprotokollList={data.wartungsprotokoll}
                  onOpenWartungsprotokoll={(r) => detailWartungsprotokoll(r, true)}
                  onAddWartungsprotokoll={() => setWartungsprotokollDialog({ defaults: { seifenspender: createRecordUrl(APP_IDS.SEIFENSPENDER, top.record.record_id) } })}
                />
              </>
            );
          }
          if (top.type === 'wartungsprotokoll') {
            return (
              <>
                <RecordHeader title={top.record.fields.durchgefuehrt_von_vorname ?? appLabel('wartungsprotokoll')} subtitle={top.record.fields.datum_uhrzeit ? formatDate(top.record.fields.datum_uhrzeit) : undefined} />
                <WartungsprotokollDetails
                  record={top.record}
                  seifenspenderList={data.seifenspender}
                  onOpenSeifenspender={(r) => detailSeifenspender(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'hotels') setHotelsDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'standorte') setStandorteDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'seifenspender') setSeifenspenderDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'wartungsprotokoll') setWartungsprotokollDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    hotels: {
      openCreate: (defaults?: HotelsDialogDefaults) => setHotelsDialog({ defaults }),
      openEdit: (record: Hotels) => setHotelsDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Hotels) => detailHotels(record, false),
    },
    standorte: {
      openCreate: (defaults?: StandorteDialogDefaults) => setStandorteDialog({ defaults }),
      openEdit: (record: Standorte) => setStandorteDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Standorte) => detailStandorte(record, false),
    },
    seifenspender: {
      openCreate: (defaults?: SeifenspenderDialogDefaults) => setSeifenspenderDialog({ defaults }),
      openEdit: (record: Seifenspender) => setSeifenspenderDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Seifenspender) => detailSeifenspender(record, false),
    },
    wartungsprotokoll: {
      openCreate: (defaults?: WartungsprotokollDialogDefaults) => setWartungsprotokollDialog({ defaults }),
      openEdit: (record: Wartungsprotokoll) => setWartungsprotokollDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Wartungsprotokoll) => detailWartungsprotokoll(record, false),
    },
    enriched: { hotels: data.hotels, standorte: enrichedStandorte, seifenspender: enrichedSeifenspender, wartungsprotokoll: enrichedWartungsprotokoll },
  };
}
