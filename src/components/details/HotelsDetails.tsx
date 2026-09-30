import type { Hotels, Standorte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface HotelsDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Hotels;
  /** 1:N „Standorte" (hotel): VOLLE Liste — der Block filtert auf diesen Record. */
  standorteList: Standorte[];
  /** Zeilen-Klick → overlay.push auf das Standorte-Detail (nie der Edit-Dialog). */
  onOpenStandorte: (record: Standorte) => void;
  /** Kontextuelles „+": öffnet den Standorte-Dialog mit diesem Record vorgesetzt. */
  onAddStandorte: () => void;
}

export function HotelsDetails({
  record,
  standorteList,
  onOpenStandorte,
  onAddStandorte,
}: HotelsDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('hotels', 'hotel_name')} value={record.fields.hotel_name} format="text" />
        <RecordField label={fieldLabel('hotels', 'strasse')} value={record.fields.strasse} format="text" />
        <RecordField label={fieldLabel('hotels', 'hausnummer')} value={record.fields.hausnummer} format="text" />
        <RecordField label={fieldLabel('hotels', 'postleitzahl')} value={record.fields.postleitzahl} format="text" />
        <RecordField label={fieldLabel('hotels', 'stadt')} value={record.fields.stadt} format="text" />
        <RecordField label={fieldLabel('hotels', 'land')} value={record.fields.land} format="text" />
        <RecordField label={fieldLabel('hotels', 'ansprechpartner_vorname')} value={record.fields.ansprechpartner_vorname} format="text" />
        <RecordField label={fieldLabel('hotels', 'ansprechpartner_nachname')} value={record.fields.ansprechpartner_nachname} format="text" />
        <RecordField label={fieldLabel('hotels', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('hotels', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('hotels', 'anzahl_zimmer')} value={record.fields.anzahl_zimmer} format="text" />
        <RecordField label={fieldLabel('hotels', 'bemerkungen_hotel')} value={record.fields.bemerkungen_hotel} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('standorte')}
        items={standorteList.filter(r => extractRecordId(r.fields.hotel) === record.record_id)}
        map={r => ({ name: r.fields.standort_bezeichnung ?? appLabel('standorte'), meta: undefined })}
        onOpen={onOpenStandorte}
        onAdd={onAddStandorte}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.HOTELS} recordId={record.record_id} />
    </>
  );
}
