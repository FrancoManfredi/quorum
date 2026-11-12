---
title: Almacenamiento de objetos y reglas de ciclo de vida
summary: Guarda los archivos en almacenamiento de objetos y deja que las reglas de ciclo de vida muevan los objetos antiguos a clases más baratas, para que el coste de almacenamiento deje de crecer al ritmo de cada subida.
section: patterns
group: Scaling data
order: 311
aliases: s3, blob storage, storage class, glacier, infrequent access, archive, ttl, r2, retention, almacenamiento de blobs, clase de almacenamiento, acceso infrecuente, archivo, retención
---

El almacenamiento de objetos guarda archivos de forma barata y sin límite, y las reglas de ciclo de vida pasan los objetos que casi no se leen a clases más baratas.

## Cuándo usarlo

- Los usuarios suben imágenes, vídeo o documentos que una base de datos guarda mal.
- La mayoría de los objetos se leen en sus primeras semanas y casi nunca después.
- La factura de almacenamiento crece cada mes y los datos viejos rara vez se tocan.

## Cómo funciona

La aplicación guarda cada archivo bajo una clave y lo lee de vuelta por HTTP. Las clases cambian precio por acceso: Standard es la más cara y lee al instante, Acceso infrecuente cuesta cerca de la mitad por almacenar pero cobra una tarifa por lectura, y Archivo cuesta una pequeña fracción y necesita una restauración que tarda horas. Una regla de ciclo de vida dice que un objeto de más de 30 días baja una clase, y a los 90 días baja otra vez.

Una aplicación de fotos con 100 TB, la mayoría de más de un año, puede recortar su factura de almacenamiento de forma notable así. El coste es que una petición de un objeto archivado no se puede responder al instante.

## Qué cuesta

Las tarifas de recuperación y las esperas de restauración aparecen en los objetos más antiguos, los que nadie pensaba leer. Una foto antigua que se hace viral resulta a la vez lenta y cara. Además, las reglas actúan según la edad, no según el uso, así que un objeto que sigue siendo popular se degrada a menos que haya seguimiento de accesos. Los objetos pequeños pueden costar más de transicionar de lo que ahorran.

## En Quorum

::Design{id="lifecycle-storage"}

El [Almacenamiento de objetos](/components/storage) quita las subidas de la Base de datos. Su tarjeta tiene una clase de almacenamiento y una ventana de ciclo de vida. Una petición de un objeto archivado falla por tiempo de espera, así que la ventana de ciclo de vida decide cuánto del almacén puede alcanzar aún una lectura. El pie de figura muestra el Diseño bajo tráfico, no la factura de almacenamiento, que crece con el tiempo de calendario.

Desbloquéalo con [Almacenamiento de objetos](/research/object-storage), y las ventanas de ciclo de vida con [Reglas de ciclo de vida del almacenamiento](/research/lifecycle-rules). Un producto R2 que no factura egress necesita [Optimización de egress](/research/egress-optimization). El glosario define [almacenamiento de objetos](/glossary/object-storage), y [CDN push y pull](/patterns/cdn-push-and-pull) va delante de él.
