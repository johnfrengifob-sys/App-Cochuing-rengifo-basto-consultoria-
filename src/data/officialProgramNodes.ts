import { ProgramNodeInfo, Session } from "../types";

export const DEFAULT_CALENDAR_URL = "https://calendar.app.google/b5h9YrYnyjME7LbD7";

export const OFFICIAL_PROGRAM_NODES: ProgramNodeInfo[] = [
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
    weekLabel: 'Semanas 3-4',
    level: 'Nivel I',
    levelTitle: 'Fundamentos & Transparencia',
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
    weekLabel: 'Semanas 3-4',
    level: 'Nivel I',
    levelTitle: 'Fundamentos & Transparencia',
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
    weekLabel: 'Semanas 5-6',
    level: 'Nivel II',
    levelTitle: 'Corporalidad, Relaciones & Emocionalidad',
    sessionTitle: 'Diseño de Conversaciones de Futuro y Posibilidad',
    objective:
      'Proyectar escenarios de certeza interna, construyendo ofertas irresistibles y relaciones basadas en la confianza generativa y la soberanía ontológica.',
    tangibleOutcomes: [
      'Declaración clara de una nueva visión de futuro desprendida del miedo y la necesidad de aprobación.',
      'Diseño de ofertas profesionales y personales de alto valor percibido.',
      'Liderazgo generativo con capacidad para abrir posibilidades donde antes solo se percibían bloqueos.',
    ],
    keyQuestion: '',
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
    weekLabel: 'Semanas 5-6',
    level: 'Nivel II',
    levelTitle: 'Corporalidad, Relaciones & Emocionalidad',
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
  {
    step: 7,
    weekLabel: 'Semanas 7-8',
    level: 'Nivel II',
    levelTitle: 'Corporalidad, Relaciones & Emocionalidad',
    sessionTitle: 'El Arte de la Escucha Comprometida y el Silencio Fecundo',
    objective:
      'Trascender la escucha automática para habitar la presencia atenta, desactivar la necesidad de validación inmediata y generar espacios de coordinación impecables.',
    tangibleOutcomes: [
      'Diferenciación entre oír biológicamente y escuchar ontológicamente con empatía profunda.',
      'Identificación de los 4 filtros automáticos que distorsionan las conversaciones directivas.',
      'Instalación del silencio como competencia de liderazgo y contención emocional.',
    ],
    keyQuestion:
      '¿Desde qué juicio o necesidad interna estás escuchando a quienes te rodean?',
    levelPrompt:
      'Registra las conversaciones donde interrumpes o completas mentalmente las frases del otro sin concederle legitimidad.',
    methodology: {
      linguistic: 'Distinción entre relato del hablante e interpretaciones del oyente; validación del quiebre ajeno.',
      somatic: 'Relajación del diafragma, contacto visual sereno y postura de recepción abierta.',
      emotional: 'Curiosidad genuina, paciencia reflexiva y disolución de la urgencia reactiva.',
    },
    dailyMicroPractice: {
      title: 'Pausa de Escucha sin Interrupción (3 Minutos)',
      description: 'En al menos dos interacciones hoy, escucha activamente sin juzgar, opinar ni dar consejos.',
      frequency: 'Diaria (2 interacciones clave)',
    },
  },
  {
    step: 8,
    weekLabel: 'Semanas 7-8',
    level: 'Nivel II',
    levelTitle: 'Corporalidad, Relaciones & Emocionalidad',
    sessionTitle: 'Gestión Adaptativa de la Culpa, Miedo e Ira Directiva',
    objective:
      'Comprender la raíz ontológica de las emociones complejas para transformarlas en energía de acción lúcida y cuidado legítimo.',
    tangibleOutcomes: [
      'Mapeo de la culpa como señal de un estándar ético quebrantado que requiere reparación, no castigo.',
      'Canalización de la ira directiva hacia la delimitación firme y el reclamo constructivo.',
      'Distinción entre miedo prudencial (anticipación de riesgos) y miedo paralizante.',
    ],
    keyQuestion:
      '¿Qué emoción estás silenciando en tu cuerpo y qué mensaje de dignidad te está entregando?',
    levelPrompt:
      'Explora el costo somático de sostener el resentimiento o la culpa acumulada en tus roles.',
    methodology: {
      linguistic: 'Reencuadre de la ira en juicio de injusticia; reconstrucción de promesas incumplidas.',
      somatic: 'Descompresión de mandíbula, cuello y espalda media mediante exhalación sonora.',
      emotional: 'Transición del resentimiento a la aceptación activa y la paz interna.',
    },
    dailyMicroPractice: {
      title: 'Desahogo Somático y Reencuadre Emocional',
      description: 'Respira hondo 4 veces con exhalación larga al sentir frustración, identificando el estándar herido.',
      frequency: 'Ante cada episodio de tensión',
    },
  },
  {
    step: 9,
    weekLabel: 'Semanas 9-10',
    level: 'Nivel III',
    levelTitle: 'Dirección & Trascendencia',
    sessionTitle: 'Soberanía Relacional y Reconfiguración de Vínculos de Confianza',
    objective:
      'Construir o restaurar la confianza relacional en equipos y vínculos significativos mediante pilares de sinceridad, competencia e involucramiento.',
    tangibleOutcomes: [
      'Auditoría ontológica de la confianza en los 3 dominios: Sinceridad, Competencia y Confiabilidad.',
      'Protocolo estructurado para reparar promesas rotas sin evasivas ni justificaciones defensivas.',
      'Establecimiento de fronteras limpias frente a relaciones transaccionales desgastantes.',
    ],
    keyQuestion:
      '¿En qué vínculos has perdido la credibilidad o dónde te cuesta volver a confiar plenamente?',
    levelPrompt:
      'Rediseña los acuerdos explícitos que devolverán la transparencia y la solidez a tus relaciones nucleares.',
    methodology: {
      linguistic: 'Declaraciones de confianza y disculpa ontológica con restitución de daños acordada.',
      somatic: 'Calibración de la distancia interpersonal y postura de seguridad sin agresividad.',
      emotional: 'Vulnerabilidad corajuda y disposición a renegociar el pacto vincular.',
    },
    dailyMicroPractice: {
      title: 'Validación de Acuerdos Claros',
      description: 'Antes de cerrar un compromiso, verifica explícitamente: "¿Qué entendemos ambos por cumplido?"',
      frequency: 'Diaria en acuerdos de trabajo',
    },
  },
  {
    step: 10,
    weekLabel: 'Semanas 9-10',
    level: 'Nivel III',
    levelTitle: 'Dirección & Trascendencia',
    sessionTitle: 'Presencia Ejecutiva, Autoridad Serena y Arraigo Corporal',
    objective:
      'Desarrollar una presencia directiva basada en el centramiento somático, la economía de palabras y la convicción profunda.',
    tangibleOutcomes: [
      'Desarticulación del síndrome del impostor y la necesidad compulsiva de agradar a todos.',
      'Manejo del tono de voz, ritmo respiratorio y postura erguida ante comités o audiencias críticas.',
      'Habilidad para sostener conversaciones difíciles sin perder el aplomo ni la calidez.',
    ],
    keyQuestion:
      '¿Desde qué corporalidad estás comunicando tu valor y visión como líder?',
    levelPrompt:
      'Registra las situaciones donde achicas tu postura o dudas de tu autoridad legítima.',
    methodology: {
      linguistic: 'Actos de habla directos, precisos y asertivos, sin rodeos ni disculpas innecesarias.',
      somatic: 'Arraigo podal (pies bien apoyados), mirada estable y apertura torácica serena.',
      emotional: 'Dignidad serena, orgullo noble y desapego de la aprobación externa inmediata.',
    },
    dailyMicroPractice: {
      title: 'Centramiento en 60 Segundos antes de Reuniones',
      description: 'Ponte de pie, alinea columna, siente el suelo con los pies y exhala dos veces con calma.',
      frequency: 'Antes de cada reunión directiva',
    },
  },
  {
    step: 11,
    weekLabel: 'Semanas 11-12',
    level: 'Nivel III',
    levelTitle: 'Dirección & Trascendencia',
    sessionTitle: 'Diseño de Conversaciones de Futuro y Nuevas Posibilidades',
    objective:
      'Pasar de la gestión de la queja a la apertura deliberada de escenarios de futuro innovadores y sostenibles.',
    tangibleOutcomes: [
      'Diferenciación entre conversaciones sobre problemas pasados y conversaciones para la acción futura.',
      'Diseño de ofertas atractivas y pedidos transformacionales a aliados estratégicos.',
      'Construcción de un mapa de posibilidades inexploradas en los próximos 12 a 36 meses.',
    ],
    keyQuestion:
      '¿Qué futuro estás invitando a existir con tus conversaciones cotidianas?',
    levelPrompt:
      'Formula tres proyectos ambiciosos que hoy parecen imposibles por falta de atrevimiento declarativo.',
    methodology: {
      linguistic: 'Declaraciones de visión, peticiones audaces y coordinación anticipatoria de acciones.',
      somatic: 'Inclinación ligera hacia adelante: la corporalidad del explorador y el creador de futuros.',
      emotional: 'Entusiasmo sereno, esperanza fundada y audacia reflexiva.',
    },
    dailyMicroPractice: {
      title: 'Declaración de Intención Matutina',
      description: 'Declara en voz alta al iniciar el día: "Hoy elijo ser el arquitecto de las posibilidades en..."',
      frequency: 'Diaria (al iniciar la jornada)',
    },
  },
  {
    step: 12,
    weekLabel: 'Semanas 11-12',
    level: 'Nivel III',
    levelTitle: 'Dirección & Trascendencia',
    sessionTitle: 'Consolidación del Nuevo Observador, Carta de Innegociables y Cierre',
    objective:
      'Sellar el proceso de transformación ontológica con protocolos de autoasistencia definitiva y autonomía duradera.',
    tangibleOutcomes: [
      'Consolidación del nuevo observador con soberanía lingüística, corporal y emocional integral.',
      'Firma de la Carta Magna de Compromisos Innegociables de vida y liderazgo.',
      'Establecimiento del sistema de monitoreo trimestral para sostener la coherencia personal.',
    ],
    keyQuestion:
      '¿Quién eres hoy frente al mundo y cómo honrarás la dignidad de tu propia vida?',
    levelPrompt:
      'Sella tu pacto con tu propia coherencia, reconociendo tu evolución y celebrando el camino recorrido.',
    methodology: {
      linguistic: 'Declaración solemne de cierre de ciclo, agradecimiento y afirmación de soberanía.',
      somatic: 'Integración postural global: solidez, arraigo, apertura y liviandad armónica.',
      emotional: 'Gratitud profunda, plenitud y amor propio incondicional.',
    },
    dailyMicroPractice: {
      title: 'El Anclaje Diario de Gratitud y Coherencia',
      description: 'Cada noche, agradece 3 victorias ontológicas y renueva tus estándares innegociables.',
      frequency: 'Diaria (al anochecer)',
    },
  },
];

