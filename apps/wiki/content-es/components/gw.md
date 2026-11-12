El API Gateway es una puerta de entrada única por la que pasa cada llamada de API antes de llegar a tus servicios, como Kong, AWS API Gateway o Apigee.

## Cuándo colocarlo

- Colócalo cuando un tipo de Servidor de aplicaciones no pueda servir todos los tipos de petición y quieras que las vistas de página y las llamadas de API lleguen a grupos de servidores distintos.
- Colócalo cuando quieras proteger tus servicios de una ráfaga o de clientes abusivos sin rechazarlos en el WAF. Se desbloquea con [API Gateway](/research/api-gateway).
- Colócalo cuando quieras un único lugar donde ver y limitar el tráfico de la API.
- Sáltatelo como filtro de bots. Un límite de tasa acota el volumen y no distingue un bot de un comprador, así que si el problema son los bots, un [WAF](/components/waf) sigue haciendo falta delante.

## Cómo funciona

Su límite de tasa acota el Nodo a un número de peticiones por segundo, y las peticiones que pasan de ese límite fallan como `throttled` en lugar de llegar a tus servicios. Un límite Desactivado deja pasar todo. Se sitúa después de [Usuarios](/components/users) y envía cada tipo de petición por los Enlaces que le asigna su tabla de rutas, añadiendo un salto propio. Esa tabla de rutas es cómo un Diseño se divide por tipo: envía `page` a un grupo de servidores pensado para renderizar, `login` a uno que no se bloquee y `media` a una CDN. Consulta [limitación de tasa](/glossary/rate-limiting) y el [token bucket](/glossary/token-bucket) que sigue haciendo falta.

A diferencia de todos los demás Componentes, que facturan por segundo de actividad, el gateway factura por petición. Es barato con volumen bajo y caro con volumen alto, y es la línea Peticiones de la factura. Su precio es la tarifa en dólares reales de un servicio gestionado, así que el índice de coste de la Era no la multiplica. Tiene un solo tamaño y una capacidad plana propia, de modo que un Diseño que supere esa capacidad pierde peticiones en el gateway como cualquier otro Nodo de capacidad plana.

## Opciones

::Options{id="gw"}

- **Rutas**: qué tipos de petición lleva cada Enlace. Todos los tipos van por todos los Enlaces hasta que desactivas uno, así que un Enlace fijado en `login` solo lleva inicios de sesión y nada más.
- **Límite de tasa**: las peticiones por segundo que deja pasar el gateway. Por encima, las peticiones fallan como `throttled` en lugar de llegar a tus servicios. Desactivado deja pasar todo.
- **Ráfaga**: Tope fijo rechaza toda petición por encima del límite. Token bucket guarda una pequeña reserva, así que una ráfaga corta pasa entera mientras se mantiene el promedio a largo plazo. Necesita [Limitación de tasa](/research/rate-limiting).
- **Autenticación**: Autenticación en el edge valida cada token una vez, en el gateway, y los servicios que hay detrás se saltan la comprobación. La comprueban los servicios deja la validación a cada servicio.
- **Coalescencia**: fusiona lecturas idénticas que están en vuelo a la vez. Cuanto más ocupado está el gateway, más ahorra.

## Cómo falla

- Un límite por debajo de tu demanda estrangula a usuarios reales, y una petición estrangulada no aporta nada, así que el límite que fijes debe dejar sitio al tráfico que quieres.
- Por encima de su propia capacidad descarta peticiones, diga lo que diga el límite de tasa.
- Es un único salto delante de todo, así que un gateway sobrecargado o mal configurado hace fallar todos los tipos de petición a la vez.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del API Gateway se pone gris y su aviso dice "El host bajo esta VM murió. Sigue facturando." Las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Selecciona el Nodo y haz clic en **Reemplazar**. Cuesta Caja y vuelve en frío.
- **Prevenir:** Ejecuta una segunda copia detrás de un [Balanceador de carga](/components/lb) que se salte los hosts caídos. [Balanceo de carga](/research/load-balancing) y [Comprobaciones de estado](/research/health-checks) los desbloquean.

### [Certificado caducado](/incidents/certificate)

- **Señales:** Aparece el banner **Certificado caducado**, y todas las peticiones que pasan por el API Gateway fallan, igual que por cualquier otro Nodo TLS.
- **Qué hacer ahora:** Haz clic en **Renovar** en el banner.
- **Prevenir:** Investiga [Automatización de certificados](/research/cert-automation) y coloca un Nodo de [Secretos y certificados](/components/pki), que renueva los certificados antes de que caduquen.

### [Caída de región](/incidents/region)

- **Señales:** El tablero de una región se pone gris y el API Gateway que hay en ella cae.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region), mantén una copia en una segunda región y añade [GeoDNS](/research/geo-dns) para enviar allí a los usuarios.

## Consejos

- Deja el límite Desactivado hasta que conozcas tu pico, y luego fíjalo un poco por encima del pico que quieras servir.
- Vigila la línea Peticiones, no solo el límite de tasa, porque el precio por petición crece con el tráfico.
