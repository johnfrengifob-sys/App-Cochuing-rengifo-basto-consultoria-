import { FormSubmission, User, ProgramNodeInfo, AIInsight, Session } from '../types';
import { COMPANY_INFO } from '../services/store';

export interface ClientProgressExportData {
  client: User;
  forms: FormSubmission[];
  insights: AIInsight[];
  sessions: Session[];
  nodes: ProgramNodeInfo[];
}

export class PDFGenerator {
  /**
   * Generates and triggers printable executive PDF view for Client's Full Roadmap & Progress
   */
  static generateClientFullProgressPDF(data: ClientProgressExportData): void {
    const { client, forms, insights, sessions, nodes } = data;
    const exportDate = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const currentProgress = client.programProgress || 1;
    const progressPercent = Math.round((currentProgress / 6) * 100);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Expediente de Progreso Ontológico - ${client.name}</title>
        <style>
          @page {
            size: A4;
            margin: 16mm;
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
            line-height: 1.5;
            margin: 0;
            padding: 20px;
          }
          .header {
            border-bottom: 2px solid #111827;
            padding-bottom: 14px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .brand-title {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0 0 2px 0;
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
          .badge {
            display: inline-block;
            background: #000000;
            color: #ffffff;
            font-size: 10px;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
          }
          .section-title {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #000000;
            margin: 22px 0 10px 0;
            border-bottom: 1.5px solid #111827;
            padding-bottom: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 14px;
          }
          .grid-4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 14px;
          }
          .info-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px 14px;
          }
          .info-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #6b7280;
            font-weight: 600;
            margin-bottom: 2px;
          }
          .info-val {
            font-size: 13px;
            color: #111827;
            font-weight: 600;
          }
          .progress-bar-container {
            background: #e5e7eb;
            border-radius: 999px;
            height: 8px;
            overflow: hidden;
            margin: 6px 0 12px 0;
          }
          .progress-bar-fill {
            background: #111827;
            height: 100%;
            border-radius: 999px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 14px;
          }
          th {
            background: #f3f4f6;
            text-align: left;
            padding: 8px 10px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #374151;
            border: 1px solid #e5e7eb;
          }
          td {
            padding: 8px 10px;
            border: 1px solid #e5e7eb;
            vertical-align: top;
          }
          tr:nth-child(even) td {
            background: #fafafa;
          }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 12px;
            background: #ffffff;
            page-break-inside: avoid;
          }
          .card-header-sm {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 6px;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 4px;
          }
          .highlight-card {
            background: #0f172a;
            color: #f8fafc;
            border: none;
            border-radius: 8px;
            padding: 14px;
            margin-bottom: 14px;
            page-break-inside: avoid;
          }
          .highlight-card h4 {
            margin: 0 0 6px 0;
            color: #ffffff;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .pulse-tag {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .pulse-Green { background: #dcfce7; color: #166534; }
          .pulse-Yellow { background: #fef9c3; color: #854d0e; }
          .pulse-Red { background: #fee2e2; color: #991b1b; }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            padding-top: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            color: #9ca3af;
          }
          .signature-box {
            text-align: right;
          }
          .signature-line {
            width: 160px;
            border-top: 1px solid #111827;
            margin-bottom: 4px;
            margin-left: auto;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background: #111827; color: white; padding: 12px 18px; border-radius: 8px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px;">Informe Ejecutivo de Progreso y Evolución Ontológica listo para imprimir o guardar como PDF.</span>
          <button onclick="window.print()" style="background: white; color: black; border: none; font-weight: 600; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="badge">Expediente de Desempeño & Progreso</div>
            <h1 class="brand-title">${COMPANY_INFO.fullName}</h1>
            <p class="brand-subtitle">Consultoría & Acompañamiento Ontológico 1 a 1</p>
          </div>
          <div class="meta-box">
            <div><strong>Fecha de Emisión:</strong> ${exportDate}</div>
            <div><strong>Coach a Cargo:</strong> John Fredy Rengifo</div>
            <div><strong>Sede:</strong> ${COMPANY_INFO.city}</div>
          </div>
        </div>

        <!-- 1. Perfil del Coachee y Métricas Clave -->
        <div class="grid-4">
          <div class="info-box">
            <div class="info-label">Participante</div>
            <div class="info-val">${escapeHTML(client.name)}</div>
            <div style="font-size: 11px; color: #6b7280;">${escapeHTML(client.email)}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Programa Activo</div>
            <div class="info-val">${escapeHTML(client.programName || 'Programa Certeza (12 Semanas)')}</div>
            <div style="font-size: 11px; color: #6b7280;">Pago: ${escapeHTML(client.paymentStatus || 'Completado')}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Avance en Ruta</div>
            <div class="info-val">Sesión ${currentProgress} de 6 (${progressPercent}%)</div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>
          </div>
          <div class="info-box">
            <div class="info-label">Actividad Registrada</div>
            <div class="info-val">${forms.length} Quiebres • ${sessions.length} Sesiones</div>
            <div style="font-size: 11px; color: #6b7280;">${insights.length} Diagnósticos IA</div>
          </div>
        </div>

        <!-- 2. Hoja de Ruta de los 6 Nodos Ontológicos -->
        <div class="section-title">
          <span>1. Mapa de Avance por Nodos del Programa</span>
          <span style="font-size: 11px; font-weight: normal; color: #6b7280;">12 Semanas de Transformación</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 12%;">Paso / Semanas</th>
              <th style="width: 15%;">Nivel</th>
              <th style="width: 25%;">Eje Temático</th>
              <th style="width: 33%;">Propósito Ontológico</th>
              <th style="width: 15%;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${nodes
              .map((n) => {
                const isCompleted = n.step < currentProgress;
                const isCurrent = n.step === currentProgress;
                const statusLabel = isCompleted ? 'Completado' : isCurrent ? 'En Proceso (Activo)' : 'Bloqueado';
                const statusColor = isCompleted ? '#166534' : isCurrent ? '#1e40af' : '#9ca3af';
                return `
                <tr>
                  <td><strong>Sesión ${n.step}</strong><br><span style="font-size: 10px; color: #6b7280;">${escapeHTML(n.weekLabel)}</span></td>
                  <td><strong>${escapeHTML(n.level)}</strong></td>
                  <td><strong>${escapeHTML(n.sessionTitle)}</strong></td>
                  <td style="font-size: 11px; color: #4b5563;">${escapeHTML(n.objective)}</td>
                  <td style="font-weight: 600; color: ${statusColor};">${statusLabel}</td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>

        <!-- 3. Historial de Quiebres y Formularios Completados -->
        <div class="section-title">
          <span>2. Historial de Quiebres, Mapeo Somático y Reflexiones</span>
          <span style="font-size: 11px; font-weight: normal; color: #6b7280;">${forms.length} Registros</span>
        </div>
        ${
          forms.length === 0
            ? '<p style="font-size: 12px; color: #6b7280; font-style: italic;">No hay formularios o quiebres registrados todavía.</p>'
            : forms
                .map((f) => {
                  const node = nodes.find((n) => n.step === f.sessionStep) || nodes[0];
                  const submissionDate = new Date(f.submittedAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return `
                  <div class="card">
                    <div class="card-header-sm">
                      <span>Sesión ${f.sessionStep} (${escapeHTML(f.level)}) • ${escapeHTML(node.sessionTitle)}</span>
                      <span style="color: #6b7280;">Enviado: ${submissionDate}</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                      <div class="info-label">Mapeo Somático / Disposición Emocional:</div>
                      <div style="font-size: 12px; color: #1f2937;">${escapeHTML(f.bodyEmotion)}</div>
                    </div>
                    ${
                      f.levelSpecificAnswer
                        ? `
                      <div style="margin-bottom: 8px;">
                        <div class="info-label">${escapeHTML(node.keyQuestion)}:</div>
                        <div style="font-size: 12px; color: #1f2937;">${escapeHTML(f.levelSpecificAnswer)}</div>
                      </div>
                    `
                        : ''
                    }
                    <div>
                      <div class="info-label">Reflexiones de Fondo y Juicios Declarados:</div>
                      <div style="font-size: 12px; color: #1f2937; white-space: pre-wrap;">${escapeHTML(f.reflections)}</div>
                    </div>
                  </div>
                `;
                })
                .join('')
        }

        <!-- 4. Diagnósticos Ontológicos y Eco IA -->
        <div class="section-title">
          <span>3. Diagnósticos Ontológicos & Síntesis de Coherencia</span>
          <span style="font-size: 11px; font-weight: normal; color: #6b7280;">${insights.length} Evaluaciones</span>
        </div>
        ${
          insights.length === 0
            ? '<p style="font-size: 12px; color: #6b7280; font-style: italic;">No se han emitido diagnósticos ontológicos aún.</p>'
            : insights
                .map((ins) => {
                  const insDate = new Date(ins.generatedAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                  return `
                  <div class="highlight-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <h4>Síntesis de Sabiduría Emocional (${insDate})</h4>
                      <span class="pulse-tag pulse-${ins.pulseFlag}">Pulso: ${ins.pulseFlag}</span>
                    </div>
                    <p style="font-size: 12px; color: #e2e8f0; margin: 0 0 10px 0; line-height: 1.6;">
                      "${escapeHTML(ins.emotionalWisdom)}"
                    </p>
                    ${
                      ins.limitingBeliefs && ins.limitingBeliefs.length > 0
                        ? `
                      <div style="border-top: 1px solid #334155; padding-top: 8px; font-size: 11px;">
                        <span style="color: #94a3b8; font-weight: 600;">Creencias Límite & Mandatos Inconscientes:</span>
                        <ul style="margin: 4px 0 0 0; padding-left: 18px; color: #cbd5e1;">
                          ${ins.limitingBeliefs.map((b) => `<li>${escapeHTML(b)}</li>`).join('')}
                        </ul>
                      </div>
                    `
                        : ''
                    }
                  </div>
                `;
                })
                .join('')
        }

        <!-- 5. Sesiones 1 a 1 y Compromisos -->
        <div class="section-title">
          <span>4. Registro de Sesiones 1 a 1 y Compromisos</span>
          <span style="font-size: 11px; font-weight: normal; color: #6b7280;">${sessions.length} Sesiones Agendadas</span>
        </div>
        ${
          sessions.length === 0
            ? '<p style="font-size: 12px; color: #6b7280; font-style: italic;">No hay sesiones individuales agendadas.</p>'
            : `
            <table>
              <thead>
                <tr>
                  <th style="width: 10%;">Sesión</th>
                  <th style="width: 25%;">Fecha & Hora</th>
                  <th style="width: 15%;">Estado</th>
                  <th style="width: 50%;">Notas & Acuerdos de Sesión</th>
                </tr>
              </thead>
              <tbody>
                ${sessions
                  .map((s) => {
                    const sessionDate = new Date(s.date).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const statusText = s.status === 'completed' ? 'Completada' : s.status === 'scheduled' ? 'Programada' : 'Cancelada';
                    return `
                    <tr>
                      <td><strong>#${s.sessionNumber || '-'}</strong></td>
                      <td>${sessionDate}</td>
                      <td><strong>${statusText}</strong></td>
                      <td style="font-size: 11px; color: #374151;">${escapeHTML(s.notes || 'Sin notas registradas')}</td>
                    </tr>
                  `;
                  })
                  .join('')}
              </tbody>
            </table>
          `
        }

        <!-- Footer -->
        <div class="footer">
          <div>
            <div><strong>${COMPANY_INFO.fullName}</strong> • ${COMPANY_INFO.formattedPhone} • ${COMPANY_INFO.email}</div>
            <div>Documento emitido bajo estricta confidencialidad profesional de coaching ontológico.</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div><strong>John Fredy Rengifo Basto</strong></div>
            <div style="font-size: 10px; color: #6b7280;">Master Coach & Consultor Ontológico</div>
          </div>
        </div>
      </body>
      </html>
    `;

    openPrintWindow(htmlContent, `Progreso_Ontologico_${client.name.replace(/\s+/g, '_')}.pdf`);
  }

  /**
   * Generates and downloads a clean UTF-8 CSV with BOM for spreadsheet software (Excel, Google Sheets)
   */
  static generateClientProgressCSV(data: ClientProgressExportData): void {
    const { client, forms, insights, sessions, nodes } = data;
    const currentProgress = client.programProgress || 1;
    const progressPercent = Math.round((currentProgress / 6) * 100);

    const rows: string[] = [];

    // Header metadata
    rows.push(`"INFORME EJECUTIVO DE PROGRESO ONTOLÓGICO - JOHN FREDY RENGIFO"`);
    rows.push(`"Fecha de Generación",${escapeCSV(new Date().toLocaleString('es-CO'))}`);
    rows.push(`"Coach Encargado",${escapeCSV(COMPANY_INFO.fullName)}`);
    rows.push(``);

    // Section 1: Client Overview
    rows.push(`"=== 1. RESUMEN GENERAL DEL CLIENTE ==="`);
    rows.push(`"Nombre Completo",${escapeCSV(client.name)}`);
    rows.push(`"Correo Electrónico",${escapeCSV(client.email)}`);
    rows.push(`"Teléfono",${escapeCSV(client.phone || 'No registrado')}`);
    rows.push(`"Programa",${escapeCSV(client.programName || 'Programa Certeza (12 Semanas)')}`);
    rows.push(`"Estado de Pago",${escapeCSV(client.paymentStatus || 'Completado')}`);
    rows.push(`"Nodo / Sesión Actual",${escapeCSV(`Sesión ${currentProgress} de 6`)}`);
    rows.push(`"Porcentaje de Avance",${escapeCSV(`${progressPercent}%`)}`);
    rows.push(`"Total Quiebres Enviados",${escapeCSV(forms.length)}`);
    rows.push(`"Total Diagnósticos IA",${escapeCSV(insights.length)}`);
    rows.push(`"Total Sesiones 1 a 1",${escapeCSV(sessions.length)}`);
    rows.push(``);

    // Section 2: Roadmap Nodes
    rows.push(`"=== 2. MAPA DE AVANCE EN EL PROGRAMA (6 NODOS / 12 SEMANAS) ==="`);
    rows.push(`"Paso","Nivel","Semanas","Título de Sesión","Propósito Ontológico","Estado"`);
    nodes.forEach((n) => {
      const isCompleted = n.step < currentProgress;
      const isCurrent = n.step === currentProgress;
      const status = isCompleted ? 'Completado' : isCurrent ? 'En Proceso (Activo)' : 'Bloqueado';
      rows.push(
        [
          escapeCSV(`Sesión ${n.step}`),
          escapeCSV(n.level),
          escapeCSV(n.weekLabel),
          escapeCSV(n.sessionTitle),
          escapeCSV(n.objective),
          escapeCSV(status),
        ].join(',')
      );
    });
    rows.push(``);

    // Section 3: Forms & Quiebres
    rows.push(`"=== 3. HISTORIAL DE QUIEBRES Y FORMULARIOS ==="`);
    rows.push(`"ID Formulario","Fecha de Envío","Sesión","Nivel","Mapeo Somático (Emoción en Cuerpo)","Pregunta Eje","Respuesta Eje","Reflexiones de Fondo"`);
    if (forms.length === 0) {
      rows.push(`"Sin registros de formularios"`);
    } else {
      forms.forEach((f) => {
        const node = nodes.find((n) => n.step === f.sessionStep) || nodes[0];
        rows.push(
          [
            escapeCSV(f.id),
            escapeCSV(new Date(f.submittedAt).toLocaleString('es-CO')),
            escapeCSV(`Sesión ${f.sessionStep}`),
            escapeCSV(f.level),
            escapeCSV(f.bodyEmotion),
            escapeCSV(node.keyQuestion),
            escapeCSV(f.levelSpecificAnswer || ''),
            escapeCSV(f.reflections),
          ].join(',')
        );
      });
    }
    rows.push(``);

    // Section 4: AI Insights
    rows.push(`"=== 4. DIAGNÓSTICOS ONTOLÓGICOS E INSIGHTS ==="`);
    rows.push(`"ID Diagnóstico","Fecha","Pulso","Síntesis y Sabiduría Emocional","Creencias Limitantes","Barreras Lingüísticas"`);
    if (insights.length === 0) {
      rows.push(`"Sin diagnósticos generados"`);
    } else {
      insights.forEach((ins) => {
        rows.push(
          [
            escapeCSV(ins.id),
            escapeCSV(new Date(ins.generatedAt).toLocaleString('es-CO')),
            escapeCSV(ins.pulseFlag),
            escapeCSV(ins.emotionalWisdom),
            escapeCSV(ins.limitingBeliefs?.join(' | ') || ''),
            escapeCSV(ins.linguisticBarriers?.join(' | ') || ''),
          ].join(',')
        );
      });
    }
    rows.push(``);

    // Section 5: Sessions
    rows.push(`"=== 5. BITÁCORA DE SESIONES 1 A 1 ==="`);
    rows.push(`"ID Sesión","Número","Fecha y Hora","Estado","Enlace Meet","Notas y Acuerdos"`);
    if (sessions.length === 0) {
      rows.push(`"Sin sesiones agendadas"`);
    } else {
      sessions.forEach((s) => {
        rows.push(
          [
            escapeCSV(s.id),
            escapeCSV(s.sessionNumber || '-'),
            escapeCSV(new Date(s.date).toLocaleString('es-CO')),
            escapeCSV(s.status),
            escapeCSV(s.meetLink),
            escapeCSV(s.notes || ''),
          ].join(',')
        );
      });
    }

    const csvContent = rows.join('\r\n');
    downloadCSV(
      csvContent,
      `Expediente_Progreso_${client.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    );
  }

  /**
   * Generates and triggers printable PDF view for a completed Form Submission with Ontological Diagnostics
   */
  static generateFormSubmissionPDF(
    form: FormSubmission,
    client: User,
    node: ProgramNodeInfo,
    insight?: AIInsight
  ): void {
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

function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
