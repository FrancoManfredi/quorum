---
title: Equipo y velocidad
summary: De dónde salen las Horas de desarrollo, por qué un equipo más grande no es un equipo más rápido y cómo los despliegues, la deuda técnica y la política deciden con qué rapidez publicas.
section: explanation
order: 8
era: 1
aliases: team, dev hours, dh, velocity, engineers, hiring, layoff, training, learn a language, rewrite, coordination, team size, brooks's law, tech debt, policy, deploys, backlog, migration, platform team, autopilot, equipo, horas de desarrollo, velocidad, ingenieros, contratación, despido, formación, aprender un lenguaje, reescritura, coordinación, tamaño del equipo, ley de Brooks, deuda técnica, política, despliegues, migración, equipo de plataforma, piloto automático
gdd: /design/08-team-and-velocity
---

Los servidores son la mitad de tu Empresa, y las personas que los cambian son la otra mitad. Su trabajo se
mide en Horas de desarrollo (DH), u horas de ingeniero. El Equipo gasta Horas de desarrollo en
Funcionalidades, tareas de ingeniería, migraciones y parches de seguridad.

## De dónde salen las Horas de desarrollo

En el Garaje eres el único ingeniero. Produces el 80% de lo que produce un ingeniero porque además diriges la
Empresa, y no cobras salario. La contratación se abre en Pre-semilla.

Cada equipo produce Horas de desarrollo con esta regla:

```latex
\begin{aligned}
\text{DH per Team day} &= \text{effective engineers} \times \text{velocity} \times 8 \\
\text{velocity} &= \text{Stack velocity} \times \left(1 - 0.5 \times \text{tech debt}\right) \times \text{policy} \\ &\quad \times \text{morale} \times \text{error budget}
\end{aligned}
```

Un ingeniero trabaja una jornada de 8 horas. A velocidad 1×, un día del Equipo pasa en un minuto real, así que
un ingeniero produce 8 DH por minuto.

La velocidad del Stack sale del lenguaje y del framework de tus Servidores de aplicaciones, ponderados por el
tráfico que sirve cada uno. Un framework que prioriza las convenciones, como Rails o Laravel, la sube, y Rust
la baja. Las páginas de [Runtimes](/runtimes) enumeran la velocidad de cada Stack. Un runtime rápido puede
ahorrar servidores y costar tiempo de ingeniería, y uno productivo hace lo contrario.

## Contratar cuesta Caja y tiempo

Una contratación cuesta una cuota de firma única en Caja, y después el salario se suma a tu Gasto cada
segundo. Ambos escalan con la Era y con el factor salarial del lenguaje. Siempre contratas para el lenguaje
que ejecuta tu Servicio, y un lenguaje raro como Elixir o Rust tarda más en contratarse.

Una persona recién contratada trabaja al 30% durante su primera semana del Equipo. Las convenciones de Rails
reducen esa rampa a la mitad, y sin framework, la deuda técnica la alarga. Un despido no devuelve nada. Acaba
con el salario, y el resto del equipo trabaja al 90% durante una semana del Equipo.

## Enseñar un lenguaje nuevo al equipo

Un ingeniero conoce el lenguaje para el que lo contrataron. Si reescribes tu Servicio en otro, los ingenieros
que no lo conocen trabajan más despacio en él hasta que lo aprenden, así que la reescritura tiene un coste en
personas además de en Horas de desarrollo.

Tienes dos salidas. Puedes despedir al equipo y contratar gente que conozca el lenguaje nuevo, lo que cuesta
una cuota de firma por contratación, un asiento vacío mientras cada oferta está abierta, una primera semana
lenta y un golpe a la moral de todos los que se quedan. O puedes **formarlos**: pasa el cursor sobre un
ingeniero en el panel del Equipo y selecciona el birrete de graduación. Formar cuesta una fracción de una
cuota de firma y hace al ingeniero más lento mientras aprende, pero nadie se va, y conserva su lugar en su
equipo. Un lenguaje raro tarda más en aprenderse, igual que en contratarse, y el sueldo del ingeniero pasa a
la tarifa del lenguaje nuevo cuando termina.

