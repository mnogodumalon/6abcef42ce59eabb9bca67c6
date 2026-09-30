import type { Standorte, Hotels, Seifenspender } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface StandorteDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Standorte;
  /** N:1-Ziel „Hotels": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  hotelsList: Hotels[];
  /** Klick auf die Hotels-Relation → overlay.push auf dessen Detail. */
  onOpenHotels?: (record: Hotels) => void;
  /** 1:N „Seifenspender" (standort): VOLLE Liste — der Block filtert auf diesen Record. */
  seifenspenderList: Seifenspender[];
  /** Zeilen-Klick → overlay.push auf das Seifenspender-Detail (nie der Edit-Dialog). */
  onOpenSeifenspender: (record: Seifenspender) => void;
  /** Kontextuelles „+": öffnet den Seifenspender-Dialog mit diesem Record vorgesetzt. */
  onAddSeifenspender: () => void;
}

export function StandorteDetails({
  record,
  hotelsList,
  onOpenHotels,
  seifenspenderList,
  onOpenSeifenspender,
  onAddSeifenspender,
}: StandorteDetailsProps) {
  const hotelTarget = hotelsList.find(r => r.record_id === extractRecordId(record.fields.hotel));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('standorte', 'standort_bezeichnung')} value={record.fields.standort_bezeichnung} format="text" />
        <RecordField label={fieldLabel('standorte', 'stockwerk')} value={record.fields.stockwerk} format="text" />
        <RecordField label={fieldLabel('standorte', 'raumtyp')} value={record.fields.raumtyp} format="pill" />
        <RecordField label={fieldLabel('standorte', 'standort_beschreibung')} value={record.fields.standort_beschreibung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('standorte', 'hotel')}
          name={hotelTarget?.fields.hotel_name ?? '—'}
          meta={[hotelTarget?.fields.telefon, hotelTarget?.fields.email].filter(Boolean).join(' · ') || undefined}
          onClick={hotelTarget && onOpenHotels ? () => onOpenHotels!(hotelTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('seifenspender')}
        items={seifenspenderList.filter(r => extractRecordId(r.fields.standort) === record.record_id)}
        map={r => ({ name: r.fields.seriennummer ?? appLabel('seifenspender'), meta: r.fields.installationsdatum })}
        onOpen={onOpenSeifenspender}
        onAdd={onAddSeifenspender}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.STANDORTE} recordId={record.record_id} />
    </>
  );
}
