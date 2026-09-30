import type { Seifenspender, Standorte, Wartungsprotokoll } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface SeifenspenderDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Seifenspender;
  /** N:1-Ziel „Standorte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  standorteList: Standorte[];
  /** Klick auf die Standorte-Relation → overlay.push auf dessen Detail. */
  onOpenStandorte?: (record: Standorte) => void;
  /** 1:N „Wartungsprotokoll" (seifenspender): VOLLE Liste — der Block filtert auf diesen Record. */
  wartungsprotokollList: Wartungsprotokoll[];
  /** Zeilen-Klick → overlay.push auf das Wartungsprotokoll-Detail (nie der Edit-Dialog). */
  onOpenWartungsprotokoll: (record: Wartungsprotokoll) => void;
  /** Kontextuelles „+": öffnet den Wartungsprotokoll-Dialog mit diesem Record vorgesetzt. */
  onAddWartungsprotokoll: () => void;
}

export function SeifenspenderDetails({
  record,
  standorteList,
  onOpenStandorte,
  wartungsprotokollList,
  onOpenWartungsprotokoll,
  onAddWartungsprotokoll,
}: SeifenspenderDetailsProps) {
  const standortTarget = standorteList.find(r => r.record_id === extractRecordId(record.fields.standort));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('seifenspender', 'seriennummer')} value={record.fields.seriennummer} format="text" />
        <RecordField label={fieldLabel('seifenspender', 'modell')} value={record.fields.modell} format="text" />
        <RecordField label={fieldLabel('seifenspender', 'seifentyp')} value={record.fields.seifentyp} format="pill" />
        <RecordField label={fieldLabel('seifenspender', 'fuellstand')} value={record.fields.fuellstand} format="pill" />
        <RecordField label={fieldLabel('seifenspender', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('seifenspender', 'installationsdatum')} value={record.fields.installationsdatum} format="date" />
        <RecordField label={fieldLabel('seifenspender', 'naechste_wartung')} value={record.fields.naechste_wartung} format="date" />
        <RecordField label={fieldLabel('seifenspender', 'foto_spender')} className="md:col-span-2">
          {record.fields.foto_spender ? (
            <MediaThumbnail src={record.fields.foto_spender as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('seifenspender', 'bemerkungen_spender')} value={record.fields.bemerkungen_spender} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('seifenspender', 'standort')}
          name={standortTarget?.fields.standort_bezeichnung ?? '—'}
          meta={[standortTarget?.fields.stockwerk].filter(Boolean).join(' · ') || undefined}
          onClick={standortTarget && onOpenStandorte ? () => onOpenStandorte!(standortTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('wartungsprotokoll')}
        items={wartungsprotokollList.filter(r => extractRecordId(r.fields.seifenspender) === record.record_id)}
        map={r => ({ name: r.fields.durchgefuehrt_von_vorname ?? appLabel('wartungsprotokoll'), meta: r.fields.datum_uhrzeit })}
        onOpen={onOpenWartungsprotokoll}
        onAdd={onAddWartungsprotokoll}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.SEIFENSPENDER} recordId={record.record_id} />
    </>
  );
}
