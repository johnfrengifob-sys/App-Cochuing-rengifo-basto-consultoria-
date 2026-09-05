import { OntologicalExperience, UniversalExperienceBlock } from '../types';

export const CURATED_EXPERIENCE_PHOTOS = [
  {
    title: 'Raíz Somática (Presencia y Tierra)',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
    tags: ['Cuerpo', 'Respiración', 'Tierra'],
  },
  {
    title: 'Tallo Lingüístico (Diálogo y Reencuadre)',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
    tags: ['Lenguaje', 'Escucha', 'Claridad'],
  },
  {
    title: 'Florecimiento (Acción y Propósito)',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80',
    tags: ['Expansión', 'Liderazgo', 'Integración'],
  },
  {
    title: 'Arqueología Interior (Pausa Silenciosa)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80',
    tags: ['Indagación', 'Quietud', 'Reflexión'],
  },
  {
    title: 'Círculo de Almas (Encuentro Consciente)',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    tags: ['Comunidad', 'Vulnerabilidad', 'Soberanía'],
  },
  {
    title: 'Montaña y Horizonte (Retiro Ontológico)',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    tags: ['Retiro', 'Inmersión', 'Perspectiva'],
  },
];

export const DEFAULT_UNIVERSAL_BLOCK_TEMPLATES: Record<
  'welcome' | 'inquiry' | 'action',
  Omit<UniversalExperienceBlock, 'id'>
> = {
  welcome: {
    type: 'welcome',
    title: 'Bloque de Bienvenida: Encuadre & Presencia',
    subtitle: 'Apertura del contenedor ontológico y sintonización de estados basales',
    content:
      'Iniciamos silenciando el juicio automático y abriendo la escucha tridimensional (lenguaje, corporalidad y emoción). Este espacio está resguardado por acuerdos éticos de confidencialidad y respeto mutuo.',
    actionLabel: 'Sintonizar Presencia',
  },
  inquiry: {
    type: 'inquiry',
    title: 'Bloque de Indagación: Preguntas de Quiebre',
    subtitle: 'Exploración profunda de la transparencia y las narrativas condicionantes',
    content:
      'Indagamos en el observador que estás siendo frente a las circunstancias actuales. Desarticulamos certezas ilusorias para dar paso al aprendizaje reflexivo.',
    questions: [
      '¿Qué costo emocional y vincular estás asumiendo al mantener esta situación sin declarar un quiebre?',
      '¿Qué juicio maestro sobre ti mismo te impide tomar la decisión que sabes que corresponde?',
      '¿Qué te revela tu cuerpo en este preciso instante respecto a tus límites?',
    ],
  },
  action: {
    type: 'action',
    title: 'Bloque de Acción: Acuerdos & Micro-práctica',
    subtitle: 'Encarnación del nuevo observador en compromisos innegociables',
    content:
      'La transformación no concluye en la comprensión teórica; se sella en la acción coherente. Definimos un protocolo simple de autoasistencia para sostener esta semana.',
    actionLabel: 'Confirmar Acuerdo Ontológico',
  },
};

