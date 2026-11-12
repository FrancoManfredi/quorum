Usuarios representa a las personas de internet que escriben tu dominio en un navegador o abren tu aplicación.

## Cuándo colocarlo

- Nunca colocas Usuarios, y no puedes venderlos. Actúas sobre su enlace.
- Pon [DNS](/components/dns) o un [Balanceador de carga](/components/lb) delante de tus Servidores de aplicaciones cuando el tablero rechace un segundo enlace desde Usuarios: un solo host no basta.

## Cómo funciona

El Nodo envía todos los tipos de petición de la mezcla de la Era actual (consulta [Eras](/eras)). Cada petición paga el salto del usuario antes de llegar a tu primer Nodo. Cuántos usuarios tienes depende del Apdex y del crecimiento, como explica [Usuarios y crecimiento](/explanation/users-and-growth).

Un dominio se resuelve a un solo host, así que Usuarios admite un único enlace de enrutamiento. Para llegar a más de un Servidor de aplicaciones, enlaza Usuarios con DNS o con un Balanceador de carga y deja que ese Nodo reparta el tráfico.

Desde la Era de la Serie C, los usuarios viven en cuatro regiones. Cada región que abres tiene su propio Nodo de Usuarios en su propia pestaña. La Investigación [GeoDNS](/research/geo-dns) envía a los usuarios de cada región a su propia región, o a la más cercana que siga activa.

## Cómo falla

Usuarios nunca falla por sí solo, pero todo lo que alcanzan puede fallar.

- Si cae el único Nodo detrás de Usuarios, todas las peticiones fallan.

### [Certificado caducado](/incidents/certificate)

- **Señales:** Todos los navegadores rechazan el sitio, y aparece un banner "Certificado caducado" con un botón **Renovar**.
- **Qué hacer ahora:** Pulsa **Renovar** en el banner. El certificado se emite de nuevo al instante.
- **Prevenir:** Investiga [Automatización de certificados](/research/cert-automation).

### [Error de configuración de BGP](/incidents/bgp)

- **Señales:** Un cambio de enrutamiento retira a tu Empresa de internet, y los usuarios no pueden llegar a ninguna región. Aparece un banner con un botón **Revertir**.
- **Qué hacer ahora:** Pulsa **Revertir** en el banner para deshacer el cambio.
- **Prevenir:** Ninguna Investigación lo evita, y es raro.

### [Pico de tráfico](/incidents/spike)

- **Señales:** La demanda va a ×3 hasta ×10 durante minutos, y todas las tarjetas se ponen ámbar y luego rojas.
- **Qué hacer ahora:** Añade copias o tamaños a los Nodos que se saturan. Con [Descarte de carga por prioridad](/research/load-shedding), activa **Descartar lo menos valioso** en los Servidores de aplicaciones.
- **Prevenir:** Mantén capacidad de reserva, añade un Autoescalador o una CDN, e investiga [Descarte de carga por prioridad](/research/load-shedding).

### [Oleada de bots](/incidents/bot-surge)

- **Señales:** El tipo `bot` sube en todas las tarjetas a medida que llegan los scrapers.
- **Qué hacer ahora:** Coloca un [WAF](/components/waf) después de Usuarios. Detiene a los bots según su tasa de bloqueo, y un nivel de paranoia más alto detiene a más.
- **Prevenir:** Investiga [Firewall de aplicaciones web](/research/waf) y coloca uno.

### [DDoS](/incidents/ddos)

- **Señales:** La demanda va a ×50 de basura.
- **Qué hacer ahora:** Selecciona el WAF y pulsa **Bajo ataque**. Pone un desafío a cada petición. Sin un WAF, nada lo acelera; termina por sí solo tras 60 s como máximo.
- **Prevenir:** Investiga [Firewall de aplicaciones web](/research/waf) y [Entrega de contenido](/research/cdn), y coloca ambos en el edge.

## Consejos

- Enlaza Usuarios con un Balanceador de carga, no con un Servidor de aplicaciones, en cuanto puedas permitirte uno.
- Pon una CDN o un WAF justo después de Usuarios: funcionan mejor en el edge.

:::Note{tone="real"}
Los navegadores y resolvers reales cachean la respuesta de un dominio, así que un único registro A realmente envía a todos a una sola dirección. Consulta [round robin de DNS](/glossary/dns-round-robin) y [BGP](/glossary/bgp-border-gateway-protocol).
:::
