import type { Messages } from '../messages.ts'

export const catalog: Messages['catalog'] = {
  achievements: {
    'hello-world': { name: 'Hola, mundo', condition: 'Sirve la primera petición' },
    'works-on-my-machine': {
      name: 'En mi máquina funciona',
      condition: 'Haz un despliegue defectuoso',
    },
    'split-brain': {
      name: 'Cerebro dividido',
      condition: 'Separa la base de datos en su propio nodo',
    },
    'averages-lie': {
      name: 'Los promedios mienten',
      condition: 'Investiga percentiles mientras el p99 supera 5× la media',
    },
    'shared-nothing': {
      name: 'Shared Nothing',
      condition: 'Llega a Semilla solo con servidores PHP-FPM y sin ningún incidente de memoria',
    },
    blocked: {
      name: 'Bloqueado',
      condition: 'Ten un servicio Node.js cuyo p99 suba 100 ms por un único tipo de petición',
    },
    'off-by-one-region': {
      name: 'Una región de más',
      condition: 'Sirve a un usuario desde una región a más de 150 ms',
    },
    'littles-law': {
      name: 'Ley de Little',
      condition:
        'Arregla un cuello de botella del servidor de aplicaciones arreglando la base de datos',
    },
    metastable: {
      name: 'Metaestable',
      condition: 'Recupérate de una tormenta de reintentos',
    },
    'big-rewrite': {
      name: 'Gran reescritura',
      condition: 'Migra todos los servicios a un lenguaje nuevo en una misma empresa',
    },
    strangler: {
      name: 'Estrangulador',
      condition: 'Termina una migración en cuatro pasos de tráfico con menos del 1% de errores',
    },
    quorum: {
      name: 'Quórum',
      condition: 'Ejecuta un almacén de columnas anchas con R + W > N en tres regiones',
    },
    eventually: {
      name: 'Eventual',
      condition: 'Ejecuta R = 1, W = 1 con mil millones de usuarios',
    },
    polyglot: {
      name: 'Políglota',
      condition: 'Ejecuta cinco lenguajes en producción a la vez',
    },
    'zero-gc': {
      name: 'Cero GC',
      condition: 'Ejecuta un servicio Rust a 100,000 rps',
    },
    'no-cache': {
      name: 'Sin caché',
      condition: 'Llega a Serie A sin caché ni CDN',
    },
    celebrity: {
      name: 'Celebridad',
      condition: 'Sirve una publicación de 10 millones de seguidores sin errores de clave caliente',
    },
    'follow-the-sun': {
      name: 'Sigue al sol',
      condition: 'Sirve cuatro regiones sin ningún nodo por encima del 70% en su pico local',
    },
    'postgres-for-everything': {
      name: 'Postgres para todo',
      condition: 'Llega a Serie B solo con componentes de datos Postgres',
    },
    'hug-of-death': {
      name: 'Abrazo de la muerte',
      condition: 'Sobrevive a un pico de ×10 sin perder usuarios',
    },
    'egress-shock': {
      name: 'Shock de egress',
      condition: 'Ten el egress como la partida más grande de la factura',
    },
    'chaos-monkey': {
      name: 'Chaos Monkey',
      condition: 'Sobrevive a 100 terminaciones aleatorias',
    },
    blameless: { name: 'Sin culpa', condition: 'Escribe 50 postmortems' },
    nines: {
      name: 'Nueves',
      condition: 'Mantén el 99.99% durante una semana de calendario',
    },
    'five-nines': { name: 'Cinco nueves', condition: 'Completa el Desafío Cinco Nueves' },
    monoglot: { name: 'Monolingüe', condition: 'Llega a la IPO con un solo lenguaje' },
    'default-alive': {
      name: 'Vivo por defecto',
      condition: 'Llega a la IPO sin levantar ninguna ronda',
    },
    unicorn: { name: 'Unicornio', condition: 'Alcanza una valoración de $1,000 millones' },
    decacorn: { name: 'Decacornio', condition: 'Alcanza una valoración de $10,000 millones' },
    'everyone-online': {
      name: 'Todo el mundo conectado',
      condition: 'Llega a 6,000 millones de usuarios',
    },
    'warm-start': {
      name: 'Arranque en caliente',
      condition: 'Escala un servicio JVM durante un pico sin que empeore el p99',
    },
    'rule-of-40': {
      name: 'Regla del 40',
      condition: 'Alcanza una puntuación de 80 en la Regla del 40 como empresa pública',
    },
    'beat-and-raise': {
      name: 'Batir y elevar',
      condition: 'Supera la previsión durante ocho trimestres seguidos',
    },
    'serial-founder': {
      name: 'Fundador en serie',
      condition: 'Haz un exit con cada emprendimiento',
    },
    'two-hard-things': {
      name: 'Dos cosas difíciles',
      condition: 'Ten un incidente de lectura obsoleta en una caché',
    },
    'conways-law': {
      name: 'Ley de Conway',
      condition: 'Ten más servicios que equipos y luego arréglalo',
    },
    fallacies: {
      name: 'Falacias',
      condition: 'Vive las ocho falacias de la computación distribuida en incidentes',
    },
    'thundering-herd': {
      name: 'Estampida',
      condition: 'Sobrevive a una tormenta de reconexiones sin errores',
    },
    runbook: {
      name: 'Runbook',
      condition: 'Ten un incidente que se resuelva sin que hagas nada',
    },
    finops: {
      name: 'FinOps',
      condition: 'Ejecuta una flota con nodos reservados, bajo demanda y spot a la vez',
    },
    'spot-the-difference': {
      name: 'Encuentra la diferencia',
      condition: 'Sobrevive a una interrupción de spot sin errores',
    },
    'let-it-crash': {
      name: 'Que se caiga',
      condition: 'Ten un servicio Elixir que sobreviva a 1,000 caídas sin peticiones fallidas',
    },
  },
  backups: {
    none: { name: 'Ninguno' },
    nightly: { name: 'Nocturno' },
    pitr: { name: 'PITR' },
  },
  buildGroups: {
    edge: { label: 'Edge' },
    compute: { label: 'Cómputo' },
    data: { label: 'Datos' },
    ops: { label: 'Operaciones' },
  },
  cacheKeys: {
    full: { name: 'Ruta, query y cookies' },
    query: { name: 'Ruta y query' },
    path: { name: 'Solo ruta' },
  },
  cacheStrategies: {
    aside: { name: 'Cache-aside' },
    'read-through': { name: 'Read-through' },
    'write-through': { name: 'Write-through' },
    'write-behind': { name: 'Write-behind' },
  },
  collectors: {
    g1: { label: 'G1' },
    parallel: { label: 'Paralelo' },
    zgc: { label: 'ZGC' },
  },
  dbRetentions: {
    keep: { name: 'Conservar todo' },
    archive: { name: 'Archivar a los 30 d' },
    delete: { name: 'Eliminar a los 30 d' },
  },
  deployStrategies: {
    recreate: { name: 'Recrear' },
    rolling: { name: 'Rolling' },
    'blue-green': { name: 'Blue-green' },
    canary: { name: 'Canary' },
  },
  deviceInfo: {
    desktop: { name: 'Escritorio' },
    mobile: { name: 'Móvil' },
    tablet: { name: 'Tablet' },
  },
  dockGroups: {
    edge: { label: 'Edge' },
    compute: { label: 'Cómputo' },
    data: { label: 'Datos' },
    messaging: { label: 'Mensajería' },
    platform: { label: 'Plataforma' },
    insight: { label: 'Observabilidad' },
    managed: { label: 'Gestionado' },
  },
  eras: [
    {
      name: 'Garaje',
      question: '¿Hasta dónde llega una sola máquina?',
      arrivals: 'Vistas de página y lecturas de API.',
    },
    {
      name: 'Pre-semilla',
      question: '¿Qué pasa cuando la base de datos es el cuello de botella?',
      arrivals:
        'Las escrituras compiten por la base de datos. Se abre la contratación. Empiezan los incidentes.',
    },
    {
      name: 'Semilla',
      question:
        '¿Qué pasa cuando un solo tipo de servidor de aplicaciones no puede atender todos los tipos de petición?',
      arrivals: 'Búsqueda, subidas y bots. Colas, Workers, una CDN y un WAF.',
    },
    {
      name: 'Serie A',
      question: '¿Qué pasa cuando falla una zona entera?',
      arrivals: 'Video, chat, pagos y pujas. Zonas, autoescalado y un presupuesto de error.',
    },
    {
      name: 'Serie B',
      question:
        '¿Qué pasa cuando la analítica y la IA comparten una base de datos creada para los pagos?',
      arrivals:
        'Exportaciones, informes y prompts de IA. Almacenes de datos, GPUs, reintentos y circuit breakers.',
    },
    {
      name: 'Serie C',
      question: '¿Qué pasa cuando tus usuarios viven en cuatro continentes?',
      arrivals: 'Feeds, webhooks y push. Regiones, GeoDNS, quórums y consenso.',
    },
    {
      name: 'Pre-IPO',
      question: '¿Puedes demostrar que la empresa está lista para salir a bolsa?',
      arrivals:
        'La lista de comprobación de la IPO: fiabilidad, SOC 2, un simulacro de DR, residencia de datos y la regla del 40.',
    },
    {
      name: 'Cotizada en bolsa',
      question: '¿Puedes superar tu previsión cada trimestre?',
      arrivals: 'Trimestres, previsión y el múltiplo de mercado. El juego no tiene fin.',
    },
  ],
  exits: {
    'acqui-hire': { name: 'Acqui-hire' },
    acquisition: { name: 'Adquisición' },
    ipo: { name: 'IPO' },
    'step-down': { name: 'Dar un paso al lado' },
  },
  families: {
    burstable: {
      name: 'Burstable',
      blurb:
        'Barata. Gana créditos de CPU mientras está inactiva y cae al 20% de CPU cuando se agotan.',
    },
    general: { name: 'General', blurb: '1 vCPU : 4 GB.' },
    compute: { name: 'Cómputo', blurb: '1 vCPU : 2 GB.' },
    memory: { name: 'Memoria', blurb: '1 vCPU : 8 GB.' },
    arm: {
      name: 'ARM',
      blurb:
        'Igual que General por un 20% menos. Algunos runtimes y librerías necesitan trabajo de portabilidad.',
    },
  },
  gpuModels: {
    small: { name: 'Pequeño (3B)' },
    medium: { name: 'Mediano (7B)' },
    large: { name: 'Grande (34B)' },
  },
  guided: {
    'out-of-credits': {
      name: 'Sin créditos',
      objectives: [
        { goal: 'Atiende todas las peticiones durante 90 segundos.' },
        { goal: 'La demanda es 4× mayor. Mantén el Apdex por encima de 0.85 durante 2 minutos.' },
        {
          goal: 'El tráfico nocturno vuelve al nivel inicial. Mantén el Apdex por encima de 0.85 con un gasto de $0.12/s o menos.',
        },
      ],
    },
    'shared-box': {
      name: 'Máquina compartida',
      objectives: [
        { goal: 'Mantén el Apdex por encima de 0.85 durante 90 segundos.' },
        {
          goal: 'La demanda se ha duplicado. Mantén el Apdex por encima de 0.9 con un gasto de $0.16/s o menos.',
        },
        {
          goal: 'El tráfico nocturno vuelve al nivel inicial. Mantén el Apdex por encima de 0.9 con un gasto de $0.11/s o menos.',
        },
      ],
    },
    'second-server': {
      name: 'Segundo servidor',
      objectives: [
        { goal: 'Mantén el Apdex por encima de 0.9 durante 90 segundos.' },
        { goal: 'Un servidor fallará. Mantén el Apdex por encima de 0.85 durante 2 minutos.' },
        {
          goal: 'La demanda se ha duplicado. Mantén el Apdex por encima de 0.9 incluso con otro fallo.',
        },
      ],
    },
    'connection-limit': {
      name: 'Límite de conexiones',
      objectives: [
        { goal: 'Atiende todas las peticiones durante 90 segundos.' },
        {
          goal: 'La demanda se ha duplicado. Mantén el Apdex por encima de 0.9 durante 2 minutos.',
        },
        {
          goal: 'Un despliegue duplicará todos los pools. Mantén los errores por debajo del 1%.',
        },
      ],
    },
    'event-loop-stall': {
      name: 'Bloqueo del bucle de eventos',
      objectives: [
        { goal: 'Mantén el p99 por debajo de 300 ms durante 2 minutos.' },
        {
          goal: 'El cálculo de hashes de contraseñas será 4× más lento. Mantén el p99 por debajo de 600 ms durante 2 minutos.',
        },
      ],
    },
    'read-mostly': {
      name: 'Mayoría de lecturas',
      objectives: [
        { goal: 'Mantén el Apdex por encima de 0.9 durante 90 segundos.' },
        {
          goal: 'La demanda se ha duplicado. Mantén el Apdex por encima de 0.9 con un gasto de $2.60/s o menos.',
        },
        {
          goal: 'Se lanzará una consulta sin índice. Mantén el Apdex por encima de 0.85 durante los 2 minutos siguientes.',
        },
      ],
    },
    stampede: {
      name: 'Estampida',
      objectives: [
        { goal: 'Mantén el Apdex por encima de 0.9 durante 90 segundos.' },
        { goal: 'La caché se reiniciará. Mantén el Apdex por encima de 0.85 durante 2 minutos.' },
        {
          goal: 'La demanda ha subido un 50%. La caché se reinicia otra vez. Mantén el Apdex por encima de 0.85 con un gasto de $8.00/s o menos.',
        },
      ],
    },
    'slow-uploads': {
      name: 'Subidas lentas',
      objectives: [
        { goal: 'Mantén el Apdex por encima de 0.9 durante 90 segundos.' },
        {
          goal: 'La demanda ha subido un 60%. Mantén el Apdex por encima de 0.9 con un gasto de $6.00/s o menos.',
        },
        {
          goal: 'Una tarea fallará para siempre. Mantén la cola por debajo de 500 tareas durante 2 minutos.',
        },
      ],
    },
    bots: {
      name: 'Bots',
      objectives: [
        { goal: 'Mantén el Apdex por encima de 0.9 durante 90 segundos.' },
        { goal: 'Llegan los scrapers. Mantén el Apdex por encima de 0.9 durante 2 minutos.' },
        {
          goal: 'Han vuelto. Mantén el Apdex por encima de 0.9 con un gasto de $10.80/s o menos.',
        },
      ],
    },
    'zone-outage': {
      name: 'Caída de zona',
      objectives: [
        { goal: 'Mantén el Apdex por encima de 0.9 durante 90 segundos.' },
        { goal: 'Una zona fallará. Mantén el Apdex por encima de 0.85 durante 2 minutos.' },
        {
          goal: 'La demanda ha subido un 50%. Una zona vuelve a fallar. Mantén el Apdex por encima de 0.85 con un gasto de $22.20/s o menos.',
        },
      ],
    },
    'cold-start': {
      name: 'Arranque en frío',
      objectives: [
        { goal: 'Mantén el Apdex por encima de 0.9 durante 90 segundos.' },
        { goal: 'Se acerca un pico de 4×. Mantén el Apdex por encima de 0.85 durante 2 minutos.' },
        {
          goal: 'Tráfico nocturno. Mantén el Apdex por encima de 0.9 con un gasto de $17.40/s o menos.',
        },
      ],
    },
    'stale-checkout': {
      name: 'Pago desactualizado',
      objectives: [
        { goal: 'Mantén el Apdex por encima de 0.9 durante 90 segundos.' },
        {
          goal: 'Las escrituras se acumularán. Mantén cada pago correcto durante 2 minutos.',
          watch: { label: 'Pago' },
        },
        {
          goal: 'La demanda ha subido un 50% y las escrituras vuelven. Mantén cada pago correcto de principio a fin.',
          watch: { label: 'Pago' },
        },
      ],
    },
    'gc-pauses': {
      name: 'Pausas de GC',
      objectives: [
        {
          goal: 'Mantén las lecturas de API por debajo de 110 ms en el p99 durante 90 segundos.',
          watch: { label: 'p99 de lectura' },
        },
        {
          goal: 'El heap se llenará. Mantén las lecturas de API por debajo de 110 ms en el p99 durante 2 minutos.',
          watch: { label: 'p99 de lectura' },
        },
        {
          goal: 'Se vuelve a llenar. Mantén las lecturas por debajo de 110 ms en el p99 con un gasto de $93.20/s o menos.',
          watch: { label: 'p99 de lectura' },
        },
      ],
    },
    'retry-storm': {
      name: 'Tormenta de reintentos',
      objectives: [
        { goal: 'Mantén el Apdex por encima de 0.9 durante 90 segundos.' },
        {
          goal: 'La base de datos se ralentizará durante 20 s. Vuelve a bajar los errores por debajo del 1% y mantenlo así durante 2 minutos.',
        },
        {
          goal: 'Se vuelve a ralentizar. Baja los errores por debajo del 1% y mantenlo con un gasto de $197.00/s o menos.',
        },
      ],
    },
    'analytics-primary': {
      name: 'Analítica en el primario',
      objectives: [
        { goal: 'Mantén el Apdex por encima de 0.9 durante 90 segundos.' },
        {
          goal: 'Cierre de trimestre: un informe recorrerá todas las tablas. Mantén el Apdex por encima de 0.85 durante 2 minutos.',
        },
        {
          goal: 'La demanda ha subido un 50%. Mantén el Apdex por encima de 0.9 con un gasto de $254.00/s o menos.',
        },
      ],
    },
    'far-away': {
      name: 'Usuarios lejanos',
      objectives: [
        { goal: 'Atiende todas las peticiones durante 2 minutos.' },
        {
          goal: 'La mitad de tus usuarios vive fuera de Norteamérica. Consigue lecturas de API por debajo de 140 ms de media durante 2 minutos.',
          watch: { label: 'Media de lectura' },
        },
      ],
    },
    'missed-write': {
      name: 'Escritura perdida',
      objectives: [
        {
          goal: 'Cada lectura de API debe ver la última escritura. Mantenlo así durante 2 minutos.',
          watch: { label: 'Lecturas actualizadas' },
        },
        {
          goal: 'Una réplica fallará. Mantén las lecturas actualizadas y los errores por debajo del 1% durante 2 minutos.',
          watch: { label: 'Lecturas actualizadas' },
        },
      ],
    },
    'hot-key': {
      name: 'Clave caliente',
      objectives: [
        { goal: 'Mantén el Apdex por encima de 0.9 durante 2 minutos.' },
        {
          goal: 'Una celebridad publicará algo. Mantén el Apdex por encima de 0.85 durante 2 minutos.',
        },
      ],
    },
  },
  lbPolicies: {
    weighted: { label: 'Ponderado' },
    'round-robin': { label: 'Round robin' },
    'least-conn': { label: 'Menos conexiones' },
    p2c: { label: 'Dos opciones' },
    hash: { label: 'Hash consistente' },
  },
  logAcks: {
    '0': { name: 'Sin ack' },
    '1': { name: 'Líder' },
    all: { name: 'Todas las réplicas' },
  },
  mutators: {
    'chaos-monkey': {
      name: 'Chaos Monkey',
      rule: 'Los fallos de instancia dominan desde Semilla',
    },
    'hn-front-page': {
      name: 'Portada de Hacker News',
      rule: 'Los picos de tráfico llegan el triple de a menudo',
    },
    'legacy-monolith': {
      name: 'Monolito legacy',
      rule: 'Una base de código PHP enorme: migraciones ×3, la deuda empieza al 40%',
    },
    'one-region': {
      name: 'Una sola región para siempre',
      rule: 'Sin nodos fuera de la región de origen',
    },
    'no-caches': { name: 'Sin cachés', rule: 'Sin caché ni CDN' },
    'tight-budget': {
      name: 'Presupuesto ajustado',
      rule: 'Las subvenciones se reducen a la mitad',
    },
    'single-language': {
      name: 'Un solo lenguaje',
      rule: 'Todos los servidores de aplicaciones ejecutan PHP',
    },
    postgres: {
      name: 'Postgres para todo',
      rule: 'Sin caché, sin almacenes de columnas anchas, sin bases de consenso y sin almacenes de datos',
    },
    'strict-slo': { name: 'SLO estricto', rule: 'El SLO sube un nivel' },
    'shared-tenancy': {
      name: 'Tenencia compartida',
      rule: 'Los vecinos ruidosos roban CPU a todas las instancias',
    },
  },
  perks: {
    'angel-network': { name: 'Red de ángeles', effect: 'Caja inicial ×2' },
    'alumni-network': { name: 'Red de exalumnos', effect: '+1 ingeniero en Pre-semilla' },
    'institutional-knowledge': {
      name: 'Conocimiento institucional',
      effect: 'Conserva 1 investigación tras un exit',
    },
    'pattern-recognition': {
      name: 'Reconocimiento de patrones',
      effect: 'Conocimiento +20%',
    },
    'founders-reputation': {
      name: 'Reputación del fundador',
      effect: 'Crecimiento de usuarios +10%',
    },
    'better-terms': {
      name: 'Mejores condiciones',
      effect: 'Dilución por ronda −2 puntos',
    },
    'night-shift': { name: 'Turno de noche', effect: 'Horas de desarrollo +10%' },
    'time-dilation': {
      name: 'Dilatación temporal',
      effect: 'Desbloquea velocidad ×20 y luego ×40',
    },
    playbooks: {
      name: 'Playbooks',
      effect: 'Espacios de playbook: 2, 5, 10, 25',
    },
    'war-stories': {
      name: 'Historias de guerra',
      effect:
        'Las acciones abiertas del postmortem aumentan las probabilidades la mitad de lo normal',
    },
    'head-start': {
      name: 'Ventaja inicial',
      effect: 'Empiezas en Pre-semilla, luego Semilla y luego Serie A',
    },
    autopilot: {
      name: 'Piloto automático',
      effect:
        'Políticas: encola el Estudio más barato, contrata y mantén frescos los servidores de aplicaciones',
    },
  },
  pmModes: {
    static: { label: 'Estático' },
    dynamic: { label: 'Dinámico' },
    ondemand: { label: 'Bajo demanda' },
  },
  policies: {
    'move-fast': { label: 'Avanzar rápido' },
    balanced: { label: 'Equilibrado' },
    quality: { label: 'Calidad' },
  },
  pricings: {
    'on-demand': {
      name: 'Bajo demanda',
      blurb: 'Tarifa completa. Puedes quitar el nodo en cualquier momento.',
    },
    reserved: {
      name: 'Reservado',
      blurb:
        '0.6×, con un compromiso de una semana de calendario. Si vendes antes de que acabe el plazo, debes el gasto.',
    },
    spot: {
      name: 'Spot',
      blurb: '0.3×. El proveedor puede recuperar el nodo con 10 s de aviso.',
    },
  },
  regionInfo: {
    na: { name: 'Norteamérica', short: 'NA' },
    eu: { name: 'Europa', short: 'EU' },
    apac: { name: 'Asia-Pacífico', short: 'APAC' },
    sa: { name: 'Sudamérica', short: 'SA' },
  },
  shardKeys: {
    hash: { name: 'Hash del ID de usuario' },
    range: { name: 'Rango de IDs' },
    tenant: { name: 'Por tenant' },
    region: { name: 'Por región' },
  },
  storageClasses: {
    standard: { name: 'Estándar' },
    infrequent: { name: 'Acceso poco frecuente' },
    archive: { name: 'Archivo' },
  },
  storageIops: {
    general: { name: 'Uso general' },
    provisioned: { name: 'IOPS aprovisionadas' },
  },
  tasks: {
    'add-index': {
      name: 'Añadir índice',
      effect: 'Acaba con una consulta lenta y cubre un patrón de consulta',
    },
    'eager-loading': {
      name: 'Carga anticipada',
      effect: 'Los frameworks ORM dejan de enviar consultas N+1',
    },
    'fix-leak': {
      name: 'Corregir la fuga de memoria',
      effect: 'Sin fugas hasta que se lance la próxima funcionalidad',
    },
    'session-state': {
      name: 'Eliminar el estado de sesión',
      effect: 'El pooling de transacciones deja de romper consultas',
    },
    refactor: {
      name: 'Refactorizar',
      effect: 'Deuda técnica −20 puntos',
    },
    'fix-bugs': {
      name: 'Corregir errores de migración',
      effect: 'El nuevo Stack deja de devolver errores en las peticiones',
    },
    'upgrade-cluster': {
      name: 'Actualizar clústeres',
      effect: 'Cada Clúster de Kubernetes ejecuta una versión con soporte durante un trimestre',
    },
    runbook: {
      name: 'Escribir un runbook',
      effect: 'Un tipo de incidente se resuelve solo, sin acción del jugador',
    },
    'idempotency-keys': {
      name: 'Claves de idempotencia',
      effect: 'Un pago reintentado nunca se cobra dos veces',
    },
    'off-loop': {
      name: 'Sacar el trabajo de CPU del bucle de eventos',
      effect: 'Node.js y Python async envían los tipos intensivos en CPU a hilos worker',
    },
    'timeouts-retries': {
      name: 'Añadir timeouts y reintentos',
      effect:
        'Cada enlace que sale de un Servidor de aplicaciones o un Worker obtiene un timeout de 5 s y reintentos con backoff',
    },
    'graceful-shutdown': {
      name: 'Apagado ordenado',
      effect:
        'Los despliegues y las reducciones de escala terminan las peticiones en curso en lugar de fallarlas',
    },
    'health-check': {
      name: 'Endpoint de comprobación de estado',
      effect: 'Un Balanceador de carga puede ejecutar comprobaciones de estado profundas',
    },
    'load-test': {
      name: 'Prueba de carga',
      effect: 'Muestra cada nodo con el doble de demanda durante un día de calendario',
    },
  },
  vecIndexes: {
    exact: { name: 'Exacto' },
    hnsw: { name: 'HNSW' },
  },
  ventures: {
    'b2b-saas': { name: 'B2B SaaS', summary: 'Pico por la tarde' },
    'consumer-social': {
      name: 'Red social de consumo',
      summary:
        'El doble de usuarios, la mitad de valor cada uno; contenido +50%; los picos virales llegan el doble de a menudo',
    },
    fintech: {
      name: 'Fintech',
      summary:
        'Horario laboral; compras ×4, escrituras +50%; una lectura obsoleta de dinero se multa',
    },
    streaming: {
      name: 'Contenido en streaming',
      summary: 'Pico entrada la noche; contenido ×4; el egress cuesta el triple',
    },
    'game-backend': {
      name: 'Backend de videojuegos',
      summary: 'Pico por la tarde; tiempo real ×4',
    },
    'ai-startup': { name: 'Startup de IA', summary: 'Demanda constante; IA ×3' },
    'e-commerce': {
      name: 'Comercio electrónico',
      summary: 'Compras ×2, búsquedas ×2; una oferta mensual programada',
    },
    'developer-platform': {
      name: 'Plataforma para desarrolladores',
      summary:
        'Demanda plana y a ráfagas; lecturas ×2; webhooks ×3 desde la Serie C; sin reintentos ingenuos',
    },
    healthcare: {
      name: 'Salud',
      summary:
        'Horario laboral; escrituras +50%; los datos se quedan en la región de origen a partir de la Serie A',
    },
    'ad-tech': {
      name: 'Adtech',
      summary: 'Demanda plana y enorme; pujas ×10; una petición de más de 100 ms no gana nada',
    },
    government: {
      name: 'Contrato público',
      summary:
        'Horario laboral con picos en las fechas límite; solo Java o C#; colocar un componente tarda un día',
    },
    bootstrapped: {
      name: 'Indie autofinanciado',
      summary: 'Sin rondas de financiación; la participación se queda al 100%',
    },
  },
  challenges: {
    'hello-world': {
      name: 'Hola, mundo',
      brief: 'Atiende 20 rps en una sola máquina por menos de $0.05/s.',
      inspiredBy: 'Todos los primeros despliegues',
    },
    'split-the-box': {
      name: 'Separar la máquina',
      brief:
        'La app y la base de datos comparten máquina. Llega a 100 rps con un p99 por debajo de 300 ms.',
      inspiredBy: 'El primer paso de escalado en la mayoría de las empresas',
    },
    slashdotted: {
      name: 'Slashdotteado',
      brief: 'Tráfico ×10 durante 3 minutos con un presupuesto fijo.',
      inspiredBy: 'El efecto Slashdot',
    },
    c10k: {
      name: 'C10k',
      brief: '10,000 conexiones abiertas. Los servidores con un proceso por petición las rechazan.',
      inspiredBy: 'El problema C10k de Dan Kegel (1999)',
    },
    'event-loop': {
      name: 'El bucle de eventos',
      brief: 'Solo Node.js. 5% de inicios de sesión. p99 por debajo de 300 ms.',
      inspiredBy: 'Node.js “No bloquees el bucle de eventos”',
    },
    'too-many-connections': {
      name: 'Demasiadas conexiones',
      brief: '40 servidores de aplicaciones, un solo Postgres. Ninguna conexión rechazada.',
      inspiredBy: 'Los límites de conexiones de PostgreSQL',
    },
    shoestring: {
      name: 'Stack Overflow con presupuesto mínimo',
      brief: 'Atiende 800 rps con un máximo de 12 nodos.',
      inspiredBy: 'Stack Overflow atendiendo un tráfico enorme con un puñado de servidores',
    },
    'n-plus-one': {
      name: 'El N+1',
      brief: 'Rails con consultas N+1. 12 DH para arreglarlo.',
      inspiredBy: 'La carga diferida de los ORM',
    },
    'thirteen-engineers': {
      name: 'Trece ingenieros',
      brief: 'Rails a 400 rps. 13 ingenieros tienen un día: 104 DH.',
      inspiredBy: 'Instagram tenía 13 empleados cuando Facebook la adquirió (2012)',
    },
    'credential-stuffing': {
      name: 'Relleno de credenciales',
      brief:
        'Los bots prueban contraseñas filtradas en el inicio de sesión. Haz que los usuarios reales sigan pudiendo entrar.',
      inspiredBy: 'Ataques habituales contra los puntos de acceso de inicio de sesión',
    },
    'black-friday': {
      name: 'Black Friday',
      brief: 'La demanda se triplica en el minuto 5 durante 5 minutos. Gasta lo menos posible.',
      inspiredBy: 'Los días punta del comercio minorista',
    },
    'us-east-1': {
      name: 'us-east-1',
      brief: 'Una zona muere en el minuto 5. Mantén el 99.9% de las peticiones.',
      inspiredBy: 'Varias caídas de AWS us-east-1',
    },
    'exactly-once': {
      name: 'Exactamente una vez',
      brief:
        'El proveedor de pagos se ralentiza hasta 2 s, dos veces. Cobra cada pago una sola vez.',
      inspiredBy: 'La idempotencia de los pagos',
    },
    'two-million-sockets': {
      name: 'Dos millones de sockets',
      brief: 'Dos millones de conexiones de chat abiertas. Mantenlas gastando lo mínimo.',
      inspiredBy: 'Phoenix alcanzó 2 millones de conexiones WebSocket en un solo servidor (2015)',
    },
    'pokemon-go': {
      name: 'Pokémon GO',
      brief: 'Día del lanzamiento: la demanda alcanza 50× la previsión en 10 minutos.',
      inspiredBy:
        'El tráfico del lanzamiento de Pokémon GO alcanzó unas 50× el objetivo previsto (2016)',
    },
    'healthcare-launch': {
      name: 'Lanzamiento del portal de salud',
      brief: 'El lanzamiento es en el minuto 2 y este diseño tiene muchos fallos. Encuéntralos.',
      inspiredBy: 'El lanzamiento de healthcare.gov (2013)',
    },
    'thundering-herd': {
      name: 'Manada atronadora',
      brief:
        'Los servidores de chat se reinician en el minuto 2. 240,000 clientes se reconectan e inician sesión a la vez.',
      inspiredBy: 'Las tormentas de reconexión',
    },
    'read-states': {
      name: 'Estados de lectura',
      brief: 'El heap se llena dos veces. Mantén el p99 por debajo de 90 ms. Cualquier runtime.',
      inspiredBy: 'Discord pasó un servicio de Go a Rust para eliminar los picos de GC (2020)',
    },
    'fail-whale': {
      name: 'La ballena del fallo',
      brief:
        'Atiende los feeds por debajo de 200 ms en el p99. Algunas cuentas tienen 10 millones de seguidores.',
      inspiredBy: 'Los problemas de escalado de la cronología de Twitter',
    },
    'reports-at-noon': {
      name: 'Informes al mediodía',
      brief:
        'Finanzas ejecuta sus informes en el primario en los minutos 2 y 5, y no se pueden cancelar. Mantén los pagos rápidos.',
      inspiredBy: 'Consultas analíticas en bases de datos transaccionales',
    },
    'gpu-economics': {
      name: 'Economía de las GPU',
      brief: 'Atiende todos los prompts de IA y mantén un 15% de los ingresos como margen.',
      inspiredBy: 'Inferencia autoalojada frente a API alojadas',
    },
    metastable: {
      name: 'Metaestable',
      brief:
        'Hay una tormenta de reintentos en curso. Recupera el servicio con el menor número de cambios.',
      inspiredBy: 'Fallos metaestables en sistemas distribuidos',
    },
    'regex-of-doom': {
      name: 'La regex de la perdición',
      brief:
        'Una nueva regla de WAF pone todos los WAF al 100% de CPU en el minuto 2. Restaura el servicio.',
      inspiredBy: 'Caída de Cloudflare, 2 de julio de 2019',
    },
    'forty-three-seconds': {
      name: '43 segundos',
      brief: 'El enlace entre regiones cae en el minuto 2. Mantén un solo líder.',
      inspiredBy: 'Partición de red de GitHub, 21 de octubre de 2018',
    },
    'follow-the-sun': {
      name: 'Seguir el sol',
      brief:
        'Cuatro regiones, cada una con su propio pico vespertino, a lo largo de un día. Gasta menos de $700/s.',
      inspiredBy: 'Picos diarios globales',
    },
    celebrity: {
      name: 'Celebridad',
      brief: 'Una celebridad publica en el minuto 2. El 30% de las lecturas piden una sola clave.',
      inspiredBy: 'Claves calientes de cuentas virales',
    },
    'gone-from-the-internet': {
      name: 'Fuera de internet',
      brief:
        'Un cambio de enrutamiento en el minuto 2 saca todas las regiones de internet. Restaura la conectividad.',
      inspiredBy: 'Caída de Facebook, 4 de octubre de 2021',
    },
    'the-typo': {
      name: 'La errata',
      brief:
        'En el minuto 2, un comando que debía quitar un servidor se lleva por delante todo el nivel de búsqueda.',
      inspiredBy: 'Caída de Amazon S3, 28 de febrero de 2017',
    },
    'leap-second': {
      name: 'Segundo intercalar',
      brief:
        'En el minuto 2, el reloj de Asia-Pacífico repite un segundo. Todos los servidores de aplicaciones de allí se ponen al 100% de CPU. Mantén el p99 por debajo de 380 ms.',
      inspiredBy: 'El segundo intercalar de 2012',
    },
    'rule-of-40': {
      name: 'La regla del 40',
      brief:
        'Los usuarios crecen un 25% durante la partida. Alcanza una suma de crecimiento y margen de 40: mantén un margen del 15%.',
      inspiredBy: 'La regla del 40 del SaaS',
    },
    'postgres-for-everything': {
      name: 'Postgres para todo',
      brief:
        'Atiende todos los tipos de petición con Postgres como único almacén de datos, con un p99 por debajo de 800 ms.',
      inspiredBy: 'El argumento de “solo usa Postgres”',
    },
    'five-nines': {
      name: 'Cinco nueves',
      brief:
        'Cuatro semanas: fallan dos servidores y una región, y el tráfico se triplica una vez. Atiende el 99.999%.',
      inspiredBy: 'Objetivos de disponibilidad del 99.999%',
    },
  },
  components: {
    users: {
      name: 'Usuarios',
      product: 'Internet',
      blurb:
        'Donde empieza el tráfico. Un dominio resuelve a un solo host, así que Usuarios solo admite un enlace.',
    },
    payments: {
      name: 'Pagos',
      product: 'Facturas',
      blurb: 'Los ingresos esperan aquí. El cajón guarda alrededor de un minuto de ingresos.',
    },
    analytics: {
      name: 'Analítica',
      product: 'OpenTelemetry',
      blurb: 'Enlaza cualquier nodo con ella. Muestrea ese tráfico y lo convierte en Conocimiento.',
    },
    server: {
      name: 'Servidor de aplicaciones',
      product: 'VM',
      blurb: 'Ejecuta tu código. Responde a las peticiones y envía consultas a la base de datos.',
    },
    database: {
      name: 'Base de datos',
      product: 'PostgreSQL o MySQL',
      blurb:
        'La fuente de la verdad y el único nodo que acepta escrituras. Un tamaño mayor lo reinicia. Postgres lee y escanea más barato; MySQL escribe más barato y cambia el esquema en línea.',
    },
    dns: {
      name: 'DNS',
      product: 'Route 53',
      blurb:
        'Round robin entre hasta 8 hosts. Sin comprobaciones de estado: un host caído conserva su parte.',
    },
    lb: {
      name: 'Balanceador de carga',
      product: 'NGINX',
      blurb:
        'Reparte el tráfico entre servidores de aplicaciones o hosts de base de datos y descarta un host caído en su siguiente comprobación de estado.',
    },
    pooler: {
      name: 'Pooler de conexiones',
      product: 'PgBouncer',
      blurb:
        'Muchas conexiones de la aplicación comparten 20 conexiones a la base de datos. Agrupa contra un único host.',
    },
    cache: {
      name: 'Caché',
      product: 'Redis',
      blurb:
        'La forma más barata de recortar lecturas mientras los datos calientes caben en memoria. Las escrituras pasan y la invalidan, y un reinicio arranca en frío.',
    },
    replica: {
      name: 'Réplica de lectura',
      product: 'Réplica de PostgreSQL o MySQL',
      blurb:
        'Enlaza una base de datos con ella y la copia. Recibe las lecturas y los informes, y añadir una no la reinicia. Va por detrás de las escrituras, así que algunas lecturas de la API vuelven desactualizadas.',
    },
    auth: {
      name: 'Proveedor de autenticación',
      product: 'Auth0',
      blurb: 'Hashea las contraseñas por ti. Se cobra por usuario.',
    },
    search: {
      name: 'Motor de búsqueda',
      product: 'Elasticsearch',
      blurb: 'Responde a las consultas de búsqueda. 400 por segundo por cada paso de tamaño.',
    },
    storage: {
      name: 'Almacenamiento de objetos',
      product: 'Amazon S3',
      blurb: 'Guarda los archivos subidos. Sin límite. Pagas por lo que almacena.',
    },
    doc: {
      name: 'Almacén de documentos',
      product: 'MongoDB, Firestore',
      blurb:
        'Guarda documentos en lugar de filas. Sin joins ni conexiones que agrupar: una capacidad fija de lecturas y escrituras, y cada consulta necesita su propio índice.',
    },
    queue: {
      name: 'Cola',
      product: 'RabbitMQ',
      blurb:
        'Acepta trabajo ahora para que los workers lo hagan después. Los usuarios solo esperan a que se encole.',
    },
    worker: {
      name: 'Worker',
      product: 'Sidekiq',
      blurb:
        'Ejecuta tu código con tareas de una cola. Los usuarios nunca esperan por él. Enlázalo a los datos que lee una exportación.',
    },
    log: {
      name: 'Flujo de eventos',
      product: 'Apache Kafka',
      blurb:
        'Un log, no una cola: los eventos permanecen después de leerse, así que un consumidor puede reproducirlos. Cada consumidor lee una partición y se queda atrás a su propio ritmo.',
    },
    fn: {
      name: 'Función serverless',
      product: 'AWS Lambda',
      blurb:
        'Ejecuta tu código por petición sin una máquina que pagar: nada mientras está inactiva, un arranque en frío al reactivarse y 1,000 ejecuciones a la vez.',
    },
    cdn: {
      name: 'CDN',
      product: 'Cloudflare',
      blurb:
        'Responde cerca del usuario las páginas que se pueden cachear. El egress desde el edge cuesta menos.',
    },
    waf: {
      name: 'WAF',
      product: 'ModSecurity',
      blurb:
        'Bloquea a los bots antes de que lleguen a la aplicación, y con ellos a algunos usuarios reales.',
    },
    gw: {
      name: 'API Gateway',
      product: 'Kong',
      blurb:
        'Limita la tasa y enruta las llamadas a la API. Pasado su límite, las peticiones fallan como throttled, y cobra por petición.',
    },
    ws: {
      name: 'Hub en tiempo real',
      product: 'Socket.IO',
      blurb:
        'Mantiene una conexión abierta por cada mensaje en tiempo real. Cuántas caben depende del runtime.',
    },
    psp: {
      name: 'Proveedor de pagos',
      product: 'Stripe',
      blurb: 'Cobra las tarjetas en cada checkout. 2.9% más $0.30 por checkout.',
    },
    autoscaler: {
      name: 'Autoescalador',
      product: 'Auto Scaling group',
      blurb:
        'Enlaza servidores de aplicaciones o workers con él. Añade copias cuando van cargados y las retira cuando están inactivas.',
    },
    ci: {
      name: 'Pipeline de CI/CD',
      product: 'GitHub Actions',
      blurb:
        'Despliega lo que espera. Su estrategia de despliegue define cuánto tarda un despliegue, cuánto gasta y cuán malo es un despliegue malo.',
    },
    cluster: {
      name: 'Clúster de Kubernetes',
      product: 'Kubernetes',
      blurb:
        'Enlaza servidores de aplicaciones o workers con él. Se empaquetan en nodos compartidos: 15% menos gasto, copias en 30 s.',
    },
    warehouse: {
      name: 'Almacén de datos',
      product: 'BigQuery',
      blurb:
        'Responde a los escaneos de informes en columnas. 1.5 s cada uno, sin límite, y se paga por escaneo.',
    },
    vec: {
      name: 'Índice vectorial',
      product: 'pgvector, Pinecone, Qdrant',
      blurb:
        'Responde a las búsquedas de vecinos más cercanos sobre tus embeddings. Mantiene el índice en memoria, y un prompt que pasa por él genera más ingresos.',
    },
    gpu: {
      name: 'Nodo GPU',
      product: 'vLLM sobre NVIDIA',
      blurb: 'Sirve prompts de IA en tokens por segundo. Cada paso de tamaño duplica las GPUs.',
    },
    edge: {
      name: 'Función edge',
      product: 'Cloudflare Workers',
      blurb:
        'Ejecuta pequeños handlers junto al usuario: 5 ms, sin arranque en frío y un techo de CPU en lugar de una máquina.',
    },
    llm: {
      name: 'API de LLM',
      product: 'Un modelo alojado',
      blurb: 'Sirve prompts de IA sin GPUs. Se paga por token y tiene límite de tasa.',
    },
    msgp: {
      name: 'Proveedor de notificaciones push',
      product: 'Amazon SNS',
      blurb: 'Envía notificaciones push y correo. Se paga por mensaje, 10,000 por segundo.',
    },
    wide: {
      name: 'Almacén de columnas anchas',
      product: 'Apache Cassandra',
      blurb:
        'Replica cada clave en N nodos. Las lecturas preguntan a R de ellos y las escrituras esperan a W.',
    },
    dsql: {
      name: 'SQL distribuido',
      product: 'CockroachDB',
      blurb: 'SQL sobre Raft. Cada escritura espera a una mayoría de sus réplicas.',
    },
    cdc: {
      name: 'Conector CDC',
      product: 'Debezium',
      blurb:
        'Enlaza una base de datos con él. Lee cada cambio del log de escritura y lo publica en un flujo de eventos, así que la aplicación nunca escribe dos veces.',
    },
    mesh: {
      name: 'Service mesh',
      product: 'Istio',
      blurb:
        'Enlaza servidores de aplicaciones y workers con él. Un sidecar junto a cada uno reintenta y corta sus llamadas, y las vigila: +1 ms por salto y 5% de su CPU.',
    },
    ff: {
      name: 'Feature flags',
      product: 'LaunchDarkly',
      blurb:
        'Despliega una funcionalidad al 5%, 25%, 50% o a todos los usuarios, y la apaga. Los cambios se propagan a todos los servidores en segundos. Un despliegue malo solo llega a la parte que la tiene.',
    },
    pki: {
      name: 'Secretos y certificados',
      product: "Let's Encrypt",
      blurb:
        'Guarda las claves y renueva los certificados TLS antes de que caduquen. Sin él en funcionamiento, el certificado caduca en el calendario y el sitio se cae.',
    },
  },
  features: {
    'landing-page': {
      name: 'Página de aterrizaje',
      effect: 'Mercado +20%, vistas de página +10%',
    },
    'signup-flow': {
      name: 'Flujo de registro',
      effect: 'Crecimiento +15%, las escrituras llegan antes',
    },
    pagination: {
      name: 'Paginación',
      effect: 'Las lecturas de API envían la mitad de los bytes',
      hidden: 'Añade un patrón de consulta sin índice',
    },
    'password-login': {
      name: 'Inicio de sesión con contraseña',
      effect: 'Llegan inicios de sesión: 80 ms de CPU cada uno',
    },
    'paid-plans': {
      name: 'Planes de pago',
      effect: 'Las escrituras generan un 30% más, además de suscripciones',
    },
    'email-digests': {
      name: 'Resúmenes por correo',
      effect:
        'Bajas −10%. Los resúmenes se envían en una ráfaga de jobs: el doble de exportaciones, 400 ms de CPU y 50 lecturas cada uno',
      hidden: 'El envío es una ráfaga de jobs',
    },
    'search-filters': {
      name: 'Filtros de búsqueda',
      effect: 'Las búsquedas generan un 25% más',
      hidden: 'Cada consulta de búsqueda cuesta un 40% más',
    },
    'profile-photos': {
      name: 'Fotos de perfil',
      effect: 'Crecimiento +10%, llegan subidas: 120 ms de CPU cada una',
    },
    'public-api': {
      name: 'API pública',
      effect: 'Mercado +25%, lecturas de API +30%',
      hidden: 'Bots +50%',
    },
    'infinite-scroll': {
      name: 'Scroll infinito',
      effect: 'Las lecturas de API generan un 10% más, y los usuarios envían un 40% más',
    },
    video: {
      name: 'Video',
      effect: 'Mercado +40%, llega video: 5 MB cada uno',
    },
    chat: {
      name: 'Chat',
      effect: 'Bajas −20%, los mensajes en tiempo real mantienen conexiones abiertas',
    },
    checkout: {
      name: 'Pago',
      effect: 'Llegan pagos: $25 cada uno, a través del Proveedor de pagos',
    },
    'notifications-center': {
      name: 'Centro de notificaciones',
      effect: 'Crecimiento +10%, tiempo real +20%',
    },
    'mobile-app': {
      name: 'App móvil',
      effect: 'Mercado +60%, lecturas de API +50%',
    },
    'data-export': {
      name: 'Exportación de datos',
      effect:
        'Las escrituras generan un 20% más. Llegan exportaciones: 400 ms de CPU y 50 lecturas cada una',
    },
    dashboards: {
      name: 'Cuadros de mando',
      effect: 'Mercado +10%. Llegan informes: un escaneo de tabla cada uno',
    },
    'ai-assistant': {
      name: 'Asistente de IA',
      effect: 'Llegan prompts de IA: $24 cada uno, servidos por un Nodo GPU o la API de LLM',
    },
    recommendations: {
      name: 'Recomendaciones',
      effect: 'Video +30%',
      hidden: 'Exportaciones +30%: el modelo entrena por lotes',
    },
    'audit-log': {
      name: 'Registro de auditoría',
      effect: 'Mercado +10%: las empresas pueden comprar',
      hidden: 'Cada consulta de escritura cuesta un 20% más',
    },
    'activity-feed': {
      name: 'Feed de actividad',
      effect:
        'Mercado +50%. Llegan feeds: 20 lecturas cada uno, o un timeline con fan-out al escribir',
    },
    webhooks: {
      name: 'Webhooks',
      effect: 'Mercado +20%. Llegan webhooks: llamadas de 800 ms a servidores de clientes',
    },
    'push-notifications': {
      name: 'Notificaciones push',
      effect:
        'Crecimiento +15%. Llegan notificaciones, a través del Proveedor de notificaciones push',
      hidden: 'Bajas +5%: los usuarios se cansan de ellas',
    },
    localization: {
      name: 'Localización',
      effect: 'Mercado +40% fuera de Norteamérica',
    },
    'offline-mode': {
      name: 'Modo sin conexión',
      effect: 'Bajas −10%',
      hidden: 'Escrituras +10%: los dispositivos se sincronizan en ráfagas al reconectar',
    },
    'single-sign-on': {
      name: 'Inicio de sesión único',
      effect: 'Mercado +10%: las empresas inician sesión con SAML',
    },
    'data-residency': {
      name: 'Residencia de datos',
      effect:
        'Necesario para el mercado de la UE: los datos de la UE se quedan en una región de la UE',
    },
    'status-page': {
      name: 'Página de estado',
      effect: 'Bajas −10%: los usuarios ven que lo tienes controlado',
    },
    'usage-pricing': {
      name: 'Precios por uso',
      effect: 'Las exportaciones, escrituras, prompts y webhooks generan un 15% más',
    },
  },
  frameworks: {
    none: {
      name: 'Sin framework',
      blurb: 'Rápido de ejecutar, lento de construir funcionalidades.',
    },
    jetzig: {
      name: 'Jetzig',
      blurb:
        'Rutas basadas en archivos, plantillas, consultas a la base de datos y trabajos en segundo plano en un solo paquete: entrega funcionalidades rápido. 1.3× de CPU y 25 MB por proceso, sobre un toolchain joven.',
    },
    tokamak: {
      name: 'Tokamak',
      blurb:
        'Un contenedor de inyección de dependencias sobre http.zig: el cableado explícito reduce la coordinación y la deuda técnica. 1.05× de CPU y 5 MB por proceso, con un ecosistema pequeño.',
    },
    servant: {
      name: 'Servant',
      blurb:
        'El tipo de la API es el contrato: de ahí salen el enrutado, los clientes y la documentación, así que los equipos coordinan menos y hay menos deriva. 1.0× de CPU y 2 MB por proceso, con una curva de aprendizaje a nivel de tipos.',
    },
    ihp: {
      name: 'IHP',
      blurb:
        'Con todo incluido: generación de código, un constructor de consultas con seguridad de tipos y una cola de trabajos integrada. Entrega funcionalidades rápido con 1.3× de CPU y 40 MB por proceso, sobre un toolchain basado en Nix.',
    },
    laravel: {
      name: 'Laravel',
      blurb:
        'Entrega funcionalidades rápido, y el trabajo en segundo plano cuesta un 20% menos de horas de desarrollo. 1.8× de CPU (1.1× en modo worker), y Eloquent hace 3 consultas de lectura donde bastaría con 1.',
    },
    rails: {
      name: 'Rails',
      blurb:
        'Entrega funcionalidades rápido, las vistas de página ganan un 20% más. 1.5× de CPU y consultas N+1.',
    },
    express: {
      name: 'Express',
      blurb:
        'Mínimo y en todas partes. 1.1× de CPU, y la maraña de middleware hace que la deuda técnica crezca un 10% más rápido.',
    },
    django: {
      name: 'Django',
      blurb:
        'Entrega funcionalidades rápido, y las herramientas internas cuestan un 30% menos de horas de desarrollo con el panel de administración. 1.4× de CPU y consultas N+1.',
    },
    symfony: {
      name: 'Symfony',
      blurb:
        'Estructura estricta: un 30% menos de coordinación y una deuda técnica que crece un 30% más despacio. 1.5× de CPU y sin consultas N+1.',
    },
    sinatra: {
      name: 'Sinatra',
      blurb: 'Ligero. 1.1× de CPU.',
    },
    flask: {
      name: 'Flask',
      blurb: 'Ligero. 1.1× de CPU.',
    },
    gin: {
      name: 'Gin',
      blurb: 'Un router ligero. 1.05× de CPU.',
    },
    'spring-boot': {
      name: 'Spring Boot',
      blurb:
        'Estructura para equipos grandes: un 30% menos de coordinación. 1.3× de CPU, 200 MB más y 15 s más de arranque.',
    },
    aspnet: {
      name: 'ASP.NET Core',
      blurb: 'Rápido y completo. 1.05× de CPU.',
    },
    phoenix: {
      name: 'Phoenix',
      blurb: 'Las páginas LiveView ganan un 30% más. 1.1× de CPU.',
    },
    axum: {
      name: 'Axum',
      blurb: 'Construido sobre Tokio y Tower. Sin CPU extra.',
    },
    actix: {
      name: 'Actix Web',
      blurb: 'Entre los más rápidos en los benchmarks. 0.95× de CPU.',
    },
    fastapi: {
      name: 'FastAPI',
      blurb:
        'Validación con Pydantic y el mejor ecosistema para integrar modelos: las peticiones `ai` ganan un 15% más. 1.15× de CPU, y solo sobre un servidor ASGI. 10 MB.',
    },
    fastify: {
      name: 'Fastify',
      blurb:
        'Serialización basada en esquemas: las lecturas cuestan un 20% menos de CPU. Sin sobrecarga propia. 5 MB.',
    },
    nextjs: {
      name: 'Next.js',
      blurb:
        'Renderizado en servidor y regeneración estática incremental: las páginas ganan un 50% más, a 1.6× de su CPU, y una CDN puede responder al 40% de ellas. 30 MB por proceso.',
    },
    nestjs: {
      name: 'NestJS',
      blurb:
        'Estructura para equipos grandes: un 30% menos de coordinación. 1.3× de CPU y 20 MB por proceso.',
    },
    fiber: {
      name: 'Fiber',
      blurb:
        'Una API al estilo de Express sobre fasthttp: sin sobrecarga de CPU y sin HTTP/2. 5 MB por proceso.',
    },
    quarkus: {
      name: 'Quarkus',
      blurb:
        'Pensado para imágenes nativas: una compilación de GraalVM tarda la mitad. 1.1× de CPU y 100 MB por proceso.',
    },
    hono: {
      name: 'Hono',
      blurb: 'Un router pequeño sobre estándares web: sin sobrecarga de CPU. 2 MB por proceso.',
    },
    elysia: {
      name: 'Elysia',
      blurb:
        'Pensado para Bun, con tipos comprobados del servidor al cliente: la deuda técnica crece un 15% más despacio. Sin sobrecarga de CPU. 5 MB por proceso.',
    },
    koa: {
      name: 'Koa',
      blurb:
        'El sucesor de Express, construido sobre funciones asíncronas: 1.05× de CPU. 5 MB por proceso.',
    },
    adonis: {
      name: 'AdonisJS',
      blurb:
        'Las ideas de Laravel sobre Node.js: entrega funcionalidades rápido. 1.4× de CPU, 25 MB por proceso, y el ORM Lucid hace consultas N+1.',
    },
    codeigniter: {
      name: 'CodeIgniter',
      blurb: 'Un framework PHP pequeño que no estorba: 1.1× de CPU. 4 MB por proceso.',
    },
    sanic: {
      name: 'Sanic',
      blurb: 'Asíncrono desde la base: 1.05× de CPU. 10 MB por proceso.',
    },
    rocket: {
      name: 'Rocket',
      blurb:
        'Enrutado con seguridad de tipos y poco boilerplate: el más rápido de escribir en Rust. 1.05× de CPU. 3 MB por proceso.',
    },
  },
  incidents: {
    spike: {
      name: 'Pico de tráfico',
      cause: 'Un gran portal de noticias te enlazó. La demanda se triplicó.',
      prevention: 'Capacidad de reserva, una Caché y más Servidores de aplicaciones.',
    },
    instance: {
      name: 'Fallo de instancia',
      cause: 'Murió el host sobre el que corría una VM.',
      prevention:
        'Una segunda copia detrás de un Balanceador de carga, que se salta los hosts muertos.',
    },
    connections: {
      name: 'Agotamiento de conexiones',
      cause: 'Un despliegue duplicó todos los pools de conexiones. Postgres rechazó el exceso.',
      prevention: 'Un Pooler de conexiones, o pools más pequeños.',
    },
    loop: {
      name: 'Bloqueo del bucle de eventos',
      cause: 'El hashing de contraseñas pasó de 10 a 12 rondas: 4× de CPU por inicio de sesión.',
      prevention:
        'El thread pool de libuv, un Proveedor de autenticación, o un runtime sin un único bucle de eventos.',
    },
    leak: {
      name: 'Fuga de memoria',
      cause: 'Un proceso persistente fue perdiendo memoria hasta que el kernel lo mató.',
      prevention: 'Reinicia el servicio, o ejecuta PHP: libera todo después de cada petición.',
    },
    'slow-query': {
      name: 'Consulta lenta',
      cause:
        'Una nueva funcionalidad lanzó una consulta sin índice. Cada lectura recorre la tabla entera.',
      prevention:
        'El análisis de consultas encuentra el índice que falta. Una Caché mantiene la mayoría de las lecturas fuera de la tabla.',
    },
    'bad-deploy': {
      name: 'Despliegue defectuoso',
      cause: 'Un despliegue metió un bug. Las peticiones a los Servidores de aplicaciones fallan.',
      prevention: 'Un pipeline que pueda revertir, tests automatizados y despliegues más pequeños.',
    },
    'bot-surge': {
      name: 'Oleada de bots',
      cause: 'Los scrapers encontraron el sitio. La mitad de todo el tráfico era de bots.',
      prevention: 'Un WAF delante de los Servidores de aplicaciones.',
    },
    stuffing: {
      name: 'Relleno de credenciales',
      cause:
        'Los bots probaron contraseñas filtradas: 20× los inicios de sesión, cada uno un hash bcrypt.',
      prevention: 'Un WAF bloquea a la mayoría. Un Proveedor de autenticación hashea el resto.',
    },
    stampede: {
      name: 'Estampida de caché',
      cause:
        'La Caché se reinició vacía. Todos los fallos de caché fueron a la Base de datos a la vez.',
      prevention:
        'La protección contra estampidas agrupa los fallos. El calentamiento de la Caché la rellena antes de que llegue el tráfico.',
    },
    poison: {
      name: 'Mensaje envenenado',
      cause:
        'Una tarea que siempre fallaba volvía una y otra vez. Los Workers la reintentaban en lugar de la Cola.',
      prevention: 'Una cola de mensajes muertos aparta una tarea que falla.',
    },
    ddos: {
      name: 'DDoS',
      cause: 'Un atacante inundó el edge con 50 veces el tráfico normal.',
      prevention:
        'Un WAF, con el modo Under attack en cuanto empiece. Un CDN se lleva la parte cacheable.',
    },
    'cluster-upgrade': {
      name: 'Actualización forzada del clúster',
      cause:
        'El proveedor cloud actualizó un Clúster de Kubernetes que corría una versión sin soporte. Los pods que usaban APIs eliminadas entraron en crash-loop.',
      prevention:
        'Actualiza los clústeres al menos una vez por trimestre, o deja que un equipo de Platform los mantenga al día.',
    },
    certificate: {
      name: 'Certificado caducado',
      cause: 'El certificado TLS caducó. Todos los navegadores rechazaron el sitio.',
      prevention: 'La automatización de certificados lo renueva antes de que caduque.',
    },
    'psp-outage': {
      name: 'Caída del Proveedor de pagos',
      cause: 'El Proveedor de pagos se cayó. Todos los pagos fallaron.',
      prevention: 'Nada por tu parte: es su caída. Los pagos vuelven cuando termine.',
    },
    zone: {
      name: 'Caída de zona',
      cause: 'Falló una zona entera. Todos sus Nodos se quedaron en gris.',
      prevention:
        'Copias en una segunda zona con capacidad de reserva, y un standby de Base de datos.',
    },
    'disk-full': {
      name: 'Disco lleno',
      cause:
        'Los logs y el WAL llenaron el disco de la Base de datos. Todas las escrituras fallaron.',
      prevention: 'Las alertas de disco lo detectan a tiempo. Amplía el volumen para acabar.',
    },
    'repl-lag': {
      name: 'Retraso de replicación',
      cause:
        'Una ráfaga de escrituras dejó a las réplicas varios segundos por detrás. Las lecturas posteriores a una escritura devolvían datos obsoletos.',
      prevention: 'El enrutamiento read-your-writes manda esas lecturas al primario.',
    },
    'latency-regression': {
      name: 'Regresión de latencia',
      cause:
        'Un despliegue añadió una llamada síncrona más a cada petición: cada respuesta tarda 150 ms más.',
      prevention: 'Percentiles y tracing en la ruta de la petición, y un canary que vigila el p99.',
    },
    'gc-storm': {
      name: 'Tormenta de pausas de GC',
      cause: 'El heap superó el 90%. El recolector pausó una de cada diez peticiones.',
      prevention: 'Más memoria, ZGC o ajuste de GOGC. Reinicia para acabar.',
    },
    'retry-storm': {
      name: 'Tormenta de reintentos',
      cause:
        'La Base de datos se ralentizó durante 20 s. Los clientes reintentaron a la vez, y los reintentos la mantuvieron sobrecargada.',
      prevention: 'Backoff con jitter, circuit breakers y descarte de carga.',
    },
    'deadline-day': {
      name: 'Día del plazo',
      cause:
        'Llegó el plazo del contrato: todas las agencias enviaron su trabajo a la vez, 3× la demanda habitual.',
      prevention: 'Capacidad reservada, descarte de carga y una Cola para el trabajo del plazo.',
    },
    'double-charge': {
      name: 'Cobro duplicado',
      cause:
        'El Proveedor de pagos se ralentizó. Los cobros expiraron y se reintentaron, y algunos se cobraron dos veces.',
      prevention: 'Claves de idempotencia. Detén los reintentos en el Enlace de cobro para acabar.',
    },
    'report-db': {
      name: 'El informe tumba la Base de datos',
      cause:
        'Un informe de cierre de trimestre escaneó todas las tablas del primario. Todos los tipos de petición se ralentizaron.',
      prevention: 'Un Almacén de datos se lleva los escaneos fuera del primario.',
    },
    'gpu-shortage': {
      name: 'Escasez de GPU',
      cause: 'El proveedor reclamó un Nodo GPU. No hay capacidad de H100 este mes.',
      prevention: 'La API de LLM asume los prompts cuando escasean las GPU.',
    },
    regex: {
      name: 'Backtracking de regex',
      cause:
        'Una nueva regla del WAF hizo backtracking con entradas largas. Todos los WAF iban al 100% de CPU.',
      prevention: 'Despliega las reglas primero en un canary. Desactiva la regla para acabar.',
    },
    region: {
      name: 'Caída de región',
      cause: 'Falló una región entera. Su tablero se quedó en gris.',
      prevention:
        'Una segunda región, GeoDNS para llevar allí a los usuarios, y datos que vivan en ambas.',
    },
    partition: {
      name: 'Partición de red',
      cause:
        'Las regiones perdieron el contacto. Las llamadas entre ellas expiraban, y las escrituras basadas en líder divergieron.',
      prevention:
        'Un almacén de consenso mantiene un único líder. Aísla al líder antiguo para acabar.',
    },
    'hot-key': {
      name: 'Clave caliente',
      cause:
        'Una celebridad publicó. El 30% de las lecturas pedían una sola clave, y su shard se saturó.',
      prevention:
        'Divide las claves calientes entre shards y las cachea en los Servidores de aplicaciones.',
    },
    config: {
      name: 'Push de configuración defectuoso',
      cause:
        'Un cambio de configuración llegó a todos los Servidores de aplicaciones y Workers a la vez, y se cayeron juntos. GitOps todo a la vez lo llevó también a todos los Espejos.',
      prevention:
        'Revierte para acabar. GitOps por etapas mantiene un cambio primero en una región.',
    },
    bgp: {
      name: 'Error de configuración de BGP',
      cause:
        'Un cambio de enrutamiento retiró a la empresa de internet. Ninguna región era accesible.',
      prevention: 'Revisa los cambios de enrutamiento. Revierte para acabar.',
    },
    audit: {
      name: 'Hallazgo de auditoría',
      cause: 'Un auditor de SOC 2 encontró una carencia. El simulacro de DR ya no cuenta.',
      prevention: 'Un equipo de Security corrige los hallazgos antes de que reinicien nada.',
    },
    'dr-drill': {
      name: 'Simulacro de DR',
      cause: 'Un fallo guionizado de la región principal, para medir la recuperación.',
      prevention:
        'Atiende todos los tipos de petición desde otra región en menos de una hora, sin perder escrituras.',
    },
    breach: {
      name: 'Brecha de datos',
      cause:
        'Una vulnerabilidad divulgada siguió sin parchear pasado su plazo, y alguien la aprovechó.',
      prevention: 'Parchea el ticket antes de que caduque. El backlog del Equipo muestra el plazo.',
    },
    'credential-leak': {
      name: 'Fuga de credenciales',
      cause:
        'Una página de phishing se llevó las credenciales de la Empresa, y un desconocido las usó.',
      prevention: 'Lee el dominio, no el logo. Denuncia el Correo como phishing y pierde su botón.',
    },
    'spot-reclaim': {
      name: 'Reclamación de Spot',
      cause:
        'El proveedor necesitaba recuperar la capacidad. Reclamó un Nodo Spot tras un aviso de 10 segundos.',
      prevention:
        'Flotas mixtas, apagado ordenado y copias bajo demanda detrás de un Balanceador de carga.',
    },
    'stale-read': {
      name: 'Lecturas obsoletas',
      cause:
        'Una Caché sirvió valores más allá de su TTL: una tabla con muchas escrituras adelantó a su invalidación, y las lecturas de las mismas filas volvían antiguas.',
      prevention: 'Un TTL más corto, una Caché write-through, o enrutamiento read-your-writes.',
    },
    reconnect: {
      name: 'Tormenta de reconexiones',
      cause:
        'Un Hub en tiempo real se reinició. Todos los clientes se reconectaron en el mismo segundo.',
      prevention:
        'El jitter de reconexión reparte la oleada, y el clustering le da más de una máquina.',
    },
    'runaway-bill': {
      name: 'Factura descontrolada',
      cause:
        'Un Autoescalador creció hasta su techo sin ningún pico que atender, y el Gasto subió sin ingresos extra.',
      prevention: 'Baja el techo del Autoescalador, y lee la factura cloud línea por línea.',
    },
    mtu: {
      name: 'Desajuste de MTU',
      cause:
        'La red de un socio usa un tamaño de paquete menor. Las subidas mayores que su MTU expiran al entrar.',
      prevention: 'Ajusta el tamaño del paquete, o mantén las subidas grandes en una sola red.',
    },
    'hot-shard': {
      name: 'Shard caliente del tenant grande',
      cause:
        'La clave del tenant más grande cayó en un solo shard. Sus lecturas y escrituras costaban 3× la CPU, y todo lo demás en ese shard espera detrás.',
      prevention:
        'Divide el tenant por clave entre shards, y mantén sus lecturas en una Caché delante de la Base de datos.',
    },
    'premiere-spike': {
      name: 'Pico de estreno',
      cause: 'Se estrenó un vídeo: 4× la demanda habitual de vídeo, todo en el mismo minuto.',
      prevention: 'Caché por niveles en el CDN, capacidad reservada y descarte de carga.',
    },
    'launch-day': {
      name: 'Día del lanzamiento',
      cause:
        'El juego se lanzó: 6× los mensajes en tiempo real habituales, y todos los clientes se conectan a la vez.',
      prevention:
        'Hubs en tiempo real dimensionados para el pico, jitter de reconexión y descarte de carga.',
    },
    'flash-sale': {
      name: 'Oferta flash',
      cause: 'Una oferta flash: 20× los pagos habituales durante unos minutos.',
      prevention: 'Una Cola para el trabajo de cobro, un Autoescalador y descarte de carga.',
    },
    'jvm-warmup': {
      name: 'Calentamiento de JVM bajo carga',
      cause:
        'Un Autoescalador añadió Servidores de aplicaciones Java durante un pico, y las nuevas copias arrancaron frías: 30% de velocidad durante sus primeros 30 s.',
      prevention:
        'Slow start en el Balanceador de carga, escalado programado y una imagen nativa de GraalVM, que arranca en caliente. Con slow start, una nueva copia recibe tráfico poco a poco, así que nunca responde en frío.',
    },
    'migration-lock': {
      name: 'Bloqueo de migración de esquema',
      cause:
        'Una migración ejecutó ALTER TABLE en la tabla más grande. Mantuvo el bloqueo mientras la copiaba, y todas las escrituras se encolaron detrás hasta que expiró.',
      prevention:
        'Las migraciones de esquema online cambian una tabla grande sin mantener el bloqueo.',
    },
    'supply-chain': {
      name: 'Compromiso de la cadena de suministro',
      cause:
        'Una dependencia publicó una versión maliciosa, y un despliegue la instaló. El paquete se ejecutó en los Servidores de aplicaciones y envió datos al exterior.',
      prevention:
        'El escaneo de dependencias detecta una puerta trasera publicada antes de que el build la instale; los permisos de Deno impiden que un paquete lea lo que no necesita.',
    },
    'accidental-delete': {
      name: 'Borrado accidental',
      cause:
        'Un operador borró datos. Una tabla desapareció, y todas las consultas que la necesitaban fallaron.',
      prevention:
        'La recuperación a un punto en el tiempo restaura la tabla al minuto anterior al borrado. Los simulacros de restauración demuestran que la copia de seguridad se puede restaurar.',
    },
    'operator-typo': {
      name: 'Error tipográfico del operador',
      cause:
        'Un comando que debía eliminar un Nodo coincidió con todo el Componente, y la mayoría de sus Nodos se fue con él.',
      prevention:
        'Un plan y una revisión antes de aplicar un cambio muestran qué va a eliminar, así que un error tipográfico se detiene en el plan.',
    },
    'table-bloat': {
      name: 'Bloat de tabla',
      cause:
        'PostgreSQL conserva la versión antigua de cada fila actualizada hasta que VACUUM la limpia. Las actualizaciones intensas adelantaron a la limpieza, y la tabla se llenó de filas muertas: cada lectura y escritura cuesta más CPU.',
      prevention:
        'Una ventana de retención mantiene las tablas pequeñas, y un motor MySQL no tiene filas muertas que limpiar.',
    },
    'page-leak': {
      name: 'Fuga de página cacheada',
      cause:
        'El CDN cacheó una página con sesión iniciada bajo una clave que omitía la cookie, y sirvió la página de un usuario a otro.',
      prevention:
        'Una clave de caché que incluye la cookie, para que una página personal nunca se comparta.',
    },
    'leap-second': {
      name: 'Segundo intercalar o desfase de reloj',
      cause:
        'Un segundo intercalar repitió un segundo del reloj. Los temporizadores saltaron dos veces, los leases expiraron antes de tiempo, y las peticiones y los locks de una región expiraron.',
      prevention:
        'El leap smearing reparte el segundo a lo largo de un día, así ningún reloj da un salto.',
    },
    'stale-opcache': {
      name: 'OPcache obsoleto',
      cause:
        'OPcache funciona con validate_timestamps desactivado, y un despliegue no lo reinició. Los servidores PHP siguieron ejecutando el código antiguo contra el esquema nuevo, y una parte de las peticiones falló.',
      prevention:
        'Un Pipeline de CI/CD reinicia OPcache en cada despliegue. Un reinicio limpia la caché a mano.',
    },
    'bun-compat': {
      name: 'Compatibilidad de runtime',
      cause:
        'Un paquete que funciona en Node.js no funciona en Bun, que es menos maduro. Una parte de las peticiones que lo tocaban falló hasta que se cambió el paquete.',
      prevention:
        'Los tests automatizados se ejecutan contra el runtime en el que se despliega un Servicio, y detectan el paquete antes de que lo haga un despliegue.',
    },
    'gevent-compat': {
      name: 'Incompatibilidad de librería',
      cause:
        'gevent hace monkey patch de la librería estándar, y una librería no lo soportó: sus llamadas bloqueaban el hub, y una parte de las peticiones falló.',
      prevention:
        'Los tests automatizados ejecutan el Servicio bajo gevent antes de desplegarlo, y muestran qué librería falla.',
    },
    'split-brain': {
      name: 'Split brain',
      cause:
        'Una partición de red partió en dos un clúster de Erlang distribuido. Cada mitad siguió atendiendo a sus propios clientes, y la mitad de los mensajes en tiempo real nunca llegó a la otra.',
      prevention:
        'Los experimentos de caos encuentran la partición antes de que ocurra. Un reinicio vuelve a unir el clúster.',
    },
  },
  kinds: {
    page: { label: 'Vista de página' },
    read: { label: 'Lectura de API' },
    write: { label: 'Escritura de API' },
    login: { label: 'Inicio de sesión' },
    search: { label: 'Búsqueda' },
    upload: { label: 'Subida' },
    bot: { label: 'Bot' },
    media: { label: 'Video' },
    rt: { label: 'Tiempo real' },
    buy: { label: 'Pago' },
    job: { label: 'Exportación' },
    report: { label: 'Informe' },
    ai: { label: 'Prompt de IA' },
    'q-read': { label: 'Consulta de lectura' },
    'q-write': { label: 'Consulta de escritura' },
    auth: { label: 'Llamada de autenticación' },
    'q-search': { label: 'Consulta de búsqueda' },
    'blob-put': { label: 'Escritura de objeto' },
    task: { label: 'Tarea' },
    'blob-get': { label: 'Lectura de objeto' },
    'q-tx': { label: 'Transacción' },
    charge: { label: 'Cobro' },
    'q-scan': { label: 'Escaneo' },
    infer: { label: 'Inferencia' },
    feed: { label: 'Feed' },
    hook: { label: 'Webhook' },
    push: { label: 'Notificación' },
    bid: { label: 'Petición de puja' },
    notify: { label: 'Mensaje push' },
    callout: { label: 'Llamada a cliente' },
    'k-write': { label: 'Escritura de timeline' },
  },
  pools: {
    page: { label: 'Vista de página' },
    read: { label: 'Lectura de API' },
    write: { label: 'Escritura de API' },
    login: { label: 'Inicio de sesión' },
    search: { label: 'Búsqueda' },
    upload: { label: 'Subida' },
    bot: { label: 'Bot' },
    media: { label: 'Video' },
    rt: { label: 'Tiempo real' },
    buy: { label: 'Pago' },
    job: { label: 'Exportación' },
    report: { label: 'Informe' },
    ai: { label: 'Prompt de IA' },
    feed: { label: 'Feed' },
    hook: { label: 'Webhook' },
    push: { label: 'Notificación' },
    bid: { label: 'Petición de puja' },
    failure: { label: 'Fallo' },
  },
  runtimes: {
    mod_php: {
      name: 'Apache mod_php',
      blurb:
        'Apache lanza un proceso por cada petición en curso, hasta 150. Cada proceso lleva PHP incrustado, así que la RAM se agota pronto.',
    },
    php_fpm: {
      name: 'PHP-FPM',
      blurb:
        'Un pool fijo de workers PHP detrás de NGINX. Cada petición en espera ocupa un worker. Shared nothing: sin fugas.',
    },
    php_worker: {
      name: 'Modo worker de PHP',
      blurb:
        'FrankenPHP, RoadRunner u Octane: la app arranca una sola vez, así que desaparece la sobrecarga por petición del framework. Pierde el shared nothing, así que pueden aparecer fugas de memoria y contaminación de estado.',
    },
    swoole: {
      name: 'Swoole',
      blurb:
        'Corrutinas sobre un bucle de eventos, E/S asíncrona como en Node.js y sin sobrecarga del framework por petición. Las extensiones que bloquean atascan el bucle. Mantiene conexiones en tiempo real a 20 KB cada una.',
    },
    puma: {
      name: 'Puma',
      blurb:
        'Un proceso por núcleo, 5 hilos cada uno. Los hilos solapan las esperas; el GVL mantiene la CPU en un solo núcleo.',
    },
    unicorn: {
      name: 'Unicorn',
      blurb:
        'Un proceso Rails por slot: simple y robusto, y consume mucha memoria. Una petición en espera ocupa un proceso entero, así que rechaza las conexiones en tiempo real.',
    },
    falcon: {
      name: 'Falcon',
      blurb:
        'Las fibras mantienen muchas conexiones inactivas por proceso. Una gema que bloquee atasca el bucle. 100 KB por conexión.',
    },
    node: {
      name: 'Node.js',
      blurb:
        'Un único bucle de eventos. Esperar no cuesta nada, pero usa un solo núcleo, y una petición lenta atasca todas las demás.',
    },
    node_cluster: {
      name: 'Clúster de Node.js',
      blurb:
        'Un bucle de eventos por núcleo. Usa todos los núcleos; la memoria y las conexiones crecen con ellos.',
    },
    bun: {
      name: 'Bun',
      blurb:
        'Un bucle de eventos más rápido y con arranque instantáneo, así que escala automáticamente y despliega mejor que Node.js. 60 MB y cero tiempo de arranque. Menos maduro: un paquete que funciona en Node.js puede romperse en él.',
    },
    deno: {
      name: 'Deno',
      blurb:
        'Los permisos bloquean la mayoría de los ataques a la cadena de suministro, con el desarrollo de funcionalidades un 10% más lento: menos paquetes son compatibles. El mismo bucle de eventos que Node.js.',
    },
    gunicorn: {
      name: 'Gunicorn',
      blurb:
        'Un pool de workers síncronos, una petición cada uno. Como PHP-FPM, pero con más memoria por worker.',
    },
    gevent: {
      name: 'Gunicorn con gevent',
      blurb:
        'Los hilos verdes mantienen muchas esperas de E/S por proceso, así que una base de datos lenta deja de retener un worker. El monkey patching puede romper una biblioteca. 30 KB por conexión.',
    },
    uvicorn: {
      name: 'Uvicorn ASGI',
      blurb:
        'Asíncrono como Node.js, con la CPU más lenta: una llamada que bloquee atasca el bucle. Mantiene conexiones en tiempo real a los 30 KB por conexión que marca el diseño.',
    },
    python_ft: {
      name: 'CPython con hilos libres',
      blurb:
        'Hilos realmente paralelos en todos los núcleos, un 10% más lentos por hilo, y un hilo por conexión no sale barato. Las extensiones de C que aún no están listas cuestan horas de desarrollo. 8 hilos y 100 KB por conexión.',
    },
    pypy: {
      name: 'PyPy',
      blurb:
        'El triple de CPU en Python puro que Gunicorn, tras un calentamiento del JIT. El escaso soporte de extensiones de C significa que no hay bonus del ecosistema de ML. 200 MB por worker.',
    },
    go: {
      name: 'Go net/http',
      blurb:
        'Goroutines en todos los núcleos. Esperar cuesta unos pocos KB, no un worker. El GC consume CPU cuando el heap está lleno.',
    },
    fasthttp: {
      name: 'fasthttp',
      blurb:
        'Un cuarto más rápido que net/http, con el desarrollo de funcionalidades un 10% más lento: la API no es estándar, parte del middleware no funciona y no hay HTTP/2.',
    },
    tomcat: {
      name: 'Tomcat',
      blurb:
        'Una JVM, 200 hilos en todos los núcleos. Arranca al 30% de velocidad y calienta durante 30 s. Cada petición en espera ocupa un hilo.',
    },
    java_virtual: {
      name: 'Hilos virtuales de Java',
      blurb:
        'Esperar ya no retiene un hilo de plataforma, así que una base de datos lenta solo añade latencia. Las llamadas nativas (JNI) siguen fijando el hilo portador, y la JVM sigue calentando durante 30 s. Las conexiones en tiempo real cuestan 10 KB.',
    },
    webflux: {
      name: 'Spring WebFlux',
      blurb:
        'Concurrencia muy alta con un bucle por proceso, y un 20% más lento de construir y depurar. Una llamada que bloquee atasca el bucle, y la JVM sigue calentando. 400 MB.',
    },
    graal: {
      name: 'Imagen nativa de GraalVM',
      blurb:
        'Arranca en menos de 100 ms sin calentamiento, con el 60% de la memoria de la JVM, 0.80× de su velocidad y compilaciones tres veces más largas. Un hilo por conexión, como Tomcat. Ideal para Funciones serverless.',
    },
    kestrel: {
      name: 'Kestrel',
      blurb:
        '.NET asíncrono en todos los núcleos. Esperar no retiene ningún hilo. Un calentamiento del JIT más corto que el de la JVM.',
    },
    native_aot: {
      name: 'Native AOT',
      blurb:
        'Sin JIT, así que arranca a plena velocidad, y más pequeño: 100 MB. 0.90× de velocidad, y las bibliotecas con mucha reflexión necesitan horas de desarrollo.',
    },
    beam: {
      name: 'BEAM',
      blurb:
        'Procesos apropiativos en todos los núcleos. Ninguna petición atasca a otra, y cada proceso recolecta su propia basura. CPU lenta.',
    },
    tokio: {
      name: 'Tokio',
      blurb:
        'Tareas asíncronas en todos los núcleos, sin GC y con poca memoria. Una tarea intensiva en CPU bloquea un hilo de trabajo.',
    },
    zig: {
      name: 'Servidor Zig multihilo',
      blurb:
        'Código nativo con asignadores explícitos y sin GC. Un servidor de 64 hilos usa todos los núcleos, pero cada petición en espera retiene un hilo. El estado persistente puede filtrarse.',
    },
    warp: {
      name: 'Haskell (GHC + Warp)',
      blurb:
        'Warp ejecuta hilos ligeros de GHC entre los núcleos. Especialistas productivos, pero con compilaciones y contratación más lentas. Las esperas de E/S no retienen ningún hilo del sistema operativo; el GC de heap compartido añade pausas y coste de CPU.',
    },
  },
  glossary: {
    annotation: { term: 'Anotación' },
    anycast: { term: 'Anycast' },
    apdex: { term: 'Apdex' },
    'async-io': { term: 'E/S asíncrona' },
    'at-least-once-delivery': { term: 'Entrega al menos una vez' },
    autoscaling: { term: 'Autoescalado' },
    'availability-zone': { term: 'Zona de disponibilidad' },
    backpressure: { term: 'Contrapresión' },
    bcrypt: { term: 'Bcrypt' },
    'binary-rpc': { term: 'RPC binario' },
    'bgp-border-gateway-protocol': { term: 'BGP (Border Gateway Protocol)' },
    'blast-radius': { term: 'Radio de impacto' },
    'blue-green-deployment': { term: 'Despliegue blue-green' },
    'bot-management': { term: 'Gestión de bots' },
    'brookss-law': { term: 'Ley de Brooks' },
    bulkhead: { term: 'Bulkhead' },
    'burn-rate': { term: 'Tasa de consumo' },
    'bytecode-cache': { term: 'Caché de bytecode' },
    'cache-hit-rate': { term: 'Tasa de aciertos de caché' },
    'cache-stampede': { term: 'Estampida de caché' },
    'cache-warming': { term: 'Calentamiento de caché' },
    'cache-aside': { term: 'Cache-aside' },
    'canary-deployment': { term: 'Despliegue canario' },
    'cascading-failure': { term: 'Fallo en cascada' },
    'cdc-change-data-capture': { term: 'CDC (captura de cambios de datos)' },
    'cdn-content-delivery-network': { term: 'CDN (red de distribución de contenido)' },
    'chaos-engineering': { term: 'Ingeniería del caos' },
    'circuit-breaker': { term: 'Circuit breaker' },
    'code-review': { term: 'Revisión de código' },
    'cold-start': { term: 'Arranque en frío' },
    compression: { term: 'Compresión' },
    'connection-pooling': { term: 'Pool de conexiones' },
    'consistent-hashing': { term: 'Hashing consistente' },
    'container-orchestration': { term: 'Orquestación de contenedores' },
    'continuous-batching': { term: 'Batching continuo' },
    'continuous-delivery': { term: 'Entrega continua' },
    'conways-law': { term: 'Ley de Conway' },
    'credential-stuffing': { term: 'Relleno de credenciales' },
    'data-residency': { term: 'Residencia de datos' },
    'ddos-distributed-denial-of-service': { term: 'DDoS (denegación de servicio distribuida)' },
    'dead-letter-queue': { term: 'Cola de mensajes muertos' },
    denormalization: { term: 'Desnormalización' },
    'dependency-scanning': { term: 'Análisis de dependencias' },
    'distributed-tracing': { term: 'Trazabilidad distribuida' },
    'diurnal-traffic': { term: 'Tráfico diurno' },
    'dns-round-robin': { term: 'Round robin de DNS' },
    'dora-metrics': { term: 'Métricas DORA' },
    downsampling: { term: 'Submuestreo' },
    drift: { term: 'Deriva' },
    egress: { term: 'Egress' },
    'edge-side-includes': { term: 'Includes del lado del edge' },
    'encryption-at-rest': { term: 'Cifrado en reposo' },
    'error-budget': { term: 'Presupuesto de error' },
    'event-loop': { term: 'Bucle de eventos' },
    'eventual-consistency': { term: 'Consistencia eventual' },
    'expand-and-contract': { term: 'Expand and contract' },
    'fallacies-of-distributed-computing': { term: 'Falacias de la computación distribuida' },
    'fan-out': { term: 'Fan-out' },
    'fan-out-on-write': { term: 'Fan-out en escritura' },
    'feature-flag': { term: 'Feature flag' },
    'four-golden-signals': { term: 'Cuatro señales doradas' },
    'gc-pause': { term: 'Pausa de GC' },
    geodns: { term: 'GeoDNS' },
    'gil-global-interpreter-lock': { term: 'GIL (bloqueo global del intérprete)' },
    gitops: { term: 'GitOps' },
    'graceful-degradation': { term: 'Degradación elegante' },
    'green-threads': { term: 'Green threads' },
    'health-check': { term: 'Comprobación de estado' },
    'hedged-request': { term: 'Petición hedged' },
    'hot-key': { term: 'Clave caliente' },
    'http-keep-alive': { term: 'Keep-alive de HTTP' },
    'http2-and-http3': { term: 'HTTP/2 y HTTP/3' },
    'iac-tool': { term: 'Herramienta de IaC' },
    idempotency: { term: 'Idempotencia' },
    'inverted-index': { term: 'Índice invertido' },
    'jit-warmup': { term: 'Calentamiento JIT' },
    'leaderless-replication': { term: 'Replicación sin líder' },
    'leap-smearing': { term: 'Leap smearing' },
    'littles-law': { term: 'Ley de Little' },
    'load-balancer': { term: 'Balanceador de carga' },
    'load-shedding': { term: 'Descarte de carga' },
    'memory-leak': { term: 'Fuga de memoria' },
    'materialized-view': { term: 'Vista materializada' },
    'metastable-failure': { term: 'Fallo metaestable' },
    mirror: { term: 'Espejo' },
    'model-inference': { term: 'Inferencia de modelo' },
    'mttd-and-mtta': { term: 'MTTD y MTTA' },
    mttr: { term: 'MTTR' },
    'n1-query': { term: 'Consulta N+1' },
    'network-partition': { term: 'Partición de red' },
    'node-drain': { term: 'Drenaje de nodo' },
    'object-storage': { term: 'Almacenamiento de objetos' },
    observability: { term: 'Observabilidad' },
    'oltp-and-olap': { term: 'OLTP y OLAP' },
    'on-call': { term: 'Guardia' },
    'operating-margin': { term: 'Margen operativo' },
    'percentile-p50-p95-p99': { term: 'Percentil (p50, p95, p99)' },
    'point-in-time-recovery': { term: 'Recuperación a un punto en el tiempo' },
    'power-of-two-choices': { term: 'Power of two choices' },
    'pre-fork-worker-model': { term: 'Modelo de workers pre-fork' },
    'process-per-request': { term: 'Un proceso por petición' },
    quantization: { term: 'Cuantización' },
    quorum: { term: 'Quórum' },
    raft: { term: 'Raft' },
    'rate-limiting': { term: 'Limitación de tasa' },
    'read-replica': { term: 'Réplica de lectura' },
    'read-your-writes-consistency': { term: 'Consistencia de lectura de tus propias escrituras' },
    'red-method': { term: 'Método RED' },
    'redos-regular-expression-denial-of-service': {
      term: 'ReDoS (denegación de servicio por expresión regular)',
    },
    'replication-lag': { term: 'Retraso de replicación' },
    'retry-with-backoff-and-jitter': { term: 'Reintentos con backoff y jitter' },
    'rpo-and-rto': { term: 'RPO y RTO' },
    'rule-of-40': { term: 'Regla del 40' },
    runbook: { term: 'Runbook' },
    service: { term: 'Servicio' },
    sharding: { term: 'Sharding' },
    'shared-nothing': { term: 'Shared nothing' },
    'slo-sla-sli': { term: 'SLO, SLA, SLI' },
    'soc-2': { term: 'SOC 2' },
    'spot-instance': { term: 'Instancia spot' },
    'strangler-pattern': { term: 'Patrón strangler' },
    'synchronous-replication': { term: 'Replicación síncrona' },
    'tail-at-scale': { term: 'Tail at scale' },
    'tech-debt': { term: 'Deuda técnica' },
    'thread-pool': { term: 'Pool de hilos' },
    'thundering-herd': { term: 'Efecto estampida' },
    'tiered-caching': { term: 'Caché en niveles' },
    timeout: { term: 'Tiempo de espera' },
    'tls-certificate': { term: 'Certificado TLS' },
    'token-bucket': { term: 'Token bucket' },
    'transactional-outbox': { term: 'Outbox transaccional' },
    'use-method': { term: 'Método USE' },
    utilization: { term: 'Utilización' },
    'vertical-and-horizontal-scaling': { term: 'Escalado vertical y horizontal' },
    'waf-web-application-firewall': { term: 'WAF (firewall de aplicaciones web)' },
    'write-through-cache': { term: 'Caché write-through' },
  },
  research: {
    stripe: {
      name: 'Stripe Billing',
      blurb: 'Los pagos se cobran solos.',
    },
    'dns-rr': {
      name: 'Round robin de DNS',
      blurb: 'Desbloquea DNS: reparte los usuarios entre hasta 8 hosts.',
    },
    'load-balancing': {
      name: 'Balanceo de carga',
      blurb:
        'Desbloquea el balanceador de carga: reparte por capacidad y se salta los hosts caídos.',
    },
    'health-checks': {
      name: 'Comprobaciones de estado',
      blurb: 'DNS deja de enviar usuarios a un host caído.',
    },
    'auth-provider': {
      name: 'Identidad gestionada',
      blurb:
        'Desbloquea el proveedor de autenticación. Los inicios de sesión dejan de costarte CPU.',
    },
    caching: {
      name: 'Caché',
      blurb:
        'Desbloquea Redis. La mayoría de las consultas de lectura no llegan ni a la base de datos.',
    },
    pooling: {
      name: 'Pooling de conexiones',
      blurb:
        'Desbloquea PgBouncer. Las conexiones de la aplicación comparten unas pocas conexiones de base de datos.',
    },
    replication: {
      name: 'Réplicas de lectura',
      blurb: 'Desbloquea la réplica de lectura.',
    },
    'eager-loading': {
      name: 'Carga anticipada',
      blurb: 'Corrige las consultas N+1: los frameworks ORM envían 1 consulta de lectura, no 3.',
    },
    'query-analysis': {
      name: 'Análisis de consultas',
      blurb:
        'EXPLAIN encuentra consultas sin índice. Añade el índice desde la tarjeta de la base de datos.',
    },
    logs: {
      name: 'Logs estructurados',
      blurb:
        'Los errores se separan por causa: varados, descartados, rechazados, caídos, obsoletos, oom.',
    },
    metrics: {
      name: 'Métricas',
      blurb: 'Gráficos de historial para cada nodo.',
    },
    percentiles: {
      name: 'Percentiles',
      blurb: 'p50, p95 y p99 junto a la media. Mira cuánto esconde la media.',
    },
    alerting: {
      name: 'Alertas',
      blurb: 'Un aviso cuando los errores, el p99 o la saturación cruzan un umbral.',
    },
    funnels: {
      name: 'Analítica de embudos',
      blurb: 'Mira dónde caen los registros y arréglalo: crecimiento de usuarios +10%.',
    },
    'php-fpm': {
      name: 'PHP-FPM',
      blurb: 'Un pool de workers en lugar de procesos Apache. Tú fijas el tamaño del pool.',
    },
    opcache: {
      name: 'OPcache',
      blurb: 'PHP deja de compilar scripts en cada petición: 2.5× de velocidad de CPU.',
    },
    'lang-ruby': {
      name: 'Ruby',
      blurb:
        'Un proceso por núcleo, 5 hilos cada uno. Los hilos solapan las esperas; el GVL mantiene la CPU en un solo núcleo.',
    },
    'lang-node': {
      name: 'Node.js',
      blurb:
        'Un único bucle de eventos. Esperar no cuesta nada, pero usa un núcleo, y una petición lenta bloquea todas las demás.',
    },
    'lang-python': {
      name: 'Python',
      blurb:
        'Un pool de workers síncronos, una petición cada uno. Como PHP-FPM con más memoria por worker.',
    },
    'node-cluster': {
      name: 'Modo clúster de Node.js',
      blurb:
        'Un bucle de eventos por núcleo. Usa todos los núcleos; la memoria y las conexiones crecen con los núcleos.',
    },
    'libuv-pool': {
      name: 'Pool de hilos de libuv',
      blurb:
        'El hash de contraseñas sale del bucle de eventos, así que los inicios de sesión dejan de bloquear otras peticiones.',
    },
    'fw-laravel': {
      name: 'Laravel',
      blurb:
        'Entrega funcionalidades rápido, y el trabajo en segundo plano cuesta un 20% menos de horas de desarrollo. 1.8× de CPU (1.1× en modo worker), y Eloquent hace 3 consultas de lectura donde bastaría con 1.',
    },
    'fw-rails': {
      name: 'Rails',
      blurb:
        'Entrega funcionalidades rápido, las vistas de página ganan un 20% más. 1.5× de CPU y consultas N+1.',
    },
    'fw-express': {
      name: 'Express',
      blurb:
        'Mínimo y en todas partes. 1.1× de CPU, y la maraña de middleware hace que la deuda técnica crezca un 10% más rápido.',
    },
    'fw-django': {
      name: 'Django',
      blurb:
        'Entrega funcionalidades rápido, y las herramientas internas cuestan un 30% menos de horas de desarrollo con el panel de administración. 1.4× de CPU y consultas N+1.',
    },
    'fw-symfony': {
      name: 'Symfony',
      blurb:
        'Estructura estricta: un 30% menos de coordinación y una deuda técnica que crece un 30% más despacio. 1.5× de CPU y sin consultas N+1.',
    },
    'fw-sinatra': {
      name: 'Sinatra',
      blurb: 'Ligero. 1.1× de CPU.',
    },
    'fw-flask': {
      name: 'Flask',
      blurb: 'Ligero. 1.1× de CPU.',
    },
    keepalive: {
      name: 'Reutilización de conexiones',
      blurb: 'Keep-alive: las llamadas internas se saltan el handshake TCP, 1 ms cada una.',
    },
    gzip: {
      name: 'Compresión',
      blurb:
        'Gzip: las respuestas de página y de lectura son un 70% más pequeñas, a cambio de un 10% más de CPU.',
    },
    timeouts: {
      name: 'Tiempos de espera y reintentos',
      blurb:
        'Fija el tiempo de espera de cada llamada en 1, 5 o 30 s, y reintenta las llamadas fallidas.',
    },
    'lb-algorithms': {
      name: 'Algoritmos de balanceo de carga',
      blurb: 'Menos conexiones y power of two choices.',
    },
    ci: {
      name: 'Entrega continua',
      blurb:
        'Un pipeline despliega en 5 minutos, no en 30, y puede revertir un despliegue defectuoso. Recreate y Rolling vienen incluidos.',
    },
    'blue-green': {
      name: 'Despliegues blue-green',
      blurb:
        'Blue-green: la nueva versión arranca junto a la anterior, así que un despliegue defectuoso rompe el 10% de las peticiones.',
    },
    canary: {
      name: 'Despliegues canario',
      blurb:
        'Canario: el 5% del tráfico conoce primero la nueva versión. El menor radio de impacto, el despliegue más lento.',
    },
    'code-review': {
      name: 'Revisión de código',
      blurb:
        'Muestra los costes ocultos de una funcionalidad antes de que se despliegue. Despliegues defectuosos −20%.',
    },
    'testing-culture': {
      name: 'Pruebas automatizadas',
      blurb: 'El pipeline ejecuta pruebas antes de cada despliegue. Despliegues defectuosos -30%.',
    },
    'full-text-search': {
      name: 'Búsqueda de texto completo',
      blurb: 'Desbloquea el motor de búsqueda. Postgres deja de atender la búsqueda.',
    },
    'object-storage': {
      name: 'Almacenamiento de objetos',
      blurb: 'Desbloquea el almacenamiento de objetos. Las subidas dejan de acabar en Postgres.',
    },
    'cache-strategies': {
      name: 'Estrategias de caché',
      blurb:
        'Read-through, write-through y write-behind: la caché se hace cargo de la lectura y de la escritura.',
    },
    'lifecycle-rules': {
      name: 'Reglas de ciclo de vida del almacenamiento',
      blurb: 'Los objetos antiguos pasan solos a una clase de almacenamiento más barata.',
    },
    retention: {
      name: 'Políticas de retención',
      blurb:
        'Una base de datos archiva o borra filas antiguas: almacenamiento más barato, informes más lentos.',
    },
    cdn: {
      name: 'Entrega de contenido',
      blurb: 'Desbloquea la CDN: páginas respondidas en el edge, egress más barato.',
    },
    waf: {
      name: 'Firewall de aplicaciones web',
      blurb: 'Desbloquea el WAF: bloquea bots y, con ellos, a algunos usuarios reales.',
    },
    'api-gateway': {
      name: 'API Gateway',
      blurb:
        'Desbloquea el API Gateway: la puerta de entrada que enruta cada tipo de petición y limita la tasa de cada llamada.',
    },
    websockets: {
      name: 'WebSockets',
      blurb:
        'Desbloquea el hub en tiempo real: mantiene las conexiones abiertas que necesitan los mensajes en tiempo real.',
    },
    'background-jobs': {
      name: 'Trabajos en segundo plano',
      blurb: 'Desbloquea el Worker: tu código, fuera del camino de la petición.',
    },
    queues: {
      name: 'Colas de mensajes',
      blurb:
        'Desbloquea la cola. Los servidores de aplicaciones pasan el trabajo lento a los Workers.',
    },
    'stampede-protection': {
      name: 'Protección contra estampidas',
      blurb: 'Una caché fría agrupa los fallos, así la base de datos aguanta mientras se llena.',
    },
    'cache-warming': {
      name: 'Precalentamiento de caché',
      blurb: 'Una caché vuelve de un reinicio en su mayoría caliente.',
    },
    'lang-go': {
      name: 'Go',
      blurb:
        'Goroutines en todos los núcleos. Esperar cuesta unos pocos KB, no un worker. El GC consume CPU cuando el heap está lleno.',
    },
    'lang-java': {
      name: 'Java',
      blurb:
        'Una JVM, 200 hilos en todos los núcleos. Arranca al 30% de velocidad y calienta durante 30 s. Cada petición en espera ocupa un hilo.',
    },
    'lang-csharp': {
      name: 'C#',
      blurb:
        '.NET async en todos los núcleos. Esperar no ocupa ningún hilo. Un calentamiento JIT más corto que el de la JVM.',
    },
    'fw-gin': {
      name: 'Gin',
      blurb: 'Un router ligero. 1.05× de CPU.',
    },
    'fw-spring-boot': {
      name: 'Spring Boot',
      blurb:
        'Estructura para equipos grandes: un 30% menos de coordinación. 1.3× de CPU, 200 MB más y 15 s más de arranque.',
    },
    'fw-aspnet': {
      name: 'ASP.NET Core',
      blurb: 'Rápido y completo. 1.05× de CPU.',
    },
    tracing: {
      name: 'Trazado distribuido',
      blurb:
        'El tiempo de cada tipo de petición, nodo a nodo. Nombra el salto más lento de cada tipo.',
    },
    'trace-search': {
      name: 'Búsqueda de trazas',
      blurb: 'Los estudios se ejecutan un 25% más rápido.',
    },
    notebooks: {
      name: 'Notebooks',
      blurb: 'Los estudios se ejecutan un 25% más rápido.',
    },
    'cert-automation': {
      name: 'Automatización de certificados',
      blurb: 'Los certificados se renuevan solos antes de caducar.',
    },
    'lang-elixir': {
      name: 'Elixir',
      blurb:
        'Procesos con planificación apropiativa en todos los núcleos. Ninguna petición bloquea a otra, y cada proceso recoge su propia basura. CPU lenta.',
    },
    'lang-rust': {
      name: 'Rust',
      blurb:
        'Tareas async en todos los núcleos, sin GC, poca memoria. Una tarea intensiva en CPU bloquea un hilo worker.',
    },
    'lang-zig': {
      name: 'Zig',
      blurb:
        'Código nativo con asignadores explícitos y sin GC. Un servidor de 64 hilos usa todos los núcleos, pero cada petición en espera ocupa un hilo. El estado persistente puede sufrir fugas.',
    },
    'lang-haskell': {
      name: 'Haskell',
      blurb:
        'Warp ejecuta hilos GHC ligeros repartidos entre los núcleos. Especialistas productivos, pero con compilaciones y contrataciones más lentas. Las esperas de E/S no ocupan ningún hilo del sistema operativo; el GC de heap compartido añade pausas y coste de CPU.',
    },
    'fw-phoenix': {
      name: 'Phoenix',
      blurb: 'Las páginas LiveView ganan un 30% más. 1.1× de CPU.',
    },
    checkout: {
      name: 'Checkout',
      blurb: 'Desbloquea el proveedor de pagos y la funcionalidad Checkout.',
    },
    'tiered-caching': {
      name: 'Caché por niveles',
      blurb:
        'Los edges de la CDN consultan un nivel regional antes del origen: el 92% del vídeo sale del edge.',
    },
    'multi-az': {
      name: 'Múltiples zonas',
      blurb: 'Coloca nodos en tres zonas y dale a un nodo de datos un standby en otra zona.',
    },
    autoscaling: {
      name: 'Autoescalado',
      blurb:
        'Desbloquea el autoescalador: las copias de un servidor de aplicaciones o de un Worker siguen la carga.',
    },
    containers: {
      name: 'Orquestación de contenedores',
      blurb: 'Desbloquea el clúster de Kubernetes: un 15% menos de gasto, escalado en 30 s.',
    },
    serverless: {
      name: 'Serverless',
      blurb:
        'Desbloquea la función serverless: tu código por petición, y ninguna máquina que pagar.',
    },
    'reserved-instances': {
      name: 'Instancias reservadas',
      blurb: 'Precio reservado: 0.6× por un compromiso de una semana de calendario.',
    },
    'spot-instances': {
      name: 'Instancias spot',
      blurb: 'Precio spot: 0.3×, hasta que el proveedor recupera el nodo.',
    },
    'slo-dashboards': {
      name: 'Cuadros de mando de SLO',
      blurb: 'El presupuesto de error, en el HUD.',
    },
    'error-budgets': {
      name: 'Presupuestos de error',
      blurb:
        'El presupuesto restante acelera al equipo un 10%. Un presupuesto agotado congela las funcionalidades a media velocidad.',
    },
    'backoff-jitter': {
      name: 'Backoff con jitter',
      blurb:
        'Los reintentos esperan y se reparten, dentro de un presupuesto de un 10% más de llamadas.',
    },
    'circuit-breakers': {
      name: 'Circuit breakers',
      blurb:
        'Un enlace deja de llamar durante 5 s cuando falla la mitad de sus llamadas, y luego lo intenta de nuevo.',
    },
    'load-shedding': {
      name: 'Descarte de carga por prioridad',
      blurb: 'Un servidor de aplicaciones saturado descarta primero los tipos de menor valor.',
    },
    'idempotency-keys': {
      name: 'Claves de idempotencia',
      blurb: 'Un cobro reintentado nunca cobra dos veces.',
    },
    'ryw-routing': {
      name: 'Enrutado read-your-writes',
      blurb:
        'Un servidor de aplicaciones puede enviar al primario las lecturas que siguen a una escritura.',
    },
    'gogc-tuning': {
      name: 'Ajuste del GC de Go',
      blurb: 'GOGC 50, 100 o 200: menos memoria a cambio de más CPU de GC, o al revés.',
    },
    'fw-axum': {
      name: 'Axum',
      blurb: 'Construido sobre Tokio y Tower. Sin CPU extra.',
    },
    'fw-actix': {
      name: 'Actix Web',
      blurb: 'Entre los más rápidos en los benchmarks. 0.95× de CPU.',
    },
    zgc: {
      name: 'ZGC',
      blurb:
        'Java se detiene 1 ms en lugar de 30 ms, a cambio de un 10% del rendimiento y un 15% más de memoria.',
    },
    'data-warehouse': {
      name: 'Almacenamiento de datos',
      blurb: 'Desbloquea el almacén de datos. Los informes dejan de escanear el primario.',
    },
    'event-streaming': {
      name: 'Streaming de eventos',
      blurb:
        'Desbloquea el flujo de eventos: un log que conserva sus mensajes, para que los consumidores los reproduzcan.',
    },
    embeddings: {
      name: 'Embeddings',
      blurb:
        'Desbloquea el índice vectorial. Las respuestas de IA usan tus propios documentos, y Python conserva su ventaja.',
    },
    'hosted-models': {
      name: 'Modelos alojados',
      blurb: 'Desbloquea la API de LLM: prompts de IA sin GPUs, pagando por token.',
    },
    'model-serving': {
      name: 'Servicio de modelos',
      blurb:
        'Desbloquea el Nodo GPU: prompts de IA a un precio por token más bajo, si se mantiene ocupado.',
    },
    pitr: {
      name: 'Recuperación a un punto en el tiempo',
      blurb:
        'Copias de seguridad para la base de datos: snapshots nocturnos, o archivado de WAL con minutos de RPO.',
    },
    'tls-everywhere': {
      name: 'TLS en todas partes',
      blurb: 'Cifra cada enlace interno. Obligatorio para SOC 2.',
    },
    http2: {
      name: 'HTTP/2',
      blurb:
        'Una conexión lleva muchas peticiones: un 15% menos de salto de usuario en las vistas de página.',
    },
    'sync-replication': {
      name: 'Replicación síncrona',
      blurb: 'Las escrituras esperan a una réplica. Obligatorio para el consenso.',
    },
    'restore-drills': {
      name: 'Simulacros de restauración',
      blurb:
        'Se prueban las copias de seguridad, así una restauración funciona cuando de verdad importa.',
    },
    'dependency-scanning': {
      name: 'Escaneo de dependencias',
      blurb:
        'Cada build revisa sus librerías en busca de vulnerabilidades conocidas. Obligatorio para SOC 2.',
    },
    sharding: {
      name: 'Sharding',
      blurb: 'Divide los datos entre nodos por clave.',
    },
    'encryption-at-rest': {
      name: 'Cifrado en reposo',
      blurb: 'Los discos y las copias de seguridad están cifrados. Obligatorio para SOC 2.',
    },
    'multi-region': {
      name: 'Múltiples regiones',
      blurb: 'Abre una región en otro continente. Cada región es una pestaña.',
    },
    'geo-dns': {
      name: 'GeoDNS',
      blurb: 'Los usuarios van a su propia región, o a la más cercana que siga viva.',
    },
    'infra-as-code': {
      name: 'Infraestructura como código',
      blurb:
        'Elige una herramienta de IaC. Crea un espejo de una región en otra y aplica planes para mantenerlo sincronizado.',
    },
    gitops: {
      name: 'GitOps',
      blurb: 'Los espejos se sincronizan solos, todos a la vez o por etapas.',
    },
    anycast: {
      name: 'Anycast',
      blurb: '20 ms menos de hop de usuario en todas partes.',
    },
    'document-db': {
      name: 'Bases de datos documentales',
      blurb: 'Desbloquea el Almacén de documentos: sin migraciones de esquema y sin joins tampoco.',
    },
    'edge-compute': {
      name: 'Computación en el edge',
      blurb: 'Desbloquea la Función edge: pequeños handlers que se ejecutan junto al usuario.',
    },
    http3: {
      name: 'HTTP/3',
      blurb: '20% menos de hop de usuario para los usuarios lejanos.',
    },
    notifications: {
      name: 'Notificaciones',
      blurb: 'Desbloquea el Proveedor de notificaciones push.',
    },
    'hybrid-fanout': {
      name: 'Fan-out híbrido',
      blurb:
        'Push para cuentas normales, pull para celebridades. Las cachés dividen las claves calientes.',
    },
    leaderless: {
      name: 'Replicación sin líder',
      blurb: 'Desbloquea el Almacén de columnas anchas con quórums ajustables.',
    },
    consensus: {
      name: 'Bases de datos de consenso',
      blurb: 'Desbloquea el SQL distribuido.',
    },
    'dr-drills': {
      name: 'Simulacros de recuperación ante desastres',
      blurb: 'Ejecuta el simulacro de DR para la lista de verificación de la IPO.',
    },
    soc2: {
      name: 'Programa SOC 2',
      blurb: 'Elemento de la lista de verificación de la IPO.',
    },
    'gdpr-residency': {
      name: 'Controles de residencia de datos',
      blurb:
        'Elemento de la lista de verificación de la IPO: los usuarios de la UE se sirven desde una región de la UE.',
    },
    'security-team': {
      name: 'Equipo de seguridad',
      blurb:
        'Elemento de la lista de verificación de la IPO. Los hallazgos de auditoría se corrigen antes de que reinicien nada.',
    },
    'investor-relations': {
      name: 'Relaciones con inversores',
      blurb: 'Múltiplo de valoración +2.',
    },
    'guidance-modeling': {
      name: 'Modelado de previsión',
      blurb: 'Muestra la probabilidad de superar cada nivel de previsión.',
    },
    'php-jit': {
      name: 'PHP JIT',
      blurb:
        'El JIT de PHP 8: 1.05× CPU en los tipos web y 1.6× en los de mucho CPU. A page y read apenas les ayuda.',
    },
    'worker-threads': {
      name: 'Worker threads de Node.js',
      blurb:
        'Un pool de 4 worker threads (40 MB) saca los tipos de mucho CPU del bucle de eventos.',
    },
    yjit: {
      name: 'YJIT',
      blurb: 'El JIT de Ruby: 1.3× de trabajo de CPU a cambio de un 20% más de memoria.',
    },
    gevent: {
      name: 'gevent',
      blurb:
        'Los hilos verdes mantienen muchas esperas de E/S por proceso, así que una base de datos lenta deja de retener un worker. El monkey patching puede romper una librería. 30 KB por conexión.',
    },
    asgi: {
      name: 'ASGI con Uvicorn',
      blurb:
        'Asíncrono como Node.js, con CPU más lenta: una llamada bloqueante atasca el loop. Mantiene conexiones en tiempo real a 30 KB cada una, como en el diseño.',
    },
    'php-worker-mode': {
      name: 'Modo worker de PHP',
      blurb:
        'FrankenPHP, RoadRunner u Octane: la app arranca una vez, así que desaparece la sobrecarga del framework por petición. Pierdes shared nothing, así que las fugas de memoria y la contaminación de estado pasan a ser posibles.',
    },
    swoole: {
      name: 'Swoole',
      blurb:
        'Corrutinas sobre un bucle de eventos, E/S asíncrona como Node.js y sin sobrecarga del framework por petición. Las extensiones bloqueantes atascan el bucle. Mantiene conexiones en tiempo real a 20 KB cada una.',
    },
    bun: {
      name: 'Bun',
      blurb:
        'Un bucle de eventos más rápido y un arranque instantáneo, así que autoescala y despliega mejor que Node.js. 60 MB y sin coste de arranque. Menos maduro: un paquete que funciona en Node.js puede romperse con él.',
    },
    deno: {
      name: 'Deno',
      blurb:
        'Los permisos bloquean la mayoría de los ataques de cadena de suministro, a cambio de que el trabajo en funcionalidades sea un 10% más lento: menos paquetes son compatibles. El mismo bucle de eventos que Node.js.',
    },
    falcon: {
      name: 'Falcon',
      blurb:
        'Los fibers mantienen muchas conexiones ociosas por proceso. Una gema que bloquea atasca el loop. 100 KB por conexión.',
    },
    pypy: {
      name: 'PyPy',
      blurb:
        'El triple de CPU de Python puro que Gunicorn, tras un calentamiento del JIT. El escaso soporte de extensiones C implica que no hay bonus del ecosistema de ML. 200 MB por worker.',
    },
    'virtual-threads': {
      name: 'Hilos virtuales de Java',
      blurb:
        'Esperar ya no retiene un hilo de plataforma, así que una base de datos lenta solo añade latencia. Las llamadas nativas (JNI) siguen fijando un hilo portador, y la JVM sigue calentando durante 30 s. Las conexiones en tiempo real cuestan 10 KB.',
    },
    webflux: {
      name: 'Spring WebFlux',
      blurb:
        'Concurrencia muy alta con un loop por proceso, y un 20% más lento de construir y depurar. Una llamada bloqueante atasca el loop, y la JVM sigue calentando. 400 MB.',
    },
    fasthttp: {
      name: 'fasthttp',
      blurb:
        'Una cuarta parte más rápido que net/http, a cambio de que el trabajo en funcionalidades sea un 10% más lento: la API no es estándar, parte del middleware no funciona y no hay HTTP/2.',
    },
    'spawn-blocking': {
      name: 'Pool bloqueante de Tokio',
      blurb:
        'Los tipos de mucho CPU pasan a un pool bloqueante, así que una tarea de Tokio deja de atascar un hilo worker.',
    },
    'graal-native': {
      name: 'Imagen nativa de GraalVM',
      blurb:
        'Arranca en menos de 100 ms y sin calentamiento, con el 60% de la memoria de la JVM y 0.80× su velocidad, aunque los builds tardan tres veces más. Un hilo por conexión, como Tomcat. Ideal para Funciones serverless.',
    },
    'native-aot': {
      name: '.NET Native AOT',
      blurb:
        'Sin JIT, así que arranca a plena velocidad, y más pequeño: 100 MB. 0.90× la velocidad, y las librerías con mucha reflexión necesitan Horas de desarrollo.',
    },
    'distributed-erlang': {
      name: 'Erlang distribuido',
      blurb:
        'Un Hub en tiempo real de BEAM se agrupa con su propio pub/sub integrado, sin backbone separado. Las particiones pueden partir el cerebro.',
    },
    nifs: {
      name: 'NIFs',
      blurb:
        'El código nativo hace que los tipos de mucho CPU de Elixir sean 3× más rápidos. Un NIF no se puede expropiar, y un fallo en uno se lleva toda la VM.',
    },
    jemalloc: {
      name: 'jemalloc',
      blurb:
        'Menos fragmentación en servicios Rust de larga duración: 1.05× CPU, a cambio de un 5% más de memoria al arrancar.',
    },
    'free-threading': {
      name: 'Python free-threaded',
      blurb:
        'Hilos realmente paralelos en todos los núcleos, un 10% más lentos por hilo, y un hilo por conexión no sale barato. Las extensiones C que no están listas cuestan Horas de desarrollo. 8 hilos y 100 KB por conexión.',
    },
    'fw-fastapi': {
      name: 'FastAPI',
      blurb:
        'Validación con Pydantic y el mejor ecosistema para integrar modelos: las peticiones ai ganan un 15% más. 1.15× CPU, y solo sobre un servidor ASGI. 10 MB.',
    },
    'fw-fastify': {
      name: 'Fastify',
      blurb:
        'Serialización basada en esquemas: las lecturas cuestan un 20% menos de CPU. Sin sobrecarga propia. 5 MB.',
    },
    'fw-nextjs': {
      name: 'Next.js',
      blurb:
        'Renderizado en servidor y regeneración estática incremental: las páginas ganan un 50% más, a 1.6× su CPU, y un CDN puede responder al 40% de ellas. 30 MB por proceso.',
    },
    'fw-nestjs': {
      name: 'NestJS',
      blurb:
        'Estructura para equipos grandes: un 30% menos de coordinación. 1.3× CPU y 20 MB por proceso.',
    },
    'fw-fiber': {
      name: 'Fiber',
      blurb:
        'Una API al estilo Express sobre fasthttp: sin sobrecarga de CPU y sin HTTP/2. 5 MB por proceso.',
    },
    'fw-quarkus': {
      name: 'Quarkus',
      blurb:
        'Pensado para imágenes nativas: un build con GraalVM tarda la mitad. 1.1× CPU y 100 MB por proceso.',
    },
    'fw-hono': {
      name: 'Hono',
      blurb: 'Un router pequeño sobre Web Standards: sin sobrecarga de CPU. 2 MB por proceso.',
    },
    'fw-elysia': {
      name: 'Elysia',
      blurb:
        'Pensado para Bun, con tipos comprobados del servidor al cliente: la deuda técnica crece un 15% más despacio. Sin sobrecarga de CPU. 5 MB por proceso.',
    },
    'fw-koa': {
      name: 'Koa',
      blurb:
        'El sucesor de Express, construido sobre funciones async: 1.05× CPU. 5 MB por proceso.',
    },
    'fw-adonis': {
      name: 'AdonisJS',
      blurb:
        'Las ideas de Laravel sobre Node.js: entrega funcionalidades rápido. 1.4× CPU, 25 MB por proceso, y el ORM Lucid genera consultas N+1.',
    },
    'fw-codeigniter': {
      name: 'CodeIgniter',
      blurb: 'Un framework PHP pequeño que no estorba: 1.1× CPU. 4 MB por proceso.',
    },
    'fw-sanic': {
      name: 'Sanic',
      blurb: 'Asíncrono desde la base: 1.05× CPU. 10 MB por proceso.',
    },
    'fw-rocket': {
      name: 'Rocket',
      blurb:
        'Enrutado con seguridad de tipos y poco boilerplate: lo más rápido de escribir en Rust. 1.05× CPU. 3 MB por proceso.',
    },
    cdc: {
      name: 'Captura de cambios de datos',
      blurb:
        'Desbloquea el Conector CDC: las copias siguen el log de escrituras, sin una segunda escritura.',
    },
    'service-boundaries': {
      name: 'Fronteras de servicio',
      blurb:
        'Divide un Servicio: un código nuevo con su propio equipo, sus propios despliegues y su propio radio de impacto.',
    },
    'service-mesh': {
      name: 'Service mesh',
      blurb: 'Desbloquea el Service mesh: reintentos, circuit breakers y métricas en cada enlace.',
    },
    'feature-flags': {
      name: 'Feature flags',
      blurb:
        'Desbloquea las Feature flags: una funcionalidad llega a una parte de los usuarios, y con ella un despliegue malo.',
    },
    'secrets-management': {
      name: 'Gestión de secretos',
      blurb:
        'Las claves viven en un vault, así que una página de phishing no tiene nada que robar.',
    },
    'spam-filter': {
      name: 'Filtro de spam',
      blurb:
        'Añade un filtro de Postbox que clasifica el spam en su propia carpeta y, de vez en cuando, también una carta real.',
    },
    'on-call': {
      name: 'Rotación de guardia',
      blurb:
        'Una rotación de guardia responde al aviso, así que un incidente se atiende en minutos.',
    },
    runbooks: {
      name: 'Runbooks',
      blurb:
        'Escribe un runbook para un tipo de incidente que el equipo ya haya gestionado: después se resuelve solo.',
    },
    'sre-team': {
      name: 'Equipo SRE',
      blurb: 'Desbloquea el equipo SRE: MTTR −40%, y una acción pendiente abierta pesa la mitad.',
    },
    'enterprise-sales': {
      name: 'Ventas enterprise',
      blurb:
        'Firma el SLA: una semana de disponibilidad incumplida devuelve créditos a los clientes.',
    },
    'online-migrations': {
      name: 'Migraciones de esquema en línea',
      blurb:
        'Cambia una tabla grande sin retener su bloqueo, así que las escrituras siguen fluyendo durante una migración.',
    },
    'leap-smearing': {
      name: 'Leap smearing',
      blurb:
        'Reparte un segundo intercalar por todo el día, así que ningún reloj salta ni ningún lease caduca antes de tiempo.',
    },
    'ab-testing': {
      name: 'Pruebas A/B',
      blurb:
        'Mide el lift de una funcionalidad frente a los usuarios que su flag deja fuera, con un intervalo de confianza.',
    },
    'hiring-pipeline': {
      name: 'Pipeline de contratación',
      blurb:
        'Los reclutadores mantienen un pipeline caliente, así que cada contratación tarda un 30% menos de tiempo de calendario.',
    },
    'trunk-based': {
      name: 'Desarrollo trunk-based',
      blurb:
        'Los cambios pequeños llegan a una sola rama muchas veces al día, así que el Equipo despliega un 50% más a menudo.',
    },
    'platform-team': {
      name: 'Equipo de plataforma',
      blurb:
        'Desbloquea el equipo de plataforma: gestiona los Clústeres y el pipeline, y reduce a la mitad el tiempo de despliegue.',
    },
    'data-team': {
      name: 'Equipo de datos',
      blurb:
        'Desbloquea el equipo de datos: los informes y las funcionalidades de IA cuestan un 30% menos, y un pipeline se retrasa la mitad.',
    },
    'l4-lb': {
      name: 'Balanceo de carga L4',
      blurb:
        'Un Balanceador de carga reenvía TCP en lugar de leer HTTP: diez veces más rendimiento, un quinto del hop y más barato, sin reintentos.',
    },
    'rate-limiting': {
      name: 'Limitación de tasa',
      blurb:
        'Un token bucket en el API Gateway: un pico hasta el tamaño del bucket pasa entero, y la media a largo plazo se mantiene en el límite.',
    },
    esi: {
      name: 'Edge-side includes',
      blurb:
        'El CDN cachea el shell compartido de una página con sesión iniciada y rellena las partes personales en el edge, así que se sirve desde caché un 20% más de páginas vistas.',
    },
    'bot-management': {
      name: 'Gestión de bots',
      blurb:
        'Un WAF que desafía a los clientes sospechosos en lugar de bloquearlos sin más: bloquea los mismos bots y confunde con un bot a menos usuarios reales.',
    },
    'scheduled-scaling': {
      name: 'Escalado programado',
      blurb:
        'Un Autoescalador añade copias antes del pico diario conocido, así que las copias están calientes cuando llega.',
    },
    'arm-instances': {
      name: 'Instancias ARM',
      blurb:
        'Desbloquea la familia de instancias ARM: el mismo vCPU y RAM que General por 0.8× el precio.',
    },
    quantization: {
      name: 'Cuantización',
      blurb:
        'Un Nodo GPU ejecuta pesos INT8 o INT4: más rápido y más pequeño, y sus respuestas valen un 5% o un 15% menos.',
    },
    'continuous-batching': {
      name: 'Batching continuo',
      blurb:
        'Un Nodo GPU agrupa los prompts según llegan, así que un lote mayor sube el rendimiento sin subir el tiempo hasta el primer token.',
    },
    bulkheads: {
      name: 'Bulkheads',
      blurb:
        'Un enlace limita cuántos slots de su llamador puede retener una dependencia: una dependencia lenta descarta sus propias llamadas y deja al resto sirviendo.',
    },
    'graceful-degradation': {
      name: 'Degradación elegante',
      blurb:
        'Un Servidor de aplicaciones saturado apaga primero sus tipos más caros, así que los tipos baratos mantienen su latencia y los caros fallan rápido.',
    },
    'hedged-requests': {
      name: 'Peticiones especulativas',
      blurb:
        'Un enlace envía una segunda copia de una llamada lenta tras el p95 y se queda con la respuesta más rápida: la cola baja y el destino ve un 10% más de llamadas.',
    },
    'chaos-engineering': {
      name: 'Ingeniería del caos',
      blurb:
        'Un experimento programado falla tu Nodo más débil durante unos segundos y lo nombra: gana Conocimiento de fallos y demuestra que el Diseño sobrevive.',
    },
    denormalization: {
      name: 'Desnormalización',
      blurb:
        'Una Base de datos guarda una copia pre-unida: las lecturas cuestan un 30% menos de CPU, y cada escritura cuesta un 20% más.',
    },
    precompute: {
      name: 'Vistas materializadas',
      blurb:
        'Una Base de datos responde un informe desde una vista almacenada: la mitad de la CPU de escaneo, y las cifras son tan antiguas como el refresco.',
    },
    'binary-rpc': {
      name: 'RPC binario entre servicios',
      blurb:
        'Los servicios serializan las llamadas en binario en lugar de texto: la mitad de la CPU de serialización en cada llamada de backend.',
    },
    outbox: {
      name: 'Outbox transaccional',
      blurb:
        'Una escritura y su evento caen en la misma transacción, y un relay lo publica: las copias dejan de divergir cuando falla una publicación.',
    },
    'expand-contract': {
      name: 'Expandir y contraer',
      blurb:
        'Un cambio de esquema añade la nueva forma, rellena los datos y luego elimina la vieja: sin bloqueo de tabla, así que una migración nunca puede atascar las escrituras.',
    },
    profiling: {
      name: 'Profiling continuo',
      blurb: 'Nombra el recurso que limita cada Nodo: CPU, workers, memoria, conexiones o disco.',
    },
    'tail-sampling': {
      name: 'Muestreo de cola',
      blurb: 'Conserva las trazas lentas y fallidas: el doble de Conocimiento de fallos.',
    },
    rum: {
      name: 'Monitorización de usuarios reales',
      blurb:
        'Latencia desde el lado del usuario, dividida por dispositivo: escritorio, móvil y tableta.',
    },
    'anomaly-detection': {
      name: 'Detección de anomalías',
      blurb:
        'Pronostica el pico de tráfico de mañana y avisa antes de que el incidente llegue a su pico.',
    },
    'credential-protection': {
      name: 'Protección contra credential stuffing',
      blurb:
        'Bloquea la mayor parte de una ráfaga de bots de credential stuffing antes de que llegue al login.',
    },
    'pen-testing': {
      name: 'Pruebas de penetración',
      blurb: 'Revela el tipo de incidente más débil del Diseño una vez por semana de calendario.',
    },
    rightsizing: {
      name: 'Informe de rightsizing',
      blurb:
        'Marca los Nodos por debajo del 30% de utilización en el pico, así que las cajas sobredimensionadas son fáciles de encontrar.',
    },
    'egress-optimization': {
      name: 'Optimización de egress',
      blurb: 'Una variante de Almacenamiento de objetos con precio de R2: sin egress a internet.',
    },
    'unit-economics': {
      name: 'Economía unitaria',
      blurb: 'Coste por petición servida, para cada tipo de petición.',
    },
    'cost-allocation': {
      name: 'Asignación de costes',
      blurb: 'Coste por Servicio y por Equipo, a partir de los Nodos que posee cada Servicio.',
    },
    'savings-plans': {
      name: 'Planes de ahorro',
      blurb:
        '20% menos en el Gasto de cada Nodo de cómputo, sea bajo demanda o no, sin compromiso por Nodo.',
    },
    'fw-jetzig': {
      name: 'Jetzig',
      blurb:
        'Rutas basadas en archivos, plantillas, consultas a la base de datos y jobs en segundo plano en una sola caja: las funcionalidades se entregan rápido. 1.3× CPU y 25 MB por proceso, sobre un toolchain joven.',
    },
    'fw-tokamak': {
      name: 'Tokamak',
      blurb:
        'Un contenedor de inyección de dependencias sobre http.zig: el cableado explícito reduce la coordinación y la deuda técnica. 1.05× CPU y 5 MB por proceso, con un ecosistema pequeño.',
    },
    'fw-servant': {
      name: 'Servant',
      blurb:
        'El tipo de la API es el contrato: el enrutado, los clientes y la documentación se derivan de él, así que los equipos coordinan menos y la deriva es menor. 1.0× CPU y 2 MB por proceso, con una curva de aprendizaje a nivel de tipos.',
    },
    'fw-ihp': {
      name: 'IHP',
      blurb:
        'Con todo incluido: generación de código, un query builder con seguridad de tipos y una cola de jobs integrada. Las funcionalidades se entregan rápido a 1.3× CPU y 40 MB por proceso, sobre un toolchain basado en Nix.',
    },
    'build-cache': {
      name: 'Caché de compilación',
      blurb:
        'Una caché compartida para artefactos de compilación y dependencias: cada Stack compila un 25% más rápido.',
    },
    'dev-environment': {
      name: 'Entorno de desarrollo reproducible',
      blurb:
        'Un contenedor fija cada compilador y herramienta: una nueva contratación alcanza la velocidad plena en la mitad del tiempo de rampa.',
    },
    'static-analysis': {
      name: 'Análisis estático',
      blurb:
        'Un linter y un comprobador de tipos se ejecutan en cada cambio antes de entregarlo: despliegues malos −20%.',
    },
    'formal-verification': {
      name: 'Verificación formal',
      blurb:
        'Las demostraciones y los property-based tests atrapan los bugs que los tests no ven: despliegues malos −50%, pero cada funcionalidad cuesta un 15% más de Horas de desarrollo.',
    },
  },
  researchTracks: {
    infrastructure: { label: 'Infraestructura' },
    data: { label: 'Datos' },
    reliability: { label: 'Fiabilidad' },
    observability: { label: 'Observabilidad' },
    performance: { label: 'Rendimiento' },
    runtimes: { label: 'Runtimes' },
    frameworks: { label: 'Frameworks' },
    security: { label: 'Seguridad' },
    product: { label: 'Producto' },
    cost: { label: 'Coste' },
  },
}
