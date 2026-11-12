import type { Catalog } from './en.ts'

export const catalog: Catalog = {
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
    'b2b-saas': { name: 'B2B SaaS', summary: 'Pico por la tarde; la mezcla por defecto' },
    'consumer-social': {
      name: 'Red social de consumo',
      summary: 'Feeds y vídeo dominan; el doble de usuarios con la mitad de valor',
    },
    fintech: {
      name: 'Fintech',
      summary:
        'Horario laboral; compras y escrituras dominan; una lectura obsoleta de dinero se multa',
    },
    streaming: {
      name: 'Contenido en streaming',
      summary: 'Pico de noche; el vídeo domina; el egress cuesta el triple',
    },
    'game-backend': {
      name: 'Backend de videojuegos',
      summary: 'Pico por la tarde; el tiempo real es la mayor parte del tráfico',
    },
    'ai-startup': {
      name: 'Startup de IA',
      summary: 'Demanda constante; prompts y subidas dominan; las GPU escasean',
    },
    'e-commerce': {
      name: 'Comercio electrónico',
      summary: 'Páginas y búsquedas dominan; una oferta mensual programada',
    },
    'developer-platform': {
      name: 'Plataforma para desarrolladores',
      summary:
        'Demanda plana y a ráfagas; lecturas de API y webhooks dominan; sin reintentos ingenuos',
    },
    healthcare: {
      name: 'Salud',
      summary: 'Horario laboral; escrituras y búsquedas dominan; datos en la región',
    },
    'ad-tech': {
      name: 'Adtech',
      summary: 'Plana y enorme; pujas dominan; más de 100 ms no gana nada',
    },
    government: {
      name: 'Contrato público',
      summary: 'Horario laboral; páginas y expedientes; Java o C#; un día por compra',
    },
    bootstrapped: {
      name: 'Indie autofinanciado',
      summary:
        'Sin rondas de financiación; la mezcla por defecto; la participación se queda al 100%',
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
    'q-vector': { label: 'Consulta vectorial' },
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
    change: { label: 'Cambio' },
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
    annotation: {
      term: 'Anotación',
      definition:
        'Un marcador en un gráfico de series temporales para un evento, como un despliegue, un cambio de configuración o un incidente. Da una causa visible a un cambio en la gráfica.',
      inGame:
        'Cada serie temporal del Cuadro de mando dibuja líneas verticales con etiqueta para cinco tipos de evento: cambios de Diseño (azul, una por cada cambio que aún puedes deshacer), despliegues (morado), incidentes (rojo), Investigación (verde) y eventos de la Empresa (rosa). Un interruptor para cada grupo en la barra de variables lo oculta. Usa las líneas para comprobar que una gráfica cambió después de tu arreglo, no antes.',
    },
    anycast: {
      term: 'Anycast',
      definition:
        'Un método de enrutamiento en el que muchos servidores de lugares distintos anuncian la misma dirección IP y el enrutamiento de internet (BGP) envía a cada usuario al más cercano. Los usuarios se conectan a un servidor próximo y una avalancha de tráfico se reparte entre todos ellos.',
      inGame:
        'Anycast quita 20 ms al salto del usuario en cada región. Es una Investigación de la Serie C que necesita GeoDNS primero. GeoDNS envía los Usuarios de cada región a su propia región, o a la región más cercana que siga operativa.',
    },
    apdex: {
      term: 'Apdex',
      definition:
        'Application Performance Index: una puntuación de 0 a 1 que mide cuán satisfechos están los usuarios con el tiempo de respuesta. Las peticiones más rápidas que un objetivo T son satisfactorias y cuentan por completo. Las peticiones de hasta 4T son tolerables y cuentan la mitad, y las más lentas o fallidas cuentan cero.',
      inGame:
        'Cada tipo de Petición tiene su propia T: 400 ms para una vista de página, 200 ms para una lectura de API, 800 ms para un inicio de sesión. Una petición gana su valor multiplicado por su Apdex, así que una petición tolerable gana la mitad. Los Usuarios crecen mientras el Apdex supere el objetivo de la Era y se van cuando cae por debajo, y el objetivo sube de 0.85 en Garaje a 0.94 en Cotizada en bolsa.',
    },
    'async-io': {
      term: 'E/S asíncrona',
      definition:
        'Una forma de iniciar una operación de red o de disco y hacer otro trabajo hasta que termine, en lugar de bloquear un hilo mientras espera. Así un solo hilo puede mantener muchas peticiones en curso. Node.js, .NET async y Tokio de Rust se basan en ella.',
      inGame:
        'Node.js, Kestrel (C#) y Tokio (Rust) no retienen ningún hueco de worker mientras una petición espera a la Base de datos, así que una consulta lenta no agota su capacidad. Un worker de PHP-FPM o Gunicorn queda retenido durante toda la espera. Los runtimes asíncronos también mantienen abiertas las conexiones en tiempo real por unos pocos KB cada una (Tokio 5 KB, Node.js 20 KB), pero PHP y Gunicorn las rechazan.',
    },
    'at-least-once-delivery': {
      term: 'Entrega al menos una vez',
      definition:
        'Una garantía de entrega en la que el sistema reenvía un mensaje o una llamada hasta que se confirma. No se pierde nada, pero algunos mensajes llegan más de una vez, así que los consumidores deben ser idempotentes.',
      inGame:
        'Una llamada reintentada puede llegar dos veces. En el incidente Cobro duplicado, los cobros caducan y se reintentan, así que algunos clientes pagan dos veces hasta que investigas Claves de idempotencia o detienes los reintentos en el enlace del cobro. En el incidente Mensaje envenenado, una tarea que siempre falla sigue volviendo y los Workers dedican el 90% de su tiempo a ella. Activa la cola de mensajes fallidos (dead-letter queue) de la Cola para evitarlo, o elimina el mensaje para acabar con él.',
    },
    autoscaling: {
      term: 'Autoescalado',
      definition:
        'Añadir y quitar máquinas automáticamente para que la capacidad siga a la demanda. Un controlador vigila una señal, como el uso de CPU, la compara con un objetivo y cambia el número de copias. La nueva capacidad tarda en arrancar, así que el autoescalado afronta los cambios lentos de carga, pero no los picos repentinos.',
      inGame:
        'El Autoescalador (se desbloquea con la Investigación de Autoescalado) añade y quita copias de los Servidores de aplicaciones y Workers que enlaces a él. Un Nodo que funciona por encima de su objetivo (40%, 60% u 80% de la CPU o de toda su carga) recibe más copias, hasta un máximo de 4, 8, 16 o sin límite. Las copias nuevas arrancan en frío y atienden tras 180 s en VMs o 30 s en un Clúster de Kubernetes. Quita una copia cuando la carga cae por debajo del 60% del objetivo y actúa como mucho una vez cada 30 s, así que deja capacidad de sobra para un Pico de tráfico repentino. La Investigación de Escalado programado le permite planificar el pico conocido: dos horas de calendario antes de la hora pico del Emprendimiento dimensiona para la carga del pico, de modo que las copias estén calientes cuando llegue.',
    },
    'availability-zone': {
      term: 'Zona de disponibilidad',
      definition:
        'Un centro de datos aislado, o un grupo de centros de datos, dentro de una región de la nube, con su propia energía, refrigeración y red. Las zonas de una región están lo bastante cerca para tener enlaces rápidos y lo bastante lejos para que un fallo rara vez tumbe dos.',
      inGame:
        'El juego las llama Zonas. Tras la Investigación de Múltiples zonas, colocas cada Nodo con zonas en la zona a, b o c, y una Base de datos, Pooler, Caché, Motor de búsqueda o Cola puede tener un Standby en otra zona al doble de su Gasto. Una llamada entre zonas añade 1 ms y cuesta $0.01 por GB de Egress en cada sentido. Una Caída de zona tumba todos los Nodos de esa zona, pero un Standby toma el relevo en unos 20 s y las copias de otra zona siguen sirviendo.',
    },
    backpressure: {
      term: 'Contrapresión',
      definition:
        'Una señal de un consumidor lento que indica a los productores que reduzcan el ritmo o se detengan, para que un búfer o una cola no crezca sin límite. Sin ella, la acumulación crece hasta que se agota la memoria o la latencia.',
      inGame:
        'La Longitud máxima de la Cola es lo más parecido a la contrapresión: pasado ese punto, la Cola rechaza tareas nuevas y la subida o exportación que envió una falla. Sin límite, la profundidad de la Cola crece siempre que los Workers vacían tareas más despacio de lo que llegan. Una tarea nueva espera detrás de la acumulación, y los usuarios juzgan una subida o una exportación por el momento en que su resultado está listo, así que pasados 40 s en una subida o 4 minutos en una exportación se frustran. Añade Workers o hazlos más grandes para bajar la profundidad.',
    },
    bcrypt: {
      term: 'Bcrypt',
      definition:
        'Una función de hash de contraseñas de 1999, basada en el cifrado Blowfish, con salt incorporada y un coste ajustable. Cada paso de coste duplica el trabajo, de modo que los hashes almacenados siguen siendo lentos de descifrar a medida que el hardware mejora. Esa misma lentitud cuesta CPU de servidor en cada inicio de sesión.',
      inGame:
        'Un inicio de sesión cuesta 80 ms de CPU por el hash, y un runtime más rápido no lo acorta. En el incidente Bloqueo del bucle de eventos el coste pasa de 10 a 12 rondas, que es 4× la CPU por inicio de sesión. En el Relleno de credenciales, los bots envían 20× los inicios de sesión. Un Proveedor de autenticación (Identidad gestionada) quita el hash de tus Servidores de aplicaciones por un precio por usuario.',
    },
    'binary-rpc': {
      term: 'RPC binario',
      definition:
        'Una llamada a procedimiento remoto que codifica sus mensajes en un formato binario, como Protocol Buffers sobre gRPC, en lugar de texto como JSON. La carga útil es más pequeña y más barata de procesar, a costa de un esquema en el que ambos lados deben estar de acuerdo.',
      inGame:
        'La Investigación de RPC binario entre servicios reduce a la mitad la CPU que un Servidor de aplicaciones o un Worker gasta en serializar cada llamada al backend, de 0.02 ms de referencia a 0.01. Lo ves en el indicador de CPU de los Nodos que hacen las llamadas, así que un Diseño que se quedaba sin CPU sirve más con las mismas máquinas.',
    },
    'bgp-border-gateway-protocol': {
      term: 'BGP (Border Gateway Protocol)',
      definition:
        'El protocolo que usan las redes de internet para decirse unas a otras qué direcciones IP pueden alcanzar. Si una red retira sus rutas por error, el resto de internet ya no puede encontrarla, aunque sus servidores sigan funcionando.',
      inGame:
        'El incidente Error de configuración de BGP puede empezar en la Serie C. Un cambio de enrutamiento retira tu Empresa de internet, así que todas las peticiones de los Usuarios fallan como caídas, en todas las regiones, durante hasta 60 s. Ninguna Investigación lo previene y el director lo elige pocas veces. Pulsa Revertir en el Incidente para acabar con él de inmediato.',
    },
    'blast-radius': {
      term: 'Radio de impacto',
      definition:
        'La parte de un sistema, de sus usuarios o de su tráfico que afecta un único fallo. El aislamiento de fallos, como las zonas, las celdas y los despliegues pequeños, mantiene pequeño el radio de impacto.',
      inGame:
        'Una Caída de zona tumba todos los Nodos de esa zona. Con Múltiples zonas puedes repartir copias entre tres zonas y dar a un Nodo de datos un Standby que toma el relevo en segundos. Un Despliegue defectuoso falla el 8% de las peticiones del Servidor de aplicaciones por cada elemento que publicó, hasta el 40%, así que los despliegues más pequeños rompen menos. Solo falla el tráfico del Servicio que lo publicó. En Node.js una petición lenta bloquea todas las peticiones de su bucle de eventos, mientras que BEAM mantiene cada petición aislada.',
    },
    'blue-green-deployment': {
      term: 'Despliegue blue-green',
      definition:
        'Un método de lanzamiento con dos entornos de producción idénticos. Despliegas la versión nueva en el que está inactivo, cambias todo el tráfico a él de una vez y vuelves atrás si falla, así que la reversión es rápida.',
      inGame:
        'El Pipeline de CI/CD ofrece Blue-green como estrategia de despliegue. La flota antigua sigue sirviendo mientras la nueva arranca y se comprueba, así que un Despliegue defectuoso rompe como mucho el 10% de las peticiones del Servidor de aplicaciones. Un despliegue tarda 7 minutos y factura el doble del Gasto del Pipeline.',
    },
    'bot-management': {
      term: 'Gestión de bots',
      definition:
        'Distinguir el tráfico automatizado de las personas y tratarlo según sus propias reglas: lanzar un desafío a un cliente sospechoso, limitar su tasa o bloquearlo, en lugar de fallar de plano toda coincidencia con una regla.',
      inGame:
        'La Investigación de Gestión de bots reduce a la mitad los falsos positivos de un WAF y mantiene su tasa de bloqueo. Un cliente sospechoso recibe un desafío, así que un usuario real al que marque sigue cargando la página. Los bots siguen sin ganar nada y siguen costando capacidad cuando pasan, así que el WAF sigue siendo el primer lugar donde detenerlos.',
    },
    'brookss-law': {
      term: 'Ley de Brooks',
      definition:
        '"Añadir personal a un proyecto de software retrasado lo retrasa más", del libro de Fred Brooks de 1975 The Mythical Man-Month. La gente nueva necesita tiempo para ponerse al día y los canales de comunicación crecen más rápido que la plantilla.',
      inGame:
        'Un Equipo pierde rendimiento al crecer: su tamaño efectivo es n / (1 + 0.08(n − 1) + 0.0004·n(n − 1)), así que 8 personas rinden como unas 5, y a partir de unas 48 personas se vuelve más lento. Una persona nueva trabaja al 30% durante su primera semana de calendario. La penalización cuenta dentro de cada Equipo, así que repartir a la gente en hasta 4 Equipos ayuda, y Symfony la reduce un 30%.',
    },
    bulkhead: {
      term: 'Bulkhead',
      definition:
        'Un límite a la parte de la capacidad de quien llama, como hilos, conexiones o huecos, que puede usar una dependencia. Cuando esa dependencia se ralentiza, solo llena su propia parte y las llamadas a otras dependencias siguen funcionando. El nombre viene de los mamparos que dividen el casco de un barco en compartimentos.',
      inGame:
        'La Investigación de Bulkheads añade un interruptor a cada Enlace. Un Enlace con bulkhead deja que una llamada dure 1,000 ms; pasado ese tiempo, quien llama se rinde, libera su hueco y la petición falla como `timeout`, así que una dependencia lenta no puede llenar todos los huecos. Limita el tiempo en lugar de las llamadas concurrentes, lo cual equivale a lo mismo con una carga fija (ley de Little). Sin él, una llamada retiene el hueco de quien llama hasta que responde o alcanza el timeout del Enlace, 30 s por defecto.',
    },
    'burn-rate': {
      term: 'Tasa de consumo',
      definition:
        'Con qué rapidez gasta un servicio su presupuesto de errores, en relación con el SLO. Una tasa de consumo de 1 gasta exactamente todo el presupuesto en la ventana del SLO; una de 10 lo gasta en una décima parte de la ventana. Los equipos reciben avisos por una tasa de consumo alta, no por errores sueltos.',
      inGame:
        'Con la Investigación de Cuadros de mando de SLO, el Cuadro de mando (D) grafica con el tiempo la tasa de consumo del presupuesto de errores: tu tasa de fallos dividida entre la parte de fallos que permite el SLO. Las líneas marcan 1× y 10×. Por encima de 10×, el presupuesto se agota mucho antes de que acabe la semana, así que arregla la causa o frena tus despliegues hasta que la línea baje de 1×.',
    },
    'bytecode-cache': {
      term: 'Caché de bytecode',
      definition:
        'Una caché que guarda la forma compilada de un script para que el intérprete no analice ni compile el código fuente en cada ejecución. El OPcache de PHP guarda bytecode precompilado en memoria compartida, y Python escribe archivos .pyc por la misma razón.',
      inGame:
        'PHP compila cada script en cada petición hasta que investigas OPcache (después de PHP-FPM), que multiplica por 2.5 la velocidad de CPU de los Servidores de aplicaciones PHP. Una máquina PHP que se reinicia funciona primero sin OPcache y alcanza los 2.5× completos a medida que se calienta.',
    },
    'cache-hit-rate': {
      term: 'Tasa de aciertos de caché',
      definition:
        'La parte de las búsquedas que una caché responde con su propia copia, sin preguntar al sistema más lento que tiene detrás. Un fallo va al origen o a la base de datos. Un pequeño cambio en la tasa de aciertos puede cambiar mucho la carga del origen: pasar del 90% al 80% duplica los fallos.',
      inGame:
        'Un Nodo de Caché o CDN muestra su tasa de aciertos en su tarjeta. La tasa de aciertos de una Caché es la raíz cuadrada de su memoria entre sus datos calientes (unos 200 KB por usuario). Se multiplica por un factor de TTL (60% a 10 s, 85% a 60 s, 97% a 1 h), una penalización por escrituras de hasta el 50% y lo caliente que esté la Caché. Una CDN responde el 70% de las peticiones de páginas y el 75% de las de medios con el TTL de 300 s, multiplicado por 0.8 a 60 s o por 1.2 a 1 h, como máximo el 95%. Dale más memoria a la Caché o un TTL más largo para subir la tasa, pero un TTL más largo sirve más lecturas obsoletas.',
    },
    'cache-stampede': {
      term: 'Estampida de caché',
      definition:
        'Muchas peticiones fallan en el mismo dato en caché en el mismo momento, por ejemplo tras un reinicio de la caché o una expiración, y todas van juntas a la base de datos. La carga extra puede ralentizar tanto la base de datos que la caché nunca se rellena.',
      inGame:
        'En el incidente Estampida de caché una Caché se reinicia vacía y cada fallo va a la Base de datos a la vez. Mientras la Base de datos está al 90% de ocupación o más, los rellenos caducan y la Caché sigue fría. La protección contra estampidas deja que una Caché fría reenvíe solo el 25% de sus fallos extra, y el Precalentamiento de caché la devuelve al 80% de calor tras un reinicio.',
    },
    'cache-warming': {
      term: 'Calentamiento de caché',
      definition:
        'Rellenar una caché con datos probables antes de que reciba tráfico, para que las primeras peticiones no fallen todas. Los equipos precalientan una caché tras un reinicio, un despliegue o al añadir un nodo de caché nuevo, a menudo cargando una instantánea o reproduciendo claves recientes.',
      inGame:
        'Una Caché que se reinicia vuelve fría, así que cada fallo va a la Base de datos. Redis recarga por sí solo la mitad de sus datos y Memcached no recarga ninguno. Tras la Investigación de Precalentamiento de caché, puedes activar el Precalentamiento en la tarjeta de una Caché, y la Caché vuelve entonces al 80% de calor tras un reinicio o una Estampida de caché. La protección contra estampidas, que investigas primero, se ocupa de los fallos que quedan.',
    },
    'cache-aside': {
      term: 'Cache-aside',
      definition:
        'Un patrón de caché en el que la aplicación consulta primero la caché. Si falla, lee la base de datos y guarda el resultado en la caché, y al escribir actualiza la base de datos e invalida la entrada en caché.',
      inGame:
        'Una Caché responde las consultas de lectura que tiene y envía los fallos a la Base de datos. Su tasa de aciertos es √(memoria / datos calientes) × factor de TTL × calor, con unos 200 KB de datos calientes por usuario. Las escrituras pasan e invalidan, así que una mezcla con muchas escrituras baja la tasa de aciertos. Un TTL más largo (10 s, 60 s o 1 h) mantiene más aciertos, pero sirve más lecturas obsoletas.',
    },
    'canary-deployment': {
      term: 'Despliegue canario',
      definition:
        'Un método de lanzamiento que envía primero una pequeña parte del tráfico a una versión nueva y compara sus errores y su latencia con los de la versión antigua. Si el canary tiene buen aspecto, el despliegue continúa; si no, se revierte antes de que la mayoría de los usuarios lo vea.',
      inGame:
        'El Pipeline de CI/CD ofrece Canary como estrategia de despliegue. Un despliegue envía primero el 5% del tráfico a la versión nueva, así que un Despliegue defectuoso rompe hasta el 5% de las peticiones del Servidor de aplicaciones hasta que lo revierres. Es la estrategia más lenta, con 10 minutos por despliegue, y factura 1.5 veces el Gasto del Pipeline.',
    },
    'cascading-failure': {
      term: 'Fallo en cascada',
      definition:
        'Un fallo que salta de una parte de un sistema a otra: un componente lento o roto sobrecarga a quienes lo llaman, cuyos reintentos y colas sobrecargan a su vez a los suyos. El primer fallo es el detonante, y los siguientes convierten un incidente pequeño en uno largo.',
      inGame:
        'A partir de la Serie A, un Incidente que nadie atiende puede iniciar otro cuando termina, y el segundo registra al primero como su causa. Una Consulta lenta desatendida inicia una Tormenta de reintentos, una Tormenta de reintentos inicia un Agotamiento de conexiones y una Fuga de memoria inicia una Tormenta de pausas de GC. El segundo Incidente solo empieza si el Diseño es débil ante él. El aviso nombra la cadena y la tarjeta del postmortem dice qué siguió. Cualquier respuesta, incluso reconocer el Incidente, evita que se propague en cascada, y una cadena se detiene tras un salto.',
    },
    'cdc-change-data-capture': {
      term: 'CDC (captura de cambios de datos)',
      definition:
        'Leer el registro de cambios de una base de datos, como el write-ahead log de PostgreSQL, y publicar cada inserción, actualización y borrado como un evento. Otros sistemas, como un almacén de datos o un índice de búsqueda, se mantienen sincronizados sin consultar el origen.',
      inGame:
        'El Conector CDC, que se desbloquea con Captura de cambios de datos en la Serie B, copia los cambios de una Base de datos a un Flujo de eventos. Enlaza la Base de datos a él, y él al Flujo. Lee cada escritura del registro de escrituras y publica cada cambio como un evento a 20,000 cambios por segundo, así que un Motor de búsqueda o un Almacén de datos sigue a la Base de datos sin que la app escriba dos veces. Añade retraso en lugar de latencia, porque la escritura nunca espera a la copia.',
    },
    'cdn-content-delivery-network': {
      term: 'CDN (red de distribución de contenido)',
      definition:
        'Una red de servidores de caché en muchos lugares que guardan copias del contenido cerca de los usuarios. Una petición que el borde más cercano puede responder nunca llega al origen, así que es más rápida y no le cuesta nada al origen.',
      inGame:
        'El Componente CDN, que se desbloquea con la Investigación de Entrega de contenido, responde peticiones en el borde antes de que lleguen a tus Servidores de aplicaciones. Con el TTL por defecto de 300 s responde el 70% de las peticiones de páginas y el 75% de las de medios. Un TTL de 60 s lo reduce un 20% y uno de 3,600 s lo aumenta un 20%, hasta el 95%. El Egress del borde cuesta $0.02 por GB frente a $0.09 por GB de los Servidores de aplicaciones, y la Caché por niveles sube la tasa de aciertos de medios al 92%.',
    },
    'chaos-engineering': {
      term: 'Ingeniería del caos',
      definition:
        'Inyectar fallos a propósito, de forma controlada, para descubrir cómo se comporta de verdad un sistema: matar un nodo, añadir latencia, quitar una dependencia. Convierte una suposición sobre un punto débil en una medición.',
      inGame:
        'La Investigación de Ingeniería del caos añade un interruptor de Caos al panel del Equipo. Mientras está activado, el Nodo más débil del Diseño falla el 20% de sus llamadas durante 10 s cada 120 s, y la Empresa gana 1 de Conocimiento de fallos por segundo con el experimento. El interruptor nombra el Nodo al que afectará el próximo experimento. Los errores `refused` inyectados aparecen en la fila de Errores del Cuadro de mando, junto a los fallos reales.',
    },
    'circuit-breaker': {
      term: 'Circuit breaker',
      definition:
        'Un interruptor en la ruta de una llamada que vigila los fallos. Cuando fallan demasiadas llamadas, se abre y hace fallar de inmediato las llamadas nuevas durante un tiempo, para que quienes llaman dejen de esperar y el servicio en apuros pueda recuperarse. Después deja pasar unas pocas llamadas para comprobar si el servicio ha vuelto.',
      inGame:
        'Tras la Investigación de Circuit breakers, puedes activar un breaker en cada Enlace. Cuando fallan más de la mitad de las llamadas del Enlace, se abre durante 5 s y no envía nada, así que sus llamadas fallan de inmediato como refused. Luego se cierra y lo intenta de nuevo. Un breaker es una de las tres prevenciones de una Tormenta de reintentos.',
    },
    'code-review': {
      term: 'Revisión de código',
      definition:
        'Una práctica en la que otro ingeniero lee un cambio antes de que se fusione, para encontrar defectos, mantener el código coherente y compartir conocimiento. La revisión de código moderna suele ser ligera y se hace en una herramienta sobre cambios pequeños.',
      inGame:
        'La Investigación de Revisión de código reduce un 20% la probabilidad de que un despliegue publique un fallo, y se acumula con las Pruebas automatizadas (30%). También muestra el coste oculto de cada Funcionalidad en su casilla antes de que se publique, como "Cada consulta de escritura cuesta un 20% más". La deuda técnica aumenta la probabilidad de un mal despliegue, así que la revisión importa más a medida que crece la deuda.',
    },
    'cold-start': {
      term: 'Arranque en frío',
      definition:
        'El retraso y las primeras peticiones lentas cuando arranca un proceso, contenedor o instancia de función nuevos. Debe arrancar, cargar código y datos, y llenar cachés o compilar con JIT el código caliente antes de llegar a toda su velocidad.',
      inGame:
        'Un Servidor de aplicaciones nuevo o reiniciado arranca y luego se calienta. Una copia de Java (Tomcat) empieza al 30% de velocidad y necesita 30 s para llegar a toda su velocidad, mientras que Go empieza a toda velocidad. Una copia nueva de un Autoescalador atiende tras 180 s en VMs, o 30 s en un Clúster de Kubernetes. Una Caché reiniciada vuelve vacía con Memcached o medio caliente con Redis, y una Base de datos fría ejecuta sus consultas con hasta el doble de CPU. Una Función serverless no conserva ningún entorno mientras está inactiva, así que la petición posterior a una pausa empieza en frío, lo que cuesta 50 ms en Rust o Go y hasta 2,000 ms en la JVM.',
    },
    compression: {
      term: 'Compresión',
      definition:
        'Codificar una respuesta en menos bytes antes de enviarla por la red, por ejemplo con gzip o Brotli. El cliente la decodifica. Ahorra ancho de banda y tiempo de transferencia, y cuesta CPU en ambos extremos.',
      inGame:
        'La Investigación de Compresión te permite activar gzip en cada Servidor de aplicaciones. Sus respuestas de página, lectura, búsqueda, informe, feed y bot se reducen al 30% de su tamaño, pero esas peticiones cuestan un 10% más de CPU. Las respuestas más pequeñas llegan antes a los usuarios, usan menos de la tarjeta de red de la máquina y reducen el Egress del origen. Otros tipos, como las subidas y los medios, mantienen su tamaño.',
    },
    'connection-pooling': {
      term: 'Pool de conexiones',
      definition:
        'Mantener un conjunto de conexiones abiertas a la base de datos y compartirlas entre muchos clientes, en lugar de abrir una por cliente o por petición. Ahorra el tiempo de establecer la conexión y mantiene la base de datos por debajo de su límite de conexiones.',
      inGame:
        'La Base de datos acepta 100 conexiones y rechaza el resto, y cada proceso del Servidor de aplicaciones tiene su propio pool: 1 conexión por worker de PHP o Gunicorn, 5 por proceso de Puma, 10 para Node.js o Go. Un Pooler de conexiones en modo transacción comparte 20 conexiones de servidor entre todos ellos, pero falla el 5% de las consultas agrupadas hasta que arreglas el estado de sesión del código. El incidente Agotamiento de conexiones duplica cada pool.',
    },
    'consistent-hashing': {
      term: 'Hashing consistente',
      definition:
        'Una forma de asignar claves a servidores en un anillo de hash, de modo que añadir o quitar un servidor mueve solo alrededor de 1/n de las claves. Karger y otros lo describieron en 1997 para cachés web, y Dynamo de Amazon y Apache Cassandra lo usan para ubicar los datos.',
      inGame:
        'Con la Investigación de Algoritmos de balanceo de carga, un Balanceador de carga puede repartir por Hash consistente. Cada destino se queda con una parte igual de las claves sea cual sea su carga, y un destino que se va mueve solo sus propias claves. El Almacén de columnas anchas coloca cada clave en N réplicas, y en el incidente Clave caliente el shard de una clave se satura.',
    },
    'container-orchestration': {
      term: 'Orquestación de contenedores',
      definition:
        'Software que coloca contenedores en un conjunto compartido de máquinas, los reinicia cuando fallan y los escala arriba y abajo. Kubernetes es el ejemplo habitual. Empaquetar muchas cargas en nodos compartidos aprovecha mejor las máquinas, pero los vecinos pueden ralentizarse unos a otros.',
      inGame:
        'La Investigación de Orquestación de contenedores desbloquea el Clúster de Kubernetes. Los Servidores de aplicaciones y Workers que enlaces a él funcionan como pods. Cuestan un 15% menos de Gasto, un Autoescalador añade sus copias en 30 s en lugar de 180 s, un mal despliegue se detiene tras su primer cuarto de pods, y un pod cuyo host muere vuelve en 30 s. Cada Clúster se lleva medio ingeniero de Horas de desarrollo, salvo que lo lleve un Equipo de plataforma. Una versión que queda sin soporte durante un trimestre arriesga una actualización forzada que tumba el 30% de las peticiones a pods. Los vecinos ruidosos añaden 10 ms al 0.5% o 2% de las peticiones a medida que los pods se ocupan más.',
    },
    'continuous-batching': {
      term: 'Batching continuo',
      definition:
        'Una técnica de servicio para modelos de lenguaje que añade cada petición nueva al lote en ejecución en cuanto queda libre un hueco, en lugar de esperar a que termine todo el lote. El rendimiento sube y la espera por el primer token sigue siendo corta.',
      inGame:
        'La Investigación de Batching continuo añade batch 8 y batch 32 a un Nodo GPU: 1.6× y 2.2× los prompts por segundo con el tiempo hasta el primer token sin cambios. Sin ella, los lotes más grandes igualmente aumentan el rendimiento, y añaden 150 ms o 500 ms a esa espera.',
    },
    'continuous-delivery': {
      term: 'Entrega continua',
      definition:
        'Una práctica que mantiene el software en un estado en el que cualquier cambio puede publicarse con seguridad en cualquier momento, mediante un pipeline automatizado que lo compila, prueba y despliega. Hace que los lanzamientos sean pequeños, frecuentes y fáciles de revertir.',
      inGame:
        'Antes de la Investigación de Entrega continua, un despliegue tarda 30 minutos a mano. Después, un pipeline despliega en 5 minutos, así que caben más despliegues en la jornada de 8 horas con la compilación y la comprobación de 15 minutos. También te permite revertir un Despliegue defectuoso, lo que termina el Incidente y devuelve sus Funcionalidades a la cola del próximo despliegue, y desbloquea el Pipeline de CI/CD. Coloca uno, y su estrategia de despliegue fija el tiempo de despliegue y el techo de lo que puede romper un Despliegue defectuoso.',
    },
    'conways-law': {
      term: 'Ley de Conway',
      definition:
        '"Las organizaciones que diseñan sistemas están condicionadas a producir diseños que son copias de las estructuras de comunicación de esas organizaciones", del artículo de Melvin Conway de 1968. Los equipos que rara vez hablan tienden a construir partes con interfaces estrechas entre ellas.',
      inGame:
        'Desde Pre-semilla puedes crear hasta 4 Equipos, cada uno con su propia política y su propio coste de coordinación, así que dividir un grupo grande aumenta el total de Horas de desarrollo. Construir más Servicios que Equipos es el desajuste que marca el logro Ley de Conway, así que da a cada Servicio su propio Equipo. El responsable de un Servicio construye su backlog y recibe el aviso cuando falla.',
    },
    'credential-stuffing': {
      term: 'Relleno de credenciales',
      definition:
        'Un ataque en el que los bots prueban contra un formulario de inicio de sesión pares de usuario y contraseña filtrados de otros sitios. Funciona porque mucha gente reutiliza contraseñas. Cada intento también le cuesta al sitio un hash de contraseña lento.',
      inGame:
        'El incidente Relleno de credenciales puede empezar desde Semilla cuando tu Empresa atiende inicios de sesión. Los bots envían 19 veces tu tasa normal de inicios de sesión, y cada uno le cuesta a un Servidor de aplicaciones un hash bcrypt completo, así que la CPU se satura. Un WAF bloquea la mayoría: el 80% con el nivel de paranoia 2 por defecto. Un Proveedor de autenticación calcula el hash de los inicios de sesión que pasan, así que un inicio de sesión cuesta a tu Servidor de aplicaciones unos 2 ms de CPU.',
    },
    'data-residency': {
      term: 'Residencia de datos',
      definition:
        'Una regla, de ley o de contrato, que obliga a almacenar y procesar ciertos datos dentro de un país o región concretos. El RGPD de la UE, por ejemplo, limita las transferencias de datos personales fuera de la UE.',
      inGame:
        'La residencia de datos es un elemento de la lista de la IPO de Pre-IPO. Lo marcas cuando tienes Controles de residencia de datos y GeoDNS y un Nodo de Usuarios de la UE en funcionamiento. Todo Nodo de datos al que llegue ese Nodo debe estar entonces en la región de la UE o ser un Almacén de columnas anchas repartido o un Nodo de SQL distribuido. Construye una ruta completa en la UE y mantén sus datos locales.',
    },
    'ddos-distributed-denial-of-service': {
      term: 'DDoS (denegación de servicio distribuida)',
      definition:
        'Un ataque que inunda un servicio con tráfico de muchas máquinas a la vez, a menudo una botnet, de modo que los usuarios reales no pueden pasar. Las defensas filtran la basura en el borde y reparten la carga entre muchas ubicaciones.',
      inGame:
        'El incidente DDoS puede empezar desde Semilla. Añade 50 veces tu demanda normal como tráfico de bots durante hasta 60 s. Un WAF filtra los bots según su nivel de paranoia; activa el modo Bajo ataque para bloquear el 99% de ellos, a costa del 1% de los usuarios reales y 40 ms más de latencia. El director elige un DDoS con menos frecuencia cuando tienes un WAF.',
    },
    'dead-letter-queue': {
      term: 'Cola de mensajes muertos',
      definition:
        'Una cola aparte que guarda los mensajes que un consumidor no puede procesar, tras un número fijado de intentos fallidos. Evita que un solo mensaje malo bloquee la cola y conserva el mensaje para que las personas lo inspeccionen o lo reproduzcan.',
      inGame:
        'La tarjeta de una Cola tiene un ajuste de Tareas fallidas: Reintentar siempre, o Cola de mensajes fallidos con 1, 3, 10 o 25 intentos. Un intento fallido vuelve 30 s después y se ejecuta de nuevo en el Worker, y una tarea que falla en todos los intentos se pierde. El incidente Mensaje envenenado solo puede afectar a una Cola que reintenta siempre, porque una tarea que siempre falla sigue volviendo y sus Workers dedican el 90% de su tiempo a ella. Activa la cola de mensajes fallidos para volver inmune la Cola, o elimina el mensaje para acabar con el Incidente.',
    },
    denormalization: {
      term: 'Desnormalización',
      definition:
        'Guardar el mismo dato en más de un lugar, o mantener una copia ya unida, para que una lectura no necesite hacer joins ni calcularlo. Las lecturas salen más baratas, y cada escritura tiene que actualizar cada copia.',
      inGame:
        'La Investigación de Desnormalización hace que cada lectura de la Base de datos cueste un 30% menos de CPU y cada escritura un 20% más (10). Compensa en un Diseño con muchas lecturas y perjudica a uno con muchas escrituras, que es el intercambio que muestra la vista previa de la tarjeta de Tradeoff antes de que el jugador lo acepte.',
    },
    'dependency-scanning': {
      term: 'Análisis de dependencias',
      definition:
        'Una comprobación automatizada de las bibliotecas de terceros que usa un proyecto frente a bases de datos de vulnerabilidades conocidas. Suele ejecutarse en el pipeline de compilación y señala las versiones que necesitan una actualización.',
      inGame:
        'El Escaneo de dependencias es una Investigación de Seguridad desde la Serie A que necesita Entrega continua. Detecta un backdoor publicado antes de que la compilación lo instale, y reduce la debilidad que encuentra el incidente Compromiso de la cadena de suministro. También es uno de los tres requisitos previos del programa SOC 2, junto con TLS en todas partes y Cifrado en reposo, y la lista de la IPO necesita SOC 2.',
    },
    'distributed-tracing': {
      term: 'Trazabilidad distribuida',
      definition:
        'Seguir una petición a través de cada servicio que toca. Cada salto registra un span con su hora de inicio y de fin, y los spans que comparten un ID de traza se unen en una sola traza. Las trazas muestran dónde se va el tiempo y qué dependencia es lenta.',
      inGame:
        'La Investigación de Trazado distribuido (después de Percentiles) muestra el tiempo de cada tipo de petición, Nodo por Nodo, como la tabla de Servicios del Cuadro de mando y su Cascada. El Nodo de Analítica muestrea el tráfico de los Nodos que enlazas a él y lo convierte en Conocimiento. Los percentiles muestran p50, p95 y p99, y el Tablero marca el Cuello de botella.',
    },
    'diurnal-traffic': {
      term: 'Tráfico diurno',
      definition:
        'La subida y bajada diaria de la demanda que sigue a las horas en que la gente está despierta y activa. Los servicios de consumo suelen alcanzar el pico por la tarde-noche y están más tranquilos de madrugada. La planificación de capacidad debe cubrir el pico diario, y el valle es un momento seguro para el mantenimiento.',
      inGame:
        'La demanda sigue un ciclo diario en el Calendario. Por defecto alcanza el pico a las 20:00 con 1.45× la media y baja a 0.55× a las 08:00, y cada Emprendimiento fija su propia curva: Fintech alcanza el pico a las 14:00 y oscila ±60%. Cuando abres más regiones, cada región alcanza el pico a sus 20:00 locales. Un segundo de simulación es un minuto de calendario, así que un día completo dura 24 minutos a 1×. Dimensiona para el pico de la tarde-noche, o deja que un Autoescalador siga la curva.',
    },
    'dns-round-robin': {
      term: 'Round robin de DNS',
      definition:
        'Reparto de carga mediante DNS: un nombre devuelve varias direcciones IP y el servidor rota su orden para que los clientes se repartan entre los hosts. El DNS no sabe si un host está vivo, y los clientes guardan en caché las respuestas durante el TTL del registro.',
      inGame:
        'La Investigación de Round robin de DNS desbloquea el Componente DNS, que reparte los Usuarios por igual entre hasta 8 hosts. Sin comprobaciones de estado, un host caído conserva su parte y esas peticiones fallan. Tras la Investigación de Comprobaciones de estado, el DNS descarta un host caído cuando se agota su TTL: 30, 300 o 3,600 s. Un Balanceador de carga detecta un host caído antes, en su siguiente comprobación de estado.',
    },
    'dora-metrics': {
      term: 'Métricas DORA',
      definition:
        'Cinco medidas de la entrega de software del programa de investigación DORA: tiempo de entrega de cambios, frecuencia de despliegue, tiempo de recuperación de despliegues fallidos, tasa de fallos de cambios y tasa de retrabajo. Las tres primeras muestran el rendimiento y las dos últimas la inestabilidad.',
      inGame:
        'Dos de ellas influyen en el juego. La frecuencia de despliegue es como mucho 480 minutos de trabajo / (compilación + despliegue + 15 de verificación) por día, limitada a 16, 8 o 4 según la política del Equipo. La Entrega continua reduce un despliegue de 30 a 5 minutos. Cada despliegue tiene un 10% de probabilidad base de publicar un fallo. Moverse rápido y la deuda técnica la aumentan, y las Pruebas automatizadas (−30%) y la Revisión de código (−20%) la reducen. La tarjeta del despliegue muestra el resultado.',
    },
    downsampling: {
      term: 'Submuestreo',
      definition:
        'Guardar las métricas antiguas con una resolución más gruesa, como un punto cada 5 minutos o cada hora en lugar de cada segundo. Los rangos largos siguen siendo baratos de conservar y rápidos de dibujar. Cada punto grueso conserva el mínimo, el máximo, la suma y el recuento de los puntos que sustituye.',
      inGame:
        'El Cuadro de mando lee muestras de un minuto para los rangos de 1 h y 6 h, bloques de 15 minutos (conservados 7 días) para 1 d y 7 d, y bloques de 1 hora (conservados 30 días) para 30 d. Cada gráfica dibuja un bloque como su media. La línea p99 dibuja en cambio el peor minuto de cada bloque, porque un promedio ocultaría el pico.',
    },
    drift: {
      term: 'Deriva',
      definition:
        'La diferencia entre la infraestructura que una herramienta como Terraform o Pulumi desplegó por última vez y lo que funciona ahora. La deriva viene de cambios hechos fuera de la herramienta, como un cambio de tamaño en una consola de la nube, y de cambios de código que aún no se han aplicado.',
      inGame:
        'Un Espejo deriva de dos maneras: está atrasado cuando su región de origen cambió, y tiene un cambio manual cuando cambiaste el Espejo directamente. Aplicar devuelve el Espejo a su origen y revierte los cambios manuales que ve su plan. Los planes de Terraform ven todos los cambios manuales a la vez. Pulumi y Alchemy planifican contra el estado que registraron, así que un cambio manual solo aparece tras Refrescar o Comprobar deriva. Conserva como override una diferencia regional correcta.',
    },
    egress: {
      term: 'Egress',
      definition:
        'Datos que salen de la red de un proveedor de nube, hacia internet o hacia otra zona o región. Los proveedores cobran por GB por ellos, mientras que los datos que entran suelen ser gratuitos.',
      inGame:
        'Desde Semilla, el Gasto incluye el egress: $0.09 por GB que los Servidores de aplicaciones envían a los usuarios, y $0.02 por GB por las páginas que una CDN responde en el borde. Una llamada entre zonas cuesta $0.01 por GB en cada sentido, y una llamada entre regiones $0.02 por GB. El índice de costes de la Era escala todo esto. La Compresión hace que las respuestas de página y lectura sean un 70% más pequeñas por un 10% más de CPU.',
    },
    'edge-side-includes': {
      term: 'Includes del lado del edge',
      definition:
        'Una técnica de caché en la que el borde guarda la parte compartida de una página y ensambla solo los fragmentos personales de cada usuario, de modo que una página con sesión iniciada aún puede servirse sobre todo desde la caché.',
      inGame:
        'La Investigación de Edge-side includes añade 20 puntos a la tasa de aciertos `page` de una CDN, del 70% al 90% (10), porque el borde guarda en caché el armazón de una página con sesión iniciada. El TTL sigue multiplicándola y la tasa de aciertos sigue limitada al 95%.',
    },
    'encryption-at-rest': {
      term: 'Cifrado en reposo',
      definition:
        'Cifrar los datos almacenados, como discos, archivos de base de datos y copias de seguridad, para que quien se haga con los soportes de almacenamiento no pueda leerlos sin las claves. Protege contra discos robados y copias filtradas, no contra un atacante que pueda consultar el sistema en vivo.',
      inGame:
        'El Cifrado en reposo es una Investigación de Seguridad desde la Serie B. No tiene efecto directo en el tráfico, el coste ni los Incidentes. Es uno de los tres requisitos previos, junto con TLS en todas partes y Escaneo de dependencias, del programa SOC 2, que necesita la lista de la IPO.',
    },
    'error-budget': {
      term: 'Presupuesto de error',
      definition:
        'La cantidad de fallos que permite un SLO durante una ventana: con un SLO del 99.9%, el 0.1% de las peticiones puede fallar. Los equipos lo gastan en riesgo, como lanzamientos más rápidos, y frenan y arreglan la fiabilidad cuando se agota.',
      inGame:
        'Desde la Serie A, el juego cuenta las peticiones fallidas de la última semana de calendario frente al SLO de la Era, 99.9% en la Serie A y hasta 99.99% al cotizar en bolsa. Los bots y los bloqueos del WAF no cuentan. Tras la Investigación de Presupuestos de error, si queda más de la mitad del presupuesto tus Equipos van un 10% más rápido, y un presupuesto agotado reduce su velocidad a la mitad. Los Cuadros de mando de SLO ponen el presupuesto en el HUD y grafican su tasa de consumo en el Cuadro de mando.',
    },
    'event-loop': {
      term: 'Bucle de eventos',
      definition:
        'Un único hilo que espera eventos de E/S y ejecuta sus callbacks uno a uno. Atiende muchas conexiones en espera a bajo coste, pero un callback que usa la CPU durante mucho tiempo bloquea todas las demás peticiones de ese bucle.',
      inGame:
        'Node.js ejecuta un bucle de eventos y usa un núcleo; el clúster de Node.js ejecuta un bucle por núcleo. Una petición que usa mucha CPU, como un hash de contraseña de 80 ms al iniciar sesión, detiene las peticiones que tiene detrás, y la parada recae sobre el p99. En el incidente Bloqueo del bucle de eventos cada inicio de sesión cuesta 4× la CPU. La Investigación del Pool de hilos de libuv o un Proveedor de autenticación saca el hash del bucle.',
    },
    'eventual-consistency': {
      term: 'Consistencia eventual',
      definition:
        'Un modelo de consistencia en el que las réplicas pueden devolver datos antiguos durante un tiempo tras una escritura. Si no llegan escrituras nuevas, todas las réplicas convergen al mismo último valor.',
      inGame:
        'Una Réplica de lectura se queda por detrás de las escrituras, así que hasta el 15% de sus lecturas salen obsoletas, y hasta el 50% durante el incidente Retraso de replicación. Un Almacén de columnas anchas cuyo R + W no es mayor que N también sirve lecturas obsoletas. Una lectura obsoleta hace fallar una lectura de API y un pago que lee su propia escritura. El enrutado read-your-writes envía esas lecturas al primario.',
    },
    'expand-and-contract': {
      term: 'Expand and contract',
      definition:
        'Una forma de cambiar un esquema sin bloquear una tabla: añadir la columna o tabla nueva, escribir en ambas, rellenar, cambiar las lecturas y luego eliminar la antigua. Cada paso es retrocompatible, así que el código antiguo y el nuevo funcionan a la vez.',
      inGame:
        'La Investigación de Expandir y contraer elimina por completo el incidente Bloqueo de migración de esquema. Con solo Migraciones de esquema en línea el Incidente es unas ocho veces menos probable, y con Expandir y contraer no puede ocurrir. Ambas cuestan Horas de desarrollo: en una Base de datos relacional, una Funcionalidad que añade una forma de consulta cuesta un 10% más con migraciones en línea y un 25% más con expandir y contraer.',
    },
    'fallacies-of-distributed-computing': {
      term: 'Falacias de la computación distribuida',
      definition:
        'Ocho suposiciones falsas que suelen hacer los programadores nuevos en sistemas distribuidos, recopiladas por L. Peter Deutsch y otros en Sun Microsystems: la red es fiable, la latencia es cero, el ancho de banda es infinito, la red es segura, la topología no cambia, hay un solo administrador, el coste del transporte es cero y la red es homogénea.',
      inGame:
        'Varios Incidentes y costes rompen estas suposiciones. En el incidente Partición de red, las llamadas entre regiones caducan hasta que la partición se cura o aíslas al líder antiguo. Una llamada a otra zona añade 1 ms y cuesta egress en ambos sentidos, y una llamada a otra región paga el viaje de ida y vuelta. Hasta Tiempos de espera y reintentos, cada Enlace espera 30 s una respuesta.',
    },
    'fan-out': {
      term: 'Fan-out',
      definition:
        'Una petición que se convierte en muchas llamadas a otros servicios o almacenes de datos. Cuantas más llamadas espera una petición, más probable es que una de ellas sea lenta, así que un fan-out amplio aumenta la latencia de cola y la carga.',
      inGame:
        'Una vista de página hace 2 consultas de lectura, y los frameworks con ORM (Laravel, Rails, Django) hacen 3 lecturas donde bastaría 1 hasta la Carga anticipada. La Funcionalidad Feed de actividad añade feeds: con pull, un feed hace 20 lecturas. Con fan-out en escritura, un feed hace 1 lectura pero cada escritura rellena las líneas de tiempo de 20 seguidores. El Fan-out híbrido lo reduce a 2 lecturas y 10 escrituras de línea de tiempo.',
    },
    'fan-out-on-write': {
      term: 'Fan-out en escritura',
      definition:
        'Construir el feed de cada usuario al escribirse una publicación: la publicación se copia en la línea de tiempo de cada seguidor, así que leer un feed es una sola búsqueda barata. Traslada trabajo de las lecturas a las escrituras y es caro para cuentas con muchos seguidores. Muchos sistemas usan un híbrido: push para cuentas normales y pull para famosos en el momento de la lectura.',
      inGame:
        'Desde la Serie C, la Funcionalidad Feed de actividad añade el tipo feed, y cada tarjeta de Servidor de aplicaciones ofrece Feeds: Pull o Push. Con Pull, un feed lee 20 publicaciones. Con Push, un feed lee una línea de tiempo precalculada, pero cada escritura hace 20 escrituras de línea de tiempo. La Investigación de Fan-out híbrido lo reduce a 10 escrituras y 2 lecturas por feed, y permite a una Caché o a un Almacén de columnas anchas repartir una Clave caliente entre sus shards.',
    },
    'feature-flag': {
      term: 'Feature flag',
      definition:
        'Un interruptor en el código, controlado en tiempo de ejecución, que activa o desactiva una funcionalidad sin un despliegue nuevo. Los equipos usan flags para lanzar una funcionalidad a una parte de los usuarios, probarla o apagarla rápido cuando falla.',
      inGame:
        'La Investigación de Feature flags desbloquea el Componente Feature flags. Cada Funcionalidad del lote de un despliegue tiene un rollout: oculto, 5%, 25%, 50% o todos los usuarios. Un mal despliegue falla el 8% de las peticiones del Servidor de aplicaciones por cada Funcionalidad de su lote, y un flag reduce la parte de esa Funcionalidad a su rollout, así que una Funcionalidad al 5% rompe como mucho el 5% de lo que habría roto, sea cual sea la estrategia de despliegue. Apagarla es el único clic que detiene la explosión. Los efectos de una Funcionalidad y la carga que añade siguen su exposición: su rollout por la parte de sus usuarios que la han adoptado. Una Funcionalidad oculta no gana nada, y una Funcionalidad al 50% llega a la mitad de sus usuarios una vez que la adoptan. Las Pruebas A/B miden la mejora frente a los usuarios que su rollout deja fuera.',
    },
    'four-golden-signals': {
      term: 'Cuatro señales doradas',
      definition:
        'Latencia, tráfico, errores y saturación: las cuatro medidas que el libro de SRE de Google dice que hay que vigilar primero en un sistema de cara al usuario. Si solo puedes medir cuatro cosas, mide estas.',
      inGame:
        'El Cuadro de mando (D) se abre tras la Investigación de Métricas. Su fila de Señales doradas grafica el tráfico (servido frente a demanda), la latencia (la media, más el p99 con Percentiles) y los errores (con Logs estructurados). La fila de Saturación de abajo muestra cuán lleno está cada Nodo, y las estadísticas de arriba nombran el Nodo más caliente.',
    },
    'gc-pause': {
      term: 'Pausa de GC',
      definition:
        'El tiempo en que un recolector de basura detiene o ralentiza la aplicación para encontrar y liberar memoria que ya no se usa. Las pausas suelen afectar solo a algunas peticiones, así que se notan en la latencia de cola, como el p99, más que en la media.',
      inGame:
        'Cuando el heap de un Servidor de aplicaciones está lleno a más del 70%, su recolector pausa hasta el 2% de las peticiones. Java pausa 30 ms con G1, 150 ms con Parallel o 1 ms con ZGC, que cuesta el 10% del rendimiento y un 15% más de memoria. Go pausa solo 1 ms pero gasta hasta un 25% más de CPU, que el Ajuste del GC de Go intercambia por memoria. En el incidente Tormenta de pausas de GC el heap se llena más y se pausan 5× más peticiones.',
    },
    geodns: {
      term: 'GeoDNS',
      definition:
        'DNS que da respuestas distintas según dónde esté el usuario, de modo que cada usuario resuelve a un centro de datos o región cercanos. Muchos proveedores también pueden saltarse una región que no pasa sus comprobaciones de estado.',
      inGame:
        'GeoDNS es una Investigación de la Serie C que necesita Múltiples regiones. Sin ella, los usuarios de todos los continentes entran por la región de origen y pagan dos viajes de ida y vuelta, por ejemplo 150 ms de Europa a Norteamérica. Con ella, los usuarios de cada región entran por el Nodo de Usuarios de su propia región, o por el más cercano que siga vivo durante una Caída de región. El elemento de la lista Residencia de datos también necesita GeoDNS.',
    },
    'gil-global-interpreter-lock': {
      term: 'GIL (bloqueo global del intérprete)',
      definition:
        'Un bloqueo en la compilación por defecto de CPython, y el GVL en CRuby, que permite que solo un hilo ejecute código del intérprete a la vez. Los hilos aún se solapan mientras esperan E/S, pero el trabajo de CPU de un proceso no se ejecuta en paralelo. CPython 3.13 añadió una compilación opcional con hilos libres sin el GIL (PEP 703).',
      inGame:
        'Puma de Ruby debe ejecutar un proceso por núcleo para usar todos los núcleos, con 5 hilos cada uno y 180 MB por proceso. Gunicorn de Python ejecuta un pool de workers síncronos, una petición cada uno y 120 MB por worker, y tú fijas el tamaño del pool. Los runtimes sin GIL, como Go o Java, ejecutan un proceso en cada núcleo.',
    },
    gitops: {
      term: 'GitOps',
      definition:
        'Una forma de operar infraestructura en la que el estado deseado vive en Git como código declarativo, y un agente como Argo CD o Flux lo extrae y sigue reconciliando el sistema en vivo para que coincida. OpenGitOps enumera cuatro principios: declarativo, versionado e inmutable, extraído automáticamente y reconciliado de forma continua.',
      inGame:
        'GitOps es una Investigación de la Serie C posterior a Infraestructura como código. Aplica cada cambio del origen a cada Espejo por sí solo, así que los Espejos dejan de quedarse atrás. También revierte los cambios manuales en la siguiente sincronización con cada herramienta de IaC, como Argo CD con self-heal activado, así que los overrides son la única forma de ajustar una región. Todo a la vez sincroniza en 3 minutos de calendario, como el sondeo por defecto de Argo CD. Por fases retiene un cambio en el origen durante 60 minutos primero. Todo a la vez cambia deriva por radio de impacto: un Push de configuración defectuoso llega a todos los Espejos a la vez.',
    },
    'graceful-degradation': {
      term: 'Degradación elegante',
      definition:
        'Mantener funcionando la parte importante de un servicio cuando está por encima de su capacidad, apagando las partes caras y opcionales en lugar de fallar todo: la página sigue cargando y el informe espera.',
      inGame:
        'La Investigación de Degradación elegante añade un interruptor a un Servidor de aplicaciones. Un Nodo saturado descarta entonces primero sus tipos de petición más caros, exportaciones y subidas antes que lecturas, así que los tipos baratos mantienen su latencia (10). El descarte de carga es el orden contrario: descarta primero los tipos menos valiosos, bots y pujas de anuncios antes que páginas.',
    },
    'green-threads': {
      term: 'Green threads',
      definition:
        'Hilos ligeros que planifica el runtime de un lenguaje en lugar del sistema operativo. Las goroutines, los hilos virtuales de Java y los procesos de Erlang son ejemplos. Cada uno cuesta unos pocos KB, así que un servidor puede mantener muchos miles en espera a la vez.',
      inGame:
        'Go y BEAM de Elixir ejecutan green threads en cada núcleo, y una petición en espera no retiene ningún hueco de worker. Cada conexión en tiempo real abierta cuesta 10 KB en Go y 5 KB en BEAM, frente a 1 MB de un hilo de Java en Tomcat. BEAM es preemptivo, así que ninguna petición bloquea a otra, pero su CPU es menos de la mitad de rápida que la de Go.',
    },
    'health-check': {
      term: 'Comprobación de estado',
      definition:
        'Una sonda periódica, como una petición HTTP a un endpoint de estado, que decide si un servidor debe recibir tráfico. Una comprobación superficial prueba solo el servidor; una profunda prueba también aquello de lo que depende, como su base de datos.',
      inGame:
        'Un Balanceador de carga sondea sus Servidores de aplicaciones cada 10 s y deja de enviar tráfico a uno caído en la siguiente comprobación. La Investigación de Comprobaciones de estado añade intervalos de 2 s y 30 s y una comprobación profunda que también retira los Servidores de aplicaciones cuya Base de datos está caída o sobrecargada. También permite al DNS descartar un host caído cuando se agota su TTL; sin ella, el DNS sigue enviando a ese host su parte. Las comprobaciones solo funcionan cuando la tarea del endpoint de comprobación de estado está hecha.',
    },
    'hedged-request': {
      term: 'Petición hedged',
      definition:
        'Enviar una segunda copia de una petición a otra réplica cuando la primera es más lenta de lo esperado, por ejemplo más allá de la latencia del percentil 95, y usar la respuesta que llegue antes. Reduce la latencia de cola a cambio de un poco de carga extra.',
      inGame:
        'La Investigación de Peticiones especulativas añade un interruptor hedge a cada Enlace. Un Enlace con hedge envía una segunda copia de cada llamada y el usuario espera la respuesta más rápida, así que la media se reduce a la mitad y el p99 baja. El destinatario ve un 10% más de llamadas, que muestra la tasa del Enlace. La Investigación de Percentiles muestra la cola antes y después. La lectura por quórum del Almacén de columnas anchas funciona igual: espera solo a las R réplicas más rápidas de sus N.',
    },
    'hot-key': {
      term: 'Clave caliente',
      definition:
        'Una clave que recibe una parte muy grande de las lecturas o escrituras, como el perfil de un famoso. El shard o servidor único que la posee se satura mientras los demás están ociosos, así que añadir servidores no ayuda.',
      inGame:
        'En el incidente Clave caliente (Serie C), el 30% de las lecturas de una Caché o Almacén de columnas anchas ocupados piden una sola clave. La capacidad de ese Nodo se divide entre 0.3 × sus pasos de tamaño + 0.7, así que un Nodo de tamaño 4 conserva aproximadamente la mitad. La Investigación de Fan-out híbrido te permite activar la división de claves en una Caché o un Almacén de columnas anchas. La división reparte la clave caliente y acaba con la pérdida.',
    },
    'http-keep-alive': {
      term: 'Keep-alive de HTTP',
      definition:
        'Reutilizar una conexión TCP para muchas peticiones HTTP en lugar de abrir una nueva cada vez. Se salta el handshake de conexión, y en HTTPS el handshake de TLS, en cada petición después de la primera.',
      inGame:
        'Cada llamada interna entre Nodos cuesta un salto de 0.5 ms más un handshake TCP de 1 ms. La Investigación de Reutilización de conexiones quita el handshake, así que cada llamada interna cuesta 0.5 ms. Una petición que cruza varios Nodos ahorra 1 ms en cada salto.',
    },
    'http2-and-http3': {
      term: 'HTTP/2 y HTTP/3',
      definition:
        'Versiones más nuevas de HTTP. HTTP/2 envía muchas peticiones a la vez por una sola conexión TCP. HTTP/3 funciona sobre QUIC en UDP, que combina los handshakes de transporte y de TLS y evita que un paquete perdido detenga todos los flujos.',
      inGame:
        'La Investigación de HTTP/3 reduce un 20% los viajes de ida y vuelta que paga un usuario para llegar a una región de otro continente. Un usuario europeo atendido desde Norteamérica espera 120 ms en lugar de 150 ms. Es una Investigación de la Serie C que necesita antes la Investigación de HTTP/2. La Investigación de HTTP/2 reduce un 15% el salto del usuario en las vistas de página.',
    },
    'iac-tool': {
      term: 'Herramienta de IaC',
      definition:
        'Una herramienta que describe la infraestructura como código y la aplica: compara el código con el estado registrado, muestra un plan y hace los cambios. Terraform usa HCL; Pulumi y Alchemy usan lenguajes de propósito general como TypeScript. Cada una mantiene un archivo de estado de lo que desplegó.',
      inGame:
        'La Investigación de Infraestructura como código te pide elegir Terraform, Pulumi o Alchemy. Las tres construyen cada Componente y pueden fijar cualquier valor por región. Se diferencian en cómo un plan encuentra los cambios manuales, según el flujo de trabajo por defecto de cada herramienta. Terraform refresca el estado en vivo en cada plan, así que sus planes son completos, pero cada Apply espera al refresco. Pulumi planifica contra su estado registrado hasta que haces Refrescar. Alchemy también planifica contra el estado registrado, pero Comprobar deriva lee el estado en vivo y Reparar restaura los cambios manuales sin aceptar cambios del origen. Pasar a otra herramienta detiene toda sincronización durante un día de calendario.',
    },
    idempotency: {
      term: 'Idempotencia',
      definition:
        'Una operación es idempotente cuando hacerla dos veces tiene el mismo efecto que hacerla una vez. Las lecturas son idempotentes por naturaleza; el cobro de una tarjeta o un pedido no. Una clave de idempotencia es un ID único que el cliente envía con una petición, para que el servidor pueda reconocer un reintento y devolver el primer resultado en lugar de actuar de nuevo.',
      inGame:
        'Un pago envía un cobro al Proveedor de pagos. En el incidente Cobro duplicado el proveedor se ralentiza unos 1.5 s y el Enlace del cobro caduca. El reintento cobra entonces una tarjeta que el primer intento ya había cobrado, así que esos pagos fallan como duplicados. Investiga Claves de idempotencia (necesita Checkout) y haz la tarea de Claves de idempotencia, y un cobro reintentado nunca cobra dos veces. Sin ella, fija los reintentos del Enlace del cobro a ninguno para acabar con el Incidente.',
    },
    'inverted-index': {
      term: 'Índice invertido',
      definition:
        'Un índice que asigna cada palabra a la lista de documentos que la contienen, como el índice del final de un libro. Los motores de búsqueda de texto completo como Lucene y Elasticsearch lo usan, y PostgreSQL lo ofrece como índice GIN. Una búsqueda lee unas pocas listas cortas en lugar de recorrer cada fila.',
      inGame:
        'Sin un Motor de búsqueda, la Base de datos responde q-search por sí misma, con 80 ms de CPU por búsqueda: diez veces una lectura normal. La Investigación de Búsqueda de texto completo desbloquea el Motor de búsqueda, que responde 400 búsquedas por segundo por paso de tamaño en unos 15 ms. Enlázalo a tus Servidores de aplicaciones y la búsqueda deja de cargar la Base de datos.',
    },
    'jit-warmup': {
      term: 'Calentamiento JIT',
      definition:
        'Un compilador just-in-time (JIT) convierte el código que se ejecuta con frecuencia en código máquina optimizado mientras el programa se ejecuta. Hasta que ha perfilado y compilado las rutas calientes, un proceso nuevo funciona por debajo de su velocidad máxima, así que sus primeros segundos o minutos son lentos. La JVM y .NET se calientan así; la compilación por niveles y los perfiles ahead-of-time acortan el calentamiento.',
      inGame:
        'Cada runtime tiene una velocidad inicial y un tiempo de calentamiento, así que un Servidor de aplicaciones frío funciona más lento durante sus primeros segundos. Un Servidor de aplicaciones Tomcat (Java) empieza al 30% de la velocidad de CPU y llega a toda su velocidad tras 30 s. Kestrel (C#) empieza al 60% y Node.js al 80% durante 15 s, mientras que Go, BEAM y Tokio empiezan a toda velocidad. Cada reinicio, cambio de tamaño, cambio de Stack y copia nueva de un Autoescalador empieza en frío, así que añade capacidad antes de un pico, no durante él. PHP calienta en cambio su OPcache, de 1× hasta 2.5× la velocidad de CPU a medida que se llena la caché.',
    },
    'leaderless-replication': {
      term: 'Replicación sin líder',
      definition:
        'Replicación sin un líder único: un cliente envía cada escritura a varias réplicas y lee de varias, y un quórum decide. Dynamo de Amazon hizo conocido el diseño, y Cassandra lo usa. Sigue escribiendo cuando fallan algunas réplicas, a costa de lecturas que pueden ser obsoletas salvo que R + W > N.',
      inGame:
        'La Investigación de Replicación sin líder (después de Sharding) desbloquea el Almacén de columnas anchas. Cada clave vive en N réplicas (de 1 a 5, 3 por defecto), una lectura pregunta a R de ellas y una escritura espera a W (R y W valen 1 por defecto). Con R + W > N cada lectura ve la última escritura, pero con menos algunas lecturas salen obsoletas. Una escritura cuesta N operaciones de réplica y una lectura cuesta R, de las 30,000 por segundo por paso de tamaño. Si un Fallo de instancia se lleva una réplica, cualquier quórum que necesite todas las réplicas falla.',
    },
    'leap-smearing': {
      term: 'Leap smearing',
      definition:
        'Una solución de medición del tiempo para el segundo intercalar: un servidor reparte el segundo extra en una ventana larga, a menudo un día entero, así que su reloj va muy ligeramente lento y nunca salta. Google y Amazon lo hacen en sus propios relojes. Lo que daña es el salto, porque un segundo repetido hace que los temporizadores se disparen dos veces y que los leases caduquen antes de tiempo.',
      inGame:
        'El incidente Segundo intercalar o desfase de reloj hace que cada Nodo de una región responda 1,000 ms tarde y que caduque el 10% de sus respuestas, hasta que reinicies los Nodos o se agote tras 60 s. Leap smearing (Serie C) es la Investigación que evita que ocurra el salto. El Desafío del segundo intercalar programa el mismo evento como una caída de un Servidor de aplicaciones regional.',
    },
    'littles-law': {
      term: 'Ley de Little',
      definition:
        'En cualquier sistema estable, el número medio de elementos dentro (L) es igual a la tasa media de llegada (λ) por el tiempo medio que cada elemento pasa dentro (W): L = λW. John Little lo demostró en 1961, y se cumple sea cual sea el patrón de llegada o el orden del servicio. Para un servidor, peticiones en curso = peticiones por segundo × segundos que tarda cada petición.',
      inGame:
        'Un Servidor de aplicaciones que retiene un worker o un hilo por petición tiene un número fijo de huecos. Cada petición conserva su hueco durante su tiempo de CPU más cada llamada a la base de datos que espera. Huecos en uso = tasa de llegada × ese tiempo, así que cuando cada petición espera 10 veces más a la Base de datos, un pool de 5 workers de PHP-FPM atiende hasta 10 veces menos peticiones. Arregla la llamada lenta, añade workers o hilos, o pasa a un runtime que espere sin retener un hueco (Node.js, Go, Kestrel, BEAM, Tokio).',
    },
    'load-balancer': {
      term: 'Balanceador de carga',
      definition:
        'Un servidor que reparte las peticiones entrantes entre un grupo de servidores backend y deja de enviar a un backend que no pasa su comprobación de estado. Te permite añadir servidores detrás de una misma dirección y decide qué servidor recibe cada petición.',
      inGame:
        'La Investigación de Balanceo de carga desbloquea el Balanceador de carga, que gestiona 2,000 peticiones por segundo por paso de tamaño y añade 1 ms. Por defecto reparte el tráfico según la capacidad de cada Servidor de aplicaciones. Descarta un host caído en su siguiente comprobación de estado, cada 10 s por defecto, mientras que el round robin de DNS sigue enviando a un host caído. La Investigación de Algoritmos de balanceo de carga añade menos conexiones y dos opciones al azar, y la de Comprobaciones de estado te permite comprobar cada 2 s o 30 s. La Investigación de Balanceo de carga L4 pasa un Nodo a la capa 4: 20,000 peticiones por segundo, un salto de 0.2 ms y 0.6× el Gasto. Nunca lee el HTTP, así que no puede reintentar.',
    },
    'load-shedding': {
      term: 'Descarte de carga',
      definition:
        'Rechazar algunas peticiones a propósito cuando un servidor está sobrecargado, para que las peticiones que conserva terminen a tiempo en lugar de caducar todas. Un buen descarte rechaza pronto, antes de que el trabajo use recursos, y descarta primero el trabajo menos importante o más barato.',
      inGame:
        'La Investigación de Descarte de carga por prioridad te permite activar el descarte de carga en un Servidor de aplicaciones. Por encima del 90% de carga descarta tipos de petición enteros, primero los de menor valor (bots, luego Tiempo real, luego vistas de página y superiores), hasta que su carga vuelve al 90%, así que un pago de $25 sobrevive a una sobrecarga. Las peticiones descartadas cuentan como errores y gastan el presupuesto de errores, pero las que conserva siguen siendo rápidas.',
    },
    'memory-leak': {
      term: 'Fuga de memoria',
      definition:
        'Memoria que un proceso de larga duración mantiene asignada pero ya no usa, de modo que su uso de memoria crece con el tiempo en marcha. En los lenguajes con recolector de basura, una fuga suele ser un objeto que sigue siendo alcanzable por error, como una caché que solo crece o un listener que nadie elimina. El proceso se ralentiza al hacer swap o recolectar basura, y el sistema operativo lo mata cuando se agota la memoria.',
      inGame:
        'El incidente Fuga de memoria afecta a un Servidor de aplicaciones cuyo runtime mantiene sus procesos entre peticiones (todos los runtimes salvo Apache mod_php y PHP-FPM). Gana el 2.5% de su RAM cada segundo. Pasado el 100% de la RAM hace swap y se ralentiza, y al 125% el kernel lo mata y se reinicia en frío. Reinicia el servidor para liberar la memoria, o publica la tarea Corregir la fuga de memoria (15 Horas de desarrollo), que detiene las fugas hasta que se publique la siguiente Funcionalidad.',
    },
    'materialized-view': {
      term: 'Vista materializada',
      definition:
        'El resultado almacenado de una consulta, guardado en disco y refrescado según un calendario, para que un informe lea la respuesta en lugar de recorrer las tablas. Es rápido, y solo está tan fresco como el último refresco.',
      inGame:
        'La Investigación de Vistas materializadas añade una vista a la tarjeta de una Base de datos. Un informe recorre la vista almacenada con la mitad de CPU (10), pero el 5% de las respuestas del informe están obsoletas, de antes del último refresco. Es el gemelo, dentro de la Base de datos, del Almacén de datos, con los mismos recorridos baratos y sin un segundo sistema.',
    },
    'metastable-failure': {
      term: 'Fallo metaestable',
      definition:
        'Un fallo que se sostiene a sí mismo cuando su detonante ya ha desaparecido. Una ralentización breve empuja al sistema a un mal estado, y un bucle de retroalimentación, casi siempre los reintentos, mantiene la carga por encima de la capacidad, así que el sistema sigue caído hasta que alguien recorta la carga. Bronson y otros nombraron esta clase de fallo en 2021.',
      inGame:
        'El incidente Tormenta de reintentos ralentiza la Base de datos al 30% de su capacidad durante 20 s. Los Enlaces que reintentan de inmediato envían hasta 1 + f + f² + f³ llamadas por llamada cuando falla una parte f. Arrastran esa parte de fallos al siguiente Paso, y la Base de datos encola lo que no puede aceptar, así que el Incidente termina solo cuando esa acumulación se vacía. El Backoff con jitter, los Circuit breakers y el Descarte de carga por prioridad rompen cada uno el bucle. Los reintentos ingenuos hacia una Base de datos hacen este Incidente 6 veces más probable que el backoff.',
    },
    mirror: {
      term: 'Espejo',
      definition:
        'Ejecutar el mismo código de infraestructura en otra región, como un módulo de Terraform aplicado una vez por región o un StackSet de CloudFormation. Los servidores se copian con facilidad. Los datos no: cada copia debe decidir adónde van sus escrituras.',
      inGame:
        'Tras la Investigación de Infraestructura como código, el botón Espejo junto a las pestañas de región copia los Nodos y Enlaces de una región en otra. Para cada Base de datos eliges una réplica de lectura, un primario propio o llamar al origen. Para el Almacenamiento de objetos eliges replicar o llamar al origen. Aplicar paga de inmediato y los Nodos nuevos llegan fríos tras el tiempo de compilación, y los Usuarios de la región reciben sus Enlaces solo cuando aterriza el plan. El Espejo sigue enlazado a su origen, así que puede derivar, pero GitOps lo mantiene sincronizado por sí solo.',
    },
    'model-inference': {
      term: 'Inferencia de modelo',
      definition:
        'Ejecutar un modelo de aprendizaje automático ya entrenado para producir una respuesta, a diferencia de entrenarlo. En un modelo de lenguaje grande, una GPU genera la respuesta token a token, así que el coste y la velocidad se miden en tokens por segundo y tiempo hasta el primer token. Puedes alquilar GPUs y servir el modelo tú mismo, o pagar una API alojada por token.',
      inGame:
        'Una petición ai envía un prompt de 400 tokens a un Nodo de inferencia. La API de LLM (Investigación de Modelos alojados) no necesita GPUs. Cuesta $2.50 por 1,000 tokens, tarda 600 ms hasta el primer token y limita los prompts por encima de 100 por segundo por nivel de uso. Un Nodo GPU (Investigación de Servicio de modelos) tarda 300 ms hasta el primer token y genera 200 tokens por segundo por T4, 900 por A100 o 2,000 por H100. Su Gasto es el mismo esté ocupado o ocioso, así que un H100 es más barato que la API de LLM solo mientras se mantiene ocupado cerca de dos tercios.',
    },
    'mttd-and-mtta': {
      term: 'MTTD y MTTA',
      definition:
        'El tiempo medio de detección es el tiempo medio desde el inicio de un fallo hasta que una señal lo muestra. El tiempo medio de reconocimiento es el tiempo medio desde esa señal hasta que alguien toma el incidente. El libro de SRE de Google cuenta ambos junto al MTTR, porque un equipo que arregla rápido pero se entera tarde sigue siendo lento.',
      inGame:
        'Cada Incidente registra el segundo de simulación en que llega su primera señal y el segundo en que un jugador actúa por primera vez, y su Postmortem muestra el MTTD y el MTTA junto al MTTR. Con Alertas la señal es el aviso del pager, que se dispara en el Paso en que se cruza el umbral de una regla. Sin Alertas la señal es el tablero, en el primer segundo en que falla más del 1% de las peticiones. La guardia responde al aviso cinco minutos de calendario después de que llegue, que es el MTTA que mantiene una rotación. Sin guardia, la primera acción del jugador es el reconocimiento.',
    },
    mttr: {
      term: 'MTTR',
      definition:
        'Tiempo medio de restauración (o recuperación): el tiempo medio desde el inicio de un fallo hasta que el servicio vuelve a funcionar. Mide la rapidez con que un equipo detecta, diagnostica y arregla problemas. DORA mide una versión más estrecha, el tiempo de recuperación de despliegues fallidos.',
      inGame:
        'Cada Incidente termina con un Postmortem que muestra su MTTR: los minutos de calendario en que falló más del 1% de las peticiones. El Postmortem también muestra el MTTD y el MTTA que lo precedieron. Un equipo SRE con un ingeniero reduce la duración, y con ella el MTTR, un 40%. Un Incidente que ha perjudicado a los usuarios más de la mitad del tiempo al llegar a su punto medio escala una gravedad y dura 1.5 veces más. Mantén el MTTR bajo actuando rápido: reinicia, sustituye, drena o haz failover del Nodo afectado, e investiga el elemento de acción del Postmortem.',
    },
    'n1-query': {
      term: 'Consulta N+1',
      definition:
        'Cargar una lista con una consulta y luego ejecutar una consulta más por elemento para cargar sus datos relacionados: N elementos cuestan N + 1 consultas. Los ORM lo provocan mediante la carga perezosa, que esconde las consultas extra tras código de apariencia normal. La carga anticipada obtiene las filas relacionadas en una o dos consultas.',
      inGame:
        'Laravel, Rails y Django usan un ORM que envía 3 consultas de lectura donde bastaría 1, en las vistas de página y las lecturas de API. Una vista de página cuesta entonces a la Base de datos 6 lecturas en lugar de 2, lo que añade CPU allí y tiempo de espera en el Servidor de aplicaciones. Investiga Carga anticipada y publica después la tarea Carga anticipada (10 Horas de desarrollo) para quitar las consultas extra. Symfony y los frameworks ligeros nunca las hacen.',
    },
    'network-partition': {
      term: 'Partición de red',
      definition:
        'Un fallo de red que divide un sistema en grupos de nodos que no pueden alcanzarse entre sí, mientras cada grupo sigue funcionando. Durante una partición un sistema distribuido debe elegir entre mantenerse disponible y mantenerse consistente (el teorema CAP).',
      inGame:
        'El incidente Partición de red puede empezar en la Serie C cuando hay Enlaces entre regiones. Durante hasta 45 s toda llamada entre regiones caduca, salvo las llamadas de Usuarios y las llamadas a Componentes globales como la CDN. Las escrituras basadas en líder también divergen. Pulsa Aislar al líder para acabar con él. Un Nodo de SQL distribuido mantiene un líder Raft, lo que hace menos probable el Incidente.',
    },
    'node-drain': {
      term: 'Drenaje de nodo',
      definition:
        'Sacar un servidor de la rotación a propósito: dejar de enviarle trabajo nuevo, dejar que terminen las peticiones y tareas que ya tiene y luego apagarlo o actualizarlo. El connection draining de un balanceador de carga y el `kubectl drain` de Kubernetes funcionan así. Matar en cambio un servidor ocupado descarta lo que estuviera haciendo.',
      inGame:
        'La Investigación de Comprobaciones de estado añade un botón Drenar a la tarjeta de un Nodo. El Nodo deja de recibir tráfico nuevo de inmediato, y su parte pasa a los demás Nodos de la ruta. Termina lo que tiene: una Cola entrega su acumulación a sus Workers. Diez segundos de simulación después, vacío, vuelve a la rotación. Drenar el Nodo al que afecta un Incidente reduce ese Incidente a la ventana de drenaje de 10 s. Un Nodo sin otra copia que asuma la carga deja varadas todas las peticiones que se le envían.',
    },
    'object-storage': {
      term: 'Almacenamiento de objetos',
      definition:
        'Almacenamiento que guarda archivos como objetos en un espacio de nombres plano, cada uno con una clave, los datos y metadatos, al que se accede mediante una API HTTP. Servicios como Amazon S3 escalan casi sin límite y cobran por los bytes almacenados y movidos. Es adecuado para subidas, imágenes, vídeo y copias de seguridad que una base de datos gestiona mal.',
      inGame:
        'Sin Almacenamiento de objetos, la Base de datos guarda las subidas como filas, y cada blob-put de 2 MB le cuesta 60 ms de CPU. La Investigación de Almacenamiento de objetos desbloquea el Almacenamiento de objetos, que acepta subidas y lecturas de archivos sin límite de capacidad y con 40 ms de latencia. Su Gasto crece con cada GB almacenado, al precio de S3 Standard, así que la factura sigue subiendo a medida que los usuarios suben archivos.',
    },
    observability: {
      term: 'Observabilidad',
      definition:
        'Cuán bien puedes entender lo que hace un sistema a partir de los datos que emite, normalmente logs, métricas y trazas. Una buena observabilidad te permite responder preguntas nuevas sobre un fallo sin publicar código nuevo.',
      inGame:
        'La Investigación de Observabilidad te muestra más del Libro mayor. Los Logs estructurados dividen los errores por causa, Métricas añade gráficas de historial a cada Nodo, Percentiles muestra p50, p95 y p99, y Alertas hace sonar un pager cuando los errores, el p99 o la saturación cruzan un umbral. El Nodo de Analítica muestrea el tráfico de los Nodos que enlazas a él, del 1% al 100%, y lo convierte en Conocimiento. Cada muestra enseña más cuanto más cae el Apdex, hasta el doble. Una tasa de muestreo mayor cuesta más CPU y Gasto. Métricas también abre el Cuadro de mando (D), que grafica tu Diseño a lo largo del tiempo.',
    },
    'oltp-and-olap': {
      term: 'OLTP y OLAP',
      definition:
        'El procesamiento de transacciones en línea (OLTP) ejecuta muchas lecturas y escrituras pequeñas y rápidas sobre filas actuales, como pedidos e inicios de sesión. El procesamiento analítico en línea (OLAP) ejecuta pocos recorridos y agregaciones grandes sobre el histórico, como informes. Las bases de datos OLTP guardan juntas cada fila; los motores OLAP suelen guardar juntas cada columna, así que un recorrido lee solo las columnas que necesita.',
      inGame:
        'Las peticiones de Informe envían consultas q-scan. En la Base de datos un recorrido cuesta mucha CPU y expulsa su caché de búfer, así que otras lecturas van a disco y las escrituras esperan. Durante el incidente El informe tumba la Base de datos, cada recorrido cuesta 10 veces más. Un Almacén de datos (Investigación de Almacenamiento de datos) saca los recorridos del primario. Cada recorrido tarda 1.5 s, el Almacén de datos no tiene límite de capacidad y un recorrido cuesta $0.02 por el índice de costes de la Era.',
    },
    'on-call': {
      term: 'Guardia',
      definition:
        'Una rotación de ingenieros que llevan el pager y atienden alertas fuera del horario laboral, para que un aviso llegue a una persona y no a quien casualmente esté mirando un cuadro de mando. Una buena rotación es tranquila, acotada y se paga en sueño.',
      inGame:
        'La Investigación de Rotación de guardia (Serie A, después de Alertas) pone al equipo en el pager. La rotación reconoce un Incidente cinco minutos de calendario después de su primera señal, así que el MTTA se mantiene corto incluso cuando el jugador está ausente, y el Postmortem lo muestra. Sin ella un aviso espera al primer clic del jugador. Cada aviso cuenta contra los ingenieros del equipo dueño del Servicio afectado, y cada aviso les quita un poco de ánimo. Un trimestre largo de guardia es una de las formas en que un ingeniero acaba pidiendo tiempo libre, un aumento o presentando su renuncia.',
    },
    'operating-margin': {
      term: 'Margen operativo',
      definition:
        'El beneficio operativo como proporción de los ingresos: (ingresos − costes operativos) / ingresos. Los costes operativos incluyen alojamiento, salarios y comisiones. Muestra cuánto de cada dólar de ingresos conserva el negocio después de pagar su propio funcionamiento.',
      inGame:
        'El margen es (ingresos − Gasto) / ingresos, donde el Gasto es la factura de la nube más salarios, Egress y comisiones de terceros. Sin ingresos marca −100%. El margen más el crecimiento anual de usuarios es tu Regla del 40, que fija el múltiplo de valoración: 4 + 0.15 × la Regla del 40, de 2 a 30. En la Era Cotizada en bolsa fijas una guía de margen del 10%, 20% o 30% cada trimestre. Superarla sube el múltiplo e incumplirla lo baja.',
    },
    'percentile-p50-p95-p99': {
      term: 'Percentil (p50, p95, p99)',
      definition:
        'El valor por debajo del cual cae una proporción dada de las mediciones. La latencia p50 (la mediana) es lo que ve una petición típica; el p99 es la latencia que el 99% de las peticiones mejora, así que 1 de cada 100 es más lenta. Los promedios ocultan los valores atípicos lentos, así que los SLO y las alertas suelen usar percentiles altos.',
      inGame:
        'Antes de la Investigación de Percentiles el HUD muestra la latencia media. Después, el HUD muestra el p99 y cada tipo de petición muestra su p50, p95 y p99. Las paradas del bucle de eventos y las pausas de GC afectan a cerca del 2% de las peticiones, así que elevan el p99 mientras la media y el p95 apenas se mueven. Con Alertas, la regla de latencia te avisa cuando el p99 de un tipo se mantiene por encima de 4 veces su objetivo de Apdex durante 30 s (el umbral por defecto). La gráfica de Latencia del Cuadro de mando dibuja el p99 junto a la media, así que puedes ver cuánto oculta la media.',
    },
    'point-in-time-recovery': {
      term: 'Recuperación a un punto en el tiempo',
      definition:
        'Restaurar una base de datos a su estado exacto en un momento elegido, cargando una copia de seguridad base y reproduciendo después el write-ahead log hasta esa hora. Como el log se archiva de forma continua, pierdes solo los últimos minutos de escrituras, no un día entero.',
      inGame:
        'La Investigación de Recuperación a un punto en el tiempo añade un ajuste de Copias de seguridad a la tarjeta de la Base de datos: Ninguno, Nocturno o PITR. Las instantáneas nocturnas pueden perder un día de calendario de escrituras y añaden un 5% al Gasto de la Base de datos. PITR pierde unos 2 minutos de calendario y añade un 15%. El Simulacro de DR de la lista de la IPO lee este RPO y solo pasa por debajo de 5 minutos, salvo que una réplica de otra región ya cubra los datos.',
    },
    'power-of-two-choices': {
      term: 'Power of two choices',
      definition:
        'Un método de balanceo de carga: elegir dos servidores al azar y enviar la petición al menos cargado. Mitzenmacher demostró que dos elecciones al azar reparten la carga exponencialmente mejor que una, y el balanceador no necesita una vista exacta y compartida de la carga de cada servidor. NGINX lo ofrece como random two least_conn.',
      inGame:
        'La Investigación de Algoritmos de balanceo de carga permite que un Balanceador de carga use Dos opciones. No guarda estado global, así que el propio Balanceador de carga gestiona 1.5 veces el tráfico. El coste es que el 10% del tráfico se reparte por igual sea cual sea la carga de cada servidor. Menos conexiones reparte por completo según la capacidad actual, pero no tiene bonificación de capacidad.',
    },
    'pre-fork-worker-model': {
      term: 'Modelo de workers pre-fork',
      definition:
        'Un diseño de servidor en el que un proceso maestro arranca de antemano un pool fijo de procesos worker, y cada worker gestiona una petición a la vez. Apache prefork, PHP-FPM y Gunicorn funcionan así. Aísla bien las peticiones, pero cada worker cuesta memoria, y una petición que espera retiene su worker.',
      inGame:
        'PHP-FPM y Gunicorn de Python ejecutan un pool de workers cuyo tamaño fijas de 1 a 400 en la tarjeta del Servidor de aplicaciones. PHP-FPM empieza con 5. Cada worker toma una petición, así que las llamadas lentas a la base de datos llenan el pool. Cada worker también cuesta RAM (120 MB en Gunicorn), así que un pool grande puede hacer swap. El modo Estático de PHP-FPM mantiene todo el pool residente. Los modos Dinámico y Bajo demanda ahorran memoria, pero el 2% o el 10% de las peticiones esperan 20 o 50 ms por un fork.',
    },
    'process-per-request': {
      term: 'Un proceso por petición',
      definition:
        'Un modelo de servidor en el que cada petición en curso ocupa un proceso worker completo hasta que termina, como en Apache prefork con mod_php, PHP-FPM y los workers síncronos de Gunicorn. Aísla bien las peticiones, pero cada petición en espera retiene un proceso y su memoria, así que el tamaño del pool y la RAM limitan cuántas peticiones se ejecutan a la vez.',
      inGame:
        'Apache mod_php, el runtime inicial, ejecuta un proceso por petición en curso, hasta 150. Cada proceso ocupa 60 MB porque incorpora PHP, así que la RAM se agota pronto. PHP-FPM y Gunicorn ejecutan un pool fijo cuyo tamaño fijas, y PHP-FPM empieza con 5 workers. Una petición retiene su worker mientras espera a la Base de datos, y un pool demasiado grande para la máquina hace swap hasta que el kernel lo mata. Cada proceso también retiene su propia conexión a la base de datos, así que un pool grande puede alcanzar el límite de 100 conexiones de Postgres.',
    },
    quantization: {
      term: 'Cuantización',
      definition:
        'Guardar los pesos de un modelo con menor precisión, como enteros de 8 o 4 bits en lugar de floats de 16 bits, para que el modelo use menos memoria y calcule más rápido, a costa de algo de calidad en las respuestas.',
      inGame:
        'La Investigación de Cuantización añade FP16, INT8 e INT4 a un Nodo GPU. INT8 sirve 2× los tokens e INT4 3×, y cada respuesta vale un 5% o un 15% menos. Compensa cuando la GPU es el cuello de botella y las respuestas pueden permitirse ser un poco peores.',
    },
    quorum: {
      term: 'Quórum',
      definition:
        'El número de réplicas que deben responder antes de que una lectura o una escritura se dé por hecha. Con N réplicas, quórum de lectura R y quórum de escritura W, R + W > N significa que cada lectura pregunta al menos a una réplica que tiene la última escritura. Eso no es linealizabilidad, porque las escrituras concurrentes, las escrituras fallidas y los quórums laxos aún pueden devolver valores antiguos.',
      inGame:
        'Un Almacén de columnas anchas guarda cada clave en N réplicas (de 1 a 5), y tú fijas R, las réplicas a las que pregunta una lectura, y W, las réplicas que espera una escritura. Con R + W > N, las lecturas nunca se pierden la última escritura. Un quórum más débil cuesta menos operaciones de réplica y espera una respuesta más temprana, pero algunas lecturas salen obsoletas. Un quórum que necesita todas las réplicas falla mientras se pierde una réplica. Incluso un quórum fuerte obtiene un 2% de pagos obsoletos y un 1% de pagos duplicados.',
    },
    raft: {
      term: 'Raft',
      definition:
        'Un algoritmo de consenso que mantiene idéntico un log replicado en un grupo de servidores. Un líder elegido añade cada entrada y la confirma cuando una mayoría la ha almacenado. Eso permite que el grupo siga funcionando cuando falla una minoría, y nunca confirma dos valores distintos. Ongaro y Ousterhout lo diseñaron en 2014 para que fuera más fácil de entender que Paxos; etcd y CockroachDB lo usan.',
      inGame:
        'El SQL distribuido ejecuta SQL sobre Raft, y lo desbloqueas con la Investigación de Bases de datos de consenso, que necesita Replicación síncrona. Cada escritura espera el viaje de ida y vuelta a una mayoría de las regiones por las que se reparte, mientras que una lectura pregunta al leaseholder y cuesta una cuarta parte de una escritura. Sirve 6,000 transacciones por segundo con tamaño 1. También mantiene un líder durante una Partición de red, así que con él ese Incidente es una cuarta parte de probable.',
    },
    'rate-limiting': {
      term: 'Limitación de tasa',
      definition:
        'Limitar cuántas peticiones puede hacer un cliente en un periodo y rechazar el resto, a menudo con HTTP 429 Too Many Requests. Protege un servicio del abuso, de los scrapers y de un cliente ruidoso, y permite a un proveedor repartir la capacidad de forma justa. Los algoritmos habituales son el token bucket, el leaky bucket y las ventanas fijas o deslizantes.',
      inGame:
        'La API de LLM te limita desde el lado del cliente: acepta 100 prompts por segundo por nivel de uso, y por encima de eso los prompts fallan de inmediato como throttled. El API Gateway aplica la misma idea a tus propios servicios. Eliges un tope en peticiones por segundo, y las peticiones que lo superan fallan como throttled. Es un tope para todo el Nodo, no un bucket por usuario o clave de API. La Investigación de Limitación de tasa convierte el tope en un token bucket que se rellena en cada Paso y admite 200 peticiones más, así que una ráfaga que cabe pasa entera. Para detener el tráfico abusivo, un WAF bloquea en cambio los bots por regla: el 80% de los bots con paranoia 2, bloqueando también al 0.5% de los usuarios reales.',
    },
    'read-replica': {
      term: 'Réplica de lectura',
      definition:
        'Una copia de una base de datos que sigue las escrituras del primario y responde consultas de solo lectura, lo que quita carga de lectura al primario. La replicación suele ser asíncrona, así que una réplica puede ir con retraso y devolver datos algo antiguos.',
      inGame:
        'La Investigación de Réplicas de lectura desbloquea la Réplica de lectura, que funciona como una Base de datos pero responde solo q-read y q-scan. Un informe que llega a una Base de datos y a una réplica va a la réplica, así que los recorridos dejan de expulsar la caché de búfer del primario. Añadir una no reinicia el primario, y su máquina factura un 30% menos que una Base de datos del mismo tamaño. Va con un retraso de 20 ms más 2 ms por cada escritura por segundo, y una de cada cuatro lecturas dentro de esa ventana de retraso es obsoleta: hasta el 15% de sus lecturas. Un Incidente de Retraso de replicación hace el retraso diez veces mayor. El enrutado read-your-writes envía al primario las lecturas que siguen a una escritura. Una réplica en otra región también limita cuántos datos pierdes si falla la región de origen.',
    },
    'read-your-writes-consistency': {
      term: 'Consistencia de lectura de tus propias escrituras',
      definition:
        'Una garantía de sesión: después de que un cliente escribe, sus propias lecturas posteriores ven esa escritura o una más nueva, aunque otros clientes sigan viendo datos antiguos. Importa cuando las lecturas van a réplicas que van por detrás del primario. Una solución habitual envía las lecturas de un usuario al primario durante un rato tras escribir. Terry y otros la definieron en 1994.',
      inGame:
        'Activa el enrutado Read-your-writes en un Servidor de aplicaciones, tras investigarlo, y las lecturas de los pagos van al primario, así que nunca están obsoletas. Las demás lecturas obsoletas bajan un 80%. Sin él, una Réplica de lectura va por detrás del primario, y una lectura obsoleta hace fallar una lectura de API o un pago que lee su propia escritura. La opción también hace mucho más raro el incidente Retraso de replicación (peso 0.3 en lugar de 2).',
    },
    'red-method': {
      term: 'Método RED',
      definition:
        'Rate, Errors y Duration para cada servicio: cuántas peticiones recibe, cuántas fallan y cuánto tardan. Mide lo que sienten los usuarios, así que las alertas lo vigilan. Tom Wilkie lo nombró como una versión a nivel de servicio de las cuatro señales doradas de Google.',
      inGame:
        'La fila de Servicios del Cuadro de mando (D) da la tasa, los errores y la duración de cada Servicio. El Cuadro de mando se abre tras la Investigación de Métricas. Su fila de Señales doradas grafica el tráfico, la latencia y, con Logs estructurados, los errores de todo tu sistema a lo largo del tiempo, así que usa esa fila para ver cuándo empezaron a sufrir los usuarios.',
    },
    'redos-regular-expression-denial-of-service': {
      term: 'ReDoS (denegación de servicio por expresión regular)',
      definition:
        'Una denegación de servicio en la que una entrada preparada hace que un motor de expresiones regulares con backtracking tarde un tiempo exponencial o larguísimo. Un solo patrón malo puede fijar un núcleo de CPU por petición.',
      inGame:
        'El incidente Backtracking de regex puede empezar desde la Serie B cuando tienes un WAF. Una regla nueva del WAF hace backtracking con entradas largas, así que cada WAF conserva solo el 10% de su capacidad y el tráfico que pasa por él falla o se encola. Pulsa Desactivar regla en el WAF para acabar con él de inmediato. En sistemas reales, un despliegue canary de reglas lo detecta antes de que llegue a todos los servidores.',
    },
    'replication-lag': {
      term: 'Retraso de replicación',
      definition:
        'El retraso entre que una escritura se confirma en la base de datos primaria y aparece en una réplica. Una réplica asíncrona aplica el log del primario a posteriori, así que el retraso crece con el volumen de escrituras, las consultas largas en la réplica y el retraso de red. Las lecturas de una réplica atrasada devuelven datos antiguos.',
      inGame:
        'Una Réplica de lectura va con un retraso de 20 ms más 2 ms por cada escritura por segundo, y una cuarta parte de sus lecturas en esa ventana piden una fila que una escritura acaba de cambiar, así que la parte que sale obsoleta es una cuarta parte del retraso en segundos, hasta el 15%. El incidente Retraso de replicación multiplica el retraso por 10, hasta un 50% de lecturas obsoletas. Las lecturas obsoletas hacen fallar las lecturas de API y los pagos, mientras que las vistas de página las aceptan. El enrutado Read-your-writes envía al primario las lecturas que lo necesitan.',
    },
    'retry-with-backoff-and-jitter': {
      term: 'Reintentos con backoff y jitter',
      definition:
        'Reintentar una llamada fallida tras una espera que crece con cada intento (backoff exponencial), con una dispersión aleatoria (jitter), para que los clientes que fallaron juntos no reintenten juntos. Un presupuesto o tope de reintentos limita cuántas llamadas extra pueden añadir los reintentos, para que no multipliquen la carga de un servicio que ya está en apuros.',
      inGame:
        'Con Tiempos de espera y reintentos investigados, fijas el timeout de cada Enlace en 1, 5 o 30 s y activas los reintentos. Los reintentos ingenuos se disparan de inmediato, hasta tres veces, así que un destinatario en el que falla una parte f recibe 1 + f + f² + f³ llamadas por llamada. El Backoff con jitter espera unos 200 ms por reintento y permite como mucho un 10% de llamadas extra, lo que mantiene pequeña una Tormenta de reintentos. Sin la Investigación, cada Enlace espera 30 s y nunca reintenta.',
    },
    'rpo-and-rto': {
      term: 'RPO y RTO',
      definition:
        'El objetivo de punto de recuperación (RPO) es lo más reciente que puedes permitirte perder de los datos en un desastre, medido como tiempo antes del fallo. El objetivo de tiempo de recuperación (RTO) es lo más que puede estar caído el servicio antes de que deba volver a funcionar. Juntos deciden cuánta capacidad de copia de seguridad, replicación y standby necesita un sistema.',
      inGame:
        'Las copias de seguridad de una Base de datos fijan su RPO: Ninguno lo pierde todo, Nocturno pierde hasta 1,440 minutos de calendario y PITR (Investigación de Recuperación a un punto en el tiempo) pierde 2 minutos. Una Réplica de lectura en otra región lo baja al retraso de esa réplica, y un Almacén de columnas anchas repartido o un SQL distribuido no pierde nada. El Simulacro de DR de la lista de la IPO hace fallar la región de origen. Solo pasa cuando los errores bajan del 1% en 60 minutos de calendario (RTO) y el RPO es inferior a 5 minutos.',
    },
    'rule-of-40': {
      term: 'Regla del 40',
      definition:
        'Una heurística para empresas de software como servicio: la tasa de crecimiento anual de ingresos más el margen de beneficio, ambos en porcentaje, debería ser al menos 40. Permite comparar con un solo número una empresa de crecimiento rápido y con pérdidas con otra lenta y rentable. Los inversores suelen pagar múltiplos de valoración más altos a las empresas por encima de 40.',
      inGame:
        'Tu Valoración es el ingreso anual por un múltiplo que sale de la puntuación de la Regla del 40: 4 + 0.15 × la puntuación, entre 2 y 30, con una puntuación negativa contada como 0. La puntuación es el crecimiento de usuarios de la última semana de calendario, anualizado, más el margen, que es (Ingresos − Gasto) / Ingresos. Una puntuación de 40 o más es un elemento de la lista de la IPO, así que recorta el Gasto o crece más rápido antes de salir a bolsa.',
    },
    runbook: {
      term: 'Runbook',
      definition:
        'Un documento corto y probado que dice qué hacer cuando salta una alerta concreta: qué comprobaciones ejecutar, qué comando lanzar, cuándo escalar. Un runbook que un sistema puede ejecutar por sí solo es automatización; uno que una persona lee a las 3 de la madrugada sigue mereciendo la pena escribirlo.',
      inGame:
        'La Investigación de Runbooks (Serie A, después de Rotación de guardia) y un equipo SRE con un ingeniero desbloquean Escribir un runbook, 10 Horas de desarrollo, para un tipo de incidente que el equipo ya ha terminado a mano. Una vez escrito, ese tipo se resuelve por sí solo en el primer Paso. El postmortem lo registra como automático, igual que cuando un Clúster reprograma un pod o un standby hace failover, y el logro Runbook lee ese registro.',
    },
    service: {
      term: 'Servicio',
      definition:
        'Una base de código con su propio pipeline de despliegue, propiedad de un equipo. Dividir un monolito en servicios permite que cada equipo publique y escale por su cuenta, al precio de un salto de red entre servicios y de fallos que pueden viajar entre ellos.',
      inGame:
        'Una Empresa empieza con un Servicio, el monolito, y toda Funcionalidad que ningún otro Servicio nombra se queda con él. La Investigación de Fronteras de servicio (Serie B) divide las Funcionalidades activas en un Servicio nuevo con un nombre y un equipo propietario, por 0.3 de la parte movida de la base de código en Horas de desarrollo. El propietario construye el backlog de ese Servicio y recibe el aviso cuando falla, y un mal despliegue falla solo el Servicio que lo publicó. Dos Servicios en una misma Base de datos aumentan la penalización de coordinación en una mitad más, así que k se multiplica por 1.5 hasta que un Servicio nombra su propio Nodo de Base de datos.',
    },
    sharding: {
      term: 'Sharding',
      definition:
        'Dividir un conjunto de datos entre varias bases de datos (shards) mediante una clave, como un hash del ID de usuario, para que cada shard almacene y sirva solo una parte de los datos. Escala las escrituras y el almacenamiento más allá de una máquina, pero una consulta que abarca shards debe preguntar a todos, y una clave caliente puede sobrecargar su shard mientras los demás están ociosos.',
      inGame:
        'La Investigación de Sharding divide una Base de datos en 1, 2, 4 u 8 shards por clave, y desbloquea la Replicación sin líder. Cada shard es otra máquina y factura como tal, y las escrituras se reparten entre ellos, así que dos shards responden el doble de escrituras. Las lecturas preguntan solo al shard que contiene su clave, por lo que una Réplica de lectura es lo que quita lecturas al primario. Una transacción entre shards cuesta tres veces su latencia. Eliges la clave de shard (hash, rango, tenant o región) en la tarjeta. Cambiar el número de shards es un resharding que cuesta Horas de desarrollo y tiempo de calendario por cada GB que contiene la Base de datos. El incidente Clave caliente afecta a una Caché o Almacén de columnas anchas, donde el 30% de las lecturas piden una sola clave, así que la capacidad del Nodo cae a cerca de 1 / (0.3 × pasos de tamaño + 0.7). Con Fan-out híbrido puedes dividir esas claves.',
    },
    'shared-nothing': {
      term: 'Shared nothing',
      definition:
        'Una arquitectura en la que los nodos, o las peticiones, no comparten memoria ni disco y se coordinan solo por la red, de modo que cada uno puede fallar, reiniciarse o escalar por su cuenta. Michael Stonebraker la defendió para bases de datos en 1986. PHP aplica la idea por petición: cada petición empieza con un estado de proceso limpio y lo libera todo al terminar.',
      inGame:
        'Apache mod_php y PHP-FPM son shared nothing: liberan toda la memoria tras cada petición, así que el incidente Fuga de memoria nunca los elige. Todos los demás runtimes conservan sus procesos entre peticiones, lo que evita la preparación por petición pero puede provocar fugas. El precio es la velocidad, porque PHP funciona a 0.15 veces la velocidad de CPU de Go, o 0.375 con OPcache.',
    },
    'slo-sla-sli': {
      term: 'SLO, SLA, SLI',
      definition:
        'Un indicador de nivel de servicio (SLI) es una medición del comportamiento del servicio, como la proporción de peticiones que tienen éxito. Un objetivo de nivel de servicio (SLO) es una meta para un SLI durante una ventana, como el 99.9% en 30 días. Un acuerdo de nivel de servicio (SLA) es un contrato con los clientes que fija consecuencias, como créditos de servicio, cuando no se cumple un nivel prometido; suele ser más laxo que el SLO interno.',
      inGame:
        'El SLI es la disponibilidad: la proporción de peticiones de usuarios atendidas durante la última semana de calendario, sin contar bots ni bloqueos del WAF. Cada Era fija el SLO, del 99% en Garaje al 99.99% al cotizar en bolsa, y desde la Serie A los fallos que permite son tu presupuesto de errores. Los Cuadros de mando de SLO ponen ese presupuesto en el HUD, y la lista de la IPO necesita el 99.95%. B2B SaaS firma un SLA desde la Serie B, un nivel por encima del objetivo de su Era. Mientras una semana queda por debajo, las ventas Enterprise devuelven créditos a los clientes: el 10% de los ingresos por suscripción.',
    },
    'soc-2': {
      term: 'SOC 2',
      definition:
        'Un marco de auditoría del AICPA. Un auditor independiente informa sobre los controles de una organización de servicios en seguridad, disponibilidad, integridad del procesamiento, confidencialidad y privacidad. Los clientes enterprise suelen exigir un informe SOC 2.',
      inGame:
        'SOC 2 es un elemento de la lista de la IPO de Pre-IPO. Necesita la Investigación del Programa SOC 2, que necesita TLS en todas partes, Cifrado en reposo y Escaneo de dependencias, y necesita un Equipo de seguridad con un ingeniero. Sin ese equipo, un Incidente Hallazgo de auditoría puede reiniciar un Simulacro de DR superado.',
    },
    'spot-instance': {
      term: 'Instancia spot',
      definition:
        'Capacidad de nube sobrante vendida con un gran descuento, de hasta el 90% sobre el precio bajo demanda, que el proveedor puede retirar cuando necesite la capacidad. AWS da un aviso de interrupción de dos minutos. Spot encaja con trabajo sin estado y tolerante a fallos, como trabajos por lotes y servidores tras un balanceador de carga con capacidad de sobra, no con una base de datos única.',
      inGame:
        'El precio Spot hace funcionar un Nodo a 0.3× el precio bajo demanda, pero el proveedor puede reclamarlo. Un Incidente Interrupción de spot avisa durante 10 segundos de simulación y luego tumba el Nodo, y pasar el Nodo a bajo demanda dentro del aviso lo cancela. Un Nodo reservado cuesta 0.6× y se mantiene durante una semana de calendario. El incidente Escasez de GPU es distinto: el proveedor reclama un Nodo GPU, primero los H100, y una API de LLM como alternativa lo hace una cuarta parte de probable.',
    },
    'strangler-pattern': {
      term: 'Patrón strangler',
      definition:
        'Reemplazar un sistema heredado pieza a pieza: poner una capa de enrutado delante, enviar una parte creciente del tráfico o de las funcionalidades al sistema nuevo y retirar el antiguo cuando nada lo usa. Martin Fowler lo nombró por la higuera estranguladora, una enredadera que crece alrededor de un árbol hasta sustituirlo. Evita una reescritura arriesgada de golpe.',
      inGame:
        'Cambiar el Stack de un Servicio en una Empresa inicia una migración que ejecuta ambas versiones y pasa los Servidores de aplicaciones en cuatro pasos: 5%, 25%, 50% y luego 100% del tráfico. Cada paso cuesta su parte de las Horas de desarrollo de la migración (10%, 20%, 30%, 40%). Las peticiones en el Stack nuevo fallan el 3% de las veces hasta que publicas Corregir errores de migración, y las Funcionalidades del Servicio en migración se construyen a la mitad de velocidad.',
    },
    'synchronous-replication': {
      term: 'Replicación síncrona',
      definition:
        'Replicación en la que el primario confirma una escritura solo después de que al menos una réplica también la ha almacenado. Ninguna escritura confirmada se pierde si falla el primario, pero cada escritura espera el viaje de ida y vuelta hasta la réplica.',
      inGame:
        'La Investigación de Replicación síncrona añade un interruptor a cada Réplica de lectura. Con él activado, cada escritura espera a esa réplica, así que la réplica nunca se retrasa y cada escritura paga su viaje de ida y vuelta. La Investigación también desbloquea las Bases de datos de consenso, y el SQL distribuido espera a una mayoría de sus réplicas en cada escritura, así que las escrituras entre regiones pagan el viaje de ida y vuelta. Una Base de datos con un Standby también hace failover en segundos cuando falla su zona.',
    },
    'tail-at-scale': {
      term: 'Tail at scale',
      definition:
        'Cuando una petición se abre en abanico hacia muchos servidores o espera muchas respuestas, la respuesta más lenta fija su latencia, así que un retraso que es raro en cada servidor se vuelve común para la petición completa. Con 100 servidores, cada uno lento el 1% de las veces, el 63% de las peticiones se encuentra con al menos una respuesta lenta. Dean y Barroso lo describieron en 2013, con soluciones como las peticiones especulativas (hedged requests).',
      inGame:
        'Una petición recoge los eventos de cola de cada Nodo de su ruta. Dos probabilidades independientes a y b se combinan en 1 − (1 − a)(1 − b), así que una cadena larga de Nodos que se atascan de vez en cuando tiene un p99 peor que cualquiera de ellos. La lectura de un Almacén de columnas anchas espera a la R-ésima más rápida de las N réplicas, y con R = N espera a la más lenta. La Investigación de Percentiles muestra el p99 donde esto aparece.',
    },
    'tech-debt': {
      term: 'Deuda técnica',
      definition:
        'Atajos y diseño obsoleto en el código que hacen más lento o más arriesgado cada cambio posterior, como los intereses de un préstamo, hasta que el equipo salda la deuda refactorizando. Ward Cunningham acuñó la metáfora en 1992. Parte de la deuda es un compromiso deliberado para publicar antes; su coste es el esfuerzo extra que añade a cada cambio posterior.',
      inGame:
        'Cada Servicio tiene un porcentaje de deuda técnica. Cada Funcionalidad publicada añade 6 puntos con Avanzar rápido, 3 con Equilibrado o 1 con Calidad. Añade 1 más sin framework, y una tarea publicada durante un Incidente añade 2. Un elemento apresurado añade 2 puntos por cada coste de elemento completo que pagó el pool. La deuda reduce la velocidad hasta la mitad, aumenta hasta 3 veces la probabilidad de un mal despliegue y hace más probable cada Incidente. La tarea Refactorizar (10 Horas de desarrollo) quita 20 puntos, y la política Calidad amortiza algo por sí sola.',
    },
    'thread-pool': {
      term: 'Pool de hilos',
      definition:
        'Un conjunto fijo de hilos que toman trabajo de una cola compartida, para que un programa no pague por crear un hilo por tarea. En un servidor de un hilo por petición, el tamaño del pool limita cuántas peticiones se ejecutan a la vez, y una petición que espera E/S sigue reteniendo su hilo.',
      inGame:
        'Tomcat de Java ejecuta 200 hilos en una JVM, y Puma de Ruby ejecuta 5 hilos por proceso. Cada petición en espera retiene un hilo, así que las llamadas lentas a la base de datos pueden llenar el pool. En Node.js, la Investigación del Pool de hilos de libuv saca el hash de contraseñas del bucle de eventos, así que los inicios de sesión dejan de detener otras peticiones. Tokio de Rust ejecuta tareas asíncronas en un pool de hilos worker, así que una tarea que usa mucha CPU bloquea solo uno de ellos.',
    },
    'thundering-herd': {
      term: 'Efecto estampida',
      definition:
        'Muchos clientes o procesos se despiertan y actúan en el mismo momento, por ejemplo tras un reinicio, una expiración de caché o un temporizador compartido, y su carga combinada desborda un recurso compartido. Las soluciones dispersan la manada: jitter, coalescencia de peticiones y reinicios escalonados.',
      inGame:
        'El incidente Estampida de caché reinicia una Caché vacía, y cada fallo va a la Base de datos a la vez. Mientras la Base de datos funciona al 90% o más, los rellenos caducan y la Caché sigue fría. La protección contra estampidas deja que una Caché fría reenvíe solo el 25% de sus fallos extra mientras el resto espera a una sola búsqueda, y el Precalentamiento de caché devuelve la Caché al 80% de calor. Los reintentos ingenuos también son una manada, porque cada llamante reintenta a la vez, y el Backoff con jitter los dispersa.',
    },
    'tiered-caching': {
      term: 'Caché en niveles',
      definition:
        'Una configuración de CDN en la que las ubicaciones de borde preguntan a un conjunto más pequeño de cachés regionales o de nivel superior antes que al origen. Los bordes comparten lo que guarda el nivel superior, así que la tasa de aciertos sube y llegan menos peticiones al origen.',
      inGame:
        'La Investigación de Caché por niveles (después de Entrega de contenido) hace que los bordes de la CDN pregunten a un nivel regional antes que a tu origen, lo que sube del 75% al 92% la parte de las peticiones de medios que una CDN responde con el TTL por defecto. El vídeo que responde la CDN no carga tus Servidores de aplicaciones, y se factura al precio más barato de Egress del borde.',
    },
    timeout: {
      term: 'Tiempo de espera',
      definition:
        'El tiempo máximo que un llamante espera una respuesta antes de rendirse. Un timeout libera el hilo o la conexión del llamante, así que una dependencia lenta no puede retenerlo para siempre, pero un timeout demasiado corto hace fallar llamadas que habrían funcionado.',
      inGame:
        'Un Enlace espera 30 s una respuesta, y la Investigación de Tiempos de espera y reintentos te permite fijar el timeout de cada Enlace en 1, 5 o 30 s. Un llamante retiene su hueco solo hasta el timeout, así que un timeout corto evita que una Base de datos lenta llene todos los huecos de los Servidores de aplicaciones, y las llamadas que lo superan fallan como timeouts. Un cobro que caduca y se reintenta puede cobrar dos veces hasta que tengas Claves de idempotencia.',
    },
    'tls-certificate': {
      term: 'Certificado TLS',
      definition:
        "Un archivo firmado que vincula un nombre de dominio con una clave pública, emitido por una autoridad de certificación. Los navegadores lo comprueban antes de abrir una conexión HTTPS y rechazan el sitio cuando caduca. Los certificados duran poco, así que los equipos los renuevan automáticamente, por ejemplo con ACME y Let's Encrypt.",
      inGame:
        'La Investigación de Automatización de certificados desbloquea Secretos y certificados. Cada Nodo que termina TLS (Balanceador de carga, CDN, WAF, API Gateway, Hub en tiempo real, Función edge) tiene su propio certificado, que dura 90 días de calendario, o 45 desde la Serie C. Mientras un gestor funciona, emite cada certificado en el primer Paso y lo renueva a los dos tercios de su vida. Sin un gestor en funcionamiento, los certificados caducan uno a uno. Toda petición que pasa por un Nodo cuyo certificado caducó falla como caída y empieza el incidente Certificado caducado, hasta que un gestor vuelva a funcionar o pulses Renovar.',
    },
    'token-bucket': {
      term: 'Token bucket',
      definition:
        'Un algoritmo de limitación de tasa. Un bucket guarda hasta B tokens y se rellena a una tasa fija r; cada petición toma un token, y una petición que encuentra el bucket vacío espera o es rechazada. Permite ráfagas cortas de hasta B mientras mantiene el promedio a largo plazo en r.',
      inGame:
        'Un Nodo Burstable funciona con un token bucket de créditos de CPU. Gana créditos mientras usa menos del 20% de su vCPU, acumula hasta 100 núcleo-segundos por vCPU y los gasta para funcionar por encima de esa base. Cuando el bucket está vacío cae al 20% de CPU, así que una máquina Burstable que funciona al límite todo el día se atasca. A cambio cuesta 0.4 veces una máquina General. La Investigación de Limitación de tasa del API Gateway le da el mismo bucket: 200 peticiones de ráfaga además de su tope.',
    },
    'transactional-outbox': {
      term: 'Outbox transaccional',
      definition:
        'Una forma de actualizar una base de datos y publicar un evento sin perder ninguno de los dos. El servicio escribe el cambio y una fila de outbox en la misma transacción de base de datos, y un relay aparte lee el outbox y publica cada evento en el broker de mensajes, al menos una vez. Evita el problema de la doble escritura, en el que la confirmación en la base de datos tiene éxito y la publicación falla, o al revés.',
      inGame:
        'Desde la Serie B, la doble escritura de la app pierde de vez en cuando una publicación, así que el 0.5% de las respuestas de un Motor de búsqueda están obsoletas. La Investigación de Outbox transaccional lleva esa proporción a cero, y también lo hace un Conector CDC, que lee el cambio del log de la base de datos. Ninguno cambia una Cola: un Servidor de aplicaciones enlazado a una Cola entrega la parte asíncrona de las peticiones lentas a Workers, y los usuarios esperan solo a que se encole.',
    },
    'use-method': {
      term: 'Método USE',
      definition:
        'Utilización, Saturación y Errores (Utilization, Saturation, Errors) de cada recurso, como la CPU, la memoria o un pool de conexiones. Mide causas, no síntomas: un recurso al 100% con trabajo esperando es el probable cuello de botella. Brendan Gregg lo describió como una lista de comprobación para el análisis de rendimiento.',
      inGame:
        'La fila de Saturación del Cuadro de mando muestra la utilización de cada Nodo como un indicador de barra, una línea de tiempo de estados y una tabla, así que puedes ver qué Nodo se llenó primero. La fila de Recursos, con profiling, nombra el recurso limitante. En el Tablero, la barra de Carga de cada tarjeta de Nodo muestra la misma utilización en vivo.',
    },
    utilization: {
      term: 'Utilización',
      definition:
        'La proporción de la capacidad de un recurso que está en uso durante un periodo: el trabajo ofrecido dividido entre la capacidad. El retraso por cola crece bruscamente cuando la utilización se acerca al 100%: en una cola M/M/1 simple la espera es proporcional a ρ / (1 − ρ), así que pasar del 50% al 90% de ocupación multiplica la espera por 9.',
      inGame:
        'Cada Nodo muestra su utilización: el trabajo ofrecido sobre la capacidad de su límite más estrecho, ya sea CPU, huecos, memoria, conexiones o red. El retraso por cola crece como ρ / (1 − ρ). El Nodo avisa al 70%, muestra peligro al 90% y descarta el exceso por encima del 100%. La búsqueda del Cuello de botella solo considera Nodos por encima del 60%, y un Autoescalador apunta al 40%, 60% u 80%. La fila de Saturación del Cuadro de mando muestra cada Nodo como un indicador y como una línea de tiempo de 24 horas, con las mismas líneas del 70% y el 90%.',
    },
    'vertical-and-horizontal-scaling': {
      term: 'Escalado vertical y horizontal',
      definition:
        'El escalado vertical (scaling up) mueve una carga a una máquina más grande con más CPU y memoria. El escalado horizontal (scaling out) añade más máquinas y reparte el trabajo entre ellas. Escalar hacia arriba es sencillo pero tiene un techo y suele requerir un reinicio; escalar hacia fuera necesita un balanceador de carga y servidores sin estado, pero no tiene techo duro y sobrevive a la pérdida de una máquina.',
      inGame:
        'Cambiar el tamaño de un Nodo con tamaño lo mueve un paso entre nano (0.5 vCPU) y metal (96 vCPU). Cada paso duplica vCPU y RAM, pero el Nodo se reinicia y vuelve en frío. Algunos programas no pueden usar los núcleos extra: Node.js ejecuta un bucle de eventos en un núcleo, y Redis responde en un hilo. Para escalar hacia fuera, pon más Servidores de aplicaciones tras el DNS o un Balanceador de carga, y cada copia cuesta un 25% más de colocar, o deja que un Autoescalador añada copias, que tardan 180 s en VMs o 30 s en un Clúster de Kubernetes. La familia de instancia también importa. La Investigación de Instancias ARM añade una familia con los vCPU y la RAM de General por 0.8× el precio, que funciona a 0.95× la velocidad de CPU.',
    },
    'waf-web-application-firewall': {
      term: 'WAF (firewall de aplicaciones web)',
      definition:
        'Un filtro delante de una aplicación web que inspecciona las peticiones HTTP y bloquea las que coinciden con reglas de ataque o de bots. Los conjuntos de reglas más estrictos detectan más ataques y también bloquean por error a más usuarios reales (falsos positivos).',
      inGame:
        'La Investigación de Firewall de aplicaciones web desbloquea el Componente WAF. Su nivel de paranoia fija la parte de peticiones de bots que bloquea y la parte de usuarios reales que bloquea por error: el nivel 1 bloquea el 60% de los bots y el 0.1% de los usuarios, el nivel 2 (el predeterminado) el 80% y el 0.5%, el nivel 3 el 92% y el 2%, el nivel 4 el 98% y el 6%. Los niveles más altos cuestan más CPU por petición, hasta 4 veces el nivel 1. La Investigación de Gestión de bots lanza un desafío a un cliente sospechoso en lugar de bloquearlo, lo que reduce a la mitad los falsos positivos y mantiene la tasa de bloqueo. En modo Bajo ataque, el WAF bloquea el 99% de los bots y el 1% de los usuarios y añade 40 ms.',
    },
    'write-through-cache': {
      term: 'Caché write-through',
      definition:
        'Una política de caché en la que cada escritura va a la caché y a la base de datos a la vez, así que la caché siempre tiene el último valor de las claves escritas por ese camino. Las lecturas aciertan más y nunca están obsoletas para esas claves, pero cada escritura es más lenta y la caché se llena de datos que quizá nunca se lean. Cache-aside y write-behind son las alternativas habituales.',
      inGame:
        'Write-through es una de las estrategias de la Caché una vez investigadas las Estrategias de caché. Una escritura va a la Caché y a la Base de datos a la vez, así que la Caché nunca sirve un acierto obsoleto para una clave escrita por ese camino, y cada escritura paga medio milisegundo más. Una Caché cache-aside invalida las claves al escribir, así que su tasa de aciertos cae el doble de la proporción de escrituras, como mucho a la mitad. Entre invalidaciones algunos aciertos están obsoletos, del 0.5% al 10% por unidad de proporción de escrituras a medida que el TTL crece de 10 s a 1 hora.',
    },
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
