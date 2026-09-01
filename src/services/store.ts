import {
  User,
  Session,
  FormSubmission,
  AIInsight,
  PulseFlag,
  Prospect,
  ProspectStatus,
  ProgramNodeInfo,
  PaymentStatus,
  CronogramaEvent,
  EventRegistration,
} from '../types';
import promotionalEventBannerImg from '../assets/images/proximo_evento_banner_1788270380574.jpg';

export const COMPANY_INFO = {
  fullName: 'Rengifo Basto Consultoría Ontológica',
  shortName: 'Rengifo Basto',
  address: 'Crr 20bis # 65a-22',
  city: 'Bogotá, Colombia',
  phone: '3234642257',
  formattedPhone: '+57 323 464 2257',
  email: 'johnfrengifob@gmail.com',
  whatsappUrl: 'https://wa.me/573234642257',
};

export const PROGRAM_NODES: ProgramNodeInfo[] = [
  {
    step: 1,
    weekLabel: 'Semanas 1-2',
    level: 'Nivel I',
    levelTitle: 'Fundamentos & Transparencia',
    sessionTitle: 'Mapeo de la Transparencia y Quiebres Inconscientes',
    objective:
      'Identificar la transparencia cotidiana, los automatismos operativos y los quiebres no declarados en el ámbito profesional y personal para recuperar el poder de acción reflexiva.',
    tangibleOutcomes: [
      'Identificación precisa de las fugas de energía y automatismos en la rutina ejecutiva.',
      'Mapeo estructurado de quiebres ocultos y acuerdos tácitos no consensuados.',
      'Recuperación de la capacidad de pausar y observar antes de reaccionar compulsivamente.',
    ],
    keyQuestion:
      '¿En qué áreas de tu vida estás operando en piloto automático tolerando costos ocultos?',
    levelPrompt:
      'Registra los límites que has omitido declarar y los acuerdos tácitos que están drenando tu energía vital y directiva.',
    methodology: {
      linguistic: 'Diferenciación entre el fluir transparente y la declaración de quiebre como interrupción deliberada.',
      somatic: 'Calibración de la tensión muscular postural al momento de asumir compromisos automáticos.',
      emotional: 'Reconocimiento de la resignación y la sobrecarga como señales tempranas de falta de límites.',
    },
    dailyMicroPractice: {
      title: 'Pausa de Coherencia y Mapeo en 3 Tiempos',
      description: '3 veces al día, detente 90 segundos. Inhala profundo, escanea tu cuerpo y pregúntate: "¿Estoy operando por convicción o por inercia automática?" Anota cualquier quiebre no declarado.',
      frequency: 'Diaria (3 veces al día: 9:00 AM, 2:00 PM, 6:00 PM)',
    },
    reinforcementPack: {
      title: 'Kit de Auto-Observación y Transparencia Consciente',
      subtitle: 'Protocolo para desarticular la inercia reactiva y fundar el nuevo observador',
      summary: 'La transparencia es el flujo de la vida donde actuamos sin pensar. Cuando surge un obstáculo, aparece el quiebre. Si no lo declaramos, se convierte en sufrimiento crónico. Este refuerzo te entrega las herramientas para nombrar el quiebre con serenidad y certeza.',
      audioGuideTitle: 'Centramiento Somático y Despertar de la Transparencia',
      audioDuration: '8:45 min',
      audioScript: 'Cierra los ojos y trae tu atención al peso de tu cuerpo sobre el asiento. Inhala en 4 tiempos, sostén en 2 y exhala lentamente en 6. Observa el flujo de pensamientos sin apegarte. Nombra el quiebre principal que hoy te inquieta. Dale la bienvenida sin juzgarlo. Es la puerta hacia tu transformación.',
      keyPractices: [
        'Bitácora de Quiebres: Registra cada interrupción en tu flujo diario sin buscar soluciones inmediatas, sólo observando.',
        'La Pregunta de Soberanía: "¿Desde qué necesidad no dicha estoy aceptando este compromiso?"',
        'Protocolo de Higiene Lingüística: Evita frases absolutistas como "tengo que" y sustitúyelas por "elijo".',
      ],
      selfCareProtocol: 'Cuando sientas saturación inmediata, no respondas correos ni tomes decisiones. Bebe un vaso de agua, realiza 5 respiraciones conscientes y declara una pausa de 15 minutos.',
      reflectiveQuestions: [
        '¿A qué le estás diciendo "sí" cuando en realidad tu cuerpo te está pidiendo un rotundo "no"?',
        '¿Qué conversación difícil has estado posponiendo bajo la excusa de no tener tiempo?',
      ],
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
        description: 'Manual de micro-intervenciones de 2 minutos para el día a día directivo.',
      },
    ],
  },
  {
    step: 2,
    weekLabel: 'Semanas 3-4',
    level: 'Nivel I',
    levelTitle: 'Fundamentos & Transparencia',
    sessionTitle: 'Fronteras, Declaraciones y Límites No Dichos',
    objective:
      'Dominar el poder del "Basta" y del "No" ontológico como actos fundacionales de soberanía personal, cuidado del valor propio y dignidad en todas las relaciones.',
    tangibleOutcomes: [
      'Proclamación asertiva de límites claros sin culpa ni justificaciones excesivas.',
      'Erradicación del patrón de complacencia sistemática y sobre-adaptación.',
      'Diseño de conversaciones de frontera con colaboradores, clientes y entorno personal.',
    ],
    keyQuestion:
      '¿Qué conversación difícil has postergado y qué límite no dicho necesitas proclamar con firmeza?',
    levelPrompt:
      'Describe la conversación postergada y el "No" que requieres declarar para proteger tu dignidad, foco y bienestar integral.',
    methodology: {
      linguistic: 'Actos del habla declarativos: La declaración del "No", del "Basta" y del "Ignoro" como actos de poder.',
      somatic: 'Arraigo en planta de pies y apertura torácica para sostener la firmeza sin rigidez hostil.',
      emotional: 'Transformación de la culpa en auto-reparación y validación de las propias necesidades.',
    },
    dailyMicroPractice: {
      title: 'El Escudo de Soberanía Relacional',
      description: 'Antes de responder a cualquier petición demandante, toma una pausa de 5 segundos y responde: "Déjame revisarlo y te confirmo a las X horas". Elimina el sí automático.',
      frequency: 'Cada vez que recibas una petición imprevista',
    },
    reinforcementPack: {
      title: 'Protocolo de Declaraciones Fundamentales y Soberanía',
      subtitle: 'Guía práctica para emitir el "Basta" ontológico con elegancia y contundencia',
      summary: 'El límite no es un muro de agresión, sino el guardián de la calidad de tus vínculos. Quien no puede decir "No", tampoco puede comprometer un "Sí" genuino e impecable.',
      audioGuideTitle: 'Meditación Guiada: El Poder del Basta y Arraigo Corporal',
      audioDuration: '10:15 min',
      audioScript: 'Ponte de pie con los pies bien apoyados en el suelo. Siente la solidez de tu columna. Lleva tus manos al abdomen. Con cada exhalación, siente cómo afirmas tu territorio personal. Repite internamente: "Mi tiempo y mi energía son sagrados. Tengo derecho a poner límites claros y dignos".',
      keyPractices: [
        'Estructura de Declaración Limpia: "Agradezco la oportunidad, sin embargo, en este momento no es viable para mí".',
        'Desmantelamiento de la Justificación: Practica decir "No" sin dar más de una frase explicativa.',
        'Auditoría Semanal de Acuerdos: Revisa los viernes qué compromisos asumiste y ajusta las expectativas.',
      ],
      selfCareProtocol: 'Si experimentas culpa tras poner un límite, recuérdate que la culpa es solo el eco de una creencia antigua de complacencia, no una verdad moral.',
      reflectiveQuestions: [
        '¿Qué precio estás pagando en tu salud por no atreverte a decepcionar temporalmente a los demás?',
        '¿Cómo cambiaría tu liderazgo si comunicaras tus límites con total calma y sin miedo al rechazo?',
      ],
    },
    studyMaterials: [
      {
        title: 'Plantilla: Guion para Conversaciones Difíciles y Límites',
        type: 'Ficha de Ejercicio',
        pages: '3 páginas',
        description: 'Estructuras lingüísticas paso a paso para comunicar desacuerdos y límites sin confrontación destructiva.',
      },
      {
        title: 'Manual de Declaraciones Fundamentales de Vida',
        type: 'Guía de Trabajo',
        pages: '8 páginas',
        description: 'Estudio de las 6 declaraciones básicas del lenguaje generativo y su impacto relacional.',
      },
    ],
  },
  {
    step: 3,
    weekLabel: 'Semanas 5-6',
    level: 'Nivel II',
    levelTitle: 'Corporalidad & Reencuadre',
    sessionTitle: 'Somatización, Mandatos y Sabiduría de las Emociones',
    objective:
      'Decodificar los mensajes somáticos en el cuerpo reconociendo la sabiduría intrínseca de cada emoción (el miedo como prudencia, la culpa como auto-reparación y la exigencia como límite adaptativo).',
    tangibleOutcomes: [
      'Capacidad para escuchar el síntoma corporal como un mensajero inteligente antes de que somatice en enfermedad.',
      'Transformación de la autoexigencia tiránica en auto-asistencia y excelencia compasiva.',
      'Gestión de estados emocionales densos desde la aceptación y el rediseño corporal.',
    ],
    keyQuestion:
      '¿Qué emoción tiene una fuerte presencia en tu cuerpo hoy y qué señal adaptativa busca comunicarte?',
    levelPrompt:
      'Conecta con la sensación física exacta y decodifica el mensaje profundo de tu cuerpo sin juzgarlo ni intentar reprimirlo.',
    methodology: {
      linguistic: 'Reencuadre de mandatos introyectados ("debo ser perfecto", "no puedo fallar") a acuerdos de auto-cuidado.',
      somatic: 'Liberación de la tensión en mandíbula, diafragma y hombros mediante micro-movimientos somáticos.',
      emotional: 'Decodificación de la intención positiva de las emociones descalificadas.',
    },
    dailyMicroPractice: {
      title: 'Escaneo Somático de Liberación Maxilar y Torácica',
      description: 'Al inicio y final del día, realiza 3 minutos de respiración diafragmática mientras sueltas conscientemente la mandíbula y relajas los hombros hacia atrás.',
      frequency: '2 veces al día (mañana y noche)',
    },
    reinforcementPack: {
      title: 'Protocolo de Auto-asistencia y Desactivación de la Autoexigencia',
      subtitle: 'Cómo convertir al crítico interno en un aliado de discernimiento compasivo',
      summary: 'Las emociones no son fallas de carácter ni enemigos a vencer; son sistemas de alerta que nos informan sobre la relación entre nuestros recursos y nuestros desafíos. Aprender a escucharlas disuelve la tensión crónica.',
      audioGuideTitle: 'Audio-Inmersión: Decodificación Somática del Miedo y la Tensión',
      audioDuration: '12:30 min',
      audioScript: 'Lleva una mano a tu pecho y otra a tu abdomen. Respira suavemente. Ubica el nudo o tensión que más te pesa hoy. Pregúntale en silencio: "¿Qué valor estás intentando proteger? ¿Qué necesitas que yo atienda ahora mismo?" Escucha sin resistirte.',
      keyPractices: [
        'Diálogo de Auto-asistencia: Cuando surja la autocrítica, pregúntate: "¿Le hablaría así a alguien a quien amo profundamente?"',
        'Protocolo de Emergencia Emocional: 4 tiempos de inhalación, retención 4 tiempos, exhalación 4 tiempos, pausa vacía 4 tiempos (Box Breathing).',
        'Reencuadre del Miedo: Reconoce el miedo como un recordatorio de prepararte mejor, no como una señal de incapacidad.',
      ],
      selfCareProtocol: 'Si la autoexigencia te abruma, escribe en un papel todas las exigencias y clasifícalas en: "Imprescindibles hoy" y "Exigencias ideales que puedo reprogramar con dignidad".',
      reflectiveQuestions: [
        '¿Qué emoción has estado intentando ignorar y qué costo corporal has tenido que asumir por ello?',
        '¿Cómo sería tu desempeño si sustituyeras el látigo de la culpa por la guía del aprendizaje continuo?',
      ],
    },
    studyMaterials: [
      {
        title: 'Protocolo Somático: Mapeo de Estados Emocionales en el Cuerpo',
        type: 'Protocolo Somático',
        pages: '5 páginas',
        description: 'Guía visual para ubicar y liberar tensiones en diafragma, trapecios y plexo solar.',
      },
      {
        title: 'Compendio: La Inteligencia Adaptativa de las Emociones',
        type: 'Guía de Trabajo',
        pages: '7 páginas',
        description: 'Análisis detallado de la función protectora del miedo, la rabia, la culpa y la tristeza.',
      },
    ],
  },
  {
    step: 4,
    weekLabel: 'Semanas 7-8',
    level: 'Nivel II',
    levelTitle: 'Corporalidad & Reencuadre',
    sessionTitle: 'Reencuadre de Juicios, Reclamos y Promesas',
    objective:
      'Fundamentar juicios maestros limitantes y transformar la queja estéril en reclamos ontológicos y pedidos orientados a la coordinación de acciones impecables.',
    tangibleOutcomes: [
      'Eliminación de la queja pasiva y sustitución por pedidos estructurados con condiciones de satisfacción.',
      'Fundamentación rigurosa de juicios sobre uno mismo y sobre los demás.',
      'Cierre de ciclos de resentimiento y reconstrucción de la confianza relacional.',
    ],
    keyQuestion:
      '¿Qué juicio automático sobre ti o tu equipo estás tratando erróneamente como un hecho absoluto?',
    levelPrompt:
      'Distingue las afirmaciones comprobables de tus interpretaciones subjetivas y diseña un pedido impecable para destrabar la situación.',
    methodology: {
      linguistic: 'Los 5 pasos para fundamentar un juicio: Propósito, Estándar, Dominio de acción, Afirmaciones fácticas y Juicio contrario.',
      somatic: 'Postura de apertura y flexibilidad somática para abandonar el apego a la razón absoluta.',
      emotional: 'Tránsito del resentimiento a la aceptación activa y la paz relacional.',
    },
    dailyMicroPractice: {
      title: 'El Filtro de los 5 Fundamentos',
      description: 'Cada vez que te descubras emitiendo un juicio descalificador ("Este proyecto no funcionará", "Nunca me toman en cuenta"), escribe 3 hechos comprobables que lo sustenten y 3 que lo contradigan.',
      frequency: 'Diaria (ante cualquier juicio limitante)',
    },
    reinforcementPack: {
      title: 'Manual de Conversaciones Impecables y Coordinación de Acciones',
      subtitle: 'La anatomía del pedido, la oferta, la promesa y el reclamo productivo',
      summary: 'Gran parte de los conflictos humanos provienen de asumir que nuestros juicios son hechos reales. Cuando aprendemos a fundamentarlos y a formular pedidos impecables, las relaciones se vuelven fluidas y de alto rendimiento.',
      audioGuideTitle: 'Reflexión Guiada: De la Queja Improductiva al Reclamo con Dignidad',
      audioDuration: '9:15 min',
      audioScript: 'Inhala profundamente y trae a tu mente una situación donde sientas frustración con otra persona. Nota si hay una queja en tu mente. Transfórmala en un pedido claro: ¿Quién? ¿Qué acción específica? ¿En qué plazo de tiempo? ¿Bajo qué condiciones de satisfacción?',
      keyPractices: [
        'Estructura del Pedido Impecable: Yo te pido a ti X, para la fecha Y, con el estándar Z. ¿Aceptas, declinas o contraofertas?',
        'Protocolo de Reclamo Productivo: Hablar desde el compromiso compartido, no desde la inculpación moral.',
        'Auditoría de Promesas: Mantener un registro de lo prometido para cuidar la identidad pública de confiabilidad.',
      ],
      selfCareProtocol: 'Si notas rencor acumulado por una promesa rota, agenda una conversación de reclamo estructurado antes de que se convierta en resentimiento tóxico.',
      reflectiveQuestions: [
        '¿A quién le debes una disculpa o una renegociación de promesa que está dañando tu credibilidad?',
        '¿Qué juicio sobre ti mismo te ha mantenido en una zona de juego menor a tu verdadero potencial?',
      ],
    },
    studyMaterials: [
      {
        title: 'Matriz de Fundamentación de Juicios Maestros',
        type: 'Matriz de Diagnóstico',
        pages: '4 páginas',
        description: 'Herramienta para auditar los juicios automáticos de insuficiencia y transformarlos en motores de acción.',
      },
      {
        title: 'Guía Práctica: El Arte del Pedido, la Oferta y la Promesa Impecable',
        type: 'Guía de Trabajo',
        pages: '6 páginas',
        description: 'Protocolos de comunicación directiva de alta efectividad.',
      },
    ],
  },
  {
    step: 5,
    weekLabel: 'Semanas 9-10',
    level: 'Nivel III',
    levelTitle: 'Dirección & Trascendencia',
    sessionTitle: 'Diseño de Conversaciones de Futuro y Posibilidad',
    objective:
      'Proyectar escenarios de certeza interna, construyendo ofertas irresistibles y relaciones basadas en la confianza generativa y la soberanía ontológica.',
    tangibleOutcomes: [
      'Declaración clara de una nueva visión de futuro desprendida del miedo y la necesidad de aprobación.',
      'Diseño de ofertas profesionales y personales de alto valor percibido.',
      'Liderazgo generativo con capacidad para abrir posibilidades donde antes solo se percibían bloqueos.',
    ],
    keyQuestion:
      '¿Qué nueva identidad pública y profesional estás declarando para los próximos trimestres?',
    levelPrompt:
      'Escribe la visión de futuro que ahora te convoca, desprendida de la necesidad de complacer o controlar.',
    methodology: {
      linguistic: 'Declaraciones de visión, promesa de futuro y diseño de ofertas de valor transformacional.',
      somatic: 'Disposición corporal de avance, centramiento y presencia expansiva.',
      emotional: 'Entusiasmo sereno, ambición ética y gratitud generativa.',
    },
    dailyMicroPractice: {
      title: 'Visualización de Futuro y Enraizamiento de Posibilidad',
      description: 'Dedica los primeros 5 minutos de cada mañana a visualizar tu estado de ser ideal en tus conversaciones clave del día, sintiendo la certeza en tu cuerpo antes de interactuar.',
      frequency: 'Diaria (primeros 5 minutos del día)',
    },
    reinforcementPack: {
      title: 'Manifiesto de Identidad Pública y Diseño de Ofertas de Futuro',
      subtitle: 'Cómo proyectar autoridad serena y construir redes de confianza mutua',
      summary: 'El futuro no es un lugar hacia el que vamos, es una realidad que creamos en el presente a través de nuestras conversaciones, compromisos y declaraciones.',
      audioGuideTitle: 'Audio-Proyección: Anclaje de Certeza y Visión de Trascendencia',
      audioDuration: '11:00 min',
      audioScript: 'Respira conectando con tu centro. Siente tu cuerpo como un canal de coherencia. Visualízate liderando tus proyectos con total tranquilidad y convicción. Todo lo que necesitas para sostener tu visión ya está operando en tu nuevo observador.',
      keyPractices: [
        'Diseño de la Oferta Personal: Definir en una frase cuál es el valor diferencial irrepetible que aportas.',
        'Mapa de Conversaciones Clave: Identificar las 3 conversaciones estratégicas que abrirán tu próximo nivel de éxito.',
        'Desafío de la Posibilidad: Ante un problema aparentemente irresoluble, preguntar: "¿Qué conversación aún no ha ocurrido aquí?"',
      ],
      selfCareProtocol: 'Protege tu visión de la opinión no constructiva de observadores reactivos. Elige cuidadosamente tus círculos de confianza.',
      reflectiveQuestions: [
        '¿Qué estás dispuesto a soltar definitivamente para convertirte en la persona que tu visión requiere?',
        '¿Cuál es la oferta más valiosa que puedes hacer hoy a tu entorno profesional y personal?',
      ],
    },
    studyMaterials: [
      {
        title: 'Lienzo de Diseño de Identidad Pública y Oferta Única',
        type: 'Ficha de Ejercicio',
        pages: '4 páginas',
        description: 'Plantilla estructurada para redactar tu propuesta de valor y presencia ejecutiva.',
      },
      {
        title: 'Cuaderno: Conversaciones de Futuro y Arquitectura de Posibilidad',
        type: 'Guía de Trabajo',
        pages: '8 páginas',
        description: 'Técnicas avanzadas de indagación apreciativa y diseño ontológico de proyectos.',
      },
    ],
  },
  {
    step: 6,
    weekLabel: 'Semanas 11-12',
    level: 'Nivel III',
    levelTitle: 'Dirección & Trascendencia',
    sessionTitle: 'Integración Ontológica y Compromisos Innegociables',
    objective:
      'Consolidar el nuevo observador ontológico con protocolos de auto-asistencia permanente, estándares innegociables y coherencia lingüística, emocional y corporal.',
    tangibleOutcomes: [
      'Carta de Compromisos Innegociables firmada como pacto de coherencia vital.',
      'Protocolo personalizado de auto-coaching para afrontar quiebres futuros con autonomía total.',
      'Consolidación del aprendizaje ontológico como una forma permanente de habitar el mundo.',
    ],
    keyQuestion:
      '¿Cuáles son tus 3 estándares innegociables de vida y cómo sostendrás tu coherencia ontológica?',
    levelPrompt:
      'Sella tus compromisos definitivos y los hábitos de auto-observación que garantizarán tu autonomía y bienestar duradero.',
    methodology: {
      linguistic: 'Declaración de cierre de programa, promesas hacia uno mismo y formalización de pactos éticos.',
      somatic: 'Integración postural global: solidez, flexibilidad, apertura y centramiento sostenible.',
      emotional: 'Paz interna, gratitud trascendente y confianza incondicional en el propio proceso.',
    },
    dailyMicroPractice: {
      title: 'El Ritual de Coherencia y Cierre Diario',
      description: 'Al final de cada jornada, revisa tus 3 estándares innegociables. Agradece un acierto, reconoce un aprendizaje y declara el descanso como un acto sagrado de auto-cuidado.',
      frequency: 'Diaria (antes de dormir)',
    },
    reinforcementPack: {
      title: 'Compendio de Integración Ontológica y Carta de Innegociables',
      subtitle: 'Tu manual definitivo de auto-asistencia para sostener la transformación en el tiempo',
      summary: 'Has transitado de la inercia a la soberanía consciente. La verdadera maestría no consiste en no tener quiebres nunca más, sino en disponer de los recursos internos para regresar a tu centro cada vez más rápido y con mayor compasión.',
      audioGuideTitle: 'Audio-Meditación Final: El Retorno al Centro y la Coherencia Viva',
      audioDuration: '14:20 min',
      audioScript: 'Coloca ambas manos en el centro del pecho. Siente el latido vivo y sereno de tu corazón. Has recorrido un camino de 12 semanas descubriendo la profundidad de tu lenguaje, tu cuerpo y tus emociones. Eres ahora el observador soberano de tu propia vida. Camina con certeza, habla con verdad y vive con dignidad.',
      keyPractices: [
        'Auditoría Mensual de Coherencia: El primer domingo de cada mes, revisa tu estado en lenguaje, emoción y cuerpo.',
        'La Regla de los 3 Innegociables: Proteger sin excepciones el descanso, los límites claros y el espacio de reflexión.',
        'Rediseño Continuo: Ante cualquier nuevo quiebre, aplicar inmediatamente el ciclo de los 3 dominios ontológicos.',
      ],
      selfCareProtocol: 'Recuerda que la transformación ontológica es una espiral ascendente. Celebra tus avances y trátate con infinita amabilidad en los días desafiantes.',
      reflectiveQuestions: [
        '¿Quién eres hoy comparado con la persona que inició este proceso hace 12 semanas?',
        '¿Cuál es el legado de coherencia que eliges proyectar en cada espacio que habitas?',
      ],
    },
    studyMaterials: [
      {
        title: 'Carta Magna de Compromisos Innegociables',
        type: 'Ficha de Ejercicio',
        pages: '3 páginas',
        description: 'Documento formal para sellar los 3 estándares rectores de tu vida profesional y personal.',
      },
      {
        title: 'Manual Permanente de Auto-Asistencia Ontológica',
        type: 'Guía de Trabajo',
        pages: '12 páginas',
        description: 'Compendio integral de protocolos y herramientas para toda la vida.',
      },
    ],
  },
];

