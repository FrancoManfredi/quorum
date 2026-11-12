---
title: Análisis de dependencias
summary: Comprueba las librerías de cada build contra listas de vulnerabilidades conocidas, para que un paquete defectuoso o malicioso haga fallar el pipeline antes de llegar a producción.
section: patterns
group: Security and edge
order: 805
aliases: dependency scanning, sca, software composition analysis, dependabot, snyk, supply chain, sbom, cve, vulnerable dependency, lockfile, análisis de dependencias, escaneo de dependencias, cadena de suministro, dependencia vulnerable
---

El análisis de dependencias lee tu lockfile en cada build y lo hace fallar cuando una librería tiene un agujero conocido.

## Cuándo usarlo

- Tu app incorpora cientos de paquetes transitivos que nadie revisa.
- Un auditor pide un inventario del código de terceros, o evidencias para SOC 2.
- Un paquete del que dependes ha sido secuestrado o tiene un CVE nuevo.

## Cómo funciona

Un escáner compara cada paquete y versión fijados con bases de datos de avisos como la GitHub Advisory Database y OSV. Se ejecuta en CI, así que una pull request que añade una versión vulnerable falla su comprobación. Un SBOM, una lista de todo lo que contiene el build, te permite responder "¿nos afecta?" en minutos cuando aparece un CVE nuevo.

Fija las versiones con un lockfile. Un escáner solo puede juzgar la versión que publicas, y un `latest` sin fijar cambia por debajo. Las pull requests automáticas de actualización evitan que los pines se queden anticuados.

Ejemplo: cuando se divulgó Log4Shell en diciembre de 2021, un equipo con un SBOM podía consultar en minutos qué servicios incluían la librería vulnerable. Un equipo sin él buscó en repositorios e imágenes durante días.

## Qué cuesta

Un escáner solo encuentra problemas conocidos. Una versión maliciosa recién publicada aún no tiene aviso, así que combínalo con una pequeña demora antes de adoptar versiones nuevas. El ruido es el otro coste: una avalancha de hallazgos de baja gravedad se ignora, así que fija un umbral de gravedad que haga fallar el build.

## En Quorum

[Escaneo de dependencias](/research/dependency-scanning) necesita antes [Entrega continua](/research/ci). Con él, una puerta trasera publicada se detecta antes de que el build la instale, así que un [Compromiso de la cadena de suministro](/incidents/supply-chain) se vuelve mucho menos probable, y el parche de un aviso falso en la Bandeja de entrada se detiene antes de ejecutarse. No parchea un CVE divulgado: eso requiere Horas de desarrollo del backlog antes de que pasen su plazo y su periodo de gracia, o sigue una filtración de datos. La Investigación también es un requisito de SOC 2. No fija ninguna opción en un Nodo, porque es un elemento de Investigación. El glosario define el [análisis de dependencias](/glossary/dependency-scanning) y [SOC 2](/glossary/soc-2).
