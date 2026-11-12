import type { Messages } from '../messages.ts'

/* The chrome of the live views behind each Markdown directive. */

export const islands: Messages['islands'] = {
  note: { tip: 'Consejo', warn: 'Ojo', real: 'Qué tan real es' },
  options: { control: 'Control', settings: 'Valores', when: 'Cuándo' },
  mix: (era) => `Mezcla de peticiones de ${era}`,
  sandbox: 'Sandbox',
  lever: {
    title: (kind) => `Palanca de ${kind}`,
    default: (share, era) => `Empresa por defecto: ${share} desde ${era}`,
    step: 'Paso',
    share: 'Cuota de tráfico',
    devHours: 'Horas de desarrollo',
    growth: 'Crecimiento',
    note: 'Los demás tipos ceden la diferencia, así que el tráfico total se mantiene.',
  },
  nodeCard: (name) => `Tarjeta del Nodo ${name}`,
  design: {
    aria: (names) => `El Diseño: ${names}`,
    hint: 'Arrastra para desplazar. Mantén Ctrl o Cmd y usa la rueda para ampliar.',
    link: (from, to) => `Enlace ${from} → ${to}`,
    caption: (users, incident, apdex, p99, errors, burn, egress, note) =>
      `Con ${users} usuarios${incident ? ` y un incidente de ${incident} en curso` : ''} la Simulación resuelve este Diseño en Apdex ${apdex}, p99 ${p99}, ${errors}% de errores y ${burn}/s de Gasto${egress ? `, de los cuales ${egress}/s son egress` : ''}.${note ? ` ${note}` : ''}`,
    where: 'Dónde',
    setting: 'Ajuste',
    value: 'Valor',
    why: 'Por qué',
    on: 'Sí',
    off: 'No',
    needs: 'Investigación que necesita este Diseño: ',
  },
  practice: {
    boardLabel: (title) => `Tablero de práctica: ${title}`,
    area: (title) => `${title}: un tablero de práctica. Los objetivos están debajo del tablero.`,
    titles: {
      place: 'Coloca Componentes',
      wire: 'Conecta Nodos con Enlaces',
      rearrange: 'Selecciona, mueve y corta',
    },
    intro: {
      place:
        'Coloca un Servidor de aplicaciones y una Base de datos. Elige una pieza en el dock y haz clic en el tablero.',
      wire: 'Enlaza Usuarios con Servidor de aplicaciones, Servidor de aplicaciones con Base de datos y Servidor de aplicaciones con Analítica. Arrastra desde el puerto de salida del borde derecho de una tarjeta hasta otra tarjeta. Después enlaza un Balanceador de carga con el otro y enlaza el segundo con el primero para ver el rechazo por bucle.',
      rearrange:
        'Mantén Mayús y arrastra sobre un espacio vacío para seleccionar Nodos con un recuadro, y luego arrastra uno de ellos para mover el grupo. Después haz clic en un Enlace y pulsa Supr, o haz clic en su insignia x, para cortarlo.',
    },
    goals: {
      placeServer: 'Coloca un Servidor de aplicaciones',
      placeDatabase: 'Coloca una Base de datos',
      linkUsersServer: 'Enlaza Usuarios con Servidor de aplicaciones',
      linkServerDatabase: 'Enlaza Servidor de aplicaciones con Base de datos',
      linkServerAnalytics: 'Enlaza Servidor de aplicaciones con Analítica',
      linkLoadBalancers: 'Enlaza el primer Balanceador de carga con el segundo',
      readLoop: 'Lee el rechazo por bucle',
      boxSelect: 'Selecciona dos o más Nodos con un recuadro',
      moveGroup: 'Mueve el grupo seleccionado',
      cutLink: 'Corta un Enlace',
    },
    reset: 'Reiniciar',
    goalsLabel: 'Objetivos',
    build: 'Construir',
    done: ' (hecho)',
    notYet: ' (aún no)',
    cash: (amount) => `Caja ${amount}`,
    stopPlacing: (name) => `Dejar de colocar ${name} (Esc)`,
    clickToPlace: (name) => `Haz clic en el tablero para colocar ${name}, o pulsa Intro.`,
    allDone: 'Todos los objetivos cumplidos. Reinicia para practicar de nuevo.',
    databaseMoved: 'Postgres salió del Servidor de aplicaciones a su propia Base de datos.',
  },
}
