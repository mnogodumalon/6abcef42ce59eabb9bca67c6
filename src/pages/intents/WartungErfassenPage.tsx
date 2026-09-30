/**
 * Wartung erfassen — 3-Schritt-Wizard.
 * Steps: 1) Seifenspender wählen → 2) Maßnahme eintragen → 3) Zusammenfassung & Absenden.
 * Reads: seifenspender. Writes: wartungsprotokoll (create), seifenspender (update fuellstand/status).
 * Composes: IntentWizardShell, WizardStep, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { format } from 'date-fns';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { StatusBadge } from '@/components/blocks/StatusBadge';
import {
  useStepForm,
  useJourneySubmit,
  useRecordSearch,
  fieldText,
  fieldLookup,
  nowIso,
} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { tx } from '@/i18n';

export default function WartungErfassenPage() {
  const [step, setStep] = useState(1);

  // Seifenspender-Suche — alle, auch defekte (Wartung ist der Anlass)
  const spender = useRecordSearch(servicePort, 'seifenspender', {
    searchFields: ['seriennummer', 'modell'],
    toItem: s => ({
      id: s.id,
      title: fieldText(s, 'seriennummer'),
      subtitle: fieldText(s, 'modell') || undefined,
      status: fieldLookup(s, 'status') ?? undefined,
    }),
  });

  // Formular für das Wartungsprotokoll
  const wartung = useStepForm('wartungsprotokoll', {
    steps: {
      seifenspender: 1,
      datum_uhrzeit: 2,
      massnahme: 2,
      fuellstand_nach_wartung: 2,
      durchgefuehrt_von_vorname: 2,
      durchgefuehrt_von_nachname: 2,
      bemerkungen_wartung: 2,
    },
    initial: { datum_uhrzeit: nowIso() },
  });

  // Plan: 1) Wartungsprotokoll anlegen, 2) Seifenspender aktualisieren
  const submit = useJourneySubmit(servicePort, [
    {
      key: 'protokoll',
      entity: 'wartungsprotokoll',
      form: wartung,
      primary: true,
    },
    {
      key: 'spenderUpdate',
      entity: 'seifenspender',
      needs: ['protokoll'],
      updates: (_ctx) => wartung.get('seifenspender') as string,
      values: (_ctx) => {
        const massnahme = wartung.get('massnahme') as string | null;
        const fuellstandNach = wartung.get('fuellstand_nach_wartung') as string | null;

        // Füllstand-Mapping: voll_nach→voll, mittel_nach→mittel, niedrig_nach→niedrig, leer_nach→leer
        const fuellstandMap: Record<string, string> = {
          voll_nach: 'voll',
          mittel_nach: 'mittel',
          niedrig_nach: 'niedrig',
          leer_nach: 'leer',
        };
        const neuerFuellstand = fuellstandNach ? fuellstandMap[fuellstandNach] : undefined;

        // Status-Logik: reparatur/austausch → aktiv; leer_nach → status_leer; sonst unverändert lassen
        let neuerStatus: string | undefined;
        if (massnahme === 'reparatur' || massnahme === 'austausch') {
          neuerStatus = 'aktiv';
        } else if (fuellstandNach === 'leer_nach') {
          neuerStatus = 'status_leer';
        }

        const vals: Record<string, unknown> = {};
        if (neuerFuellstand) vals.fuellstand = neuerFuellstand;
        if (neuerStatus) vals.status = neuerStatus;
        return vals;
      },
      verb: 'update',
    },
  ], { draftKey: 'wartung-erfassen' });

  const spenderId = wartung.get('seifenspender') as string | null;
  const spenderRecord = spenderId ? spender.recordOf(spenderId) : undefined;
  const fuellstandLabel = spenderRecord ? fieldLookup(spenderRecord, 'fuellstand')?.label : undefined;
  const statusKey = spenderRecord ? fieldLookup(spenderRecord, 'status')?.key : undefined;
  const statusLabel = spenderRecord ? fieldLookup(spenderRecord, 'status')?.label : undefined;

  const restart = () => {
    submit.reset();
    wartung.reset({ datum_uhrzeit: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
    setStep(1);
  };

  return (
    <IntentWizardShell
      title={tx('Wartung erfassen')}
      subtitle={tx('Maßnahme dokumentieren und Füllstand aktualisieren')}
      currentStep={step}
      onStepChange={setStep}
      forms={[wartung]}
      draftKey="wartung-erfassen"
      intro={{
        description: tx('Seifenspender wählen, Wartungsmaßnahme eintragen und Füllstand aktualisieren.'),
        needs: [tx('Seriennummer oder Modell des Spenders'), tx('Art der Maßnahme')],
      }}
    >
      {/* Schritt 1: Seifenspender wählen */}
      <WizardStep
        label={tx('Seifenspender')}
        description={tx('Wähle den gewarteten Seifenspender — auch defekte Geräte erscheinen in der Liste.')}
      >
        <EntitySelectStep
          {...spender.select}
          selectedId={spenderId}
          onSelect={id => {
            wartung.set('seifenspender', id, spender.labelOf(id));
            setStep(2);
          }}
          searchPlaceholder={tx('Seriennummer oder Modell suchen …')}
          avatar="none"
          create={false}
          emptyText={tx('Kein Seifenspender gefunden. Zuerst einen Spender aufnehmen.')}
        />
        {spenderId && spenderRecord && (
          <div className="mt-4 flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{spender.labelOf(spenderId)}</span>
            {fuellstandLabel && (
              <span className="rounded-full bg-secondary px-2 py-0.5">{fuellstandLabel}</span>
            )}
            {statusKey && statusLabel && (
              <StatusBadge statusKey={statusKey} label={statusLabel} />
            )}
          </div>
        )}
      </WizardStep>

      {/* Schritt 2: Maßnahme eintragen */}
      <WizardStep
        label={tx('Maßnahme')}
        description={tx('Art, Zeitpunkt und Durchführende der Wartung festhalten.')}
        needs={['seifenspender']}
      >
        <div className="space-y-5">
          <Bound form={wartung} name="datum_uhrzeit" />
          <Bound form={wartung} name="massnahme" />
          <Bound form={wartung} name="fuellstand_nach_wartung" allowClear />
          <Bound form={wartung} name="durchgefuehrt_von_vorname" />
          <Bound form={wartung} name="durchgefuehrt_von_nachname" />
          <Bound form={wartung} name="bemerkungen_wartung" rows={3} />
          <StepNav
            onNext={() =>
              wartung.validate(['datum_uhrzeit', 'massnahme'])
            }
            nextStepLabel={tx('Zusammenfassung')}
          />
        </div>
      </WizardStep>

      {/* Schritt 3: Zusammenfassung & Absenden */}
      <WizardStep label={tx('Zusammenfassung')}>
        {!submit.done && (
          <SummaryStep
            forms={[wartung]}
            submit={submit}
            whatHappensNext={tx('Das Wartungsprotokoll wird angelegt und der Füllstand sowie Status des Seifenspenders werden aktualisiert.')}
          />
        )}
        {submit.result && (
          <SuccessStep
            result={submit.result}
            forms={[wartung]}
            submit={submit}
            restartLabel={tx('Weitere Wartung erfassen')}
            next={[
              { label: tx('Spender aufnehmen'), href: '#/intents/seifenspender-aufnehmen' },
              { label: tx('Zum Dashboard'), href: '#/' },
            ]}
            whatHappensNext={tx('Der Seifenspender zeigt jetzt den neuen Füllstand und Status.')}
          />
        )}
      </WizardStep>
    </IntentWizardShell>
  );
}
