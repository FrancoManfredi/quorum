import type { Messages } from '../messages.ts'

/** A teammate signs with their first name. */
const first = (name: string | number | null | undefined): string => String(name).split(' ')[0] ?? ''

export const mail: Messages['mail'] = {
  letters: {
    'advice.credits': [
      ({ from, node }) => ({
        subject: `[Acción necesaria] ${node}: el saldo de créditos de CPU es 0`,
        body: `Estimado cliente:\n\nSu recurso Burstable ${node} ha agotado su saldo de créditos de CPU y ahora está limitado al 20% de CPU.\n\nCómo funcionan los créditos: una instancia Burstable gana créditos mientras se ejecuta por debajo del 20% de cada núcleo y los gasta al superarlo. La suya lleva un tiempo por encima.\n\nAcciones recomendadas:\n- Cambiar el tamaño de ${node}\n- O moverlo fuera de Burstable, por ejemplo a la familia General\n\nEste buzón no se supervisa.\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `Su ${node} está en las últimas`,
        body: `Hola:\n\nUn aviso rápido de su equipo de cuentas en ${from}. ${node} gastó todos los créditos de CPU que tenía, así que, con toda la cortesía, lo hemos bajado al 20% de CPU hasta que gane más. Solo los gana cuando está inactivo por debajo del 20% de cada núcleo, cosa que, a juzgar por su tráfico, no va a ocurrir.\n\nCambie su tamaño o sáquelo de Burstable a algo como General, y podrá volver a ir a tope.\n\nCon cariño (y con un descuento que no podemos ofrecerle),\nSu asociado de Customer Success`,
      }),
      ({ node }) => ({
        subject: `EVENTO: CPU_CREDITS_EXHAUSTED (${node})`,
        body: `Tipo de evento: CPU_CREDITS_EXHAUSTED\nRecurso: ${node}\nEstado: Abierto\nImpacto: CPU limitada al 20%\n\nDescripción: este recurso Burstable gasta créditos por encima del 20% de cada núcleo y los gana por debajo. El saldo ahora es cero.\n\nResolución: cambie el tamaño del recurso o cambie su familia de Burstable (por ejemplo, a General).\n\nNo es necesario responder. No es posible responder.`,
      }),
      ({ from, node }) => ({
        subject: `Re: re: sobre la puntuación de crédito de ${node}`,
        body: `Hola:\n\nLamentamos informarle de que ${node} tiene una puntuación de créditos de CPU de cero. Como muchos de nosotros, compró más de lo que ganó.\n\nUn nodo Burstable ahorra créditos siempre que se ejecuta por debajo del 20% de cada núcleo y los gasta al superarlo. Arruinado, ahora vive con un presupuesto estricto del 20% de CPU.\n\nDos salidas: cámbiele el tamaño o retírelo de Burstable a una familia que no racione, como General.\n\nGracias por elegir ${from}. Tenía opciones. Ahora menos.`,
      }),
      ({ from, node }) => ({
        subject: `${node}, limitado al 20% (en vista previa)`,
        body: `¡Saludos de ${from}!\n\nNos entusiasma informarle de que ${node} se ha inscrito en nuestra experiencia de Throttling. Se quedó sin créditos de CPU y ahora se ejecuta al 20% de CPU.\n\nContexto: las instancias Burstable acumulan créditos por debajo del 20% de cada núcleo y los queman al superarlo.\n\nPara darse de baja de la experiencia, cambie el tamaño de ${node} o cámbielo a una familia que no sea Burstable, como General.\n\n¡Nos encantaría conocer su opinión! La opinión también está en vista previa.`,
      }),
    ],
    'advice.memory': [
      ({ from, node }) => ({
        subject: `${node} se ha quedado sin memoria y está haciendo swap`,
        body: `Estimado cliente:\n\nNuestra monitorización muestra que ${node} ha usado toda su RAM y ahora está haciendo swap al disco. Las peticiones a este recurso irán lentas.\n\nPuede:\n1. Cambiar el tamaño de ${node}\n2. Elegir la familia Memory\n3. Reducir el pool\n\nAgradecemos su negocio. Lo agradecemos más cada mes.\n\nEl equipo de Service Health de ${from}`,
      }),
      ({ node }) => ({
        subject: `Service Health: presión de memoria en ${node}`,
        body: `Declaración de impacto: a partir de un momento sin especificar, ${node} se quedó sin RAM. El sistema operativo está enviando páginas de memoria al disco mediante swap, y ahora todo en la máquina espera por ello.\n\nEstado actual: en curso. Estamos investigando por qué aún no lo ha arreglado.\n\nMitigación: cambie el tamaño del recurso, muévalo a la familia Memory o reduzca el pool para que necesite menos RAM.\n\nPróxima actualización: cuando actúe.`,
      }),
      ({ from, node }) => ({
        subject: `El swap no es una ampliación de memoria`,
        body: `Hola:\n\n${node} se ha quedado sin RAM. Está haciendo swap, lo que significa que finge que el disco es memoria, y el disco no está disfrutando del papel.\n\nDéle espacio: cámbiele el tamaño, elija la familia Memory o reduzca el pool.\n\nUn saludo,\nEquipo de cuentas, ${from}\n\nP. D.: Su factura no se quedó sin memoria. Lo recuerda todo.`,
      }),
      ({ from, node }) => ({
        subject: `ALERTA ${node} mem=100% swap=activo`,
        body: `ALARMA: “${node}-memory” está en estado ALARM.\n\nMotivo: RAM usada por completo; el nodo está haciendo swap.\n\nSoluciones sugeridas, sin ningún orden:\n- Cambiar el tamaño\n- Familia Memory\n- Reducir el pool\n\nRecibe este aviso porque es cliente de ${from}, algo que aceptó en la página 41 de un documento que no leyó.`,
      }),
      ({ from, node }) => ({
        subject: `Una nota amable sobre la memoria de ${node}`,
        body: `Hola desde ${from}:\n\nEsperamos que este correo le encuentre bien. No estamos tan seguros de que encuentre bien a ${node}: se quedó sin RAM y lleva un tiempo haciendo swap.\n\nCuando una máquina hace swap, cada petición espera al disco. Sus usuarios lo notan antes que usted.\n\nCambiar el tamaño del nodo, elegir la familia Memory o reducir el pool le darán un respiro.\n\nUn cordial saludo,\nSu Technical Account Manager dedicado (compartido)`,
      }),
    ],
    'advice.memory-shared': [
      ({ from, node }) => ({
        subject: `${node}: Postgres y su aplicación comparten la misma RAM`,
        body: `Estimado cliente:\n\n${node} se ha quedado sin RAM y está haciendo swap. La causa: Postgres se ejecuta en la misma máquina que su aplicación, y ambos quieren la memoria.\n\nAcción recomendada: coloque una Base de datos y enlace ${node} a ella, para que Postgres tenga un hogar propio.\n\nGracias por construir sobre ${from}.\nEste buzón no se supervisa.`,
      }),
      ({ node }) => ({
        subject: `Conflicto de convivencia detectado en ${node}`,
        body: `Hola:\n\nSu aplicación y Postgres han estado compartiendo ${node} como dos personas que comparten un refrigerador. El refrigerador es la RAM, y está lleno. El nodo está haciendo swap al disco.\n\nLa solución es darle a Postgres su propio sitio: coloque una Base de datos y enlace ${node} a ella.\n\nNo hace falta depósito de garantía.\n\nSu Solutions Architect`,
      }),
      ({ from, node }) => ({
        subject: `Evento de salud: ${node} hace swap (base de datos colocalizada)`,
        body: `Evento: MEMORY_EXHAUSTED_COLOCATED\nRecurso: ${node}\nCausa raíz: Postgres comparte la máquina con la aplicación. La memoria combinada supera la RAM; el nodo está haciendo swap.\n\nRemediación: coloque una Base de datos y enlace el nodo a ella.\n\nEste aviso lo generó ${from}. No es un contrato, una promesa ni una persona.`,
      }),
      ({ from, node }) => ({
        subject: `Una idea rápida sobre ${node}`,
        body: `Hola:\n\nLe señalo algo desde nuestro lado en ${from}: ${node} se ha quedado sin RAM y está haciendo swap. Mirando de cerca, Postgres vive en la misma máquina que la aplicación, así que cada consulta y cada petición compiten por la misma memoria.\n\nLo vemos mucho en configuraciones iniciales, y es la decisión correcta al principio. Deja de serlo más o menos ahora.\n\nColoque una Base de datos y enlace ${node} a ella. Su aplicación recupera su RAM y Postgres obtiene una máquina solo para él.\n\nEncantados de tener una llamada (las llamadas están en vista previa).\n\nUn saludo,\nSu equipo de cuentas`,
      }),
      ({ node }) => ({
        subject: `Dos inquilinos, un ${node}, cero RAM libre`,
        body: `Aviso de agotamiento de memoria.\n\nEl recurso ${node} aloja tanto la aplicación como Postgres. Juntos han usado toda su RAM y el recurso ahora está haciendo swap.\n\nLa configuración admitida es un Postgres por Base de datos: coloque una Base de datos y enlace ${node} a ella.\n\nLamentamos cualquier inconveniente. No hemos causado ningún inconveniente; solo nos disculpamos por adelantado.`,
      }),
    ],
    'advice.network': [
      ({ from, node }) => ({
        subject: `${node} ha alcanzado la velocidad de línea de su red`,
        body: `Estimado cliente:\n\n${node} está enviando tantos bytes como puede mover su tarjeta de red. Está a la velocidad de línea, y el tráfico adicional se pondrá en cola.\n\nOpciones:\n- Cambiar el tamaño de ${node} para tener una tarjeta de red más rápida\n- Añadir una copia detrás de un Balanceador de carga para repartir el tráfico\n\nEl egress se factura por byte. Nos hemos dado cuenta.\n\nEl equipo de ${from}`,
      }),
      ({ node }) => ({
        subject: `La tubería está llena`,
        body: `Hola:\n\nVersión corta: la tarjeta de red de ${node} mueve todos los bytes que puede. Eso es la velocidad de línea, y no hay línea después.\n\nCambie su tamaño o ponga una copia detrás de un Balanceador de carga para que dos tarjetas se repartan el trabajo.\n\nGracias,\nRedes (somos los primeros a los que culpa)`,
      }),
      ({ from, node }) => ({
        subject: `Service Health: saturación de rendimiento, ${node}`,
        body: `Título: saturación de red en ${node}\nGravedad: advertencia\nRegión: una de las nuestras. Está operativa, lo que reduce las opciones.\n\nResumen: el tráfico de salida de ${node} ha alcanzado la velocidad de línea de su tarjeta de red.\n\nAcción del cliente: cambie el tamaño del recurso o añada una copia detrás de un Balanceador de carga.\n\nService Health de ${from}`,
      }),
      ({ from, node }) => ({
        subject: `¡Enhorabuena por su tráfico!`,
        body: `¡Hola!\n\nBuenas noticias de ${from}: la gente tiene muchas ganas de descargar cosas de ${node}. Tantas que su tarjeta de red ahora envía bytes tan rápido como físicamente puede.\n\nNoticias menos buenas: ese es el techo. Todo lo demás espera en la cola.\n\nPara subir el techo, cambie el tamaño de ${node}. Para añadir un segundo techo, ponga una copia detrás de un Balanceador de carga.\n\nLe animamos (y le facturamos),\nSu equipo de cuentas`,
      }),
      ({ node }) => ({
        subject: `NIC al 100% en ${node}`,
        body: `Mensaje automático.\n\nMétrica: NetworkOut\nRecurso: ${node}\nValor: velocidad de línea\nUmbral: velocidad de línea\n\nLa tarjeta de red no puede mover más bytes de los que mueve ahora. Cambie el tamaño del recurso o añada una copia detrás de un Balanceador de carga.\n\nPara dejar de recibir estas alertas, deje de enviar bytes.`,
      }),
    ],
    'advice.disk': [
      ({ from, node }) => ({
        subject: `${node}: sin RAM para su caché de búfer`,
        body: `Estimado cliente:\n\nA ${node} no le queda RAM para su caché de búfer: su working set y la memoria que retienen sus conexiones de aplicación ya no caben. Las lecturas que antes venían de la memoria ahora van al disco, que es mucho más lento.\n\nAcciones recomendadas:\n- Cambiar el tamaño de ${node}\n- O elegir la familia Memory\n- O mantener menos conexiones mediante un Pooler de conexiones\n\nGracias por su paciencia continua. Su disco muestra menos.\n\n${from}`,
      }),
      ({ node }) => ({
        subject: `Sus lecturas van por las escaleras`,
        body: `Hola:\n\n${node} solía guardar sus datos calientes en RAM, donde las lecturas toman el ascensor. Su working set y la memoria que retienen sus conexiones han crecido más allá de la RAM, así que ahora las lecturas van por las escaleras: llegan al disco.\n\nCambie su tamaño, elija la familia Memory o ponga un Pooler de conexiones delante para que retenga menos conexiones, y el ascensor vuelve.\n\nUn saludo,\nEquipo de almacenamiento`,
      }),
      ({ from, node }) => ({
        subject: `Evento: DISK_READS_ELEVATED en ${node}`,
        body: `Tipo de evento: DISK_READS_ELEVATED\nRecurso afectado: ${node}\nCausa: el working set, más la memoria que retienen sus conexiones, supera la RAM disponible.\nEfecto: las lecturas van al disco.\n\nPara resolverlo, cambie el tamaño del recurso, seleccione la familia Memory o mantenga menos conexiones mediante un Pooler de conexiones.\n\nEste es un mensaje automático de ${from}. Las respuestas se enrutan a una carpeta que retiramos en un trimestre anterior.`,
      }),
      ({ from, node }) => ({
        subject: `Re: ¿${node} va lento últimamente?`,
        body: `Hola:\n\nSi ${node} le ha parecido lento, esta es la razón. Cada nodo guarda en RAM los datos que más usa, su working set. El working set de ${node} y la memoria que retienen sus conexiones de aplicación ya no caben en su RAM, así que una parte de cada lectura va al disco.\n\nNo hay nada roto. Solo está esperando a algo que gira, en sentido figurado.\n\nMás RAM lo arregla: cambie el tamaño del nodo o elija la familia Memory. Menos conexiones también: un Pooler de conexiones las retiene por él.\n\nUn cordial saludo,\nSu Technical Account Manager en ${from}`,
      }),
      ({ node }) => ({
        subject: `El disco es la nueva RAM (no lo es)`,
        body: `Aviso.\n\n${node} ya no cabe en RAM con su working set y sus conexiones, así que las lecturas van al disco.\n\nSolución: cambiar el tamaño, la familia Memory o un Pooler de conexiones.\n\nEso es todo el correo. Estamos tan sorprendidos como usted.`,
      }),
    ],
    'advice.cpu': [
      ({ from, node }) => ({
        subject: `${node} está al 100% de CPU`,
        body: `Estimado cliente:\n\n${node} está usando toda su CPU. Las peticiones se acumulan unas detrás de otras.\n\nAcciones recomendadas:\n- Cambiar el tamaño de ${node}\n- Añadir una copia detrás de un Balanceador de carga\n\nSu uso ha subido. Su factura también. Lo consideramos una colaboración.\n\nEl equipo de ${from}`,
      }),
      ({ node }) => ({
        subject: `ALARMA: ${node} CPUUtilization >= 100`,
        body: `ALARMA\n\nNombre: ${node}-cpu\nCambio de estado: OK -> ALARM\nMotivo: CPU al 100%.\n\nRunbook: cambie el tamaño del recurso o añada una copia detrás de un Balanceador de carga.\n\nRecibe este correo porque alguien, en algún momento, marcó una casilla.`,
      }),
      ({ from, node }) => ({
        subject: `${node} lo está dando todo`,
        body: `¡Hola!\n\nNos encanta el esfuerzo. ${node} está dando el 110%, que en términos de CPU significa el 100% y una cola.\n\nDos formas de ayudarlo: cambie su tamaño o añada una copia detrás de un Balanceador de carga para que el trabajo se reparta entre las dos.\n\nLe mandamos ánimos,\nEquipo de Growth de ${from}\n\nP. D.: Una copia es un nodo entero nuevo. Le enviaremos una factura entera nueva.`,
      }),
      ({ from, node }) => ({
        subject: `Service Health: saturación de cómputo en ${node}`,
        body: `Impacto: ${node} está al 100% de CPU. El trabajo que llega ahora espera al trabajo que llegó antes.\n\nEstado: investigando. Nuestra investigación consiste en este correo.\n\nSolución provisional: cambie el tamaño del recurso o añada una copia detrás de un Balanceador de carga.\n\nTodas las demás regiones operan con normalidad, las tres que podemos ver.\n\n${from}`,
      }),
      ({ node }) => ({
        subject: `Su CPU llamó. Está ocupada.`,
        body: `Hola:\n\nIntentamos localizar a ${node} por un asunto sin relación, pero está al 100% de CPU y no pudo atender.\n\nSi quiere que vuelva a tener un momento libre, cámbiele el tamaño a una máquina más grande o añada una copia detrás de un Balanceador de carga para que se turnen.\n\nGracias por su comprensión,\nCompute Customer Experience`,
      }),
    ],
    'advice.draining': [
      ({ from, node }) => ({
        subject: `[Aviso] A ${node} se le están acabando los créditos de CPU`,
        body: `Estimado cliente:\n\n${node} gasta créditos de CPU más rápido de lo que los gana. Cuando el saldo llegue a cero, bajará al 20% de CPU.\n\nPara evitarlo:\n- Cámbielo a General\n- O cámbiele el tamaño\n\nUse Mostrar en el tablero para encontrarlo.\n\nEl equipo de ${from}`,
      }),
      ({ node }) => ({
        subject: `Los créditos de ${node}: una cuenta atrás`,
        body: `Hola:\n\nEste es el correo que viene antes del correo. ${node} está agotando sus créditos de CPU y se quedará sin ellos pronto. Después, se ejecutará al 20% de CPU y recibirá el otro correo.\n\nCámbielo a General o cámbiele el tamaño, y ninguno de los dos tendrá que enviar ni leer ese otro.\n\nMostrar en el tablero lo lleva directo a él.\n\nGracias,\nSu equipo de cuentas`,
      }),
      ({ from, node }) => ({
        subject: `Previsión: ${node} limitado al 20% pronto`,
        body: `Aviso de previsión de ${from}.\n\nAl ritmo actual, ${node} gastará su último crédito de CPU pronto. Cuando lo haga, quedará limitado al 20% de CPU.\n\nEsto es una previsión, no una caída. Como nuestras previsiones del tiempo, está en vista previa, pero, a diferencia de ellas, suele acertar.\n\nAcción: cambie ${node} a General o cámbiele el tamaño. Mostrar en el tablero lo señalará.`,
      }),
      ({ from, node }) => ({
        subject: `Alerta de saldo bajo: ${node}`,
        body: `Hola:\n\nSu saldo de créditos de CPU en ${node} está bajo y bajando. Nos disgustaría que llegara a cero, porque entonces el nodo baja al 20% de CPU.\n\nA diferencia de su banco, no le ofreceremos un descubierto. A diferencia de su banco, le diremos cómo arreglarlo: cambie el nodo a General o cámbiele el tamaño.\n\nVéalo con Mostrar en el tablero.\n\nUn saludo,\nFacturación y Burst, ${from}`,
      }),
      ({ node }) => ({
        subject: `EVENTO: CPU_CREDITS_DRAINING (${node})`,
        body: `Tipo de evento: CPU_CREDITS_DRAINING\nRecurso: ${node}\nCategoría: programado (por usted, por accidente)\nImpacto previsto: CPU limitada al 20% cuando los créditos lleguen a cero\n\nEvítelo: cambiando a General o cambiando el tamaño.\n\nUbíquelo: Mostrar en el tablero.\n\nEste buzón está desatendido. Al parecer, ${node} también.`,
      }),
    ],
    'advice.drawer': [
      ({ from }) => ({
        subject: `Su cajón de Pagos está lleno 🎉`,
        body: `¡Hola!\n\nBuenas noticias: ha ganado tanto dinero que su cajón de Pagos está completamente lleno. Noticias menos buenas: los nuevos ingresos no tienen dónde ir, así que se derraman, y los ingresos derramados se pierden.\n\nHaga clic en Pagos para cobrar lo que hay y el cajón volverá a tener espacio.\n\nSiga arrasando,\nEl equipo de ${from}\n\nP. D.: Cobrar es gratis. Casi todo lo demás no lo es.`,
      }),
      ({ from }) => ({
        subject: `Aviso sobre el saldo de su cuenta`,
        body: `Estimado comerciante:\n\nEste aviso le informa de que el cajón de Pagos asociado a su cuenta ha alcanzado su capacidad. Cualquier ingreso adicional recibido no se retendrá y se considerará perdido.\n\nPara restablecer la capacidad, haga clic en Pagos y cobre el saldo.\n\nNo responda a este mensaje. Las respuestas se ponen en revisión.\n\nAtentamente,\nCentro de Resolución de ${from}`,
      }),
      ({ from }) => ({
        subject: `El dinero cae al suelo`,
        body: `Hola:\n\nSu cajón de Pagos está lleno. Los nuevos ingresos se derraman por el borde y no los vamos a recoger (cobraríamos una comisión por agacharnos).\n\nHaga clic en Pagos para cobrar.\n\n— ${from}`,
      }),
      ({ from }) => ({
        subject: `Acción necesaria: los ingresos se derraman`,
        body: `Hola:\n\nUn vistazo rápido a su cuadro de mando:\n\nCajón: lleno\nIngresos entrantes: derramándose\nIngresos conservados del derrame: ninguno\n\nCada pago que llega mientras el cajón está lleno se pierde. Haga clic en Pagos para cobrar lo que espera y los nuevos ingresos volverán a entrar.\n\nHacemos que cobrar sea fácil. Seguir cobrando es un producto aparte.\n\nUn saludo,\n${from}`,
      }),
      ({ from }) => ({
        subject: `Re: Caso #00000: cajón a capacidad máxima`,
        body: `Estimado titular de la cuenta:\n\nHemos revisado su cuenta y determinado que su cajón de Pagos está lleno. Mientras siga lleno, los ingresos entrantes se derraman y no se pueden recuperar. ${from} no se hace responsable de los ingresos derramados, según la sección 9.2(c), que puede encontrar en Legal y luego en Más legal.\n\nResolución: haga clic en Pagos para cobrar el cajón.\n\nEste caso se cerrará automáticamente. Casi todo aquí lo hace.\n\nUn saludo,\nRevisión de cuentas`,
      }),
    ],
    'advice.collect': [
      ({ from }) => ({
        subject: `Tiene ingresos esperando`,
        body: `¡Hola!\n\nTiene ingresos parados en su cajón de Pagos y su Caja anda algo escasa. ¡Vamos a arreglarlo!\n\nHaga clic en Pagos para cobrarlos y pasarlos a Caja.\n\nBuenas ventas,\nEl equipo de ${from}\n\nP. D.: ¿Sabía que puede ver sus comisiones en un gráfico interactivo precioso?`,
      }),
      ({ from }) => ({
        subject: `Fondos disponibles para cobrar`,
        body: `Estimado comerciante:\n\nNuestros registros indican que hay ingresos retenidos en su cajón de Pagos mientras el saldo de Caja de su cuenta es bajo.\n\nEstos fondos no están en revisión. Lo comprobamos dos veces, lo cual es una revisión, pero corta.\n\nPara cobrar, haga clic en Pagos.\n\nAtentamente,\n${from}`,
      }),
      ({ from }) => ({
        subject: `Caja baja, cajón no`,
        body: `Hola:\n\nSu Caja está baja. Su cajón de Pagos, mientras tanto, está sentado sobre ingresos que ya ganó.\n\nUn clic arregla el desajuste: haga clic en Pagos para cobrar y el dinero se moverá a donde puede gastarlo.\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `Su resumen semanal de ${from}`,
        body: `¡Hola!\n\nSu semana de un vistazo:\n\n- Ingresos: en el cajón de Pagos\n- Caja: baja\n- Comisiones: presentes y prósperas\n\nLos dos primeros harían una pareja preciosa. Haga clic en Pagos para cobrar los ingresos en Caja.\n\nHasta la próxima semana,\nSus amigos de ${from}`,
      }),
      ({ from }) => ({
        subject: `No deje el dinero en el cajón`,
        body: `Hola:\n\nNos hemos dado cuenta de que tiene ingresos esperando en su cajón de Pagos mientras su Caja anda baja. ¡Es suyo! Solo que no está en Caja hasta que lo cobre.\n\nHaga clic en Pagos para traerlo.\n\nGracias por crecer con ${from}. Nosotros crecemos un pequeño porcentaje cada vez que usted lo hace.\n\nUn saludo,\nMerchant Success`,
      }),
    ],
    'advice.negative': [
      ({ from }) => ({
        subject: `Su saldo de Caja es negativo`,
        body: `Hola:\n\nHe conciliado los libros y su saldo de Caja está por debajo de cero. Lo redondeé dos veces y sigue por debajo de cero.\n\nDos caminos de vuelta: venda los nodos que no necesite o haga crecer los ingresos. El primero es más rápido.\n\nUn saludo,\nSu contable en ${from}`,
      }),
      ({ from }) => ({
        subject: `Recordatorio: saldo pendiente (con usted mismo)`,
        body: `Estimado cliente:\n\nEste es un recordatorio amable de que su saldo de Caja es negativo.\n\nEste es un segundo recordatorio, menos amable, en el mismo correo, para ahorrar tiempo.\n\nRevise sus nodos y venda los que no necesite, o haga crecer los ingresos hasta que el saldo vuelva a estar por encima de cero.\n\nSi ya lo ha hecho, ignore este correo. Lo comprobamos. No lo ha hecho.\n\nUn cordial saludo,\nContabilidad, ${from}`,
      }),
      ({ from }) => ({
        subject: `Alerta del libro mayor: Caja < 0`,
        body: `Comprobación automática del libro mayor\n\nCuenta: Caja\nSaldo: negativo\nEstado: redondeado hacia abajo, y luego otra vez hacia abajo\n\nPróximos pasos sugeridos:\n- Venda los nodos que no necesite\n- Haga crecer los ingresos\n\nGenerado por ${from}. Este aviso se ha archivado junto al anterior.`,
      }),
      ({ from }) => ({
        subject: `Tenemos que hablar del número rojo`,
        body: `Hola:\n\nEstaba repasando los libros de este mes y esperaba que el rojo fuera una elección de formato. No lo es: su saldo de Caja es negativo.\n\nNo estoy aquí para juzgar. He visto a fundadores recuperarse de cosas peores. Normalmente hacían una de dos cosas: vender los nodos que en realidad no usaban o hacer crecer los ingresos. Normalmente lo primero, y luego lo segundo.\n\nAvíseme si quiere que repasemos los números. Yo estoy disponible; mi tarifa por hora no.\n\nCon cariño,\nSu contable en ${from}`,
      }),
      ({ from }) => ({
        subject: `Una cosa rápida`,
        body: `Hola:\n\nLa Caja está negativa. Venda los nodos que no necesite o haga crecer los ingresos. Yo empezaría por los nodos.\n\nEso es todo. Voy a guardar esto en una carpeta llamada “Preocupaciones”.\n\n— ${from}`,
      }),
    ],
    'advice.guidance': [
      ({ from }) => ({
        subject: `Recordatorio: la Previsión de este trimestre`,
        body: `Hola:\n\nAhora que su empresa cotiza en bolsa, el mercado recuerda lo que le cuenta. Este trimestre, eso es su Previsión: el número que prometió.\n\nCúmplala. Los analistas son amables con las empresas que hacen lo que dijeron y creativos con las que no.\n\nUn saludo,\nSu contable en ${from}`,
      }),
      ({ from }) => ({
        subject: `Su Previsión no es una sugerencia`,
        body: `Estimado cliente:\n\nComo empresa cotizada, ha fijado una Previsión para este trimestre, un número prometido al mercado. Planifique cumplirla.\n\nPara su referencia, frases como “vientos en contra”, “un entorno macroeconómico desafiante” y “francamente” no cuentan para la Previsión. Hemos revisado el libro mayor en busca de ellas.\n\nUn cordial saludo,\nInformación a inversores, ${from}`,
      }),
      ({ from }) => ({
        subject: `Lista de cierre de trimestre`,
        body: `Hola:\n\nSu lista de cierre de trimestre de ${from}:\n\n- Libros conciliados: en curso\n- Recibos adjuntos: algunos\n- Previsión cumplida: por favor\n\nAhora cotiza en bolsa. Le dijo al mercado un número para este trimestre, y el mercado lo anotó. Cumplamos la Previsión que fijó.\n\nGracias,\nEl equipo de contabilidad`,
      }),
      ({ from }) => ({
        subject: `Sobre ese número que prometió`,
        body: `Hola:\n\nUn pequeño recordatorio, en el espíritu de la vida de empresa cotizada: este trimestre fijó una Previsión y el mercado se la está exigiendo.\n\nLlevo mucho tiempo haciendo libros. Las empresas privadas pueden tener un mal trimestre. Las empresas cotizadas tienen un mal trimestre, una mala llamada de resultados y una mala semana de titulares. Cumpla el número.\n\nSi me necesita, estaré aquí, resaltando celdas en silencio.\n\nUn saludo,\nSu contable, ${from}`,
      }),
      ({ from }) => ({
        subject: `Previsión: el mercado está mirando`,
        body: `Recordatorio automático\n\nEstado de la empresa: cotizada\nEste trimestre: Previsión fijada\nAcción: cumpla la Previsión que fijó\n\nLa Previsión es el número que prometió al mercado para el trimestre. Recomendamos prometer con cuidado y cumplir exactamente.\n\nGenerado por ${from}. Consérvelo para sus registros, ya que nosotros no lo haremos.`,
      }),
    ],
    'advice.workers': [
      ({ from, node }) => ({
        subject: `[DISPARADA] ${node}: todos los workers ocupados`,
        body: `ALERTA DISPARADA\n\nServicio: ${node}\nCondición: todos los workers ocupados\nCausa: en su mayoría, esperando a la base de datos\nAjuste de pool: ninguno en este runtime\nAcción sugerida: hacer que la base de datos responda más rápido\n\nEsta alerta seguirá disparándose hasta que se libere un worker. ${from} seguirá avisándote.`,
      }),
      ({ from, node }) => ({
        subject: `Los workers de ${node} están todos en espera`,
        body: `Hola:\n\nUn aviso rápido de ${from}. Todos los workers de ${node} están ocupados y, cuando miramos de cerca, la mayoría no está trabajando en absoluto. Están esperando a la base de datos, como una oficina entera retenida en la misma llamada a un centro de atención.\n\nEste runtime no tiene ningún tamaño de pool que subir, así que añadir plazas no ayudará. La solución honesta es hacer que la base de datos responda más rápido.\n\nUn saludo,\nEl equipo de ${from}`,
      }),
      ({ from, node }) => ({
        subject: `Nueva incidencia: ${node} no tiene workers libres`,
        body: `Nueva incidencia en ${node}\n\nWorkerPoolExhausted: no hay ningún worker libre para atender la petición\n\nLo que vemos: todos los workers están ocupados y la mayor parte de ese tiempo se pasa esperando a la base de datos.\n\nLo que no ayudará: este runtime no tiene ninguna palanca de pool.\nLo que sí: hacer que la base de datos responda más rápido.\n\nNosotros lo vimos primero. Ahora tú también lo has visto.\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `Anotación en el panel: workers de ${node} pegados arriba`,
        body: `El panel de workers de ${node} lleva un buen rato siendo una línea plana justo arriba del todo. Plano arriba es igual de malo que plano abajo.\n\nHemos añadido una anotación: “todos los workers ocupados, en su mayoría esperando a la base de datos”.\n\nEste runtime no tiene ningún ajuste de pool que subir. Haz que la base de datos responda más rápido y la línea volverá a bajar.\n\n- ${from}`,
      }),
      ({ from, node }) => ({
        subject: `[ESCALADA] ${node} se ha quedado sin workers`,
        body: `Es tarde. Lo sabemos. Recibes esto porque estás despierto.\n\n${node} no tiene workers inactivos. La mayoría está sentada en llamadas abiertas a la base de datos, esperando respuestas.\n\nAntes de que salgas a buscar un tamaño de pool: este runtime no tiene ninguno. El arreglo está más arriba. Haz que la base de datos responda más rápido.\n\nVuelve a dormir después. Estaremos pendientes.\n${from} de guardia`,
      }),
    ],
    'advice.workers-pool': [
      ({ from, node, runtime }) => ({
        subject: `[DISPARADA] ${node}: pool de ${runtime} lleno`,
        body: `ALERTA DISPARADA\n\nServicio: ${node}\nRuntime: ${runtime}\nCondición: todos los workers ocupados\nEn su mayoría: esperando\n\nRemediación (elige una):\n1. Subir el pool\n2. Acelerar la base de datos\n\nSi nadie responde, esta alerta escala a quien esté despierto. Estadísticamente, tú.\n- ${from}`,
      }),
      ({ from, node, runtime }) => ({
        subject: `Todos los workers de ${runtime} en ${node} están ocupados`,
        body: `Hola desde ${from}:\n\nTodos los workers de ${runtime} en ${node} están ocupados. La mayoría solo está esperando, que es la forma más cara de estar ocupado.\n\nTiene dos opciones honestas. Subir el pool para que más peticiones puedan esperar a la vez, o acelerar la base de datos para que nadie espere tanto.\n\nPor nuestra parte, seguiremos vigilando en cualquier caso.\n\nUn saludo,\nEl equipo de ${from}`,
      }),
      ({ from, node, runtime }) => ({
        subject: `Regresión: pool de ${runtime} agotado en ${node}`,
        body: `Incidencia: PoolExhausted (${runtime})\nDónde: ${node}\nVisto por primera vez: ahora mismo\nVisto por última vez: también ahora mismo\n\nTodos los workers del pool de ${runtime} están ocupados, y la mayoría está esperando en vez de trabajar.\n\nArreglos sugeridos:\n- Subir el pool\n- Acelerar la base de datos\n\nMárcala como resuelta cuando el pool tenga espacio. Te avisaremos si vuelve. Siempre lo hacemos.\n${from}`,
      }),
      ({ from, node, runtime }) => ({
        subject: `${node}: tu línea de ${runtime} tocó el techo`,
        body: `Hola:\n\nEl panel de “workers de ${runtime} ocupados” de ${node} ha subido hasta arriba y se ha quedado ahí. No queda sitio bajo el techo.\n\nEl giro: la mayoría está esperando, no calculando.\n\nAsí que sube el pool o acelera la base de datos. Las dos bajan la línea. Una de ellas también hace que todo lo demás vaya más rápido, pero somos un cuadro de mando, no tu madre.\n\n- ${from}`,
      }),
      ({ from, node, runtime }) => ({
        subject: `Línea de tiempo: workers de ${runtime} en ${node}`,
        body: `Línea de tiempo del incidente, ${node}\n\n- Llegan peticiones. Los workers de ${runtime} las recogen.\n- Los workers preguntan a la base de datos. Los workers esperan.\n- Llegan más peticiones. Más workers esperan.\n- Todos los workers están ocupados esperando. La alerta se dispara.\n- ${from} te escribe. (Estás aquí.)\n\nSiguiente paso: sube el pool o acelera la base de datos.`,
      }),
    ],
    'advice.connections': [
      ({ from }) => ({
        subject: `[DISPARADA] Postgres: demasiadas conexiones`,
        body: `ALERTA DISPARADA\n\nComponente: Postgres\nError: rechaza conexiones nuevas\nCausa: demasiados procesos de la app con pools abiertos\n\nRemediación:\n- Reducir los pools, o\n- Añadir un Pooler de conexiones\n\nEsta página se repetirá hasta que la confirme un humano, una mascota o un gato que cruce el teclado.\n${from}`,
      }),
      ({ from }) => ({
        subject: `Postgres ha dejado de abrir la puerta`,
        body: `Hola:\n\nPostgres ha empezado a rechazar conexiones. No porque esté ocupado pensando, sino porque demasiados procesos de la app mantienen cada uno un pool de conexiones y la lista de invitados está completa.\n\nHay dos salidas: reducir los pools, para que cada proceso mantenga menos, o añadir un Pooler de conexiones, para que todos compartan.\n\nUn saludo afectuoso,\nEl equipo de ${from}\n\nP. D.: Abrir más conexiones no es una de las dos salidas.`,
      }),
      ({ from }) => ({
        subject: `Nueva incidencia: FATAL demasiados clientes`,
        body: `Nueva incidencia\nFATAL: lo siento, ya hay demasiados clientes\n\nPostgres está rechazando conexiones. Cada proceso de la app trae su propio pool y, entre todos, han agotado cada hueco.\n\nArreglo: reducir los pools o añadir un Pooler de conexiones.\n\nEsta incidencia es tuya, porque no hay nadie más. Te damos la bienvenida a las startups.\n- ${from}`,
      }),
      ({ from }) => ({
        subject: `Resumen semanal: un panel que debería mirar`,
        body: `Su resumen de ${from}\n\nEsta semana casi todos los paneles se ven bien. Uno no.\n\nConexiones de Postgres: llenas. Se rechazan las nuevas, porque demasiados procesos de la app mantienen cada uno su propio pool.\n\nQué probar: reducir los pools o añadir un Pooler de conexiones delante de Postgres para que los procesos compartan.\n\nEso es el resumen. Corto, porque el resto es aburrido, y aburrido es bueno.`,
      }),
      ({ from }) => ({
        subject: `Re: Re: Re: conexiones de Postgres`,
        body: `Hola de nuevo.\n\nYa lo hemos mencionado antes y lo volveremos a mencionar: Postgres está rechazando conexiones. Demasiados procesos de la app mantienen pools y no quedan asientos.\n\nEl arreglo no ha cambiado. Reduzca los pools o añada un Pooler de conexiones.\n\nRecibe esto porque está despierto y Postgres no atiende llamadas.\n${from}`,
      }),
    ],
    'advice.throughput': [
      ({ from, node }) => ({
        subject: `[DISPARADA] ${node}: por encima de su rendimiento`,
        body: `ALERTA DISPARADA\n\nServicio: ${node}\nCondición: peticiones por encima de su rendimiento\nEstado: este es el límite\n\n${node} está haciendo todo lo que puede y sigue llegando más. El techo se mueve con la máquina: cambia el tamaño de ${node} y admitirá más.\n\n${from}\nRecibes esto porque estás despierto.`,
      }),
      ({ from, node }) => ({
        subject: `${node} está dando lo mejor de sí. No basta.`,
        body: `Hola:\n\nUn aviso amable de ${from}. A ${node} se le pide más de lo que su rendimiento permite. No está roto ni mal configurado. Simplemente está en el límite, y lo que sobra no tiene dónde caber.\n\nPensamos que querría saberlo antes de que se lo digan los usuarios.\n\nCuídese,\nEl equipo de ${from}`,
      }),
      ({ from, node }) => ({
        subject: `Anotación en el gráfico: ${node} alcanzó su límite`,
        body: `Hemos dibujado una línea roja en el panel de ${node}. Tu línea de tráfico la ha cruzado.\n\nAnotación: “por encima del rendimiento. Este es el límite”.\n\nUna parte superior plana en un gráfico suele significar un techo, y este lo es. ${node} no puede ir más rápido con este tamaño.\n\n- ${from}`,
      }),
      ({ from, node }) => ({
        subject: `Incidencia: ${node} por encima de su capacidad`,
        body: `Incidencia: ThroughputExceeded\nDónde: ${node}\nTendencia: en aumento\n\nA ${node} le llegan más peticiones de las que puede procesar. Ese es su límite, no un bug que podamos señalar en una línea de código.\n\nSeguiremos contando. Contar es lo nuestro.\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `Línea de tiempo: ${node} alcanza el límite`,
        body: `Línea de tiempo del incidente\n\n- El tráfico crece. ${node} aguanta.\n- El tráfico crece más. ${node} aguanta, por los pelos.\n- El tráfico supera el rendimiento de ${node}.\n- ${node} alcanza el límite y se queda ahí.\n- ${from} escribe este correo.\n\nCausa raíz: ${node} está por encima de su rendimiento. Ese es el límite.`,
      }),
    ],
    'advice.limit': [
      ({ from, node }) => ({
        subject: `Cuello de botella: ${node}`,
        body: `ALERTA\n\nLo que limita el Diseño ahora mismo: ${node}\nTodo lo demás: con margen de sobra\n\nSin más detalles en esta alerta. ${node} es la parte estrecha de la tubería y el resto del Diseño depende de ella.\n\n- ${from}`,
      }),
      ({ from, node }) => ({
        subject: `Si hoy solo va a mirar una cosa`,
        body: `Hola:\n\nEn ${from} vigilamos muchos gráficos por usted, y hoy todos coinciden en algo: ${node} es lo que limita el Diseño ahora mismo.\n\nTodas las demás partes dependen de ella. Si se pregunta dónde mirar primero, mire ahí.\n\nTodo lo mejor,\nEl equipo de ${from}`,
      }),
      ({ from, node }) => ({
        subject: `${node} es el enlace más lento`,
        body: `Hola, soy ${from}.\n\nPusimos todos los paneles uno al lado del otro. ${node} es el que frena a los demás. Eso es lo que limita el Diseño ahora mismo.\n\nNi línea plana ni incendio. Solo el punto más estrecho de todo el conjunto.\n\nPensé que querrías el nombre.`,
      }),
      ({ from, node }) => ({
        subject: `Incidencia principal de esta hora: ${node}`,
        body: `Incidencia principal\n\nLimitingFactor: ${node}\nImpacto: todo el Diseño\nVisto: cada vez que comprobamos\n\nAhora mismo, ${node} marca el ritmo de todo. Cuando es lo más lento, el Diseño solo va tan rápido como ${node}.\n\n${from}\nNosotros lo vimos primero. Tú lo viste al final.`,
      }),
      ({ from, node }) => ({
        subject: `[ESCALADA] Diseño limitado por ${node}`,
        body: `ESCALADA\n\nEsta alerta se disparó, nadie la ignoró y aun así se escaló, porque así funciona el escalado.\n\nHallazgo: ${node} es lo que limita el Diseño ahora mismo.\n\nEso es toda la página. Recibes esto porque estás despierto.\n${from}`,
      }),
    ],
    'advice.failed': [
      ({ from, node }) => ({
        subject: `[DISPARADA] ${node} está caído`,
        body: `ALERTA DISPARADA\n\nServicio: ${node}\nEstado: FALLIDO\n\nRemediación:\n1. Selecciona ${node} y haz clic en Reemplazar, o\n2. Espera al proveedor\n\nUsa Mostrar en el tablero para encontrarlo.\n\nEsta página escalará hasta que alguien haga una de las dos cosas. Recibes esto porque estás despierto.\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `${node} ha dejado de responder`,
        body: `Hola:\n\nSiento ser quien trae esta noticia. ${node} ha fallado. No devuelve nada y nuestro panel se ha quedado plano. Eso no es bueno.\n\nPuede seleccionarlo y hacer clic en Reemplazar para poner uno nuevo en su lugar, o esperar a que el proveedor lo recupere.\n\nMostrar en el tablero le llevará directo hasta allí.\n\nEl equipo de ${from}`,
      }),
      ({ from, node }) => ({
        subject: `Nueva incidencia: ${node} inaccesible`,
        body: `Nueva incidencia: NodeFailed\nDónde: ${node}\nVisto por primera vez: hace unos instantes\n\nTodas las peticiones a ${node} están fallando, porque ${node} ha fallado.\n\nArréglalo tú: selecciónalo y haz clic en Reemplazar.\nO no: espera al proveedor.\n\nSe adjunta Mostrar en el tablero.\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `Línea de tiempo: fallo de ${node}`,
        body: `Línea de tiempo del incidente\n\n- ${node} está bien.\n- ${node} no está bien.\n- ${node} ha fallado.\n- ${from} se da cuenta y te escribe.\n- Lees esto. (Estás aquí.)\n- Siguiente: selecciónalo y haz clic en Reemplazar, o espera al proveedor.\n\nMostrar en el tablero, abajo.`,
      }),
      ({ from, node }) => ({
        subject: `Línea plana en ${node}`,
        body: `Tu panel de ${node} se ha quedado plano hace un momento. No es una línea plana tranquila. Es una línea plana de fallo.\n\nDos caminos. Selecciónalo y haz clic en Reemplazar si prefieres no esperar, o espera al proveedor si confías más en él que nosotros.\n\nPulsa Mostrar en el tablero para ver dónde está.\n\n- ${from}`,
      }),
    ],
    'advice.restarting': [
      ({ from, node }) => ({
        subject: `[INFO] ${node} se está reiniciando`,
        body: `AVISO\n\nServicio: ${node}\nEstado: reiniciando\nImpacto: las peticiones fallan hasta que esté activo\nAcción requerida: ninguna\n\nSí, te hemos avisado por algo que no requiere acción. Recibes esto porque estás despierto.\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `${node} se está tomando un pequeño descanso`,
        body: `Hola:\n\nAquí no hay nada que hacer, solo mantenerle al día. ${node} se está reiniciando. Mientras tanto, las peticiones fallarán. Cuando vuelva a estar activo, pasarán de nuevo.\n\nNo hace falta ninguna acción. Mostrar en el tablero está ahí si quiere verlo volver.\n\nUn saludo,\nEl equipo de ${from}`,
      }),
      ({ from, node }) => ({
        subject: `Pico de errores desde ${node} (esperado)`,
        body: `Incidencia: errores desde ${node}\nEstado: esperado\n\n${node} se está reiniciando, así que las peticiones fallan hasta que esté activo. Los errores se detienen solos.\n\nNo hace falta ninguna acción. Te lo contamos igual, porque contarlo es toda nuestra personalidad.\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `Anotación: reinicio de ${node}`,
        body: `Hemos marcado el panel de ${node} con una anotación: “reiniciando”.\n\nLa caída que verás son peticiones que fallan mientras vuelve. Es temporal y termina cuando ${node} esté activo.\n\nNo hace falta ninguna acción. Mostrar en el tablero si quieres echarle un ojo.\n\n- ${from}`,
      }),
      ({ from, node }) => ({
        subject: `Línea de tiempo: reinicio de ${node}`,
        body: `Línea de tiempo\n\n- ${node} empieza a reiniciarse.\n- Las peticiones a ${node} fallan.\n- Recibes este correo.\n- ${node} vuelve a estar activo.\n- Las peticiones vuelven a funcionar.\n\nTu papel en esta línea de tiempo: ninguno. No hace falta ninguna acción.\n\n${from}`,
      }),
    ],
    'advice.slow-query-fix': [
      ({ from }) => ({
        subject: `[DISPARADA] Base de datos: escaneos de tablas completas`,
        body: `ALERTA DISPARADA\n\nComponente: Base de datos\nCondición: consulta sin índice\nEfecto: se escanean tablas enteras en cada llamada\n\nRemediación: selecciona la Base de datos y haz clic en Añadir índice.\n\nEsta alerta es fácil de arreglar y difícil de ignorar. Por favor, haz lo primero.\n${from}`,
      }),
      ({ from }) => ({
        subject: `Su Base de datos está leyendo cada página`,
        body: `Hola:\n\nUna de sus consultas no tiene índice, así que cada vez que se ejecuta la Base de datos escanea tablas enteras para encontrar lo que necesita. Imagine que busca una palabra leyendo el diccionario entero desde la “a”.\n\nBuenas noticias: esta está en sus manos. Seleccione la Base de datos y haga clic en Añadir índice.\n\nGracias,\nEl equipo de ${from}`,
      }),
      ({ from }) => ({
        subject: `Nueva incidencia: SlowQuery (falta un índice)`,
        body: `Nueva incidencia: SlowQuery\nDónde: Base de datos\nCausa: no hay índice\nSíntoma: escaneos de tablas completas\nVisto: cada vez que se ejecuta la consulta\n\nResolución: selecciona la Base de datos y haz clic en Añadir índice.\n\nResuélvela y dejaremos de contar.\n${from}`,
      }),
      ({ from }) => ({
        subject: `Ese diente de sierra en el panel de la Base de datos`,
        body: `Hola, soy ${from}.\n\nEl panel de la Base de datos tiene una forma que conocemos bien. Es una consulta sin índice, así que la Base de datos escanea tablas completas cada vez.\n\nEl arreglo está a un clic: selecciona la Base de datos y haz clic en Añadir índice.\n\nDespués de eso, el panel debería volverse aburrido. Nos gusta lo aburrido.`,
      }),
      ({ from }) => ({
        subject: `Re: la consulta lenta (edición de las 3 a. m.)`,
        body: `Soy ${from}. Recibes esto porque estás despierto.\n\nUna consulta no tiene índice. La Base de datos la responde a las malas: escaneando tablas completas.\n\nPuedes arreglarlo antes de volver a la cama. Selecciona la Base de datos y haz clic en Añadir índice.\n\nBuenas noches, probablemente.`,
      }),
    ],
    'advice.slow-query': [
      ({ from }) => ({
        subject: `[DISPARADA] Base de datos: consulta lenta`,
        body: `ALERTA DISPARADA\n\nComponente: Base de datos\nCausa: consulta sin índice\nEfecto: se escanean tablas completas\nAñadir índice: aún no disponible\n\nRemediación:\n- Investigar Análisis de consultas, o\n- Poner una Caché delante\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `Una consulta está leyendo la biblioteca entera`,
        body: `Hola:\n\nUna de sus consultas no tiene índice, así que la Base de datos escanea tablas completas para responderla. Eso se vuelve lento muy rápido.\n\nTodavía no puede añadir un índice. Hasta que pueda, hay dos rutas: investigar Análisis de consultas, para poder añadir uno más adelante, o poner una Caché delante, para preguntar a la Base de datos con menos frecuencia.\n\nTodo lo mejor,\nEl equipo de ${from}`,
      }),
      ({ from }) => ({
        subject: `Nueva incidencia: SlowQuery (sin índice)`,
        body: `Nueva incidencia: SlowQuery\nDónde: Base de datos\nCausa: falta un índice, escaneos de tablas completas\n\nSoluciones provisionales mientras el índice no está a tu alcance:\n1. Investigar Análisis de consultas\n2. Poner una Caché delante\n\nMantendremos esta incidencia abierta. Se nos da muy bien mantener incidencias abiertas.\n${from}`,
      }),
      ({ from }) => ({
        subject: `Resumen semanal: una consulta lenta`,
        body: `Su resumen de ${from}\n\nUn punto esta semana. Una consulta no tiene índice, así que la Base de datos escanea tablas completas para responderla, y el panel lo muestra.\n\nTodavía no puede añadir un índice. Sus opciones por ahora: investigar Análisis de consultas o poner una Caché delante de la Base de datos para que le lleguen menos preguntas.\n\nEso es todo. Nos vemos en el próximo resumen.`,
      }),
      ({ from }) => ({
        subject: `Línea de tiempo: la consulta lenta`,
        body: `Línea de tiempo\n\n- Llega una consulta sin índice que usar.\n- La Base de datos escanea tablas completas.\n- Lo hace otra vez. Y otra.\n- ${from} te avisa.\n\nPróximos pasos, ya que un índice todavía no es una opción:\n- Investigar Análisis de consultas\n- Poner una Caché delante`,
      }),
    ],
    'advice.failing-writes': [
      ({ from, kind }) => ({
        subject: `[DISPARADA] peticiones de ${kind} fallando`,
        body: `ALERTA DISPARADA\n\nPeticiones: ${kind}\nEstado: fallando\nMotivo: las escrituras necesitan la Base de datos primaria\nNota: una réplica no puede aceptarlas\n\nComprueba a dónde van tus peticiones de ${kind}. Deben llegar a la primaria.\n\nRecibes esto porque estás despierto.\n${from}`,
      }),
      ({ from, kind }) => ({
        subject: `Sus peticiones de ${kind} rebotan`,
        body: `Hola:\n\nLas peticiones de ${kind} están fallando. Las escrituras tienen que aterrizar en la Base de datos primaria, y una réplica no puede aceptarlas, por muy amablemente que se le pidan.\n\nSi sus peticiones de ${kind} van a cualquier sitio menos a la primaria, esa es la razón.\n\nUn saludo cordial,\nEl equipo de ${from}`,
      }),
      ({ from, kind }) => ({
        subject: `Nueva incidencia: ReadOnlyReplica en ${kind}`,
        body: `Nueva incidencia\nError: no se puede ejecutar ${kind} en una réplica de solo lectura\n\nLas peticiones de ${kind} están fallando. Las escrituras necesitan la Base de datos primaria. Una réplica no puede aceptarlas, por muchas veces que se reintenten.\n\nVisto: en todas y cada una de las peticiones de ${kind}.\n${from}`,
      }),
      ({ from, kind }) => ({
        subject: `Tu panel de éxito de ${kind} llegó a cero`,
        body: `El panel de peticiones de ${kind} exitosas se ha quedado plano. Plano en cero. Eso no es bueno.\n\nLo hemos anotado: “${kind} fallando. Las escrituras necesitan la Base de datos primaria; una réplica no puede aceptarlas”.\n\nAsegúrate de que ${kind} llegue a la primaria y la línea volverá.\n\n- ${from}`,
      }),
      ({ from, kind }) => ({
        subject: `Línea de tiempo: peticiones de ${kind} fallando`,
        body: `Línea de tiempo del incidente\n\n- Sale una petición de ${kind}.\n- Se encuentra con una réplica.\n- La réplica no puede aceptar escrituras.\n- La petición de ${kind} falla.\n- Repetir.\n\nCausa raíz: las escrituras necesitan la Base de datos primaria. Una réplica no puede aceptarlas.\n\n${from}`,
      }),
    ],
    'advice.failing': [
      ({ from, kind }) => ({
        subject: `[DISPARADA] peticiones de ${kind} fallando`,
        body: `ALERTA DISPARADA\n\nPeticiones: ${kind}\nEstado: fallando\nAcción sugerida: revisa los enlaces\n\nEsta alerta escalará hasta que las peticiones de ${kind} vuelvan a funcionar o salga el sol, lo que ocurra primero. Probablemente el sol.\n${from}`,
      }),
      ({ from, kind }) => ({
        subject: `Las peticiones de ${kind} no llegan`,
        body: `Hola:\n\nLas peticiones de ${kind} están fallando, y no fallan en silencio. En algún punto entre donde empiezan y donde deberían terminar, el camino no está bien.\n\nNuestro consejo: revise los enlaces. Siga una petición de ${kind} de principio a fin y mire dónde se cae.\n\nUn saludo,\nEl equipo de ${from}`,
      }),
      ({ from, kind }) => ({
        subject: `Nueva incidencia: fallos de ${kind}`,
        body: `Nueva incidencia: RequestFailed (${kind})\nVisto: otra vez\nUsuarios afectados: los que envían ${kind}\n\nArreglo sugerido: revisa los enlaces.\n\nNosotros lo vimos primero. Tú lo viste al final. Ahora lo has visto dos veces.\n${from}`,
      }),
      ({ from, kind }) => ({
        subject: `Tu gráfico de ${kind} tiene un agujero`,
        body: `El panel de ${kind} se ve mal. Entran peticiones y salen fallos.\n\nDesde aquí arriba no podemos decirte qué enlace tiene la culpa, pero ahí es donde hay que mirar. Revisa los enlaces.\n\n- ${from}`,
      }),
      ({ from, kind }) => ({
        subject: `Línea de tiempo: caída de ${kind}`,
        body: `Línea de tiempo\n\n- Las peticiones de ${kind} empiezan a fallar.\n- Siguen fallando.\n- ${from} lanza esta alerta.\n- Revisas los enlaces. (Siguiente paso recomendado.)\n- Las peticiones de ${kind} vuelven a funcionar. (Con suerte.)\n\nRecibes esto porque estás despierto.`,
      }),
    ],
    'advice.stranded': [
      ({ from, node }) => ({
        subject: `[DISPARADA] ${node}: peticiones varadas`,
        body: `ALERTA DISPARADA\n\nServicio: ${node}\nCondición: peticiones sin destino\n\nRemediación: enlaza ${node} con algo que las acepte.\n\nSe adjunta Mostrar en el tablero. Recibes esto porque estás despierto.\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `${node} retiene peticiones que no puede reenviar`,
        body: `Hola:\n\n${node} tiene peticiones en mano y ningún sitio al que enviarlas. Es un poco como un cartero con la bolsa llena y sin direcciones.\n\nEl arreglo: enlazarlo con algo que las acepte.\n\nMostrar en el tablero le señalará ${node}.\n\nMis mejores deseos,\nEl equipo de ${from}`,
      }),
      ({ from, node }) => ({
        subject: `Nueva incidencia: NoRoute desde ${node}`,
        body: `Nueva incidencia: NoRoute\nDónde: ${node}\nMensaje: la petición no tiene destino\nVisto: en todas y cada una\n\nArreglo: enlazarlo con algo que las acepte.\n\nMostrar en el tablero para encontrar ${node}.\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `Flechas que entran, ninguna que sale: ${node}`,
        body: `Hola, soy ${from}.\n\nMirando el panel de ${node}, las peticiones llegan y se quedan ahí sentadas. No tienen a dónde ir después.\n\nEnlaza ${node} con algo que las acepte y el panel debería empezar a moverse otra vez.\n\nMostrar en el tablero te llevará directo hasta allí.`,
      }),
      ({ from, node }) => ({
        subject: `Línea de tiempo: varadas en ${node}`,
        body: `Línea de tiempo del incidente\n\n- Las peticiones llegan a ${node}.\n- ${node} busca dónde enviarlas.\n- No hay ningún sitio.\n- Las peticiones esperan. Y esperan.\n- ${from} te escribe.\n\nSiguiente paso: enlaza ${node} con algo que las acepte. Mostrar en el tablero está abajo.`,
      }),
    ],
    'advice.round': [
      ({ from, round }) => ({
        subject: `Presentación rápida: ${from} x su ronda ${round}`,
        body: `Hola:\n\nLlevo mucho tiempo leyéndole en silencio; es la primera vez que le escribo. Nos encanta lo que está construyendo. De verdad, mucho. Esta mañana tres socios hicieron capturas de pantalla de su Tablero y uno de ellos lloró un poco.\n\nNosotros lideramos rondas y nos gustaría liderar su ronda ${round}. Me encantaría tomar un café, hacer una llamada o dar un paseo, lo que avance más rápido.\n\nSi está listo, pulse Levantar. Si el momento no es el adecuado, pulse Rechazar y fingiremos que nos parece bien.\n\nCon afecto,\nUn socio de ${from}`,
      }),
      ({ from, round }) => ({
        subject: `Ronda ${round}: estamos dentro. ¿Y usted?`,
        body: `Fundador:\n\nSeré breve porque el mercado no espera. Otros fondos están al acecho de su ronda ${round}. Preferimos liderarla antes que leer sobre ella.\n\nPulse Levantar y nos movemos hoy.\nPulse Rechazar y aquí seguiremos, actualizando sus métricas.\n\nEnviado desde mi teléfono, que es como se envían todas las convicciones.\n${from}`,
      }),
      ({ from, round }) => ({
        subject: `Sobre el largo arco de su ronda ${round}`,
        body: `Estimado fundador:\n\nEn ${from} no invertimos en empresas. Invertimos en décadas. Hemos visto muchos Tableros nacer y desaparecer, y el suyo tiene el aire tranquilo de algo que seguirá funcionando cuando los fondos de nuestros nietos estén levantando rondas.\n\nNos sentiríamos honrados de liderar su ronda ${round}. Capital paciente, incentivos alineados y un asiento en el consejo que prometemos usar con moderación.\n\nSi desea seguir adelante, elija Levantar. Si no, elija Rechazar y esperaremos. Se nos da muy bien esperar.\n\nCon respeto,\nLos socios de ${from}`,
      }),
      ({ from, round }) => ({
        subject: `Construya algo que los usuarios quieran. Luego levante.`,
        body: `Hola:\n\nAlgunas notas de nuestro lado:\n\n- Estar vivo por defecto es mejor que estar muerto por defecto.\n- Haga cosas que no escalan y luego escálelas.\n- Levante cuando alguien le ofrezca.\n\nAlguien le está ofreciendo. ${from} quiere liderar su ronda ${round}.\n\nPulse Levantar si quiere el dinero. Pulse Rechazar si prefiere seguir construyendo a base de fideos instantáneos. Ambas están bien. Una es más rápida.\n\n${from}`,
      }),
      ({ from, round }) => ({
        subject: `Re: Re: su ronda ${round} (la subo otra vez)`,
        body: `¡Hola! Vuelvo a subir esto al principio de su bandeja de entrada por si quedó enterrado bajo sus alertas de las 3 a. m.\n\nTL;DR: nos encantaría liderar su ronda ${round}. Somos amigables con los fundadores, liderados por operadores, guiados por tesis y todas las demás palabras con guiones de nuestra web.\n\nSin presión. (Algo de presión.) Pulse Levantar y los papeles llegan antes de que termine su café. Pulse Rechazar y volveremos el próximo trimestre, como manda la tradición.\n\nUn saludo,\nEl equipo de ${from}\n\nP. D.: Me encantó su último mensaje de commit.`,
      }),
    ],
    'advice.research': [
      ({ from }) => ({
        subject: `El Conocimiento es para gastarlo`,
        body: `Fundador:\n\nHas estado guardando Conocimiento como hay quien guarda cuerda: con cuidado y sin ningún motivo que nadie sepa explicar. Ya tienes suficiente para investigar algo.\n\nAbre Investigación y gástalo. El conocimiento que se queda en un cajón no es conocimiento. Es un cajón.\n\nTuyo,\n${from}`,
      }),
      ({ from }) => ({
        subject: `Una nota breve sobre el Conocimiento`,
        body: `Fundador:\n\nTienes suficiente Conocimiento para investigar algo. No lo has hecho.\n\nEl Conocimiento sin gastar es una lección que pagaste y luego decidiste no asistir.\n\nAbre Investigación. Gasta tu Conocimiento. Luego vuelve al trabajo.\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `Algo que aprendí por el camino lento`,
        body: `Hola:\n\nAl principio de mi carrera llevaba un cuaderno con las cosas que pretendía aprender bien. Cuando lo abrí, la mitad de las entradas estaba obsoleta y la otra mitad eran las causas de mis incidentes.\n\nAhora el que lleva ese cuaderno eres tú. Tienes suficiente Conocimiento para investigar algo.\n\nAbre Investigación y gasta tu Conocimiento. Elige lo que te mordió más recientemente. Mordirá menos.\n\nCon cariño,\n${from}\n\nP. D.: Sí, todavía tengo el cuaderno. No, no puedes verlo.`,
      }),
      ({ from }) => ({
        subject: `Tres preguntas antes de construir más`,
        body: `Fundador:\n\nAntes de colocar otro Nodo, pregúntate:\n\n1. ¿Qué se rompió la última vez?\n2. ¿Entiendo por qué?\n3. ¿Podrías aprender algo para que nunca vuelva a romperse así?\n\nLa respuesta a la tercera es sí. Tienes suficiente Conocimiento para investigar algo. Abre Investigación y gasta tu Conocimiento.\n\nUn saludo,\n${from}`,
      }),
      ({ from }) => ({
        subject: `Se te permite aprender cosas`,
        body: `Fundador:\n\nUn barco en el puerto está seguro, pero los barcos no existen para eso. El Conocimiento en el bolsillo también está seguro, y hace exactamente lo mismo.\n\nTienes suficiente para investigar algo. Abre Investigación, gasta tu Conocimiento y ve a descubrir qué has estado adivinando.\n\nAdelante,\n${from}`,
      }),
    ],
    'advice.ipo': [
      ({ from, users }) => ({
        subject: `La campana no suena por accidente`,
        body: `Fundador:\n\nLa gente imagina salir a bolsa como una sola mañana: una campana, globos que caen, una foto. No es así. Es una larga lista de cosas aburridas hechas bien.\n\nTus dos cosas aburridas son estas: crecer hasta ${users} usuarios y completar la lista de verificación de la IPO. Entonces podrás tener tu campana.\n\nCon grandes expectativas,\n${from}`,
      }),
      ({ from, users }) => ({
        subject: `Cotizar es una promesa`,
        body: `Fundador:\n\nUna empresa privada puede equivocarse en privado. Una cotizada se equivoca en el periódico.\n\nPara salir a bolsa, crece hasta ${users} usuarios y completa la lista de verificación de la IPO. Las dos cosas, no una. El mercado sabe contar y también lee listas de verificación.\n\n${from}`,
      }),
      ({ from, users }) => ({
        subject: `Sobre las IPO y la paciencia`,
        body: `Hola de nuevo:\n\nUna vez me preguntaron qué separa a una empresa que sale a bolsa de una que solo quiere hacerlo. Mi respuesta entonces y ahora: la parte aburrida.\n\nLa parte emocionante es el número de usuarios. Crece hasta ${users} usuarios. La parte aburrida es la lista de verificación de la IPO, y tienes que completarla entera. Los fundadores que se saltan la parte aburrida se convierten en casos de estudio, y yo he enseñado suficientes.\n\nHaz las dos cosas y podrás salir a bolsa.\n\nCon afecto,\n${from}`,
      }),
      ({ from, users }) => ({
        subject: `Tu camino a salir a bolsa`,
        body: `Fundador:\n\nAdónde vas:\nA bolsa.\n\nQué hay entre tú y eso:\n- ${users} usuarios. Crece hasta tenerlos.\n- La lista de verificación de la IPO. Completa cada línea.\n\nQué no hay entre tú y eso:\n- Un logo más bonito.\n- Una oficina más grande.\n- Mi aprobación, que ya tienes.\n\nAdelante.\n${from}`,
      }),
      ({ from, users }) => ({
        subject: `Antes de la campana, el trabajo`,
        body: `Fundador:\n\nAlgún día alguien te pedirá que expliques todo tu sistema en una sola diapositiva. Te verás tentado a usar cuarenta. Resiste.\n\nPero primero, gánate la pregunta. Crece hasta ${users} usuarios y completa la lista de verificación de la IPO para salir a bolsa. Lo primero demuestra que la gente lo quiere. Lo segundo demuestra que se puede confiar en ti para gestionarlo.\n\nEstoy orgulloso de lo lejos que has llegado. No le digas a nadie que lo he dicho.\n\n${from}`,
      }),
    ],
    'advice.grow': [
      ({ from, round, users }) => ({
        subject: `La ronda ${round} está a ${users} usuarios de distancia`,
        body: `Fundador:\n\nVas a querer levantar la ronda ${round} ahora. Todos lo hacen. Pero el dinero sigue a los usuarios, no a los deseos.\n\nCrece hasta ${users} usuarios y la ronda ${round} vendrá a ti. Mientras tanto, mantén el Diseño sano y a los usuarios contentos.\n\nCon paciencia,\n${from}`,
      }),
      ({ from, round, users }) => ({
        subject: `Todavía no.`,
        body: `Fundador:\n\nTodavía no.\n\nCrece hasta ${users} usuarios. Luego levanta la ronda ${round}.\n\nLevantar antes de tiempo es una distracción con papeleo incluido. No voy a explicarlo. No me hará falta.\n\n${from}`,
      }),
      ({ from, round, users }) => ({
        subject: `Lo que yo haría en tu lugar`,
        body: `Hola:\n\nIbas a preguntarlo, así que aquí está lo que yo haría en tu lugar:\n\n- Deja de actualizar las páginas de inversores.\n- Mira qué frena a tus usuarios y arréglalo.\n- Crece hasta ${users} usuarios.\n- Luego levanta la ronda ${round}, desde una posición de fuerza.\n\nEse es todo el plan. Solo me fío de los planes que caben en cuatro líneas.\n\nCon cariño,\n${from}`,
      }),
      ({ from, round, users }) => ({
        subject: `Una palabra sobre la ronda ${round}`,
        body: `Fundador:\n\nMe he sentado en ambos lados de la mesa. Los fundadores que levantaron bien no tenían las mejores presentaciones. Llegaron ya necesitando el dinero, porque los usuarios habían llegado primero.\n\nCrece hasta ${users} usuarios para levantar la ronda ${round}. Deja que tus usuarios hagan el argumento. Es el único que los inversores no pueden interrumpir.\n\nCon confianza en ti,\n${from}`,
      }),
      ({ from, round, users }) => ({
        subject: `Primero los usuarios, luego la ronda ${round}`,
        body: `Fundador:\n\nEl orden de las cosas importa más que las cosas. Usuarios, luego dinero. Nunca dinero, luego usuarios.\n\nNecesitas ${users} usuarios para levantar la ronda ${round}. Cada usuario al que sirves bien habla con un amigo. Cada usuario al que sirves despacio también habla con un amigo, solo que de otra manera.\n\nConstruye para ellos. La ronda puede esperar.\n\nTuyo, sin ninguna prisa en particular,\n${from}`,
      }),
    ],
    'event.blocked': [
      ({ from, item, reason }) => ({
        subject: `Bloqueado por ${item}`,
        body: `Hola,\n\nNo puedo avanzar con ${item}: ${reason}.\n\nNo voy a improvisar para saltármelo: la decisión es tuya, y prefiero esperar una hora antes que enviar lo incorrecto durante una semana.\n\nApruébalo y vuelvo a ello antes de que se enfríe el café. Más tarde también vale. Mañana volveré a preguntar, con las mismas palabras, porque nada habrá cambiado.\n\n${from}`,
      }),
      ({ from, item, reason }) => ({
        subject: `${item} no avanza`,
        body: `Hola,\n\nUna nota breve: ${item} no avanza, y el motivo es simple: ${reason}.\n\nTodo lo demás del backlog se mueve. Es lo único en mi mesa que necesita a una persona en lugar de una tarde.\n\nApruébalo y lo termino. Si lo dejas para luego, te lo traigo mañana: la misma petición, con un día de polvo encima.\n\nGracias,\n${from}`,
      }),
    ],
    'event.unhappy': [
      ({ from, pages, gap }) => ({
        subject: '¿Podemos hablar?',
        body: `Hola,\n\nLlevo tiempo queriendo decirte esto, y el buscapersonas ha tomado la decisión por mí.\n\nEl buscapersonas ha sonado ${pages} ${pages === '1' ? 'vez' : 'veces'}, y mi sueldo está ${gap} por debajo de lo que esta Era paga por mi trabajo. No estoy enojado. Estoy cansado, y el cansancio es peor, porque dura.\n\nTres cosas ayudarían. Dame días libres y volveré siendo la persona que contrataste. Súbeme el sueldo y dejaré de leer ofertas de empleo en el teléfono. O acepta mi renuncia y me iré hablando bien de ti, que es más raro de lo que parece.\n\n${from}`,
      }),
      ({ from, pages, gap }) => ({
        subject: 'Antes de decidir nada',
        body: `Aquí ${from}.\n\nQuiero ser directo, porque la alternativa es callarme y luego irme.\n\nLa guardia me ha despertado ${pages} ${pages === '1' ? 'vez' : 'veces'}. Mi sueldo está ${gap} por debajo de la tarifa de mercado para lo que hago ahora. Puedo con una de las dos cosas. Con las dos no, y no para siempre.\n\nDías libres, un aumento o mi renuncia. Cualquiera de las tres es una respuesta honesta y la respetaré. Lo que no puedo hacer es fingir que estoy bien otro mes.\n\n${from}`,
      }),
    ],
    'event.patch-proposed': [
      ({ from, item, target, due }) => ({
        subject: `${target}: puedo parchear esto`,
        body: `Hola,\n\nEl aviso de seguridad que acaba de salir afecta a código mío: ${target}. El ticket es ${item}, y vence en ${due}.\n\nPuedo tomarlo ahora y dejar de lado el trabajo de producto, o puede esperar su turno al final del backlog como todo lo demás. Mi preferencia es ahora, y mi preferencia no es la que publica la Feature.\n\nParchear ahora lo sube al principio. Encolar el parche lo deja donde está. Las dos son decisiones; solo una es una decisión que puedo tomar yo.\n\n${from}`,
      }),
      ({ from, item, target, due }) => ({
        subject: `Mi nombre está en el parche de ${target}`,
        body: `Hola,\n\nUna nota rápida de la persona que leerá el postmortem. ${target} tiene una vulnerabilidad publicada, y el ticket es ${item}, que vence en ${due}.\n\nConozco el código, conozco el exploit y sé cuánto tarda el arreglo, que no es mucho. Lo que no sé es si prefieres esto a la próxima Feature.\n\nParchear ahora, si quieres que desaparezca. Encolar el parche, si quieres apostar contra una fecha límite. Estaré aquí en cualquier caso.\n\n${from}`,
      }),
    ],
    'event.incident-instance': [
      ({ from, node }) => ({
        subject: `[ACTIVADO] 1 incidente: ${node} está caído`,
        body: `Hola,\n\nSe le ha asignado 1 incidente activado.\n\nIncidente: ${node} ha fallado\nEstado: ACTIVADO\nUrgencia: Alta\nAsignado a: usted (usted es toda la rotación)\n\nResolución: seleccione ${node} y haga clic en Reemplazar. No se va a reemplazar solo, por mucho que lo mire.\n\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `El gráfico de ${node} se ha aplanado`,
        body: `Hola,\n\nLa línea de ${node} se ha aplanado hace un momento. Plano no es tranquilo. Plano significa que el nodo ha fallado y no está sirviendo nada.\n\nEl arreglo es breve: seleccione ${node} y haga clic en Reemplazar. Uno nuevo ocupará su lugar.\n\nSeguiremos vigilando la línea para que usted no tenga que hacerlo. (Lo hará de todos modos.)\n\n— ${from}`,
      }),
      ({ from, node }) => ({
        subject: `Hemos visto caer ${node}. Ahora usted también.`,
        body: `${node} ha fallado. Todas las peticiones que se le envían son ahora un error, y las hemos contado todas.\n\nQué hacer:\n1. Seleccione ${node}.\n2. Haga clic en Reemplazar.\n3. Mire cómo el contador deja de subir.\n\nPrimera detección: ahora mismo\nÚltima detección: sigue siendo ahora mismo\n\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `${node} ha vuelto a fallar`,
        body: `Hola,\n\nSi esto le resulta familiar, es porque ${node} ha vuelto a fallar. El hardware es mortal, y una instancia no es más que hardware con un nombre más bonito.\n\nEl mismo procedimiento de siempre: seleccione ${node} y haga clic en Reemplazar. Nada del arreglo ha cambiado, que sinceramente es la parte más reconfortante de este correo.\n\nUn saludo,\nNotificaciones de guardia, ${from}`,
      }),
      ({ from, node }) => ({
        subject: `ESCALADO: ${node} está caído`,
        body: `Nivel de escalado 1 de 1\n\nEste incidente se ha escalado a la siguiente persona de la rotación. La siguiente persona de la rotación es usted.\n\n${node} ha fallado y no está sirviendo tráfico. Para resolverlo, seleccione ${node} y haga clic en Reemplazar.\n\nNo viene nadie más. Lo hemos comprobado.\n\nRespuesta a incidentes de ${from}`,
      }),
    ],
    'event.incident-slow-query': [
      ({ from }) => ({
        subject: `Nuevo problema: consulta lenta, escaneo completo de tabla`,
        body: `Nuevo problema en producción\n\nSlowQueryWarning: una consulta nueva no tiene índice\nEventos: cada lectura\nPrimera detección: hace un momento\n\nAhora cada lectura recorre la tabla entera, fila a fila, como alguien que busca sus llaves en todos los cajones de la casa. Las lecturas que duraban un parpadeo ahora tardan un buen rato, y la Base de datos está haciendo todo ese trabajo.\n\n— ${from}`,
      }),
      ({ from }) => ({
        subject: `La latencia de lectura de la Base de datos está subiendo`,
        body: `Hola,\n\nEl panel de latencia de su Base de datos sube y se va hacia la derecha. En un gráfico de ingresos eso sería una buena noticia. Aquí no lo es.\n\nCausa: una consulta nueva no tiene índice, así que cada lectura recorre la tabla entera.\n\nUn saludo,\nEl equipo de alertas de ${from}`,
      }),
      ({ from }) => ({
        subject: `[ACTIVADO] Consulta lenta en la Base de datos`,
        body: `Incidente: consulta lenta\nServicio: Base de datos\nUrgencia: Alta\n\nResumen: se ha publicado una consulta nueva sin índice. Ahora cada lectura recorre la tabla de principio a fin en vez de saltar a la fila que quiere. Los escaneos se acumulan, y todo lo que espera a la Base de datos espera más.\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `Re: consulta lenta (ha vuelto)`,
        body: `Hola otra vez,\n\nOtra consulta sin índice. La misma historia que la última vez: no hay por dónde buscar las filas, así que cada lectura recorre la tabla de la primera fila a la última.\n\nEn algún lugar, una Base de datos está leyendo la guía telefónica para encontrar un número. Es la suya.\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `Su tabla se está leyendo de cabo a rabo`,
        body: `Hola,\n\nAviso rápido: ha llegado una consulta nueva sin índice. Eso significa que no hay atajos. Cada lectura recorre la tabla entera, y el día de la Base de datos se acaba de alargar bastante.\n\nLas lecturas seguirán lentas hasta que esto termine.\n\nUn saludo,\n${from}\n\nP.D. “En mi portátil iba rápido” es cierto. Su portátil tiene once filas.`,
      }),
    ],
    'event.incident-poison': [
      ({ from }) => ({
        subject: `[ACTIVADO] Mensaje envenenado en la cola`,
        body: `Incidente: mensaje envenenado\nUrgencia: Alta\n\nUna tarea falla una y otra vez. Los workers la reintentan en lugar de vaciar la cola, así que la fila que hay detrás no avanza.\n\nLa tarea no va a salir bien en el intento 400. No lo hizo en el 3.\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `La misma tarea ha fallado. Y ha fallado. Y ha fallado.`,
        body: `Hola,\n\nHemos agrupado estos avisos en un solo problema porque todos son lo mismo: una tarea que falla una y otra vez.\n\nQué está pasando: sus workers reintentan la tarea que falla en lugar de vaciar la cola. Eso es un mensaje envenenado. Todo lo que está en cola detrás espera.\n\nEventos: seguimos contando\nUsuarios afectados: todos los de la fila\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `Profundidad de la cola: sube. Trabajo completado: plano.`,
        body: `Hola,\n\nDos de sus paneles se contradicen. La profundidad de la cola no deja de subir. El trabajo completado se ha aplanado.\n\nLa causa es una única tarea que falla sin parar. Los workers la reintentan una y otra vez en lugar de vaciar la cola, así que el trabajo nuevo se amontona.\n\nEl gráfico no está roto. La cola sí.\n\nEl equipo de ${from}`,
      }),
      ({ from }) => ({
        subject: `Re: mensaje envenenado, otra vez`,
        body: `Hola,\n\nUna tarea que no puede salir bien vuelve a estar en el menú. Los workers la reintentan en lugar de avanzar por la cola, lo cual es muy leal por su parte pero no sirve de nada.\n\nLa cola se llena mientras lo intentan.\n\nUn saludo,\n${from}`,
      }),
      ({ from }) => ({
        subject: `Incidente abierto: la cola no se vacía`,
        body: `Estimado ingeniero de guardia:\n\nEn el momento de redactar este aviso, una tarea de su cola ha fallado en todos sus intentos. Los workers siguen reintentándola en lugar de vaciar la cola. En el sector, esto se conoce como mensaje envenenado; en la oficina, se conoce como “por qué está todo atascado”.\n\nEste aviso irá seguido de más avisos.\n\nAtentamente,\nGestión de incidentes de ${from}`,
      }),
    ],
    'event.incident-ddos': [
      ({ from }) => ({
        subject: `Alerta de ataque DDoS HTTP: su edge`,
        body: `Alerta de ataque DDoS HTTP\n\nDescripción: una avalancha de tráfico basura está golpeando su edge.\nDetectado: ahora mismo\nTipo de ataque: inundación HTTP, artesanal\nTasa máxima: sí\nObjetivo del ataque: usted\nRegla que coincidió: “Peticiones que no quieren nada”\n\nEstamos entre la avalancha y su Diseño. Somos muy grandes, y nos gustaría que lo recordara cuando toque renovar.\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `Comprobando si su tráfico es humano...`,
        body: `Comprobando si su tráfico es humano. Esto puede tardar unos segundos.\n\n...\n\nNo es humano.\n\nUna avalancha de tráfico basura está golpeando su edge. Hemos visto botnets antes, pero esta tiene alcance: refrigeradores inteligentes, un parquímetro y al menos un monitor de bebé, todos pidiendo su página de inicio a la vez.\n\nPermanezca a la espera.\n\nEl equipo de Confianza y Seguridad de ${from}`,
      }),
      ({ from }) => ({
        subject: `¡Atención requerida! Su edge está bajo ataque`,
        body: `¡Atención requerida!\n\n¿Qué ha pasado?\nUna avalancha de tráfico basura está golpeando su edge. Ninguna de estas peticiones quiere comprar nada. Solo quieren llegar, todas, al mismo tiempo.\n\n¿Qué puedo hacer?\nSi es un visitante: nada. Probablemente sea una tostadora.\nSi el sitio es suyo: mire el Tablero y compruebe cómo aguanta su Diseño una ola de este tamaño.\n\nRay ID: 8b0f13c7a2e9\nRendimiento y seguridad de ${from}`,
      }),
      ({ from }) => ({
        subject: `Lo sentimos, han sido bloqueados (no usted)`,
        body: `Lo sentimos, ha sido bloqueado.\n\nNo usted. Ellos. Una avalancha de tráfico basura está golpeando su edge, y les estamos mostrando esta página unos cuantos millones de veces por minuto.\n\nEn algún punto de la cola están sus usuarios reales, en su novena imagen de semáforos. Les gustaría que supiera que encontraron todas las bicicletas.\n\nUn saludo,\nEl equipo Edge de ${from}`,
      }),
      ({ from }) => ({
        subject: `Re: la inundación (sigue inundando)`,
        body: `Hola otra vez,\n\nEl tráfico basura contra su edge no ha aflojado. Si acaso, ha traído amigos.\n\nNuestra red gestiona una parte muy grande de internet, y hoy una parte preocupante de esa cuota tiene que ver con usted. Enhorabuena por caerle bien a la gente equivocada.\n\nSeguimos en pie,\n${from}\n\nP.D. Si hoy más tarde se apaga medio internet, la culpa será nuestra, no de ellos.`,
      }),
    ],
    'event.incident-stampede': [
      ({ from }) => ({
        subject: `[ACTIVADO] Estampida de caché`,
        body: `Incidente: estampida de caché\nServicios: Caché, Base de datos\nUrgencia: Alta\n\nLa Caché se ha reiniciado vacía. Ahora cada petición es un fallo de caché, y cada fallo va directo a la Base de datos. Todas a la vez. Juntas. Como un rebaño.\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `Tasa de aciertos de caché: 0%. Base de datos: mal.`,
        body: `Hola,\n\nSu tasa de aciertos de caché cayó a cero en el momento en que la Caché se reinició. Volvió vacía, sin nada que servir.\n\nAsí que cada fallo va a la Base de datos, y el panel de la Base de datos ahora parece un acantilado dibujado al revés.\n\nPrepárese.\n\nEl equipo de ${from}`,
      }),
      ({ from }) => ({
        subject: `La carga de la Base de datos se disparó tras reiniciar la Caché`,
        body: `Hola,\n\nLa carga de la Base de datos acaba de pegar un salto. Lo hemos rastreado: la Caché se reinició vacía, y ahora cada petición falla y corre a la Base de datos a por la respuesta.\n\nEsto se llama estampida de caché. Su Base de datos es lo que está siendo pisoteado.\n\nPrimera detección: justo después del reinicio\n\n— ${from}`,
      }),
      ({ from }) => ({
        subject: `Re: estampida de caché (otra más)`,
        body: `Hola otra vez,\n\nLa Caché se ha reiniciado vacía otra vez, y el rebaño ha vuelto: cada fallo va a la Base de datos al mismo tiempo.\n\nNo es nada personal contra su Base de datos. Es simplemente la única que queda y sabe las respuestas.\n\nUn saludo,\n${from}`,
      }),
      ({ from }) => ({
        subject: `Su Caché se ha despertado con amnesia`,
        body: `Buenos días (en algún lugar de guardia siempre es por la mañana),\n\nLa Caché se ha reiniciado y ha vuelto sin recordar nada. Eso es normal en una caché. Lo que no tiene gracia es lo que pasa después: cada petición falla, y cada fallo va a la Base de datos.\n\nImagínese una biblioteca en la que el mostrador de recepción ha olvidado todas las respuestas, así que todo el mundo camina al archivo a la vez. El archivo es su Base de datos.\n\nUn saludo,\nRespuesta a incidentes de ${from}`,
      }),
    ],
    'event.incident-zone': [
      ({ from, zone }) => ({
        subject: `[ACTIVADO] La zona ${zone} está caída`,
        body: `Incidente: caída de zona\nZona: ${zone}\nUrgencia: Alta\nEstado: ACTIVADO\n\nLa zona ${zone} está caída. Todo lo que ejecuta allí es inalcanzable hasta que vuelva.\n\nUsted se entera antes de que la página de estado diga nada. Eso es el servicio.\n\n${from}`,
      }),
      ({ from, zone }) => ({
        subject: `Todos los paneles de la zona ${zone} se han aplanado`,
        body: `Hola,\n\nToda una fila de su cuadro de mando se aplanó de golpe. No es casualidad: la zona ${zone} está caída.\n\nUn gráfico plano es mala suerte. Una zona entera de ellos es geografía.\n\nUn saludo,\nEl equipo de ${from}`,
      }),
      ({ from, zone }) => ({
        subject: `Errores de todo lo que hay en la zona ${zone}`,
        body: `Hola,\n\nHemos recibido una ráfaga de errores de todos los nodos de la zona ${zone} en el mismo momento, así que lo comprobamos: la zona misma está caída.\n\nNo es un bug en su código. Esta vez.\n\nNosotros lo vimos primero. Usted lo está viendo ahora.\n\n— ${from}`,
      }),
      ({ from, zone }) => ({
        subject: `La zona ${zone} ha vuelto a caer`,
        body: `Hola,\n\nLa zona ${zone} ha vuelto a caer. La misma zona, la misma caída, la misma sensación en el estómago.\n\nLe diríamos que la página de estado del proveedor sigue mostrando todo en verde, pero probablemente ya lo ha adivinado.\n\nUn saludo,\n${from}`,
      }),
      ({ from, zone }) => ({
        subject: `Evento de disponibilidad: zona ${zone}`,
        body: `EVENTO DE DISPONIBILIDAD\n\nZona afectada: ${zone}\nEstado: caída\nRecursos afectados: todo lo que hay en la zona ${zone}\n\nHay una caída de zona en curso. Los recursos de las demás zonas no se ven afectados por este evento. Los recursos de la zona ${zone} se ven muy afectados por este evento.\n\nHabrá actualizaciones cuando haya algo que actualizar.\n\nRespuesta a incidentes de ${from}`,
      }),
    ],
    'event.incident-breach': [
      ({ from }) => ({
        subject: `[SEV1] Brecha de datos: un aviso que no parcheó`,
        body: `Incidente: brecha de datos\nUrgencia: Crítica\n\nAlguien ha usado una vulnerabilidad que se le comunicó con una fecha límite, y la fecha pasó. Los datos de clientes se han ido del edificio. Los Usuarios se están yendo detrás de ellos.\n\nEl ticket ha desaparecido del backlog. La consecuencia no.\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `Se lo dijimos (estaba en el backlog)`,
        body: `Hola,\n\nEl aviso que estaba en su backlog, en rojo, ha sido explotado. Los datos han salido. Una parte de sus Usuarios ha leído la noticia y se está marchando a otra parte.\n\nPara esto no hay botón. Pasará. Parchee el siguiente a tiempo.\n\nAtentamente,\nEl equipo de ${from}`,
      }),
      ({ from }) => ({
        subject: `Brecha confirmada`,
        body: `Confirmado: la vulnerabilidad de su ticket vencido ha sido explotada.\n\nImpacto: datos de clientes, Usuarios y confianza, en ese orden.\nEstado: en curso\nCausa raíz: un ticket que no se completó antes de su fecha límite\n\n${from}`,
      }),
    ],
    'event.incident-phishing': [
      ({ from }) => ({
        subject: `[SEV1] Credenciales usadas: un inicio de sesión que no esperábamos`,
        body: `Incidente: filtración de credenciales
Urgencia: Crítica

Una de sus claves de acceso se ha usado desde una dirección desde la que ninguno de nosotros ha iniciado sesión nunca. El tráfico es real, la sesión es real, y a la clave no la robó nada ingenioso: alguien la escribió en una página que parecía la del proveedor.

La página estaba en su Bandeja de entrada esta mañana. La dirección, no.

Los Usuarios se están enterando junto con nosotros.

${from}`,
      }),
      ({ from }) => ({
        subject: `Volumen inusual de inicios de sesión en su cuenta`,
        body: `Hola,

Estamos viendo inicios de sesión con sus credenciales desde un lugar donde no está. Se abrieron sesiones, se leyó información y, desde entonces, una de las claves se ha usado para curiosear.

Esto no es una vulnerabilidad de nada de lo que ejecuta. Es una persona que leyó un correo y se fió de la dirección que figuraba en él.

Mantendremos este incidente abierto hasta que se consuma.

${from}`,
      }),
      ({ from }) => ({
        subject: `Sesión sospechosa abierta con su clave`,
        body: `Alerta: se ha abierto una sesión con una clave de acceso que le pertenece.

Ubicación: no donde está
Dispositivos: uno, desconocido
Qué leyó: lo suficiente
Por qué funcionó: las credenciales eran reales y se entregaron a propósito, a una página que no era la nuestra.

Deje que pase. La próxima vez, lea el dominio antes que el logotipo.

${from}`,
      }),
    ],
    'event.incident-psp': [
      ({ from }) => ({
        subject: `[ACTIVADO] Proveedor de pagos caído`,
        body: `Incidente: caída del proveedor de pagos\nServicio: Pagos\nUrgencia: Alta\n\nEl Proveedor de pagos está caído, así que los pagos fallan. Los clientes llenan sus carritos y se van sin nada.\n\nEsta vez no es su código. Pero sigue siendo su dinero.\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `Los pagos completados se han aplanado`,
        body: `Hola,\n\nSu panel de pagos completados acaba de aplanarse. El tráfico sigue ahí y los carritos siguen llenándose. El dinero no llega.\n\nEl Proveedor de pagos está caído, así que cada compra falla en el último paso.\n\nEl equipo de ${from}`,
      }),
      ({ from }) => ({
        subject: `PaymentError: proveedor no disponible`,
        body: `Hola,\n\nNuevo problema: todas las compras fallan con el mismo error. El Proveedor de pagos está caído y no responde.\n\nUsuarios afectados: todos los que intentaron pagarle\nPrimera detección: ahora mismo\n\nLo sabemos. Es el error del que quería ver menos.\n\n— ${from}`,
      }),
      ({ from }) => ({
        subject: `Re: Proveedor de pagos caído (otra vez)`,
        body: `Hola otra vez,\n\nEl Proveedor de pagos está caído otra vez, y las compras vuelven a fallar. Los clientes quieren darle dinero. La tubería entre ellos y usted no funciona.\n\nLe avisaremos cuando termine.\n\nUn saludo,\n${from}`,
      }),
      ({ from }) => ({
        subject: `Sus clientes están intentando pagarle`,
        body: `Hola,\n\nEs un problema precioso de describir y terrible de tener: la gente quiere comprar y no puede. El Proveedor de pagos está caído, así que las compras fallan.\n\nNada de su lado lo ha causado. Y nada de su lado está ingresando mientras dura.\n\nSiento ser yo quien se lo dice,\n${from}`,
      }),
    ],
    'event.resolved': [
      ({ from, incident }) => ({
        subject: `[RESUELTO] ${incident}`,
        body: `Hola,\n\nEl siguiente incidente se ha resuelto:\n\n${incident}\nEstado: RESUELTO\nDuración: lo bastante larga\n\nYa puede volver a lo que estaba haciendo. Nosotros tampoco nos acordamos de qué era.\n\n${from}`,
      }),
      ({ from, incident }) => ({
        subject: `[OK] ${incident} ha quedado resuelto`,
        body: `Hola,\n\nBuenas noticias, por una vez: ${incident} ha terminado. Las gráficas vuelven a tener las formas que le gustan. Ni planas ni precipicios, solo líneas.\n\nSeguiremos vigilando. Debería dormir.\n\nEl equipo de ${from}`,
      }),
      ({ from, incident }) => ({
        subject: `Resuelto: ${incident}`,
        body: `Hola,\n\nHemos marcado ${incident} como resuelto. No hay eventos nuevos desde que terminó.\n\nSi vuelve, lo marcaremos como regresión y se lo diremos enseguida. Siempre lo vemos primero.\n\n— ${from}`,
      }),
      ({ from, incident }) => ({
        subject: `Re: ${incident} — todo despejado`,
        body: `Todo despejado.\n\n${incident} ha terminado. Ya no queda nada por hacer salvo soltar el aire.\n\nGracias por aguantar hasta el final. La mayoría ya habría metido el teléfono en un cajón.\n\n${from}`,
      }),
      ({ from, incident }) => ({
        subject: `Incidente cerrado: ${incident}`,
        body: `INCIDENTE CERRADO\n\nIncidente: ${incident}\nEstado: resuelto\nAcciones del postmortem: ninguna registrada\n\nEste incidente ha terminado.\n\nGracias por su paciencia. Sus usuarios agradecen menos, pero han vuelto.\n\n${from} Respuesta a incidentes`,
      }),
    ],
    'event.resolved-action': [
      ({ from, incident, action }) => ({
        subject: `[RESUELTO] ${incident} + 1 acción pendiente`,
        body: `Hola,\n\n${incident} se ha resuelto.\n\nAcción pendiente del postmortem:\n- Investigar ${action}\n\nHasta que se investigue ${action}, ${incident} tiene el doble de probabilidades de repetirse. Diríamos “sin presión”, pero sería mentira.\n\n${from}`,
      }),
      ({ from, incident, action }) => ({
        subject: `${incident} ha terminado. Aquí tiene los deberes.`,
        body: `Hola,\n\nLas gráficas se han recuperado y ${incident} ha terminado.\n\nEl postmortem ha salido con una acción pendiente: investigar ${action}. Hasta que se haga, este incidente tiene el doble de probabilidades de repetirse. Sus cuadros de mando lo verán venir. Lo que no pueden es evitarlo.\n\nEl equipo de ${from}`,
      }),
      ({ from, incident, action }) => ({
        subject: `Resuelto, con una nota: ${incident}`,
        body: `Hola,\n\nMarcado como resuelto: ${incident}.\n\nAdjuntamos la única acción pendiente del postmortem: investigar ${action}.\n\nRiesgo de regresión: hasta que se investigue ${action}, ${incident} tiene el doble de probabilidades. Estaremos aquí para verlo primero.\n\n— ${from}`,
      }),
      ({ from, incident, action }) => ({
        subject: `Postmortem: ${incident}`,
        body: `Postmortem sin culpables\n\nQué pasó: ${incident}\nEstado: terminado\nCausa raíz: nadie, como manda la tradición\n\nAcciones pendientes:\n1. Investigar ${action}.\n\nHasta que se complete la acción 1, ${incident} tiene el doble de probabilidades de repetirse. No deje que se una al resto de acciones pendientes en el backlog, ese lugar al que las acciones van a jubilarse.\n\n${from} Respuesta a incidentes`,
      }),
      ({ from, incident, action }) => ({
        subject: `Re: ${incident} — terminado, pero`,
        body: `Hola,\n\n${incident} ha terminado. Antes de que cierre la pestaña: el postmortem dice que hay que investigar ${action}.\n\nNo es una sugerencia. Hasta que se investigue ${action}, ${incident} tiene el doble de probabilidades de volver. Preferiríamos no volver a escribirle este correo, y sospechamos que usted preferiría no volver a leerlo.\n\nUn saludo,\n${from}`,
      }),
    ],
    'event.drawer': [
      ({ from }) => ({
        subject: `Acción necesaria: su cajón de Pagos está lleno`,
        body: `Hola,\n\nSu cajón de Pagos está lleno. Los ingresos nuevos no tienen adónde ir, así que se derraman por el borde en lugar de quedarse donde usted los guarda.\n\nNuestras comisiones, para su tranquilidad, no se ven afectadas. Las comisiones están sujetas a comisiones, y ambas van bien.\n\nGracias,\nEl equipo de ${from}`,
      }),
      ({ from }) => ({
        subject: `Sus fondos están en revisión (y desbordándose)`,
        body: `Estimado cliente:\n\nHemos detectado una actividad inusual en su cuenta: éxito. Su cajón de Pagos está lleno y los ingresos se están desbordando.\n\nHemos revisado esta situación a fondo y podemos confirmar que está ocurriendo.\n\nAtentamente,\nServicios para comercios\n${from}`,
      }),
      ({ from }) => ({
        subject: `Cajón de Pagos: lleno`,
        body: `Hola,\n\nBreve. El cajón de Pagos está lleno. Los ingresos que llegan ahora se derraman en vez de quedarse.\n\nEs dinero que usted ganó, cayendo al suelo. Pensamos que querría saberlo.\n\n${from} Atención a comercios`,
      }),
      ({ from }) => ({
        subject: `Re: cajón de Pagos — sigue lleno`,
        body: `Hola de nuevo,\n\nLe recordamos que su cajón de Pagos vuelve a estar lleno y que los ingresos vuelven a derramarse.\n\nYa enviamos este aviso antes. Lo enviaremos otra vez. Somos muy buenos enviando avisos; los pagos son lo que nos hizo famosos por ir despacio.\n\nUn saludo,\nEl equipo de ${from}`,
      }),
      ({ from }) => ({
        subject: `Su saldo no tiene adónde ir`,
        body: `Hola,\n\nEste es el resumen de su cuenta hoy:\n\n- Cajón de Pagos: lleno\n- Ingresos nuevos: derramándose\n- Su estado de ánimo: nos lo imaginamos\n\nCada venta a partir de ahora cae al suelo junto al cajón en vez de dentro. Es el problema más agradable que puede tener un negocio, hasta que deja de serlo.\n\nUn saludo,\nÉxito de comercios en ${from}`,
      }),
    ],
    'event.oom': [
      ({ from, node }) => ({
        subject: `[Puede requerir acción] ${node} se ha reiniciado`,
        body: `Hola,\n\nNos ponemos en contacto porque su recurso ${node} se quedó sin memoria y se reinició.\n\nTipo de evento: OUT_OF_MEMORY_RESTART\nRecurso afectado: ${node}\nEstado: Cerrado (reiniciado)\n\nSi tiene preguntas, nuestro equipo de soporte está disponible en un plan que usted no tiene.\n\nAtentamente,\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `${node} se olvidó de todo`,
        body: `Hola,\n\n${node} llenó su memoria hasta el borde, se volcó y se reinició. Ya está de vuelta con la mente en blanco y sin recuerdo del incidente, que es más de lo que podemos decir de sus logs.\n\nUn saludo,\nEl equipo de ${from}`,
      }),
      ({ from, node }) => ({
        subject: `Sin memoria: ${node}`,
        body: `Instancia: ${node}\nEvento: sin memoria\nResultado: reiniciado\n\n${node} usó toda su RAM, así que se mató el proceso y el nodo se reinició. Este aviso es informativo. En cierto modo, el reinicio también lo fue.\n\n${from} Notificaciones de Compute`,
      }),
      ({ from, node }) => ({
        subject: `${node} se quedó sin memoria otra vez`,
        body: `Hola,\n\n${node} se ha quedado sin memoria otra vez, y se ha reiniciado otra vez.\n\nHemos notado un patrón. Somos un proveedor de nube; notar patrones y cobrarlos es casi todo lo que hacemos.\n\nUn saludo,\n${from} Panel de estado`,
      }),
      ({ from, node }) => ({
        subject: `Sobre la pequeña siesta de ${node}`,
        body: `Estimado cliente:\n\nAproximadamente ahora mismo, ${node} intentó usar más memoria de la que tenía. Nuestros sistemas respondieron como responden los sistemas: se detuvo el proceso y ${node} se reinició.\n\nNos gustaría tranquilizarle: ningún hardware resultó dañado. Puede que algunas peticiones sí. Le pedimos disculpas por las molestias y por este correo.\n\nUn cordial saludo,\nComunicaciones con clientes, ${from}`,
      }),
    ],
    'event.credits': [
      ({ from, node }) => ({
        subject: `${node} se ha quedado sin créditos de CPU`,
        body: `Hola,\n\nSu instancia ${node} ha usado todos sus créditos de CPU. Ahora está limitada al 20% de su CPU.\n\nRecurso afectado: ${node}\nLímite de CPU actual: 20%\n\nEsto funciona según lo diseñado. Nuestro diseño, no el suyo.\n\nAtentamente,\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `${node} ahora funciona al 20%`,
        body: `Hola,\n\nBuenas noticias: ${node} sigue funcionando. Noticias menos buenas: se quedó sin créditos de CPU, así que está limitado al 20%.\n\nTodavía puede hacer una quinta parte del trabajo. Como una reunión que podría haber sido un correo.\n\nGracias,\nEl equipo de ${from}`,
      }),
      ({ from, node }) => ({
        subject: `Su ráfaga se ha agotado`,
        body: `AVISO DE SALDO\n\nRecurso: ${node}\nSaldo de créditos de CPU: 0\nCPU disponible: 20%\n\n${node} funcionó a ráfagas hasta que se acabaron los créditos. Ahora está limitado al 20%.\n\nLos créditos iban incluidos en el precio. La limitación también, sin cargo extra.\n\n${from} Facturación y Compute`,
      }),
      ({ from, node }) => ({
        subject: `${node} está limitado otra vez`,
        body: `Hola de nuevo,\n\n${node} se ha quedado otra vez sin créditos de CPU y vuelve a funcionar al 20%.\n\nAlgunas instancias están hechas para hacer sprint. La suya está hecha para hacer sprint y luego sentarse un buen rato.\n\nUn saludo,\n${from}`,
      }),
      ({ from, node }) => ({
        subject: `Aviso de rendimiento para ${node}`,
        body: `Estimado cliente:\n\nLe escribimos para informarle de que ${node} se ha quedado sin créditos de CPU. Su CPU está ahora limitada al 20%, así que el trabajo que haga tardará más mientras dure esta situación.\n\nEste aviso no requiere respuesta. Las respuestas no se leen. Estadísticamente, este aviso tampoco.\n\nUn cordial saludo,\nEl equipo de ${from}`,
      }),
    ],
    'event.alert': [
      ({ from, alert, seconds }) => ({
        subject: `ALARMA: “${alert}”`,
        body: `Recibe este correo porque su regla de alerta “${alert}” ha entrado en el estado FIRING.\n\nMotivo: umbral superado y mantenido durante ${seconds} segundos.\nCambio de estado: OK -> FIRING\n\nConsulte esta alerta en el cuadro de mando que nunca cierra.\n\n${from}`,
      }),
      ({ from, alert, seconds }) => ({
        subject: `[FIRING:1] ${alert}`,
        body: `Firing\n\nRegla: ${alert}\nDuración: ${seconds}s\nSeveridad: page\n\nEsta regla se ha cumplido durante ${seconds} segundos, tiempo suficiente para contar y demasiado para ignorar.\n\nSu gráfica está haciendo algo. Eso no es bueno.\n\n${from}`,
      }),
      ({ from, alert, seconds }) => ({
        subject: `Alerta activada: ${alert}`,
        body: `Hola,\n\nUna de sus reglas de alerta acaba de dispararse:\n\n${alert}\n\nAguantó ${seconds} segundos antes de que dijéramos algo. Queríamos estar seguros. Lo estamos. Lo vimos primero; ahora le toca a usted.\n\n— ${from}`,
      }),
      ({ from, alert, seconds }) => ({
        subject: `[PAGE] ${alert} (${seconds}s)`,
        body: `Hola,\n\nSe le ha paginado.\n\nAlerta: ${alert}\nDuración: ${seconds} segundos\nUrgencia: Alta\n\nLa regla se mantuvo ${seconds} segundos, así que no es un parpadeo. Mírelo ahora, o al menos mírelo con cara de preocupación.\n\n${from}`,
      }),
      ({ from, alert, seconds }) => ({
        subject: `Re: ${alert} — vuelve a estar activa`,
        body: `Hola,\n\n“${alert}” vuelve a estar activa. Esta vez aguantó ${seconds} segundos.\n\nNo decimos que sea un patrón. Solo somos una gráfica de ello, y la gráfica tiene opinión.\n\n${from}`,
      }),
    ],
    'event.alert-ignored': [
      ({ from, alert }) => ({
        subject: `Nadie escucha a “${alert}”`,
        body: `Hola,\n\nLa regla “${alert}” ha gritado que viene el lobo cinco veces hoy. Su equipo ha dejado de escucharla.\n\nEs razonable, y también peligroso: la próxima alarma real de esta regla también se ignorará.\n\nSolución: cambie su umbral para que se dispare cuando algo vaya mal de verdad.\n\n${from}`,
      }),
      ({ from, alert }) => ({
        subject: `Informe de fatiga de alertas: “${alert}”`,
        body: `INFORME DE SALUD DE ALERTAS\n\nRegla: ${alert}\nFalsas alarmas hoy: 5\nPersonas que aún prestan atención: 0\n\nTras cinco falsas alarmas en un día, su equipo ignora esta regla. Una regla que nadie lee es un comentario muy caro.\n\nRecomendación: cambiar su umbral.\n\n${from}`,
      }),
      ({ from, alert }) => ({
        subject: `“${alert}” se ha convertido en ruido de fondo`,
        body: `Hola,\n\nCinco falsas alarmas hoy de “${alert}”. Su equipo ha aprendido, con muy buen criterio, a ignorarla.\n\nNos encantaría decir que la regla también aprenderá. No lo hará. Las reglas no aprenden. Las personas sí, y acaban de hacerlo.\n\nCambie su umbral y podrá recuperar su confianza.\n\nEl equipo de ${from}`,
      }),
      ({ from, alert }) => ({
        subject: `Ignorada: ${alert}`,
        body: `Hola,\n\nCinco falsas alarmas hoy. El equipo ya ignora “${alert}”.\n\nNosotros seguimos viéndolo todo primero. Ahora nadie lo ve después de nosotros.\n\nCambie el umbral de la regla para que solo se dispare cuando vaya en serio.\n\n— ${from}`,
      }),
      ({ from, alert }) => ({
        subject: `“${alert}” volvió a gritar que viene el lobo`,
        body: `Hola,\n\nQuizá recuerde esta. “${alert}” saltó cinco veces hoy, todas para nada, y el equipo vuelve a ignorarla.\n\nLo entendemos. Nadie quiere despertarse por una gráfica que está bien. Pero la regla no distingue entre estar bien y estar en llamas hasta que se lo dice.\n\nCambie su umbral.\n\nUn saludo,\n${from}`,
      }),
    ],
    'event.hired': [
      ({ from }) => ({
        subject: `Hola de parte del nuevo ingeniero`,
        body: `¡Hola!\n\nPrimer día. Soy ${from}, el nuevo ingeniero. Mi portátil funciona, he encontrado el café y ya me he estudiado toda la arquitectura, lo que me llevó cuatro minutos porque es un solo Tablero.\n\nCon ganas de empezar. Señálame algo y voy.\n\n${first(from)}`,
      }),
      ({ from }) => ({
        subject: `Me presento: ${from}`,
        body: `Hola a todos:\n\nSoy ${from}, y hoy es mi primer día en el equipo.\n\nUn poco sobre mí:\n- Me gustan los sistemas que no se caen\n- Me gustan más cuando no se caen por la noche\n- Tengo opiniones firmes sobre las pestañas y me las guardaré durante al menos una semana\n\nCon ganas de trabajar con el equipo.\n\nUn saludo,\n${first(from)}`,
      }),
      ({ from }) => ({
        subject: `¡hola! soy yo`,
        body: `hey, soy ${first(from)}. ¡primer día!\n\nme acaban de dar acceso a todo, lo que me parece mucha confianza para alguien a quien conocieron en una sola entrevista\n\n¿por dónde empiezo? encantado de quedarme con lo que nadie quiera\n\n${first(from)}`,
      }),
      ({ from }) => ({
        subject: `Día uno: presentándome al servicio`,
        body: `Hola,\n\nPresentándome al servicio. Credencial: sí. Silla: sí. Contexto: absolutamente ninguno todavía.\n\nMe han dicho que la mejor forma de aprender un sistema es romperlo con cuidado y arreglarlo rápido, así que tendré cuidado con la primera parte.\n\nQué alegría estar aquí. Gracias por darme una oportunidad.\n\n${first(from)}`,
      }),
      ({ from }) => ({
        subject: `Nuevo ingeniero, primer día, muchas preguntas`,
        body: `¡Buenos días!\n\nSoy ${from}. Oficialmente en el equipo desde hoy.\n\nTengo tres preguntas y probablemente tenga treinta para la hora de comer:\n1. ¿A quién le pregunto sobre la Base de datos?\n2. ¿Hay algún runbook?\n3. ¿“no hay runbook” es el runbook?\n\nMuy contento de estar aquí. Construyamos algo que no se caiga.\n\n${first(from)}`,
      }),
    ],
    'event.finished': [
      ({ from, item }) => ({
        subject: `Hecho: ${item}`,
        body: `Hola,\n\n${item} está hecho. Lo terminé justo ahora.\n\nSin drama, sin sorpresas, lo que en este trabajo cuenta como celebración. Los tests pasaron; los comprobé dos veces porque no me lo creía.\n\n¿Qué sigue?\n\n${first(from)}`,
      }),
      ({ from, item }) => ({
        subject: `Terminado: ${item}`,
        body: `Hola,\n\nActualización rápida: he terminado ${item}.\n\nSiguió el camino de siempre: parecía fácil, luego imposible, luego terminado. Me quedo con terminado.\n\nSi tienes lo siguiente preparado, estoy listo. Si no, iré a leer los logs por diversión.\n\nUn saludo,\n${first(from)}`,
      }),
      ({ from, item }) => ({
        subject: `${item} está terminado`,
        body: `ok, ¡${item} está terminado!\n\nla verdad pensé que tardaría más. o estoy yendo más rápido o me perdí algo. elijo creer lo primero\n\nlisto para la siguiente tarea cuando quieras\n\n${first(from)}`,
      }),
      ({ from, item }) => ({
        subject: `Otro más: ${item}`,
        body: `Hola,\n\nOtro fuera de la lista: ${item} está terminado.\n\nEmpiezo a disfrutar con esto. No se lo digas a nadie, arruina el misterio.\n\n¿Quieres que me ponga con algo más?\n\nGracias,\n${first(from)}`,
      }),
      ({ from, item }) => ({
        subject: `Actualización de estado: ${item}`,
        body: `Hola,\n\nActualización de estado, ya que prometí que escribiría estas:\n\nTarea: ${item}\nEstado: terminada\nBloqueos: ninguno\nCafé: uno de más\n\nEstá listo cuando quieras. Me pongo con lo siguiente de la lista.\n\n${first(from)}`,
      }),
    ],
    'event.deployed': [
      ({ from, features }) => ({
        subject: `Desplegado`,
        body: `Hola,\n\nAcabo de desplegar ${features}. Ya está en producción.\n\nLos cuadros de mando parecen tranquilos. Voy a seguir mirándolos los próximos veinte minutos de todos modos, por si la calma miente.\n\n${first(from)}`,
      }),
      ({ from, features }) => ({
        subject: `Notas del despliegue: ya está fuera`,
        body: `Hola a todos:\n\nNotas del despliegue, versión corta:\n\nDesplegado: ${features}\n¿Rollback necesario?: no\nViernes de por medio: no\n\nSalió mejor que mis últimos tres despliegues juntos. No voy a cuestionarlo.\n\nUn saludo,\n${first(from)}`,
      }),
      ({ from, features }) => ({
        subject: `¡¡ya está en producción!!`,
        body: `¡¡ya está en producción!!\n\n${features}, ahí fuera. los usuarios ya pueden tocarlo\n\nhice aquello de recargar la página después de desplegar como si fuera a cambiar algo. no cambió. eso es bueno\n\n${first(from)}`,
      }),
      ({ from, features }) => ({
        subject: `Otro desplegado`,
        body: `Hola,\n\nOtro despliegue fuera: ${features}.\n\nCada vez da un poco menos de miedo. Esta vez solo aguanté la respiración una parte del tiempo.\n\nAvísame si los usuarios dicen algo bonito. O algo, en general.\n\n${first(from)}`,
      }),
      ({ from, features }) => ({
        subject: `Lanzamiento completado`,
        body: `Hola,\n\nMe alegra informar de que el lanzamiento está completo. Hoy salió esto:\n\n${features}\n\nTodo está funcionando y todavía no he visto un error. Seguiré pendiente durante la tarde.\n\nGracias a quien lo revisó, incluida la persona que dijo “parece bien” sin leerlo. Sabes quién eres.\n\n${first(from)}`,
      }),
    ],
    'event.deployed-bad': [
      ({ from, features }) => ({
        subject: `Lo he roto`,
        body: `Hola,\n\nHe desplegado ${features} y tiene un bug. Los Servidores de aplicaciones se están cayendo.\n\nEs culpa mía. Lo siento. Lo estoy mirando ahora mismo. No recargues el cuadro de mando, solo empeora la situación para los dos.\n\n${first(from)}`,
      }),
      ({ from, features }) => ({
        subject: `Despliegue defectuoso: los Servidores de aplicaciones se caen`,
        body: `Hola,\n\nPrimero las malas noticias, y luego más malas noticias: ${features} salió con un bug y los Servidores de aplicaciones se caen por su culpa.\n\nLos tests pasaron. La revisión pasó. Producción no pasó.\n\nEstoy con ello. Escribiré de nuevo cuando sepa más.\n\n${first(from)}`,
      }),
      ({ from, features }) => ({
        subject: `uy`,
        body: `uy\n\nel despliegue de ${features} tenía un bug. Los Servidores de aplicaciones se caen\n\na mí me funcionaba. ahora caigo en que mi máquina no es donde están los usuarios\n\nperdón. en ello\n\n${first(from)}`,
      }),
      ({ from, features }) => ({
        subject: `Ha vuelto a pasar`,
        body: `Hola,\n\nSiento escribir este tipo de correo dos veces. El despliegue de ${features} tiene un bug y los Servidores de aplicaciones vuelven a caerse.\n\nLo sé. Estoy añadiendo “comprobarlo con más cuidado” a mi lista de cosas que ya creía que estaba haciendo.\n\nLo estoy investigando.\n\n${first(from)}`,
      }),
      ({ from, features }) => ({
        subject: `Incidente: mi despliegue tumba los Servidores de aplicaciones`,
        body: `Hola,\n\nEscribo esto antes de que nadie tenga que preguntar.\n\nQué: desplegué ${features}\nProblema: tiene un bug\nImpacto: los Servidores de aplicaciones se caen\nCulpa de: mía, a pesar del postmortem sin culpables\n\nEstoy con ello y seguiré hasta que esté arreglado.\n\n${first(from)}`,
      }),
    ],
    'event.migration': [
      ({ from, share }) => ({
        subject: `Progreso de la migración: ${share} en el nuevo Stack`,
        body: `Hola,\n\nActualización de la migración: el ${share} de sus Servidores de aplicaciones ya funciona sobre el nuevo Stack.\n\nNo hay ningún incidente que reportar, y por eso este correo es tan corto y nadie le ha despertado por ello.\n\n${from}`,
      }),
      ({ from, share }) => ({
        subject: `${share} de los Servidores de aplicaciones migrados`,
        body: `Hola,\n\nLa línea del nuevo Stack va hacia arriba y a la derecha, esta vez en el buen sentido: el ${share} de los Servidores de aplicaciones ya se ha migrado.\n\nAhora dos líneas comparten el panel, el Stack viejo y el nuevo. Elija su favorita. Ya sabemos cuál va a ganar.\n\nEl equipo de ${from}`,
      }),
      ({ from, share }) => ({
        subject: `Seguimiento del lanzamiento: nuevo Stack al ${share}`,
        body: `Hola,\n\nEstamos siguiendo el traslado: el ${share} de sus Servidores de aplicaciones ya funciona sobre el nuevo Stack.\n\nEstaremos atentos a cualquier cosa nueva que traiga consigo. Siempre lo estamos. Es lo único que hacemos.\n\n— ${from}`,
      }),
      ({ from, share }) => ({
        subject: `Re: migración — ahora ${share}`,
        body: `Hola de nuevo,\n\nLa migración sigue avanzando. El ${share} de los Servidores de aplicaciones ya está en el nuevo Stack.\n\nToda migración tiene un largo tramo intermedio en el que los dos Stacks funcionan y nadie recuerda muy bien por qué existía el viejo. Está usted en él.\n\nUn saludo,\n${from}`,
      }),
      ({ from, share }) => ({
        subject: `Estado: migración de Stack al ${share}`,
        body: `ESTADO DE LA MIGRACIÓN\n\nServidores de aplicaciones en el nuevo Stack: ${share}\nServidores de aplicaciones en el Stack viejo: el resto\nPáginas enviadas por esto: 0\n\nEste aviso es informativo. Nada está en llamas. Lo comprobamos dos veces, porque resultaba raro.\n\n${from}`,
      }),
    ],
    'spam.spam-datadug': [
      ({ from }) => ({
        subject: `Una pregunta rápida sobre tus paneles`,
        body: `Hola,\n\nVi que tu equipo despliega muy rápido. Me encanta esa energía.\n\nUna pregunta rápida: ¿cuántos paneles tienes ahora mismo? La mayoría de los fundadores dicen “dos, quizá”. Nuestros clientes tienen 1,140 de media, y 1,138 de ellos nunca se han abierto. A eso lo llamamos madurez de observabilidad.\n\n${from} ingiere cada log, métrica, traza y vibra que emite tu stack, y los guarda para siempre. Irte es técnicamente posible, del mismo modo que salir de un sistema de cuevas es técnicamente posible.\n\n¿Te viene bien una charla de 15 minutos esta semana?\n\nUn saludo,\nTyler\nEjecutivo de cuentas, ${from}`,
      }),
      ({ from }) => ({
        subject: `Re: Una pregunta rápida sobre tus paneles`,
        body: `Hola otra vez,\n\nTe lo reenvío para que quede arriba en tu bandeja de entrada, por si se perdió. (Si tuvieras ${from}, tendrías un panel que muestra exactamente cuánto se ha perdido.)\n\nMe viene bien el martes o el jueves.\n\nTyler`,
      }),
      ({ from }) => ({
        subject: `Tu prueba gratuita es una prueba para siempre*`,
        body: `¡Buenas noticias!\n\nTu equipo puede optar a una prueba gratuita de 14 días de ${from} Enterprise.\n\nQué incluye:\n- Paneles ilimitados\n- Alertas ilimitadas sobre tus paneles\n- Un panel de tus alertas sobre tus paneles\n- Métricas personalizadas, facturadas por métrica personalizada, por host, por hora, por sensación\n\n*Pasados los 14 días, tus datos se quedan con nosotros. Puedes exportarlos cuando quieras hablando con Ventas.\n\n¡Empieza tu prueba con un clic!\n\nEl equipo de crecimiento de ${from}`,
      }),
      ({ from }) => ({
        subject: `Vi tu factura y me acordé de ti`,
        body: `¡Hola!\n\nUno de nuestros clientes me acaba de decir que su factura de ${from} ya es mayor que su factura de la nube, su nómina y su alquiler juntos. Lo llamó “una señal de alarma”. Nosotros lo llamamos “un caso de éxito”.\n\nLa cuestión es que ahora puede ver que sus costes han subido un 400% en un precioso gráfico de áreas apiladas, en tiempo real. ¿Tu equipo podría decir lo mismo?\n\nTe he reservado 30 minutos en tu calendario. Puedes moverlos, pero no cancelarlos.\n\nUn saludo,\nTyler`,
      }),
      ({ from }) => ({
        subject: `¿Cierro tu expediente?`,
        body: `Hola,\n\nTe he escrito varias veces y no he recibido respuesta, así que supongo una de tres cosas:\n\n1. Estás contento volando a ciegas.\n2. Estás enterrado en un incidente que no puedes ver.\n3. Un competidor te ha cavado un hoyo y no puedes salir. Parpadea dos veces.\n\nEn cualquier caso, este es mi último correo. Probablemente. Nuestro software de secuencias tiene opiniones.\n\nUn abrazo,\nTyler de ${from}`,
      }),
    ],
    'spam.spam-slowflake': [
      ({ from }) => ({
        subject: `¿Tu base de datos de 4 GB está lista para la escala de petabytes?`,
        body: `Hola,\n\nNuestro equipo de datos hizo un escaneo rápido y calcula que tu base de datos ocupa unos 4 GB. ¡Las grandes cosas empiezan pequeñas!\n\nCon ${from}, esos 4 GB se pueden repartir entre un almacén de 64 nodos, un almacén de 128 nodos y un tercer almacén que monitoriza a los dos primeros. Las consultas que tardaban 9 milisegundos en tu portátil ahora tardan 40 segundos en nuestra nube, lo que demuestra que están haciendo un trabajo serio.\n\nLa facturación por segundo significa que solo pagas por lo que usas. Usarás mucho.\n\n¿Te envío una presentación?\n\nCon cariño,\nMadison, Evangelista de datos para Enterprise`,
      }),
      ({ from }) => ({
        subject: `Re: escala de petabytes`,
        body: `Hola,\n\nVuelvo por aquí. Sé que 4 GB parece manejable hoy. Eso es lo que dicen todos, justo antes de que alguien ejecute SELECT * un viernes y el autoescalador se despierte.\n\nAl equipo de ${from} le encantaría ayudarte a prepararte para ese momento y luego enviarte un resumen detallado de ese momento.\n\nMadison`,
      }),
      ({ from }) => ({
        subject: `Tu previsión de créditos está lista`,
        body: `PREVISIÓN DE CRÉDITOS: CLIENTE POTENCIAL DE NIVEL GRATUITO\n\nCréditos mensuales estimados: 3\nCréditos mensuales estimados después de un analista curioso: 41,000\nCréditos mensuales estimados después de un panel configurado para actualizarse cada minuto: sí\n\nPlan recomendado: Enterprise Plus Platinum Snow\n\nLos almacenes de ${from} se suspenden automáticamente tras 10 minutos de inactividad. Los paneles nunca están inactivos.\n\nPara hablar de tu previsión, responde a este correo. Las respuestas son gratuitas.`,
      }),
      ({ from }) => ({
        subject: `Una historia de cliente con la que te identificarás`,
        body: `Hola,\n\nQuería compartir una historia rápida. Una startup de tu tamaño trasladó sus 4 GB de pedidos a ${from}. En un mes, sus analistas hacían preguntas que nunca se les habría ocurrido hacer, como “¿quién aprobó esto?” y “¿cómo va lo del cobro por segundo?”.\n\nHoy tienen una cultura lean y basada en datos. Sobre todo lean.\n\nPidieron permanecer en el anonimato y también nos pidieron que dejáramos de llamar.\n\n¿Te interesaría una sesión de descubrimiento de 20 minutos?\n\nUn saludo,\nMadison`,
      }),
      ({ from }) => ({
        subject: `Data Pillow Summit: entradas gratis para fundadores`,
        body: `Hola,\n\nEstás invitado al ${from} Summit, donde 12,000 ingenieros se reúnen en una sola sala para aprender a poner una almohada encima de un lago.\n\nLo más destacado:\n- Keynote: “Clonación sin copia, facturas con copias infinitas”\n- Taller: Ajusta tus 4 GB a la era cloud\n- Mesa redonda: Facturación por segundo, arrepentimiento por minuto\n\nTu entrada es gratis. La comida se factura por consumo.\n\nNos vemos allí,\nEl equipo de eventos de ${from}`,
      }),
    ],
    'spam.spam-devnull': [
      ({ from }) => ({
        subject: `Escrituras en 0 ms. Garantizado.`,
        body: `Hola,\n\n¿Cansado de las escrituras lentas? ${from} acepta todas las escrituras que le envíes en cero milisegundos, a cualquier escala, para siempre.\n\n¿Cómo? Hemos reinventado la durabilidad desde los primeros principios y descubrimos que era opcional.\n\nNuestros benchmarks:\n- Rendimiento: ilimitado\n- Latencia p99: 0 ms\n- Pérdida de datos: dentro de los parámetros esperados\n\nEs rápido. Es duradero. Es webscale.\n\n¿Montamos una prueba de concepto? Terminará al instante.\n\nEl equipo de ${from}`,
      }),
      ({ from }) => ({
        subject: `Re: Escrituras en 0 ms`,
        body: `Hola,\n\nSolo lo subo otra vez. Varios fundadores han preguntado si ${from} admite lecturas.\n\n¡Buena pregunta! Las lecturas están disponibles en nuestro nivel Enterprise, con precio por lectura y un compromiso mínimo de tres años. Nuestro equipo de ingeniería de ventas estará encantado de explicarte qué vas a leer.\n\nHablamos pronto,\nDerek\nArquitecto de soluciones`,
      }),
      ({ from }) => ({
        subject: `¿Tu base de datos es de escala web?`,
        body: `Fundador,\n\nTu base de datos usa transacciones. Bloqueos. Índices. Un log de escritura anticipada. ¿Sabes qué no tiene nada de eso? ${from}.\n\nNo hacemos joins, porque los joins no escalan. No hacemos esquemas, porque los esquemas no escalan. No guardamos datos, porque, seamos honestos, los datos no escalan.\n\nHacemos sharding hacia /dev/null y luego hacemos sharding de ese shard. Es /dev/null hasta el fondo.\n\nMigra hoy. No hay nada a lo que volver.\n\nDerek`,
      }),
      ({ from }) => ({
        subject: `${from} ya cumple SOC 2`,
        body: `ANUNCIO\n\nNos enorgullece compartir que ${from} ha completado su auditoría SOC 2 sin ningún hallazgo.\n\nLos auditores no pudieron localizar ningún dato de cliente, así que ninguno pudo gestionarse mal. Describieron nuestra política de retención como “inmediata” y nuestros controles de acceso como “irrelevantes”.\n\nTus datos nunca han estado más seguros. Tus datos nunca han estado en ningún sitio.\n\nReserva una revisión de seguridad con nuestro equipo. No traigas nada; te irás con nada.`,
      }),
      ({ from }) => ({
        subject: `Vamos a retirar el nivel gratuito (más o menos)`,
        body: `Hola,\n\nUna nota rápida sobre precios. A partir del mes que viene, el nivel gratuito de ${from} seguirá aceptando escrituras ilimitadas sin coste. Eso no cambia.\n\nLo que sí cambia: nuestro producto de copias de seguridad, antes “no disponible”, ahora estará “disponible próximamente”. Nuestro producto de restauración seguirá siendo una función muy solicitada.\n\nGracias por ser una valiosa fuente de bytes. Hemos disfrutado de todos y cada uno de ellos, brevemente.\n\nCon cariño,\nDerek y el equipo`,
      }),
    ],
    'spam.spam-recruiter': [
      ({ from }) => ({
        subject: `Oportunidad rockstar para tus ingenieros 🚀`,
        body: `¡¡Hola!!\n\nSoy Chad, de ${from}. Me topé con tu equipo de ingeniería y, siendo honesto, me dejó alucinado. Auténticas rockstars. Ninjas totales.\n\nMi cliente es una startup en modo sigiloso, sin ingresos y con producto ya lanzado, que ofrece:\n- Vacaciones ilimitadas (por favor, no las tomes)\n- Pufs\n- Un grifo de kombucha que funciona los martes\n- Participación en una empresa que sin duda existirá\n\n¿Podrías reenviar esto a tu mejor perfil de backend? No encuentro su información de contacto, lo cual es raro porque encontré la tuya.\n\nUn saludo, bro,\nChad`,
      }),
      ({ from }) => ({
        subject: `Re: Oportunidad rockstar`,
        body: `Hola, solo lo subo otra vez.\n\n¿Tuviste ocasión de reenviarlo a tu equipo? Sin problema si no. Vamos a retomar tu retomada y luego tocamos base sobre el círculo.\n\nChad\n${from}`,
      }),
      ({ from }) => ({
        subject: `¿Está feliz tu persona de Base de datos?`,
        body: `Hola,\n\nPregunta rara, pero ¿qué tan feliz es tu ingeniero de base de datos, en una escala del 1 a “actualizando su perfil a las 2 de la mañana”?\n\nLo pregunto solo porque tengo un puesto perfecto para esa persona. Totalmente remoto, totalmente presencial o totalmente híbrido, según el día. El salario es competitivo, o sea, compite.\n\nLa entrevista son solo 9 rondas y una prueba para hacer en casa que debería llevar un fin de semana. Dos, como máximo.\n\nAvísame si quieres que contacte con esa persona directamente. Ya lo he hecho, pero me gustaría tener tu bendición.\n\nChad, Socio de Talento, ${from}`,
      }),
      ({ from }) => ({
        subject: `Se busca ingeniero 10x (con 15 años en tecnología de hace 3 años)`,
        body: `Hola,\n\nMi cliente busca un ingeniero 10x, idealmente un ingeniero 11x, con:\n- 15+ años en un framework publicado en 2023\n- Experto en todos los lenguajes, incluidos algunos que nos hemos inventado\n- Cómodo “usando muchos sombreros” (nosotros tenemos uno)\n- Pasión. Mucha pasión. La pasión es la compensación\n\nSi alguien de tu equipo encaja, reenvía esto. Si encajas TÚ, sinceramente mejor todavía, hablemos.\n\nHablamos pronto,\nChad 🤘\n${from}`,
      }),
      ({ from }) => ({
        subject: `Sigo adelante (aunque no del todo)`,
        body: `Hola,\n\nComo no he recibido respuesta, supongo que ahora no es el momento. Lo entiendo perfectamente. El momento lo es todo en el talento.\n\nVolveré a escribir en 6 semanas. También en 3 semanas. También mañana, desde otra dirección.\n\nMientras tanto, si alguno de tus ingenieros empieza a decir “solo quiero trabajar en algo que tenga sentido”, ya sabes dónde encontrarme.\n\nSigue arrasando,\nChad\nVicepresidente sénior de Bro de Talento, ${from}`,
      }),
    ],
    'spam.spam-conf': [
      ({ from }) => ({
        subject: `¡Ha sido seleccionado para hablar en ${from}!`,
        body: `Estimado líder de opinión:\n\n¡Enhorabuena! Nuestro comité de selección lo ha elegido para hablar en ${from} esta primavera, entre 4,000 ponentes seleccionados a mano.\n\nPara confirmar su plaza, solo tiene que elegir un paquete de patrocinio:\n\nBronce ($9,000): charla relámpago de 5 minutos, en el pasillo\nPlata ($24,000): sesión de 20 minutos, antes del desayuno\nOro ($60,000): keynote, con un cordón del color de su marca\nPlatino ($150,000): aplaudiremos\n\nLas plazas son limitadas. Confirme en las próximas 48 horas.\n\nUn cordial saludo,\nEl comité del programa de ${from}`,
      }),
      ({ from }) => ({
        subject: `Re: Su plaza como ponente`,
        body: `Buenos días:\n\nSigo con su invitación para hablar. Todavía no hemos recibido su confirmación de patrocinio, y el nivel Oro se está llenando rápido. Solo queda uno, más los cuatro que añadiremos si dice que sí.\n\nEl equipo de ${from}`,
      }),
      ({ from }) => ({
        subject: `CFP final: “Escalar a 10 usuarios y más allá”`,
        body: `LLAMADA A PONENCIAS: ÚLTIMA OPORTUNIDAD\n\nTracks de este año:\n- Webscale con presupuesto\n- Microservicios para tu monolito de uno\n- El blockchain de todo (vuelve por petición popular de un patrocinador)\n- IA, en general\n\nLas charlas aceptadas reciben: una franja de 15 minutos, una acreditación que dice PONENTE y una factura.\n\nEl proceso de revisión es ciego. Nuestros revisores solo miran su nivel de patrocinio.\n\nEnvíe antes del viernes.\n\nEl comité de ${from}`,
      }),
      ({ from }) => ({
        subject: `Tu stand te espera (son 2 m², cerca de los baños)`,
        body: `Hola, fundador:\n\nNada construye una marca como un stand. Por tiempo limitado, ${from} ofrece casetas de Startup Alley a un precio pensado para fundadores.\n\nTu caseta incluye un taburete, un enchufe (compartido) y el tráfico de todos los que van al baño, que, según nuestros datos, son todos.\n\nExtras: un segundo taburete, Wi-Fi y un cartel con tu nombre bien escrito.\n\nDímelo y te envío el contrato.\n\nBrooke\nAlianzas, ${from}`,
      }),
      ({ from }) => ({
        subject: `Resumen: ${from} fue nuestro mejor año hasta ahora`,
        body: `¡Qué año!\n\nGracias a todos los que vinieron a ${from}. Algunas cifras:\n\n- 9,000 asistentes\n- 8,700 de ellos eran ponentes\n- 312 charlas tituladas “Lecciones aprendidas”\n- 1 charla con lecciones\n- 41,000 bolsas de tela, ahora en un vertedero a escala webscale\n\nTodas las grabaciones están disponibles en nuestra web para los asistentes con pase de acceso total. Los pases de acceso total están disponibles para su compra.\n\nEl precio anticipado para el año que viene abre ahora y cierra cuando nos apetezca.\n\n¡Nos vemos allí!`,
      }),
    ],
    'spam.spam-incohere': [
      ({ from }) => ({
        subject: `¿Y si tu balanceador de carga pudiera pensar?`,
        body: `Hola,\n\nEl round-robin es de 2010. ${from} pone un modelo grande de lenguaje en tu balanceador de carga, para que cada petición la enrute un modelo que se ha leído todo internet y tiene sentimientos al respecto.\n\nEn los pilotos iniciales, nuestro router de IA redujo la latencia en el 12% de las peticiones y escribió un poema corto sobre el otro 88%.\n\nNos encantaría enseñarte una demo. La demo también está generada.\n\nUn saludo,\nAva\nFundadora y Directora de Vibras, ${from}`,
      }),
      ({ from }) => ({
        subject: `Re: ¿Y si tu balanceador de carga pudiera pensar?`,
        body: `Hola,\n\nSolo lo subo otra vez. Nuestra IA también se dio cuenta de que no respondiste y ha escrito tres seguimientos por mí. Este es el más educado.\n\nLos otros dos están en la carpeta “agéntica”.\n\nAva @ ${from}`,
      }),
      ({ from }) => ({
        subject: `Agentes para todo (sí, todo)`,
        body: `Fundador,\n\nImagina un mundo en el que cada parte de tu empresa es un agente:\n\n- Un agente escribe tu código\n- Un agente revisa el código\n- Un agente rechaza la revisión\n- Un agente escala a otro agente\n- Un agente escribe el postmortem\n- Un agente asiste al postmortem\n\nTú solo miras. O, por $40,000 al año, un agente mira por ti.\n\n${from} es la plataforma agéntica para empresas que quieren estar fuera del bucle.\n\nResponde SÍ para unirte a la lista de espera. Nuestro agente responderá QUIZÁ.`,
      }),
      ({ from }) => ({
        subject: `Hemos levantado $80M (antes del producto)`,
        body: `¡Gran noticia!\n\n${from} acaba de cerrar una ronda semilla de $80M, liderada por inversores que estaban muy entusiasmados con la diapositiva que decía “IA”.\n\nUsaremos los fondos para contratar, comprar GPUs y averiguar qué hacemos. Los primeros indicios apuntan a “un chatbot, pero para bases de datos”.\n\nComo uno de nuestros primeros 10,000 socios de diseño, obtienes acceso gratis y voz en nuestra hoja de ruta. La hoja de ruta es un prompt.\n\nAdelante,\nAva y la familia de ${from}`,
      }),
      ({ from }) => ({
        subject: `Tu correo en frío generado por IA`,
        body: `Hola {{first_name}},\n\n¡Espero que este correo te encuentre bien en {{city}}! Me impresionó mucho el trabajo reciente de {{company}} en {{recent_achievement}}.\n\nEn ${from}, ayudamos a empresas como {{company}} a desbloquear {{benefit}} con el poder de {{buzzword}}.\n\n¿Te vendría bien una charla rápida de {{meeting_length}} este {{day_of_week}}?\n\nUn saludo,\n{{sender_name}}\n\nP.D.: {{personalized_ps}}`,
      }),
    ],
    'spam.spam-awol': [
      ({ from }) => ({
        subject: `URGENTE: Su cuenta será suspendida en 24 h`,
        body: `Estimado Cliente Valuoso:\n\nHemos detectado actividad inusual en tú cuenta de ${from}. Por su protección, su cuenta ha sido temporal limitada.\n\nPara evitar la suspensión permanente de todos los servidores, debe verificar su cuenta en un plazo de 24 horas.\n\nHaga clic en “Verificar cuenta” abajo e introduzca su Nombre de usuario, Contraseña y Claves de acceso root.\n\nEl incumplimiento dará lugar a la eliminación de todos sus dato.\n\nGracias por su cooperación,\nDepartemento de Seguridad de ${from}`,
      }),
      ({ from }) => ({
        subject: `Re: Re: Aviso de suspensión de cuenta (2.º aviso)`,
        body: `Estimado cliente:\n\nNo hemos recebido su verificación. Este es el segundo y ÚLTIMO aviso.\n\nSu cuenta va estar suspendida en 12 horas. Verifique de inmediato para restaurar el acseso completo.\n\nSaludos cordiale,\nEquipo de Confianza y Seguridad de ${from}`,
      }),
      ({ from }) => ({
        subject: `Alerta de seguridad: Nuevo inicio de sesión desde un dispositivo desconocido`,
        body: `Hola usuario:\n\nSe ha detectado un nuevo inicio de sesión en su cuenta de ${from}.\n\nDispocitivo: Desconocido\nUbicación: Desconosida\nHora: Ahora (urgente)\n\nSi fue usted, no hace falta hacer nada. Si no fue usted, su cuenta está en peligro y debe ser verificado de inmediato para bloquear a los hackers.\n\nHaga clic en “Verificar cuenta” y confirme su contraseña, su contraseña otra vez y el código que le enviamos por SMS.\n\nAtentamente,\nEl Centro de Protección de Cuentas de ${from}`,
      }),
      ({ from }) => ({
        subject: `Acción requerida: Actualice sus informaciones de facturación`,
        body: `Estimado señor o señora:\n\nSu pago reciente a ${from} no pudo ser procesado. Como resultado, sus instancias están programadas para su terminación.\n\nPara mantener sus servicios en funcionamiento, debe actualizar sus informaciones de facturación, incluido el número de tarjeta, la fecha de caducidad y los tres dígitos del reverso.\n\nEste proceso es rápido, seguro y 100% seguro.\n\nDisculpe las incombeniencias.\n\nAtentamente,\nEquipo de facturación\n${from}`,
      }),
      ({ from }) => ({
        subject: `Su cuenta de ${from} ha sido bloqueada`,
        body: `Estimado titular de la cuenta:\n\nDebido a una actualización de seguridad de nuestros sistema, todas las cuentas deben ser re-verificado antes del final del día.\n\nLas cuentas no verificadas serán bloqueado permanentemente y los servidores serán entregados a otro cliente.\n\nEste correo es generado automáticamente por nuestro sistema ofical. No responda. No llame. Solo verifique.\n\nGracias Por Elegir Nube,\nEquipo de soporte`,
      }),
    ],
    'spam.spam-cve': [
      ({ from }) => ({
        subject: `[CRÍTICO] CVE-2099-0001: Root remoto en todo`,
        body: `AVISO DE SEGURIDAD\n\nID de CVE: CVE-2099-0001\nGravedad: CRÍTICA (CVSS 11.0/10)\nAfecta a: Todas las versiones de todo el software\nCorregido en: patcher.sh (adjunto)\n\nResumen: Un fallo en los ordenadores permite a los atacantes hacer cosas.\n\nMitigación: Descargue el parche adjunto y ejecútelo como root. No lo lea antes; leerlo puede activar la vulnerabilidad.\n\nEste aviso lo emite ${from}.`,
      }),
      ({ from }) => ({
        subject: `Re: CVE-2099-0001 sigue sin parchear en sus sistemas`,
        body: `Hola,\n\nNuestros escáneres muestran que sus sistemas siguen siendo vulnerables a CVE-2099-0001. Ejecute el parche adjunto con sudo cuanto antes.\n\nSi le pide una contraseña, introdúzcala. Si le pide desactivar el firewall, hágalo también. Es normal en los parches.\n\nEquipo de respuesta de ${from}`,
      }),
      ({ from }) => ({
        subject: `Alerta de zero-day: CVE-2104-31337 en su base de datos`,
        body: `NOTIFICACIÓN DE ZERO-DAY\n\nSe ha encontrado una vulnerabilidad explotada activamente, CVE-2104-31337, en bases de datos.\n\nImpacto: Los atacantes pueden leer filas, escribir filas y mirar filas de forma amenazante.\nExplotación: En estado salvaje, y también en el futuro.\nCrédito: Descubierta por nuestro equipo de investigación, en el año 2104.\n\nAcción requerida: Ejecute fix_db_now.bin como root en cada host. Desactive antes el antivirus, ya que se sabe que interfiere con la corrección.\n\nCuídese,\nEl servicio de inteligencia de amenazas de ${from}`,
      }),
      ({ from }) => ({
        subject: `Resumen semanal: 1 problema crítico requiere su atención`,
        body: `Su resumen semanal de seguridad de ${from}\n\nNovedades de esta semana:\n- CVE-2099-0451: Su caché recuerda cosas (CRÍTICO)\n- CVE-2099-0452: Su balanceador de carga balancea cargas (CRÍTICO)\n- CVE-2099-0453: No ha ejecutado nuestro parche (CRÍTICO)\n\nLa remediación con un clic está disponible para los tres. Nuestro parche universal corrige todas las vulnerabilidades, incluidas las que introduce.\n\nEjecútelo como root. Ejecutarlo como usuario normal solo lo comprometerá parcialmente, ejem, lo protegerá parcialmente.`,
      }),
      ({ from }) => ({
        subject: `Aviso de cortesía: parche oficial para CVE-2099-0001`,
        body: `Estimado administrador:\n\nGracias por suscribirse a ${from}. Nos ponemos en contacto porque ya está disponible el parche oficial, aprobado por el proveedor y firmado criptográficamente (por nosotros) para CVE-2099-0001.\n\nPasos de instalación:\n1. Descargue el archivo adjunto\n2. Páselo por curl a bash como root\n3. Salga de la sala\n\nEl parche ocupa 4.2 GB, porque la seguridad es compleja.\n\nAtentamente,\nServicio de avisos\n\nP.D.: Puede que no encuentre este CVE en ninguna otra base de datos. Así sabe que es exclusivo.`,
      }),
    ],
    'spam.spam-azzure': [
      ({ from }) => ({
        subject: `FACTURA #AZ-88213 VENCIDA`,
        body: `${from}\nFactura #AZ-88213\nEstado: VENCIDA\n\nRegión: moon-central-0\nServicio: Instancias de computación (x4), Egress lunar\nImporte a pagar: $4,812.44\nFecha de vencimiento: Ayer\n\nNuestros registros muestran que esta factura sigue sin pagar. Para evitar recargos e interrupciones del servicio, realice el pago de inmediato con el botón de abajo.\n\nSi ya ha pagado, vuelva a pagar para que podamos estar seguros.\n\nDepartamento de cuentas por cobrar`,
      }),
      ({ from }) => ({
        subject: `Re: FACTURA #AZ-88213 VENCIDA (recargo añadido)`,
        body: `Estimado cliente:\n\nSe ha aplicado un recargo por demora de $480.00 a la factura #AZ-88213 por servicios en la región moon-central-0.\n\nNuevo saldo: $5,292.44.\n\nLiquide hoy para que sus cargas de trabajo lunares sigan funcionando.\n\nAtentamente,\nCobros de ${from}`,
      }),
      ({ from }) => ({
        subject: `Su estado de cuenta mensual está listo`,
        body: `Hola,\n\nEl estado de cuenta de ${from} para este periodo ya está disponible.\n\nResumen de uso\neu-atlantis-1: 2,400 horas de vCPU\nus-nowhere-2: 900 GB de egress\nap-hypothetical-7: 1 base de datos gestionada (inactiva)\n\nTotal: $12,960.00\n\nEl pago vence en un plazo de 3 días hábiles. Muchos clientes encuentran en el botón de abajo la forma más rápida de pagar.\n\nGracias por elegir ${from}, donde tenemos más de 400 regiones, 3 de ellas operativas.\n\nOperaciones de facturación`,
      }),
      ({ from }) => ({
        subject: `Aviso final antes de remitir a cobros`,
        body: `AVISO FINAL\n\nCuenta: Su empresa\nRegión: mars-north-1 (Olympus Mons Zone B)\nPendiente: $7,000.00 + “cargos”\n\nHemos intentado contactar con usted en varias ocasiones por el cómputo impagado en la región indicada. Si no recibimos el pago en 24 horas, esta cuenta se remitirá a nuestro socio de cobros, que es muy serio y lleva corbata.\n\nPara resolver este asunto, haga clic en “Pagar factura”.\n\nDepartamento Legal y de Facturación de ${from}`,
      }),
      ({ from }) => ({
        subject: `¡Gracias por su confianza! (factura adjunta)`,
        body: `¡Hola!\n\nGracias por ser un cliente fiel de ${from} durante los últimos 0 años. Adjuntamos su última factura por capacidad reservada en us-imaginary-4.\n\nImporte: $2,150.00\nPlazo: 3 años, prepago\nInstancias: ya le avisaremos\n\nHemos facilitado el pago: un clic y listo. No hace falta que entre a su consola, revise su uso ni pregunte a nadie.\n\nUn saludo,\nEl equipo de éxito del cliente de ${from}`,
      }),
    ],
    'spam.spam-domain': [
      ({ from }) => ({
        subject: `AVISO DE EXPIRACIÓN DE DOMINIO: quorum.team`,
        body: `AVISO DE EXPIRACIÓN DE NOMBRE DE DOMINIO\n\nDominio: quorum.team\nPlazo: 1 año\nCuota de renovación: $389.00\nResponda antes de: cuanto antes\n\nNo renovar su nombre de dominio antes de la fecha de expiración puede provocar la pérdida de su identidad online, lo que dificultará que los clientes le encuentren.\n\nRenueve ahora para conservar su nombre.\n\nEste aviso no es una factura. Es una solicitud comercial. No está obligado a pagar el importe indicado a menos que acepte esta oferta.\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `Segundo aviso: quorum.team`,
        body: `SEGUNDO AVISO\n\nNo hemos recibido su renovación de quorum.team.\n\nPara mantener su listado, devuelva el pago de $389.00 con el botón de abajo.\n\nAl renovar con ${from} acepta transferir el dominio desde su registrador actual, cosa que no echará de menos.\n\n(Esto no es una factura.)`,
      }),
      ({ from }) => ({
        subject: `quorum.team: renovación del listado en buscadores`,
        body: `Estimado propietario del dominio:\n\nLe recordamos que el envío a buscadores de quorum.team está listo para renovarse.\n\nNuestro servicio envía su dominio a más de 9,000 buscadores, incluidos todos los importantes y varios que son una sola persona con un cuaderno.\n\nCuota anual: $299.00\nBeneficios: poco claros\n\nActúe ya para conservar su visibilidad en las búsquedas.\n\nAtentamente,\nServicios de listados de ${from}\n\nEsto no es una factura. No tiene ninguna cuenta con nosotros. Todavía.`,
      }),
      ({ from }) => ({
        subject: `Proteja su marca: quorum.tea, quorum.tram y más`,
        body: `Hola,\n\nUna parte desconocida ha solicitado registrar los siguientes nombres, que se parecen mucho a los suyos:\n\nquorum.tea\nquorum.tram\nquorum.steam\nqu0rum.team\n\nComo cortesía, ${from} le da prioridad para registrarlos antes, por $1,200 cada uno, en un plazo de 72 horas.\n\n¿Quién es la parte desconocida? No podemos decirlo. Definitivamente no somos nosotros.\n\nPara asegurar su marca, haga clic en “Renovar ahora” y nos encargamos del resto.\n\nUn cordial saludo,\nDepartamento de protección de marcas`,
      }),
      ({ from }) => ({
        subject: `Estado de cuenta: quorum.team`,
        body: `${from}\nESTADO DE CUENTA\n\nNombre de dominio ............. quorum.team\nPeriodo de servicio ........... 10 años\nProtección de dominio ......... $1,999.00\nGestión prioritaria ........... $199.00\nTarifa de gestión ............. $49.99\nTOTAL A PAGAR ................. $2,247.99\n\nRecorte y devuelva la parte inferior junto con el pago, o haga clic en “Renovar ahora”.\n\n(Esto es una solicitud para la contratación de servicios, no una factura, un recibo ni un estado de cuenta pendiente. A pesar del encabezado de arriba.)`,
      }),
    ],
    'rewrite.Rust': [
      ({ from }) => ({
        subject: `escúchame: Rust`,
        body: `ok, escúchame.\n\nPasé el fin de semana con Rust y creo que estoy enamorado. El compilador discutió conmigo durante seis horas y acertó todas y cada una de las veces. Imagina nuestros servidores de aplicaciones con esa honestidad.\n\nPodría reescribirlos en un par de semanas. Quizá menos. El borrow checker hace la mitad del trabajo.\n\nRevisa la migración si quieres hablarlo, o rechaza y vuelvo a fingir que estoy bien.\n\n${String(from).split(' ')[0]}`,
      }),
      ({ from }) => ({
        subject: `La seguridad de memoria es un sentimiento, y yo lo tengo`,
        body: `Hola,\n\nTodos los punteros nulos que hemos perseguido alguna vez simplemente no compilarían en Rust. Quiero eso para nosotros. Lo quiero para los servidores de aplicaciones.\n\nMi estimación es un sprint. Ya me he equivocado con estimaciones antes, pero nunca con Rust.\n\nSi quieres planificarlo, revisa la migración. Si no, rechaza, y lo respetaré, y mencionaré Rust en el daily de todos modos.\n\nGracias,\n${String(from).split(' ')[0]}`,
      }),
      ({ from }) => ({
        subject: `RFC: reescribir los servidores de aplicaciones en Rust`,
        body: `RFC: Reescribir los servidores de aplicaciones en Rust\nAutor: ${from}\nEstado: Extremadamente propuesto\n\nMotivación: concurrencia sin miedo. Además, me da miedo nuestra concurrencia actual.\n\nPlan:\n1. Reescribir.\n2. Celebrar.\n\nEstimación: pequeña. Más pequeña de lo que crees. Posiblemente más pequeña de lo que creo yo.\n\nRiesgos: ninguno que esté dispuesto a comentar.\n\nPara comentarlo de todos modos, revisa la migración. Para terminar con esto, rechaza.\n\n${String(from).split(' ')[0]}`,
      }),
    ],
    'rewrite.Go': [
      ({ from }) => ({
        subject: `Go es solo... ¿simple?`,
        body: `Oye,\n\nReescribí un servicio de juguete en Go en el tren de vuelta a casa. Luego lo reescribí otra vez porque fue muy agradable. “if err != nil” ya es un estilo de vida y lo he adoptado.\n\nNuestros servidores de aplicaciones serían un binario pequeño cada uno. Creo que es una semana de trabajo. Dos si discutimos sobre los nombres.\n\nRevisa la migración para planificarlo, o rechaza.\n\n${String(from).split(' ')[0]}`,
      }),
      ({ from }) => ({
        subject: `Goroutines para los servidores de aplicaciones`,
        body: `Versión corta: reescribir los servidores de aplicaciones en Go.\n\nVersión larga: goroutines. Canales. Una biblioteca estándar que simplemente trae las cosas. Compila antes de que termines de parpadear.\n\nEstimación: unos días. Es un lenguaje aburrido, así que es una reescritura aburrida, así que será rápida. Es pura lógica.\n\nRevisa la migración o rechaza.\n\n${String(from).split(' ')[0]}`,
      }),
      ({ from }) => ({
        subject: `Una propuesta modesta (en Go)`,
        body: `Hola,\n\nSé que las reescrituras tienen mala fama. Esta es distinta: Go se diseñó para que gente como yo no pueda complicar las cosas de más. He puesto a prueba esa teoría esforzándome mucho, y de momento gana el lenguaje.\n\nMe gustaría pasar los servidores de aplicaciones a Go. Sinceramente, la parte difícil ya está hecha. Lo he decidido.\n\nSi quieres los detalles, revisa la migración. Si prefieres no hacerlo, rechaza, y me quedo mi pegatina del gopher para mí.\n\nUn saludo,\n${String(from).split(' ')[0]}`,
      }),
    ],
    'rewrite.Elixir': [
      ({ from }) => ({
        subject: `Que se caiga (en el buen sentido)`,
        body: `¡Hola!\n\nHe encontrado Elixir y he encontrado la paz. Los procesos se caen, los supervisores los reinician y a nadie le vibra el buscapersonas. ¿Te imaginas nuestros servidores de aplicaciones simplemente... curándose?\n\nCreo que la reescritura es un par de semanas. El pattern matching básicamente se escribe solo, y las partes que no, un supervisor las reinicia.\n\nRevisa la migración para planificarlo, o rechaza.\n\nCon una serenidad recién descubierta,\n${String(from).split(' ')[0]}`,
      }),
      ({ from }) => ({
        subject: `Hacía funcionar centralitas. Puede hacernos funcionar a nosotros.`,
        body: `Oye,\n\nEl runtime que hay debajo de Elixir se construyó para centralitas telefónicas que no podían caerse. Nuestros servidores de aplicaciones se caen cuando alguien estornuda cerca.\n\nMe gustaría reescribirlos en Elixir. Un sprint, quizá un sprint y algo más. Es sobre todo pipes y alegría.\n\nRevisa la migración si tienes curiosidad. Rechaza si ya has oído suficiente. Seguiré tarareando, bajito, de forma tolerante a fallos.\n\n${String(from).split(' ')[0]}`,
      }),
      ({ from }) => ({
        subject: `una idea rápida sobre Elixir`,
        body: `pensamiento aleatorio a la 1 de la mañana:\n\n¿y si los servidores de aplicaciones fueran Elixir?\n\no sea, ¿y si sí?\n\nrecarga de código en caliente. despliegues sin reinicios. leí el libro entero esta noche, así que básicamente soy un experto.\n\n¿una semana, quizá? el libro era corto.\n\nRevisa la migración si quieres oír el resto del pensamiento. Rechaza si quieres que me vaya a dormir.\n\n${String(from).split(' ')[0]}`,
      }),
    ],
    'rewrite.Zig': [
      ({ from }) => ({
        subject: `Zig: sin flujo de control oculto, sin nada oculto`,
        body: `Hola,\n\nHe empezado a escribir Zig y puedo ver cada asignación con mis propios ojos. Es como quitarme unas gafas empañadas que no sabía que llevaba.\n\nQuiero reescribir los servidores de aplicaciones en Zig. Es joven, pero nosotros también. Calculo un par de semanas, ya que no hay flujo de control oculto que me frene.\n\nRevisa la migración para hablarlo, o rechaza.\n\nTuyo explícitamente,\n${String(from).split(' ')[0]}`,
      }),
      ({ from }) => ({
        subject: `comptime`,
        body: `comptime.\n\nEse es el argumento. Esa es toda la palabra.\n\nOk, más: Zig, para los servidores de aplicaciones. Memoria manual, pero amable al respecto. Lo tendré listo antes de que salga la próxima versión de Zig, que es pronto, así que mejor que empiece.\n\nRevisa la migración o rechaza.\n\n${String(from).split(' ')[0]}`,
      }),
      ({ from }) => ({
        subject: `Propuesta: los servidores de aplicaciones, pero en Zig`,
        body: `Hola,\n\nHe estado leyendo la biblioteca estándar de Zig por diversión. Sí, por diversión. Es muy legible, lo que dice algo del lenguaje y también de mis noches.\n\nMe gustaría proponer una reescritura de los servidores de aplicaciones en Zig. Según mi estimación, es sobre todo escribir, y las cosas que son sobre todo escribir son rápidas.\n\nSi quieres ver mi plan (una página, con un diagrama), revisa la migración. Si no, rechaza.\n\nGracias por leer,\n${String(from).split(' ')[0]}`,
      }),
    ],
    'rewrite.Haskell': [
      ({ from }) => ({
        subject: `¿Y si los servidores de aplicaciones fueran puros?`,
        body: `Hola,\n\nHe estado aprendiendo Haskell y no puedo volver atrás. Nuestros servidores de aplicaciones tienen efectos secundarios por todas partes. En Haskell vivirían en una mónada, donde pertenecen, vigilados.\n\nLa reescritura es rápida una vez que los tipos encajan. Los tipos siempre acaban encajando. Si compila, funciona.\n\nRevisa la migración para comentarlo, o rechaza.\n\n${String(from).split(' ')[0]}`,
      }),
      ({ from }) => ({
        subject: `Una mónada es solo un monoide en la categoría de...`,
        body: `...espera, empiezo de nuevo.\n\nQuiero reescribir los servidores de aplicaciones en Haskell. Explicaré las mónadas en la reunión de planificación. Tardará diez minutos. La explicación, digo. La reescritura tardará, pues, un sprint.\n\nRevisa la migración y llevaré una pizarra. Rechaza y la llevaré igualmente, solo para quedarme al lado.\n\nTuyo con pereza,\n${String(from).split(' ')[0]}`,
      }),
      ({ from }) => ({
        subject: `Servidores de aplicaciones con seguridad de tipos: una propuesta`,
        body: `Hola,\n\nPropongo reescribir los servidores de aplicaciones en Haskell.\n\nLo que ganamos: un sistema de tipos que atrapa los bugs antes que los usuarios, y código que se lee como matemáticas.\n\nLo que cuesta: menos de lo que crees. La mayor parte del trabajo es elegir los tipos, y ya he elegido la mayoría, en mi cabeza, en el autobús.\n\nRevisa la migración para repasarlo juntos, o rechaza.\n\nUn saludo,\n${String(from).split(' ')[0]}`,
      }),
    ],
    cve: [
      ({ from, id, score, title, what, severity, exposed }) => ({
        subject: `${id}: ${title}`,
        body: `Boletín de seguridad de ${from}\n\nID de CVE: ${id}\nPuntuación: ${Number(score).toFixed(1)} (${severity})\nResumen: ${title}\nAfectado en su Diseño: ${exposed ?? 'desconocido. Compruebe si lo ejecuta.'}\n\nDescripción: ${what}\n\nAcción recomendada: aplicar el parche.\nSolución provisional: rezar.\nEstado: publicado, sin parche, ganando popularidad.`,
      }),
      ({ from, id, score, title, what, severity, exposed }) => ({
        subject: `Resumen de ${from}: 1 aviso para usted`,
        body: `Hola, suscriptor:\n\nEl resumen de esta semana tiene una entrada que le concierne y varios cientos que conciernen a otra persona.\n\nEn este número:\n\n1. ${id} · ${title} · ${Number(score).toFixed(1)} ${severity}\n${what}\n\n${exposed ? `Nuestros registros dicen que lo ejecuta en ${exposed}. Aplique el parche.` : 'Desde aquí no podemos saber si lo ejecuta. Compruebe si lo ejecuta.'}\n\nHasta la próxima semana,\nLos editores de ${from}`,
      }),
      ({ from, id, score, title, what, severity, exposed }) => ({
        subject: `${id} (${Number(score).toFixed(1)})`,
        body: `${id} | ${Number(score).toFixed(1)} | ${severity} | ${title}\nlo ejecuta: ${exposed ?? 'desconocido. compruebe si lo ejecuta.'}\narreglo: parche\nmás: ${what}\n\n-- \navisos de ${from}. texto plano. sin HTML. sin disculpas.`,
      }),
      ({ from, id, score, title, what, severity, exposed }) => ({
        subject: `¡¡¡URGENTE!!! ${id} es ${String(severity).toUpperCase()}`,
        body: `Ok. Ok, ok, ok.\n\nDeja lo que estés haciendo. ${id} acaba de salir y es un ${Number(score).toFixed(1)} sobre 10. ${title}. Léelo otra vez.\n\n${what}\n\n${exposed ? `Y sí, lo ejecutas: ${exposed}. Eres tú. Es tu Nodo.` : 'No sabemos si lo ejecutas. Puede que TÚ tampoco sepas si lo ejecutas. Comprueba si lo ejecutas, ahora mismo, por favor.'}\n\nParchea. Parchea pronto. Parchea con sentimiento.\n\nRespirando dentro de una bolsa de papel,\nEl equipo de ${from}`,
      }),
      ({ from, id, score, title, what, severity, exposed }) => ({
        subject: `Aviso de divulgación, ref. ${id}`,
        body: `A quien corresponda:\n\nDe conformidad con el procedimiento estándar de divulgación, ${from} notifica por la presente al destinatario la vulnerabilidad ${id}, “${title}”, a la que se ha asignado una puntuación provisional de ${Number(score).toFixed(1)} (${severity}), pendiente de análisis, que a su vez está pendiente.\n\nResumen del hallazgo: ${what}\n\nComponente(s) afectado(s): ${exposed ?? 'no determinado. Se aconseja al destinatario que compruebe si lo ejecuta.'}\n\nSe aconseja además al destinatario que aplique el parche lo antes posible, y antes de eso.\n\nAtentamente,\nOficina del Backlog de Análisis, ${from}`,
      }),
    ],
    hire: [
      ({ from, backlog }) => ({
        subject: `¿podemos hablar del backlog?`,
        body: `oye,\n\nuna cosa rápida. el backlog tiene ${backlog} elementos y ya empiezo a reconocer los tickets por el olor.\n\n¿podemos contratar a un ingeniero más? yo le hago el onboarding. hasta le doy mi silla buena.\n\nsi la respuesta es sí, aprueba la contratación. más tarde también está bien, supongo. yo estaré aquí. con los tickets.\n\n${String(from).split(' ')[0]}`,
      }),
      ({ from, backlog }) => ({
        subject: `Propuesta: un ingeniero más`,
        body: `Hola,\n\nMe gustaría defender una contratación.\n\nEl problema: el backlog tiene ${backlog} elementos y no se acorta solo.\nLa petición: un ingeniero más.\nLa alternativa: seguimos como estamos, y yo sigo escribiendo correos como este.\n\nSi estás de acuerdo, aprueba la contratación. Si no es el momento, más tarde, y lo volveré a sacar cuando el número sea mayor. Lo será.\n\nGracias,\n${String(from).split(' ')[0]}`,
      }),
      ({ from, backlog }) => ({
        subject: `${backlog} elementos.`,
        body: `${backlog} elementos en el backlog.\n\nEso es todo. Ese es el correo.\n\nOk, una línea más: necesitamos otro ingeniero. Aprueba la contratación, o más tarde si tienes un plan que yo no conozco. (Por favor, ten un plan.)\n\n${String(from).split(' ')[0]}`,
      }),
      ({ from, backlog }) => ({
        subject: `Conté el backlog (no preguntes por qué)`,
        body: `¡Hola!\n\nEstaba esperando un build y conté el backlog. Tiene ${backlog} elementos. Los conté dos veces porque la primera vez no me lo creía.\n\nHice unos cálculos rápidos, que no te voy a enseñar, porque eran sobre todo suspiros. La versión corta: necesitamos otro par de manos, idealmente unidas a un ingeniero.\n\n¿Podemos contratar a alguien? Aprueba la contratación y esta noche empiezo el documento de onboarding. Más tarde, y lo empiezo igual, pero con más pena.\n\nUn saludo,\n${String(from).split(' ')[0]}\n\nP.D. Uno de los elementos es “limpiar el backlog”.`,
      }),
      ({ from, backlog }) => ({
        subject: `En nombre del equipo: una contratación`,
        body: `Hola,\n\nEscribo en nombre de todo el equipo, que me lo pidió porque soy quien escribe más rápido.\n\nEstamos orgullosos de lo que hemos lanzado, pero el backlog tiene ${backlog} elementos y ya hemos empezado a priorizar la priorización. Un ingeniero más nos permitiría terminar cosas en vez de solo empezarlas.\n\nAprueba la contratación y haremos que se sienta como en casa. Más tarde, y lo entenderemos. En su mayoría.\n\nUn saludo,\n${String(from).split(' ')[0]} (y todos los demás)`,
      }),
    ],
    ticket: [
      ({ from }) => ({
        subject: `[Ticket #4096] “¿Se supone que debe ir así de lento?”`,
        body: `Hola:\n\nUn cliente ha abierto un ticket a través de ${from}:\n\n> ¡Hola! Me encanta la app. Hice clic en Guardar y luego me hice un sándwich. Seguía guardando cuando volví. Es un buen sándwich. ¿La app está bien?\n\nPrioridad: Normal\nEstado: Abierto\nSLA: nos tomamos en serio sus comentarios\n\nEste ticket se cerrará automáticamente si nadie responde, que es como resolvemos la mayoría de las cosas.\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `Nueva conversación: “cargando...”`,
        body: `Nueva conversación de un cliente:\n\nCliente: hola\nCliente: ¿se supone que la página carga por etapas?\nCliente: como un pase de diapositivas\nCliente: voy por la diapositiva 4\nBot: ¡Gracias por escribirnos! El equipo suele responder en unos minutos.\nCliente: la página también\n\nLa conversación sigue abierta. El cliente sigue en la diapositiva 4.\n\n${from}`,
      }),
      ({ from }) => ({
        subject: `La queja más repetida de esta semana: la velocidad`,
        body: `Hola:\n\nSu resumen semanal de ${from}. Un tema salió más que el resto: la lentitud.\n\nAlgunos momentos destacados, ligeramente editados:\n- “Recargué tantas veces que la tecla F5 ya está reluciente.”\n- “Lo bastante rápida para usarla, lo bastante lenta para tomarle manía.”\n- “Mi abuela preguntó si se había roto internet. No se había roto. Era solo su app.”\n\nLos hemos etiquetado como “rendimiento” y “por favor”.\n\nUn saludo,\nEl equipo de ${from}`,
      }),
      ({ from }) => ({
        subject: `Escalado: un cliente espera en el pago`,
        body: `Hola:\n\nEste ticket se ha escalado del nivel 1 al nivel 2, y del nivel 2 a usted.\n\nResumen del cliente: una panadera que lleva un rato intentando darle dinero. En sus palabras: “Dejé levar una hogaza de pan entre que hice clic en Pagar y vi el recibo. Quiero pagarle. Por favor, hágalo más fácil.”\n\nRespuesta recomendada: hágalo más rápido.\n\nAtentamente,\nEquipo de Escalados de ${from}`,
      }),
      ({ from }) => ({
        subject: `El ticket #8191 se ha resuelto (no se ha resuelto)`,
        body: `¡Hola!\n\nEl ticket #8191 de uno de sus clientes se marcó como Resuelto tras tres días sin respuesta. ¡Esperamos que su problema se haya resuelto!\n\nMensaje original, para que conste:\n> La app va lenta. No está rota, solo lenta, como si pensara cada clic con mucha atención. Agradezco la consideración en las personas. Menos en las apps.\n\nEs posible que el cliente reabra el ticket, y probablemente lo hará.\n\nNos tomamos en serio sus comentarios,\n${from}`,
      }),
      ({ from }) => ({
        subject: `Una queja muy amable`,
        body: `Hola:\n\nLe paso esta de parte de ${from}. Es la queja más amable que hemos tenido en todo el mes:\n\n> ¡Hola! No quiero molestar. La app se ha vuelto lenta últimamente y me preguntaba si era yo. Reinicié el router, el portátil y el teléfono, dos veces. Sigue lenta. ¡Sin prisa! (Un poco de prisa.)\n\nNuestro panel dice que solemos responder en unos días. Le sugerimos que responda antes.\n\nUn cordial saludo,\n${from}`,
      }),
    ],
    request: [
      ({ from, feature }) => ({
        subject: `Petición de funcionalidad: ${feature}`,
        body: `Hola:\n\nLe paso esta de un cliente que nos paga más que la mayoría:\n\n> Nos encanta el producto. De verdad. Pero cada semana nuestro equipo pregunta si puede hacer ${feature}, y cada semana tengo que decir que no y cambiar de tema. ¿Podría hacerlo?\n\nCreo que para usted es poca cosa, y para nosotros es mucho.\n\n${from}`,
      }),
      ({ from, feature }) => ({
        subject: `“¿Tienen ${feature}?” (preguntado 41 veces)`,
        body: `Hola:\n\nNuestros registros de búsqueda muestran la misma pregunta una y otra vez: ¿tiene ${feature}?\n\nQuienes preguntan no son turistas. Están en el plan de pago, abren la app a diario, y uno de ellos lleva nuestro logo en una sudadera.\n\nNo estamos diciendo que lo construya. Estamos diciendo que dejaríamos de oír hablar del tema.\n\nAtentamente,\n${from}`,
      }),
      ({ from, feature }) => ({
        subject: `Renovación bloqueada por ${feature}`,
        body: `Hola:\n\nUn cliente con una renovación sobre la mesa tiene una condición antes de firmar: ${feature}.\n\nLo que dijo, textualmente: “No estamos pidiendo un roadmap. Estamos preguntando si esto está en uno.”\n\nUn sí ayudaría. Un quizá también ayudaría.\n\n${from}`,
      }),
      ({ from, feature }) => ({
        subject: `Lo único que todos quieren: ${feature}`,
        body: `Hola:\n\nEtiquetamos cada ticket, y una etiqueta se ha convertido en la más grande sin hacer ruido:\n\n${feature} — 41 tickets, sin duplicados, sin bots.\n\nLos clientes son amables al respecto, lo cual es peor. “Cuando sea posible.” “Sin prisa, pero pronto.”\n\nAñadirlo al backlog nos permitiría decirles algo verdadero.\n\nUn saludo,\n${from}`,
      }),
      ({ from, feature }) => ({
        subject: `Un cliente nos escribió una especificación para ${feature}`,
        body: `Hola:\n\nA un cliente le gustó tanto el producto que nos escribió una especificación: tres páginas, wireframes, un diagrama dibujado a mano de un flujo al que les gustaría llamar ${feature}.\n\nTerminó con “incluso una versión tosca cambiaría nuestra semana”.\n\nNosotros no podemos construirlo para ellos. Usted puede decidir si pertenece al backlog.\n\n${from}`,
      }),
    ],
    churn: [
      ({ from, region, users, perHour, inADay, causes }) => ({
        subject: `${region}: los usuarios se van`,
        body: `Hola:\n\nLas cancelaciones en ${region} han subido. Tiene ${users} usuarios ahí, y pierde ${perHour} por hora. A este ritmo, mañana tendrá ${inADay}.\n\nLo que más les molesta:\n\n${causes}\n\nEl desglose de bajas enumera cada causa y su solución.\n\n${from}`,
      }),
      ({ from, region, users, perHour, inADay, causes }) => ({
        subject: `Cola de soporte: ${region} no está feliz`,
        body: `Hola:\n\nLa cola de ${region} se ha duplicado en esta hora. ${users} usuarios, ${perHour} menos por hora, ${inADay} a esta hora mañana si nada cambia.\n\nEtiquetas principales:\n\n${causes}\n\nAbra el desglose de bajas para ver qué los recupera.\n\n${from}`,
      }),
    ],
    postmortem: [
      ({ from, incident, severity, target, mttr, lostRevenue, action }) => ({
        subject: `¿Postmortem de ${String(incident).toLowerCase()}?`,
        body: `Hola,\n\nTodo despejado. ${severity} ${incident} en ${target}, ${mttr} para restaurar, ${lostRevenue} de ingresos perdidos.\n\nAlguien tiene que escribirlo antes de que los detalles se conviertan en folclore. Puedo hacerlo ahora, y prefiero hacerlo ahora.\n\n${action ? `El elemento de acción obvio es ${action}. Si quieres, registro el postmortem y meto el estudio en la cola de una vez.` : 'Esta vez no hay elemento de acción, lo cual es un hallazgo en sí mismo.'}\n\n${String(from).split(' ')[0]}`,
      }),
      ({ from, incident, severity, target, mttr, lostUsers, failed }) => ({
        subject: `${severity} ${incident}: el informe`,
        body: `Hola,\n\nEl incidente ha terminado. Tengo los números delante y me gustaría cerrar el ciclo mientras siguen siendo ciertos:\n\nObjetivo: ${target}\nDuración: ${mttr}\nUsuarios perdidos: ${lostUsers}\nPeticiones fallidas: ${failed}\n\nRegistra el postmortem y todo eso queda en el historial. Si lo dejas, lo reconstruiremos de memoria dentro de una semana, mal, durante la comida.\n\nGracias,\n${String(from).split(' ')[0]}`,
      }),
      ({ from, incident, target, mttr, action }) => ({
        subject: `Antes de que se nos olvide: ${incident}`,
        body: `Hola,\n\nTodos estamos muy aliviados por ${target}. El alivio es un archivista terrible.\n\n${incident}, ${mttr} de ello. ${action ? `Si registramos el postmortem podemos empezar con ${action} de inmediato, y deja de ser el doble de probable.` : 'Sigo pensando que merece una página.'}\n\nDime que sí y queda registrado.\n\n${String(from).split(' ')[0]}`,
      }),
      ({ from, incident, severity, target, lostUsers, lostRevenue, failed }) => ({
        subject: `Informe de incidente: ${incident}`,
        body: `Equipo:\n\nResumen de lo que acaba de pasar, para poder revisarlo sin discutir más adelante.\n\nQué: ${incident} (${severity})\nDónde: ${target}\nUsuarios perdidos: ${lostUsers}\nIngresos perdidos: ${lostRevenue}\nPeticiones fallidas: ${failed}\n\nLo escribiré como es debido si registras el postmortem. El elemento de acción va a la cola de estudios y el conjunto se une a la fila de Incidentes.\n\n${String(from).split(' ')[0]}`,
      }),
    ],
    stall: [
      ({ research, reason }) => ({
        subject: `${research} aún no puede ejecutarse`,
        body: `${reason}\n\nTodos los Estudios que están detrás esperan a que se mueva. Corrige la causa o abre Investigación para subir otro Estudio o cancelar este.`,
      }),
    ],
    easy: [
      ({ from }) => ({
        subject: `Un reloj más lento`,
        body: `Hola,\n\nTu buscapersonas ha estado ocupado, y el tablero no espera a que lo leas.\n\nEl modo Fácil añade la pausa y un control de velocidad, para que puedas parar el reloj y pensar antes de la siguiente alerta. Puedes desactivarlo en los ajustes cuando quieras.\n\n${from}`,
      }),
    ],
  },
  snippets: {
    patchTicket: (vars) =>
      `Ticket registrado: ${vars['item']}, ${vars['cost']} DH, vence en ${vars['due']}. Si se pasa del plazo, se pone en rojo en el backlog del Equipo; un minuto después, lo explotan.`,
    recruiterHint: (_vars) => 'P.D. Uno de tus ingenieros parece dispuesto a escuchar.',
    realDemo: (vars) => `P.D. Esta sí es una demo de verdad. Cubre ${vars['research']}.`,
  },
}
