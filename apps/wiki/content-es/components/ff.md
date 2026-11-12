Los Feature flags activan un comportamiento para una parte de los usuarios sin un despliegue nuevo, como hacen LaunchDarkly y Unleash.

## Cuándo colocarlos

- Colócalos en cuanto lances a menudo y reviertas pocas veces, porque el flag convierte cada Funcionalidad en su propio pequeño canary. Se desbloquean con [Feature flags](/research/feature-flags) en la Semilla, por 800 ◇, después de [Entrega continua](/research/ci).
- Sáltatelos cuando no tengas Funcionalidades que merezca la pena escalonar. Son baratos y no llevan tráfico, así que esa es la única pregunta.

## Cómo funciona

Limitan hasta dónde llega un [Despliegue defectuoso](/incidents/bad-deploy), una Funcionalidad cada vez. Por ellos no pasa tráfico. Un despliegue defectuoso hace fallar el **8% de las peticiones del Servidor de aplicaciones por cada Funcionalidad** que lleva su lote, hasta el techo que fija su estrategia de despliegue. Una Funcionalidad tras un flag solo rompe la parte de usuarios a la que ha llegado el flag.

Cada Funcionalidad lanzada tiene un despliegue progresivo: **oculta (dark), 5%, 25%, 50% o todos los usuarios**. Una Funcionalidad sin paso fijado está activa para todos, que es lo que hace con todas un Diseño sin Nodo de Feature flags.

| Estrategia de despliegue | Techo del radio de impacto | Trece Funcionalidades sin flags | Trece Funcionalidades al 5%      |
| ------------------------ | -------------------------- | ------------------------------- | -------------------------------- |
| Recrear                  | 100%                       | todo se rompe                   | se rompe el 5.2%                 |
| Rolling                  | 40%                        | se rompe el 40%                 | se rompe el 5.2%                 |
| Blue-green               | 10%                        | se rompe el 10%                 | se rompe el 5.2%                 |
| Canary                   | 5%                         | se rompe el 5%                  | se rompe el 5% (su propio techo) |

El flag es un techo propio, así que gana a la estrategia: Recrear no puede superar un despliegue progresivo del 5%.

## Opciones

::Options{id="ff"}

- **Despliegue progresivo**: la parte de usuarios que recibe una Funcionalidad, fijada por Funcionalidad. Una parte menor limita lo que puede romper un despliegue defectuoso de ella, y Desactivada quita la Funcionalidad a todos sin desplegar, que es el kill switch. Consulta [Feature flags](/patterns/feature-flags).

## Cómo falla

- **El código se lanza igualmente.** Un despliegue lanza también el código que rodea a sus Funcionalidades. Un lote sin ninguna Funcionalidad sigue rompiendo lo que rompe una, y un Diseño cuyas Funcionalidades están todas ocultas sigue ejecutando el código que no está tras un flag.
- **El despliegue progresivo no es un interruptor de carga.** Una Funcionalidad sigue aportando y sigue costando capacidad al 5%. Solo el radio de impacto sigue al flag.
- **Sin mejora medida, sin grupo de control.** Los usuarios sin la Funcionalidad todavía no la miden. Eso espera a `ab-testing`.
- **Flags olvidados.** Una Funcionalidad desactivada sigue pagando su mantenimiento, y un flag al 100% es peso muerto. Quitar elimina el código para siempre y acaba con el mantenimiento.

### [Despliegue defectuoso](/incidents/bad-deploy)

- **Señales:** La barra **Despliegue defectuoso** aparece en la parte superior del tablero, y la tasa de errores se dispara justo después de un despliegue.
- **Qué hacer ahora:** Pon las Funcionalidades del último despliegue en **Desactivada** en la tarjeta de Feature flags, para que un despliegue defectuoso de ellas no rompa a nadie. Haz también clic en **Revertir** en la barra, si tienes [Entrega continua](/research/ci).
- **Prevenir:** Mantén las Funcionalidades nuevas al 5% durante un despliegue antes de avanzarlas, e investiga [Pruebas automatizadas](/research/testing-culture).

## Consejos

- Mantén una Funcionalidad al 5% durante un despliegue y luego avánzala. Un flag al 100% es un flag que puedes borrar.
- Pon una Funcionalidad en **Desactivada** cuando la barra de un Despliegue defectuoso la nombre. Es el único clic que promete la caja de herramientas de mitigación.
- Recuerda que un flag sobre una Funcionalidad que no está en el lote actual no cambia nada hasta que el próximo despliegue la lance.
