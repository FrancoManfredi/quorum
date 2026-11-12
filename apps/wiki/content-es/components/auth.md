El Proveedor de autenticación comprueba contraseñas para que tus Servidores de aplicaciones no tengan que hacerlo, como un servicio de identidad alojado tipo Auth0.

## Cuándo colocarlo

- Colócalo cuando los inicios de sesión se coman la CPU de tus Servidores de aplicaciones.
- Colócalo cuando el p99 se dispare en un runtime con bucle de eventos, como Node.js. Un hash en el bucle de eventos bloquea todas las peticiones que esperan detrás, y el Sandbox [Bloqueo del bucle de eventos](/sandboxes/event-loop-stall) lo muestra.

## Cómo funciona

Enlaza un Servidor de aplicaciones con él, y ese servidor enviará cada inicio de sesión al Proveedor de autenticación como una llamada de autenticación. Tu CPU deja de pagar el hashing de contraseñas, que es lento a propósito. Consulta [bcrypt](/glossary/bcrypt). Un Servidor de aplicaciones sin enlace al Proveedor de autenticación sigue haciendo el hash de sus propios inicios de sesión.

Es un Componente gestionado: colocarlo no cuesta nada, no tiene límite de capacidad y sirve a todas las regiones. Añade un retraso fijo a cada inicio de sesión. Su Gasto crece con el número de usuarios, no con los inicios de sesión, así que es barato al principio y acaba siendo una partida grande de la factura.

## Cómo falla

El Proveedor de autenticación en sí no falla en el juego. Evita dos incidentes:

- [Bloqueo del bucle de eventos](/incidents/loop): el coste del hashing sube y cada inicio de sesión consume cuatro veces la CPU. El Proveedor de autenticación y el [pool de hilos de libuv](/research/libuv-pool) sacan el hash del bucle.
- [Relleno de credenciales](/incidents/stuffing): los bots prueban contraseñas filtradas y cada intento es un hash. Un [WAF](/components/waf) bloquea la mayoría, y el Proveedor de autenticación hace el hash del resto.

Su propio fallo es el coste.

## Consejos

- Vigila su Gasto en el Ledger a medida que crecen los usuarios.
- En Node.js, compáralo con la Investigación del pool de hilos de libuv, que no cuesta Gasto.
