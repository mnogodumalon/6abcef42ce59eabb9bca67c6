import type { Wartungsprotokoll, Seifenspender } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';

export interface WartungsprotokollDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Wartungsprotokoll;
  /** N:1-Ziel „Seifenspender": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  seifenspenderList: Seifenspender[];
  /** Klick auf die Seifenspender-Relation → overlay.push auf dessen Detail. */
  onOpenSeifenspender?: (record: Seifenspender) => void;
}

export function WartungsprotokollDetails({
  record,
  seifenspenderList,
  onOpenSeifenspender,
}: WartungsprotokollDetailsProps) {
  const seifenspenderTarget = seifenspenderList.find(r => r.record_id === extractRecordId(record.fields.seifenspender));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('wartungsprotokoll', 'datum_uhrzeit')} value={record.fields.datum_uhrzeit} format="datetime" />
        <RecordField label={fieldLabel('wartungsprotokoll', 'massnahme')} value={record.fields.massnahme} format="pill" />
        <RecordField label={fieldLabel('wartungsprotokoll', 'fuellstand_nach_wartung')} value={record.fields.fuellstand_nach_wartung} format="pill" />
        <RecordField label={fieldLabel('wartungsprotokoll', 'durchgefuehrt_von_vorname')} value={record.fields.durchgefuehrt_von_vorname} format="text" />
        <RecordField label={fieldLabel('wartungsprotokoll', 'durchgefuehrt_von_nachname')} value={record.fields.durchgefuehrt_von_nachname} format="text" />
        <RecordField label={fieldLabel('wartungsprotokoll', 'bemerkungen_wartung')} value={record.fields.bemerkungen_wartung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('wartungsprotokoll', 'foto_wartung')} className="md:col-span-2">
          {record.fields.foto_wartung ? (
            <MediaThumbnail src={record.fields.foto_wartung as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('wartungsprotokoll', 'seifenspender')}
          name={seifenspenderTarget?.fields.seriennummer ?? '—'}
          meta={[seifenspenderTarget?.fields.modell].filter(Boolean).join(' · ') || undefined}
          onClick={seifenspenderTarget && onOpenSeifenspender ? () => onOpenSeifenspender!(seifenspenderTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.WARTUNGSPROTOKOLL} recordId={record.record_id} />
    </>
  );
}
