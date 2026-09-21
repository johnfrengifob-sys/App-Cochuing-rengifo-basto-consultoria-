import { FormSubmission, User, ProgramNodeInfo, AIInsight, PostSessionForm, Session } from '../types';
import { COMPANY_INFO, OntologicalStore } from '../services/store';
import { GoogleWorkspaceService } from '../services/googleWorkspace';
import { jsPDF } from 'jspdf';

export function downloadPDF(doc: jsPDF, fileName: string): void {
  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  try {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanFileName;
    link.target = '_self';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 2000);
  } catch (err) {
    console.warn('downloadPDF blob anchor failed, falling back to doc.save:', err);
    try {
      doc.save(cleanFileName);
    } catch (saveErr) {
      console.error('doc.save failed:', saveErr);
      const dataUri = doc.output('datauristring');
      window.open(dataUri, '_blank');
    }
  }
}

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
        summary: insight?.emotionalWisdom || client?.primaryBreakdown || 'Registro ontológico',
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
            ${node.keyQuestion ? `<div class="field-label" style="margin-bottom: 6px;">${escapeHTML(node.keyQuestion)}:</div>` : ''}
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
   * Embeds the participant's filled questionnaire responses if available
   */
  static generateLevelWorkbookPDF(
    node: ProgramNodeInfo,
    client?: User,
    customForm?: FormSubmission
  ): void {
    const form = customForm || (client ? OntologicalStore.getFormForStep(client.uid, node.step) : undefined);
    const clientName = client?.name || (form?.clientId ? 'Participante' : '');
    const isCompletedByParticipant = !!form;

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
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-top: 2px;">
              Cuaderno de Trabajo del Taller
            </div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #4b5563;">
            <div><strong>Taller / Sesión:</strong> ${node.step} (${node.weekLabel})</div>
            ${clientName ? `<div><strong>Participante:</strong> ${escapeHTML(clientName)}</div>` : ''}
            <div style="margin-top: 4px;">
              <span style="display: inline-block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 2px 8px; border-radius: 9999px; ${isCompletedByParticipant ? 'background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;' : 'background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb;'}">
                ${isCompletedByParticipant ? '✓ Cuestionario Integrado en este Cuaderno' : 'Plantilla de Trabajo'}
              </span>
            </div>
          </div>
        </div>

        <h2 class="hero-title">${node.sessionTitle}</h2>
        <div class="objective-banner">
          <strong>Propósito de Transformación del Taller:</strong><br>
          ${node.objective}
        </div>

        ${isCompletedByParticipant && form ? `
        <!-- SECCIÓN: RESPUESTAS DEL CUESTIONARIO CONSTRUIDO POR EL PARTICIPANTE -->
        <div class="card" style="border: 2px solid #059669; background: #f0fdf4; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #a7f3d0; padding-bottom: 8px; margin-bottom: 12px;">
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #065f46; letter-spacing: 0.5px;">
              ✍️ Cuaderno de Trabajo Construido a Partir de tu Cuestionario
            </div>
            <div style="font-size: 10px; color: #047857; font-weight: 600;">
              Completado el ${new Date(form.submittedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; margin-bottom: 4px;">
              1. Emoción & Manifestación Somática en el Cuerpo:
            </div>
            <p style="margin: 0; font-size: 12px; color: #111827; background: #ffffff; padding: 10px 12px; border-radius: 6px; border: 1px solid #d1fae5; line-height: 1.5;">
              ${escapeHTML(form.bodyEmotion)}
            </p>
          </div>

          ${form.levelSpecificAnswer ? `
          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; margin-bottom: 4px;">
              2. Respuesta al Eje Central de Indagación${node.keyQuestion ? ` ("${escapeHTML(node.keyQuestion)}")` : ''}:
            </div>
            <p style="margin: 0; font-size: 12px; color: #111827; background: #ffffff; padding: 10px 12px; border-radius: 6px; border: 1px solid #d1fae5; line-height: 1.5;">
              ${escapeHTML(form.levelSpecificAnswer)}
            </p>
          </div>
          ` : ''}

          <div>
            <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; margin-bottom: 4px;">
              3. Reflexiones Ontológicas, Quiebres & Acuerdos de Acción:
            </div>
            <p style="margin: 0; font-size: 12px; color: #111827; background: #ffffff; padding: 10px 12px; border-radius: 6px; border: 1px solid #d1fae5; line-height: 1.5;">
              ${escapeHTML(form.reflections)}
            </p>
          </div>
        </div>
        ` : ''}

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
          <div class="exercise-box" style="min-height: 60px;">
            ${form?.bodyEmotion ? `<div style="font-size: 10px; color: #059669; font-weight: bold; text-transform: uppercase; margin-bottom: 2px;">Tu Sensación Somática Inicial:</div><div style="font-size: 11px; color: #374151;">${escapeHTML(form.bodyEmotion)}</div>` : ''}
          </div>
        </div>

        <!-- Eje de Indagación Clave -->
        ${node.keyQuestion ? `
        <div class="card">
          <div class="card-title">Pregunta Central de Indagación Ontológica</div>
          <p style="font-size: 13px; font-weight: 600; color: #111827; margin: 0 0 4px 0;">
            "${escapeHTML(node.keyQuestion)}"
          </p>
          <p style="font-size: 11px; color: #6b7280; margin: 0 0 10px 0;">
            ${escapeHTML(node.levelPrompt)}
          </p>
          <div class="exercise-box" style="min-height: 80px;">
            ${form?.levelSpecificAnswer ? `
              <div style="font-size: 10px; color: #059669; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Tu Respuesta en el Cuestionario:</div>
              <div style="font-size: 12px; color: #111827; font-weight: 500;">${escapeHTML(form.levelSpecificAnswer)}</div>
            ` : `
              <div style="color: #9ca3af; font-size: 11px; font-style: italic;">
                Espacio para tus reflexiones escritas o diligenciamiento en el Cuestionario del Taller en la plataforma.
              </div>
            `}
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <div>${COMPANY_INFO.fullName} • Material de Trabajo Personal & Confidencial</div>
          <div>${node.level} • Taller & Consultoría Ontológica 1 a 1</div>
        </div>
      </body>
      </html>
    `;

    openPrintWindow(htmlContent, `Cuaderno_Taller_${node.level.replace(/\s+/g, '_')}_Sesion_${node.step}.pdf`);
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

  /**
   * Generates and triggers real PDF download for Session Practical Workbook (Cuaderno de Trabajo / Bitácora)
   * using jsPDF directly to guarantee real .pdf format delivery.
   */
  static generateSessionWorkbookPDF(
    form?: Partial<PostSessionForm> | null,
    client?: User,
    session?: Session
  ): void {
    const sessionNumber = form?.sessionNumber || session?.sessionNumber || client?.programProgress || 1;
    const clientName = client?.name || form?.clientName || 'Participante';
    const fileName = `Bitacora_Sesion_${sessionNumber}_${clientName.replace(/\s+/g, '_')}.pdf`;

    // Sync with Google Drive if available
    try {
      if (client) {
        GoogleWorkspaceService.savePDFReportToDrive(fileName, 'Cuaderno de Trabajo Ontológico', client, {
          sessionStep: sessionNumber,
          summary: form?.workbookTitle || form?.masterJudgmentAndNarrative || form?.emergentTopic || 'Bitácora Ontológica 1 a 1',
        });
      }
    } catch {
      // ignore
    }

    const rawDate = form?.sessionDate || form?.submittedAt || session?.date || new Date().toISOString();
    let formattedDate = '';
    try {
      formattedDate = new Date(rawDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      formattedDate = 'Fecha Registrada';
    }

    const cycleNumber = form?.cycleNumber || Math.ceil(sessionNumber / 4);
    const isMilestone = Boolean(form?.isCycleMilestone || sessionNumber % 4 === 0);
    const phaseLabel = isMilestone ? 'Consolidación & Cierre' : 'Exploración Libre';

    const emergentTopic =
      form?.emergentTopic ||
      form?.masterJudgmentAndNarrative ||
      session?.notes ||
      'Espacio de indagación libre, presencia y quiebres ontológicos.';
    const actionStep =
      form?.actionStep ||
      (Array.isArray(form?.agreedActionItems) && form.agreedActionItems[0]) ||
      session?.actionAgreements?.[0] ||
      'Sostener presencia y pausa reflexiva en la cotidianidad.';
    const coacheeDeclaration = form?.coacheeKeyDeclaration || '';
    const cycleHarvest =
      form?.cycleHarvest ||
      (isMilestone
        ? form?.perspectiveShiftEvidence || 'Consolidación de nuevos patrones de consciencia y cambio de observador.'
        : '');
    const icfReflexion = form?.directivenessAndIcfCompetency || '';
    const somaticHomework = form?.somaticHomework || session?.somaticFocus || '';

    const actionItems =
      Array.isArray(form?.agreedActionItems) && form.agreedActionItems.length > 0
        ? form.agreedActionItems
        : session?.actionAgreements && session.actionAgreements.length > 0
        ? session.actionAgreements
        : [
            'Sostener la presencia reflexiva ante situaciones de sobrecarga o exigencia.',
            'Registrar quiebres emocionales en la bitácora somática quincenal.',
            'Diseñar conversaciones asertivas y claras con el equipo o entorno de trabajo.',
          ];

    // Create jsPDF document (A4, portrait, mm)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = margin;

    const checkPageBreak = (neededHeight: number) => {
      if (cursorY + neededHeight > pageHeight - margin - 15) {
        doc.addPage();
        cursorY = margin + 12;
        drawRunningHeader();
      }
    };

    const drawRunningHeader = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('RENGIFO BASTO CONSULTORÍA', margin, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Consultoría Ontológica & Escuela de Liderazgo Consciente', margin, cursorY + 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('Master Coach: John Fredy Rengifo Basto', pageWidth - margin, cursorY, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Estándares y Competencias Clave ICF', pageWidth - margin, cursorY + 4, { align: 'right' });

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(margin, cursorY + 7, pageWidth - margin, cursorY + 7);
      cursorY += 13;
    };

    // 1. Initial running header
    drawRunningHeader();

    // 2. Badges
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, cursorY, 68, 6.5, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`MEMORIA ONTOLÓGICA 1 A 1 • SESIÓN ${sessionNumber}`, margin + 34, cursorY + 4.3, { align: 'center' });

    doc.setFillColor(224, 231, 255);
    doc.roundedRect(margin + 72, cursorY, 64, 6.5, 3, 3, 'F');
    doc.setTextColor(55, 48, 163);
    doc.text(`CICLO ${cycleNumber} • ${phaseLabel.toUpperCase()}`, margin + 72 + 32, cursorY + 4.3, { align: 'center' });
    cursorY += 10;

    // 3. Hero Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    const titleText = form?.workbookTitle || `Sesión ${sessionNumber}: Encuentro Ontológico 1 a 1`;
    const splitTitle = doc.splitTextToSize(titleText, contentWidth);
    doc.text(splitTitle, margin, cursorY);
    cursorY += splitTitle.length * 5.5 + 2;

    // 4. Metadata Strip
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('COACHEE / PARTICIPANTE', margin + 4, cursorY + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const coacheeLabel = client?.title ? `${clientName} (${client.title})` : clientName;
    const splitCoachee = doc.splitTextToSize(coacheeLabel, 68);
    doc.text(splitCoachee[0] || clientName, margin + 4, cursorY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('FECHA DE LA SESIÓN', margin + 75, cursorY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(formattedDate, margin + 75, cursorY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('MODALIDAD', margin + 135, cursorY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('1 a 1 • Lienzo en Blanco', margin + 135, cursorY + 10);
    cursorY += 18;

    // Card drawing helper
    const drawCard = (
      cardTitle: string,
      subtitle?: string,
      body?: string,
      accentColor?: [number, number, number]
    ) => {
      if (!body) return;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      const splitCardTitle = doc.splitTextToSize(cardTitle, contentWidth - 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const splitSub = subtitle ? doc.splitTextToSize(subtitle, contentWidth - 10) : [];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const splitBody = doc.splitTextToSize(body, contentWidth - 10);

      const titleH = splitCardTitle.length * 4.5;
      const subH = subtitle ? splitSub.length * 4 + 2 : 0;
      const bodyH = splitBody.length * 4.2;
      const cardHeight = titleH + subH + bodyH + 11;

      checkPageBreak(cardHeight + 4);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(
        accentColor ? accentColor[0] : 226,
        accentColor ? accentColor[1] : 232,
        accentColor ? accentColor[2] : 240
      );
      doc.setLineWidth(accentColor ? 0.6 : 0.3);
      doc.roundedRect(margin, cursorY, contentWidth, cardHeight, 2, 2, 'FD');

      let innerY = cursorY + 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(splitCardTitle, margin + 4, innerY);
      innerY += titleH;

      if (subtitle) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(splitSub, margin + 4, innerY);
        innerY += subH;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(splitBody, margin + 4, innerY);

      cursorY += cardHeight + 4;
    };

    // Section 1: Tema emergente
    drawCard(
      '1. El Tema Emergente (Lienzo en Blanco)',
      'Pregunta de Apertura: "¿Qué es importante para ti traer a este espacio hoy?"',
      emergentTopic
    );

    // Section 2: Paso a la acción
    drawCard(
      '2. El Paso a la Acción & Descubrimiento',
      '¿Qué decidió hacer con lo que descubrió durante la sesión?',
      actionStep
    );

    // Declaración personal (si existe)
    if (coacheeDeclaration) {
      drawCard(
        'Declaración Central de Aprendizaje & Soberanía',
        undefined,
        `"${coacheeDeclaration}"`,
        [5, 150, 105]
      );
    }

    // Section 3: Cosecha del ciclo (si corresponde)
    if (cycleHarvest) {
      drawCard(
        `★ Cosecha del Ciclo ${cycleNumber} (Hito de Consolidación)`,
        'Grandes comprensiones y cambio en la forma de observar la realidad:',
        cycleHarvest,
        [15, 23, 42]
      );
    }

    // Section 4: Supervisión ICF (si existe)
    if (icfReflexion) {
      drawCard(
        '3. Supervisión y Presencia Ética del Facilitador (ICF)',
        '¿En qué momento de la sesión fui más directivo de lo necesario y qué competencia cuidar?',
        icfReflexion
      );
    }

    // Section 5: Acciones acordadas
    if (actionItems.length > 0) {
      const itemLines = actionItems.map((item) => `[  ]  ${item}`).join('\n\n');
      drawCard(
        '4. Cuaderno Práctico de Integración & Acciones Quincenales',
        'Compromisos concretos acordados para habitar entre sesiones:',
        itemLines
      );
    }

    // Somatic protocol (si existe)
    if (somaticHomework) {
      drawCard(
        'Protocolo Somático & Anclaje Corporal',
        'Práctica corporal diaria para sostener la nueva postura ontológica:',
        somaticHomework,
        [2, 132, 199]
      );
    }

    // Signatures
    checkPageBreak(32);
    cursorY += 6;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(margin, cursorY, margin + 70, cursorY);
    doc.line(pageWidth - margin - 70, cursorY, pageWidth - margin, cursorY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('John Fredy Rengifo Basto', margin + 35, cursorY + 4.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Master Coach Ontológico RBC • ICF', margin + 35, cursorY + 8.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(clientName, pageWidth - margin - 35, cursorY + 4.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Coachee • RBC Transformación', pageWidth - margin - 35, cursorY + 8.5, { align: 'center' });

    // Running Footers on every page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${i} de ${totalPages} • ${COMPANY_INFO.fullName} • Tel: ${COMPANY_INFO.formattedPhone} • ICF Code of Ethics`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }

    // Direct download of genuine .pdf
    downloadPDF(doc, fileName);
  }

  /**
   * Generates and triggers real PDF download for a completed Workshop Memory & Workbook
   * using jsPDF directly to guarantee real .pdf format delivery.
   */
  static generateWorkshopMemoryPDF(
    workshopTitle: string,
    client: User,
    details?: {
      workshopCategory?: string;
      completedAt?: string;
      keyBreakthrough?: string;
      commitments?: string;
      somaticPractice?: string;
      answers?: Record<string, string | number>;
    }
  ): void {
    const clientName = client?.name || 'Participante';
    const cleanTitle = workshopTitle.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Memoria_Taller_${cleanTitle}_${clientName.replace(/\s+/g, '_')}.pdf`;

    const formattedDate = new Date(details?.completedAt || Date.now()).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const category = details?.workshopCategory || 'Taller Ontológico Vivencial';
    const breakthrough =
      details?.keyBreakthrough ||
      'Deconstrucción de automatismos transparentes, reconocimiento del observador que soy y diseño de nuevas posibilidades de acción.';
    const commitments =
      details?.commitments ||
      'Sostener límites conscientes, practicar la pausa somática diaria de 90 segundos y habitar conversaciones de soberanía personal.';

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = margin;

    const checkPageBreak = (neededHeight: number) => {
      if (cursorY + neededHeight > pageHeight - margin - 15) {
        doc.addPage();
        cursorY = margin + 12;
        drawRunningHeader();
      }
    };

    const drawRunningHeader = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('RENGIFO BASTO CONSULTORÍA', margin, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Consultoría Ontológica & Escuela de Liderazgo Consciente', margin, cursorY + 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('Master Coach: John Fredy Rengifo Basto', pageWidth - margin, cursorY, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Acreditación y Estándares ICF', pageWidth - margin, cursorY + 4, { align: 'right' });

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(margin, cursorY + 7, pageWidth - margin, cursorY + 7);
      cursorY += 13;
    };

    drawRunningHeader();

    // Badges
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, cursorY, 68, 6.5, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('MEMORIA DE TALLER ONTOLÓGICO', margin + 34, cursorY + 4.3, { align: 'center' });

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin + 72, cursorY, 60, 6.5, 3, 3, 'F');
    doc.setTextColor(30, 41, 59);
    doc.text(category.toUpperCase(), margin + 72 + 30, cursorY + 4.3, { align: 'center' });
    cursorY += 10;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13.5);
    doc.setTextColor(15, 23, 42);
    const splitTitle = doc.splitTextToSize(workshopTitle, contentWidth);
    doc.text(splitTitle, margin, cursorY);
    cursorY += splitTitle.length * 5.5 + 2;

    // Metadata Strip
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('PARTICIPANTE', margin + 4, cursorY + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(clientName, margin + 4, cursorY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('FECHA DE COMPLETADO', margin + 75, cursorY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(formattedDate, margin + 75, cursorY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('MODALIDAD', margin + 135, cursorY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Taller Vivencial & Práctico', margin + 135, cursorY + 10);
    cursorY += 18;

    // Card drawing helper
    const drawCard = (cardTitle: string, subtitle?: string, body?: string) => {
      if (!body) return;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      const splitCardTitle = doc.splitTextToSize(cardTitle, contentWidth - 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const splitSub = subtitle ? doc.splitTextToSize(subtitle, contentWidth - 10) : [];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const splitBody = doc.splitTextToSize(body, contentWidth - 10);

      const titleH = splitCardTitle.length * 4.5;
      const subH = subtitle ? splitSub.length * 4 + 2 : 0;
      const bodyH = splitBody.length * 4.2;
      const cardHeight = titleH + subH + bodyH + 11;

      checkPageBreak(cardHeight + 4);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, cursorY, contentWidth, cardHeight, 2, 2, 'FD');

      let innerY = cursorY + 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(splitCardTitle, margin + 4, innerY);
      innerY += titleH;

      if (subtitle) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(splitSub, margin + 4, innerY);
        innerY += subH;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(splitBody, margin + 4, innerY);

      cursorY += cardHeight + 4;
    };

    drawCard('1. Quiebre Ontológico Central y Descubrimiento del Taller', undefined, breakthrough);
    drawCard('2. Compromisos Adquiridos & Declaraciones de Acción', undefined, commitments);

    if (details?.answers && Object.keys(details.answers).length > 0) {
      const answerLines = Object.entries(details.answers)
        .map(([k, v]) => `• ${k}:\n  ${v}`)
        .join('\n\n');
      drawCard('3. Respuestas y Registro del Cuaderno de Trabajo', undefined, answerLines);
    }

    if (details?.somaticPractice) {
      drawCard('4. Protocolo Somático & Anclaje Corporal', 'Práctica corporal diaria', details.somaticPractice);
    }

    // Signatures
    checkPageBreak(32);
    cursorY += 6;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(margin, cursorY, margin + 70, cursorY);
    doc.line(pageWidth - margin - 70, cursorY, pageWidth - margin, cursorY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('John Fredy Rengifo Basto', margin + 35, cursorY + 4.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Master Coach Ontológico RBC • ICF', margin + 35, cursorY + 8.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(clientName, pageWidth - margin - 35, cursorY + 4.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Participante • RBC Transformación', pageWidth - margin - 35, cursorY + 8.5, { align: 'center' });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${i} de ${totalPages} • ${COMPANY_INFO.fullName} • Tel: ${COMPANY_INFO.formattedPhone} • ICF Code of Ethics`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }

    downloadPDF(doc, fileName);
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
  const enhancedHtml = html.includes('id="rbc-print-bar"')
    ? html
    : html.replace(
        '<body>',
        '<body><div id="rbc-print-bar" style="position:sticky;top:0;z-index:9999;background:#0f172a;color:white;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);margin:-20px -20px 20px -20px;"><div style="font-size:13px;font-weight:600;">RBC Transformación • Documento Oficial</div><button onclick="window.print()" style="background:white;color:#0f172a;border:none;padding:8px 16px;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;">🖨️ Imprimir / Guardar como PDF</button></div><script>setTimeout(function(){try{window.focus();window.print();}catch(e){}},500);</script>'
      );

  let printWindow: Window | null = null;
  try {
    printWindow = window.open('', '_blank');
  } catch {
    printWindow = null;
  }

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(enhancedHtml);
    printWindow.document.close();
  } else {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(enhancedHtml);
        doc.close();
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.warn('Iframe print failed:', e);
          }
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 60000);
        }, 500);
        return;
      }
    } catch (iframeErr) {
      console.warn('Hidden iframe print failed:', iframeErr);
    }
  }
}
