Secretos y certificados representa a Let's Encrypt con ACME, HashiCorp Vault y AWS Secrets Manager: el lugar donde viven las claves, y la automatización que renueva el certificado antes de que caduque.

## Cuándo colocarlo

- Colócalo en la Semilla, con [Automatización de certificados](/research/cert-automation). Cuesta 80 colocarlo y 0.005 por segundo.
- Colócalo cuando haya en el tablero cualquier Nodo que termine TLS. Un certificado que caduca hace fallar todas las peticiones que pasan por ese Nodo.

## Cómo funciona

Es dueño del calendario de cada certificado del Diseño, y el tráfico no pasa por él:

- Cada Nodo que termina TLS tiene un certificado propio: un Balanceador de carga, una CDN, un WAF, un API Gateway, un Hub en tiempo real o una Función edge.
- El primer Paso con un gestor activo **emite** cada certificado, y la tarjeta cuenta lo que le queda al más próximo a caducar.
- Renueva cada certificado cuando han pasado **dos tercios** de su vida, que es cuando un cliente ACME renueva con un tercio todavía por delante.
- Un certificado dura **90 días naturales**, y **45 desde la Serie C**, siguiendo el máximo de la industria a medida que se acorta.

Vender el Nodo o dejarlo caído no reinicia el reloj. Los certificados que emitió siguen agotándose.

Sin él, el incidente "Certificado caducado" es un incidente normal del director de incidentes que todavía puede golpear, y la investigación lo hace mucho menos probable. Con él, la renovación es automática y el incidente se queda sin causa, salvo que se detenga el propio gestor.

La Investigación de Gestión de secretos es la otra mitad del nombre del Componente. Mantiene las claves fuera del alcance de una página de phishing, así que el incidente de Fuga de credenciales no puede empezar.

## Cómo falla

- **Un gestor caído no renueva nada.** Un reinicio, un OOM kill o un Nodo vendido bastan para detener la renovación, y la cuenta atrás no lo tiene en cuenta.
- **Una vida más corta en cada Era.** 45 días desde la Serie C es la mitad del margen que tenía la renovación manual.
- **Un reloj por Nodo.** Un Nodo colocado tarde se emite tarde, y cada certificado caduca en su propio día, así que un Balanceador de carga caducado se lleva solo el tráfico que pasa por él.

### [Certificado caducado](/incidents/certificate)

- **Señales:** Pasada su fecha de caducidad, todos los navegadores rechazan ese Nodo, y todas las peticiones que pasan por él fallan como `down`. Aparece un banner "Certificado caducado" con un botón **Renovar**.
- **Qué hacer ahora:** Pulsa **Renovar** en el banner. El certificado se emite de nuevo al instante, incluso con un gestor en camino. El incidente vuelve a empezar tras terminar hasta que haya un gestor activo o pulses **Renovar**, porque el certificado sigue caducado.
- **Prevenir:** Investiga [Automatización de certificados](/research/cert-automation) y mantén activo su gestor.

### [Caída de región](/incidents/region)

- **Señales:** Todos los Nodos de una región se ponen grises a la vez, y el tablero de esa región se pone gris con ellos.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region) y [GeoDNS](/research/geo-dns), y luego ejecuta una copia en una segunda región.

## Consejos

- Vigila la tarjeta del certificado, no el pager: "en 3 d" es el aviso, y "caducado" es la caída.
- Renueva desde la barra del incidente cuando salte, incluso con un gestor en camino, porque el certificado se emite de nuevo al instante.
- Mantén el Nodo a salvo: sin máquina de una sola zona, sin precios Spot, sin margen para un OOM.