Empieza la formación mientras corre la migración y el equipo llegará al Stack nuevo ya con fluidez. Formar a
todos a la vez ralentiza a todo el equipo al mismo tiempo, así que un equipo que tiene que seguir publicando
se forma por turnos. Mira [Aprender un Stack](/design/08-team-and-velocity#learning-a-stack) para ver los
números.

## Por qué diez ingenieros no son diez veces más rápidos

Cada persona de un equipo tiene que ponerse de acuerdo con las demás, y el número de conversaciones crece más
rápido que el número de personas. La Simulación lo modela como una penalización de coordinación, su versión
de la [ley de Brooks](/glossary/brookss-law):

```latex
\text{effective engineers} = n / \left(1 + 0.08 \times \left(n - 1\right) + 0.0004 \times n \times \left(n - 1\right)\right)
```

Ocho personas trabajan como unas cinco. Pasadas unas 48 personas, un equipo se vuelve más lento al crecer. La
penalización cuenta dentro de cada equipo, así que puedes dividir a las personas en hasta cuatro equipos,
cada uno con su propia política. Un framework estructurado como Symfony, Spring Boot o NestJS reduce la
penalización un 30%, porque su estructura deja menos cosas que acordar.

:::Note{tone="real"}
El segundo término viene de la Universal Scalability Law de Neil Gunther, que también describe los servidores
que se ralentizan al añadir núcleos. Las empresas reales se dividen en equipos pequeños por la misma razón,
y un Servicio en Quorum funciona igual. Un Servicio es una base de código que pertenece a un equipo, y una
división mueve Funcionalidades a un Servicio nuevo con su propio equipo, sus despliegues y sus despliegues
defectuosos. Mira la [ley de Conway](/glossary/conways-law).
:::

## El octavo ingeniero

Un equipo de ocho ingenieros se detiene. Cada elemento que el equipo empieza te espera a ti, y su tarjeta
dice **Te toca: equipo demasiado grande**. En Core eres una persona más en la tarjeta, así que tu propio
equipo espera con nueve personas.

Aprueba un elemento para dejar que avance, pero el siguiente elemento también espera. La respuesta real es un
equipo más pequeño, así que mueve a algunos ingenieros a otro equipo o divide el Servicio.

Nueve ingenieros hacen menos que ocho, y por eso la parada llega antes de la caída. La coordinación crece más
rápido que el número de personas, y el esfuerzo por persona cae cuando crece un grupo. Tu noveno ingeniero
aporta menos que el octavo, y el décimo aporta aún menos.

:::Note{tone="real"}
El límite está muy estudiado. Un análisis de la base de datos de proyectos ISBSG encontró que los equipos de
nueve o más eran significativamente menos productivos que los más pequeños
([Rodríguez et al., 2012](https://www.sciencedirect.com/science/article/abs/pii/S0164121211002366)), y un
estudio de 491 proyectos situó el tamaño óptimo entre tres y siete personas
([Putnam, 1997](https://qsm.com/articles/team-size-can-be-key-successful-project)). Un análisis de 58
proyectos de código abierto encontró que la contribución de cada desarrollador cae al crecer el equipo, el
efecto Ringelmann ([Scholtes et al., 2016](https://link.springer.com/article/10.1007/s10664-015-9406-4)). En
un experimento, las personas de los equipos más grandes trabajaron cerca de un 30% menos que las que
trabajaban solas
([Mao et al., 2016](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0153048)). Amazon
mantiene cada equipo por debajo de diez personas, y la Guía de Scrum señala diez como el techo habitual.
:::

## El backlog y los despliegues

El trabajo espera en un backlog por orden de prioridad, y cada equipo construye el primer elemento que no ha
tomado ningún equipo anterior. Un equipo sin ingenieros no toma nada. Las Horas de desarrollo que sobran van
a un pool, que puede acelerar cualquier elemento. Un elemento acelerado termina ya, pero la prisa añade deuda
técnica a su Servicio, y desde Pre-semilla una Funcionalidad acelerada hace más probable que su despliegue
publique un bug. Con el piloto automático activado, un equipo ocioso toma la siguiente Funcionalidad que
puede construir, y encola una Refactorización cuando la deuda sube.

Una Funcionalidad terminada no llega a los usuarios de inmediato. Espera al siguiente despliegue:

```latex
\text{deploys per Team day} = \operatorname{min}\left(\text{policy cap},\ 480\ \text{work minutes} / \left(\text{build} + \text{deploy} + 15\ \text{verify}\right)\right)
```

El tiempo de compilación viene del lenguaje. PHP compila en segundos, y Rust tarda muchos minutos. Un
despliegue a mano tarda 30 minutos, y la [Entrega continua](/research/ci) lo baja a 5 y te permite revertir
un despliegue defectuoso. Un equipo de Plataforma reduce a la mitad otra vez el tiempo de despliegue.

Cuando se publica una Funcionalidad, los efectos de su tarjeta se aplican a todos los usuarios, y también su
carga. Algunas Funcionalidades además publican costes ocultos, como una consulta nueva sin índice, y la
[Revisión de código](/research/code-review) muestra esos costes antes de que se publique la Funcionalidad. La
referencia del [Equipo](/team#features) enumera todas las Funcionalidades.

## Despliegues defectuosos y radio de impacto

Cada despliegue puede publicar un bug. Desde Pre-semilla, la probabilidad base es del 10%. La política Avanzar
rápido la sube, y la deuda técnica puede triplicarla. Las [Pruebas automatizadas](/research/testing-culture)
la bajan un 30% y la Revisión de código un 20%.

Un despliegue defectuoso hace fallar el 8% de las peticiones del Servidor de aplicaciones por cada elemento
que publicó, hasta un 40%. Los despliegues pequeños y frecuentes rompen por tanto menos cuando se rompen, que
es la idea del [radio de impacto](/glossary/blast-radius). La página de [Despliegue defectuoso](/incidents/bad-deploy)
muestra cómo acabar con uno.

## Deuda técnica y política del equipo

La [deuda técnica](/glossary/tech-debt) es un porcentaje de tu Servicio. Cada Funcionalidad publicada suma
algo. El código sin framework suma un punto más, y una tarea publicada durante un incidente suma dos, porque
es un hotfix. La deuda reduce la velocidad hasta en la mitad, sube la probabilidad de despliegue defectuoso y
hace más probable cualquier incidente.

Cada equipo trabaja bajo una política:

| Política       | Velocidad | Deuda por Funcionalidad | Probabilidad de despliegue defectuoso | Máximo de despliegues al día |
| -------------- | --------- | ----------------------- | ------------------------------------- | ---------------------------- |
| Avanzar rápido | 1.3×      | 6 puntos                | 1.5×                                  | 16                           |
| Equilibrado    | 1×        | 3 puntos                | 1×                                    | 8                            |
| Calidad        | 0.8×      | 1 punto                 | 0.5×                                  | 4                            |

Calidad además gasta el 10% de sus Horas de desarrollo en deuda. Una política nueva toma el control tras un
día del Equipo. La tarea Refactorización elimina 20 puntos por 10 DH. No gana nada directamente, pero hace
todo lo demás más barato y seguro.

## Los presupuestos de error vuelven a la velocidad

Desde la Serie A, las peticiones fallidas cuentan contra tu SLO. Tras la investigación
[Presupuestos de error](/research/error-budgets), el presupuesto cambia la velocidad. Con más de la mitad del
presupuesto disponible, los equipos trabajan un 10% más rápido, y con el presupuesto agotado, trabajan a
media velocidad. La fiabilidad se convierte en un recurso que gastas en velocidad.
[Cómo funcionan los incidentes](/explanation/incidents) explica el presupuesto.

## Equipos de Plataforma

Desde la Serie A, cualquier equipo salvo el del fundador puede convertirse en un equipo de Plataforma. No
construye ningún backlog y en su lugar ejecuta tus Clústeres de Kubernetes y el pipeline. Sin uno, cada
Clúster activo se lleva la mitad de las Horas de desarrollo de un ingeniero de tus equipos de producto. Un
equipo de Plataforma con personal elimina ese impuesto, mantiene los Clústeres en una versión con soporte y
reduce a la mitad el tiempo de despliegue.

## Migraciones

Cambiar el Stack de tu Servicio inicia una migración. Sus Horas de desarrollo crecen con la base de código, y
un cambio de lenguaje cuesta lo máximo. El tráfico se mueve en cuatro pasos: 5%, 25%, 50% y luego 100%. Las
peticiones en el Stack nuevo fallan un 3% de las veces hasta que arreglas sus bugs, y mientras tanto las
Funcionalidades se construyen a media velocidad. Este es el [patrón estrangulador](/glossary/strangler-pattern).
Mira [Elegir un stack](/guides/choose-a-stack).