const INITIAL_PROSPECTS: Prospect[] = [
  {
    id: 'prosp-1',
    name: 'Carlos Mendoza',
    whatsapp: '+57 310 892 3411',
    email: 'carlos.mendoza@innovatech.co',
    status: 'matriz_enviada',
    origin: 'Conversatorio Raíz y Balance',
    notes: 'Descargó plantilla de WhatsApp tras conversatorio del jueves. Interesado en límites y delegación directiva.',
    matrixSentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'prosp-2',
    name: 'Valentina Ramos',
    whatsapp: '+57 315 442 1980',
    email: 'valentina.ramos@estudiolegal.com',
    status: 'matriz_enviada',
    origin: 'Conversatorio Raíz y Balance',
    notes: 'Socia de firma de abogados. Manifestó sobrecarga y falta de límites en clientes clave.',
    matrixSentAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 'prosp-3',
    name: 'Andrés Felipe Gómez',
    whatsapp: '+57 300 781 2299',
    email: 'afgomez@grupoandino.com',
    status: 'sesion_20min_agendada',
    origin: 'Conversatorio Raíz y Balance',
    notes: 'Agendó sesión de 20 min en Google Calendar para mañana 3:00 PM. Foco en quiebre vocacional y directivo.',
    matrixSentAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    session20minDate: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
  {
    id: 'prosp-4',
    name: 'Elena Santamaría',
    whatsapp: '+57 312 905 6677',
    email: 'elena.santamaria@retailcol.com',
    status: 'sesion_20min_agendada',
    origin: 'Conversatorio Raíz y Balance',
    notes: 'Sesión de 20 min agendada para el viernes 10:30 AM. Excelente perfil directivo.',
    matrixSentAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    session20minDate: new Date(Date.now() + 1000 * 60 * 60 * 44).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString(),
  },
  {
    id: 'prosp-5',
    name: 'Sofía Restrepo',
    whatsapp: '+57 318 200 4590',
    email: 'sofia.restrepo@example.com',
    status: 'convertido',
    origin: 'Conversatorio Raíz y Balance',
    notes: 'Cierre exitoso tras sesión de 20 min. Ingresó al programa 1 a 1.',
    matrixSentAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
    convertedAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 250).toISOString(),
  },
  {
    id: 'prosp-6',
    name: 'Mateo Valencia',
    whatsapp: '+57 301 654 8833',
    email: 'mateo.valencia@example.com',
    status: 'convertido',
    origin: 'Conversatorio Raíz y Balance',
    notes: 'Convertido con pago en 2 cuotas. Foco en comunicación asertiva con socios.',
    matrixSentAt: new Date(Date.now() - 1000 * 60 * 60 * 300).toISOString(),
    convertedAt: new Date(Date.now() - 1000 * 60 * 60 * 260).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 310).toISOString(),
  },
];

