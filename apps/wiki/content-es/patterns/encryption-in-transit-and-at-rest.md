---
title: Cifrado en tránsito y en reposo
summary: Cifra los datos en la red con TLS y en disco con claves que controlas, y automatiza la renovación de certificados para que una fecha de caducidad nunca tumbe el sitio.
section: patterns
group: Security and edge
order: 803
aliases: tls, https, ssl, certificate, certificate expiry, acme, lets encrypt, encryption at rest, kms, mtls, soc 2, certificado, caducidad de certificados, cifrado en reposo, cifrado en tránsito
---

Cifra cada enlace entre máquinas con TLS, cifra cada disco y cada copia de seguridad, y deja que el software renueve los certificados.

## Cuándo usarlo

- El tráfico cruza una red que no controlas del todo, lo que incluye tu propia red en la nube.
- Un cliente, un auditor o un informe SOC 2 pregunta cómo se protegen los datos.
- La caducidad de un certificado ya te ha sorprendido una vez.

## Cómo funciona

**En tránsito**, TLS da a cada conexión confidencialidad y demuestra la identidad del servidor con un certificado. Termínalo en el edge para los navegadores. Úsalo de nuevo, o usa TLS mutuo, entre servicios, para que un sniffer de paquetes dentro de la red no vea nada.

**En reposo**, la capa de almacenamiento cifra cada bloque, normalmente con AES-256, bajo una clave de datos que envuelve un servicio de gestión de claves. Un disco o una copia de seguridad robados son entonces ruido. No protege contra una app que lee los datos con credenciales válidas.

Los certificados caducan, y su vida útil sigue acortándose. Según la votación SC-081 del CA/Browser Forum, los certificados públicos pasan de 398 días a 47 días en 2029. A ese ritmo, la renovación manual es una caída mensual esperando a un día festivo, así que usa ACME, el protocolo en el que funciona Let's Encrypt.

## Qué cuesta

TLS añade un handshake y algo de CPU, que keep-alive y HTTP/2 ocultan en su mayor parte. El cifrado en reposo añade un servicio de claves que operar y desde el que restaurar. El error habitual es tratar un certificado como algo que se configura y se olvida.

## En Quorum

Los Componentes que terminan TLS, como el Balanceador de carga, la CDN, el WAF y el Gateway, guardan cada uno un certificado. Un Nodo de Secretos y certificados los renueva, como abajo.

::Design{id="tls-renewed"}

Sin un Nodo así activo, un certificado se agota en el Calendario y el sitio cae. El incidente [Certificado caducado](/incidents/certificate) lo muestra, y su solución es la acción Renovar, y luego [Automatización de certificados](/research/cert-automation) para que no vuelva. La vida útil de los certificados se acorta en Eras posteriores. [TLS en todas partes](/research/tls-everywhere) y [Cifrado en reposo](/research/encryption-at-rest) son Investigaciones que exige el elemento SOC 2 de la lista de verificación de la IPO, y no fijan ninguna opción en un Nodo. Lee la página de [Secretos y certificados](/components/pki), y las entradas del glosario sobre [certificados TLS](/glossary/tls-certificate) y [cifrado en reposo](/glossary/encryption-at-rest).
