---
title: Una sola máquina
summary: Ejecuta el código y los datos en una máquina. Es la forma más barata de lanzar y el lugar correcto para empezar.
section: patterns
group: Scaling steps
order: 101
aliases: single server, monolith, lamp stack, all in one, one server, starter box, garage, servidor único, monolito, todo en uno, máquina inicial, garaje
---

Empieza con una máquina que ejecuta tu código y guarda tus datos.

## Cuándo dar el paso

- La barra de carga de la máquina se queda casi llena durante minutos seguidos, y el p99 sube con ella.
- Una consulta lenta o una ráfaga de tráfico ralentiza todas las páginas, porque el código y los datos consumen la misma CPU y memoria.
- Quieres cambiar el tamaño de la aplicación y de los datos por separado.

## El Diseño

::Design{id="one-box"}

Los Usuarios llegan a un Servidor de aplicaciones. Su ajuste de Base de datos local mantiene Postgres en la misma máquina, así que no hay un segundo Nodo, ni un Enlace por el que llamar, ni una segunda factura.

## Por qué funciona

Con unos cientos de Usuarios el trabajo es pequeño y la factura también. Una petición lee de un disco con el que comparte máquina, y tienes una sola cosa que desplegar, vigilar y reiniciar. Además aprendes cómo es tu tráfico antes de pagar por una estructura que quizá no necesites.

## Qué cuesta

Una máquina es un único punto de fallo. Cuando el host muere, la aplicación y los datos mueren juntos, y todas las peticiones fallan hasta que lo reemplazas. El código y los datos también pelean por la misma CPU, RAM y caché de páginas, así que el más ocupado deja sin recursos al otro, y no puedes hacer crecer ninguno por separado.

## En Quorum

El [Servidor de aplicaciones](/components/server) inicial ejecuta Postgres en su propia máquina hasta que lo enlazas a una [Base de datos](/components/database). Un [Fallo de instancia](/incidents/instance) muestra lo que cuesta la máquina única. El siguiente paso es [separa el servidor y el almacenamiento](/patterns/split-the-server-and-storage).
