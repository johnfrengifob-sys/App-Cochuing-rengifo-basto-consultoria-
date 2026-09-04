import {
  User,
  Session,
  PostSessionForm,
  FormSubmission,
  AIInsight,
  PulseFlag,
  Prospect,
  ProspectStatus,
  ProgramNodeInfo,
  PaymentStatus,
  CronogramaEvent,
  EventRegistration,
  OntologicalProgram,
  PaymentRequest,
  PaymentMethodType,
  PaymentApprovalStatus,
  WorkshopRoadmapStep,
  QuestionnaireQuestion,
  DynamicQuestionnaire,
  QuestionType,
  ClientEmailLog,
  AutomatedTriggerConfig,
  PricingPackage,
} from '../types';
import promotionalEventBannerImg from '../assets/images/proximo_evento_banner_1788270380574.jpg';
import coachAvatarImg from '../assets/images/regenerated_image_1788287101599.jpg';
import { FirestoreSyncService } from './firestoreSync';

export const COMPANY_INFO = {
  fullName: 'Rengifo Basto Consultoría Ontológica',
  shortName: 'Rengifo Basto',
  address: 'Crr 20bis # 65a-22',
  city: 'Manizales, Colombia',
  mapsUrl:
    'https://www.google.com/maps/@5.0565989,-75.4837305,20.33z?entry=ttu&g_ep=EgoyMDI2MDkwMS4wIKXMDSoASAFQAw%3D%3D',
  phone: '3234642257',
  formattedPhone: '+57 323 464 2257',
  email: 'johnfrengifob@gmail.com',
  whatsappUrl: 'https://wa.me/573234642257',
  socialLinks: {
    facebook: 'https://www.facebook.com/profile.php?id=61592655869050',
    tiktok: 'https://www.tiktok.com/@rengifobastoco',
    youtube: 'https://www.youtube.com/@Rengifobastoco',
  },
};

export const BRE_B_NU_CONFIG = {
  llave: '@ASL775',
  bank: 'Nu Colombia (Nubank)',
  network: 'Bre-B',
  title: 'Bre-B | nu',
  headline: 'Paga aquí. Seguro, sin costo y en segundos.',
  subtext:
    'Recibimos pagos a través de Llaves desde cualquier entidad financiera (Bancolombia, Nequi, Daviplata, Dale, BBVA, etc.).',
  whatsappValidation: '+57 323 464 2257',
  whatsappRaw: '573234642257',
};

