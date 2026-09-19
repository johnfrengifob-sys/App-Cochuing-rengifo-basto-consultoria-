export interface TemarioSyllabusItem {
  id: string;
  itemType: 'workshop' | 'session';
  stationNumber?: number; // 1 to 12 if session
  workshopId?: string; // 'taller-1-raiz' etc. if workshop
  cycleNumber: 1 | 2 | 3;
  cycleName: string;
  phaseLabel: string;
  title: string;
  subtitle: string;
  levelBadge: string;
  isMilestone?: boolean;
  // Contenido de lectura ontológica
  theoreticalFramework: {
    summary: string;
    keyConcepts: { term: string; explanation: string }[];
    ontologicalAxis: string;
  };
  objective: string;
  tangibleOutcomes: string[];
  guidingQuestion: string;
  somaticPractice: {
    title: string;
    instruction: string;
    frequency: string;
    bodyAnchor: string;
  };
  methodology: {
    linguistic: string;
    somatic: string;
    emotional: string;
  };
  studyMaterials: {
    title: string;
    type: string;
    pages: string;
    description: string;
  }[];
  // Integraciones oficiales
  googleMeetUrl: string;
  googleFormsUrl: string;
  googleFormsLabel: string;
  googleSheetsReference: string;
  defaultDateLabel: string;
}

export interface TemarioCycleConfig {
  cycleNumber: 1 | 2 | 3;
  title: string;
  subtitle: string;
  phase: string;
  badge: string;
  accent: {
    name: string;
    text: string;
    bg: string;
    border: string;
    softBg: string;
    dot: string;
    ring: string;
    badgeText: string;
  };
  essence: string;
  items: TemarioSyllabusItem[];
}

