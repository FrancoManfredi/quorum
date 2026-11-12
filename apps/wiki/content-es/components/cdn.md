La CDN responde el contenido cacheable en el edge, cerca del usuario, como hace Cloudflare con su red de servidores edge.

## Cuándo colocarla

- Colócala cuando las vistas de página o el vídeo carguen tus Servidores de aplicaciones. Consulta [Recortar la factura de la nube](/guides/cut-the-cloud-bill). Se desbloquea con [Entrega de contenido](/research/cdn).
- Colócala cuando el egress sea una partida grande en el Ledger.
- Sáltatela para lecturas de API, escrituras, inicios de sesión y checkouts. Una CDN no los cachea, así que siempre llegan al origen.

## Cómo funciona

Colócala justo después de [Usuarios](/components/users). Recibe todos los tipos de petición, responde en el edge la parte anónima de las vistas de página y la mayor parte del vídeo, y envía los fallos y todos los demás tipos a tu origen. Una página con sesión iniciada no es cacheable hasta tener Edge-side includes. No tiene límite de capacidad y sirve a todas las regiones.

El egress desde el edge cuesta menos que el egress desde tus Servidores de aplicaciones, así que una CDN también reduce la factura de la nube una vez que se factura el egress. Un TTL más largo sube la tasa de aciertos, y la Investigación de [Caché por niveles](/research/tiered-caching) aumenta cuánto vídeo responde el edge. Consulta [CDN](/glossary/cdn-content-delivery-network) y [egress](/glossary/egress).

## Opciones

::Options{id="cdn"}

- **TTL**: cuánto tiempo conserva el edge una página. Un TTL más largo sube la tasa de aciertos, así que súbelo para las páginas que cambian poco.
- **Purgar al desplegar**: una versión nueva vacía el edge, y el origen recibe los fallos mientras se rellena. Sin esto, el edge sigue sirviendo las páginas de la versión anterior hasta que pasa su TTL, así que algunos usuarios ven páginas antiguas tras un despliegue.
- **Clave de caché**: lo que hace que dos peticiones sean la misma página. Una clave con la ruta, la query string y las cookies no comparte nada entre usuarios. Dejar fuera la query string o la cookie sube la tasa de aciertos. Con [Edge-side includes](/research/esi) se cachea una página con sesión iniciada, así que una clave sin la cookie puede servir la página de un usuario a otro. Ese es el incidente de Fuga de página cacheada, y los usuarios se van al instante.

## Cómo falla

La CDN en sí no se sobrecarga en el juego. Lo que sale mal:

- Cada petición paga el salto al edge, incluidos los fallos que siguen hasta el origen.
- Un TTL corto baja la tasa de aciertos, y llega más tráfico a tu origen.
- Sin una, un [DDoS](/incidents/ddos) o un [Pico de tráfico](/incidents/spike) golpea tus Servidores de aplicaciones de lleno. Una CDN se lleva la parte cacheable.

### [Fuga de página cacheada](/incidents/page-leak)

- **Señales:** Los usuarios caen un 5% de golpe, y la página con sesión iniciada de un usuario llegó a otro.
- **Qué hacer ahora:** Nada lo termina antes. Sigue su curso, 90 segundos de simulación en el catálogo.
- **Prevenir:** Pon la **Clave de caché** en la tarjeta de la CDN en **Ruta, query y cookies**, para que una página personal nunca se comparta. La fuga necesita [Edge-side includes](/research/esi) y una clave sin la cookie.

### [Certificado caducado](/incidents/certificate)

- **Señales:** Aparece el banner **Certificado caducado**, y todas las peticiones que pasan por la CDN fallan, igual que por cualquier otro Nodo TLS.
- **Qué hacer ahora:** Haz clic en **Renovar** en el banner.
- **Prevenir:** Investiga [Automatización de certificados](/research/cert-automation) y coloca un Nodo de [Secretos y certificados](/components/pki), que renueva los certificados antes de que caduquen.

## Consejos

- Combínala con [Almacenamiento de objetos](/components/storage) cuando sirvas vídeo.
- Coloca un [WAF](/components/waf) después de la CDN, para que el WAF vea solo los fallos.
- Sube el TTL cuando las páginas cambien poco.
