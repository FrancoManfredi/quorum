---
title: Economía unitaria y asignación de costes
summary: Divide la factura por lo que compra, para que cada tipo de petición, servicio y equipo cargue con su propio coste, y "la factura de la nube subió" se convierta en una respuesta concreta.
section: patterns
group: Cost
order: 903
aliases: unit economics, cost per request, cost allocation, showback, chargeback, tagging, finops, cost per customer, gross margin, economía unitaria, coste por petición, asignación de costes, etiquetado, coste por cliente, margen bruto
---

El gasto total no te dice casi nada. El coste por unidad de trabajo, y quién lo posee, te dice qué cambiar.

## Cuándo usarlo

- La factura creció un 30% y los ingresos un 10%, y nadie sabe decir dónde está la diferencia.
- Los equipos no ven lo que cuestan sus servicios, así que nadie tiene motivos para recortarlos.
- Pones precio a una funcionalidad, o decides si un cliente es rentable.

## Cómo funciona

Elige una unidad que tus usuarios compran, como una petición, un pedido o un cliente activo, y divide el coste por ella. Luego reparte el coste por responsable. Etiqueta cada recurso con un equipo y un servicio, y deja que los costes compartidos, como la red, se repartan según el uso.

El **showback** informa a cada equipo de su gasto. El **chargeback** se lo factura contra su presupuesto. Empieza con showback, ya que no necesita contabilidad y aun así cambia el comportamiento.

Ejemplo: si la búsqueda cuesta una décima de céntimo por consulta y genera una veinteava de céntimo, cada consulta pierde dinero, y ponerla en caché vale más que una base de datos más grande.

## Qué cuesta

La asignación es aproximada. Las bases de datos compartidas, los huecos de etiquetado y el gasto sin etiquetar obligan a fijar una regla, y los equipos discuten la regla. Mantenla simple, revísala cada trimestre y no dejes que el modelo sea tan exacto que nadie confíe en un cambio que se le haga.

## En Quorum

Aquí no hay un Diseño que construir, porque ambos son informes sobre un Diseño que ya tienes. [Economía unitaria](/research/unit-economics) muestra el coste por petición atendida de cada tipo de petición, lo que reparte el Gasto según la cuota de demanda de cada tipo. [Asignación de costes](/research/cost-allocation) la necesita primero y agrupa las mismas cifras por Servicio y por Equipo. El [Informe de rightsizing](/research/rightsizing) encuentra los Nodos ociosos detrás de una mala cifra, y [Recortar la factura de la nube](/guides/cut-the-cloud-bill) usa los informes. Mira [Dinero](/explanation/money) y el glosario sobre el [margen operativo](/glossary/operating-margin).