export const TEMARIO_SYLLABUS_DATA: TemarioCycleConfig[] = [
  {
    cycleNumber: 1,
    title: 'Ciclo 1: Raíz & Fundamentos Ontológicos',
    subtitle: 'Mapeo de la Transparencia, Decodificación Somática & Declaración de Límites',
    phase: 'Fase I • Raíz (Encuentros 1 a 4 + Taller Troncal 1)',
    badge: 'Fase Raíz',
    accent: {
      name: 'emerald',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500/30',
      softBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      dot: 'bg-emerald-500',
      ring: 'ring-emerald-500',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
    },
    essence:
      'El ciclo Raíz está diseñado para suspender la inercia del piloto automático, reconectar con el cuerpo como mensajero ontológico y fundar el nuevo observador mediante la declaración de quiebres y límites no dichos.',
    items: [
      {
        id: 'workshop-1-raiz',
        itemType: 'workshop',
        workshopId: 'taller-1-raiz',
        cycleNumber: 1,
        cycleName: 'Raíz & Fundamentos',
        phaseLabel: 'Hito Grupal Troncal',
        title: 'Taller 1: Raíz y Balance Ontológico',
        subtitle: 'Mapeo de la Transparencia, Decodificación Somática & Quiebres Inconscientes',
        levelBadge: 'Nivel I • Taller Troncal',
        isMilestone: true,
        theoreticalFramework: {
          summary:
            'La transparencia es el flujo de la vida cotidiana donde operamos sin deliberación consciente: caminamos, conducimos y respondemos correos en automático. Cuando sobreviene una interrupción en esa inercia, emerge el "quiebre". Si el quiebre no se declara, se transforma en resignación o síntoma somático. Este taller enseña a nombrar el quiebre con serenidad y a recuperar el espacio reflexivo.',
          keyConcepts: [
            {
              term: 'Transparencia',
              explanation:
                'La actividad no reflexiva del ser humano donde las cosas suceden sin que nos detengamos a cuestionarlas.',
            },
            {
              term: 'Quiebre Ontológico',
              explanation:
                'Juicio de que lo que acontece interrumpe el curso regular de los acontecimientos y abre un espacio para la acción deliberada.',
            },
            {
              term: 'Soberanía de la Pausa',
              explanation:
                'El intervalo consciente entre el estímulo y la respuesta donde reside la libertad humana de elegir el observador.',
            },
          ],
          ontologicalAxis: 'Cuerpo, Respiración & Suspensión de la Inercia Reactiva',
        },
        objective:
          'Identificar la transparencia cotidiana, los automatismos operativos y los quiebres no declarados en el ámbito profesional y personal para recuperar el poder de acción reflexiva.',
        tangibleOutcomes: [
          'Mapeo estructurado de fugas de energía y compromisos automáticos en la rutina diaria.',
          'Reconocimiento temprano de la sobrecarga muscular en hombros, diafragma y mandíbula.',
          'Diseño de la primera declaración de quiebre para conversar con claridad y serenidad.',
        ],
        guidingQuestion:
          '¿En qué áreas de tu vida estás operando en piloto automático tolerando costos ocultos que drenan tu energía vital?',
        somaticPractice: {
          title: 'Pausa de Coherencia Somática 4-2-6',
          instruction:
            'Coloca los pies descalzos sobre el suelo. Inhala en 4 segundos sintiendo la expansión del diafragma, retén en 2 segundos, y exhala suavemente en 6 segundos por la boca abierta mientras sueltas hombros y maxilares.',
          frequency: '3 veces al día (al despertar, al mediodía y antes de dormir)',
          bodyAnchor: 'Planta de los pies y diafragma relajado',
        },
        methodology: {
          linguistic: 'Diferenciación entre el fluir transparente y la declaración formal de quiebre.',
          somatic: 'Calibración de la tensión muscular postural al asumir compromisos automáticos.',
          emotional: 'Reconocimiento de la resignación y el cansancio crónico como señales de alerta.',
        },
        studyMaterials: [
          {
            title: 'Matriz de Mapeo de Transparencia y Quiebres',
            type: 'Matriz de Diagnóstico',
            pages: '4 páginas',
            description: 'Plantilla de auto-evaluación para auditar los 5 dominios vitales y detectar costos invisibles.',
          },
          {
            title: 'Guía de Práctica: La Pausa como Intervención Ontológica',
            type: 'Guía de Trabajo',
            pages: '6 páginas',
            description: 'Manual de micro-intervenciones somáticas para jornadas de alta exigencia.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/hxt-rbco-grp',
        googleFormsUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
        googleFormsLabel: 'Bitácora Oficial Taller 1 (Google Forms)',
        googleSheetsReference: 'bitacora_talleres',
        defaultDateLabel: 'Ciclo Raíz',
      },
      {
        id: 'station-1',
        itemType: 'session',
        stationNumber: 1,
        cycleNumber: 1,
        cycleName: 'Raíz & Fundamentos',
        phaseLabel: 'Estación 01 • Encuentro Individual',
        title: 'Estación 1: Mapeo de la Transparencia y Quiebres Inconscientes',
        subtitle: 'Diagnóstico de Automatismos y Recuperación de la Presencia Consciente',
        levelBadge: 'Nivel I • E01',
        theoreticalFramework: {
          summary:
            'En esta primera estación individual nos sentamos a mapear qué conversaciones no han ocurrido y qué mandatos aprendidos te obligan a responder inmediatamente a cualquier demanda externa. Comenzamos a construir el territorio de seguridad confidencial.',
          keyConcepts: [
            {
              term: 'Piloto Automático',
              explanation: 'Comportamientos aprendidos y repetidos sin cuestionamiento de su vigencia.',
            },
            {
              term: 'Costo Oculto',
              explanation: 'Energía emocional o física invertida en sostener situaciones que ya no tienen sentido.',
            },
          ],
          ontologicalAxis: 'Observador de la propia rutina y auditoría de la energía.',
        },
        objective:
          'Clarificar el quiebre principal que trae el coachee al proceso y distinguir hechos comprobables de opiniones subjetivas.',
        tangibleOutcomes: [
          'Acuerdo inicial de proceso 1 a 1.',
          'Identificación del quiebre rector del proceso.',
          'Primer compromiso de auto-observación diaria.',
        ],
        guidingQuestion: '¿Qué es lo que hoy te resulta más urgente e importante poner sobre la mesa?',
        somaticPractice: {
          title: 'Escaneo de Entrada de 90 Segundos',
          instruction: 'Antes de iniciar cualquier reunión, detente 90 segundos a sentir el contacto de tus pies con el suelo y tu respiración.',
          frequency: 'Al iniciar la jornada laboral',
          bodyAnchor: 'Pies enraizamiento',
        },
        methodology: {
          linguistic: 'Escucha ontológica de las narrativas iniciales.',
          somatic: 'Registro de la postura corporal sentada.',
          emotional: 'Apertura al espacio seguro sin juicio previo.',
        },
        studyMaterials: [
          {
            title: 'Ficha de Auto-diagnóstico de Quiebres',
            type: 'Ficha de Ejercicio',
            pages: '2 páginas',
            description: 'Guía de preguntas para mapear el quiebre rector.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/rbc-sesion-s1',
        googleFormsUrl: 'https://forms.gle/dfStXtTyb1MW6W5K9',
        googleFormsLabel: 'Acuerdo Co-creativo Sesiones Individuales (Google Forms)',
        googleSheetsReference: 'sesiones_individuales',
        defaultDateLabel: 'Semana 1-2',
      },
      {
        id: 'station-2',
        itemType: 'session',
        stationNumber: 2,
        cycleNumber: 1,
        cycleName: 'Raíz & Fundamentos',
        phaseLabel: 'Estación 02 • Encuentro Individual',
        title: 'Estación 2: Fronteras, Declaraciones y Límites No Dichos',
        subtitle: 'El Poder del Basta Ontológico y la Protección del Espacio Propio',
        levelBadge: 'Nivel I • E02',
        theoreticalFramework: {
          summary:
            'Quien no tiene la capacidad de decir "No", tampoco tiene el poder de decir un "Sí" genuino. El límite no es un acto hostil de separación, sino la condición indispensable para que los vínculos sanos y la confianza puedan existir.',
          keyConcepts: [
            {
              term: 'Declaración del No',
              explanation: 'Acto de habla fundacional que delimita el espacio de dignidad personal.',
            },
            {
              term: 'Complacencia Automática',
              explanation: 'Aceptar demandas externas para evitar la incomodidad momentánea del conflicto.',
            },
          ],
          ontologicalAxis: 'Voz propia, asertividad y soberanía de los límites.',
        },
        objective:
          'Diseñar y ensayar la proclamación de límites limpios sin necesidad de sobre-justificaciones defensivas.',
        tangibleOutcomes: [
          'Identificación de la conversación difícil postergada.',
          'Guion claro para comunicar un límite sin agresividad ni culpa.',
          'Plan de acción para la próxima semana.',
        ],
        guidingQuestion: '¿A qué le estás diciendo "sí" cuando en realidad tu cuerpo te pide un rotundo "no"?',
        somaticPractice: {
          title: 'El Escudo de Soberanía Relacional',
          instruction: 'Ante una petición inesperada, respira profundo y responde: "Déjame revisarlo en mi agenda y te confirmo hoy a las 5:00 PM". Elimina el sí reactivo.',
          frequency: 'Ante cualquier petición imprevista',
          bodyAnchor: 'Alineación de columna y respiración pausada',
        },
        methodology: {
          linguistic: 'Actos del habla declarativos: El No, el Basta y el Acepto.',
          somatic: 'Sostener la mirada sin tensión en la garganta.',
          emotional: 'Transformar la culpa en respeto a la propia dignidad.',
        },
        studyMaterials: [
          {
            title: 'Protocolo de Declaraciones Fundamentales de Vida',
            type: 'Guía de Trabajo',
            pages: '8 páginas',
            description: 'Las 6 declaraciones básicas del lenguaje generativo.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/rbc-sesion-s2',
        googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
        googleFormsLabel: 'Bitácora Sesión 2 B2B (Google Forms)',
        googleSheetsReference: 'bitacora_sesiones_b2b',
        defaultDateLabel: 'Semana 3-4',
      },
      {
        id: 'station-3',
        itemType: 'session',
        stationNumber: 3,
        cycleNumber: 1,
        cycleName: 'Raíz & Fundamentos',
        phaseLabel: 'Estación 03 • Encuentro Individual',
        title: 'Estación 3: Somatización, Mandatos y Sabiduría de las Emociones',
        subtitle: 'Decodificación de Emociones como Señales Inteligentes de Adaptación',
        levelBadge: 'Nivel I • E03',
        theoreticalFramework: {
          summary:
            'Las emociones no son debilidades que haya que reprimir o controlar; son sistemas de alerta que nos informan sobre la relación entre nuestros recursos y nuestros desafíos. El miedo informa sobre la prudencia; la rabia sobre los límites vulnerados; la culpa sobre la auto-reparación.',
          keyConcepts: [
            {
              term: 'Predisposición para la Acción',
              explanation: 'Cada emoción prepara al cuerpo biológico para un tipo específico de movimiento.',
            },
            {
              term: 'Mandatos Introyectados',
              explanation: 'Creencias heredadas de la familia o cultura que operan como leyes absolutas en la psique.',
            },
          ],
          ontologicalAxis: 'Escucha del síntoma somático y reconciliación emocional.',
        },
        objective:
          'Aprender a escuchar las emociones en el cuerpo sin etiquetarlas como buenas o malas, extrayendo su mensaje constructivo.',
        tangibleOutcomes: [
          'Mapa de las tres emociones predominantes en tu rutina directiva.',
          'Técnica somática para disolver la contracción del plexo solar.',
          'Pacto de no violencia hacia uno mismo.',
        ],
        guidingQuestion: '¿Qué emoción tiene una presencia constante en tu cuerpo y qué mensaje busca entregarte?',
        somaticPractice: {
          title: 'Respiración en Caja (Box Breathing)',
          instruction: 'Inhala en 4 tiempos, retén con pulmones llenos 4 tiempos, exhala en 4 tiempos, y sostén en vacío 4 tiempos. Repite 4 ciclos seguidos.',
          frequency: 'Ante picos de agobio o frustración',
          bodyAnchor: 'Plexo solar y diafragma',
        },
        methodology: {
          linguistic: 'Nombrar con precisión el estado emocional.',
          somatic: 'Soltura de mandíbula y cuello.',
          emotional: 'Aceptación incondicional de la vivencia interna.',
        },
        studyMaterials: [
          {
            title: 'Compendio: La Inteligencia Adaptativa de las Emociones',
            type: 'Guía de Trabajo',
            pages: '7 páginas',
            description: 'Análisis de la función protectora del miedo, la rabia y la culpa.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/rbc-sesion-s3',
        googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
        googleFormsLabel: 'Bitácora Sesión 3 B2B (Google Forms)',
        googleSheetsReference: 'bitacora_sesiones_b2b',
        defaultDateLabel: 'Semana 5-6',
      },
      {
        id: 'station-4',
        itemType: 'session',
        stationNumber: 4,
        cycleNumber: 1,
        cycleName: 'Raíz & Fundamentos',
        phaseLabel: 'Estación 04 • Cierre de Ciclo',
        title: 'Estación 4: ★ Cosecha del Ciclo 1 & Integración de Siembra',
        subtitle: 'Consolidación de Descubrimientos y Transición al Ciclo Tallo',
        levelBadge: 'Nivel I • E04 Hito',
        isMilestone: true,
        theoreticalFramework: {
          summary:
            'Cada 4 encuentros realizamos una pausa formal de "Cosecha". Aquí no abrimos nuevos temas, sino que integramos la siembra: qué juicios se cayeron, qué patrones repetitivos se hicieron visibles y cómo se siente el nuevo observador en el cuerpo.',
          keyConcepts: [
            {
              term: 'Cosecha Ontológica',
              explanation: 'El acto deliberado de recoger los aprendizajes y convertirlos en nuevos estándares.',
            },
            {
              term: 'Nuevo Observador',
              explanation: 'La capacidad de mirar la misma realidad desde un nivel superior de consciencia.',
            },
          ],
          ontologicalAxis: 'Integración, celebración de logros y cierre de ciclo.',
        },
        objective:
          'Evaluar la transformación de las primeras 4 semanas, registrar la Cosecha del Ciclo 1 en la bitácora y acordar el plan del Ciclo 2.',
        tangibleOutcomes: [
          'Documento formal de Cosecha del Ciclo 1.',
          'Bitácora descargable con todos los avances consolidados.',
          'Habilitación del tránsito hacia el Ciclo 2 (Tallo & Soberanía).',
        ],
        guidingQuestion: '¿Qué grandes descubrimientos has notado en ti en estas 4 semanas y cómo ha cambiado tu mirada?',
        somaticPractice: {
          title: 'Anclaje de Integración y Gratitud',
          instruction: 'Mano derecha en el corazón, mano izquierda en el abdomen. Cierra los ojos y agradece a tu cuerpo por haber sostenido el camino de auto-observación.',
          frequency: 'Al culminar el Ciclo 1',
          bodyAnchor: 'Corazón y centro vital',
        },
        methodology: {
          linguistic: 'Declaración de cosecha y compromiso de continuidad.',
          somatic: 'Postura de arraigo y apertura.',
          emotional: 'Gratitud generativa y serenidad interna.',
        },
        studyMaterials: [
          {
            title: 'Ficha de Cosecha del Ciclo 1 (PDF)',
            type: 'Matriz de Diagnóstico',
            pages: '3 páginas',
            description: 'Plantilla de evaluación del primer tercio del camino ontológico.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/rbc-sesion-s4',
        googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
        googleFormsLabel: 'Bitácora Sesiones B2B Cosecha Ciclo 1 (Google Forms)',
        googleSheetsReference: 'bitacora_sesiones_b2b',
        defaultDateLabel: 'Semana 7-8',
      },
    ],
  },
  {
    cycleNumber: 2,
    title: 'Ciclo 2: Tallo & Soberanía Relacional',
    subtitle: 'Reencuadre de Juicios, Anatomía de Pedidos y Reconstrucción de la Confianza',
    phase: 'Fase II • Tallo (Encuentros 5 a 8 + Taller Troncal 2)',
    badge: 'Fase Tallo',
    accent: {
      name: 'amber',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500',
      border: 'border-amber-500/30',
      softBg: 'bg-amber-500/10 dark:bg-amber-500/15',
      dot: 'bg-amber-500',
      ring: 'ring-amber-500',
      badgeText: 'text-amber-700 dark:text-amber-300',
    },
    essence:
      'El ciclo Tallo profundiza en el poder del lenguaje como generador de realidades: fundamentar juicios automáticos, eliminar la queja improductiva mediante pedidos impecables y sanar el resentimiento en las relaciones clave.',
    items: [
      {
        id: 'workshop-2-tallo',
        itemType: 'workshop',
        workshopId: 'taller-2-tallo',
        cycleNumber: 2,
        cycleName: 'Tallo & Soberanía',
        phaseLabel: 'Hito Grupal Troncal',
        title: 'Taller 2: Tallo & Soberanía Relacional',
        subtitle: 'Fronteras, Actos Declarativos & Deconstrucción de la Culpa Condicionada',
        levelBadge: 'Nivel II • Taller Troncal',
        isMilestone: true,
        theoreticalFramework: {
          summary:
            'El lenguaje no solo describe el mundo; el lenguaje crea mundo. Cuando emitimos un juicio, nos comprometemos con una interpretación que condiciona lo que es posible o imposible para nosotros. En este taller desarmamos los juicios maestros de insuficiencia y aprendemos a fundamentarlos con hechos verificables.',
          keyConcepts: [
            {
              term: 'Juicio vs. Afirmación',
              explanation: 'Las afirmaciones son verdaderas o falsas según hechos observables; los juicios son fundados o infundados según estándares compartidos.',
            },
            {
              term: 'Juicio Maestro',
              explanation: 'La historia central que una persona se cuenta sobre sí misma ("nunca es suficiente", "tengo que cargar con todo").',
            },
            {
              term: 'Fundamentación de Juicios',
              explanation: 'El método riguroso de 5 pasos para verificar si una opinión tiene sustento fáctico o es un espejismo heredado.',
            },
          ],
          ontologicalAxis: 'Lenguaje Generativo, Rigor Reflexivo & Desactivación de la Queja',
        },
        objective:
          'Fundamentar juicios maestros limitantes y transformar la queja estéril en reclamos ontológicos y pedidos estructurados para la coordinación de acciones impecables.',
        tangibleOutcomes: [
          'Desactivación del juicio maestro más tóxico detectado en el ámbito profesional.',
          'Diseño de pedidos con condiciones de satisfacción explícitas y plazos determinados.',
          'Acuerdos claros de renegociación de promesas rotas.',
        ],
        guidingQuestion:
          '¿Qué límites has omitido declarar por temor al conflicto o por necesidad aprendida de aprobación?',
        somaticPractice: {
          title: 'Postura de Arraigo Vertical y Mirada Firme',
          instruction:
            'Alinea la columna erguida sin rigidez. Hombros caídos hacia atrás, mirada a la altura de los ojos sin parpadear aceleradamente. Siente la firmeza interna que no necesita levantar la voz.',
          frequency: 'Antes de iniciar negociaciones o conversaciones de límites',
          bodyAnchor: 'Eje vertical y columna vertebral',
        },
        methodology: {
          linguistic: 'Los 5 pasos para fundamentar un juicio ontológico.',
          somatic: 'Disolución de la postura de súplica o de confrontación agresiva.',
          emotional: 'Tránsito del resentimiento a la aceptación activa.',
        },
        studyMaterials: [
          {
            title: 'Matriz de Fundamentación de Juicios Maestros',
            type: 'Matriz de Diagnóstico',
            pages: '4 páginas',
            description: 'Guía paso a paso para auditar las creencias limitantes.',
          },
          {
            title: 'Manual de Pedidos, Ofertas y Promesas Impecables',
            type: 'Guía de Trabajo',
            pages: '6 páginas',
            description: 'Protocolos lingüísticos para coordinar acciones con alto impacto.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/hxt-rbco-grp',
        googleFormsUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
        googleFormsLabel: 'Bitácora Oficial Taller 2 (Google Forms)',
        googleSheetsReference: 'bitacora_talleres',
        defaultDateLabel: 'Ciclo Tallo',
      },
      {
        id: 'station-5',
        itemType: 'session',
        stationNumber: 5,
        cycleNumber: 2,
        cycleName: 'Tallo & Soberanía',
        phaseLabel: 'Estación 05 • Encuentro Individual',
        title: 'Estación 5: Reencuadre de Juicios Maestros & Afirmaciones Fácticas',
        subtitle: 'Auditoría de Historias Limitantes y Validación Fáctica',
        levelBadge: 'Nivel II • E05',
        theoreticalFramework: {
          summary:
            '¿Cuánto sufrimiento en tu vida ha sido causado por tomar una opinión como un hecho indiscutible? En este encuentro aprendemos a desarmar los juicios que te impiden delegar, descansar o liderar con autoridad serena.',
          keyConcepts: [
            {
              term: 'Falso Hecho',
              explanation: 'Creer que "el equipo no está comprometido" es una verdad universal y no una interpretación sujeta a indagación.',
            },
            {
              term: 'Estándar',
              explanation: 'La regla implícita con la que medimos el éxito o el fracaso.',
            },
          ],
          ontologicalAxis: 'Diferenciación estricta entre observaciones fácticas y juicios de valor.',
        },
        objective:
          'Pasar por el filtro de los 5 fundamentos el juicio limitante más recurrente del coachee en su trabajo.',
        tangibleOutcomes: [
          'Juicio maestro reencuadrado en una afirmación fáctica verificable.',
          'Alivio emocional inmediato al desarmar la certeza absoluta del sufrimiento.',
        ],
        guidingQuestion: '¿Qué juicio sobre ti o los demás has estado tratando erróneamente como un hecho absoluto?',
        somaticPractice: {
          title: 'El Filtro de los 5 Fundamentos',
          instruction: 'Escribe el juicio. Busca 3 hechos que lo sustenten y 3 hechos reales que lo contradigan. Observa cómo la rigidez mental cede.',
          frequency: 'Ante juicios de catástrofe o incompetencia',
          bodyAnchor: 'Respiración rítmica y relajación frontal',
        },
        methodology: {
          linguistic: 'Indagación apreciativa de los estándares personales.',
          somatic: 'Respiración diafragmática ante la incertidumbre.',
          emotional: 'Apertura al asombro y la duda productiva.',
        },
        studyMaterials: [
          {
            title: 'Ficha de Fundamentación de Juicios',
            type: 'Ficha de Ejercicio',
            pages: '3 páginas',
            description: 'Plantilla de trabajo individual para desarmar juicios maestros.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/rbc-sesion-s5',
        googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
        googleFormsLabel: 'Bitácora Sesión 5 B2B (Google Forms)',
        googleSheetsReference: 'bitacora_sesiones_b2b',
        defaultDateLabel: 'Semana 9-10',
      },
      {
        id: 'station-6',
        itemType: 'session',
        stationNumber: 6,
        cycleNumber: 2,
        cycleName: 'Tallo & Soberanía',
        phaseLabel: 'Estación 06 • Encuentro Individual',
        title: 'Estación 6: La Anatomía del Pedido, Oferta y Promesa Impecable',
        subtitle: 'Diseño de Conversaciones de Coordinación de Acciones',
        levelBadge: 'Nivel II • E06',
        theoreticalFramework: {
          summary:
            'La mayoría de las desilusiones en las relaciones no nacen de malas intenciones, sino de pedidos mal hechos ("necesito esto pronto") que no especifican plazos, condiciones ni verificaciones.',
          keyConcepts: [
            {
              term: 'Pedido Impecable',
              explanation: 'Orador, Oyente, Acción concreta, Plazo definido y Condiciones de satisfacción.',
            },
            {
              term: 'Promesa',
              explanation: 'El compromiso mutuo que sella la confiabilidad entre dos seres humanos.',
            },
          ],
          ontologicalAxis: 'Efectividad en la coordinación de acciones y cuidado de la confianza.',
        },
        objective:
          'Transformar quejas pasivas en pedidos explícitos con interlocutores concretos.',
        tangibleOutcomes: [
          'Diseño de 2 pedidos de alta relevancia profesional.',
          'Eliminación de ambigüedades en la delegación de responsabilidades.',
        ],
        guidingQuestion: '¿De qué te estás quejando actualmente que podrías transformar en un pedido directo y claro?',
        somaticPractice: {
          title: 'Resonancia de la Voz Directiva',
          instruction: 'Antes de formular un pedido, siente la vibración de tu voz naciendo en el pecho, no en la garganta. Habla con cadencia pausada.',
          frequency: 'Al iniciar reuniones de delegación',
          bodyAnchor: 'Caja torácica y voz enraizada',
        },
        methodology: {
          linguistic: 'Estructura matemática del pedido y la promesa.',
          somatic: 'Presencia centrada y contacto visual sereno.',
          emotional: 'Confianza y certidumbre relacional.',
        },
        studyMaterials: [
          {
            title: 'Protocolo de Pedido Impecable',
            type: 'Guía de Trabajo',
            pages: '4 páginas',
            description: 'Checklist para no omitir ninguna condición de satisfacción.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/rbc-sesion-s6',
        googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
        googleFormsLabel: 'Bitácora Sesión 6 B2B (Google Forms)',
        googleSheetsReference: 'bitacora_sesiones_b2b',
        defaultDateLabel: 'Semana 11-12',
      },
      {
        id: 'station-7',
        itemType: 'session',
        stationNumber: 7,
        cycleNumber: 2,
        cycleName: 'Tallo & Soberanía',
        phaseLabel: 'Estación 07 • Encuentro Individual',
        title: 'Estación 7: El Reclamo Productivo y la Reparación de la Confianza',
        subtitle: 'Cierre de Ciclos de Resentimiento y Cuidado de la Relación',
        levelBadge: 'Nivel II • E07',
        theoreticalFramework: {
          summary:
            'Cuando una promesa no se cumple, hay dos caminos: el resentimiento silencioso que envenena el vínculo, o el reclamo productivo que cuida el compromiso y repara la confianza con altura ética.',
          keyConcepts: [
            {
              term: 'Reclamo vs. Queja',
              explanation: 'La queja busca culpables y desahogo estéril; el reclamo busca reparar el daño y renovar la promesa.',
            },
            {
              term: 'Resentimiento',
              explanation: 'La emoción de quedarse atrapado en el pasado rumiando un daño no expresado.',
            },
          ],
          ontologicalAxis: 'Sanación de promesas rotas y madurez conversacional.',
        },
        objective:
          'Diseñar y ensayar una conversación de reclamo con dignidad hacia una promesa incumplida de alto impacto.',
        tangibleOutcomes: [
          'Guion para el reclamo productivo sin acusaciones morales.',
          'Paz interior y salida del bucle de queja interna.',
        ],
        guidingQuestion: '¿Qué promesa rota te sigue quitando la paz y qué conversación de reclamo requieres sostener?',
        somaticPractice: {
          title: 'Liberación de la Carga de Resentimiento',
          instruction: 'Exhala largo sintiendo cómo el estómago se vacía por completo. Recuerda que sostener rencor es como beber veneno esperando que el otro se enferme.',
          frequency: 'Al recordar episodios de incumplimiento',
          bodyAnchor: 'Estómago y mandíbula',
        },
        methodology: {
          linguistic: 'Los 4 pasos del reclamo ontológico: Hecho, Daño, Promesa y Reparación.',
          somatic: 'Soltar la postura defensiva de brazos cruzados.',
          emotional: 'Generosidad ontológica y paz mental.',
        },
        studyMaterials: [
          {
            title: 'Guion de Reclamo Productivo y Restauración de Confianza',
            type: 'Ficha de Ejercicio',
            pages: '3 páginas',
            description: 'Plantilla paso a paso para conversaciones difíciles.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/rbc-sesion-s7',
        googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
        googleFormsLabel: 'Bitácora Sesión 7 B2B (Google Forms)',
        googleSheetsReference: 'bitacora_sesiones_b2b',
        defaultDateLabel: 'Semana 13-14',
      },
      {
        id: 'station-8',
        itemType: 'session',
        stationNumber: 8,
        cycleNumber: 2,
        cycleName: 'Tallo & Soberanía',
        phaseLabel: 'Estación 08 • Cierre de Ciclo',
        title: 'Estación 8: ★ Cosecha del Ciclo 2 & Liderazgo de Fronteras',
        subtitle: 'Consolidación de la Soberanía Relacional y Preparación para el Florecimiento',
        levelBadge: 'Nivel II • E08 Hito',
        isMilestone: true,
        theoreticalFramework: {
          summary:
            'Hemos completado dos tercios del camino. En esta sesión consolidamos cómo tus vínculos ahora respetan tus fronteras y cómo tu palabra tiene ahora un peso específico y respetado en tu entorno.',
          keyConcepts: [
            {
              term: 'Soberanía Relacional',
              explanation: 'La capacidad de vincularse desde la libertad interior y no desde el miedo a no pertenecer.',
            },
            {
              term: 'Consolidación de Tallo',
              explanation: 'La firmeza flexible del bambú: se dobla ante el viento pero no se rompe jamás.',
            },
          ],
          ontologicalAxis: 'Integración de las competencias lingüísticas y declarativas.',
        },
        objective:
          'Registrar formalmente la Cosecha del Ciclo 2 y trazar la visión de futuro que florecerá en el Ciclo 3.',
        tangibleOutcomes: [
          'Documento oficial de Cosecha del Ciclo 2 en bitácora.',
          'Descarga del Cuaderno de Trabajo consolidado.',
          'Habilitación del tramo final: Ciclo 3 (Florecimiento & Integración).',
        ],
        guidingQuestion: '¿Cómo ha evolucionado tu capacidad de sostener conversaciones firmes y respetuosas?',
        somaticPractice: {
          title: 'Centramiento Somático de Liderazgo Sereno',
          instruction: 'De pie, pies al ancho de hombros, rodillas semiflexionadas. Siente la solidez de tu postura como un árbol firme. Declara internamente tu soberanía.',
          frequency: 'Al culminar el Ciclo 2',
          bodyAnchor: 'Pelvis, piernas y columna',
        },
        methodology: {
          linguistic: 'Evaluación de promesas y coherencia relacional.',
          somatic: 'Equilibrio postural dinámico.',
          emotional: 'Auto-estima fundada y serenidad.',
        },
        studyMaterials: [
          {
            title: 'Ficha de Cosecha del Ciclo 2 (PDF)',
            type: 'Matriz de Diagnóstico',
            pages: '3 páginas',
            description: 'Evaluación de las competencias relacionales del participante.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/rbc-sesion-s8',
        googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
        googleFormsLabel: 'Bitácora Sesiones B2B Cosecha Ciclo 2 (Google Forms)',
        googleSheetsReference: 'bitacora_sesiones_b2b',
        defaultDateLabel: 'Semana 15-16',
      },
    ],
  },
  {
    cycleNumber: 3,
    title: 'Ciclo 3: Florecimiento & Nuevo Observador',
    subtitle: 'Diseño de Futuro, Ofertas Irresistibles & Compromisos Innegociables',
    phase: 'Fase III • Florecimiento (Encuentros 9 a 12 + Taller Troncal 3)',
    badge: 'Fase Florecimiento',
    accent: {
      name: 'indigo',
      text: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500',
      border: 'border-indigo-500/30',
      softBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      dot: 'bg-indigo-500',
      ring: 'ring-indigo-500',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
    },
    essence:
      'El ciclo Florecimiento corona el proceso. Aquí el coachee ya no reacciona a los problemas del pasado, sino que diseña activamente el futuro: construye ofertas de alto valor, proyecta su nueva identidad pública y sella su Carta de Compromisos Innegociables.',
    items: [
      {
        id: 'workshop-3-florecimiento',
        itemType: 'workshop',
        workshopId: 'taller-3-florecimiento',
        cycleNumber: 3,
        cycleName: 'Florecimiento & Integración',
        phaseLabel: 'Hito Grupal Troncal',
        title: 'Taller 3: Florecimiento & Integración',
        subtitle: 'El Nuevo Observador, Maestría Lingüística & Cosecha Integral',
        levelBadge: 'Nivel III • Taller Troncal',
        isMilestone: true,
        theoreticalFramework: {
          summary:
            'El futuro no es un lugar hacia el que caminamos pasivamente; es una realidad que construimos en el presente mediante nuestras declaraciones, ofertas y redes de confianza. En este taller integramos la mente, el cuerpo y la emoción en una sola melodía de coherencia y soberanía personal.',
          keyConcepts: [
            {
              term: 'Nuevo Observador',
              explanation: 'La persona que es capaz de ver posibilidades donde los observadores comunes solo ven bloqueos o amenazas.',
            },
            {
              term: 'Diseño de Oferta',
              explanation: 'La declaración clara del valor diferencial único que un ser humano aporta a su comunidad o empresa.',
            },
            {
              term: 'Compromiso Innegociable',
              explanation: 'Aquel estándar vital que no se transa bajo ninguna circunstancia, pues custodia el alma del observador.',
            },
          ],
          ontologicalAxis: 'Visión Trascendente, Creatividad Generativa & Coherencia Ética',
        },
        objective:
          'Proyectar escenarios de certeza interna, construyendo ofertas irresistibles y consolidando el nuevo observador ontológico con estándares innegociables.',
        tangibleOutcomes: [
          'Proclamación del Manifiesto de Soberanía Personal.',
          'Diseño de la oferta profesional y directiva de alto valor.',
          'Consolidación del protocolo de auto-asistencia para quiebres futuros.',
        ],
        guidingQuestion:
          '¿Desde qué nuevo observador estás eligiendo diseñar tu futuro y tus acuerdos relacionales?',
        somaticPractice: {
          title: 'Presencia Centrada y Expansión Torácica',
          instruction:
            'Respiración fluida, soltura mandibular, mirada amplia que contempla el horizonte con serenidad y gratitud sin apego.',
          frequency: 'Al iniciar cada semana de proyección directiva',
          bodyAnchor: 'Tórax abierto, columna alineada y respiración suave',
        },
        methodology: {
          linguistic: 'Declaraciones de futuro y promesas de identidad pública.',
          somatic: 'Integración postural global: firmeza y fluidez armónica.',
          emotional: 'Gratitud trascendente y ambición generativa.',
        },
        studyMaterials: [
          {
            title: 'Lienzo de Diseño de Identidad Pública y Oferta Única',
            type: 'Ficha de Ejercicio',
            pages: '4 páginas',
            description: 'Plantilla para redactar tu propuesta de valor y presencia ejecutiva.',
          },
          {
            title: 'Compendio de Integración Ontológica y Carta de Innegociables',
            type: 'Guía de Trabajo',
            pages: '10 páginas',
            description: 'Tu manual definitivo para sostener la transformación en el tiempo.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/hxt-rbco-grp',
        googleFormsUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
        googleFormsLabel: 'Bitácora Oficial Taller 3 (Google Forms)',
        googleSheetsReference: 'bitacora_talleres',
        defaultDateLabel: 'Ciclo Florecimiento',
      },
      {
        id: 'station-9',
        itemType: 'session',
        stationNumber: 9,
        cycleNumber: 3,
        cycleName: 'Florecimiento & Integración',
        phaseLabel: 'Estación 09 • Encuentro Individual',
        title: 'Estación 9: Diseño de Conversaciones de Futuro y Posibilidad',
        subtitle: 'Proyección de Certeza Interna y Desprendimiento del Pasado',
        levelBadge: 'Nivel III • E09',
        theoreticalFramework: {
          summary:
            'Cuando dejamos de dedicar energía a defendernos de las heridas del pasado, se libera un caudal inmenso de creatividad para diseñar el futuro. Aquí indagamos qué visión te convoca genuinamente.',
          keyConcepts: [
            {
              term: 'Conversación de Posibilidad',
              explanation: 'La conversación donde exploramos qué cosas nuevas podrían inventarse sin las limitaciones del pasado.',
            },
            {
              term: 'Certeza Ontológica',
              explanation: 'El estado de calma interna fundado en la confianza en nuestros recursos reflexivos.',
            },
          ],
          ontologicalAxis: 'Visión de futuro y desprendimiento de la necesidad de control.',
        },
        objective:
          'Clarificar los 3 proyectos transformacionales que el coachee convocará en los próximos trimestres.',
        tangibleOutcomes: [
          'Visión declarada de futuro a 12 meses.',
          'Mapeo de los aliados clave para coordinar acciones.',
        ],
        guidingQuestion: '¿Qué nueva identidad pública y profesional estás declarando para tu próximo ciclo vital?',
        somaticPractice: {
          title: 'Visualización Matutina de Posibilidad',
          instruction: '5 minutos al despertar: visualiza tu día desde la serenidad y la certeza antes de tocar el teléfono o mirar pantallas.',
          frequency: 'Diaria en la mañana',
          bodyAnchor: 'Frente relajada y respiración profunda',
        },
        methodology: {
          linguistic: 'Declaraciones de futuro y apertura de posibilidades.',
          somatic: 'Apertura y soltura de cuello y trapecios.',
          emotional: 'Entusiasmo sereno.',
        },
        studyMaterials: [
          {
            title: 'Cuaderno: Conversaciones de Futuro y Arquitectura de Posibilidad',
            type: 'Guía de Trabajo',
            pages: '8 páginas',
            description: 'Técnicas avanzadas de indagación ontológica para proyectos.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/rbc-sesion-s9',
        googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
        googleFormsLabel: 'Bitácora Sesión 9 B2B (Google Forms)',
        googleSheetsReference: 'bitacora_sesiones_b2b',
        defaultDateLabel: 'Semana 17-18',
      },
      {
        id: 'station-10',
        itemType: 'session',
        stationNumber: 10,
        cycleNumber: 3,
        cycleName: 'Florecimiento & Integración',
        phaseLabel: 'Estación 10 • Encuentro Individual',
        title: 'Estación 10: El Arte de la Escucha Ontológica y el Liderazgo Generativo',
        subtitle: 'Habitar el Espacio del Otro sin Juicio Reactivo',
        levelBadge: 'Nivel III • E10',
        theoreticalFramework: {
          summary:
            'La verdadera maestría de un líder no radica en dar órdenes brillantes, sino en saber escuchar lo que no se dice: el dolor, el anhelo y el potencial del otro. La escucha ontológica disuelve las barreras defensivas.',
          keyConcepts: [
            {
              term: 'Escucha Previa',
              explanation: 'Escuchar al otro desde los prejuicios automáticos que ya teníamos formulados sobre él.',
            },
            {
              term: 'Escucha Generativa',
              explanation: 'Escuchar el futuro emergente de la otra persona, validando su dignidad y capacidad.',
            },
          ],
          ontologicalAxis: 'Presencia empática y desmantelamiento de la necesidad de tener la razón.',
        },
        objective:
          'Entrenar la escucha generativa en las conversaciones más tensas del entorno laboral y familiar.',
        tangibleOutcomes: [
          'Protocolo de escucha limpia antes de emitir cualquier dictamen o sugerencia.',
          'Mejora notable del clima de confianza en el equipo directivo.',
        ],
        guidingQuestion: '¿A quién necesitas escuchar de verdad, dejando de lado tus respuestas automáticas?',
        somaticPractice: {
          title: 'El Silencio Atento de 3 Segundos',
          instruction: 'Cuando alguien termine de hablar, no respondas de inmediato. Respira 3 segundos y pregúntate: "¿Qué necesita realmente esta persona de mí en este momento?"',
          frequency: 'En todas las reuniones clave',
          bodyAnchor: 'Oídos atentos, pecho abierto y cuerpo quieto',
        },
        methodology: {
          linguistic: 'Preguntas abiertas y reformulación validante.',
          somatic: 'Cuerpo receptivo sin inclinación agresiva hacia adelante.',
          emotional: 'Compasión y respeto ontológico.',
        },
        studyMaterials: [
          {
            title: 'Protocolo de Escucha Ontológica Directiva',
            type: 'Guía de Trabajo',
            pages: '5 páginas',
            description: 'Las 3 dimensiones de la escucha empática en organizaciones.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/rbc-sesion-s10',
        googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
        googleFormsLabel: 'Bitácora Sesión 10 B2B (Google Forms)',
        googleSheetsReference: 'bitacora_sesiones_b2b',
        defaultDateLabel: 'Semana 19-20',
      },
      {
        id: 'station-11',
        itemType: 'session',
        stationNumber: 11,
        cycleNumber: 3,
        cycleName: 'Florecimiento & Integración',
        phaseLabel: 'Estación 11 • Encuentro Individual',
        title: 'Estación 11: Construcción de Ofertas Irresistibles e Identidad Pública',
        subtitle: 'Proyección de Autoridad Serena y Posicionamiento de Valor',
        levelBadge: 'Nivel III • E11',
        theoreticalFramework: {
          summary:
            'Una oferta es una promesa condicional de satisfacción. Quien aprende a formular ofertas atractivas deja de perseguir oportunidades y se convierte en un polo de atracción natural para clientes y aliados.',
          keyConcepts: [
            {
              term: 'Identidad Pública',
              explanation: 'El juicio que la comunidad o el mercado tiene acerca de nuestras competencias y confiabilidad.',
            },
            {
              term: 'Oferta Irresistible',
              explanation: 'Alineación perfecta entre el dolor o anhelo del otro y nuestra solución con estándar impecable.',
            },
          ],
          ontologicalAxis: 'Autoridad serena y valor percibido en el mercado.',
        },
        objective:
          'Diseñar la oferta ejecutiva o profesional del coachee expresada en una sola declaración contundente.',
        tangibleOutcomes: [
          'Declaración formal de la Oferta Personal de Valor.',
          'Estrategia de comunicación con redes de valor.',
        ],
        guidingQuestion: '¿Cuál es la oferta más valiosa que hoy puedes hacer al mundo profesional y personal?',
        somaticPractice: {
          title: 'Postura de Proyección y Solidez',
          instruction: 'Siente cómo tu peso se distribuye en ambas piernas. Respira imaginando que tu presencia llena la habitación sin invadir a nadie.',
          frequency: 'Antes de presentaciones de negocio',
          bodyAnchor: 'Pies, cadera y esternón',
        },
        methodology: {
          linguistic: 'Diseño de propuestas de valor y conversaciones de venta consultiva.',
          somatic: 'Presencia magnética sin aspavientos.',
          emotional: 'Seguridad arraigada.',
        },
        studyMaterials: [
          {
            title: 'Lienzo de Diseño de Oferta Única',
            type: 'Ficha de Ejercicio',
            pages: '4 páginas',
            description: 'Estructura para formalizar tu diferencial.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/rbc-sesion-s11',
        googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
        googleFormsLabel: 'Bitácora Sesión 11 B2B (Google Forms)',
        googleSheetsReference: 'bitacora_sesiones_b2b',
        defaultDateLabel: 'Semana 21-22',
      },
      {
        id: 'station-12',
        itemType: 'session',
        stationNumber: 12,
        cycleNumber: 3,
        cycleName: 'Florecimiento & Integración',
        phaseLabel: 'Estación 12 • Cierre Integral del Programa',
        title: 'Estación 12: ★ Integración Ontológica Definitiva & Carta de Innegociables',
        subtitle: 'Sello del Nuevo Observador y Pacto Sagrado de Coherencia de Vida',
        levelBadge: 'Nivel III • E12 Cierre',
        isMilestone: true,
        theoreticalFramework: {
          summary:
            'Hemos llegado a la cúspide de 12 estaciones formativas. En este encuentro final sellamos la Carta de Compromisos Innegociables: las 3 reglas sagradas que protegerás para no volver a caer en el piloto automático ni vulnerar tu dignidad.',
          keyConcepts: [
            {
              term: 'Carta de Innegociables',
              explanation: 'El pacto personal que define los estándares mínimos de respeto, descanso y coherencia.',
            },
            {
              term: 'Maestría Ontológica',
              explanation: 'No significa estar libre de quiebres, sino contar con la lucidez para regresar al centro con rapidez.',
            },
          ],
          ontologicalAxis: 'Cierre del proceso, celebración de la transformación y autonomía total.',
        },
        objective:
          'Firmar la Carta Magna de Compromisos Innegociables y certificar la culminación del acompañamiento ontológico integral.',
        tangibleOutcomes: [
          'Carta de Innegociables formalizada y descargable en PDF.',
          'Consolidación final de la bitácora con todas las memorias del proceso.',
          'Certificación de culminación del programa Certeza.',
        ],
        guidingQuestion: '¿Cuáles son tus 3 estándares innegociables de vida y cómo sostendrás tu nuevo observador?',
        somaticPractice: {
          title: 'El Ritual de Retorno al Centro',
          instruction: 'Mano en el pecho. Respira hondo. Recuérdate quién eras al inicio y quién eres hoy. Sonríe suavemente a tu propio camino de valentía.',
          frequency: 'Diaria como práctica permanente de vida',
          bodyAnchor: 'Todo el cuerpo integrado',
        },
        methodology: {
          linguistic: 'Declaración final de cierre y gratitud mutua.',
          somatic: 'Abrazo somático y soltura total.',
          emotional: 'Paz profunda, trascendencia y gozo.',
        },
        studyMaterials: [
          {
            title: 'Carta Magna de Compromisos Innegociables (PDF)',
            type: 'Ficha de Ejercicio',
            pages: '3 páginas',
            description: 'El pacto solemne de coherencia vital para el resto de la vida.',
          },
        ],
        googleMeetUrl: 'https://meet.google.com/rbc-sesion-s12',
        googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
        googleFormsLabel: 'Bitácora Sesiones B2B Final de Cierre (Google Forms)',
        googleSheetsReference: 'bitacora_sesiones_b2b',
        defaultDateLabel: 'Semana 23-24',
      },
    ],
  },
];