const INITIAL_USERS: User[] = [
  {
    uid: 'coach-1',
    name: 'John Fredy Rengifo Basto',
    email: 'johnfrengifob@gmail.com',
    role: 'coach',
    title: 'Consultor Ontológico Senior & Master Coach',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    joinedAt: '2023-01-10',
  },
  {
    uid: 'client-1',
    name: 'Sofía Restrepo',
    email: 'sofia.restrepo@example.com',
    role: 'client',
    title: 'Directora de Operaciones',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    joinedAt: '2024-02-15',
    programProgress: 3, // Currently on Session 3 (Nivel II: Corporalidad & Reencuadre)
    paymentStatus: 'Completado',
    programName: 'Certeza, Fronteras & Dirección Personal',
    programFee: '$1.500.000 COP',
  },
  {
    uid: 'client-2',
    name: 'Mateo Valencia',
    email: 'mateo.valencia@example.com',
    role: 'client',
    title: 'Fundador & Diseñador de Producto',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    joinedAt: '2024-03-01',
    programProgress: 2, // Currently on Session 2 (Nivel I: Fronteras y Límites No Dichos)
    paymentStatus: 'Cuota 1 de 2',
    programName: 'Certeza, Fronteras & Dirección Personal',
    programFee: '$1.500.000 COP',
  },
  {
    uid: 'client-3',
    name: 'Camila Duarte',
    email: 'camila.duarte@example.com',
    role: 'client',
    title: 'Líder de Transformación Digital',
    avatarUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    joinedAt: '2024-04-12',
    programProgress: 5, // Currently on Session 5 (Nivel III: Diseño de Futuro)
    paymentStatus: 'Pago Único',
    programName: 'Certeza, Fronteras & Dirección Personal',
    programFee: '$1.500.000 COP',
  },
];

