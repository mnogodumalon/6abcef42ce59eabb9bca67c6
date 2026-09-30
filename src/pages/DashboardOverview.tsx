import { useMemo, useState } from 'react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import { APP_IDS, LOOKUP_OPTIONS, lookupOption } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { lookupKey, formatDate } from '@/lib/formatters';
import { tx, appLabel } from '@/i18n';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { KanbanWidget, type KanbanCard, type KanbanColumn } from '@/components/widgets/KanbanWidget';
import { ChartWidget, ChartSkeleton } from '@/components/widgets/ChartWidget';
import { Button } from '@/components/ui/button';
import {
  IconDroplet,
  IconAlertTriangle,
  IconBuildingStore,
  IconPlus,
  IconTool,
  IconCheckbox,
  IconMapPin,
} from '@tabler/icons-react';
import { format } from 'date-fns';

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const {
    hotels,
    seifenspender,
    setSeifenspender,
    wartungsprotokoll,
    standorteMap,
    seifenspenderMap,
    fetchAll,
  } = data;

  const crud = useEntityCrud(data);
  const enrichedSeifenspender = crud.enriched.seifenspender;
  const enrichedWartungsprotokoll = crud.enriched.wartungsprotokoll;

  const clock = useClock();
  const today = format(clock, 'yyyy-MM-dd');

  // ---------- derived state ----------

  const defekt = useMemo(
    () => seifenspender.filter(s => lookupKey(s.fields.status) === 'defekt'),
    [seifenspender],
  );
  const ausserBetrieb = useMemo(
    () => seifenspender.filter(s => lookupKey(s.fields.status) === 'ausser_betrieb'),
    [seifenspender],
  );
  const leer = useMemo(
    () => seifenspender.filter(s => lookupKey(s.fields.status) === 'status_leer'),
    [seifenspender],
  );
  const niedrig = useMemo(
    () => seifenspender.filter(s => lookupKey(s.fields.fuellstand) === 'niedrig'),
    [seifenspender],
  );

  // Wartungen heute oder überfällig
  const faelligeWartungen = useMemo(
    () =>
      enrichedSeifenspender
        .filter(s => {
          const w = s.fields.naechste_wartung;
          return w && w <= today;
        })
        .sort((a, b) => {
          const da = a.fields.naechste_wartung ?? '';
          const db = b.fields.naechste_wartung ?? '';
          return da < db ? -1 : da > db ? 1 : 0;
        }),
    [enrichedSeifenspender, today],
  );

  const letzteWartungen = useMemo(
    () =>
      [...enrichedWartungsprotokoll]
        .sort((a, b) => {
          const da = a.fields.datum_uhrzeit ?? '';
          const db = b.fields.datum_uhrzeit ?? '';
          return da > db ? -1 : da < db ? 1 : 0;
        })
        .slice(0, 8),
    [enrichedWartungsprotokoll],
  );

  // ---------- context line ----------
  const urgentCount = defekt.length + ausserBetrieb.length;
  const contextLine = useMemo(() => {
    if (seifenspender.length === 0)
      return tx('Noch keine Spender erfasst — lege jetzt den ersten an.');
    if (urgentCount > 0) {
      const names = namen(
        [...defekt, ...ausserBetrieb].map(
          s =>
            s.fields.seriennummer ??
            s.fields.modell ??
            tx('Spender'),
        ),
      );
      return tx`${names} ${urgentCount === 1 ? tx('benötigt') : tx('benötigen')} sofortige Aufmerksamkeit.`;
    }
    if (leer.length > 0)
      return tx`${leer.length} ${leer.length === 1 ? tx('Spender ist leer') : tx('Spender sind leer')} und müssen nachgefüllt werden.`;
    return tx('Alle Spender aktiv — kein sofortiger Handlungsbedarf.');
  }, [seifenspender, urgentCount, defekt, ausserBetrieb, leer]);

  // ---------- Kanban columns ----------
  const COLUMNS = useMemo<KanbanColumn[]>(
    () =>
      (LOOKUP_OPTIONS['seifenspender']?.['status'] ?? []).map(o => ({
        key: o.key,
        label: o.label,
        tone:
          o.key === 'aktiv'
            ? 'success'
            : o.key === 'status_leer'
            ? 'warning'
            : o.key === 'defekt'
            ? 'destructive'
            : 'default',
      })) as KanbanColumn[],
    [],
  );

  const cards = useMemo<KanbanCard[]>(
    () =>
      enrichedSeifenspender.map(s => {
        const st = lookupKey(s.fields.status) ?? 'aktiv';
        const fuell = lookupKey(s.fields.fuellstand);
        return {
          id: `seifenspender:${s.record_id}`,
          column: st,
          title: s.fields.seriennummer ?? s.fields.modell ?? tx('Spender'),
          subtitle: s.standortName
            ? `${s.standortName}${fuell === 'niedrig' || fuell === 'leer' ? ' · ⚠ ' + (s.fields.fuellstand?.label ?? '') : ''}`
            : undefined,
          tone:
            st === 'aktiv'
              ? 'success'
              : st === 'status_leer'
              ? 'warning'
              : st === 'defekt'
              ? 'destructive'
              : 'default',
        };
      }),
    [enrichedSeifenspender],
  );

  // ---------- Card move (optimistic) ----------
  const moveCard = async (cardId: string, newColumn: string) => {
    const rid = cardId.split(':')[1];
    if (!rid) return;

    const prev = seifenspender.find(s => s.record_id === rid);
    if (!prev) return;

    const prevStatus = lookupKey(prev.fields.status);
    if (prevStatus === newColumn) return;

    const newLookup = lookupOption('seifenspender', 'status', newColumn);
    setSeifenspender(all =>
      all.map(s =>
        s.record_id === rid
          ? { ...s, fields: { ...s.fields, status: newLookup } }
          : s,
      ),
    );

    undoToast(
      tx`Status auf ${newLookup.label} gesetzt`,
      async () => {
        setSeifenspender(all =>
          all.map(s =>
            s.record_id === rid
              ? { ...s, fields: { ...s.fields, status: prev.fields.status } }
              : s,
          ),
        );
        try {
          await LivingAppsService.updateSeifenspenderEntry(rid, {
            status: prevStatus ?? undefined,
          });
        } catch {
          await fetchAll();
        }
      },
    );

    try {
      await LivingAppsService.updateSeifenspenderEntry(rid, { status: newColumn });
    } catch {
      await fetchAll();
    }
  };

  // ---------- Wartung erfassen (quick action) ----------
  const logWartung = (spenderId: string) => {
    crud.wartungsprotokoll.openCreate({
      seifenspender: spenderId,
      datum_uhrzeit: format(clock, "yyyy-MM-dd'T'HH:mm"),
    });
  };

  // ---------- Hero: defekte/außer Betrieb Spender ----------
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const criticalSpender = [...defekt, ...ausserBetrieb];

  // ChartWidget rows for fill level
  const fuellRows = useMemo(
    () =>
      seifenspender.map(s => ({
        id: `seifenspender:${s.record_id}`,
        data: s,
      })),
    [seifenspender],
  );

  const statusRows = useMemo(
    () =>
      seifenspender.map(s => ({
        id: `seifenspender:${s.record_id}`,
        data: s,
      })),
    [seifenspender],
  );

  const emptyApp = seifenspender.length === 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            {gruss(clock)}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{contextLine}</p>
        </div>
        <Button
          onClick={() => crud.seifenspender.openCreate({ status: 'aktiv' })}
          size="sm"
          className="shrink-0"
        >
          <IconPlus size={15} className="mr-1 shrink-0" />
          {tx('Spender hinzufügen')}
        </Button>
      </div>

      {emptyApp ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="rounded-2xl bg-muted p-5">
            <IconDroplet size={48} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-lg">{tx('Noch keine Seifenspender erfasst')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {tx('Lege zunächst ein Hotel und einen Standort an, dann füge den ersten Spender hinzu.')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => crud.hotels.openCreate({})}>
              <IconBuildingStore size={14} className="mr-1 shrink-0" />
              {tx('Hotel anlegen')}
            </Button>
            <Button size="sm" onClick={() => crud.seifenspender.openCreate({ status: 'aktiv' })}>
              <IconPlus size={14} className="mr-1 shrink-0" />
              {tx('Spender anlegen')}
            </Button>
          </div>
        </div>
      ) : (
        <DashboardGrid
          variant="wide"
          hero={
            criticalSpender.length > 0 ? (
              <HeroBanner
                icon={<IconAlertTriangle size={18} />}
                action={{
                  label: tx('Wartung erfassen'),
                  onClick: () => {
                    const first = criticalSpender[0];
                    if (first) logWartung(first.record_id);
                  },
                }}
              >
                <b>
                  {namen(
                    criticalSpender.map(
                      s => s.fields.seriennummer ?? s.fields.modell ?? tx('Spender'),
                    ),
                  )}
                </b>{' '}
                {criticalSpender.length === 1
                  ? tx('ist defekt oder außer Betrieb')
                  : tx('sind defekt oder außer Betrieb')}{' '}
                — {tx('sofortiger Handlungsbedarf')}
              </HeroBanner>
            ) : undefined
          }
          kpis={
            <StatStrip>
              <StatStripItem
                title={tx('Gesamt')}
                value={seifenspender.length}
                icon={<IconDroplet size={14} className="shrink-0" />}
              />
              <StatStripItem
                title={tx('Aktiv')}
                value={seifenspender.filter(s => lookupKey(s.fields.status) === 'aktiv').length}
                tone="success"
                icon={<IconCheckbox size={14} className="shrink-0" />}
                onClick={() => setFilterStatus(f => (f === 'aktiv' ? null : 'aktiv'))}
                active={filterStatus === 'aktiv'}
              />
              <StatStripItem
                title={tx('Leer')}
                value={leer.length}
                tone={leer.length > 0 ? 'warning' : 'default'}
                icon={<IconDroplet size={14} className="shrink-0" />}
                onClick={() => setFilterStatus(f => (f === 'status_leer' ? null : 'status_leer'))}
                active={filterStatus === 'status_leer'}
              />
              <StatStripItem
                title={tx('Defekt')}
                value={defekt.length}
                tone={defekt.length > 0 ? 'destructive' : 'default'}
                icon={<IconTool size={14} className="shrink-0" />}
                onClick={() => setFilterStatus(f => (f === 'defekt' ? null : 'defekt'))}
                active={filterStatus === 'defekt'}
              />
              <StatStripItem
                title={tx('Hotels')}
                value={hotels.length}
                icon={<IconBuildingStore size={14} className="shrink-0" />}
                onClick={() => crud.hotels.openCreate({})}
              />
            </StatStrip>
          }
          primary={
            <KanbanWidget
              columns={COLUMNS}
              cards={filterStatus ? cards.filter(c => c.column === filterStatus) : cards}
              defaultCollapsed={['ausser_betrieb']}
              onCardClick={card => {
                const rid = card.id.split(':')[1];
                const rec = seifenspender.find(s => s.record_id === rid);
                if (rec) crud.seifenspender.openDetail(rec);
              }}
              onCardMove={moveCard}
              onAddCard={column => crud.seifenspender.openCreate({ status: column })}
            />
          }
          aside={
            <>
              <WorkList
                title={tx('Wartungen fällig')}
                items={faelligeWartungen.map(s => ({
                  id: s.record_id,
                  title: s.fields.seriennummer ?? s.fields.modell ?? tx('Spender'),
                  secondLine: (
                    <>
                      <span className={s.fields.naechste_wartung && s.fields.naechste_wartung < today ? 'font-medium text-destructive' : 'font-medium text-amber-600'}>
                        {s.fields.naechste_wartung && s.fields.naechste_wartung < today
                          ? tx('Überfällig')
                          : tx('Heute fällig')}
                      </span>
                      <span className="text-muted-foreground">
                        {' · '}
                        {s.standortName || tx('Kein Standort')}
                        {' · '}
                        {formatDate(s.fields.naechste_wartung)}
                      </span>
                    </>
                  ),
                  action: {
                    label: tx('Wartung'),
                    onClick: () => logWartung(s.record_id),
                  },
                }))}
                onItemClick={id => {
                  const rec = seifenspender.find(s => s.record_id === id);
                  if (rec) crud.seifenspender.openDetail(rec);
                }}
                empty={{
                  text: niedrig.length > 0
                    ? tx('Keine Wartungen fällig — aber einige Spender haben niedrigen Füllstand.')
                    : tx('Keine fälligen Wartungen — alles im grünen Bereich.'),
                }}
              />

              <WorkList
                title={tx('Letzte Wartungen')}
                items={letzteWartungen.map(w => ({
                  id: w.record_id,
                  title: w.seifenspenderName || tx('Spender'),
                  secondLine: (
                    <>
                      <span className="font-medium text-muted-foreground">
                        {w.fields.massnahme?.label ?? '—'}
                      </span>
                      {(w.fields.durchgefuehrt_von_vorname || w.fields.durchgefuehrt_von_nachname) && (
                        <span className="text-muted-foreground">
                          {' · '}
                          {[w.fields.durchgefuehrt_von_vorname, w.fields.durchgefuehrt_von_nachname]
                            .filter(Boolean)
                            .join(' ')}
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        {' · '}
                        {formatDate(w.fields.datum_uhrzeit)}
                      </span>
                    </>
                  ),
                }))}
                onItemClick={id => {
                  const rec = wartungsprotokoll.find(w => w.record_id === id);
                  if (rec) crud.wartungsprotokoll.openDetail(rec);
                }}
                empty={{
                  text: tx('Noch keine Wartungen erfasst.'),
                  action: {
                    label: tx('Wartung erfassen'),
                    onClick: () => crud.wartungsprotokoll.openCreate({
                      datum_uhrzeit: format(clock, "yyyy-MM-dd'T'HH:mm"),
                    }),
                  },
                }}
              />

              {/* Fill-level chart — different axis than the Kanban (which shows status) */}
              {seifenspender.length > 0 && (
                <ChartWidget
                  title={tx('Füllstand-Verteilung')}
                  rows={fuellRows}
                  dimension={{
                    kind: 'category',
                    accessor: r => r.data.fields.fuellstand,
                  }}
                />
              )}
            </>
          }
        />
      )}

      {crud.surfaces}
    </div>
  );
}
