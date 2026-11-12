---
title: Gestión de secretos
summary: Guarda claves, contraseñas y tokens en una bóveda que los entrega bajo demanda, para que ninguno esté en el código, en una imagen ni en la lista de deseos de una página de phishing.
section: patterns
group: Security and edge
order: 804
aliases: secrets, vault, hashicorp vault, kms, secret rotation, api keys, credentials, environment variables, credential leak, phishing, secretos, bóveda, rotación de secretos, claves de API, credenciales, variables de entorno, fuga de credenciales
---

Un gestor de secretos guarda las credenciales una vez, controla quién las lee y las rota, para que un repositorio filtrado no filtre las claves.

## Cuándo usarlo

- Las contraseñas de la base de datos o las claves de API están en el control de versiones, en archivos `.env` o en imágenes de contenedor.
- Nadie puede decir quién ha leído una clave dada, ni cuándo cambió por última vez.
- Un ingeniero se va, y tienes que adivinar qué secretos conocía.

## Cómo funciona

Los servicios se autentican en la bóveda con una identidad de carga de trabajo, como un rol de la nube, y obtienen lo que necesitan al arrancar o en cada uso. La bóveda registra cada lectura. Los secretos dinámicos van más allá: la bóveda crea un usuario de base de datos que vive una hora, así que uno robado caduca solo.

La rotación importa tanto como el almacenamiento. Una clave rotada cada 90 días limita lo que vale una filtración antigua. Rota con un calendario, e inmediatamente tras cualquier sospecha de exposición.

Ejemplo: una contraseña subida a un repositorio público es rastreada en minutos. Una referencia a la bóveda en el mismo archivo no expone nada.

## Qué cuesta

La bóveda ahora es crítica: si está caída, los servicios no pueden arrancar. Mantén una caché, ejecútala en varias zonas y planifica su propia recuperación. El error habitual es mover el secreto a una bóveda y luego pegarlo en una variable de entorno que imprimen los logs.

## En Quorum

El jugador no coloca un Nodo para esto. [Gestión de secretos](/research/secrets-management) es una Investigación: con ella, actuar sobre un correo de phishing en la Bandeja de entrada encuentra las credenciales en la bóveda, así que la página no tiene nada que llevarse y no empieza ninguna [Fuga de credenciales](/incidents/credential-leak). Sin ella, ese clic cuesta Usuarios y empieza el incidente. El juego no guarda ningún secreto propio que rotar, así que la rotación no se modela. El Nodo [Secretos y certificados](/components/pki) se ocupa de los certificados, que es [cifrado en tránsito y en reposo](/patterns/encryption-in-transit-and-at-rest).