const INITIAL_SESSIONS: Session[] = [
  {
    id: 'sess-103',
    clientId: 'client-1',
    sessionNumber: 3,
    date: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(), // Tomorrow afternoon
    meetLink: 'https://meet.google.com/rbc-onto-ses3',
    status: 'scheduled',
    notes: 'Sesión 3: Decodificación somática de la opresión en el pecho y mandatos de autoexigencia.',
  },
  {
    id: 'sess-102',
    clientId: 'client-1',
    sessionNumber: 2,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    meetLink: 'https://meet.google.com/rbc-onto-ses2',
    status: 'completed',
    notes: 'Sesión 2: Mapeo de límites no dichos y rediseño del "No" ontológico.',
  },
  {
    id: 'sess-101',
    clientId: 'client-1',
    sessionNumber: 1,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    meetLink: 'https://meet.google.com/rbc-onto-ses1',
    status: 'completed',
    notes: 'Sesión 1: Mapeo de la transparencia cotidiana y quiebres no declarados.',
  },
  {
    id: 'sess-202',
    clientId: 'client-2',
    sessionNumber: 2,
    date: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    meetLink: 'https://meet.google.com/rbc-onto-ses2',
    status: 'scheduled',
    notes: 'Sesión 2: Distinción entre juicios y hechos en las relaciones con socios.',
  },
  {
    id: 'sess-305',
    clientId: 'client-3',
    sessionNumber: 5,
    date: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    meetLink: 'https://meet.google.com/rbc-onto-ses5',
    status: 'scheduled',
    notes: 'Sesión 5: Declaración de nueva identidad y diseño de conversaciones de oferta.',
  },
];

const INITIAL_FORMS: FormSubmission[] = [
  {
    id: 'form-101',
    clientId: 'client-1',
    sessionId: 'sess-101',
    sessionStep: 1,
    level: 'Nivel I',
    bodyEmotion: 'Pesadez y fatiga en la espalda por intentar sostener todas las decisiones.',
    reflections: 'Reconocí que opero en transparencia creyendo que si no superviso todo, habrá caos.',
    levelSpecificAnswer: 'Límite no dicho: Aceptar reuniones fuera de horario sin quejarme abiertamente.',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 27).toISOString(),
  },
  {
    id: 'form-102',
    clientId: 'client-1',
    sessionId: 'sess-102',
    sessionStep: 2,
    level: 'Nivel I',
    bodyEmotion: 'Tensión en la garganta al momento de tener que decir "no es posible para este viernes".',
    reflections: 'Descubrí que asociaba el límite con la falta de compromiso, cuando en realidad es el guardián de la excelencia.',
    levelSpecificAnswer: 'Proclamé mi primer límite oficial con la junta directiva sobre tiempos de entrega.',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString(),
  },
];

const INITIAL_AI_INSIGHTS: AIInsight[] = [
  {
    id: 'insight-100',
    clientId: 'client-1',
    sessionId: 'sess-102',
    sessionStep: 2,
    linguisticBarriers: [
      'Confusión recurrente entre afirmaciones descriptivas y juicios automáticos no fundamentados.',
      'Generalizaciones absolutas: "si bajo la guardia, todo colapsará" (trampa de certeza lingüística).',
      'Predominio de peticiones pasivas e implícitas en lugar de reclamos y promesas ontológicamente estructuradas.',
    ],
    limitingBeliefs: [
      '"La vulnerabilidad es sinónimo de pérdida de autoridad e incompetencia"',
      '"El valor propio depende exclusivamente del control milimétrico sobre los resultados ajenos"',
      '"Cuidar de mí misma pone en riesgo el bienestar del colectivo"',
    ],
    emotionalWisdom:
      'La experiencia somática reportada evidencia una señal adaptativa que busca proteger un valor fundamental. La tensión en la mandíbula y el enojo no deben ser suprimidos sino escuchados: revelan un desbalance entre la autoexigencia idealizada y la capacidad humana disponible en este momento. La transformación ontológica requiere mutar el auto-reproche en discernimiento compasivo, rediseñando la conversación de pedidos y estableciendo límites con serenidad.',
    pulseFlag: 'Yellow',
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
    webhookStatus: 'sent',
  },
];

const INITIAL_CRONOGRAMA_EVENTS: CronogramaEvent[] = [
  {
    id: 'event-conversatorio-1',
    title: 'Conversatorio Raíz & Balance',
    subtitle: 'Fronteras, Límites No Dichos & Decodificación Somática',
    category: 'Conversatorio Quincenal',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // in 3 days
    displayDate: 'Jueves Próximo (Quincenal)',
    time: '7:00 PM - 8:30 PM (GMT-5)',
    mode: 'Online (Google Meet)',
    meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
    description:
      'Inmersión ontológica en vivo guiada por John Fredy Rengifo Basto. Abordaremos el mapeo de la transparencia cotidiana, la decodificación adaptativa de las emociones en el cuerpo y la proclamación del "Basta" como acto fundacional de dignidad y soberanía relacional.',
    imageUrl: promotionalEventBannerImg,
    aiPromptUsed:
      'High-end minimalist luxury advertising banner for an ontological coaching masterclass event named Raiz y Balance. Clean editorial aesthetic, subtle dark and warm neutral gradients, abstract geometric zen circle and botanical leaf silhouette, soft studio lighting, modern Swiss graphic design style, 8k resolution.',
    facilitator: 'John Fredy Rengifo Basto (Master Coach Ontológico)',
    spotsLeft: 8,
    totalSpots: 30,
    featured: true,
    status: 'upcoming',
  },
  {
    id: 'event-masterclass-2',
    title: 'Masterclass: La Sabiduría Adaptativa del Miedo y la Culpa',
    subtitle: 'Metodología de Autoasistencia Ontológica y Reencuadre Somático',
    category: 'Masterclass Ontológica',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 17).toISOString(),
    displayDate: 'Jueves 18 de Septiembre',
    time: '7:00 PM - 9:00 PM (GMT-5)',
    mode: 'Online (Google Meet)',
    meetUrl: 'https://meet.google.com/rbc-masterclass-ontologica',
    description:
      'Sesión especializada para directivos y líderes. Cómo transformar la autocrítica destructiva y la exigencia descalificadora en discernimiento compasivo, auto-asistencia y coordinación de acciones impecables.',
    imageUrl: promotionalEventBannerImg,
    aiPromptUsed:
      'Minimalist executive leadership conference banner with serene botanical shadow and zen layout.',
    facilitator: 'John Fredy Rengifo Basto',
    spotsLeft: 14,
    totalSpots: 25,
    featured: false,
    status: 'upcoming',
  },
];

const INITIAL_EVENT_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'reg-1',
    ticketCode: 'RBC-EVT-98421',
    eventId: 'event-1',
    eventTitle: 'Conversatorio: Límites, Quiebres & Soberanía Personal',
    eventDate: '2026-09-17T19:00:00.000Z',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@innovatech.co',
    phone: '+57 310 892 3411',
    registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    icfTermsAccepted: true,
    privacyTermsAccepted: true,
    attendedEvent: false,
    googleAuthConnected: true,
  },
  {
    id: 'reg-2',
    ticketCode: 'RBC-EVT-55129',
    eventId: 'event-1',
    eventTitle: 'Conversatorio: Límites, Quiebres & Soberanía Personal',
    eventDate: '2026-09-17T19:00:00.000Z',
    name: 'Valentina Ramos',
    email: 'valentina.ramos@estudiolegal.com',
    phone: '+57 315 442 1980',
    registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    icfTermsAccepted: true,
    privacyTermsAccepted: true,
    attendedEvent: false,
    googleAuthConnected: true,
  },
];

const STORAGE_KEYS = {
  USERS: 'rbc_users_v2',
  CURRENT_USER_ID: 'rbc_current_user_id_v2',
  PROSPECTS: 'rbc_prospects_v2',
  EVENT_REGISTRATIONS: 'rbc_event_registrations_v2',
  SESSIONS: 'rbc_sessions_v2',
  FORMS: 'rbc_forms_v2',
  AI_INSIGHTS: 'rbc_ai_insights_v2',
  CRONOGRAMA_EVENTS: 'rbc_cronograma_events_v2',
  WEBHOOK_URL: 'rbc_webhook_url_v2',
  MAKE_PHASE1_WEBHOOK_URL: 'rbc_make_phase1_webhook_url_v2',
  MAKE_PHASE2_CALENDLY_WEBHOOK_URL: 'rbc_make_phase2_calendly_webhook_url_v2',
  MAKE_PHASE3_PAYMENT_WEBHOOK_URL: 'rbc_make_phase3_payment_webhook_url_v2',
  WHATSAPP_TEMPLATE: 'rbc_whatsapp_template_v2',
  WELCOME_MESSAGE_TEMPLATE: 'rbc_welcome_message_template_v2',
  CALENDAR_URL: 'rbc_calendar_url_v2',
  MATRIX_URL: 'rbc_matrix_url_v2',
  PORTAL_URL: 'rbc_portal_url_v2',
  NEXT_LEVEL_PAYMENT_URL: 'rbc_next_level_payment_url_v2',
};

export const DEFAULT_WEBHOOK_URL =
  'https://hook.us1.make.com/WEBHOOK_PLACEHOLDER';

export const DEFAULT_MAKE_PHASE1_WEBHOOK =
  'https://hook.us1.make.com/rbc-conversatorio-phase1';

export const DEFAULT_MAKE_PHASE2_CALENDLY_WEBHOOK =
  'https://hook.us1.make.com/rbc-calendly-phase2';

export const DEFAULT_MAKE_PHASE3_PAYMENT_WEBHOOK =
  'https://hook.us1.make.com/rbc-payment-phase3';

export const DEFAULT_NEXT_LEVEL_PAYMENT_URL =
  'https://checkout.wompi.co/l/raiz-y-balance-next-level';

export const DEFAULT_CALENDAR_URL =
  'https://calendar.app.google/rbc-sesion-20min';

export const DEFAULT_MATRIX_URL =
  'https://drive.google.com/file/d/rbc-matriz-raiz-y-balance.pdf';

export const DEFAULT_PORTAL_URL =
  window.location.origin || 'https://raiz-y-balance.app';

