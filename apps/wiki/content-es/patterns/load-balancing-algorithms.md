---
title: Algoritmos de balanceo de carga
summary: Elige cómo un balanceador de carga escoge entre servidores, porque la regla adecuada depende de si los servidores difieren y de si las peticiones difieren.
section: patterns
group: Scaling reads and compute
order: 210
aliases: round robin, least connections, power of two choices, p2c, consistent hash, weighted, sticky sessions, slow start, menos conexiones, hash consistente, ponderado, sesiones persistentes, arranque lento, algoritmos de balanceo
---

Un balanceador de carga necesita una regla para elegir un servidor, y la regla más simple falla cuando los servidores o las peticiones son desiguales.

## Cuándo usarlos

- Un servidor se calienta mientras sus vecinos están ociosos.
- Los servidores difieren en tamaño, o algunas peticiones tardan mucho más que otras.
- Un servidor nuevo se cae al incorporarse, porque recibe todo el tráfico mientras aún está frío.

## Cómo funciona

Round robin reparte las peticiones por turnos, así que un servidor pequeño recibe tantas como uno grande. Round robin ponderado da a cada servidor una parte según su tamaño. Least connections envía la siguiente petición al servidor con menos conexiones abiertas, lo que se adapta a las peticiones lentas. Power of two choices elige dos servidores al azar y toma el menos ocupado, y no necesita estado compartido, así que escala entre muchos balanceadores. El hashing consistente envía la misma clave al mismo servidor, lo que ayuda a las cachés.

Slow start sube el tráfico a un servidor nuevo durante sus primeros segundos. Las sesiones persistentes (sticky) fijan a un usuario a un servidor, lo que mantiene funcionando el estado local pero desequilibra la carga.

## Qué cuesta

Least connections necesita que el balanceador siga cada conexión. Power of two choices compara solo dos servidores, así que aún puede elegir uno ocupado, y el juego además reparte un poco de su tráfico a partes iguales sea cual sea la carga. El hashing ignora la carga, así que una clave caliente sobrecarga a un servidor. Las sesiones persistentes hacen que un reinicio cierre la sesión de los usuarios.

## En Quorum

Un [Balanceador de carga](/components/lb) tiene una política. Ponderado y round robin están abiertos desde el principio, y least connections, two choices y consistent hash necesitan [Algoritmos de balanceo de carga](/research/lb-algorithms). Sticky y slow start son interruptores. El Diseño mezcla un servidor más grande y uno más pequeño y usa least connections.

::Design{id="lb-least-conn"}

El glosario define el [balanceador de carga](/glossary/load-balancer) y [power of two choices](/glossary/power-of-two-choices), y el [hashing consistente](/glossary/consistent-hashing) es la tercera.
