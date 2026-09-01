import { FormSubmission, User, ProgramNodeInfo, AIInsight } from '../types';
import { COMPANY_INFO } from '../services/store';
import { GoogleWorkspaceService } from '../services/googleWorkspace';

export class PDFGenerator {
  /**
   * Generates and triggers printable PDF view for a completed Form Submission with Ontological Diagnostics
   */
  static generateFormSubmissionPDF(
    form: FormSubmission,
    client: User,
    node: ProgramNodeInfo,
    insight?: AIInsight
  ): void {
    const fileName = `Registro_Ontologico_Sesion_${node.step}_${client.name.replace(/\s+/g, '_')}.pdf`;
    
    // Automatically register and sync with Google Drive
    try {
      GoogleWorkspaceService.savePDFReportToDrive(fileName, 'Registro Ontológico Oficial', client, {
        sessionStep: node.step,
        summary: insight?.emotionalWisdom || client.primaryBreakdown,
      });
    } catch {
      // ignore
    }

    const formattedDate = new Date(form.submittedAt).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Registro Ontológico - Sesión ${node.step} - ${client.name}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            line-height: 1.6;
            margin: 0;
            padding: 24px;
          }
          .header {
            border-bottom: 2px solid #111827;
            padding-bottom: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .brand-title {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0 0 4px 0;
            color: #000000;
          }
          .brand-subtitle {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #6b7280;
            margin: 0;
          }
          .meta-box {
            text-align: right;
            font-size: 11px;
            color: #4b5563;
          }
          .document-badge {
            display: inline-block;
            background: #000000;
            color: #ffffff;
            font-size: 10px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
          }
          .section-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
          }
          .field-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
            font-weight: 600;
            margin-bottom: 2px;
          }
          .field-val {
            font-size: 13px;
            color: #111827;
            font-weight: 500;
          }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 18px;
            page-break-inside: avoid;
          }
          .card-title {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #000000;
            margin: 0 0 10px 0;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 8px;
          }
          .card-content {
            font-size: 13px;
            color: #374151;
            white-space: pre-wrap;
            line-height: 1.7;
          }
          .highlight-card {
            background: #0f172a;
            color: #f8fafc;
            border: none;
          }
          .highlight-card .card-title {
            color: #ffffff;
            border-bottom-color: #334155;
          }
          .highlight-card .card-content {
            color: #e2e8f0;
          }
          .list-item {
            position: relative;
            padding-left: 16px;
            margin-bottom: 6px;
            font-size: 12px;
          }
          .list-item::before {
            content: "•";
            position: absolute;
            left: 0;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #9ca3af;
          }
          .signature-box {
            text-align: right;
          }
          .signature-line {
            width: 180px;
            border-top: 1px solid #111827;
            margin-bottom: 4px;
            margin-left: auto;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background: #1e293b; color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <span>Documento Oficial de Registro Ontológico listo para imprimir o guardar como PDF.</span>
          <button onclick="window.print()" style="background: white; color: black; border: none; font-weight: 600; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="document-badge">Expediente Ontológico Oficial</div>
            <h1 class="brand-title">${COMPANY_INFO.fullName}</h1>
            <p class="brand-subtitle">Metodología de Transformación & Coherencia Ontológica</p>
          </div>
          <div class="meta-box">
            <div><strong>Registro:</strong> #${form.id.slice(-6).toUpperCase()}</div>
            <div><strong>Fecha:</strong> ${formattedDate}</div>
            <div><strong>Sede:</strong> ${COMPANY_INFO.city}</div>
          </div>
        </div>

        <div class="section-grid">
          <div>
            <div class="field-label">Cliente Evaluado</div>
            <div class="field-val">${client.name}</div>
          </div>
          <div>
            <div class="field-label">Nivel & Sesión</div>
            <div class="field-val">${node.level} • Sesión ${node.step} (${node.weekLabel})</div>
          </div>
          <div>
            <div class="field-label">Eje Temático</div>
            <div class="field-val">${node.sessionTitle}</div>
          </div>
          <div>
            <div class="field-label">Programa</div>
            <div class="field-val">${client.programName || 'Certeza, Fronteras & Dirección Personal'}</div>
          </div>
        </div>

        <!-- Section 1: Somatic Bodily Emotion -->
        <div class="card">
          <h3 class="card-title">1. Mapeo Somático & Disposición Corporal</h3>
          <div class="field-label" style="margin-bottom: 6px;">Emoción y registro sensorial en el cuerpo:</div>
          <div class="card-content">${escapeHTML(form.bodyEmotion)}</div>
        </div>

        <!-- Section 2: Level Specific Eje -->
        ${
          form.levelSpecificAnswer
            ? `
          <div class="card">
            <h3 class="card-title">2. Respuesta al Eje de Indagación (${node.level})</h3>
            <div class="field-label" style="margin-bottom: 6px;">${escapeHTML(node.keyQuestion)}:</div>
            <div class="card-content">${escapeHTML(form.levelSpecificAnswer)}</div>
          </div>
        `
            : ''
        }

        <!-- Section 3: Reflexiones y Quiebres -->
        <div class="card">
          <h3 class="card-title">3. Quiebres, Juicios y Acuerdos Ontológicos</h3>
          <div class="field-label" style="margin-bottom: 6px;">Reflexión de fondo del coachee:</div>
          <div class="card-content">${escapeHTML(form.reflections)}</div>
        </div>

        <!-- Section 4: Ontological Synthesis / AI Insight if available -->
        ${
          insight
            ? `
          <div class="card highlight-card">
            <h3 class="card-title">4. Síntesis de Coherencia & Eco Ontológico</h3>
            <p class="card-content" style="margin-bottom: 12px;">${escapeHTML(insight.emotionalWisdom)}</p>
            
            ${
              insight.limitingBeliefs && insight.limitingBeliefs.length > 0
                ? `
              <div style="margin-top: 14px; border-top: 1px solid #334155; padding-top: 10px;">
                <div class="field-label" style="color: #94a3b8; margin-bottom: 6px;">Creencias Límite & Mandatos Inconscientes Detectados:</div>
                ${insight.limitingBeliefs.map((b) => `<div class="list-item">${escapeHTML(b)}</div>`).join('')}
              </div>
            `
                : ''
            }
          </div>
        `
            : ''
        }

        <!-- Footer -->
        <div class="footer">
          <div>
            <div>${COMPANY_INFO.fullName} • ${COMPANY_INFO.formattedPhone}</div>
            <div>Documento confidencial bajo estándares éticos de Consultoría y Coaching Ontológico.</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>John Fredy Rengifo Basto</div>
            <div style="font-size: 10px; color: #6b7280;">Master Coach & Consultor Ontológico</div>
          </div>
        </div>
      </body>
      </html>
    `;

    openPrintWindow(htmlContent, `Registro_Ontologico_Sesion_${node.step}_${client.name.replace(/\s+/g, '_')}.pdf`);
  }

  /**
   * Generates and triggers printable PDF view for Level Practical Workbook / Guía de Trabajo
   */
  static generateLevelWorkbookPDF(node: ProgramNodeInfo, client?: User): void {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Cuaderno de Trabajo - ${node.level} - ${node.sessionTitle}</title>
        <style>
          @page {
            size: A4;
            margin: 18mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            line-height: 1.6;
            margin: 0;
            padding: 24px;
          }
          .header {
            border-bottom: 2px solid #000;
            padding-bottom: 16px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .brand-title {
            font-size: 18px;
            font-weight: 700;
            margin: 0 0 2px 0;
          }
          .level-pill {
            display: inline-block;
            background: #111827;
            color: #fff;
            font-size: 10px;
            font-weight: 600;
            padding: 3px 10px;
            border-radius: 999px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
          }
          .hero-title {
            font-size: 22px;
            font-weight: 700;
            color: #000;
            margin: 0 0 6px 0;
            line-height: 1.25;
          }
          .objective-banner {
            background: #f3f4f6;
            border-left: 4px solid #111827;
            padding: 14px 18px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 20px;
            font-size: 13px;
            color: #374151;
          }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          .card-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #111827;
            margin: 0 0 10px 0;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 6px;
          }
          .domain-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }
          .domain-col {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px;
            font-size: 12px;
          }
          .domain-header {
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 6px;
            color: #000;
          }
          .exercise-box {
            border: 1px dashed #9ca3af;
            border-radius: 8px;
            min-height: 90px;
            margin-top: 10px;
            padding: 10px;
            background: #fafafa;
          }
          .bullet-point {
            position: relative;
            padding-left: 14px;
            margin-bottom: 6px;
            font-size: 12px;
            color: #374151;
          }
          .bullet-point::before {
            content: "▪";
            position: absolute;
            left: 0;
            color: #111827;
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            padding-top: 14px;
            font-size: 10px;
            color: #6b7280;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="level-pill">${node.level}: ${node.levelTitle}</div>
            <h1 class="brand-title">${COMPANY_INFO.fullName}</h1>
          </div>
          <div style="text-align: right; font-size: 11px; color: #4b5563;">
            <div><strong>Cuaderno de Trabajo:</strong> Sesión ${node.step} (${node.weekLabel})</div>
            ${client ? `<div><strong>Para:</strong> ${client.name}</div>` : ''}
          </div>
        </div>

        <h2 class="hero-title">${node.sessionTitle}</h2>
        <div class="objective-banner">
          <strong>Propósito de Transformación:</strong><br>
          ${node.objective}
        </div>

        <!-- Capacidades Tangibles -->
        <div class="card">
          <div class="card-title">Capacidades & Resultados Tangibles a Conquistar</div>
          ${node.tangibleOutcomes.map((out) => `<div class="bullet-point">${escapeHTML(out)}</div>`).join('')}
        </div>

        <!-- Metodología de los 3 Dominios Ontológicos -->
        <div class="card">
          <div class="card-title">Metodología de Trabajo en los 3 Dominios Ontológicos</div>
          <div class="domain-grid">
            <div class="domain-col">
              <div class="domain-header">🗣️ Dominio Lingüístico</div>
              <p style="margin: 0; color: #4b5563;">${escapeHTML(node.methodology.linguistic)}</p>
            </div>
            <div class="domain-col">
              <div class="domain-header">🫀 Dominio Corporal</div>
              <p style="margin: 0; color: #4b5563;">${escapeHTML(node.methodology.somatic)}</p>
            </div>
            <div class="domain-col">
              <div class="domain-header">🌊 Dominio Emocional</div>
              <p style="margin: 0; color: #4b5563;">${escapeHTML(node.methodology.emotional)}</p>
            </div>
          </div>
        </div>

        <!-- Micro-Práctica Diaria -->
        <div class="card">
          <div class="card-title">Micro-Práctica de Anclaje Diario (${node.dailyMicroPractice.frequency})</div>
          <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 4px;">
            ${escapeHTML(node.dailyMicroPractice.title)}
          </div>
          <p style="font-size: 12px; color: #4b5563; margin: 0 0 10px 0;">
            ${escapeHTML(node.dailyMicroPractice.description)}
          </p>
          <div style="font-size: 11px; font-weight: 600; color: #374151; margin-top: 12px;">
            Espacio de Bitácora / Registro de Hallazgos Diarios:
          </div>
          <div class="exercise-box"></div>
        </div>

        <!-- Eje de Indagación Clave -->
        <div class="card">
          <div class="card-title">Pregunta Central de Indagación Ontológica</div>
          <p style="font-size: 13px; font-weight: 600; color: #111827; margin: 0 0 4px 0;">
            "${escapeHTML(node.keyQuestion)}"
          </p>
          <p style="font-size: 11px; color: #6b7280; margin: 0 0 10px 0;">
            ${escapeHTML(node.levelPrompt)}
          </p>
          <div class="exercise-box" style="min-height: 110px;"></div>
        </div>

        <div class="footer">
          <div>${COMPANY_INFO.fullName} • Material de Trabajo Personal & Confidencial</div>
          <div>Página 1 de 1 • Consultoría Ontológica 1 a 1</div>
        </div>
      </body>
      </html>
    `;

    openPrintWindow(htmlContent, `Guia_Trabajo_${node.level.replace(/\s+/g, '_')}_Sesion_${node.step}.pdf`);
  }

  /**
   * Generates and triggers printable PDF view for Personalized Level Reinforcement Pack
   */
  static generateReinforcementPackPDF(node: ProgramNodeInfo, client?: User): void {
    const pack = node.reinforcementPack;
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Ficha de Refuerzo Personalizada - ${node.level}</title>
        <style>
          @page {
            size: A4;
            margin: 18mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            line-height: 1.6;
            margin: 0;
            padding: 24px;
          }
          .header {
            border-bottom: 2px solid #000;
            padding-bottom: 14px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .badge {
            background: #000;
            color: #fff;
            font-size: 10px;
            padding: 3px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
          }
          .title {
            font-size: 20px;
            font-weight: 700;
            margin: 6px 0 2px 0;
          }
          .subtitle {
            font-size: 12px;
            color: #6b7280;
            margin: 0 0 16px 0;
          }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 16px;
          }
          .card-header {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #000;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 6px;
            margin-bottom: 10px;
          }
          .protocol-box {
            background: #f8fafc;
            border-left: 3px solid #0284c7;
            padding: 12px 16px;
            border-radius: 0 8px 8px 0;
            font-size: 12px;
            color: #334151;
            line-height: 1.6;
          }
          .audio-script-box {
            background: #0f172a;
            color: #f1f5f9;
            padding: 14px 18px;
            border-radius: 8px;
            font-size: 12px;
            line-height: 1.6;
          }
          .bullet {
            position: relative;
            padding-left: 16px;
            margin-bottom: 6px;
            font-size: 12px;
            color: #374151;
          }
          .bullet::before {
            content: "✦";
            position: absolute;
            left: 0;
            color: #000;
            font-size: 10px;
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            font-size: 10px;
            color: #9ca3af;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <span class="badge">Archivo de Refuerzo Personalizado</span>
            <div style="font-size: 12px; color: #4b5563; margin-top: 4px;">${COMPANY_INFO.fullName}</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #4b5563;">
            <div><strong>Nivel:</strong> ${node.level} (${node.weekLabel})</div>
            ${client ? `<div><strong>Cliente:</strong> ${client.name}</div>` : ''}
          </div>
        </div>

        <h1 class="title">${pack.title}</h1>
        <p class="subtitle">${pack.subtitle}</p>

        <!-- Síntesis de Refuerzo -->
        <div class="card">
          <div class="card-header">1. Síntesis Ontológica de Refuerzo</div>
          <p style="font-size: 12px; color: #374151; margin: 0; line-height: 1.7;">
            ${escapeHTML(pack.summary)}
          </p>
        </div>

        <!-- Protocolo de Auto-asistencia y Emergencia Emocional -->
        <div class="card">
          <div class="card-header">2. Protocolo de Auto-asistencia y Emergencia ante Quiebres</div>
          <div class="protocol-box">
            ${escapeHTML(pack.selfCareProtocol)}
          </div>
        </div>

        <!-- Prácticas Clave -->
        <div class="card">
          <div class="card-header">3. Prácticas Clave de Consolidación</div>
          ${pack.keyPractices.map((prac) => `<div class="bullet">${escapeHTML(prac)}</div>`).join('')}
        </div>

        <!-- Audio-Guía Somática Script -->
        <div class="card" style="border: none; padding: 0;">
          <div class="audio-script-box">
            <div style="font-weight: 700; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; color: #38bdf8;">
              🎙️ Audio-Guía de Centramiento (${pack.audioDuration}): ${escapeHTML(pack.audioGuideTitle)}
            </div>
            <p style="margin: 0; font-size: 12px; color: #cbd5e1; font-style: italic; line-height: 1.6;">
              "${escapeHTML(pack.audioScript)}"
            </p>
          </div>
        </div>

        <!-- Preguntas de Profundización -->
        <div class="card" style="margin-top: 16px;">
          <div class="card-header">4. Preguntas de Profundización e Indagación</div>
          ${pack.reflectiveQuestions
            .map((q) => `<div class="bullet" style="font-style: italic; color: #1e293b;">"${escapeHTML(q)}"</div>`)
            .join('')}
        </div>

        <div class="footer">
          <div>${COMPANY_INFO.fullName} • Refuerzo Ontológico Personalizado</div>
          <div>Cerrar y anclar el aprendizaje con impecabilidad</div>
        </div>
      </body>
      </html>
    `;

    openPrintWindow(htmlContent, `Refuerzo_${node.level.replace(/\s+/g, '_')}_Sesion_${node.step}.pdf`);
  }
}

function escapeHTML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function openPrintWindow(html: string, title: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // Fallback if pop-up blocked: download as formatted HTML report
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title.endsWith('.html') ? title : title.replace(/\.pdf$/, '.html');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