export const DEFAULT_WHATSAPP_TEMPLATE = `Hola {{name}}, qué gusto saludarte tras el Conversatorio Raíz y Balance.

Aquí tienes tu acceso a la Matriz Ontológica de Fronteras y Límites:
👉 {{matrixUrl}}

Para ayudarte a decodificar tus resultados y estructurar tus declaraciones de soberanía personal, tienes habilitada una Sesión de Exploración de 20 minutos sin costo:
🗓️ {{calendarUrl}}

Un saludo,
John Fredy Rengifo Basto | Consultoría Ontológica`;

export const DEFAULT_WELCOME_MESSAGE_TEMPLATE = `Bienvenido/a al programa ontológico de 12 semanas "Certeza, Fronteras & Dirección Personal", {{name}}.

Hemos confirmado tu inversión ({{paymentStatus}}). Tu espacio personal de trabajo e introspección ya ha sido habilitado:
👉 {{portalUrl}}

Tu hoja de ruta inicia en el Nodo 1: Mapeo de la Transparencia & Decodificación Somática.
Puedes ingresar con tu correo registrado ({{email}}) para acceder a tus bitácoras de sesión y autorregistros guiados.

Un saludo,
John Fredy Rengifo Basto | Consultoría Ontológica`;

export class OntologicalStore {
  private static load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  static getProgramNodes(): ProgramNodeInfo[] {
    return PROGRAM_NODES;
  }

  static getCronogramaEvents(): CronogramaEvent[] {
    return this.load<CronogramaEvent[]>(
      STORAGE_KEYS.CRONOGRAMA_EVENTS,
      INITIAL_CRONOGRAMA_EVENTS
    );
  }

  static saveCronogramaEvents(events: CronogramaEvent[]): void {
    this.save(STORAGE_KEYS.CRONOGRAMA_EVENTS, events);
  }

  static getUpcomingEvent(): CronogramaEvent {
    const events = this.getCronogramaEvents();
    const upcoming = events.find((e) => e.status === 'upcoming' && e.featured);
    return upcoming || events[0] || INITIAL_CRONOGRAMA_EVENTS[0];
  }

  static updateCronogramaEvent(
    id: string,
    updates: Partial<CronogramaEvent>
  ): CronogramaEvent | null {
    const events = this.getCronogramaEvents();
    let updatedEvent: CronogramaEvent | null = null;
    const updated = events.map((e) => {
      if (e.id === id) {
        updatedEvent = { ...e, ...updates };
        return updatedEvent;
      }
      return e;
    });
    this.saveCronogramaEvents(updated);
    return updatedEvent;
  }

  // --- EVENT REGISTRATIONS & RSVP ---
  static getEventRegistrations(): EventRegistration[] {
    return this.load<EventRegistration[]>(
      STORAGE_KEYS.EVENT_REGISTRATIONS,
      INITIAL_EVENT_REGISTRATIONS
    );
  }

  static saveEventRegistrations(registrations: EventRegistration[]): void {
    this.save(STORAGE_KEYS.EVENT_REGISTRATIONS, registrations);
  }

  static registerForEvent(params: {
    eventId: string;
    name: string;
    email: string;
    phone: string;
    googleAuthConnected?: boolean;
  }): { registration: EventRegistration; user: User; prospect: Prospect } {
    const events = this.getCronogramaEvents();
    const targetEvent = events.find((e) => e.id === params.eventId) || events[0] || INITIAL_CRONOGRAMA_EVENTS[0];
    
    // Decrease spots left if available
    if (targetEvent.spotsLeft > 0) {
      this.updateCronogramaEvent(targetEvent.id, {
        spotsLeft: Math.max(1, targetEvent.spotsLeft - 1),
      });
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const ticketCode = `RBC-EVT-${randomSuffix}`;
    const regId = `reg-${Date.now()}`;

    // 1. Create or retrieve User account
    const users = this.getUsers();
    let existingUser = users.find(
      (u) => u.email.toLowerCase() === params.email.trim().toLowerCase()
    );

    if (!existingUser) {
      existingUser = {
        uid: `client-${Date.now()}`,
        name: params.name.trim(),
        email: params.email.trim().toLowerCase(),
        phone: params.phone.trim(),
        role: 'client',
        title: 'Asistente Seminario Ontológico',
        avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 99999999)}?auto=format&fit=crop&w=400&q=80`,
        joinedAt: new Date().toISOString().split('T')[0],
        programProgress: 1,
        paymentStatus: 'Pago Único',
        programName: 'Certeza, Fronteras & Dirección Personal',
        programFee: '$1.500.000 COP',
      };
      this.saveUsers([...users, existingUser]);
    }

    // 2. Create Event Registration
    const registrations = this.getEventRegistrations();
    const newRegistration: EventRegistration = {
      id: regId,
      ticketCode,
      eventId: targetEvent.id,
      eventTitle: targetEvent.title,
      eventDate: targetEvent.date,
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      phone: params.phone.trim(),
      registeredAt: new Date().toISOString(),
      icfTermsAccepted: true,
      privacyTermsAccepted: true,
      attendedEvent: false,
      userUid: existingUser.uid,
      googleAuthConnected: Boolean(params.googleAuthConnected),
    };
    this.saveEventRegistrations([newRegistration, ...registrations]);

    // 3. Add to CRM Prospects
    const prospects = this.getProspects();
    const existingProspect = prospects.find(
      (p) => p.email?.toLowerCase() === params.email.trim().toLowerCase()
    );

    let prospectResult: Prospect;
    if (existingProspect) {
      prospectResult = existingProspect;
    } else {
      prospectResult = this.addProspect({
        name: params.name.trim(),
        whatsapp: params.phone.trim(),
        email: params.email.trim().toLowerCase(),
        status: 'matriz_enviada',
        origin: `Pre-Registro: ${targetEvent.title}`,
        notes: `Inscrito al evento con aceptación ética ICF y privacidad Google/Gemini. Ticket: ${ticketCode}.`,
        matrixSentAt: new Date().toISOString(),
      });
    }

    return {
      registration: newRegistration,
      user: existingUser,
      prospect: prospectResult,
    };
  }

  static confirmEventAttendance(registrationId: string): {
    registration: EventRegistration | null;
    user: User | null;
  } {
    const registrations = this.getEventRegistrations();
    let targetReg: EventRegistration | null = null;

    const updatedRegistrations = registrations.map((r) => {
      if (r.id === registrationId || r.ticketCode === registrationId) {
        targetReg = { ...r, attendedEvent: true };
        return targetReg;
      }
      return r;
    });

    this.saveEventRegistrations(updatedRegistrations);

    let user: User | null = null;
    if (targetReg && (targetReg as EventRegistration).userUid) {
      const users = this.getUsers();
      user = users.find((u) => u.uid === (targetReg as EventRegistration).userUid) || null;
      if (user) {
        // Ensure user is in good standing
        this.saveUsers(users);
      }
    }

    return {
      registration: targetReg,
      user,
    };
  }

  static getUsers(): User[] {
    const rawUsers = this.load<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    // Ensure coach profile is always accurately named
    return rawUsers.map((u) => {
      if (u.uid === 'coach-1' || u.role === 'coach') {
        return {
          ...u,
          name: 'John Fredy Rengifo Basto',
        };
      }
      return u;
    });
  }

  static saveUsers(users: User[]): void {
    this.save(STORAGE_KEYS.USERS, users);
  }

  static getCurrentUser(): User | null {
    const users = this.getUsers();
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) {
      return null;
    }
    return users.find((u) => u.uid === currentId) || null;
  }

  static setCurrentUser(uid: string | null): void {
    if (uid) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, uid);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }

  // --- PROSPECTS CRM LOGIC ---
  static getProspects(): Prospect[] {
    return this.load<Prospect[]>(STORAGE_KEYS.PROSPECTS, INITIAL_PROSPECTS);
  }

  static saveProspects(prospects: Prospect[]): void {
    this.save(STORAGE_KEYS.PROSPECTS, prospects);
  }

  static addProspect(data: Omit<Prospect, 'id' | 'createdAt'>): Prospect {
    const prospects = this.getProspects();
    const newProspect: Prospect = {
      ...data,
      id: 'prosp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.saveProspects([newProspect, ...prospects]);
    return newProspect;
  }

  static updateProspectStatus(
    id: string,
    newStatus: ProspectStatus,
    sessionDate?: string
  ): Prospect | null {
    const prospects = this.getProspects();
    let result: Prospect | null = null;
    const updated = prospects.map((p) => {
      if (p.id === id) {
        result = {
          ...p,
          status: newStatus,
          session20minDate: sessionDate || p.session20minDate,
          convertedAt:
            newStatus === 'convertido' ? new Date().toISOString() : p.convertedAt,
          matrixSentAt:
            newStatus === 'matriz_enviada' && !p.matrixSentAt
              ? new Date().toISOString()
              : p.matrixSentAt,
        };
        return result;
      }
      return p;
    });
    this.saveProspects(updated);
    return result;
  }

  static convertProspectToClient(
    prospectId: string,
    paymentStatus: PaymentStatus = 'Completado'
  ): User | null {
    const prospects = this.getProspects();
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) return null;

    // Update prospect status to 'convertido'
    this.updateProspectStatus(prospectId, 'convertido');

    // Create client user
    const users = this.getUsers();
    const newClientId = 'client-' + Date.now();
    const newClient: User = {
      uid: newClientId,
      name: prospect.name,
      email: prospect.email || `${prospect.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: prospect.whatsapp,
      role: 'client',
      title: 'Cliente Programa Certeza',
      avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 99999999)}?auto=format&fit=crop&w=400&q=80`,
      joinedAt: new Date().toISOString().split('T')[0],
      programProgress: 1, // Start on Session 1 (Nivel I)
      paymentStatus: paymentStatus,
      programName: 'Certeza, Fronteras & Dirección Personal',
      programFee: '$1.500.000 COP',
    };

    this.saveUsers([...users, newClient]);

    // Create first scheduled session
    const sessions = this.getSessions();
    const firstSession: Session = {
      id: 'sess-' + Date.now(),
      clientId: newClientId,
      sessionNumber: 1,
      date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      meetLink: `https://meet.google.com/rbc-${Math.random().toString(36).substring(2, 7)}`,
      status: 'scheduled',
      notes: 'Sesión 1: Mapeo de la Transparencia y Quiebres Inconscientes.',
    };
    this.save(STORAGE_KEYS.SESSIONS, [...sessions, firstSession]);