export let PROGRAM_NODES: ProgramNodeInfo[] = [
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
    avatarUrl: coachAvatarImg,
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
    status: 'active',
    totalInvested: '$1.500.000 COP',
    primaryBreakdown: 'Autoexigencia y límites no dichos con directivos',
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
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
    status: 'active',
    totalInvested: '$750.000 COP',
    primaryBreakdown: 'Gestión de la ira y reactividad con socios',
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
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
    status: 'active',
    totalInvested: '$1.500.000 COP',
    primaryBreakdown: 'Crisis de identidad directiva y propósito',
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    uid: 'client-4',
    name: 'Alejandro Morales',
    email: 'alejandro.morales@example.com',
    role: 'client',
    title: 'Gerente Comercial Regional',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    joinedAt: '2024-05-02',
    programProgress: 1,
    paymentStatus: 'Cuota 1 de 2',
    programName: 'Certeza, Fronteras & Dirección Personal',
    programFee: '$1.500.000 COP',
    status: 'waiting',
    totalInvested: '$750.000 COP',
    primaryBreakdown: 'Trato y sanación con sus padres & lealtad invisible',
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    uid: 'client-5',
    name: 'Valentina Jaramillo',
    email: 'valentina.j@example.com',
    role: 'client',
    title: 'Consultora de Estrategia & M&A',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    joinedAt: '2024-01-20',
    programProgress: 6,
    paymentStatus: 'Completado',
    programName: 'Certeza, Fronteras & Dirección Personal',
    programFee: '$1.500.000 COP',
    status: 'inactive',
    totalInvested: '$3.000.000 COP',
    primaryBreakdown: 'Miedo al juicio externo y soberanía de decisión',
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
  },
  {
    uid: 'client-6',
    name: 'Daniel Echeverri',
    email: 'daniel.echeverri@example.com',
    role: 'client',
    title: 'CFO & Asesor Financiero',
    avatarUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    joinedAt: '2024-06-10',
    programProgress: 2,
    paymentStatus: 'Pago Único',
    programName: 'Certeza, Fronteras & Dirección Personal',
    programFee: '$1.500.000 COP',
    status: 'active',
    totalInvested: '$1.500.000 COP',
    primaryBreakdown: 'Control obsesivo y delegación con angustia',
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    uid: 'client-andres',
    name: 'Andrés Quintero',
    email: 'andres.quintero@example.com',
    role: 'client',
    title: 'Director de Innovación & Emprendimiento',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    joinedAt: '2024-03-10',
    programProgress: 2,
    paymentStatus: 'Completado', // Supuestamente ya pagó todo el taller
    programName: 'Certeza, Fronteras & Dirección Personal',
    programFee: '$1.500.000 COP',
    status: 'active',
    totalInvested: '$1.500.000 COP',
    primaryBreakdown: 'Quiebre de autoexigencia extrema, delegación y presencia directiva',
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

const INITIAL_SESSIONS: Session[] = [
  {
    id: 'sess-andres-1',
    clientId: 'client-andres',
    sessionNumber: 1,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    meetLink: 'https://meet.google.com/rbc-andres-ses1',
    status: 'completed',
    isPaid: true,
    paymentValidatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    notes: 'Sesión 1: Mapeo del quiebre de autoexigencia y deconstrucción de la omnipotencia operativa.',
  },
  {
    id: 'sess-andres-2',
    clientId: 'client-andres',
    sessionNumber: 2,
    date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // Finished today
    meetLink: 'https://meet.google.com/rbc-andres-ses2',
    status: 'completed',
    isPaid: true,
    paymentValidatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    notes: 'Sesión 2: Reencuadre de la culpa al delegar y diseño de conversaciones de oferta y confianza.',
  },
  {
    id: 'sess-andres-3',
    clientId: 'client-andres',
    sessionNumber: 3,
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 11).toISOString(),
    meetLink: 'https://meet.google.com/rbc-andres-ses3',
    status: 'scheduled',
    isPaid: true,
    paymentValidatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    notes: 'Sesión 3: Decodificación somática de la presencia directiva y acuerdos de equipo.',
  },
  {
    id: 'sess-andres-4',
    clientId: 'client-andres',
    sessionNumber: 4,
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(),
    meetLink: 'https://meet.google.com/rbc-andres-ses4',
    status: 'scheduled',
    isPaid: true,
    paymentValidatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    notes: 'Sesión 4: Distinción ontológica entre hechos y juicios en la toma de decisiones estratégicas.',
  },
  {
    id: 'sess-andres-5',
    clientId: 'client-andres',
    sessionNumber: 5,
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 39).toISOString(),
    meetLink: 'https://meet.google.com/rbc-andres-ses5',
    status: 'scheduled',
    isPaid: true,
    paymentValidatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    notes: 'Sesión 5: Rediseño de la soberanía emocional, límites impecables y autonomía directiva.',
  },
  {
    id: 'sess-andres-6',
    clientId: 'client-andres',
    sessionNumber: 6,
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 53).toISOString(),
    meetLink: 'https://meet.google.com/rbc-andres-ses6',
    status: 'scheduled',
    isPaid: true,
    paymentValidatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    notes: 'Sesión 6: Cierre del ciclo, consolidación de la nueva identidad y plan de sostenibilidad.',
  },
  {
    id: 'sess-103',
    clientId: 'client-1',
    sessionNumber: 3,
    date: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(), // Tomorrow afternoon
    meetLink: 'https://meet.google.com/rbc-onto-ses3',
    status: 'scheduled',
    isPaid: true,
    paymentValidatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    notes: 'Sesión 3: Decodificación somática de la opresión en el pecho y mandatos de autoexigencia.',
  },
  {
    id: 'sess-102',
    clientId: 'client-1',
    sessionNumber: 2,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    meetLink: 'https://meet.google.com/rbc-onto-ses2',
    status: 'completed',
    isPaid: true,
    paymentValidatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    notes: 'Sesión 2: Mapeo de límites no dichos y rediseño del "No" ontológico.',
  },
  {
    id: 'sess-101',
    clientId: 'client-1',
    sessionNumber: 1,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    meetLink: 'https://meet.google.com/rbc-onto-ses1',
    status: 'completed',
    isPaid: true,
    paymentValidatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    notes: 'Sesión 1: Mapeo de la transparencia cotidiana y quiebres no declarados.',
  },
  {
    id: 'sess-202',
    clientId: 'client-2',
    sessionNumber: 2,
    date: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    meetLink: 'https://meet.google.com/rbc-onto-ses2',
    status: 'scheduled',
    isPaid: true,
    paymentValidatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    notes: 'Sesión 2: Distinción entre juicios y hechos en las relaciones con socios.',
  },
  {
    id: 'sess-305',
    clientId: 'client-3',
    sessionNumber: 5,
    date: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    meetLink: 'https://meet.google.com/rbc-onto-ses5',
    status: 'scheduled',
    isPaid: true,
    paymentValidatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
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

export const INITIAL_POST_SESSION_FORMS: PostSessionForm[] = [
  {
    id: 'psf-andres-1',
    sessionId: 'sess-andres-1',
    sessionNumber: 1,
    clientId: 'client-andres',
    clientName: 'Andrés Quintero',
    sessionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 65).toISOString(),
    // Pregunta 1:
    coacheeEmotionAndOpenness:
      'Habitó una fuerte ansiedad encubierta en hiper-racionalización y urgencia operativa. En los primeros 25 minutos mostró una marcada resistencia corporal (mandíbula apretada, hombros elevados y tendencia a justificar su sobrecarga con métricas de la empresa). Al intervenir con una pausa somática y espejar su agotamiento, tuvo una apertura profunda y vulnerable para admitir el miedo a perder control.',
    // Pregunta 2:
    masterJudgmentAndNarrative:
      'Juicio Maestro: "Si no lo controlo y resuelvo todo yo mismo, el proyecto colapsará y perderé mi valor como líder". Esta narrativa de omnipotencia y desconfianza básica estructuraba su resistencia radical a delegar en su equipo directivo.',
    // Pregunta 3:
    perspectiveShiftEvidence:
      'Hacia el cierre de la sesión reconoció conmovido: "Pensaba que delegar era abandonar, pero ahora veo que exigir perfección absoluta es una forma de protegerme del miedo a no ser suficiente". Soltó la tensión física visiblemente y aceptó ceder el liderazgo del comité operativo de los martes.',
    // Pregunta 4:
    directivenessAndIcfCompetency:
      'Hacia el minuto 43 sentí la tentación de sugerirle una metodología específica de gestión en vez de sostener el silencio reflexivo para que él diseñara su propio acuerdo de confianza. Debo cuidar con rigor la Competencia ICF 5 (Mantiene la Presencia) y Competencia ICF 7 (Evoca Conciencia), evitando actuar desde el rol de consultor directivo.',
    workbookTitle: 'Deconstrucción de la Omnipotencia & Arquitectura de Confianza Directiva',
    coacheeKeyDeclaration:
      'Declaro que mi valor como líder radica en habilitar la autonomía de mi equipo y no en cargar con el peso del resultado solitario.',
    agreedActionItems: [
      'Delegar la entrega del informe semanal de operaciones sin intervenir en los borradores intermedios.',
      'Realizar 3 pausas de centramiento y respiración diafragmática de 3 minutos antes de ingresar a comités directivos.',
      'Anotar en la bitácora somática cada vez que surja el impulso automático de microgestión o fiscalización.',
    ],
    somaticHomework:
      'Práctica de enraizamiento y soltura: 5 minutos al iniciar la jornada conectando los pies al suelo, abriendo el pecho y soltando la mandíbula antes de encender el ordenador.',
  },
  {
    id: 'psf-andres-2',
    sessionId: 'sess-andres-2',
    sessionNumber: 2,
    clientId: 'client-andres',
    clientName: 'Andrés Quintero',
    sessionDate: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    coacheeEmotionAndOpenness:
      'Llegó con sensación de alivio tras haber soltado la coordinación del comité de los martes, pero experimentando culpa residual e inquietud por no saber el minuto a minuto. Apertura alta para indagar de dónde viene esa culpa y redefinir su noción de responsabilidad directiva.',
    masterJudgmentAndNarrative:
      'Juicio Maestro: "Si no me siento culpable o agotado al final del día, siento que no estoy trabajando lo suficiente". Deconstrucción de la narrativa de que el valor profesional es proporcional al nivel de desgaste físico y mental.',
    perspectiveShiftEvidence:
      'Expresó con claridad: "Entiendo que el descanso y la confianza son actos de liderazgo estratégico, no de negligencia". Definió con convicción su primer protocolo de pedidos y promesas con su socia operativa.',
    directivenessAndIcfCompetency:
      'Cuidé el ritmo de la conversación y sostuve las pausas necesarias cuando él conectaba con la emoción del alivio. Competencia ICF 6 (Escucha Activa) y Competencia ICF 8 (Facilita el Crecimiento del Cliente) aplicadas con consistencia.',
    workbookTitle: 'Deconstrucción de la Culpa & Diseño de Conversaciones de Confianza',
    coacheeKeyDeclaration:
      'Elijo liderar desde la serenidad, fundar mis pedidos con claridad y confiar en la capacidad de mi equipo sin castigarme con la culpa.',
    agreedActionItems: [
      'Establecer acuerdos de retroalimentación quincenales en lugar de revisiones diarias imprevistas.',
      'Sostener la desconexión total después de las 7:00 PM sin responder mensajes no críticos.',
      'Documentar en la bitácora los momentos de serenidad y eficacia experimentados durante la semana.',
    ],
    somaticHomework:
      'Práctica de respiración en cuatro tiempos (box breathing) antes de responder solicitudes complejas.',
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
    title: 'Primer Taller: Conversatorio Raíz & Balance',
    subtitle: 'Fronteras, Límites No Dichos & Decodificación Somática (Taller Experiencial 1)',
    category: 'Primer Taller • En Vivo',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 5).toISOString(), // in ~3 days
    displayDate: 'Jueves Próximo (En Vivo)',
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

const INITIAL_PROGRAMS: OntologicalProgram[] = [
  {
    id: 'prog-1',
    name: 'Certeza, Fronteras & Dirección Personal',
    subtitle: 'Programa de Transformación Ontológica de 12 Semanas (6 Nodos)',
    category: 'Programa de Acompañamiento',
    duration: '12 Semanas (6 Sesiones Quincenales)',
    format: '1 a 1 Ejecutivo',
    fee: '$1.500.000 COP',
    totalCapacity: 10,
    availableSpots: 4,
    enrolledCount: 6,
    status: 'active',
    description: 'Proceso inmersivo de 12 semanas con enfoque lingüístico, corporal y emocional para ejecutivos y líderes que buscan soberanía y límites.',
    keyOutcomes: [
      'Mapeo de la transparencia y quiebres inconscientes',
      'Declaración de fronteras y límites no dichos',
      'Decodificación somática y desactivación de la autoexigencia',
      'Diseño de futuros y compromisos innegociables',
    ],
    startDate: '2026-09-01',
    displaySchedule: 'Sesiones Quincenales de 60 min personalizadas',
    facilitator: 'John Fredy Rengifo Basto',
    totalNodes: 6,
  },
  {
    id: 'prog-2',
    name: 'Liderazgo Ontológico & Soberanía Directiva',
    subtitle: 'Programa Ejecutivo Grupal de 8 Semanas para Equipos Directivos',
    category: 'Programa de Acompañamiento',
    duration: '8 Semanas (4 Módulos Quincenales)',
    format: 'Grupal / Cohorte',
    fee: '$950.000 COP',
    totalCapacity: 20,
    availableSpots: 8,
    enrolledCount: 12,
    status: 'active',
    description: 'Acompañamiento de alto impacto para directores y líderes de equipo enfocado en conversaciones de poder, pedidos impecables y deconstrucción de la autoexigencia.',
    keyOutcomes: [
      'Arquitectura de confianza y pedidos efectivos en equipos',
      'Gestión de quiebres colectivos y soberanía emocional',
      'Diseño de acuerdos y compromisos innegociables',
    ],
    startDate: '2026-10-01',
    displaySchedule: 'Miércoles quincenales 6:30 PM (GMT-5)',
    facilitator: 'John Fredy Rengifo Basto',
    totalNodes: 4,
  },
  {
    id: 'prog-3',
    name: 'Certificación en Autoasistencia Somática',
    subtitle: 'Inmersión de 6 Semanas en Decodificación Corporal y Regulación Emocional',
    category: 'Especialización Ontológica',
    duration: '6 Semanas (3 Módulos Bimensuales)',
    format: 'Taller Intensivo',
    fee: '$680.000 COP',
    totalCapacity: 15,
    availableSpots: 5,
    enrolledCount: 10,
    status: 'enrolling',
    description: 'Protocolos vivenciales de autoasistencia somática, respiración diafragmática consciente y reencuadre corporal de juicios maestros.',
    keyOutcomes: [
      'Protocolos somáticos de liberación de estrés y tensión',
      'Mapeo de la memoria corporal ante situaciones de crisis',
      'Técnicas de centramiento ontológico para la toma de decisiones',
    ],
    startDate: '2026-10-15',
    displaySchedule: 'Sábados 9:00 AM a 12:00 PM',
    facilitator: 'John Fredy Rengifo Basto',
    totalNodes: 3,
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

const INITIAL_PAYMENT_REQUESTS: PaymentRequest[] = [
  {
    id: 'pay-req-1',
    clientId: 'client-2',
    clientName: 'Mateo Valencia',
    clientEmail: 'mateo.valencia@example.com',
    clientPhone: '+57 301 654 8833',
    amount: '$500.000 COP',
    concept: 'Desbloqueo Nivel II: Diseñando Conversaciones y Límites (Sesión 3)',
    targetStep: 3,
    planType: 'level',
    method: 'efectivo',
    notes: 'Pago en efectivo acordado para entregar en consultorio en la sesión presencial de este jueves.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'pay-req-2',
    clientId: 'client-4',
    clientName: 'Alejandro Morales',
    clientEmail: 'alejandro.morales@example.com',
    clientPhone: '+57 311 555 4321',
    amount: '$500.000 COP',
    concept: 'Desbloqueo Nivel I: Fronteras, Declaraciones y Límites (Sesión 2)',
    targetStep: 2,
    planType: 'level',
    method: 'bre_b_nu',
    whatsappContacted: true,
    notes: 'Transferencia realizada con Bre-B Nu a la llave @ASL775. Comprobante enviado por WhatsApp al +573234642257.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'pay-req-3',
    clientId: 'client-1',
    clientName: 'Sofía Restrepo',
    clientEmail: 'sofia.restrepo@example.com',
    clientPhone: '+57 318 200 4590',
    amount: '$1.500.000 COP',
    concept: 'Programa Completo Certeza Ontológica (12 Semanas)',
    targetStep: 6,
    planType: 'full',
    method: 'bre_b_nu',
    notes: 'Pago total por Bre-B Nu @ASL775 validado por administración.',
    status: 'approved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    reviewedBy: 'John Fredy Rengifo Basto',
  },
];

const STORAGE_KEYS = {
  USERS: 'rbc_users_v2',
  CURRENT_USER_ID: 'rbc_current_user_id_v2',
  PROSPECTS: 'rbc_prospects_v2',
  EVENT_REGISTRATIONS: 'rbc_event_registrations_v2',
  SESSIONS: 'rbc_sessions_v2',
  POST_SESSION_FORMS: 'rbc_post_session_forms_v2',
  FORMS: 'rbc_forms_v2',
  AI_INSIGHTS: 'rbc_ai_insights_v2',
  CRONOGRAMA_EVENTS: 'rbc_cronograma_events_v2',
  PROGRAMS: 'rbc_programs_v2',
  PAYMENT_REQUESTS: 'rbc_payment_requests_v2',
  PROGRAM_NODES: 'rbc_program_nodes_v2',
  QUESTIONNAIRES: 'rbc_dynamic_questionnaires_v2',
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
  WORKSHOPS_VIEWED: 'rbc_workshops_viewed_v2',
  CLIENT_EMAIL_LOGS: 'rbc_client_email_logs_v2',
  AUTOMATED_TRIGGERS: 'rbc_automated_triggers_v2',
  PRICING_PACKAGES: 'rbc_pricing_packages_v2',
};

export const INITIAL_AUTOMATED_TRIGGERS: AutomatedTriggerConfig[] = [
  {
    id: 'trigger-form-submitted',
    name: 'Disparador: Bitácora o Cuestionario Entregado',
    description: 'Ejecuta el Diagnóstico Ontológico con Gemini AI y despacha el payload en JSON al Webhook de Make.com.',
    event: 'form_submitted',
    enabled: true,
    actions: [
      'Análisis Somático y Lingüístico Gemini 3.7',
      'Despacho HTTP POST al Webhook Make.com',
      'Actualización de avance de nodo del Coachee en Firestore',
    ],
    lastTriggeredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    executionsCount: 14,
  },
  {
    id: 'trigger-payment-validated',
    name: 'Disparador: Validación de Pago Bre-B Nu o Efectivo',
    description: 'Desbloquea instantáneamente las sesiones correspondientes, genera recibo ontológico y notifica al coachee.',
    event: 'payment_validated',
    enabled: true,
    actions: [
      'Desbloqueo de Nivel y Sesiones en el Espacio Privado',
      'Sincronización con balance de cobros en Google Sheets',
      'Preparación de borrador de bienvenida/desbloqueo en Gmail',
    ],
    lastTriggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    executionsCount: 8,
  },
  {
    id: 'trigger-session-scheduled',
    name: 'Disparador: Agendamiento de Sesión 1 a 1',
    description: 'Genera sala única de Google Meet, sincroniza con Google Calendar oficial y prepara correo de recordatorio.',
    event: 'session_scheduled',
    enabled: true,
    actions: [
      'Creación de evento en Google Calendar',
      'Generación de enlace Google Meet seguro',
      'Registro de fecha y recordatorio previo de 24h',
    ],
    lastTriggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    executionsCount: 22,
  },
  {
    id: 'trigger-inactivity-detected',
    name: 'Disparador: Alerta de Inactividad (+7 días)',
    description: 'Detecta cuando un participante activo lleva más de 7 días sin enviar registros o bitácoras para activar seguimiento.',
    event: 'inactivity_detected',
    enabled: true,
    actions: [
      'Marcado de estado en revisión en el panel del coach',
      'Preparación de mensaje de Pausa de Coherencia y Reactivación',
    ],
    lastTriggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    executionsCount: 5,
  },
];

export const INITIAL_PRICING_PACKAGES: PricingPackage[] = [
  {
    id: 'pkg-certeza-12w',
    name: 'Programa Completo Certeza Ontológica (12 Semanas)',
    duration: '12 semanas (3 meses)',
    targetAudience: 'Directores Generales, Socios y Gerentes Senior',
    sessionsCount: 6,
    basePriceCOP: 1500000,
    brebNuDiscountPercent: 5,
    includes: [
      '6 Sesiones individuales quincenales de 60 minutos con John Fredy Rengifo',
      'Acceso vitalicio a la plataforma con los 6 Nodos de Trabajo y material descargable',
      'Diagnósticos continuos con Copiloto Gemini Ontológico',
      'Cuadernos de Trabajo Post-Sesión generados en PDF bajo estándares ICF',
      'Pausas de Coherencia guiadas y acompañamiento prioritario por WhatsApp',
    ],
    active: true,
  },
  {
    id: 'pkg-cuota-nivel',
    name: 'Pago Fraccionado por Nivel (Cuota 1 de 2)',
    duration: '6 semanas',
    targetAudience: 'Profesionales en proceso de exploración ontológica',
    sessionsCount: 3,
    basePriceCOP: 750000,
    brebNuDiscountPercent: 0,
    includes: [
      '3 Sesiones individuales 1 a 1 de 60 minutos',
      'Acceso al Nivel activo (Nivel I o Nivel II)',
      'Bitácoras y Cuestionarios evaluativos del nivel',
    ],
    active: true,
  },
  {
    id: 'pkg-sesion-individual',
    name: 'Sesión Individual de Indagación & Quiebre',
    duration: '60 minutos',
    targetAudience: 'Directivos ante un quiebre urgente o conversación crucial',
    sessionsCount: 1,
    basePriceCOP: 280000,
    brebNuDiscountPercent: 5,
    includes: [
      '1 Sesión intensiva 1 a 1 de 60 minutos por Google Meet',
      'Mapeo de la transparencia, juicios maestros y emociones subyacentes',
      'Informe ontológico confidencial en PDF con compromisos de acción',
    ],
    active: true,
  },
  {
    id: 'pkg-taller-incompany',
    name: 'Taller Vivencial In-Company: Soberanía y Conversaciones Impecables',
    duration: '4 horas vivenciales (Media Jornada)',
    targetAudience: 'Equipos de Alta Dirección (hasta 15 participantes)',
    sessionsCount: 1,
    basePriceCOP: 4500000,
    brebNuDiscountPercent: 10,
    includes: [
      'Taller facilitado presencial o virtual por John Fredy Rengifo Basto',
      'Dinámicas en los 3 dominios: lingüístico, somático y emocional',
      'Manuales de trabajo y fichas de ejercicios impresas y digitales',
      'Diagnóstico general de la coherencia del equipo post-taller',
    ],
    active: true,
  },
];

export const DEFAULT_ROADMAP_STEPS: Record<number, WorkshopRoadmapStep[]> = {
  1: [
    {
      id: 'step-1-1',
      stepNumber: 1,
      title: 'Centramiento Somático y Apertura en Coherencia',
      durationMinutes: 10,
      phaseType: 'Centramiento & Apertura',
      description: 'Respiración diafragmática 4-2-6, escaneo corporal y fijación de intención para suspender el juicio automático.',
      keyInstructions: [
        'Guiar 5 minutos de respiración diafragmática y silencio reflexivo.',
        'Invitar al participante a soltar la exigencia operativa y conectar con el presente.',
      ],
    },
    {
      id: 'step-1-2',
      stepNumber: 2,
      title: 'Distinción Ontológica: Transparencia vs Quiebre',
      durationMinutes: 20,
      phaseType: 'Marco Teórico Ontológico',
      description: 'Explicación del fluir transparente en la rutina cotidiana y la aparición del quiebre como oportunidad reflexiva.',
      keyInstructions: [
        'Diferenciar entre "lo que pasa fáctico" y "la narrativa reactiva que construyo".',
        'Analizar la transparencia ontológica según Martín Heidegger y Rafael Echeverría.',
      ],
    },
    {
      id: 'step-1-3',
      stepNumber: 3,
      title: 'Mapeo de Fugas de Energía y Costos Invisibles',
      durationMinutes: 25,
      phaseType: 'Dinámica Vivencial',
      description: 'Auditoría en vivo de acuerdos tácitos y automatismos que drenan la energía vital del participante.',
      keyInstructions: [
        'Identificar los 3 mayores drenajes de energía en la última semana laboral.',
        'Registrar quiebres no declarados en la matriz personal.',
      ],
    },
    {
      id: 'step-1-4',
      stepNumber: 4,
      title: 'Calibración Postural de la Decisión Lúcida',
      durationMinutes: 15,
      phaseType: 'Práctica Somática',
      description: 'Registro de tensiones en mandíbula, trapecios y diafragma al tomar compromisos apresurados.',
      keyInstructions: [
        'Ponerse de pie y calibrar el peso en las plantas de los pies.',
        'Sentir la diferencia física entre una postura reactiva y una receptiva soberana.',
      ],
    },
    {
      id: 'step-1-5',
      stepNumber: 5,
      title: 'Declaración de Quiebres y Acuerdos de Bitácora',
      durationMinutes: 10,
      phaseType: 'Cierre & Acuerdos',
      description: 'Formalización del quiebre fundamental a trabajar en el ciclo quincenal y micro-práctica diaria.',
      keyInstructions: [
        'Redactar la declaración de quiebre en una sola frase contundente.',
        'Consensuar la micro-práctica de pausa de 90 segundos 3 veces al día.',
      ],
    },
  ],
  2: [
    {
      id: 'step-2-1',
      stepNumber: 1,
      title: 'Alineación de Columna y Arraigo Territorial',
      durationMinutes: 10,
      phaseType: 'Centramiento & Apertura',
      description: 'Activación del plexo solar y enraizamiento para sostener límites sin hostilidad ni culpa.',
      keyInstructions: [
        'Postura de arraigo con pies al ancho de hombros y pelvis relajada.',
        'Respirar hacia el bajo vientre sintiendo la estabilidad territorial.',
      ],
    },
    {
      id: 'step-2-2',
      stepNumber: 2,
      title: 'Los Actos Declarativos: La Declaración del "Basta"',
      durationMinutes: 20,
      phaseType: 'Marco Teórico Ontológico',
      description: 'El "No" como acto fundacional de dignidad, soberanía personal y cuidado del vínculo.',
      keyInstructions: [
        'Explicar por qué quien no puede decir no, tampoco puede dar un sí genuino.',
        'Desmontar la creencia aprendida de que poner límites equivale a desamor o egoísmo.',
      ],
    },
    {
      id: 'step-2-3',
      stepNumber: 3,
      title: 'Auditoría de Conversaciones Postergadas',
      durationMinutes: 25,
      phaseType: 'Dinámica Vivencial',
      description: 'Mapeo de la persona y situación específica donde se requiere proclamar un límite claro.',
      keyInstructions: [
        'Elegir una conversación postergada por más de 1 mes.',
        'Redactar el guion de la frontera con honestidad impecable.',
      ],
    },
    {
      id: 'step-2-4',
      stepNumber: 4,
      title: 'Somática de la Firmeza sin Agresión',
      durationMinutes: 15,
      phaseType: 'Práctica Somática',
      description: 'Ensayo del "No" con contacto visual sereno, tono de voz pausado y sin justificarse.',
      keyInstructions: [
        'Practicar la frase: "Agradezco la oferta, pero elijo no asumirla".',
        'Evitar explicaciones defensivas o disculpas automáticas.',
      ],
    },
    {
      id: 'step-2-5',
      stepNumber: 5,
      title: 'Pacto de Soberanía y Plan de Aplicación',
      durationMinutes: 10,
      phaseType: 'Cierre & Acuerdos',
      description: 'Fijar fecha, hora y contexto para tener la conversación de frontera.',
      keyInstructions: [
        'Agendar en Google Calendar el momento exacto para la conversación.',
        'Registrar el compromiso en el cuaderno de trabajo.',
      ],
    },
  ],
  3: [
    {
      id: 'step-3-1',
      stepNumber: 1,
      title: 'Silencio Reflexivo y Toma de Consciencia',
      durationMinutes: 10,
      phaseType: 'Centramiento & Apertura',
      description: 'Revisión del estado interior y suspensión del juicio de autocrítica destructiva.',
      keyInstructions: ['Observar pensamientos como nubes sin aferrarse a ninguno.'],
    },
    {
      id: 'step-3-2',
      stepNumber: 2,
      title: 'Arqueología del Juicio Maestro',
      durationMinutes: 25,
      phaseType: 'Marco Teórico Ontológico',
      description: 'Identificar la narrativa troncal que condiciona el comportamiento y la autovaloración.',
      keyInstructions: ['Detectar mandatos familiares y culturales introyectados.'],
    },
    {
      id: 'step-3-3',
      stepNumber: 3,
      title: 'Laboratorio: Hechos vs Interpretaciones',
      durationMinutes: 25,
      phaseType: 'Dinámica Vivencial',
      description: 'Someter a juicio crítico la creencia limitante y contrastarla con hechos observables.',
      keyInstructions: ['Escribir el juicio en una columna y los hechos verificables en otra.'],
    },
    {
      id: 'step-3-4',
      stepNumber: 4,
      title: 'Postura de Certeza vs Postura de Indecisión',
      durationMinutes: 15,
      phaseType: 'Práctica Somática',
      description: 'Experimentar en el cuerpo la solidez de una convicción frente a la vacilación reactiva.',
      keyInstructions: ['Caminar habitando el espacio con dignidad y mirada al horizonte.'],
    },
    {
      id: 'step-3-5',
      stepNumber: 5,
      title: 'Declaración del Nuevo Observador',
      durationMinutes: 15,
      phaseType: 'Cierre & Acuerdos',
      description: 'Enunciar la nueva afirmación ontológica habilitante y fijar prácticas de higiene mental.',
      keyInstructions: ['Sellar el nuevo pacto de interpretación ante el grupo.'],
    },
  ],
  4: [
    {
      id: 'step-4-1',
      stepNumber: 1,
      title: 'Escaneo Somático en 5 Ejes',
      durationMinutes: 10,
      phaseType: 'Centramiento & Apertura',
      description: 'Auditoría física de la tensión en cabeza, garganta, pecho, diafragma y pelvis.',
      keyInstructions: ['Respirar llevando luz y distensión a cada zona contraída.'],
    },
    {
      id: 'step-4-2',
      stepNumber: 2,
      title: 'La Biología del Compromiso Directivo',
      durationMinutes: 20,
      phaseType: 'Marco Teórico Ontológico',
      description: 'Cómo el cuerpo comunica liderazgo, autoridad moral y apertura antes que la voz.',
      keyInstructions: ['Comprender la relación entre postura corporal y química cerebral.'],
    },
    {
      id: 'step-4-3',
      stepNumber: 3,
      title: 'Laboratorio de Presencia e Impacto Verbal',
      durationMinutes: 25,
      phaseType: 'Dinámica Vivencial',
      description: 'Práctica de proyectar la voz desde el centro corporal en lugar de la garganta apretada.',
      keyInstructions: ['Hablar sosteniendo el aire en el diafragma con volumen natural.'],
    },
    {
      id: 'step-4-4',
      stepNumber: 4,
      title: 'Reseteo Somático en 90 Segundos',
      durationMinutes: 20,
      phaseType: 'Práctica Somática',
      description: 'Técnica de regulación del nervio vago para antes de juntas y presentaciones complejas.',
      keyInstructions: ['Exhalación prolongada con sonido "S" para bajar la frecuencia cardíaca.'],
    },
    {
      id: 'step-4-5',
      stepNumber: 5,
      title: 'Protocolo Diario de Encarnación Directiva',
      durationMinutes: 15,
      phaseType: 'Cierre & Acuerdos',
      description: 'Establecer disparadores diarios para recordar la postura centrada y serena.',
      keyInstructions: ['Elegir una alarma o recordatorio visual en el escritorio.'],
    },
  ],
  5: [
    {
      id: 'step-5-1',
      stepNumber: 1,
      title: 'Centramiento en el Horizonte de Posibilidad',
      durationMinutes: 10,
      phaseType: 'Centramiento & Apertura',
      description: 'Conectar con la visión de largo plazo sin la ansiedad ni el apremio del corto plazo.',
      keyInstructions: ['Visualizar el escenario deseado con todos los sentidos despiertos.'],
    },
    {
      id: 'step-5-2',
      stepNumber: 2,
      title: 'Anatomía de Peticiones, Ofertas y Promesas',
      durationMinutes: 25,
      phaseType: 'Marco Teórico Ontológico',
      description: 'Las 4 fases de la coordinación de acciones y cómo evitar promesas rotas o malentendidos.',
      keyInstructions: ['Explicar el ciclo: Preparación, Negociación, Ejecución y Evaluación.'],
    },
    {
      id: 'step-5-3',
      stepNumber: 3,
      title: 'Diseño de la Red de Ayuda y Conversaciones de Futuro',
      durationMinutes: 25,
      phaseType: 'Dinámica Vivencial',
      description: 'Identificar a las personas clave a quienes solicitar colaboración estratégica impecable.',
      keyInstructions: ['Redactar 2 peticiones formales con fecha y condiciones exactas.'],
    },
    {
      id: 'step-5-4',
      stepNumber: 4,
      title: 'Corporalidad de la Oferta Impecable',
      durationMinutes: 15,
      phaseType: 'Práctica Somática',
      description: 'Habitar la generosidad y el valor propio al proponer acuerdos y proyectos de impacto.',
      keyInstructions: ['Apertura de brazos y mirada limpia sin suplicar ni exigir.'],
    },
    {
      id: 'step-5-5',
      stepNumber: 5,
      title: 'Acuerdos de Ejecución y Renegociación',
      durationMinutes: 15,
      phaseType: 'Cierre & Acuerdos',
      description: 'Compromisos de entrega y protocolo de aviso temprano ante cualquier imprevisto.',
      keyInstructions: ['Fijar el estándar de cumplimiento y respeto a la palabra empeñada.'],
    },
  ],
  6: [
    {
      id: 'step-6-1',
      stepNumber: 1,
      title: 'Centramiento en la Gratitud y la Presencia',
      durationMinutes: 10,
      phaseType: 'Centramiento & Apertura',
      description: 'Reconocer el camino recorrido, los quiebres superados y la nueva coherencia alcanzada.',
      keyInstructions: ['Agradecer al propio proceso y a los compañeros de viaje.'],
    },
    {
      id: 'step-6-2',
      stepNumber: 2,
      title: 'La Soberanía Ontológica como Manera de Ser',
      durationMinutes: 20,
      phaseType: 'Marco Teórico Ontológico',
      description: 'Cómo sostener al nuevo observador en contextos cambiantes, exigentes y de alta presión.',
      keyInstructions: ['Integrar lenguaje, cuerpo y emoción como una tríada indivisible.'],
    },
    {
      id: 'step-6-3',
      stepNumber: 3,
      title: 'Proclamación del Manifiesto de Soberanía Personal',
      durationMinutes: 30,
      phaseType: 'Dinámica Vivencial',
      description: 'Lectura y firma del compromiso ontológico con la propia vida y liderazgo.',
      keyInstructions: ['Cada participante lee su manifiesto en voz alta ante la comunidad.'],
    },
    {
      id: 'step-6-4',
      stepNumber: 4,
      title: 'Arquetipo Somático del Soberano',
      durationMinutes: 15,
      phaseType: 'Práctica Somática',
      description: 'Anclar corporalmente la serenidad inquebrantable ante cualquier circunstancia.',
      keyInstructions: ['Postura de arraigo profundo, pecho espacioso y respiración calmada.'],
    },
    {
      id: 'step-6-5',
      stepNumber: 5,
      title: 'Cierre del Ciclo y Plan de Sostenibilidad Vital',
      durationMinutes: 15,
      phaseType: 'Cierre & Acuerdos',
      description: 'Fijar el cronograma de revisiones trimestrales y entrega de certificado de logro.',
      keyInstructions: ['Declarar el inicio formal de la nueva etapa de vida.'],
    },
  ],
};

export const INITIAL_QUESTIONNAIRES: DynamicQuestionnaire[] = [
  {
    id: 'questionnaire-workshop-1',
    targetType: 'workshop_node',
    targetStep: 1,
    title: 'Cuestionario Ontológico - Taller 1: Transparencia y Quiebres',
    description: 'Autodiagnóstico para identificar automatismos cotidianos, costos invisibles y quiebres no declarados.',
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'q-w1-1',
        questionnaireId: 'questionnaire-workshop-1',
        order: 1,
        label: '¿Qué emoción o sensación física identificas hoy en tu cuerpo antes de iniciar el taller?',
        placeholder: 'Ej: Percibo una tensión constante en los hombros, respiración superficial y aceleración...',
        helperText: 'Describe el estado somático presente: mandíbula apretada, pesadez, inquietud o serenidad.',
        type: 'textarea',
        required: true,
        category: 'somático',
      },
      {
        id: 'q-w1-2',
        questionnaireId: 'questionnaire-workshop-1',
        order: 2,
        label: '¿En qué áreas de tu vida estás operando en piloto automático tolerando costos ocultos?',
        placeholder: 'Ej: Acepto tareas adicionales en el trabajo sin evaluar mi capacidad real...',
        helperText: 'Identifica la rutina donde actúas sin reflexionar y que genera desgaste silencioso.',
        type: 'textarea',
        required: true,
        category: 'lingüístico',
      },
      {
        id: 'q-w1-3',
        questionnaireId: 'questionnaire-workshop-1',
        order: 3,
        label: 'Registra los límites que has omitido declarar y los acuerdos tácitos que drenan tu energía',
        placeholder: 'Ej: No he aclarado el alcance de mi disponibilidad fuera de horario laboral...',
        helperText: 'Nombra con precisión la conversación no dicha.',
        type: 'textarea',
        required: false,
        category: 'acuerdos',
      },
      {
        id: 'q-w1-4',
        questionnaireId: 'questionnaire-workshop-1',
        order: 4,
        label: 'Nivel de coherencia somática y claridad mental actual (Escala 1 a 10)',
        type: 'rating_scale',
        required: true,
        category: 'somático',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Muy disperso / tenso',
        scaleMaxLabel: 'Plena presencia y serenidad',
      },
    ],
  },
  {
    id: 'questionnaire-workshop-2',
    targetType: 'workshop_node',
    targetStep: 2,
    title: 'Cuestionario Ontológico - Taller 2: Fronteras y Límites No Dichos',
    description: 'Diagnóstico de la capacidad de emitir el "Basta" ontológico y proclamar límites sin culpa.',
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'q-w2-1',
        questionnaireId: 'questionnaire-workshop-2',
        order: 1,
        label: '¿En qué parte de tu cuerpo registras la culpa o vacilación al poner límites?',
        placeholder: 'Ej: Siento un nudo en la garganta y opresión en el plexo solar...',
        helperText: 'La culpa se manifiesta corporalmente antes de convertirse en narrativa de duda.',
        type: 'textarea',
        required: true,
        category: 'somático',
      },
      {
        id: 'q-w2-2',
        questionnaireId: 'questionnaire-workshop-2',
        order: 2,
        label: '¿Qué conversación difícil has estado postergando y qué límite requieres proclamar?',
        placeholder: 'Ej: Conversación con mi socio sobre la redistribución equitativa de cargas directivas...',
        helperText: 'Estructura el límite con firmeza, serenidad y respeto por ti mismo.',
        type: 'textarea',
        required: true,
        category: 'lingüístico',
      },
      {
        id: 'q-w2-3',
        questionnaireId: 'questionnaire-workshop-2',
        order: 3,
        label: '¿A qué le estás diciendo "Sí" cuando tu cuerpo te pide un rotundo "No"?',
        placeholder: 'Ej: A solicitudes de reuniones no productivas que sacrifican mi tiempo reflexivo...',
        helperText: 'Explora el costo de la sobre-adaptación en tu bienestar.',
        type: 'textarea',
        required: false,
        category: 'emocional',
      },
      {
        id: 'q-w2-4',
        questionnaireId: 'questionnaire-workshop-2',
        order: 4,
        label: 'Firmeza postural para sostener un "Basta" sin agresión ni disculpa (Escala 1 a 10)',
        type: 'rating_scale',
        required: true,
        category: 'somático',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Me quiebro con facilidad',
        scaleMaxLabel: 'Soberanía y serenidad total',
      },
    ],
  },
  {
    id: 'questionnaire-workshop-3',
    targetType: 'workshop_node',
    targetStep: 3,
    title: 'Cuestionario Ontológico - Taller 3: El Juicio Maestro y Narrativas',
    description: 'Deconstrucción de mandatos y creencias limitantes que condicionan tu toma de decisiones.',
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'q-w3-1',
        questionnaireId: 'questionnaire-workshop-3',
        order: 1,
        label: '¿Cuál es el juicio maestro o creencia limitante que más se repite bajo presión?',
        placeholder: 'Ej: "Si no tengo el control absoluto, todo colapsará y seré juzgado"...',
        helperText: 'Aquella frase interna que opera como verdad incuestionable.',
        type: 'textarea',
        required: true,
        category: 'lingüístico',
      },
      {
        id: 'q-w3-2',
        questionnaireId: 'questionnaire-workshop-3',
        order: 2,
        label: '¿Qué evidencias concretas sustentan ese juicio y qué hechos observables lo desmienten?',
        placeholder: 'Ej: En el proyecto anterior delegué y el equipo respondió de forma brillante...',
        helperText: 'Separa los hechos fácticos de las interpretaciones subjetivas.',
        type: 'textarea',
        required: true,
        category: 'lingüístico',
      },
      {
        id: 'q-w3-3',
        questionnaireId: 'questionnaire-workshop-3',
        order: 3,
        label: 'Nueva narrativa o declaración de confianza que eliges adoptar',
        placeholder: 'Ej: "Confío en la capacidad colectiva y lidero desde la visión lúcida"...',
        helperText: 'Construye la afirmación fundacional del nuevo observador.',
        type: 'textarea',
        required: false,
        category: 'acuerdos',
      },
      {
        id: 'q-w3-4',
        questionnaireId: 'questionnaire-workshop-3',
        order: 4,
        label: 'Capacidad de suspender juicios automáticos en momentos críticos (Escala 1 a 10)',
        type: 'rating_scale',
        required: true,
        category: 'metodológico',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Reacción impulsiva',
        scaleMaxLabel: 'Pausa reflexiva lúcida',
      },
    ],
  },
  {
    id: 'questionnaire-workshop-4',
    targetType: 'workshop_node',
    targetStep: 4,
    title: 'Cuestionario Ontológico - Taller 4: Corporalidad y Decodificación Somática',
    description: 'Análisis de la coherencia entre cuerpo, lenguaje y emoción en el liderazgo directivo.',
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'q-w4-1',
        questionnaireId: 'questionnaire-workshop-4',
        order: 1,
        label: '¿Cuál es tu disposición corporal predominante en escenarios de conflicto o tensión?',
        placeholder: 'Selecciona la postura física habitual...',
        type: 'select',
        options: [
          'Presencia centrada, vertical y respiración profunda',
          'Tensión en hombros y tendencia a la confrontación defensiva',
          'Repliegue, encorvamiento y respiración contenida',
          'Hiperactividad motora y aceleración verbal',
        ],
        required: true,
        category: 'somático',
      },
      {
        id: 'q-w4-2',
        questionnaireId: 'questionnaire-workshop-4',
        order: 2,
        label: 'Describe la micro-pausa o ritual corporal que aplicarás antes de conversaciones clave',
        placeholder: 'Ej: 90 segundos de respiración diafragmática y arraigo en planta de pies...',
        helperText: 'Un hábito somático de fácil aplicación en tu rutina profesional.',
        type: 'textarea',
        required: true,
        category: 'somático',
      },
      {
        id: 'q-w4-3',
        questionnaireId: 'questionnaire-workshop-4',
        order: 3,
        label: 'Conexión consciente con tu cuerpo a lo largo de la jornada (Escala 1 a 10)',
        type: 'rating_scale',
        required: true,
        category: 'somático',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Desconexión total (cabeza pura)',
        scaleMaxLabel: 'Consciencia somática continua',
      },
    ],
  },
  {
    id: 'questionnaire-workshop-5',
    targetType: 'workshop_node',
    targetStep: 5,
    title: 'Cuestionario Ontológico - Taller 5: Conversaciones de Posibilidad y Diseño de Futuro',
    description: 'Estructuración de ofertas, peticiones y promesas para materializar horizontes estratégicos.',
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'q-w5-1',
        questionnaireId: 'questionnaire-workshop-5',
        order: 1,
        label: '¿Qué conversación de futuro necesitas abrir y con quién?',
        placeholder: 'Ej: Con mi comité de dirección para redefinir el modelo de expansión...',
        helperText: 'Abre el espacio lingüístico para lo que aún no existe en el presente.',
        type: 'textarea',
        required: true,
        category: 'lingüístico',
      },
      {
        id: 'q-w5-2',
        questionnaireId: 'questionnaire-workshop-5',
        order: 2,
        label: 'Diseño de la petición: ¿Qué pides con precisión, para cuándo y bajo qué condiciones de satisfacción?',
        placeholder: 'Ej: Solicito la confirmación de presupuesto antes del 15 del mes próximo...',
        helperText: 'Una petición impecable elimina la ambigüedad y el resentimiento posterior.',
        type: 'textarea',
        required: true,
        category: 'acuerdos',
      },
      {
        id: 'q-w5-3',
        questionnaireId: 'questionnaire-workshop-5',
        order: 3,
        label: 'Nivel de confianza en tu capacidad para coordinar acciones estratégicas (1 a 10)',
        type: 'rating_scale',
        required: true,
        category: 'metodológico',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Dudas e inseguridad',
        scaleMaxLabel: 'Certeza ejecutiva',
      },
    ],
  },
  {
    id: 'questionnaire-workshop-6',
    targetType: 'workshop_node',
    targetStep: 6,
    title: 'Cuestionario Ontológico - Taller 6: Soberanía, Integración y Cierre de Ciclo',
    description: 'Consolidación de la nueva identidad directiva y sostenibilidad del nuevo observador.',
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'q-w6-1',
        questionnaireId: 'questionnaire-workshop-6',
        order: 1,
        label: '¿Cuál ha sido la transformación ontológica más profunda que experimentaste en este viaje?',
        placeholder: 'Ej: Dejé de actuar desde la complacencia y ahora elijo mis compromisos con dignidad...',
        helperText: 'Sintetiza la evolución de tu ser en lenguaje, emoción y cuerpo.',
        type: 'textarea',
        required: true,
        category: 'emocional',
      },
      {
        id: 'q-w6-2',
        questionnaireId: 'questionnaire-workshop-6',
        order: 2,
        label: 'Tu Declaración Fundacional de Soberanía Directiva y Personal',
        placeholder: 'Ej: "Declaro habitar mi liderazgo con límites impecables, presencia somática y serenidad"...',
        helperText: 'La proclama que sella y protege tu proceso de crecimiento.',
        type: 'textarea',
        required: true,
        category: 'acuerdos',
      },
      {
        id: 'q-w6-3',
        questionnaireId: 'questionnaire-workshop-6',
        order: 3,
        label: 'Nivel de apropiación y certeza en tu plan de sostenibilidad (Escala 1 a 10)',
        type: 'rating_scale',
        required: true,
        category: 'metodológico',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Riesgo de recaída',
        scaleMaxLabel: 'Integración permanente',
      },
    ],
  },
  {
    id: 'questionnaire-post-session-general',
    targetType: 'post_session',
    title: 'Cuestionario de Evaluación Post-Sesión 1 a 1 (Bitácora del Consultor)',
    description: 'Protocolo formal para registrar el progreso ontológico del coachee tras cada sesión individual.',
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'q-ps-1',
        questionnaireId: 'questionnaire-post-session-general',
        order: 1,
        label: '¿Qué emoción principal habitó al coachee hoy y cuál fue su nivel de resistencia o apertura?',
        placeholder: 'Ej: Inició en resignación y sobrecarga; tras el quiebre emergió vulnerabilidad y alivio...',
        helperText: 'Registra la transición emocional y la disposición corporal a la indagación ontológica.',
        type: 'textarea',
        required: true,
        category: 'emocional',
      },
      {
        id: 'q-ps-2',
        questionnaireId: 'questionnaire-post-session-general',
        order: 2,
        label: '¿Cuál fue el juicio maestro o narrativa limitante que estructuró su discurso?',
        placeholder: 'Ej: "Tengo que cargar con el peso de la organización porque nadie más lo hará con mi estándar"...',
        helperText: 'Identifica la estructura de creencias arraigada en su modelo mental.',
        type: 'textarea',
        required: true,
        category: 'lingüístico',
      },
      {
        id: 'q-ps-3',
        questionnaireId: 'questionnaire-post-session-general',
        order: 3,
        label: '¿Qué evidencia de cambio de perspectiva o nuevo nivel de consciencia demostró?',
        placeholder: 'Ej: Declaró un quiebre formal y reconoció el costo en salud de su sobre-adaptación...',
        helperText: 'Hechos verificables del quiebre cognitivo y somático.',
        type: 'textarea',
        required: true,
        category: 'lingüístico',
      },
      {
        id: 'q-ps-4',
        questionnaireId: 'questionnaire-post-session-general',
        order: 4,
        label: '¿En qué momento fui más directivo de lo necesario y qué competencia ICF debo cuidar más?',
        placeholder: 'Ej: Cuidar competencia 7 (Evoca conciencia): permitir silencios más prolongados sin apresurar...',
        helperText: 'Reflexión deontológica y mejora continua del consultor ontológico.',
        type: 'textarea',
        required: true,
        category: 'metodológico',
      },
      {
        id: 'q-ps-5',
        questionnaireId: 'questionnaire-post-session-general',
        order: 5,
        label: 'Declaración clave o compromiso fundamental co-creado en la sesión',
        placeholder: 'Ej: "Declaro poner fin a la jornada laboral a las 6:30 PM sin justificaciones"...',
        helperText: 'El acuerdo principal que el coachee integrará a su vida.',
        type: 'text',
        required: false,
        category: 'acuerdos',
      },
      {
        id: 'q-ps-6',
        questionnaireId: 'questionnaire-post-session-general',
        order: 6,
        label: 'Tarea o micro-práctica somática acordada para la quincena',
        placeholder: 'Ej: 5 minutos diarios de centramiento y respiración consciente al iniciar la mañana...',
        helperText: 'Práctica corporal de arraigo y presencia.',
        type: 'textarea',
        required: false,
        category: 'somático',
      },
    ],
  },
];

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
  'https://calendar.app.google/UYJSud4znEcyUo717';

