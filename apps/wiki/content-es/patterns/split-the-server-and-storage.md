---
title: Separa el servidor y el almacenamiento
summary: Saca los datos del Servidor de aplicaciones a su propio Nodo de Base de datos, para que el código y los datos dejen de pelearse por una máquina y cada uno pueda crecer por separado.
section: patterns
group: Scaling steps
order: 102
aliases: separate database, two tier, app and database, web tier, data tier, database server, base de datos separada, dos capas, capa web, capa de datos, servidor de base de datos
---

Pon la Base de datos en su propio Nodo y haz que el Servidor de aplicaciones la llame por un Enlace.

## Cuándo dar el paso

- La máquina única muestra una barra de carga roja, y su CPU y memoria se reparten entre ejecutar código y servir datos.
- Una consulta lenta ralentiza todas las páginas, porque ambos viven en la misma máquina.
- Quieres cambiar el tamaño de la aplicación y de los datos por separado, ya que uno suele llenarse mucho antes que el otro.

## El Diseño

::Design{id="split-storage"}

Los Usuarios envían peticiones al Servidor de aplicaciones. El Servidor de aplicaciones ejecuta tu código y llama a la Base de datos para todo lo que debe leer o escribir. Nada más cambió: el mismo tráfico cruza un salto más.

## Por qué funciona

Una Base de datos quiere memoria y disco rápido. Un Servidor de aplicaciones quiere CPU. En una sola máquina compiten, y el más ocupado deja sin recursos al otro. Tras la división, cada Nodo tiene su propia barra de carga, así que la tarjeta que se vuelve ámbar te dice qué capa hacer crecer.

La división también convierte los datos en un lugar compartido. Dos Servidores de aplicaciones pueden llamar a una Base de datos, que es el paso que te permite añadir servidores más adelante.

## Qué cuesta

Cada petición paga ahora un salto de red a la Base de datos, así que la latencia sube un poco. Pagas por dos Nodos donde pagabas por uno, y el Enlace puede fallar o vencer de formas que un disco local no puede. Mantén corto el tiempo de espera para que una Base de datos atascada no retenga los workers del Servidor de aplicaciones.

## En Quorum

Coloca una [Base de datos](/components/database) y enlaza el [Servidor de aplicaciones](/components/server) a ella. El tiempo de espera del Enlace necesita [Tiempos de espera y reintentos](/research/timeouts). El siguiente paso añade un [Balanceador de carga](/patterns/several-app-servers-behind-a-load-balancer) delante de más Servidores de aplicaciones, y el [Pool de conexiones](/patterns/connection-pooling) protege la Base de datos cuando se multiplican.
