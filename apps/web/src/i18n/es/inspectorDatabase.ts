import type { Messages } from '../messages.ts'

export const inspectorDatabase: Messages['inspectorDatabase'] = {
  volume: 'Volumen',
  iOPSAtTheBoxSBurn: (p0: string | number | null, p1: string | number | null) =>
    `${p0} IOPS a ${p1}× el gasto de la máquina. Las lecturas que no aciertan en la caché de búfer y todas las escrituras la esperan.`,
  topology: 'Topología',
  singlePrimary: 'Primario único',
  sharded: 'Con sharding',
  multiLeader: 'Multi-leader',
  onePrimaryAReadReplicaIs:
    'Un solo primario: es la réplica de lectura la que le quita las lecturas.',
  topologySharded:
    'Con sharding: cada base de datos guarda su partición de las filas. Mantén las transacciones dentro de un solo shard cuando puedas; una transacción entre shards falla en cualquier shard que toque, y los informes leen todos los shards.',
  topologyMulti:
    'Multi-leader: cada base de datos guarda todas las filas y acepta escrituras. La certificación descarta las escrituras en conflicto y gana el primer commit.',
  topologySingle:
    'Primario único: una base de datos acepta escrituras y una réplica de lectura acepta lecturas. Una caja une dos o más bases de datos en un grupo de datos.',
  leader: 'Primario',
  dataGroup: 'Grupo de datos',
  readReplicas: 'Réplicas de lectura',
  noReadReplicas:
    'Ninguna. Enlaza una réplica de lectura a esta base de datos para quitarle lecturas.',
  secondDatabaseFollows:
    'Encierra esta base de datos en una caja con otra para formar un grupo de datos. El grupo guarda sus filas de una sola manera.',
  promote: 'Promover a primario',
  promoteNote:
    'La réplica pasa a ser el primario y el antiguo primario, su réplica. Una réplica asíncrona aún tenía escrituras en vuelo, así que la promoción las pierde; una síncrona no pierde ninguna.',
  shards: 'Shards',
  shardKey: 'Clave de shard',
  reports: 'Informes',
  scanTheTable: 'Escanear la tabla',
  materializedView: 'Vista materializada',
  halfTheScanCPUAndThe:
    'La mitad de CPU de escaneo, y las cifras son tan viejas como el último refresco.',
  everyReportScansTheTableItself:
    'Cada informe escanea la tabla entera. Investiga Vistas materializadas para guardar una.',
  retention: 'Retención',
  oldRowsMoveToCheapStorage:
    'Las filas viejas pasan a almacenamiento barato: la factura baja y un informe espera a la restauración.',
  oldRowsAreGoneTheBill:
    'Las filas viejas ya no están: la factura baja y un informe reconstruye sus cifras al triple del coste de escaneo.',
  everyRowStaysOnTheFast: 'Cada fila se queda en el nivel rápido y se paga.',
  backups: 'Copias de seguridad',
  noBackupALostTableIs: 'Sin copia de seguridad: una tabla perdida está perdida para siempre.',
  aRestoreFailedThisBackupWould:
    'Una restauración falló: esta copia lo perdería todo. Haz otro simulacro.',
  thisBackupRestoresDrillItAgain:
    'Esta copia se restaura. Haz otro simulacro tras un cambio, o investiga Simulacros de restauración.',
  restoreDrillDH: (p0: string | number | null) => `Simulacro de restauración · ${p0} DH`,
  theBusiestShardTakes: (
    hot: string | number,
    cross: string | number,
    cpu: string | number,
    scatter: string | number,
  ) =>
    `El shard más ocupado recibe el ${hot}% de las escrituras. El ${cross}% de las transacciones abarcan varios shards, así que cuestan hasta 3× y pueden fallar en cualquier shard. Los informes y las búsquedas tocan todos los shards: +${cpu}% de CPU y +${scatter}.`,
  usersInOtherRegionsWait: (wait: string | number) =>
    `Los usuarios de otras regiones esperan ${wait} más.`,
  writesDivideAcross: (shards: string | number, devHours: string | number) =>
    `Las escrituras se reparten entre ${shards} shards, y cada uno factura. Cambiar el número o la clave exige ${devHours} horas de desarrollo y una copia de los datos que reduce a la mitad los IOPS del volumen.`,
}
