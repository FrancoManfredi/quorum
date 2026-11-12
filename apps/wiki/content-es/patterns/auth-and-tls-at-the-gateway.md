---
title: Autenticación y TLS en el gateway
summary: Comprueba cada token una sola vez en el API Gateway, deja el hash de contraseñas en manos de un Proveedor de autenticación y haz que un gestor de certificados renueve el TLS, para que la puerta de entrada deje de costarle al Servidor de aplicaciones y deje de caducar.
section: patterns
group: Scaling steps
order: 123
aliases: authentication, jwt, token validation, tls termination, certificates, certificate renewal, password hashing, identity provider, auth0, autenticación, validación de tokens, terminación de TLS, certificados, renovación de certificados, hash de contraseñas, proveedor de identidad
---

Valida cada token una sola vez en el API Gateway, mantén el hash de contraseñas fuera del Servidor de aplicaciones y renueva los certificados TLS con una máquina.

## Cuándo dar el paso

- Cada servicio vuelve a comprobar el mismo token en cada petición, y la CPU del Servidor de aplicaciones lo refleja.
- Los inicios de sesión están entre los tipos de petición más caros, porque un hash de contraseña cuesta mucho más que una vista de página.
- Un aviso de **Certificado caducado** ha tumbado un Nodo, porque alguien olvidó la fecha de una renovación.

## El Diseño

::Design{id="gateway-auth-tls"}

Los Usuarios llegan al API Gateway, que comprueba el token y pasa la petición al Servidor de aplicaciones. El Servidor de aplicaciones llama a la Base de datos para los datos y al Proveedor de autenticación para los inicios de sesión. El Nodo de Secretos y certificados no transporta tráfico. Es el dueño del calendario de cada certificado del Tablero.

## Por qué funciona

Todos los tipos de petición, salvo las páginas anónimas y el propio inicio de sesión, llevan un token. Sin la comprobación en el gateway, cada servicio lo valida en cada petición. Con **Autenticación en el borde**, el gateway lo valida una vez y los servicios se saltan ese paso.

El Proveedor de autenticación es un Componente gestionado, así que hace el hash de las contraseñas por ti y cobra por usuario. El Gateway, el Balanceador de carga, la CDN, el WAF, el Hub en tiempo real y la Función edge guardan cada uno un certificado. El gestor renueva cada uno mucho antes de que caduque.

## Qué cuesta

El gateway añade un salto a cada petición y cobra por petición, así que es barato cuando hay calma y caro bajo carga. El límite de tasa hace fallar a usuarios reales como throttled si lo pones por debajo de la demanda. El Proveedor de autenticación es una caída que no puedes arreglar, y un gestor caído no renueva nada. El juego no tiene rotación de claves ni flujo OAuth, así que el Tablero solo muestra la comprobación, el hash y la renovación.

## En Quorum

Coloca un [API Gateway](/components/gw), un [Proveedor de autenticación](/components/auth) y [Secretos y certificados](/components/pki). Investiga [API Gateway](/research/api-gateway), [Identidad gestionada](/research/auth-provider) y [Automatización de certificados](/research/cert-automation). El incidente [Certificado caducado](/incidents/certificate) es el fallo que esto previene. Consulta [bcrypt](/glossary/bcrypt) y [certificados TLS](/glossary/tls-certificate). El siguiente paso, [feature flags y CI](/patterns/feature-flags-and-ci-for-safe-deploys), limita lo que puede romper un despliegue defectuoso.
