import { jsPDF } from 'jspdf';
import { CronogramaEvent, WorkshopWorkbookSubmission } from '../types';

export interface GeneratePdfOptions {
  participantSubmission?: WorkshopWorkbookSubmission;
  includeGuidingQuestions?: boolean;
  includeSyllabus?: boolean;
  includeSupportMaterials?: boolean;
  includeAnswers?: boolean;
}

/**
 * Genera un Cuaderno de Trabajo / Memorias en formato PDF descargable
 * para talleres, sesiones y workshops ontológicos de RBC.
 */
export function generateWorkshopNotebookPdf(
  event: CronogramaEvent,
  options: GeneratePdfOptions = {}
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  const primaryColor = [18, 24, 38]; // Deep navy #121826
  const accentColor = [79, 70, 229]; // Indigo #4f46e5
  const goldColor = [180, 83, 9]; // Amber #b45309
  const textDark = [30, 41, 59]; // Slate-800
  const textMuted = [100, 116, 139]; // Slate-500
  const borderGray = [226, 232, 240]; // Slate-200
  const bgLight = [248, 250, 252]; // Slate-50

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 20) {
      doc.addPage();
      cursorY = 20;
      renderRunningHeader();
    }
  };

  const renderRunningHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      'RENGIFO BASTO CONSULTORÍA • CUADERNO DE MEMORIAS & TALLER ONTOLÓGICO',
      margin,
      12
    );
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  // --- 1. COVER / HEADER BANNER ---
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, cursorY, contentWidth, 38, 3, 3, 'F');

  // Badge tipo de evento
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.roundedRect(margin + 6, cursorY + 6, 45, 6, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  const typeLabel = (event.eventType || event.category || 'TALLER ONTOLÓGICO').toUpperCase();
  doc.text(typeLabel, margin + 8, cursorY + 10.2);

  // Fecha y Realización
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const dateStr = event.displayDate || event.date?.split('T')[0] || 'Próxima Sesión';
  doc.text(dateStr + (event.time ? ` • ${event.time}` : ''), pageWidth - margin - 6, cursorY + 10, {
    align: 'right',
  });

  // Título del evento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  const splitTitle = doc.splitTextToSize(event.title, contentWidth - 12);
  doc.text(splitTitle[0] || event.title, margin + 6, cursorY + 22);

  // Subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  const subText =
    event.subtitle || 'Espacio formativo, deconstrucción lingüística y decodificación somática';
  const splitSub = doc.splitTextToSize(subText, contentWidth - 12);
  doc.text(splitSub[0] || subText, margin + 6, cursorY + 29);

  // Facilitador y precio
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const facilitatorText = `Facilitador: ${event.facilitator || 'John Fredy Rengifo Basto'} • Inversión: ${
    event.price || (event.priceAmount ? `$${event.priceAmount.toLocaleString()} COP` : 'Acceso Oficial')
  }`;
  doc.text(facilitatorText, margin + 6, cursorY + 34);

  cursorY += 44;

  // --- FICHA DE PARTICIPANTE (Si se provee o espacio para rellenar) ---
  const submission = options.participantSubmission;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, cursorY, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PARTICIPANTE TITULAR:', margin + 4, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const participantName = submission ? submission.participantName : 'Documento Personal del Participante';
  const participantEmail = submission ? submission.participantEmail : 'Registrado en plataforma RBC';
  doc.text(participantName, margin + 44, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    `Correo: ${participantEmail}  |  Emisión: ${new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    margin + 4,
    cursorY + 12
  );

  cursorY += 24;

  // --- SECCIÓN 1: SÍNTESIS & DESCRIPCIÓN ---
  if (event.description) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('1. SÍNTESIS GENERAL DEL ENCUENTRO', margin, cursorY);
    cursorY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const splitDesc = doc.splitTextToSize(event.description, contentWidth);
    doc.text(splitDesc, margin, cursorY);
    cursorY += splitDesc.length * 4.5 + 6;
  }

  // --- SECCIÓN 2: TEMARIO Y BLOQUES TEMÁTICOS ---
  const syllabus = event.syllabus || [];
  if (syllabus.length > 0 && options.includeSyllabus !== false) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('2. ESTRUCTURA Y TEMARIO DEL TALLER', margin, cursorY);
    cursorY += 5;

    syllabus.forEach((block, index) => {
      checkPageBreak(18);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);

      const blockBoxHeight = 15;
      doc.roundedRect(margin, cursorY, contentWidth, blockBoxHeight, 2, 2, 'D');

      // Número
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.circle(margin + 5, cursorY + 7.5, 3.2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(String(index + 1), margin + 4.1, cursorY + 8.6);

      // Título del bloque y duración
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(block.title, margin + 12, cursorY + 6);

      if (block.duration) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
        doc.text(block.duration, pageWidth - margin - 4, cursorY + 6, { align: 'right' });
      }

      // Descripción del bloque
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      const splitBlockDesc = doc.splitTextToSize(block.description, contentWidth - 18);
      doc.text(splitBlockDesc[0] || block.description, margin + 12, cursorY + 11);

      cursorY += blockBoxHeight + 3;
    });

    cursorY += 4;
  }

  // --- SECCIÓN 3: PREGUNTAS GUÍA ---
  const questions = event.guidingQuestions || [];
  if (questions.length > 0 && options.includeGuidingQuestions !== false) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('3. PREGUNTAS GUÍA DE INDAGACIÓN', margin, cursorY);
    cursorY += 5;

    questions.forEach((q, idx) => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`Q${idx + 1}.`, margin + 2, cursorY);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const splitQ = doc.splitTextToSize(`"${q}"`, contentWidth - 12);
      doc.text(splitQ, margin + 10, cursorY);
      cursorY += splitQ.length * 4.2 + 3;
    });

    cursorY += 4;
  }

  // --- SECCIÓN 4: MATERIALES DE APOYO Y SUMINISTROS ---
  const materials = event.supportMaterials || [];
  if (materials.length > 0 && options.includeSupportMaterials !== false) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('4. MATERIALES Y SUMINISTROS DE APOYO', margin, cursorY);
    cursorY += 5;

    materials.forEach((mat) => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const typeBadge = `[${mat.type.toUpperCase()}]`;
      doc.text(typeBadge, margin + 2, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(mat.title, margin + 22, cursorY);

      if (mat.sizeOrDuration) {
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text(`(${mat.sizeOrDuration})`, margin + 25 + doc.getTextWidth(mat.title) + 3, cursorY);
      }

      if (mat.url) {
        doc.setFontSize(7.5);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        const shortUrl = mat.url.length > 55 ? mat.url.slice(0, 52) + '...' : mat.url;
        doc.text(shortUrl, pageWidth - margin, cursorY, { align: 'right' });
      }

      cursorY += 5.5;
    });

    cursorY += 4;
  }

  // --- SECCIÓN 5: CUESTIONARIO POSTERIOR & RESPUESTAS COMPILADAS ---
  const postQuestions = event.postWorkshopQuestions || [
    {
      id: 'q1',
      question: '¿Cuál fue el quiebre, límite o comprensión principal que emergió durante esta sesión?',
      type: 'textarea',
    },
    {
      id: 'q2',
      question: '¿Qué sensación corporal o mensaje somático lograste identificar con mayor claridad?',
      type: 'textarea',
    },
    {
      id: 'q3',
      question: '¿Qué declaración de dignidad, basta o nuevo acuerdo te comprometes a sostener esta semana?',
      type: 'textarea',
    },
  ];

  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('5. EVALUACIÓN POST-TALLER & REFLEXIONES CONSOLIDADAS', margin, cursorY);
  cursorY += 5;

  postQuestions.forEach((pq, i) => {
    checkPageBreak(30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const qHeader = `${i + 1}. ${pq.question}`;
    const splitQHeader = doc.splitTextToSize(qHeader, contentWidth);
    doc.text(splitQHeader, margin, cursorY);
    cursorY += splitQHeader.length * 4.2 + 2;

    const answer = submission?.answers?.[pq.id] || submission?.answers?.[pq.question];

    if (answer) {
      // Respuesta del participante
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);

      const splitAns = doc.splitTextToSize(String(answer), contentWidth - 8);
      const boxH = Math.max(14, splitAns.length * 4.2 + 6);
      doc.roundedRect(margin, cursorY, contentWidth, boxH, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(splitAns, margin + 4, cursorY + 5);

      cursorY += boxH + 4;
    } else {
      // Caja en blanco con líneas para escribir a mano si no hay respuesta registrada
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.2);
      for (let l = 0; l < 3; l++) {
        doc.line(margin + 2, cursorY + 5 + l * 5.5, pageWidth - margin - 2, cursorY + 5 + l * 5.5);
      }
      cursorY += 22;
    }
  });

  // --- SECCIÓN 6: ACUERDOS Y FIRMA ONTOLÓGICA ---
  checkPageBreak(32);
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, cursorY, contentWidth, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('COMPROMISO ONTOLÓGICO:', margin + 6, cursorY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  const declarationText =
    '"Reconozco que la transformación no ocurre en la comprensión intelectual pasiva, sino en la impecabilidad de mis compromisos, el respeto a mis límites somáticos y la coherencia de mis actos del habla."';
  const splitDec = doc.splitTextToSize(declarationText, contentWidth - 12);
  doc.text(splitDec, margin + 6, cursorY + 12);

  cursorY += 28;

  // Pie de página y numeración en todas las páginas
  const totalPages = doc.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      `Página ${p} de ${totalPages} • RBC Ontological Coaching Systems • Confidencial`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Descarga directamente el cuaderno generado en el navegador
 */
export function downloadWorkshopNotebookPdf(
  event: CronogramaEvent,
  options: GeneratePdfOptions = {}
): void {
  const doc = generateWorkshopNotebookPdf(event, options);
  const safeTitle = (event.title || 'Taller_Ontologico')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 30);
  const dateTag = (event.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const filename = `Cuaderno_Taller_${safeTitle}_${dateTag}.pdf`;
  doc.save(filename);
}
