export const inspectorPooler = {
  poolingMode: 'Pooling mode',
  session: 'Session',
  transaction: 'Transaction',
  statement: 'Statement',
  oneServerConnectionPerStatementA:
    'One server connection per statement: a transaction that spans statements fails.',
  oneServerConnectionPerClientBarely:
    'One server connection per client: barely smaller than no pooler at all.',
  oneServerConnectionPerActiveTransaction:
    'One server connection per active transaction. Session state breaks.',
}
