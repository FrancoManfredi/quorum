El WAF representa a un firewall de aplicaciones web como ModSecurity con el OWASP Core Rule Set.

## Cuándo colocarlo

- Colócalo cuando los bots se lleven una parte grande de tu tráfico y carguen tus Servidores de aplicaciones, o cuando los inicios de sesión se disparen por bots. Se desbloquea con [Firewall de aplicaciones web](/research/waf).
- Activa el modo Bajo ataque solo mientras dure un DDoS.

El Sandbox [Bots](/sandboxes/bots) muestra el síntoma.

::Sandbox{id="bots"}

## Cómo funciona

Colócalo delante de tus Servidores de aplicaciones. Recibe todos los tipos de petición y envía lo que deja pasar. Bloquea una parte de los bots, y con ellos una parte menor de usuarios reales. Los usuarios bloqueados fallan como `blocked`. Consulta [WAF](/glossary/waf-web-application-firewall).

Cada escalón de tamaño duplica su capacidad. Abarca todas las zonas.

## Opciones

::Options{id="waf"}

- **Paranoia**: lo estrictas que son las reglas. Un nivel más alto bloquea más bots, bloquea más usuarios reales y cuesta más CPU por petición, así que el WAF atiende menos tráfico.
- **Bajo ataque**: pone un desafío a cada petición mientras está activado. Bloquea casi toda la basura, bloquea a algunos usuarios reales y añade latencia. Desactívalo cuando termine la inundación.

## Cómo falla

- Sobrecargado, descarta peticiones antes de que lleguen a los Servidores de aplicaciones. Un nivel de paranoia alto hace que ocurra antes.
- Un nivel alto bloquea a usuarios reales y cuesta ingresos.

Sin un WAF, la [Oleada de bots](/incidents/bot-surge), el [Relleno de credenciales](/incidents/stuffing) y el [DDoS](/incidents/ddos) golpean más fuerte y más a menudo.

### [Backtracking de regex](/incidents/regex)

- **Señales:** Su Inspector dice "Una regla hace backtracking. CPU al 100%." Todos los WAF se quedan sin CPU. Consulta [ReDoS](/glossary/redos-regular-expression-denial-of-service).
- **Qué hacer ahora:** Pulsa **Desactivar regla**.
- **Prevenir:** Ninguna Investigación lo evita. Un WAF siempre conlleva el riesgo de una regla mala.

### [DDoS](/incidents/ddos)

- **Señales:** Su Inspector dice "Una inundación de tráfico basura." y la demanda va a ×50 de basura.
- **Qué hacer ahora:** Pulsa **Bajo ataque** en el WAF. Pone un desafío a cada petición y añade latencia.
- **Prevenir:** Mantén un WAF y una CDN en el edge: [Firewall de aplicaciones web](/research/waf) y [Entrega de contenido](/research/cdn). Desactiva el modo Bajo ataque cuando termine.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del WAF se pone gris, su Inspector dice "El host bajo esta VM murió. Sigue facturando.", y las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Pulsa **Reemplazar** en su Inspector y paga el precio. Vuelve en frío.
- **Prevenir:** Ejecuta una segunda copia: [Balanceo de carga](/research/load-balancing) pone las copias detrás de un Balanceador de carga, y las [Comprobaciones de estado](/research/health-checks) se saltan el host caído.

### [Caída de región](/incidents/region)

- **Señales:** Todos los Nodos de una región se ponen grises a la vez, y el tablero de esa región se pone gris con ellos.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region) y [GeoDNS](/research/geo-dns), y luego ejecuta una copia en una segunda región.

## Consejos

- Empieza en el nivel predeterminado y súbelo solo cuando aún se cuelen bots.
- Desactiva el modo Bajo ataque cuando termine el DDoS.