export const DEFAULT_MATRIX_URL =
  'https://drive.google.com/file/d/rbc-matriz-raiz-y-balance.pdf';

export const DEFAULT_PORTAL_URL =
  window.location.origin || 'https://rengifobasto.com';

export const DEFAULT_WHATSAPP_TEMPLATE = `Hola {{name}}, te escribo de Rengifo Basto Consultoría Ontológica tras el Conversatorio Raíz y Balance.

Aquí tienes tu acceso a la Matriz Ontológica de Fronteras y Límites:
👉 {{matrixUrl}}

Para ayudarte a decodificar tus resultados y estructurar tus declaraciones de soberanía personal, tienes habilitada una Sesión de Exploración de 20 minutos sin costo:
🗓️ {{calendarUrl}}

Un saludo,
John Fredy Rengifo Basto | Rengifo Basto Consultoría Ontológica`;

export const DEFAULT_WELCOME_MESSAGE_TEMPLATE = `Bienvenido/a al programa ontológico de 12 semanas "Certeza, Fronteras & Dirección Personal" de Rengifo Basto Consultoría Ontológica, {{name}}.

Hemos confirmado tu inversión ({{paymentStatus}}). Tu espacio personal de trabajo e introspección ya ha sido habilitado:
👉 {{portalUrl}}

Tu hoja de ruta inicia en el Nodo 1: Mapeo de la Transparencia & Decodificación Somática.
Puedes ingresar con tu correo registrado ({{email}}) para acceder a tus bitácoras de sesión y autorregistros guiados.

Un saludo,
John Fredy Rengifo Basto | Rengifo Basto Consultoría Ontológica`;