export const INITIAL_EXPERIENCES: OntologicalExperience[] = [
  // =========================================================================
  // 1. TALLER I: RAÍZ
  // =========================================================================
  {
    id: 'exp-taller-1-raiz',
    type: 'workshop',
    badgeLabel: 'Estación 01',
    step: 1,
    title: 'Raíz: Deconstrucción Somática & Emociones',
    subtitle: 'Reconocer la raíz corporal, mapeo de la transparencia y decodificación de límites.',
    category: 'Taller Vivencial Grupal',
    meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
    colorPhotoUrl:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
    dateStr: 'Sábado, 12 de Septiembre • 7:00 PM',
    guidingQuestions: [
      '¿En qué áreas de tu vida estás diciendo "Sí" por complacencia cuando tu cuerpo grita "Basta"?',
      '¿Cuál es el costo somático, emocional y relacional de intentar controlarlo todo?',
      '¿Qué emoción o mandato invisible te acompaña al iniciar este espacio?',
    ],
    blocks: [
      {
        id: 'blk-t1-welcome',
        type: 'welcome',
        title: 'Bloque de Bienvenida: Encuadre Somático',
        subtitle: 'El cuerpo como testigo ontológico',
        content:
          'Damos apertura al viaje experiencial. Dejamos de lado las explicaciones racionales para conectar con las sensaciones viscerales y el pulso real de nuestros límites.',
      },
      {
        id: 'blk-t1-inquiry',
        type: 'inquiry',
        title: 'Bloque de Indagación: Mapeo de la Transparencia',
        subtitle: 'Decodificación de quiebres ocultos y automatismos de complacencia',
        content:
          'Exploramos las fugas de energía cotidiana donde la sobre-exigencia ha reemplazado al autocuidado consciente.',
        questions: [
          '¿Dónde sientes en el cuerpo la palabra "No" que no has pronunciado?',
          '¿Qué miedo aparece si dejas de responder inmediatamente a las demandas externas?',
        ],
      },
      {
        id: 'blk-t1-action',
        type: 'action',
        title: 'Bloque de Acción: Proclamación del "Basta"',
        subtitle: 'Fundación del nuevo observador somático',
        content:
          'Compromiso formal con una micro-práctica de pausa respiratoria consciente de 90 segundos 3 veces al día.',
        actionLabel: 'Sellar Compromiso de Pausa',
      },
    ],
    isPublished: true,
    isTemplate: false,
    updatedAt: new Date().toISOString(),
  },

  // =========================================================================
  // 2. TALLER II: TALLO
  // =========================================================================
  {
    id: 'exp-taller-2-tallo',
    type: 'workshop',
    badgeLabel: 'Estación 02',
    step: 2,
    title: 'Tallo: Lenguaje, Juicios & Reencuadre',
    subtitle: 'Deconstrucción de narrativas limitantes, actos lingüísticos y diseño de conversaciones.',
    category: 'Taller Vivencial Grupal',
    meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
    colorPhotoUrl:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
    dateStr: 'Sábado, 19 de Septiembre • 7:00 PM',
    guidingQuestions: [
      '¿Qué frase o narrativa repetitiva sobre ti mismo está condicionando las decisiones que evitas?',
      '¿Cuál es el juicio maestro que subyace detrás de tu sensación de estancamiento?',
      '¿Qué declaración fundamental requiere pronunciar tu liderazgo en este momento?',
    ],
    blocks: [
      {
        id: 'blk-t2-welcome',
        type: 'welcome',
        title: 'Bloque de Bienvenida: El Poder Creador de la Palabra',
        subtitle: 'El lenguaje no solo describe realidades, las engendra',
        content:
          'Reconocemos cómo las afirmaciones, juicios y declaraciones han edificado la estructura de nuestra identidad operativa.',
      },
      {
        id: 'blk-t2-inquiry',
        type: 'inquiry',
        title: 'Bloque de Indagación: Desarticulación de Juicios Maestros',
        subtitle: 'Auditoría ontológica de las etiquetas impuestas',
        content:
          'Sometemos a escrutinio las certezas limitantes para diferenciar hechos comprobables de opiniones heredadas.',
        questions: [
          '¿Quién te enseñó a dudar de tu propia autoridad o suficiencia?',
          '¿Qué conversación difícil has venido posponiendo por evitar el conflicto?',
        ],
      },
      {
        id: 'blk-t2-action',
        type: 'action',
        title: 'Bloque de Acción: Diseño de Conversaciones Impecables',
        subtitle: 'Acuerdos relacionales claros',
        content:
          'Pautar y sostener una conversación de quiebre pendiente antes de la siguiente sesión.',
        actionLabel: 'Activar Protocolo Lingüístico',
      },
    ],
    isPublished: true,
    isTemplate: false,
    updatedAt: new Date().toISOString(),
  },

  // =========================================================================
  // 3. TALLER III: FLORECIMIENTO
  // =========================================================================
  {
    id: 'exp-taller-3-florecimiento',
    type: 'workshop',
    badgeLabel: 'Estación 03',
    step: 3,
    title: 'Florecimiento: Acción, Propósito & Coherencia',
    subtitle: 'Encarnar la transformación: mapa de decisiones conscientes y acuerdos innegociables.',
    category: 'Taller Vivencial Grupal',
    meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
    colorPhotoUrl:
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80',
    dateStr: 'Sábado, 26 de Septiembre • 7:00 PM',
    guidingQuestions: [
      '¿Qué decisiones coherentes con tu nuevo observador tomarás en los próximos 30 días?',
      '¿Cómo se manifiesta tu propósito cuando dejas de operar desde la reactividad automática?',
      '¿Cuáles son tus acuerdos innegociables para sostener tu florecimiento relacional?',
    ],
    blocks: [
      {
        id: 'blk-t3-welcome',
        type: 'welcome',
        title: 'Bloque de Bienvenida: Integración Tridimensional',
        subtitle: 'Cuerpo, emoción y lenguaje al servicio del propósito',
        content:
          'Consolidamos el mapa evolutivo y celebramos la soberanía conquistada a lo largo del trayecto.',
      },
      {
        id: 'blk-t3-inquiry',
        type: 'inquiry',
        title: 'Bloque de Indagación: La Carta de Innegociables',
        subtitle: 'Protección consciente de la nueva ecología de vida',
        content:
          'Definimos con nitidez qué situaciones, relaciones o ritmos de trabajo no volverás a permitir.',
        questions: [
          '¿Cuál es la promesa que te haces a ti mismo y que no volverás a traicionar?',
          '¿Desde qué estado de serenidad activa liderarás tus próximos desafíos?',
        ],
      },
      {
        id: 'blk-t3-action',
        type: 'action',
        title: 'Bloque de Acción: Consolidación y Certificación',
        subtitle: 'Descarga de Cuaderno de Memorias e Integración',
        content:
          'Generación del Cuaderno de Memorias oficial en PDF y proclamación final de soberanía personal.',
        actionLabel: 'Acceder a Cuaderno de Memorias',
      },
    ],
    isPublished: true,
    isTemplate: false,
    updatedAt: new Date().toISOString(),
  },

  // =========================================================================
  // 4. SESIÓN INDIVIDUAL 1 A 1: ARQUEOLOGÍA SOMÁTICA
  // =========================================================================
  {
    id: 'exp-sesion-1on1-transparencia',
    type: 'session_1on1',
    badgeLabel: 'Sesión 1 a 1',
    step: 1,
    title: 'Sesión 1 a 1: Arqueología Somática & Presencia',
    subtitle: 'Acompañamiento individual personalizado para desentrañar el quiebre medular.',
    category: 'Sesión Individual 1 a 1',
    meetUrl: 'https://meet.google.com/qmv-rbco-ses',
    colorPhotoUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80',
    dateStr: 'Agendamiento Personalizado (60 Minutos)',
    guidingQuestions: [
      '¿Qué está ocurriendo hoy en tu vida que no debería ocurrir, o qué no está ocurriendo que debería?',
      '¿Qué sientes en la garganta o el plexo solar cuando hablas de este asunto?',
      '¿Qué lección no aprendida se sigue repitiendo en tus relaciones clave?',
    ],
    blocks: [
      {
        id: 'blk-s1-welcome',
        type: 'welcome',
        title: 'Bloque de Bienvenida: Intimidad & Confidencialidad',
        subtitle: 'Espacio protegido para el descubrimiento honesto',
        content:
          'Una hora dedicada en exclusiva a ti. Silenciamos el rol profesional para encontrarnos con el ser humano.',
      },
      {
        id: 'blk-s1-inquiry',
        type: 'inquiry',
        title: 'Bloque de Indagación: Mapeo de Juicios Ocultos',
        subtitle: 'Calibración de la conversación interna',
        content:
          'Indagamos en los supuestos que das por ciertos y que están recortando tu campo de posibilidades.',
      },
      {
        id: 'blk-s1-action',
        type: 'action',
        title: 'Bloque de Acción: Compromiso de Coherencia Quincenal',
        subtitle: 'Pacto de acción individual',
        content:
          'Redactar un compromiso concreto de auto-observación para registrar en tu bitácora personal.',
        actionLabel: 'Agendar Encuentro por Meet',
      },
    ],
    isPublished: true,
    isTemplate: false,
    updatedAt: new Date().toISOString(),
  },

  // =========================================================================
  // 5. PLANTILLA BASE: RETIRO ONTOLÓGICO DE INMERSIÓN (FUTUROS FORMATOS)
  // =========================================================================
  {
    id: 'exp-template-retiro-inmersion',
    type: 'retreat',
    badgeLabel: 'Plantilla • Retiro',
    step: 1,
    title: 'Retiro Ontológico: Inmersión, Silencio & Arraigo',
    subtitle: 'Pausa profunda de fin de semana para directivos y líderes en busca de renovación.',
    category: 'Retiro Ontológico',
    meetUrl: 'https://meet.google.com/rbc-retiro-ontologico',
    colorPhotoUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    dateStr: 'Viernes a Domingo • Inmersión Presencial / Virtual',
    guidingQuestions: [
      '¿A qué ritmo estás viviendo y cuál es el precio que estás pagando por no detenerte?',
      '¿Quién eres cuando no tienes que resolver problemas ni cumplir expectativas ajenas?',
      '¿Qué claridad emerge del silencio sostenido?',
    ],
    blocks: [
      {
        id: 'blk-ret-welcome',
        type: 'welcome',
        title: 'Bloque de Bienvenida: El Despojo de la Prisa',
        subtitle: 'Apertura del silencio consciente',
        content:
          'Apagamos los dispositivos y nos sumergimos en la presencia pura. Ninguna agenda urgente tiene cabida aquí.',
      },
      {
        id: 'blk-ret-inquiry',
        type: 'inquiry',
        title: 'Bloque de Indagación: La Escucha de la Quietud',
        subtitle: 'Diálogo con la propia verdad interior',
        content:
          'Caminar en silencio, respirar el paisaje y permitir que el cuerpo hable sin la mediación del intelecto.',
      },
      {
        id: 'blk-ret-action',
        type: 'action',
        title: 'Bloque de Acción: Retorno a la Vida Cotidiana con Soberanía',
        subtitle: 'El pacto del silencio integrado',
        content:
          'Escribir la carta fundacional de retorno al entorno laboral y familiar con nuevos límites infranqueables.',
        actionLabel: 'Sellar Manifiesto del Retiro',
      },
    ],
    isPublished: false,
    isTemplate: true,
    templateName: 'Plantilla Base: Retiro Ontológico de Inmersión',
    updatedAt: new Date().toISOString(),
  },

  // =========================================================================
  // 6. PLANTILLA BASE: CÍRCULO DE LIDERAZGO CONSCIENTE (FUTUROS FORMATOS)
  // =========================================================================
  {
    id: 'exp-template-circulo-liderazgo',
    type: 'circle',
    badgeLabel: 'Plantilla • Círculo',
    step: 1,
    title: 'Círculo de Liderazgo: Autoridad Serena & Conversaciones Cruciales',
    subtitle: 'Comunidad de práctica directiva para sostener decisiones complejas desde la calma.',
    category: 'Círculo de Liderazgo',
    meetUrl: 'https://meet.google.com/rbc-circulo-liderazgo',
    colorPhotoUrl:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    dateStr: 'Miércoles Quincenales • 6:30 PM',
    guidingQuestions: [
      '¿Desde qué corporalidad estás comunicando tu visión en momentos de alta incertidumbre?',
      '¿Cómo sostienes a tu equipo sin absorber su ansiedad colectiva?',
      '¿Qué pedido audaz no te has atrevido a hacer por miedo a la negativa?',
    ],
    blocks: [
      {
        id: 'blk-cir-welcome',
        type: 'welcome',
        title: 'Bloque de Bienvenida: La Mesa Redonda de Soberanía',
        subtitle: 'Liderar entre pares sin máscaras ejecutivas',
        content:
          'Aquí no competimos por la razón; compartimos la vulnerabilidad del que toma decisiones difíciles cada día.',
      },
      {
        id: 'blk-cir-inquiry',
        type: 'inquiry',
        title: 'Bloque de Indagación: La Caja de Resonancia Ontológica',
        subtitle: 'Supervisión de quiebres directivos en vivo',
        content:
          'Un líder expone su dilema y el círculo espeja los juicios, emociones y puntos ciegos observados.',
      },
      {
        id: 'blk-cir-action',
        type: 'action',
        title: 'Bloque de Acción: El Acuerdo de Co-responsabilidad',
        subtitle: 'Acciones de liderazgo impecable',
        content:
          'Cada participante asume una conversación decisiva y rinde cuenta de su ejecución en el siguiente círculo.',
        actionLabel: 'Declarar Compromiso Directivo',
      },
    ],
    isPublished: false,
    isTemplate: true,
    templateName: 'Plantilla Base: Círculo de Liderazgo Directivo',
    updatedAt: new Date().toISOString(),
  },
];
