---
title: Cómo ordena Tidy el tablero
summary: Las columnas por rol que usa Tidy, cómo elige la fila de cada tarjeta y los diseños que descarta.
section: explanation
order: 15
aliases: tidy, tidy by role, shift+t, layout, board layout, role column, columns, arrangement, ordenar por rol, mayús+t, diseño, disposición del tablero, columna por rol, columnas, organización
gdd: /design/15-ui-ux
---

Tidy (Ordenar por rol) convierte el Tablero de una región en una imagen de izquierda a derecha del camino de las peticiones. Pulsa `Shift+T`, y cada tarjeta se mueve a la columna de su trabajo, y luego a una fila que la alinea con las tarjetas a las que llama. La vista se ajusta al resultado, y `Z` deshace todo el diseño en un paso.

La columna responde dónde está una tarjeta en el camino de las peticiones. La fila responde con qué habla. Por eso vale la pena ejecutar Tidy después de un cambio grande: convierte un montón de tarjetas en una imagen del camino.

## Las siete columnas

Tidy lee el Tablero como siete columnas, de izquierda a derecha:

| Columna | Contiene                                                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1       | Usuarios, DNS, CDN, WAF y un API Gateway o [Balanceador de carga](/components/lb) de entrada                                                                             |
| 2       | Servidor de aplicaciones, Función serverless, Clúster de Kubernetes, Nodo GPU, Función edge y los Autoescaladores que los escalan                                        |
| 3       | Cola, Flujo de eventos, Conector CDC, Hub en tiempo real, Pooler de conexiones, Almacenamiento de objetos, Almacén de documentos y las Réplicas de lectura que lo llenan |
| 4       | Worker, Caché, el Autoescalador del Worker y las Réplicas de lectura que la llenan                                                                                       |
| 5       | Base de datos, Índice vectorial, Almacén de columnas anchas, SQL distribuido, Almacén de datos y las Réplicas de lectura que la llenan                                   |
| 6       | Motor de búsqueda, Proveedor de autenticación, Proveedor de pagos, API de LLM, Proveedor de notificaciones push                                                          |
| 7       | [Analítica](/components/analytics), Pagos                                                                                                                                |

La columna de una tarjeta viene de su rol, no de su lugar en una cadena de Enlaces. Esa es la decisión que sigue el resto del diseño. Una Base de datos se queda en la columna de datos aunque una cadena larga de Enlaces la pusiera más a la izquierda, y dos Servidores de aplicaciones comparten columna aunque uno esté detrás de una Caché y el otro no.

Algunas colocaciones anulan el rol:

- **El camino de entrada conserva su orden.** En la columna 1, los Usuarios van encima de DNS, CDN, WAF, API Gateway y Balanceador de carga, de arriba abajo. Tidy nunca reordena estas tarjetas según sus vecinas.
- **Un Balanceador de carga o un API Gateway puede estar dentro del flujo.** Si todos los Enlaces que le llegan vienen de la columna de entrada, se queda en la columna 1. Si lo alimenta cómputo o datos, Tidy le da una columna propia, ordenada justo a la izquierda de la tarjeta más a la izquierda a la que da frente y nunca a la izquierda de quien lo alimenta. Un Balanceador de carga entre Servidores de aplicaciones y Poolers de conexiones queda entre esas dos columnas. Uno entre Servidores de aplicaciones y Bases de datos queda justo a la izquierda del nivel de datos.
- **Un Autoescalador sigue al Nodo que escala.** Enlaza uno a un Servidor de aplicaciones o a un Worker, y pasa a la columna de ese Nodo. Un Autoescalador sin ese Enlace va a la franja bajo el Tablero.

Una [Réplica de lectura](/components/replica) tiene su propia regla. Tidy cuenta las tarjetas que ya hay en las columnas 3, 4 y 5, ignorando las réplicas, y pone cada réplica en la más corta de esas columnas. Cuatro réplicas alimentadas por Servidores de aplicaciones se reparten así por las columnas de datos en lugar de apilarse en una. Tidy toma las réplicas en su orden actual de arriba abajo, así que sus filas anteriores deciden cuál llena qué columna. Si un Enlace que llega a una réplica viene de una Base de datos, una Caché, un Pooler de conexiones, un Almacenamiento de objetos o un Almacén de documentos, se coloca en la columna de ese padre. Un padre de datos gana a una Caché, y una Caché gana al resto.

Dos grupos quedan fuera del camino de las peticiones. Los proveedores externos y la Analítica van a la derecha de los datos, así que una llamada desde cómputo va hacia delante, a costa de cruzar las columnas de datos. El resto del plano de control, es decir, el Pipeline de CI/CD, los Feature flags, los Secretos y certificados, el Service mesh y un Autoescalador sin Nodo, llena filas bajo la tarjeta más baja.

## Cómo se elige la fila de una tarjeta

Cada columna tiene un orden vertical fijo por rol. Los Autoescaladores van encima de los Servidores de aplicaciones. La Cola va encima de las Réplicas de lectura, que van encima del Pooler de conexiones, el Almacenamiento de objetos y el Almacén de documentos. En la columna de los workers, los Autoescaladores van encima de los Workers, los Workers encima de las Réplicas de lectura, y las Réplicas de lectura encima de la Caché. En la columna de datos, las Réplicas de lectura van encima de la Base de datos, y el Almacén de datos va debajo de ella.

Dentro de un bloque de rol, Tidy ordena las tarjetas según sus vecinas. A cada vecina le da un lugar entre 0 y 1 según su orden en su columna, y luego promedia esos lugares. Una Cola con tres Workers en 0.2, 0.4 y 0.6 recibe 0.4, que es su lugar entre las demás Colas. Una tarjeta sin vecinas en otra columna conserva su lugar actual.

