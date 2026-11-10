import type { Messages } from '../messages.ts'

export const inspectorPooler: Messages['inspectorPooler'] = {
  poolingMode: 'Modo de pooling',
  session: 'Sesión',
  transaction: 'Transacción',
  statement: 'Sentencia',
  oneServerConnectionPerStatementA:
    'Una conexión de servidor por sentencia: una transacción que abarque varias sentencias falla.',
  oneServerConnectionPerClientBarely:
    'Una conexión de servidor por cliente: apenas más pequeño que no tener pooler.',
  oneServerConnectionPerActiveTransaction:
    'Una conexión de servidor por transacción activa. El estado de sesión se rompe.',
}
