La Función edge ejecuta handlers pequeños en la CDN, junto al usuario, como hacen Cloudflare Workers y Fastly Compute.

## Cuándo colocarla

- Colócala cuando los usuarios estén lejos de tu origen y el handler sea pequeño: una redirección, una reescritura de cabeceras, una lectura cacheada, una página personalizada. Se desbloquea con [Computación en el edge](/research/edge-compute) en la Serie C, después de Entrega de contenido, por 80,000 ◇.
- Sáltatela para los tipos que consumen mucha CPU, como el redimensionado de imagen de una subida, una exportación o el hash de contraseña de un inicio de sesión. Esos pertenecen a un Servidor de aplicaciones.
- Cópiala cuando usuarios de otra región la necesiten, ya que una Función edge sirve solo a su propia región.

## Cómo funciona

Sirve solo a su propia región: un usuario de allí la alcanza en 5 ms en lugar del viaje de ida y vuelta hasta tu origen, y un usuario de otra región sigue pagando ese viaje. Responde todos los tipos de petición como lo hace un [Servidor de aplicaciones](/components/server), convirtiéndolos en las llamadas al backend que hace. Los arranques en frío apenas se notan: un isolate de V8 arranca en menos de 5 ms, frente a los segundos que tarda un contenedor o una JVM.

Una Función edge activa también contiene la caché clave-valor del edge de la que una [CDN](/components/cdn) responde `read`. Esa caché responde el 30% de las lecturas de API, que la CDN sola responde al 0%.

Factura por petición, en la línea Peticiones de la [factura de la nube](/design/09-economy#the-cloud-bill), y nada mientras está ociosa.

## Techos

Las Funciones edge no tienen tipo de instancia ni tamaño que elegir. Dos techos ocupan su lugar:

- **CPU.** Una petición puede gastar 10 ms de CPU. Pasado eso se mata el handler y la petición falla como un timeout.
- **Memoria.** Un handler se ejecuta en 128 MB de isolate, que caben un handler pequeño y su respuesta, pero no un conjunto de trabajo.

Ejecuta el Stack de tu Servicio, así que el Stack tiene que compilar para el edge: JavaScript y TypeScript, o Rust y Go compilados a WebAssembly. Un Stack de PHP, Ruby, Python, Java, C#, Elixir, Zig o Haskell se rechaza allí, y la tarjeta lo indica.

## Cómo falla

- **El techo de CPU.** Una petición que necesita más de 10 ms de CPU se mata a mitad de camino, así que una subida, un informe o una exportación no pertenecen aquí.
- **El Stack.** Una Empresa que ejecuta PHP no puede usar el edge en absoluto. La solución es una [migración](/design/08-team-and-velocity#migrations) a un Stack que compile, no un segundo Nodo edge.
- **La capa de datos.** Un handler que llama a una Base de datos en cada petición paga igualmente el viaje de ida y vuelta, así que ahorra el salto del usuario y no la consulta.

### [Certificado caducado](/incidents/certificate)

- **Señales:** Aparece el banner **Certificado caducado**, y todas las peticiones que pasan por la Función edge fallan, igual que por cualquier otro Nodo TLS.
- **Qué hacer ahora:** Haz clic en **Renovar** en el banner.
- **Prevenir:** Investiga [Automatización de certificados](/research/cert-automation) y coloca un Nodo de [Secretos y certificados](/components/pki), que renueva los certificados antes de que caduquen.

### [Caída de región](/incidents/region)

- **Señales:** El tablero de una región se pone gris y la Función edge que hay en ella cae.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region), mantén una copia en una segunda región y añade [GeoDNS](/research/geo-dns) para enviar allí a los usuarios.

## Consejos

- Combínala con una CDN, para que el edge responda lo que la CDN no puede cachear y la CDN responda el resto.
- Mantén el handler pequeño. Trata el techo del isolate como una restricción de diseño, no como un error que sortear.