export function getOfficialProgramNodes(): ProgramNodeInfo[] {
  return JSON.parse(JSON.stringify(OFFICIAL_PROGRAM_NODES));
}

export function generateOfficialSessions(clientId: string = 'client-legadobarber2026'): Session[] {
  const baseStartDate = new Date('2026-09-23T10:00:00.000-05:00');
  return OFFICIAL_PROGRAM_NODES.map((node, idx) => {
    const sessionDate = new Date(baseStartDate.getTime() + idx * 14 * 24 * 60 * 60 * 1000);
    const dateStr = sessionDate.toISOString();
    const scheduledDate = dateStr.split('T')[0];
    const isCierre = node.step % 4 === 0;

    return {
      id: `sess-${clientId}-${node.step}`,
      clientId,
      sessionNumber: node.step,
      title: `Sesión ${node.step}: ${node.sessionTitle}`,
      sessionType: (isCierre ? 'cierre_ciclo' : 'sesion') as 'cierre_ciclo' | 'sesion',
      level: node.level,
      levelTitle: node.levelTitle,
      weekLabel: node.weekLabel,
      weekNumber: node.step,
      date: dateStr,
      scheduledDate,
      scheduledTime: '10:00',
      meetLink: 'https://meet.google.com/rbc-conversatorio-ontologico',
      calendarLink: DEFAULT_CALENDAR_URL,
      status: (node.step === 1 ? 'completed' : 'scheduled') as 'completed' | 'scheduled',
      isPaid: true,
      durationMinutes: 60,
      sessionGoal: node.objective,
      openingQuestion: node.keyQuestion,
      ontologicalFocus: node.sessionTitle,
      notes: `Sesión ${node.step}: ${node.level} • ${node.sessionTitle}`,
      programNodeStep: node.step,
      googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
      googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
      agreementFormUrl: 'https://forms.gle/dfStXtTyb1MW6W5K9',
      agreementSheetUrl: 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
      bitacoraFormUrl: 'https://forms.gle/APUFto8sGbJt322WA',
      bitacoraSheetUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
      formsIntegrationId: 'bitacora_sesiones_b2b',
      expedienteSyncStatus: 'synced' as const,
    };
  });
}