export class OntologicalStore {
  private static load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data || data === 'undefined' || data === 'null') {
        return fallback;
      }
      const parsed = JSON.parse(data);
      if (parsed === null || parsed === undefined) {
        return fallback;
      }
      if (Array.isArray(fallback)) {
        if (!Array.isArray(parsed)) {
          return fallback;
        }
        return parsed as unknown as T;
      }
      return parsed;
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
    const list = this.load<ProgramNodeInfo[]>(
      STORAGE_KEYS.PROGRAM_NODES,
      PROGRAM_NODES
    );
    const safe = Array.isArray(list) && list.length > 0 ? list : PROGRAM_NODES;
    safe.forEach((node) => {
      if (!node.roadmapSteps || node.roadmapSteps.length === 0) {
        node.roadmapSteps = DEFAULT_ROADMAP_STEPS[node.step] || [];
      }
    });
    return safe;
  }

  static saveProgramNodes(nodes: ProgramNodeInfo[]): void {
    this.save(STORAGE_KEYS.PROGRAM_NODES, nodes);
    PROGRAM_NODES.length = 0;
    PROGRAM_NODES.push(...nodes);
  }

  static updateProgramNode(
    step: number,
    updates: Partial<ProgramNodeInfo>
  ): ProgramNodeInfo | null {
    const nodes = this.getProgramNodes();
    let updatedNode: ProgramNodeInfo | null = null;
    const updated = nodes.map((n) => {
      if (n.step === step) {
        updatedNode = { ...n, ...updates };
        return updatedNode;
      }
      return n;
    });
    this.saveProgramNodes(updated);
    return updatedNode;
  }

  static addRoadmapStep(
    nodeStep: number,
    stepData: Omit<WorkshopRoadmapStep, 'id' | 'stepNumber'>
  ): WorkshopRoadmapStep {
    const nodes = this.getProgramNodes();
    const targetNode = nodes.find((n) => n.step === nodeStep) || nodes[0];
    const currentSteps = targetNode.roadmapSteps || [];
    const newStep: WorkshopRoadmapStep = {
      ...stepData,
      id: `step-${nodeStep}-${Date.now()}`,
      stepNumber: currentSteps.length + 1,
    };
    const updatedSteps = [...currentSteps, newStep];
    this.updateProgramNode(nodeStep, { roadmapSteps: updatedSteps });
    return newStep;
  }

  static updateRoadmapStep(
    nodeStep: number,
    stepId: string,
    updates: Partial<WorkshopRoadmapStep>
  ): WorkshopRoadmapStep | null {
    const nodes = this.getProgramNodes();
    const targetNode = nodes.find((n) => n.step === nodeStep);
    if (!targetNode) return null;
    let updatedStep: WorkshopRoadmapStep | null = null;
    const updatedSteps = (targetNode.roadmapSteps || []).map((s) => {
      if (s.id === stepId) {
        updatedStep = { ...s, ...updates };
        return updatedStep;
      }
      return s;
    });
    if (updatedStep) {
      this.updateProgramNode(nodeStep, { roadmapSteps: updatedSteps });
    }
    return updatedStep;
  }

  static deleteRoadmapStep(nodeStep: number, stepId: string): void {
    const nodes = this.getProgramNodes();
    const targetNode = nodes.find((n) => n.step === nodeStep);
    if (!targetNode) return;
    const filtered = (targetNode.roadmapSteps || [])
      .filter((s) => s.id !== stepId)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    this.updateProgramNode(nodeStep, { roadmapSteps: filtered });
  }

  static reorderRoadmapSteps(nodeStep: number, stepIds: string[]): void {
    const nodes = this.getProgramNodes();
    const targetNode = nodes.find((n) => n.step === nodeStep);
    if (!targetNode) return;
    const map = new Map((targetNode.roadmapSteps || []).map((s) => [s.id, s]));
    const ordered: WorkshopRoadmapStep[] = [];
    stepIds.forEach((id, idx) => {
      const step = map.get(id);
      if (step) {
        ordered.push({ ...step, stepNumber: idx + 1 });
      }
    });
    (targetNode.roadmapSteps || []).forEach((s) => {
      if (!stepIds.includes(s.id)) {
        ordered.push({ ...s, stepNumber: ordered.length + 1 });
      }
    });
    this.updateProgramNode(nodeStep, { roadmapSteps: ordered });
  }

  static resetProgramNodesToDefault(): ProgramNodeInfo[] {
    const fresh = PROGRAM_NODES.map((n) => ({
      ...n,
      roadmapSteps: DEFAULT_ROADMAP_STEPS[n.step] || [],
    }));
    this.saveProgramNodes(fresh);
    return fresh;
  }

  // --- DYNAMIC QUESTIONNAIRES METHODS ---
  static getQuestionnaires(): DynamicQuestionnaire[] {
    const list = this.load<DynamicQuestionnaire[]>(
      STORAGE_KEYS.QUESTIONNAIRES,
      INITIAL_QUESTIONNAIRES
    );
    return Array.isArray(list) && list.length > 0 ? list : INITIAL_QUESTIONNAIRES;
  }

  static saveQuestionnaires(questionnaires: DynamicQuestionnaire[]): void {
    this.save(STORAGE_KEYS.QUESTIONNAIRES, questionnaires);
  }

  static getQuestionnaireById(id: string): DynamicQuestionnaire | undefined {
    const all = this.getQuestionnaires();
    return all.find((q) => q.id === id);
  }

  static getQuestionnaireForWorkshop(step: number): DynamicQuestionnaire {
    const all = this.getQuestionnaires();
    const matched = all.find(
      (q) => q.targetType === 'workshop_node' && q.targetStep === step
    );
    if (matched) return matched;
    const fallback = INITIAL_QUESTIONNAIRES.find(
      (q) => q.targetType === 'workshop_node' && q.targetStep === step
    );
    return fallback || all[0] || INITIAL_QUESTIONNAIRES[0];
  }

  static saveQuestionnaire(questionnaire: DynamicQuestionnaire): void {
    const all = this.getQuestionnaires();
    const exists = all.some((q) => q.id === questionnaire.id);
    const updated = exists
      ? all.map((q) =>
          q.id === questionnaire.id
            ? { ...questionnaire, updatedAt: new Date().toISOString() }
            : q
        )
      : [...all, { ...questionnaire, updatedAt: new Date().toISOString() }];
    this.saveQuestionnaires(updated);
  }

  static addQuestionToQuestionnaire(
    questionnaireId: string,
    questionData: Omit<QuestionnaireQuestion, 'id' | 'order' | 'questionnaireId'>
  ): QuestionnaireQuestion {
    const all = this.getQuestionnaires();
    const target = all.find((q) => q.id === questionnaireId);
    const newQuestion: QuestionnaireQuestion = {
      ...questionData,
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      questionnaireId,
      order: (target?.questions?.length || 0) + 1,
    };

    const updatedList = all.map((q) => {
      if (q.id === questionnaireId) {
        return {
          ...q,
          questions: [...(q.questions || []), newQuestion],
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });

    this.saveQuestionnaires(updatedList);
    return newQuestion;
  }

  static updateQuestionInQuestionnaire(
    questionnaireId: string,
    questionId: string,
    updates: Partial<QuestionnaireQuestion>
  ): QuestionnaireQuestion | null {
    const all = this.getQuestionnaires();
    let updatedQuestion: QuestionnaireQuestion | null = null;

    const updatedList = all.map((q) => {
      if (q.id === questionnaireId) {
        const questions = (q.questions || []).map((ques) => {
          if (ques.id === questionId) {
            updatedQuestion = { ...ques, ...updates };
            return updatedQuestion;
          }
          return ques;
        });
        return { ...q, questions, updatedAt: new Date().toISOString() };
      }
      return q;
    });

    if (updatedQuestion) {
      this.saveQuestionnaires(updatedList);
    }
    return updatedQuestion;
  }

  static deleteQuestionFromQuestionnaire(
    questionnaireId: string,
    questionId: string
  ): void {
    const all = this.getQuestionnaires();
    const updatedList = all.map((q) => {
      if (q.id === questionnaireId) {
        const filtered = (q.questions || [])
          .filter((ques) => ques.id !== questionId)
          .map((ques, idx) => ({ ...ques, order: idx + 1 }));
        return { ...q, questions: filtered, updatedAt: new Date().toISOString() };
      }
      return q;
    });
    this.saveQuestionnaires(updatedList);
  }

  static reorderQuestionsInQuestionnaire(
    questionnaireId: string,
    questionIds: string[]
  ): void {
    const all = this.getQuestionnaires();
    const updatedList = all.map((q) => {
      if (q.id === questionnaireId) {
        const map = new Map((q.questions || []).map((item) => [item.id, item]));
        const ordered: QuestionnaireQuestion[] = [];
        questionIds.forEach((id, idx) => {
          const item = map.get(id);
          if (item) {
            ordered.push({ ...item, order: idx + 1 });
          }
        });
        (q.questions || []).forEach((item) => {
          if (!questionIds.includes(item.id)) {
            ordered.push({ ...item, order: ordered.length + 1 });
          }
        });
        return { ...q, questions: ordered, updatedAt: new Date().toISOString() };
      }
      return q;
    });
    this.saveQuestionnaires(updatedList);
  }

  static resetQuestionnairesToDefault(): DynamicQuestionnaire[] {
    this.saveQuestionnaires(INITIAL_QUESTIONNAIRES);
    return INITIAL_QUESTIONNAIRES;
  }

  static getCronogramaEvents(): CronogramaEvent[] {
    const list = this.load<CronogramaEvent[]>(
      STORAGE_KEYS.CRONOGRAMA_EVENTS,
      INITIAL_CRONOGRAMA_EVENTS
    );
    return Array.isArray(list) ? list : INITIAL_CRONOGRAMA_EVENTS;
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

  static addCronogramaEvent(eventData: Omit<CronogramaEvent, 'id'>): CronogramaEvent {
    const events = this.getCronogramaEvents();
    const newEvent: CronogramaEvent = {
      ...eventData,
      id: 'event-' + Date.now(),
    };
    if (newEvent.featured) {
      // Un-feature other events
      events.forEach((e) => {
        e.featured = false;
      });
    }
    const updated = [newEvent, ...events];
    this.saveCronogramaEvents(updated);
    return newEvent;
  }

  static deleteCronogramaEvent(id: string): void {
    const events = this.getCronogramaEvents();
    const updated = events.filter((e) => e.id !== id);
    if (updated.length > 0 && !updated.some((e) => e.featured)) {
      updated[0].featured = true;
    }
    this.saveCronogramaEvents(updated);
  }

  // --- ONTOLOGICAL PROGRAMS CATALOGUE & QUOTAS ---
  static getPrograms(): OntologicalProgram[] {
    const list = this.load<OntologicalProgram[]>(
      STORAGE_KEYS.PROGRAMS,
      INITIAL_PROGRAMS
    );
    if (!Array.isArray(list) || list.length === 0) return INITIAL_PROGRAMS;
    // Sanitize in case old localStorage had duplicate events under programs
    const hasLegacyDuplicates = list.some(
      (p) =>
        p.name.toLowerCase().includes('conversatorio raíz') ||
        p.name.toLowerCase().includes('masterclass: sabiduría adaptativa')
    );
    if (hasLegacyDuplicates) {
      this.savePrograms(INITIAL_PROGRAMS);
      return INITIAL_PROGRAMS;
    }
    return list;
  }

  static savePrograms(programs: OntologicalProgram[]): void {
    this.save(STORAGE_KEYS.PROGRAMS, programs);
  }

  static addProgram(programData: Omit<OntologicalProgram, 'id'>): OntologicalProgram {
    const programs = this.getPrograms();
    const newProgram: OntologicalProgram = {
      ...programData,
      id: 'prog-' + Date.now(),
    };
    const updated = [newProgram, ...programs];
    this.savePrograms(updated);
    return newProgram;
  }

  static updateProgram(
    id: string,
    updates: Partial<OntologicalProgram>
  ): OntologicalProgram | null {
    const programs = this.getPrograms();
    let updatedProgram: OntologicalProgram | null = null;
    const updated = programs.map((p) => {
      if (p.id === id) {
        updatedProgram = { ...p, ...updates };
        return updatedProgram;
      }
      return p;
    });
    this.savePrograms(updated);
    return updatedProgram;
  }

  static deleteProgram(id: string): void {
    const programs = this.getPrograms();
    const updated = programs.filter((p) => p.id !== id);
    this.savePrograms(updated);
  }

  // --- EVENT REGISTRATIONS & RSVP ---
  static getEventRegistrations(): EventRegistration[] {
    const list = this.load<EventRegistration[]>(
      STORAGE_KEYS.EVENT_REGISTRATIONS,
      INITIAL_EVENT_REGISTRATIONS
    );
    return Array.isArray(list) ? list : INITIAL_EVENT_REGISTRATIONS;
  }

  static saveEventRegistrations(registrations: EventRegistration[]): void {
    this.save(STORAGE_KEYS.EVENT_REGISTRATIONS, registrations);
  }

  static updateEventRegistration(id: string, updates: Partial<EventRegistration>): void {
    const list = this.getEventRegistrations();
    const updated = list.map((r) => (r.id === id || r.ticketCode === id ? { ...r, ...updates } : r));
    this.saveEventRegistrations(updated);
  }

  static addEventRegistration(params: {
    eventId: string;
    name: string;
    email: string;
    phone?: string;
    attended?: boolean;
  }): EventRegistration {
    return this.addManualEventRegistration({
      eventId: params.eventId,
      name: params.name,
      email: params.email,
      phone: params.phone || '',
      attended: params.attended,
    });
  }

  static deleteEventRegistration(id: string): void {
    const registrations = this.getEventRegistrations();
    const target = registrations.find((r) => r.id === id || r.ticketCode === id);
    if (target) {
      // restore spot if event exists
      const events = this.getCronogramaEvents();
      const evt = events.find((e) => e.id === target.eventId);
      if (evt && evt.spotsLeft < evt.totalSpots) {
        this.updateCronogramaEvent(evt.id, {
          spotsLeft: Math.min(evt.totalSpots, evt.spotsLeft + 1),
        });
      }
    }
    const updated = registrations.filter((r) => r.id !== id && r.ticketCode !== id);
    this.saveEventRegistrations(updated);
  }

  static addManualEventRegistration(params: {
    eventId: string;
    name: string;
    email: string;
    phone: string;
    attended?: boolean;
  }): EventRegistration {
    const events = this.getCronogramaEvents();
    const targetEvent = events.find((e) => e.id === params.eventId) || events[0] || INITIAL_CRONOGRAMA_EVENTS[0];
    
    if (targetEvent.spotsLeft > 0) {
      this.updateCronogramaEvent(targetEvent.id, {
        spotsLeft: Math.max(0, targetEvent.spotsLeft - 1),
      });
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const ticketCode = `RBC-MANUAL-${randomSuffix}`;
    const regId = `reg-${Date.now()}`;

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
      attendedEvent: Boolean(params.attended),
      googleAuthConnected: false,
    };

    const registrations = this.getEventRegistrations();
    this.saveEventRegistrations([newRegistration, ...registrations]);
    return newRegistration;
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
    FirestoreSyncService.syncEventRegistration(newRegistration).catch(() => {});
    FirestoreSyncService.syncUserProfile(existingUser).catch(() => {});

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
    let safeUsers = Array.isArray(rawUsers) ? rawUsers : INITIAL_USERS;

    // Ensure Andres Quintero is always present as a client who has 100% paid the workshop
    if (!safeUsers.some((u) => u.uid === 'client-andres' || u.email === 'andres.quintero@example.com')) {
      const andres = INITIAL_USERS.find((u) => u.uid === 'client-andres');
      if (andres) {
        safeUsers = [...safeUsers, andres];
      }
    }

    // Ensure coach profile is always accurately named and has the latest avatar, and ensure clients have default status & breakdown
    return safeUsers.map((u) => {
      if (u.uid === 'coach-1' || u.role === 'coach') {
        return {
          ...u,
          name: 'John Fredy Rengifo Basto',
          avatarUrl: coachAvatarImg,
        };
      }
      if (u.uid === 'client-andres' || u.name.toLowerCase().includes('andres quintero')) {
        return {
          ...u,
          paymentStatus: 'Completado',
          totalInvested: '$1.500.000 COP',
          status: 'active',
          primaryBreakdown: u.primaryBreakdown || 'Quiebre de autoexigencia extrema, delegación y presencia directiva',
        };
      }
      // Guarantee client defaults for status, totalInvested and primaryBreakdown
      return {
        ...u,
        status: u.status || 'active',
        totalInvested:
          u.totalInvested ||
          (u.paymentStatus === 'Cuota 1 de 2'
            ? '$750.000 COP'
            : '$1.500.000 COP'),
        primaryBreakdown:
          u.primaryBreakdown ||
          (u.uid === 'client-1'
            ? 'Autoexigencia y límites no dichos con directivos'
            : u.uid === 'client-2'
            ? 'Gestión de la ira y reactividad con socios'
            : u.uid === 'client-3'
            ? 'Crisis de identidad directiva y propósito'
            : 'Fronteras, auto-observación y claridad directiva'),
      };
    });
  }

  static saveUsers(users: User[]): void {
    this.save(STORAGE_KEYS.USERS, users);
  }

  static updateClientStatus(clientId: string, status: 'active' | 'waiting' | 'inactive'): User | null {
    const users = this.getUsers();
    let updatedUser: User | null = null;
    const updatedUsers = users.map((u) => {
      if (u.uid === clientId) {
        updatedUser = { ...u, status, lastActivityAt: new Date().toISOString() };
        return updatedUser;
      }
      return u;
    });
    if (updatedUser) {
      this.saveUsers(updatedUsers);
    }
    return updatedUser;
  }

  static updateClientBreakdown(clientId: string, breakdown: string): User | null {
    const users = this.getUsers();
    let updatedUser: User | null = null;
    const updatedUsers = users.map((u) => {
      if (u.uid === clientId) {
        updatedUser = { ...u, primaryBreakdown: breakdown.trim(), lastActivityAt: new Date().toISOString() };
        return updatedUser;
      }
      return u;
    });
    if (updatedUser) {
      this.saveUsers(updatedUsers);
    }
    return updatedUser;
  }

  static updateClientInvested(clientId: string, totalInvested: string): User | null {
    const users = this.getUsers();
    let updatedUser: User | null = null;
    const updatedUsers = users.map((u) => {
      if (u.uid === clientId) {
        updatedUser = { ...u, totalInvested: totalInvested.trim(), lastActivityAt: new Date().toISOString() };
        return updatedUser;
      }
      return u;
    });
    if (updatedUser) {
      this.saveUsers(updatedUsers);
    }
    return updatedUser;
  }

  static updateUser(clientId: string, patch: Partial<User>): User | null {
    const users = this.getUsers();
    let updatedUser: User | null = null;
    const updatedUsers = users.map((u) => {
      if (u.uid === clientId) {
        updatedUser = { ...u, ...patch, lastActivityAt: new Date().toISOString() };
        return updatedUser;
      }
      return u;
    });
    if (updatedUser) {
      this.saveUsers(updatedUsers);
      FirestoreSyncService.syncUserProfile(updatedUser).catch(() => {});
    }
    return updatedUser;
  }

  static cancelUserSubscription(clientId: string): User | null {
    const users = this.getUsers();
    let updatedUser: User | null = null;
    const updatedUsers = users.map((u) => {
      if (u.uid === clientId) {
        updatedUser = {
          ...u,
          status: 'inactive',
          notes: (u.notes ? u.notes + '\n' : '') + `[${new Date().toLocaleDateString('es-CO')}] Suscripción cancelada a solicitud del participante.`,
          lastActivityAt: new Date().toISOString(),
        };
        return updatedUser;
      }
      return u;
    });
    if (updatedUser) {
      this.saveUsers(updatedUsers);
    }
    return updatedUser;
  }

  static reactivateUserSubscription(clientId: string): User | null {
    const users = this.getUsers();
    let updatedUser: User | null = null;
    const updatedUsers = users.map((u) => {
      if (u.uid === clientId) {
        updatedUser = {
          ...u,
          status: 'active',
          notes: (u.notes ? u.notes + '\n' : '') + `[${new Date().toLocaleDateString('es-CO')}] Suscripción reactivada por el participante.`,
          lastActivityAt: new Date().toISOString(),
        };
        return updatedUser;
      }
      return u;
    });
    if (updatedUser) {
      this.saveUsers(updatedUsers);
    }
    return updatedUser;
  }

  static deleteUserAccount(userId: string): boolean {
    const users = this.getUsers();
    const filteredUsers = users.filter((u) => u.uid !== userId);
    if (filteredUsers.length === users.length) {
      return false;
    }
    this.saveUsers(filteredUsers);

    // Clean up client sessions
    try {
      const sessions = this.getSessions();
      const remainingSessions = sessions.filter((s) => s.clientId !== userId);
      this.saveSessions(remainingSessions);
    } catch {
      // ignore
    }

    // Clean up client forms
    try {
      const forms = this.getForms();
      const remainingForms = forms.filter((f) => f.clientId !== userId);
      this.saveForms(remainingForms);
    } catch {
      // ignore
    }

    // Clean up client postSessionForms
    try {
      const postForms = this.getPostSessionForms();
      const remainingPostForms = postForms.filter((pf) => pf.clientId !== userId);
      this.savePostSessionForms(remainingPostForms);
    } catch {
      // ignore
    }

    // Clean up client payment requests
    try {
      const payRequests = this.getPaymentRequests();
      const remainingPayRequests = payRequests.filter((pr) => pr.clientId !== userId);
      this.savePaymentRequests(remainingPayRequests);
    } catch {
      // ignore
    }

    // If current user is deleted, clear session
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (currentId === userId) {
      this.setCurrentUser(null);
    }

    return true;
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

  static getUserByEmail(email: string): User | null {
    if (!email || !email.trim()) {
      return null;
    }
    const normalized = email.trim().toLowerCase();
    const users = this.getUsers();

    // 1. Direct match with existing users
    const directMatch = users.find((u) => u.email.trim().toLowerCase() === normalized);
    if (directMatch) {
      return directMatch;
    }

    // 2. Recognized Coach/Admin email variants
    if (
      normalized === 'johnfrengifob@gmail.com' ||
      normalized === 'rengifobastoco@gmail.com' ||
      normalized === 'coach@rbc.com' ||
      normalized === 'admin@rbc.com' ||
      normalized === 'admin@rengifobasto.com'
    ) {
      const coach = users.find((u) => u.role === 'coach');
      if (coach) {
        return coach;
      }
    }

    return null;
  }

  static authenticateByEmail(email: string): {
    success: boolean;
    user?: User;
    error?: string;
  } {
    const user = this.getUserByEmail(email);
    if (!user) {
      return {
        success: false,
        error:
          'El correo electrónico no se encuentra registrado en el Directorio Maestro de Google Sheets ni en la base de datos de participantes.',
      };
    }
    this.setCurrentUser(user.uid);
    return {
      success: true,
      user,
    };
  }

  // --- PROSPECTS CRM LOGIC ---
  static getProspects(): Prospect[] {
    const list = this.load<Prospect[]>(STORAGE_KEYS.PROSPECTS, INITIAL_PROSPECTS);
    return Array.isArray(list) ? list : INITIAL_PROSPECTS;
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
    FirestoreSyncService.syncProspect(newProspect).catch(() => {});
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
        const currentProgress = u.programProgress || 1;
        // If targetStep is greater than currentProgress, set it;
        // if targetStep <= currentProgress, advance by at least 1 step (up to 6)
        const resolvedStep =
          targetStep > currentProgress
            ? targetStep
            : Math.min(6, currentProgress + 1);

        const nextProgress = Math.min(6, Math.max(currentProgress, resolvedStep));
        updatedUser = {
          ...u,
          programProgress: nextProgress,
          paymentStatus: paymentStatus,
          status: 'active',
        };
        return updatedUser;
      }
      return u;
    });

    if (updatedUser) {
      this.saveUsers(updatedUsers);

      // Apertura de estado en las sesiones pagadas
      const isFullPlan = paymentStatus === 'Pago Único' || targetStep === 6;
      const stepsToOpen = isFullPlan
        ? [1, 2, 3, 4, 5, 6]
        : Array.from({ length: targetStep }, (_, i) => i + 1);

      this.openSessionsForPayment(
        clientId,
        stepsToOpen,
        undefined,
        isFullPlan ? 'full' : 'level'
      );
    }

    return updatedUser;
  }

  /**
   * Apertura de estado para las sesiones pagadas por el coachee.
   * Modifica el estado de las sesiones a 'scheduled' (Abierta / Programada),
   * asigna enlaces verificados de Google Meet, fechas de cronograma quincenal
   * y las marca con sello de pago validado.
   */
  static openSessionsForPayment(
    clientId: string,
    stepsToOpen: number[],
    paymentRequestId?: string,
    planType: 'level' | 'full' = 'level'
  ): Session[] {
    const sessions = this.getSessions();
    const updatedSessions = [...sessions];
    const openedSessions: Session[] = [];
    const now = Date.now();

    stepsToOpen.forEach((step, index) => {
      const existingIndex = updatedSessions.findIndex(
        (s) => s.clientId === clientId && s.sessionNumber === step
      );
      const nodeInfo = PROGRAM_NODES.find((n) => n.step === step) || PROGRAM_NODES[0];

      if (existingIndex >= 0) {
        const existing = updatedSessions[existingIndex];
        const shouldUpdateStatus = existing.status !== 'completed';
        const updatedSess: Session = {
          ...existing,
          // Apertura de estado: pasa a 'scheduled' si no estaba completada
          status: shouldUpdateStatus ? 'scheduled' : existing.status,
          isPaid: true,
          paymentValidatedAt: existing.paymentValidatedAt || new Date().toISOString(),
          unlockedByPaymentId: paymentRequestId || existing.unlockedByPaymentId,
          unlockedPaymentPlan: planType || existing.unlockedPaymentPlan,
          meetLink:
            existing.meetLink && existing.meetLink.includes('meet.google.com')
              ? existing.meetLink
              : `https://meet.google.com/rbc-${Math.random().toString(36).substring(2, 7)}`,
          notes:
            existing.notes ||
            `Sesión ${step}: ${nodeInfo.sessionTitle}. Apertura de estado realizada tras validación de pago.`,
          ontologicalFocus: existing.ontologicalFocus || nodeInfo.objective,
        };
        updatedSessions[existingIndex] = updatedSess;
        openedSessions.push(updatedSess);
      } else {
        // Crear nueva sesión con apertura de estado 'scheduled'
        const daysOffset = 3 + index * 14;
        const scheduledDate = new Date(now + 1000 * 60 * 60 * 24 * daysOffset).toISOString();
        const newSession: Session = {
          id: `sess-${clientId}-step-${step}-${Date.now() + index}`,
          clientId,
          sessionNumber: step,
          date: scheduledDate,
          meetLink: `https://meet.google.com/rbc-${Math.random().toString(36).substring(2, 7)}`,
          status: 'scheduled',
          isPaid: true,
          paymentValidatedAt: new Date().toISOString(),
          unlockedByPaymentId: paymentRequestId,
          unlockedPaymentPlan: planType,
          notes: `Sesión ${step}: ${nodeInfo.sessionTitle}. Apertura de estado realizada tras validación de pago.`,
          ontologicalFocus: nodeInfo.objective,
        };
        updatedSessions.push(newSession);
        openedSessions.push(newSession);
      }
    });

    this.saveSessions(updatedSessions);
    return openedSessions;
  }

  // --- PAYMENT REQUESTS & CASH / BRE-B VALIDATION ---
  static getPaymentRequests(): PaymentRequest[] {
    const list = this.load<PaymentRequest[]>(
      STORAGE_KEYS.PAYMENT_REQUESTS,
      INITIAL_PAYMENT_REQUESTS
    );
    return Array.isArray(list) ? list : INITIAL_PAYMENT_REQUESTS;
  }

  static savePaymentRequests(requests: PaymentRequest[]): void {
    this.save(STORAGE_KEYS.PAYMENT_REQUESTS, requests);
  }

  static getPaymentRequestsForClient(clientId: string): PaymentRequest[] {
    return this.getPaymentRequests().filter((r) => r.clientId === clientId);
  }

  static submitPaymentRequest(
    payload: Omit<PaymentRequest, 'id' | 'createdAt' | 'status'>
  ): PaymentRequest {
    const requests = this.getPaymentRequests();
    const newReq: PaymentRequest = {
      ...payload,
      id: 'pay-req-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.savePaymentRequests([newReq, ...requests]);
    return newReq;
  }

  static approvePaymentRequest(
    requestId: string,
    reviewedBy: string = 'John Fredy Rengifo Basto'
  ): { request: PaymentRequest | null; user: User | null; openedSessions: Session[] } {
    const requests = this.getPaymentRequests();
    let approvedReq: PaymentRequest | null = null;

    const updatedRequests = requests.map((req) => {
      if (req.id === requestId) {
        approvedReq = {
          ...req,
          status: 'approved' as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy,
        };
        return approvedReq;
      }
      return req;
    });

    if (!approvedReq) {
      return { request: null, user: null, openedSessions: [] };
    }

    // Unlock the target node for client
    const targetPaymentStatus: PaymentStatus =
      approvedReq.planType === 'full' ? 'Pago Único' : 'Cuota 1 de 2';

    // If full plan, unlock all 6 steps of the 12-week program; otherwise target step
    const stepToUnlock =
      approvedReq.planType === 'full'
        ? 6
        : Math.max(approvedReq.targetStep || 2, 2);

    const updatedUser = this.unlockNodeForClient(
      approvedReq.clientId,
      stepToUnlock,
      targetPaymentStatus
    );

    // Apertura de estado en las sesiones que pagó:
    const stepsToOpen: number[] =
      approvedReq.planType === 'full'
        ? [1, 2, 3, 4, 5, 6]
        : [approvedReq.targetStep || stepToUnlock];

    const openedSessions = this.openSessionsForPayment(
      approvedReq.clientId,
      stepsToOpen,
      approvedReq.id,
      approvedReq.planType
    );

    approvedReq.openedSessionNumbers = stepsToOpen;
    approvedReq.openedSessionIds = openedSessions.map((s) => s.id);

    this.savePaymentRequests(
      updatedRequests.map((r) => (r.id === approvedReq!.id ? approvedReq! : r))
    );

    // Update invested amount
    if (updatedUser) {
      const currentInvestedNum = parseInt(
        (updatedUser.totalInvested || '0').replace(/\D/g, '') || '0',
        10
      );
      const addedNum = parseInt(
        approvedReq.amount.replace(/\D/g, '') || '0',
        10
      );
      const newTotal = currentInvestedNum + addedNum;
      const formattedTotal = `$${newTotal.toLocaleString('es-CO')} COP`;
      this.updateClientInvested(approvedReq.clientId, formattedTotal);
      this.updateClientStatus(approvedReq.clientId, 'active');
    }

    return { request: approvedReq, user: updatedUser, openedSessions };
  }

  static rejectPaymentRequest(
    requestId: string,
    reason: string,
    reviewedBy: string = 'John Fredy Rengifo Basto'
  ): PaymentRequest | null {
    const requests = this.getPaymentRequests();
    let rejectedReq: PaymentRequest | null = null;

    const updatedRequests = requests.map((req) => {
      if (req.id === requestId) {
        rejectedReq = {
          ...req,
          status: 'rejected' as const,
          rejectionReason: reason,
          reviewedAt: new Date().toISOString(),
          reviewedBy,
        };
        return rejectedReq;
      }
      return req;
    });

    if (rejectedReq) {
      this.savePaymentRequests(updatedRequests);
    }
    return rejectedReq;
  }

  static registerDirectCashPayment(
    clientId: string,
    targetStep: number,
    planType: 'level' | 'full',
    amount: string,
    notes?: string,
    reviewedBy: string = 'John Fredy Rengifo Basto'
  ): { request: PaymentRequest; user: User | null; openedSessions: Session[] } {
    const client = this.getUsers().find((u) => u.uid === clientId);
    const node = PROGRAM_NODES.find((n) => n.step === targetStep) || PROGRAM_NODES[0];

    const newReq: PaymentRequest = {
      id: 'pay-req-direct-' + Date.now(),
      clientId,
      clientName: client?.name || 'Participante',
      clientEmail: client?.email || '',
      clientPhone: client?.phone || '',
      amount,
      concept: `Pago en Efectivo Presencial: ${node.level} (${node.sessionTitle})`,
      targetStep,
      planType,
      method: 'efectivo',
      notes: notes || 'Pago en efectivo recibido y validado directamente en consultorio.',
      status: 'approved',
      createdAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy,
    };

    // Apertura de estado en las sesiones pagadas
    const stepsToOpen: number[] =
      planType === 'full'
        ? [1, 2, 3, 4, 5, 6]
        : [targetStep];

    const openedSessions = this.openSessionsForPayment(
      clientId,
      stepsToOpen,
      newReq.id,
      planType
    );

    newReq.openedSessionNumbers = stepsToOpen;
    newReq.openedSessionIds = openedSessions.map((s) => s.id);

    const requests = this.getPaymentRequests();
    this.savePaymentRequests([newReq, ...requests]);

    const updatedUser = this.unlockNodeForClient(
      clientId,
      targetStep,
      planType === 'full' ? 'Pago Único' : 'Cuota 1 de 2'
    );

    if (updatedUser) {
      const currentInvestedNum = parseInt(
        (updatedUser.totalInvested || '0').replace(/\D/g, '') || '0',
        10
      );
      const addedNum = parseInt(amount.replace(/\D/g, '') || '0', 10);
      const newTotal = currentInvestedNum + addedNum;
      const formattedTotal = `$${newTotal.toLocaleString('es-CO')} COP`;
      this.updateClientInvested(clientId, formattedTotal);
      this.updateClientStatus(clientId, 'active');
    }

    return { request: newReq, user: updatedUser, openedSessions };
  }

  // --- SESSIONS ---
  static getSessions(): Session[] {
    const list = this.load<Session[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    let safeList = Array.isArray(list) ? list : INITIAL_SESSIONS;
    if (!safeList.some((s) => s.clientId === 'client-andres')) {
      const andresSessions = INITIAL_SESSIONS.filter((s) => s.clientId === 'client-andres');
      safeList = [...safeList, ...andresSessions];
    }
    return safeList;
  }

  static saveSessions(sessions: Session[]): void {
    this.save(STORAGE_KEYS.SESSIONS, sessions);
  }

  static addSession(session: Session): void {
    const current = this.getSessions();
    this.saveSessions([...current.filter((s) => s.id !== session.id), session]);
  }

  static generateDefaultSessionsForClient(clientId: string): Session[] {
    const user = this.getUsers().find((u) => u.uid === clientId);
    const progress = user?.programProgress || 1;
    const now = Date.now();
    const sessions: Session[] = [];

    const sessionThemes = [
      'Mapeo de la transparencia cotidiana, quiebres no declarados y autoexigencia.',
      'Deconstrucción del juicio maestro y diseño de conversaciones de oferta y confianza.',
      'Decodificación somática de la presencia directiva, límites y acuerdos de equipo.',
      'Distinción ontológica entre hechos y juicios en la toma de decisiones estratégicas.',
      'Rediseño de la soberanía emocional, límites impecables y autonomía directiva.',
      'Cierre del ciclo, consolidación de la nueva identidad y plan de sostenibilidad.',
    ];

    for (let num = 1; num <= 6; num++) {
      const isPast = num < progress;
      const diffDays = (num - progress) * 14;
      const sessionDate = new Date(now + diffDays * 24 * 60 * 60 * 1000).toISOString();
      const status: 'completed' | 'scheduled' = isPast ? 'completed' : 'scheduled';

      sessions.push({
        id: `sess-${clientId}-${num}`,
        clientId: clientId,
        sessionNumber: num,
        date: sessionDate,
        meetLink: `https://meet.google.com/rbc-${clientId.replace(/[^a-zA-Z0-9]/g, '')}-s${num}`,
        status: status,
        isPaid: true,
        durationMinutes: 60,
        notes: `Sesión ${num}: ${sessionThemes[num - 1]}`,
        programNodeStep: num,
      });
    }

    const allSessions = this.getSessions();
    const merged = [...allSessions.filter((s) => s.clientId !== clientId), ...sessions];
    this.saveSessions(merged);
    return sessions;
  }

  static getSessionsForClient(clientId: string): Session[] {
    const sessions = this.getSessions();
    const clientSessions = Array.isArray(sessions) ? sessions.filter((s) => s.clientId === clientId) : [];
    if (clientSessions.length > 0) {
      return clientSessions.sort((a, b) => (a.sessionNumber || 1) - (b.sessionNumber || 1));
    }
    const user = this.getUsers().find((u) => u.uid === clientId);
    if (user && user.role === 'client') {
      return this.generateDefaultSessionsForClient(clientId);
    }
    return [];
  }

  static getNextSessionForClient(clientId: string): Session | null {
    const clientSessions = this.getSessionsForClient(clientId)
      .filter((s) => s.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return clientSessions[0] || null;
  }

  static updateSessionStatus(
    sessionId: string,
    status: 'scheduled' | 'completed' | 'cancelled'
  ): Session | null {
    const sessions = this.getSessions();
    let updated: Session | null = null;
    const updatedList = sessions.map((s) => {
      if (s.id === sessionId) {
        updated = { ...s, status };
        return updated;
      }
      return s;
    });
    if (updated) {
      this.saveSessions(updatedList);
    }
    return updated;
  }

  // --- POST-SESSION FORMS (EVALUACIÓN POST-SESIÓN & CUADERNO DE TRABAJO) ---
  static getPostSessionForms(): PostSessionForm[] {
    const list = this.load<PostSessionForm[]>(
      STORAGE_KEYS.POST_SESSION_FORMS,
      INITIAL_POST_SESSION_FORMS
    );
    let safeList = Array.isArray(list) ? list : INITIAL_POST_SESSION_FORMS;
    if (!safeList.some((f) => f.id === 'psf-andres-1')) {
      safeList = [...safeList, ...INITIAL_POST_SESSION_FORMS];
    }
    return safeList;
  }

  static savePostSessionForms(forms: PostSessionForm[]): void {
    this.save(STORAGE_KEYS.POST_SESSION_FORMS, forms);
  }

  static getPostSessionFormsForClient(clientId: string): PostSessionForm[] {
    const forms = this.getPostSessionForms();
    return forms
      .filter((f) => f.clientId === clientId)
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
  }

  static getPostSessionFormForSession(sessionId: string): PostSessionForm | undefined {
    const forms = this.getPostSessionForms();
    return forms.find((f) => f.sessionId === sessionId);
  }

  static savePostSessionForm(form: PostSessionForm): void {
    const forms = this.getPostSessionForms();
    const filtered = forms.filter((f) => f.id !== form.id && f.sessionId !== form.sessionId);
    this.savePostSessionForms([form, ...filtered]);
  }

  static deletePostSessionForm(formId: string): void {
    const forms = this.getPostSessionForms();
    this.savePostSessionForms(forms.filter((f) => f.id !== formId));
  }

  // --- WORKSHOP ATTENDANCE & DOCUMENT REGISTRY ---
  static getUserById(clientId: string): User | undefined {
    return this.getUsers().find((u) => u.uid === clientId);
  }

  static getWorkshopsViewed(clientId: string): number[] {
    const map = this.load<Record<string, number[]>>(STORAGE_KEYS.WORKSHOPS_VIEWED, {
      'user-andres-quintero': [1, 2],
    });
    if (!map[clientId]) {
      const user = this.getUserById(clientId);
      const initial: number[] = [];
      const max = Math.min(user?.programProgress || 1, 2);
      for (let i = 1; i <= max; i++) {
        initial.push(i);
      }
      map[clientId] = initial;
      this.save(STORAGE_KEYS.WORKSHOPS_VIEWED, map);
    }
    return map[clientId] || [];
  }

  static toggleWorkshopViewed(clientId: string, step: number): boolean {
    const map = this.load<Record<string, number[]>>(STORAGE_KEYS.WORKSHOPS_VIEWED, {
      'user-andres-quintero': [1, 2],
    });
    const current = map[clientId] || this.getWorkshopsViewed(clientId);
    const exists = current.includes(step);
    const updated = exists
      ? current.filter((s) => s !== step)
      : [...current, step].sort((a, b) => a - b);
    map[clientId] = updated;
    this.save(STORAGE_KEYS.WORKSHOPS_VIEWED, map);
    return !exists;
  }

  static setWorkshopViewed(clientId: string, step: number, viewed: boolean): void {
    const map = this.load<Record<string, number[]>>(STORAGE_KEYS.WORKSHOPS_VIEWED, {
      'user-andres-quintero': [1, 2],
    });
    const current = map[clientId] || [];
    const updated = viewed
      ? Array.from(new Set([...current, step])).sort((a, b) => a - b)
      : current.filter((s) => s !== step);
    map[clientId] = updated;
    this.save(STORAGE_KEYS.WORKSHOPS_VIEWED, map);
  }

  // --- FORMS ---
  static getForms(): FormSubmission[] {
    const list = this.load<FormSubmission[]>(STORAGE_KEYS.FORMS, INITIAL_FORMS);
    return Array.isArray(list) ? list : INITIAL_FORMS;
  }

  static getFormsForClient(clientId: string): FormSubmission[] {
    const forms = this.getForms();
    return Array.isArray(forms)
      ? forms
          .filter((f) => f.clientId === clientId)
          .sort(
            (a, b) =>
              new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          )
      : [];
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

  static saveForms(forms: FormSubmission[]): void {
    this.save(STORAGE_KEYS.FORMS, forms);
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

  static updateForm(
    formId: string,
    patch: Partial<FormSubmission>
  ): FormSubmission | null {
    const allForms = this.getForms();
    const index = allForms.findIndex((f) => f.id === formId);
    if (index === -1) return null;
    const updatedForm = { ...allForms[index], ...patch };
    allForms[index] = updatedForm;
    this.save(STORAGE_KEYS.FORMS, allForms);
    FirestoreSyncService.syncFormSubmission(updatedForm).catch(() => {});
    return updatedForm;
  }

  static deleteForm(formId: string): void {
    const allForms = this.getForms();
    const filtered = allForms.filter((f) => f.id !== formId);
    this.save(STORAGE_KEYS.FORMS, filtered);
  }

  // --- AI INSIGHTS ---
  static getAIInsights(): AIInsight[] {
    const list = this.load<AIInsight[]>(
      STORAGE_KEYS.AI_INSIGHTS,
      INITIAL_AI_INSIGHTS
    );
    return Array.isArray(list) ? list : INITIAL_AI_INSIGHTS;
  }

  static getInsightsForClient(clientId: string): AIInsight[] {
    const insights = this.getAIInsights();
    return Array.isArray(insights)
      ? insights
          .filter((i) => i.clientId === clientId)
          .sort(
            (a, b) =>
              new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
          )
      : [];
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

  static saveWebhookUrl(url: string): void {
    this.setWebhookUrl(url);
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
    const stored = localStorage.getItem(STORAGE_KEYS.CALENDAR_URL);
    if (!stored || stored.includes('rbc-sesion-20min')) {
      localStorage.setItem(STORAGE_KEYS.CALENDAR_URL, DEFAULT_CALENDAR_URL);
      return DEFAULT_CALENDAR_URL;
    }
    return stored;
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

  // =========================================================================
  // --- SEGUIMIENTO POR CORREO ELECTRÓNICO (GMAIL / GOOGLE WORKSPACE) ---
  // =========================================================================
  static getClientEmailLogs(): ClientEmailLog[] {
    const list = this.load<ClientEmailLog[]>(
      STORAGE_KEYS.CLIENT_EMAIL_LOGS,
      []
    );
    return Array.isArray(list) ? list : [];
  }

  static saveClientEmailLogs(logs: ClientEmailLog[]): void {
    this.save(STORAGE_KEYS.CLIENT_EMAIL_LOGS, logs);
  }

  static getEmailLogsForClient(clientId: string): ClientEmailLog[] {
    const all = this.getClientEmailLogs();
    return all
      .filter((l) => l.clientId === clientId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  static logClientEmail(
    data: Omit<ClientEmailLog, 'id' | 'sentAt'>
  ): ClientEmailLog {
    const all = this.getClientEmailLogs();
    const newLog: ClientEmailLog = {
      ...data,
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sentAt: new Date().toISOString(),
    };
    const updated = [newLog, ...all];
    this.saveClientEmailLogs(updated);
    return newLog;
  }

  // =========================================================================
  // --- ACTIVADORES AUTOMÁTICOS (MAKE.COM / WEBHOOKS / TRIGGERS) ---
  // =========================================================================
  static getAutomatedTriggers(): AutomatedTriggerConfig[] {
    const list = this.load<AutomatedTriggerConfig[]>(
      STORAGE_KEYS.AUTOMATED_TRIGGERS,
      INITIAL_AUTOMATED_TRIGGERS
    );
    return Array.isArray(list) && list.length > 0
      ? list
      : INITIAL_AUTOMATED_TRIGGERS;
  }

  static saveAutomatedTriggers(triggers: AutomatedTriggerConfig[]): void {
    this.save(STORAGE_KEYS.AUTOMATED_TRIGGERS, triggers);
  }

  static toggleAutomatedTrigger(triggerId: string): AutomatedTriggerConfig | null {
    const triggers = this.getAutomatedTriggers();
    let updated: AutomatedTriggerConfig | null = null;
    const mapped = triggers.map((t) => {
      if (t.id === triggerId) {
        updated = { ...t, enabled: !t.enabled };
        return updated;
      }
      return t;
    });
    if (updated) {
      this.saveAutomatedTriggers(mapped);
    }
    return updated;
  }

  static async executeTrigger(
    triggerId: string,
    contextData?: Record<string, any>
  ): Promise<{ success: boolean; message: string; timestamp: string }> {
    const triggers = this.getAutomatedTriggers();
    const trigger = triggers.find((t) => t.id === triggerId);
    const timestamp = new Date().toISOString();

    if (!trigger) {
      return { success: false, message: 'Activador no encontrado', timestamp };
    }

    if (!trigger.enabled) {
      return { success: false, message: 'El activador se encuentra pausado', timestamp };
    }

    // Update execution metrics
    const updated = triggers.map((t) => {
      if (t.id === triggerId) {
        return {
          ...t,
          executionsCount: t.executionsCount + 1,
          lastTriggeredAt: timestamp,
        };
      }
      return t;
    });
    this.saveAutomatedTriggers(updated);

    // Optionally dispatch to Make.com Webhook if active
    const webhookUrl = this.getWebhookUrl();
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: trigger.event,
            triggerName: trigger.name,
            timestamp,
            context: contextData || {},
          }),
        }).catch(() => {});
      } catch {
        // non-blocking
      }
    }

    return {
      success: true,
      message: `Activador "${trigger.name}" ejecutado correctamente. Acciones ejecutadas: ${trigger.actions.length}`,
      timestamp,
    };
  }

  // =========================================================================
  // --- CONSTRUCTOR DE VALORES, TARIFAS Y PAQUETES COMERCIALES ---
  // =========================================================================
  static getPricingPackages(): PricingPackage[] {
    const list = this.load<PricingPackage[]>(
      STORAGE_KEYS.PRICING_PACKAGES,
      INITIAL_PRICING_PACKAGES
    );
    return Array.isArray(list) && list.length > 0
      ? list
      : INITIAL_PRICING_PACKAGES;
  }

  static savePricingPackages(packages: PricingPackage[]): void {
    this.save(STORAGE_KEYS.PRICING_PACKAGES, packages);
  }

  static updatePricingPackage(
    id: string,
    patch: Partial<PricingPackage>
  ): PricingPackage | null {
    const packages = this.getPricingPackages();
    let updated: PricingPackage | null = null;
    const mapped = packages.map((p) => {
      if (p.id === id) {
        updated = { ...p, ...patch };
        return updated;
      }
      return p;
    });
    if (updated) {
      this.savePricingPackages(mapped);
    }
    return updated;
  }

  static addPricingPackage(
    pkgData: Omit<PricingPackage, 'id'>
  ): PricingPackage {
    const packages = this.getPricingPackages();
    const newPkg: PricingPackage = {
      ...pkgData,
      id: `pkg-${Date.now()}`,
    };
    const updated = [...packages, newPkg];
    this.savePricingPackages(updated);
    return newPkg;
  }

  static deletePricingPackage(id: string): void {
    const packages = this.getPricingPackages();
    const filtered = packages.filter((p) => p.id !== id);
    this.savePricingPackages(filtered);
  }
}

