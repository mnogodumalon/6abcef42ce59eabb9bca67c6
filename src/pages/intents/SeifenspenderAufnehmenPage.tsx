/**
 * Seifenspender aufnehmen — 4-Schritt-Wizard.
 * Steps: 1) Hotel wählen → 2) Standort wählen (gefiltert nach Hotel) → 3) Spender-Daten → 4) Prüfen & anlegen.
 * Reads: hotels, standorte. Writes: seifenspender (createSeifenspenderEntry).
 * Composes: IntentWizardShell, WizardStep, EntitySelectStep, ChoiceGroup, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import {
  useStepForm,
  useJourneySubmit,
  useRecordSearch,
  fieldText,
  refFilter,
  todayIso,
} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { tx } from '@/i18n';

export default function SeifenspenderAufnehmenPage() {
  const [step, setStep] = useState(1);
  // Hotel-Auswahl separat verwalten (kein Entitätsfeld auf seifenspender)
  const [hotelId, setHotelId] = useState<string | null>(null);

  // Schritt 1: Hotel wählen
  const hotels = useRecordSearch(servicePort, 'hotels', {
    searchFields: ['hotel_name', 'stadt'],
    toItem: h => ({
      id: h.id,
      title: fieldText(h, 'hotel_name'),
      subtitle: fieldText(h, 'stadt'),
    }),
  });

  // Formular für den Seifenspender mit allen Feldern und Schritt-Zuordnung
  const spender = useStepForm('seifenspender', {
    steps: {
      standort: 2,
      seriennummer: 3,
      modell: 3,
      seifentyp: 3,
      fuellstand: 3,
      status: 3,
      installationsdatum: 3,
      naechste_wartung: 3,
      bemerkungen_spender: 3,
    },
    initial: {
      fuellstand: 'voll',
      status: 'aktiv',
      installationsdatum: todayIso(),
    },
  });

  // Schritt 2: Standorte nur des gewählten Hotels
  const standorte = useRecordSearch(servicePort, 'standorte', {
    searchFields: ['standort_bezeichnung', 'stockwerk'],
    filter: hotelId ? refFilter('hotel', hotelId) : undefined,
    where: hotelId
      ? r => {
          const val = r.fields['hotel'];
          if (!val) return false;
          const str = String(val);
          return str.includes(hotelId);
        }
      : undefined,
    toItem: s => ({
      id: s.id,
      title: fieldText(s, 'standort_bezeichnung'),
      subtitle: fieldText(s, 'stockwerk'),
    }),
  });

  // Plan: Seifenspender anlegen, Standort-Referenz aus Formular
  const submit = useJourneySubmit(
    servicePort,
    [
      {
        key: 'spender',
        entity: 'seifenspender',
        form: spender,
        primary: true,
      },
    ],
    { draftKey: 'seifenspender-aufnehmen' },
  );

  return (
    <IntentWizardShell
      title={tx('Seifenspender aufnehmen')}
      subtitle={tx('Neues Gerät mit Standort und Stammdaten anlegen')}
      currentStep={step}
      onStepChange={setStep}
      forms={[spender]}
      draftKey="seifenspender-aufnehmen"
      intro={{
        description: tx('Einen neuen Seifenspender im Hotel erfassen und dem richtigen Standort zuweisen.'),
        needs: [tx('Seriennummer des Geräts'), tx('Modell / Hersteller'), tx('Standort im Hotel')],
      }}
    >
      {/* Schritt 1: Hotel wählen */}
      <WizardStep
        label={tx('Hotel wählen')}
        description={tx('Das Hotel auswählen, in dem der Spender installiert wird.')}
      >
        <EntitySelectStep
          {...hotels.select}
          selectedId={hotelId ?? null}
          onSelect={id => {
            setHotelId(id);
            // Standortauswahl zurücksetzen wenn Hotel wechselt
            spender.reset({ ...spender.values, standort: undefined });
            setStep(2);
          }}
          avatar="none"
          searchPlaceholder={tx('Hotel oder Stadt suchen …')}
        />
      </WizardStep>

      {/* Schritt 2: Standort wählen */}
      <WizardStep
        label={tx('Standort wählen')}
        description={tx('Den genauen Standort im Hotel auswählen oder neu anlegen.')}
        needs={['standort']}
      >
        {hotelId ? (
          <EntitySelectStep
            {...standorte.select}
            selectedId={spender.get('standort') as string | null}
            onSelect={id => {
              spender.set('standort', id, standorte.labelOf(id));
              setStep(3);
            }}
            avatar="none"
            emptyText={tx('Für dieses Hotel gibt es noch keine Standorte. Lege jetzt einen an.')}
            create={{ fields: ['standort_bezeichnung', 'stockwerk', 'raumtyp'] }}
            searchPlaceholder={tx('Standort oder Stockwerk suchen …')}
          />
        ) : (
          <StepNav
            onBack={() => setStep(1)}
            nextDisabled
          >
            <p className="text-sm text-muted-foreground">
              {tx('Bitte zuerst ein Hotel in Schritt 1 wählen.')}
            </p>
          </StepNav>
        )}
      </WizardStep>

      {/* Schritt 3: Spender-Daten */}
      <WizardStep
        label={tx('Spender-Daten')}
        description={tx('Stammdaten, Seifentyp und Füllstand des Geräts erfassen.')}
      >
        <div className="space-y-5">
          <Bound form={spender} name="seriennummer" placeholder={tx('z. B. SN-20240001')} />
          <Bound form={spender} name="modell" placeholder={tx('z. B. Tork S4 500ml')} />
          <Bound form={spender} name="seifentyp" />
          <Bound form={spender} name="fuellstand" />
          <Bound form={spender} name="status" />
          <Bound form={spender} name="installationsdatum" />
          <Bound form={spender} name="naechste_wartung" />
          <Bound form={spender} name="bemerkungen_spender" rows={3} />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => spender.validate(['seriennummer', 'status'])}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      {/* Schritt 4: Zusammenfassung & Absenden */}
      <WizardStep label={tx('Prüfen & Anlegen')}>
        {!submit.done && (
          <SummaryStep
            forms={[spender]}
            submit={submit}
            items={[
              {
                key: '_hotel',
                label: tx('Hotel'),
                value: hotels.labelOf(hotelId ?? '') ?? '—',
              },
            ]}
            whatHappensNext={tx('Der Seifenspender wird sofort im System erfasst und erscheint in der Übersicht des Standorts.')}
          />
        )}
      </WizardStep>

      {/* Erfolg */}
      {submit.result && (
        <SuccessStep
          result={submit.result}
          forms={[spender]}
          submit={submit}
          restartLabel={tx('Weiteren Spender aufnehmen')}
          next={[
            {
              label: tx('Wartung erfassen'),
              href: '#/intents/wartung-erfassen',
            },
            {
              label: tx('Zum Dashboard'),
              href: '#/',
            },
          ]}
          whatHappensNext={tx('Nutze „Wartung erfassen", um Nachfüllungen und Inspektionen zu protokollieren.')}
        />
      )}
    </IntentWizardShell>
  );
}
