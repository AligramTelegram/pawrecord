import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Pet } from '../db/pets';
import { Vaccine } from '../db/vaccines';
import { Medication } from '../db/medications';
import { WeightLog } from '../db/weights';
import { VetVisit } from '../db/visits';
import i18n from '../i18n';
import { formatDate } from '../utils/dates';

interface PetReport {
  pet: Pet;
  vaccines: Vaccine[];
  medications: Medication[];
  weights: WeightLog[];
  visits: VetVisit[];
}

function t(key: string): string {
  return i18n.t(key as any) as string;
}

function localDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  return formatDate(dateStr, i18n.language);
}

export async function generatePetPDF(report: PetReport): Promise<void> {
  const { pet, vaccines, medications, weights, visits } = report;
  const lang = i18n.language;

  const labels = {
    species: t('pets:species.' + pet.species),
    vaccines: t('pet_detail.vaccines_stat'),
    medications: t('pet_detail.meds_stat'),
    visits: t('pet_detail.visits_stat'),
    weight: t('health_screen.weight'),
    generated: lang === 'tr' ? 'Oluşturulma tarihi' : lang === 'de' ? 'Erstellt am' : lang === 'fr' ? 'Généré le' : lang === 'es' ? 'Generado el' : lang === 'it' ? 'Generato il' : lang === 'pt' ? 'Gerado em' : lang === 'ja' ? '作成日' : lang === 'ko' ? '작성일' : lang === 'nl' ? 'Aangemaakt op' : lang === 'sv' ? 'Skapad' : lang === 'zh' ? '生成日期' : 'Generated',
    noRecords: lang === 'tr' ? 'Kayıt yok' : lang === 'de' ? 'Keine Einträge' : lang === 'fr' ? 'Aucun enregistrement' : lang === 'es' ? 'Sin registros' : lang === 'it' ? 'Nessun record' : lang === 'pt' ? 'Sem registros' : lang === 'ja' ? '記録なし' : lang === 'ko' ? '기록 없음' : lang === 'nl' ? 'Geen records' : lang === 'sv' ? 'Inga poster' : lang === 'zh' ? '无记录' : 'No records',
    vaccine: t('health_screen.vaccine'),
    dateGiven: t('health:vaccine.fields.date_given'),
    nextDue: t('health:vaccine.fields.next_due'),
    vet: lang === 'tr' ? 'Veteriner' : lang === 'de' ? 'Tierarzt' : lang === 'fr' ? 'Vétérinaire' : lang === 'es' ? 'Veterinario' : lang === 'it' ? 'Veterinario' : lang === 'pt' ? 'Veterinário' : lang === 'ja' ? '獣医' : lang === 'ko' ? '수의사' : lang === 'nl' ? 'Dierenarts' : lang === 'sv' ? 'Veterinär' : lang === 'zh' ? '兽医' : 'Vet',
    medication: t('health_screen.medication'),
    dosage: lang === 'tr' ? 'Doz' : lang === 'de' ? 'Dosis' : lang === 'fr' ? 'Dose' : lang === 'es' ? 'Dosis' : lang === 'it' ? 'Dose' : lang === 'pt' ? 'Dose' : lang === 'ja' ? '用量' : lang === 'ko' ? '용량' : lang === 'nl' ? 'Dosering' : lang === 'sv' ? 'Dos' : lang === 'zh' ? '剂量' : 'Dosage',
    frequency: lang === 'tr' ? 'Sıklık' : lang === 'de' ? 'Häufigkeit' : lang === 'fr' ? 'Fréquence' : lang === 'es' ? 'Frecuencia' : lang === 'it' ? 'Frequenza' : lang === 'pt' ? 'Frequência' : lang === 'ja' ? '頻度' : lang === 'ko' ? '빈도' : lang === 'nl' ? 'Frequentie' : lang === 'sv' ? 'Frekvens' : lang === 'zh' ? '频率' : 'Frequency',
    start: lang === 'tr' ? 'Başlangıç' : lang === 'de' ? 'Start' : lang === 'fr' ? 'Début' : lang === 'es' ? 'Inicio' : lang === 'it' ? 'Inizio' : lang === 'pt' ? 'Início' : lang === 'ja' ? '開始日' : lang === 'ko' ? '시작일' : lang === 'nl' ? 'Start' : lang === 'sv' ? 'Start' : lang === 'zh' ? '开始' : 'Start',
    date: lang === 'tr' ? 'Tarih' : lang === 'de' ? 'Datum' : lang === 'fr' ? 'Date' : lang === 'es' ? 'Fecha' : lang === 'it' ? 'Data' : lang === 'pt' ? 'Data' : lang === 'ja' ? '日付' : lang === 'ko' ? '날짜' : lang === 'nl' ? 'Datum' : lang === 'sv' ? 'Datum' : lang === 'zh' ? '日期' : 'Date',
    reason: lang === 'tr' ? 'Sebep' : lang === 'de' ? 'Grund' : lang === 'fr' ? 'Motif' : lang === 'es' ? 'Motivo' : lang === 'it' ? 'Motivo' : lang === 'pt' ? 'Motivo' : lang === 'ja' ? '理由' : lang === 'ko' ? '이유' : lang === 'nl' ? 'Reden' : lang === 'sv' ? 'Anledning' : lang === 'zh' ? '原因' : 'Reason',
    diagnosis: lang === 'tr' ? 'Tanı' : lang === 'de' ? 'Diagnose' : lang === 'fr' ? 'Diagnostic' : lang === 'es' ? 'Diagnóstico' : lang === 'it' ? 'Diagnosi' : lang === 'pt' ? 'Diagnóstico' : lang === 'ja' ? '診断' : lang === 'ko' ? '진단' : lang === 'nl' ? 'Diagnose' : lang === 'sv' ? 'Diagnos' : lang === 'zh' ? '诊断' : 'Diagnosis',
  };

  const html = `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, 'Hiragino Kaku Gothic Pro', 'Malgun Gothic', Arial, sans-serif; color: #1A1815; background: #fff; padding: 40px; }
        h1 { color: #5B6EF5; font-size: 28px; margin-bottom: 4px; }
        h2 { color: #5B6EF5; font-size: 18px; border-bottom: 2px solid #EBEBF5; padding-bottom: 6px; margin-top: 32px; }
        .meta { color: #5C5750; font-size: 13px; margin-bottom: 24px; }
        .badge { display: inline-block; background: #EEF0FF; color: #5B6EF5; border-radius: 8px; padding: 3px 10px; font-size: 12px; font-weight: 600; margin-right: 6px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }
        th { background: #EEF0FF; color: #5B6EF5; text-align: left; padding: 8px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 8px 12px; border-bottom: 1px solid #EBEBF5; }
        .empty { color: #9297C4; font-style: italic; font-size: 13px; padding: 12px 0; }
        .footer { margin-top: 48px; color: #9297C4; font-size: 11px; text-align: center; border-top: 1px solid #EBEBF5; padding-top: 16px; }
        .header-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .logo { font-size: 32px; }
      </style>
    </head>
    <body>
      <div class="header-row">
        <span class="logo">🐾</span>
        <h1>${pet.name}</h1>
      </div>
      <div class="meta">
        <span class="badge">${labels.species}</span>
        ${pet.breed ? `<span class="badge">${pet.breed}</span>` : ''}
        ${pet.date_of_birth ? `<span class="badge">🎂 ${localDate(pet.date_of_birth)}</span>` : ''}
        ${pet.microchip_id ? `<span class="badge">🔢 ${pet.microchip_id}</span>` : ''}
        <br><br>${labels.generated}: ${localDate(new Date().toISOString().split('T')[0])}
      </div>

      <h2>💉 ${labels.vaccines}</h2>
      ${vaccines.length === 0 ? `<p class="empty">${labels.noRecords}</p>` : `
      <table>
        <tr><th>${labels.vaccine}</th><th>${labels.dateGiven}</th><th>${labels.nextDue}</th><th>${labels.vet}</th></tr>
        ${vaccines.map(v => `<tr><td>${v.name}</td><td>${localDate(v.date_given)}</td><td>${localDate(v.next_due)}</td><td>${v.vet_name ?? '—'}</td></tr>`).join('')}
      </table>`}

      <h2>💊 ${labels.medications}</h2>
      ${medications.length === 0 ? `<p class="empty">${labels.noRecords}</p>` : `
      <table>
        <tr><th>${labels.medication}</th><th>${labels.dosage}</th><th>${labels.frequency}</th><th>${labels.start}</th></tr>
        ${medications.map(m => `<tr><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency}</td><td>${localDate(m.start_date)}</td></tr>`).join('')}
      </table>`}

      <h2>⚖️ ${labels.weight}</h2>
      ${weights.length === 0 ? `<p class="empty">${labels.noRecords}</p>` : `
      <table>
        <tr><th>${labels.date}</th><th>kg</th></tr>
        ${weights.slice(0, 20).map(w => `<tr><td>${localDate(w.date)}</td><td>${w.weight_kg}</td></tr>`).join('')}
      </table>`}

      <h2>🏥 ${labels.visits}</h2>
      ${visits.length === 0 ? `<p class="empty">${labels.noRecords}</p>` : `
      <table>
        <tr><th>${labels.date}</th><th>${labels.reason}</th><th>${labels.vet}</th><th>${labels.diagnosis}</th></tr>
        ${visits.map(v => `<tr><td>${localDate(v.date)}</td><td>${v.reason}</td><td>${v.vet_name ?? '—'}</td><td>${v.diagnosis ?? '—'}</td></tr>`).join('')}
      </table>`}

      <div class="footer">PawRecord · ${new Date().getFullYear()}</div>
    </body>
    </html>
  `;

  const safeName = pet.name.replace(/[^a-zA-Z0-9À-ɏ一-鿿가-힣]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 7);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: `${pet.name} - PawRecord`,
  });
}