Cuatro barridos asientan el orden: de izquierda a derecha, de derecha a izquierda, y luego otra vez en cada sentido. La columna 1 nunca se reordena, y una tarjeta nunca sale de su bloque de rol.

Después Tidy alinea las filas. Cada vecina tira de una tarjeta hacia su centro con un peso de 1 dividido por el número de Enlaces de esa vecina, así que un hub con veinte Enlaces da a cada una de sus tarjetas una veinteava parte de un voto. Una tarjeta se mueve el 30% del camino hacia la media ponderada. Luego una pasada de agrupación mantiene las tarjetas en orden y deja al menos 24 px entre ellas: cuando dos objetivos se cruzarían, los promedia en un bloque y lo intenta de nuevo. Cinco pasadas, cada una recentrada en la fila media del Tablero, asientan el resultado.

La fila es la parte que puedes predecir con menos exactitud, porque depende de los Enlaces que dibujaste. La columna es la parte que puedes predecir con exactitud.

## Dónde empiezan y se pliegan las columnas

Tidy ancla el resultado en la esquina superior izquierda de las tarjetas que reemplaza: la x actual más a la izquierda y la y actual más arriba pasan a ser el origen. Las columnas están separadas por una tarjeta más seis espacios, 360 px con una tarjeta de 216 px y un espacio de 24 px. Una columna más alta que 3,000 unidades del tablero se pliega. El sobrante empieza una subcolumna nueva a un paso a la derecha, otra vez desde arriba, así que el límite acota la altura y gasta anchura. Un tablero de 61 Nodos queda en 2376×2890 px en lugar de una sola pila de 3536 de alto. Cada subcolumna se alinea por su cuenta.

La franja de control va bajo la tarjeta más baja, cuatro espacios más abajo, y se llena de izquierda a derecha.

## Lo que cuesta

- Un Balanceador de carga cuyo alimentador y cuyo destino están en la misma columna de cómputo o datos no tiene hueco donde colocarse. Tidy lo mantiene a la derecha de quien lo alimenta, así que algunos de sus Enlaces van hacia atrás. Un Balanceador de carga o un API Gateway que alimenta cómputo o datos pero no da frente a nada no tiene columna a la que apuntar, así que cae en el extremo derecho.
- Una Réplica de lectura colocada para equilibrar una columna aún puede tener un Enlace que vaya de derecha a izquierda.
- Los proveedores y la Analítica en el extremo derecho mantienen hacia delante las llamadas de cómputo, pero todo cable hacia ellos cruza las columnas de datos.
- Tidy no conserva una disposición manual. Tus filas anteriores deshacen los empates y eligen el orden en que las réplicas llenan las columnas, pero las columnas y la alineación anulan el resto. No tiene aleatoriedad: las mismas tarjetas en los mismos lugares siempre producen el mismo diseño.
- Tidy no mantiene un [Grupo de datos](/explanation/the-data-tier) en un solo bloque. Si la columna de datos se pliega, un grupo enmarcado puede abarcar dos subcolumnas y su marco se estira por el hueco.
- El límite de 3,000 unidades acota la altura, no la anchura. Un Tablero con muchas tarjetas de un mismo rol crece hacia los lados.
- La franja de control no sigue ningún Enlace, así que se empaqueta, no se alinea.
- Una Zona no tiene columna ni fila propia. Es un dominio de fallo, no un nivel, así que dos Servidores de aplicaciones en Zonas distintas comparten columna y el tinte de la tarjeta y del Enlace sigue mostrando la Zona.
- Tidy solo mueve tarjetas. No cambia un Enlace ni la Simulación, y `Z` deshace el diseño en un paso.

## Diseños que Tidy descarta

**Una banda por Zona.** Una Zona es un dominio de fallo, no un nivel. Una banda por Zona da a cada Zona su propia fila del pipeline, así que una Empresa de tres Zonas apila la misma forma hasta tres veces. Una llamada entre Zonas, la que paga latencia y egress, corre entonces entre bandas en lugar de a lo largo del camino. La Zona ya tiene el tinte de la tarjeta y del Enlace.

**Un carril por tipo de Componente.** Cada tipo recibe su propio bloque, y los bloques se agrupan en los carriles del dock de construcción. Se lee como un catálogo: diez Servidores de aplicaciones se vuelven un bloque alto de tarjetas idénticas, y un Enlace entre dos Servidores de aplicaciones se queda dentro de ese bloque, así que no puede ir de izquierda a derecha. El jugador necesita el camino entre tipos, no una estantería para cada tipo.

**Un dibujo en capas general.** Un diseño al estilo Sugiyama asigna columnas según la cadena de Enlaces más larga, y luego reordena y endereza. Reduce bien los cruces en un grafo arbitrario, pero hace que la columna de una Caché dependa de la cadena que llega a ella, así que el mismo Componente puede caer en otra columna en otro Tablero. Su límite de proporción también puede empujar el sobrante de una columna a la siguiente para alcanzar una forma objetivo. Tidy elige una columna que un jugador pueda nombrar antes que un diseño que solo reduce cruces.

**Un diseño dirigido por fuerzas.** Las tarjetas se empujan entre sí y los Enlaces tiran juntos. No tiene columnas ni regla de izquierda a derecha, así que no puede mostrar el camino de las peticiones, y un pequeño cambio en una tarjeta puede remodelar el resto. Tidy hace legible el camino, no orgánico el grafo.