    return newClient;
  }

  static advanceClientProgress(clientId: string): User | null {
    const users = this.getUsers();
    let updatedUser: User | null = null;
    const updatedUsers = users.map((u) => {
      if (u.uid === clientId) {
        const nextProgress = Math.min(6, (u.programProgress || 1) + 1);
        updatedUser = { ...u, programProgress: nextProgress };
        return updatedUser;
      }
      return u;
    });
    if (updatedUser) {
      this.saveUsers(updatedUsers);
    }
    return updatedUser;
  }

  static unlockNodeForClient(
    clientId: string,
    targetStep: number,
    paymentStatus: PaymentStatus = 'Completado'
  ): User | null {
    const users = this.getUsers();
    let updatedUser: User | null = null;
    const updatedUsers = users.map((u) => {
      if (u.uid === clientId) {
        const nextProgress = Math.max(u.programProgress || 1, targetStep);
        updatedUser = {
          ...u,
          programProgress: nextProgress,
          paymentStatus: paymentStatus,
        };
        return updatedUser;
      }
      return u;
    });

    if (updatedUser) {
      this.saveUsers(updatedUsers);

      // Create scheduled session for this newly unlocked step if none exists
      const sessions = this.getSessions();
      const hasSessionForStep = sessions.some(
        (s) => s.clientId === clientId && s.sessionNumber === targetStep
      );

      if (!hasSessionForStep) {
        const nodeInfo =
          PROGRAM_NODES.find((n) => n.step === targetStep) || PROGRAM_NODES[0];
        const newSession: Session = {
          id: 'sess-' + Date.now(),
          clientId: clientId,
          sessionNumber: targetStep,
          date: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
          meetLink: `https://meet.google.com/rbc-${Math.random().toString(36).substring(2, 7)}`,
          status: 'scheduled',
          notes: `Sesión ${targetStep}: ${nodeInfo.sessionTitle}.`,
        };
        this.saveSessions([...sessions, newSession]);
      }
    }

    return updatedUser;
  }

  // --- SESSIONS ---
  static getSessions(): Session[] {
    return this.load<Session[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
  }

  static saveSessions(sessions: Session[]): void {
    this.save(STORAGE_KEYS.SESSIONS, sessions);
  }

  static getSessionsForClient(clientId: string): Session[] {
    return this.getSessions().filter((s) => s.clientId === clientId);
  }

  static getNextSessionForClient(clientId: string): Session | null {
    const clientSessions = this.getSessionsForClient(clientId)
      .filter((s) => s.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return clientSessions[0] || null;
  }

  // --- FORMS ---
  static getForms(): FormSubmission[] {
    return this.load<FormSubmission[]>(STORAGE_KEYS.FORMS, INITIAL_FORMS);
  }

  static getFormsForClient(clientId: string): FormSubmission[] {
    return this.getForms()
      .filter((f) => f.clientId === clientId)
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
  }

  static getFormForStep(
    clientId: string,
    step: number
  ): FormSubmission | null {
    const forms = this.getFormsForClient(clientId);
    return forms.find((f) => f.sessionStep === step) || null;
  }

  static getLatestFormForClient(clientId: string): FormSubmission | null {
    const forms = this.getFormsForClient(clientId);
    return forms[0] || null;
  }

  static submitForm(
    data: Omit<FormSubmission, 'id' | 'submittedAt'>
  ): FormSubmission {
    const allForms = this.getForms();
    const newForm: FormSubmission = {
      ...data,
      id: 'form-' + Date.now(),
      submittedAt: new Date().toISOString(),
    };
    const updated = [newForm, ...allForms];
    this.save(STORAGE_KEYS.FORMS, updated);

    // Auto-advance client progress if appropriate
    this.advanceClientProgress(data.clientId);

    return newForm;
  }

  // --- AI INSIGHTS ---
  static getAIInsights(): AIInsight[] {
    return this.load<AIInsight[]>(
      STORAGE_KEYS.AI_INSIGHTS,
      INITIAL_AI_INSIGHTS
    );
  }

  static getInsightsForClient(clientId: string): AIInsight[] {
    return this.getAIInsights()
      .filter((i) => i.clientId === clientId)
      .sort(
        (a, b) =>
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
  }

  static getLatestInsightForClient(clientId: string): AIInsight | null {
    const insights = this.getInsightsForClient(clientId);
    return insights[0] || null;
  }

  static saveAIInsight(insight: AIInsight): void {
    const insights = this.getAIInsights();
    const updated = [insight, ...insights.filter((i) => i.id !== insight.id)];
    this.save(STORAGE_KEYS.AI_INSIGHTS, updated);
  }

  static getWebhookUrl(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.WEBHOOK_URL) || DEFAULT_WEBHOOK_URL
    );
  }

  static setWebhookUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.WEBHOOK_URL, url);
  }

  /**
   * Generates or dispatches AI Ontological analysis based on the three ontological domains (Linguistic, Emotional, Somatic)
   * Calls Make.com webhook via POST with payload: { clientId, bodyEmotion, reflections }
   */
  static async triggerAIAnalysisWebhook(
    clientId: string,
    form: FormSubmission
  ): Promise<{ insight: AIInsight; webhookDispatched: boolean; error?: string }> {
    const webhookUrl = this.getWebhookUrl();
    const payload = {
      clientId: form.clientId,
      sessionId: form.sessionId,
      sessionStep: form.sessionStep,
      level: form.level,
      bodyEmotion: form.bodyEmotion,
      reflections: form.reflections,
      levelSpecificAnswer: form.levelSpecificAnswer || '',
      submittedAt: form.submittedAt,
      programName: 'Certeza, Fronteras & Dirección Personal',
      requestedAt: new Date().toISOString(),
    };

    let webhookSuccess = false;
    let webhookError: string | undefined;

    // Attempt webhook dispatch
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        webhookSuccess = true;
      } else {
        webhookError = `HTTP ${res.status}: ${res.statusText}`;
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexión';
      webhookError = errorMsg.includes('abort')
        ? 'Tiempo de espera agotado (Timeout 6s)'
        : errorMsg;
    }

    // Determine ontological analysis synthesizing bodily emotion & reflections
    const analyzed = this.synthesizeOntologicalAnalysis(form);

    const newInsight: AIInsight = {
      id: 'insight-' + Date.now(),
      clientId,
      sessionId: form.sessionId,
      sessionStep: form.sessionStep,
      linguisticBarriers: analyzed.linguisticBarriers,
      limitingBeliefs: analyzed.limitingBeliefs,
      emotionalWisdom: analyzed.emotionalWisdom,
      pulseFlag: analyzed.pulseFlag,
      generatedAt: new Date().toISOString(),
      webhookStatus: webhookSuccess ? 'sent' : 'fallback',
    };

    this.saveAIInsight(newInsight);

    return {
      insight: newInsight,
      webhookDispatched: webhookSuccess,
      error: webhookError,
    };
  }

  /**
   * Synthesizes Ontological Coaching diagnosis across linguistic, emotional, and somatic coherence
   */
  private static synthesizeOntologicalAnalysis(form: FormSubmission): {
    linguisticBarriers: string[];
    limitingBeliefs: string[];
    emotionalWisdom: string;
    pulseFlag: PulseFlag;
  } {
    const text = (
      form.bodyEmotion +
      ' ' +
      form.reflections +
      ' ' +
      (form.levelSpecificAnswer || '')
    ).toLowerCase();

    // Ontological assessment rules
    let pulse: PulseFlag = 'Green';
    if (
      text.includes('colaps') ||
      text.includes('angustia') ||
      text.includes('insoportable') ||
      text.includes('pánico') ||
      text.includes('crisis')
    ) {
      pulse = 'Red';
    } else if (
      text.includes('miedo') ||
      text.includes('control') ||
      text.includes('pecho') ||
      text.includes('mandíbula') ||
      text.includes('culpa') ||
      text.includes('rabia') ||
      text.includes('tensión') ||
      text.includes('límite')
    ) {
      pulse = 'Yellow';
    }

    let barriers = [
      'Incongruencia entre la narrativa discursiva y la somatización corporal observada.',
      'Rigidez en los actos ilocucionarios: déficit de peticiones asertivas y exceso de quejas improductivas.',
      'Fusión cognitiva: interpretar el juicio de insuficiencia personal como una propiedad ontológica inmutable.',
    ];

    let beliefs = [
      '"Si no controlo todas las variables de mi entorno, quedo a merced del fracaso"',
      '"Mostrar cansancio o vulnerabilidad invalida mi autoridad profesional"',
      '"Pedir ayuda implica una renuncia a mi propia capacidad y valor"',
    ];

    let ontologicalText =
      'La experiencia somática reportada evidencia una señal adaptativa que busca proteger un valor fundamental. La tensión no debe ser suprimida sino escuchada: revela un desbalance entre la autoexigencia idealizada y la capacidad humana disponible. El trabajo ontológico se orienta a transformar la autocrítica punitiva en un diálogo compasivo de auto-asistencia, soberanía y rediseño conversacional.';

    if (
      text.includes('mandíbula') ||
      text.includes('exigencia') ||
      text.includes('control')
    ) {
      barriers = [
        'Confusión entre juicios de posibilidad y hechos objetivos inmodificables.',
        'Generalización absolutista en el lenguaje ("siempre", "nunca", "todo colapsará").',
        'Carencia de ofertas y pedidos explícitos orientados a la coordinación de acciones efectivas.',
      ];
      beliefs = [
        '"Mi valor como líder radica en soportar la carga sin delegar el control"',
        '"La pausa es sinónimo de holgazanería o debilidad"',
        '"Debo anticiparme a todos los escenarios adversos para ser digno de confianza"',
      ];
      ontologicalText =
        'La autoexigencia detectada opera como una fuerza interna que descalifica los recursos reales disponibles por intentar alcanzar estándares ideales. El síntoma corporal (tensión maxilar y torácica) es la voz del cuerpo reclamando coherencia y balance. La intervención ontológica consiste en validar la intención positiva de excelencia mientras se erradica el método descalificador y punitivo.';
    } else if (
      text.includes('plexo') ||
      text.includes('miedo') ||
      text.includes('respiración')
    ) {
      barriers = [
        'Declaraciones de incompetencia prematuras ante situaciones de exposición pública.',
        'Ausencia de fundamentación rigurosa en los juicios automáticos de rechazo.',
        'Bloqueo en el compromiso lingüístico para declarar quiebres oportunos.',
      ];
      beliefs = [
        '"La mirada del otro determina mi solvencia ontológica"',
        '"El miedo es una falla de carácter que debe ocultarse a toda costa"',
        '"Si cometo un error, quedaré excluido de la comunidad de pertenencia"',
      ];
      ontologicalText =
        'El miedo experimentado opera como un mensajero adaptativo de prudencia que alerta sobre una desproporción entre la magnitud del desafío y los recursos percibidos. Lejos de ser un enemigo a reprimir, el miedo convoca al desarrollo de nuevas competencias conversacionales y corporales para equiparar la demanda exterior con serenidad y maestría.';
    }

    return {
      linguisticBarriers: barriers,
      limitingBeliefs: beliefs,
      emotionalWisdom: ontologicalText,
      pulseFlag: pulse,
    };
  }

  // --- MAKE.COM PHASE 1 (FUNNEL & ATTRACTION) AUTOMATION METHODS ---
  static getPhase1WebhookUrl(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.MAKE_PHASE1_WEBHOOK_URL) ||
      DEFAULT_MAKE_PHASE1_WEBHOOK
    );
  }

  static setPhase1WebhookUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.MAKE_PHASE1_WEBHOOK_URL, url);
  }

  static getWhatsAppTemplate(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.WHATSAPP_TEMPLATE) ||
      DEFAULT_WHATSAPP_TEMPLATE
    );
  }

  static setWhatsAppTemplate(template: string): void {
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_TEMPLATE, template);
  }

  static getCalendarUrl(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.CALENDAR_URL) || DEFAULT_CALENDAR_URL
    );
  }

  static setCalendarUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.CALENDAR_URL, url);
  }

  static getMatrixUrl(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.MATRIX_URL) || DEFAULT_MATRIX_URL
    );
  }

  static setMatrixUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.MATRIX_URL, url);
  }

  static generateWhatsAppMessage(name: string): string {
    const template = this.getWhatsAppTemplate();
    const calendarUrl = this.getCalendarUrl();
    const matrixUrl = this.getMatrixUrl();

    return template
      .replace(/\{\{name\}\}/g, name || 'Participante')
      .replace(/\{\{nombre\}\}/g, name || 'Participante')
      .replace(/\{\{calendarUrl\}\}/g, calendarUrl)
      .replace(/\{\{matrixUrl\}\}/g, matrixUrl);
  }

  /**
   * Dispatches or simulates the linear 3-module Make scenario:
   * Module 1: Webhooks (Custom Webhook) receives name and whatsapp
   * Module 2: Firestore creates document in 'prospects'
   * Module 3: WhatsApp Business Cloud sends formatted message
   */
  static async triggerMakePhase1Inbound(data: {
    name: string;
    whatsapp: string;
    email?: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    prospect: Prospect;
    webhookDispatched: boolean;
    messageSent: string;
    firestoreDocCreated: {
      collection: string;
      docId: string;
      fields: Record<string, unknown>;
    };
    error?: string;
  }> {
    const name = data.name.trim();
    const whatsapp = data.whatsapp.trim();
    const email = data.email?.trim();
    const notes = data.notes?.trim() || 'Solicitó matriz al cierre del Conversatorio Raíz y Balance';

    // 1. Digitalize in Firestore / CRM (Module 2 mapping)
    const newProspect = this.addProspect({
      name,
      whatsapp,
      email: email || undefined,
      notes,
      status: 'matriz_enviada',
      origin: 'Conversatorio Raíz y Balance',
      matrixSentAt: new Date().toISOString(),
    });

    // 2. Prepare WhatsApp message (Module 3)
    const messageSent = this.generateWhatsAppMessage(name);

    // 3. Dispatch to Make Webhook (Module 1)
    const webhookUrl = this.getPhase1WebhookUrl();
    let webhookDispatched = false;
    let error: string | undefined;

    const payload = {
      name,
      nombre: name,
      whatsapp,
      numero_whatsapp: whatsapp,
      email: email || '',
      origin: 'Conversatorio Raíz y Balance',
      event: 'conversatorio_solicitud_matriz',
      timestamp: new Date().toISOString(),
      firestoreCollection: 'prospects',
      status: 'matriz_enviada',
    };

    if (webhookUrl && !webhookUrl.includes('WEBHOOK_PLACEHOLDER') && !webhookUrl.includes('rbc-conversatorio-phase1')) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          webhookDispatched = true;
        } else {
          error = `Make respondió con estado HTTP ${res.status}`;
        }
      } catch (err: unknown) {
        error = err instanceof Error ? err.message : 'Error al conectar con Make';
      }
    }

    return {
      success: true,
      prospect: newProspect,
      webhookDispatched,
      messageSent,
      firestoreDocCreated: {
        collection: 'prospects',
        docId: newProspect.id,
        fields: {
          name: newProspect.name,
          whatsapp: newProspect.whatsapp,
          status: newProspect.status,
          origin: newProspect.origin,
          createdAt: newProspect.createdAt,
        },
      },
      error,
    };
  }

  // --- MAKE.COM PHASE 2 (CALENDLY BOOKING & KANBAN ADVANCEMENT) METHODS ---
  static getPhase2CalendlyWebhookUrl(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.MAKE_PHASE2_CALENDLY_WEBHOOK_URL) ||
      DEFAULT_MAKE_PHASE2_CALENDLY_WEBHOOK
    );
  }

  static setPhase2CalendlyWebhookUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.MAKE_PHASE2_CALENDLY_WEBHOOK_URL, url);
  }

  /**
   * Simulates/dispatches the 3-module Make Scenario 2:
   * Module 1: Calendly (Invitee Created - 'Sesión de Exploración / Integración (20 min)')
   * Module 2: Firestore (Search Documents in 'prospects' by whatsapp or email)
   * Module 3: Firestore (Update a Document -> status: 'sesion_20min_agendada')
   */
  static async triggerMakePhase2CalendlyBooking(data: {
    name: string;
    whatsapp: string;
    email?: string;
    scheduledAt?: string;
    eventName?: string;
  }): Promise<{
    success: boolean;
    matchedProspect: Prospect | null;
    docId: string;
    previousStatus?: string;
    newStatus: string;
    webhookDispatched: boolean;
    firestoreQuery: {
      collection: string;
      filterField: string;
      filterValue: string;
      matchedCount: number;
    };
    firestoreUpdate: {
      docId: string;
      updatedFields: Record<string, unknown>;
    };
    error?: string;
  }> {
    const inputPhone = data.whatsapp.trim().replace(/\s+/g, '');
    const inputEmail = data.email?.trim().toLowerCase();
    const inputName = data.name.trim().toLowerCase();
    const scheduledDate = data.scheduledAt || new Date().toISOString();

    const prospects = this.getProspects();

    // Module 2 simulation: Search Documents in 'prospects'
    let matchedIndex = prospects.findIndex((p) => {
      const pPhone = p.whatsapp ? p.whatsapp.trim().replace(/\s+/g, '') : '';
      const pEmail = p.email ? p.email.trim().toLowerCase() : '';
      const pName = p.name ? p.name.trim().toLowerCase() : '';

      if (inputPhone && pPhone && (pPhone.includes(inputPhone) || inputPhone.includes(pPhone))) {
        return true;
      }
      if (inputEmail && pEmail && pEmail === inputEmail) {
        return true;
      }
      if (inputName && pName && (pName.includes(inputName) || inputName.includes(pName))) {
        return true;
      }
      return false;
    });

    let targetProspect: Prospect;
    let previousStatus: string | undefined;

    if (matchedIndex !== -1) {
      targetProspect = prospects[matchedIndex];
      previousStatus = targetProspect.status;
      // Module 3 simulation: Update a Document
      const updated = this.updateProspectStatus(
        targetProspect.id,
        'sesion_20min_agendada',
        scheduledDate
      );
      if (updated) {
        targetProspect = updated;
      }
    } else {
      // If not found in prospects, create and directly set to 'sesion_20min_agendada'
      targetProspect = this.addProspect({
        name: data.name.trim(),
        whatsapp: data.whatsapp.trim(),
        email: data.email?.trim() || undefined,
        notes: `Agendó vía Calendly: ${data.eventName || 'Sesión de Exploración / Integración (20 min)'}`,
        status: 'sesion_20min_agendada',
        session20minDate: scheduledDate,
        origin: 'Calendly Agendamiento',
      });
    }

    // Module 1 payload transmission (if user configured actual Make webhook for Calendly)
    const webhookUrl = this.getPhase2CalendlyWebhookUrl();
    let webhookDispatched = false;
    let error: string | undefined;

    const payload = {
      event: 'invitee.created',
      event_type_name: data.eventName || 'Sesión de Exploración / Integración (20 min)',
      name: data.name,
      email: data.email || '',
      whatsapp: data.whatsapp,
      scheduled_time: scheduledDate,
      firestoreSearchCondition: `whatsapp == ${data.whatsapp} || email == ${data.email || ''}`,
      firestoreUpdateDocumentId: targetProspect.id,
      newStatus: 'sesion_20min_agendada',
      timestamp: new Date().toISOString(),
    };

    if (
      webhookUrl &&
      !webhookUrl.includes('WEBHOOK_PLACEHOLDER') &&
      !webhookUrl.includes('rbc-calendly-phase2')
    ) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          webhookDispatched = true;
        } else {
          error = `Make respondió con estado HTTP ${res.status}`;
        }
      } catch (err: unknown) {
        error = err instanceof Error ? err.message : 'Error al conectar con Make';
      }
    }

    return {
      success: true,
      matchedProspect: targetProspect,
      docId: targetProspect.id,
      previousStatus,
      newStatus: 'sesion_20min_agendada',
      webhookDispatched,
      firestoreQuery: {
        collection: 'prospects',
        filterField: 'whatsapp / email',
        filterValue: data.whatsapp || data.email || data.name,
        matchedCount: matchedIndex !== -1 ? 1 : 0,
      },
      firestoreUpdate: {
        docId: targetProspect.id,
        updatedFields: {
          status: 'sesion_20min_agendada',
          session20minDate: scheduledDate,
        },
      },
      error,
    };
  }

  // --- MAKE.COM PHASE 3 (HIGH-VALUE PAYMENT & CLIENT ONBOARDING) METHODS ---
  static getPhase3PaymentWebhookUrl(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.MAKE_PHASE3_PAYMENT_WEBHOOK_URL) ||
      DEFAULT_MAKE_PHASE3_PAYMENT_WEBHOOK
    );
  }

  static setPhase3PaymentWebhookUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.MAKE_PHASE3_PAYMENT_WEBHOOK_URL, url);
  }

  static getWelcomeTemplate(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.WELCOME_MESSAGE_TEMPLATE) ||
      DEFAULT_WELCOME_MESSAGE_TEMPLATE
    );
  }

  static setWelcomeTemplate(template: string): void {
    localStorage.setItem(STORAGE_KEYS.WELCOME_MESSAGE_TEMPLATE, template);
  }

  static getPortalUrl(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.PORTAL_URL) ||
      DEFAULT_PORTAL_URL
    );
  }

  static setPortalUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.PORTAL_URL, url);
  }

  static getNextLevelPaymentUrl(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.NEXT_LEVEL_PAYMENT_URL) ||
      DEFAULT_NEXT_LEVEL_PAYMENT_URL
    );
  }

  static setNextLevelPaymentUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.NEXT_LEVEL_PAYMENT_URL, url);
  }

  static generateWelcomeMessage(
    name: string,
    email: string,
    paymentStatus: string
  ): string {
    const template = this.getWelcomeTemplate();
    const portalUrl = this.getPortalUrl();

    return template
      .replace(/\{\{name\}\}/g, name || 'Cliente')
      .replace(/\{\{nombre\}\}/g, name || 'Cliente')
      .replace(/\{\{email\}\}/g, email || 'tu correo')
      .replace(/\{\{correo\}\}/g, email || 'tu correo')
      .replace(/\{\{portalUrl\}\}/g, portalUrl)
      .replace(/\{\{paymentStatus\}\}/g, paymentStatus || 'Pago Confirmado');
  }

  /**
   * Simulates/dispatches the 4-module Make Scenario 3 ("Cierre de Alto Valor"):
   * Module 1: Payment Gateway (Stripe / Wompi / ePayco / PayPal / Hotmart - Watch Payments / Webhook)
   * Module 2: Firestore (Search & Update 'prospects' -> status: 'convertido')
   * Module 3: Firestore (Create/Update 'users' -> role: 'client', programProgress: 1, paymentStatus: 'Pago Único' | 'Cuota 1 de 2')
   * Module 4: Gmail / WhatsApp (Send welcome email / message with access keys & onboarding framing)
   */
  static async triggerMakePhase3PaymentConversion(data: {
    name: string;
    email: string;
    whatsapp?: string;
    amount?: string;
    paymentStatus?: PaymentStatus;
    paymentGateway?: string;
    programName?: string;
  }): Promise<{
    success: boolean;
    matchedProspect: Prospect | null;
    createdUser: User;
    prospectDocId?: string;
    userDocId: string;
    welcomeMessageSent: string;
    webhookDispatched: boolean;
    firestoreProspectUpdate: {
      collection: string;
      docId?: string;
      updatedFields: Record<string, unknown>;
    };
    firestoreUserDocument: {
      collection: string;
      docId: string;
      fields: Record<string, unknown>;
    };
    error?: string;
  }> {
    const inputEmail = data.email.trim().toLowerCase();
    const inputPhone = data.whatsapp ? data.whatsapp.trim().replace(/\s+/g, '') : '';
    const inputName = data.name.trim();
    const paymentStatus: PaymentStatus = data.paymentStatus || 'Pago Único';
    const amount = data.amount || '$1.500.000 COP';
    const gateway = data.paymentGateway || 'Stripe / Wompi';

    // 1. MODULE 2: Match and update prospect in 'prospects'
    const prospects = this.getProspects();
    let matchedProspect = prospects.find((p) => {
      const pEmail = p.email ? p.email.trim().toLowerCase() : '';
      const pPhone = p.whatsapp ? p.whatsapp.trim().replace(/\s+/g, '') : '';
      const pName = p.name.trim().toLowerCase();

      if (inputEmail && pEmail && pEmail === inputEmail) return true;
      if (inputPhone && pPhone && (pPhone.includes(inputPhone) || inputPhone.includes(pPhone))) return true;
      if (inputName && pName && pName === inputName.toLowerCase()) return true;
      return false;
    }) || null;

    let prospectDocId: string | undefined;
    if (matchedProspect) {
      prospectDocId = matchedProspect.id;
      this.updateProspectStatus(matchedProspect.id, 'convertido');
    }

    // 2. MODULE 3: Create or update client in 'users'
    const users = this.getUsers();
    let existingUser = users.find((u) => u.email.toLowerCase() === inputEmail);
    let createdUser: User;

    if (existingUser) {
      existingUser = {
        ...existingUser,
        role: 'client',
        programProgress: Math.max(existingUser.programProgress, 1),
        paymentStatus: paymentStatus,
        programName: data.programName || 'Certeza, Fronteras & Dirección Personal',
        programFee: amount,
      };
      this.saveUsers(users.map((u) => (u.uid === existingUser!.uid ? existingUser! : u)));
      createdUser = existingUser;
    } else {
      const newClientId = 'client-' + Date.now();
      createdUser = {
        uid: newClientId,
        name: inputName,
        email: inputEmail,
        phone: data.whatsapp || (matchedProspect ? matchedProspect.whatsapp : '+57 300 000 0000'),
        role: 'client',
        title: 'Cliente Programa Certeza',
        avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 10000)}?auto=format&fit=crop&w=400&q=80`,
        joinedAt: new Date().toISOString().split('T')[0],
        programProgress: 1, // Start on Session 1
        paymentStatus: paymentStatus,
        programName: data.programName || 'Certeza, Fronteras & Dirección Personal',
        programFee: amount,
      };
      this.saveUsers([...users, createdUser]);

      // Seed first onboarding session
      const sessions = this.getSessions();
      const firstSession: Session = {
        id: 'sess-' + Date.now(),
        clientId: newClientId,
        sessionNumber: 1,
        date: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
        meetLink: `https://meet.google.com/rbc-${Math.random().toString(36).substring(2, 7)}`,
        status: 'scheduled',
        notes: 'Sesión 1: Mapeo de la Transparencia y Decodificación Somática.',
      };
      this.saveSessions([...sessions, firstSession]);
    }

    // 3. MODULE 4: Format Welcome Message (Gmail / WhatsApp)
    const welcomeMessageSent = this.generateWelcomeMessage(
      inputName,
      inputEmail,
      paymentStatus
    );

    // 4. Dispatch to Make Payment Webhook (if configured)
    const webhookUrl = this.getPhase3PaymentWebhookUrl();
    let webhookDispatched = false;
    let error: string | undefined;

    const payload = {
      event: 'payment.success',
      payment_gateway: gateway,
      amount: amount,
      currency: amount.includes('USD') ? 'USD' : 'COP',
      buyer_name: inputName,
      buyer_email: inputEmail,
      buyer_phone: data.whatsapp || (matchedProspect ? matchedProspect.whatsapp : ''),
      firestoreProspectUpdated: {
        collection: 'prospects',
        docId: prospectDocId || 'N/A',
        newStatus: 'convertido',
      },
      firestoreUserCreated: {
        collection: 'users',
        docId: createdUser.uid,
        role: 'client',
        programProgress: 1,
        paymentStatus: paymentStatus,
        programName: createdUser.programName,
      },
      welcomeChannel: 'Gmail / WhatsApp Cloud',
      welcomeMessagePreview: welcomeMessageSent,
      timestamp: new Date().toISOString(),
    };

    if (
      webhookUrl &&
      !webhookUrl.includes('WEBHOOK_PLACEHOLDER') &&
      !webhookUrl.includes('rbc-payment-phase3')
    ) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          webhookDispatched = true;
        } else {
          error = `Make respondió con estado HTTP ${res.status}`;
        }
      } catch (err: unknown) {
        error = err instanceof Error ? err.message : 'Error al conectar con Make';
      }
    }

    return {
      success: true,
      matchedProspect,
      createdUser,
      prospectDocId,
      userDocId: createdUser.uid,
      welcomeMessageSent,
      webhookDispatched,
      firestoreProspectUpdate: {
        collection: 'prospects',
        docId: prospectDocId,
        updatedFields: {
          status: 'convertido',
          convertedAt: new Date().toISOString(),
        },
      },
      firestoreUserDocument: {
        collection: 'users',
        docId: createdUser.uid,
        fields: {
          name: createdUser.name,
          email: createdUser.email,
          role: 'client',
          programProgress: 1,
          paymentStatus: paymentStatus,
          programName: createdUser.programName,
        },
      },
      error,
    };
  }
}

