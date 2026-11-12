El Pipeline de CI/CD toma el trabajo terminado y lo lleva a producción, como hacen GitHub Actions, GitLab CI o Argo CD.

## Cuándo colocarlo

- Colócalo en cuanto lances más de una Funcionalidad al día. Un Pipeline reduce el tiempo de despliegue de 30 minutos a unos pocos, así que las Funcionalidades del Equipo llegan antes a los usuarios. Se desbloquea con [Entrega continua](/research/ci), que además te permite revertir un Despliegue defectuoso.

## Cómo funciona

Cambia cómo se hace un despliegue: con qué frecuencia puede lanzar el Equipo, cuánto cuesta el Pipeline mientras existe y hasta dónde llega un [Despliegue defectuoso](/incidents/bad-deploy). No lleva tráfico, así que no enlazas nada hacia él ni desde él.

Cada despliegue lanza las Funcionalidades terminadas desde el anterior. Sin Pipeline, un despliegue es manual y tarda 30 minutos. Con uno, tarda lo que diga su estrategia, y la estrategia fija el resto.

Más despliegues significan lotes más pequeños, y un lote más pequeño es un despliegue defectuoso más pequeño. Esa es la mejor razón para colocar un Pipeline pronto.

## Opciones

::Options{id="ci"}

La tarjeta tiene un solo ajuste. Rolling es el predeterminado.

| Estrategia de despliegue | Tiempo de despliegue | Radio de impacto de un despliegue defectuoso | Gasto            |
| ------------------------ | -------------------- | -------------------------------------------- | ---------------- |
| Recrear                  | 2 min                | Hasta el 100%                                | 1× el Pipeline   |
| Rolling                  | 5 min                | Hasta el 40%                                 | 1× el Pipeline   |
| Blue-green               | 7 min                | Hasta el 10%                                 | 2× el Pipeline   |
| Canary                   | 10 min               | Hasta el 5%                                  | 1.5× el Pipeline |

Un despliegue defectuoso hace fallar el 8% de las peticiones del Servidor de aplicaciones por cada Funcionalidad que lleva su lote, y la estrategia fija el techo de eso:

- Recrear cambia todos los servidores a la vez, así que nada contiene el error. Es la más rápida y la más barata, y la peor para equivocarse.
- Rolling sustituye una porción cada vez y se puede detener.
- Blue-green sirve desde la flota antigua mientras sube la nueva, así que solo su porción ve el error. Paga por la segunda flota.
- Canary envía primero el 5% del tráfico y espera. Es la más segura y la que menos veces lanza.

Los tiempos de despliegue y los multiplicadores de Gasto son números propios de este juego, elegidos para que el equilibrio sea real.

## Cómo falla

- Una estrategia lenta lanza menos Funcionalidades al día: con despliegues Canary de 10 minutos frente a las 16 diarias de Avanzar rápido, pierdes una quinta parte.
- Recrear no tiene techo. Un lote de una docena de Funcionalidades rompe todas las peticiones hasta que revirtes.
- Blue-green y Canary cuestan más Gasto cada segundo que existen, no solo mientras despliegan.
- Un Pipeline sin [Clúster de Kubernetes](/components/cluster) ni Equipo de plataforma sigue pagando la parte lenta, porque el tiempo de compilación del Stack no cambia.
- Canary solo compensa su Gasto si vigilas la barra de Despliegue defectuoso y revierte. El error permanece en el 5% del tráfico hasta que actúes.

### [Despliegue defectuoso](/incidents/bad-deploy)

- **Señales:** La barra **Despliegue defectuoso** aparece en la parte superior del tablero, y la tasa de errores se dispara justo después de un despliegue.
- **Qué hacer ahora:** Haz clic en **Revertir** en la barra. Está bloqueado hasta que investigues [Entrega continua](/research/ci).
- **Prevenir:** Elige una estrategia con menor radio de impacto, como Canary o Blue-green, lanza lotes más pequeños e investiga [Pruebas automatizadas](/research/testing-culture).

## Consejos

- Elige la estrategia según lo que te cuesta un despliegue defectuoso.
- Combina Rolling con un Clúster: el despliegue de un Clúster se detiene tras su primer lote de pods, así que un despliegue defectuoso rompe una cuarta parte del techo de Rolling.
