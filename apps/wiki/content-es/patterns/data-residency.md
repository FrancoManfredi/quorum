---
title: Residencia de datos
summary: Mantén los datos personales de una región en servidores de esa región, y enruta allí a sus usuarios, para cumplir la ley local y los contratos de clientes sin un producto aparte.
section: patterns
group: Security and edge
order: 806
aliases: data residency, data sovereignty, gdpr, eu data, regional data, geo routing, schrems, data localization, residencia de datos, soberanía de datos, RGPD, datos de la UE, datos regionales, enrutado geográfico, localización de datos
---

La residencia de datos significa que los datos de un usuario se quedan en un lugar determinado, y todo lo que los toca, incluidas las copias de seguridad y las réplicas, se queda allí también.

## Cuándo usarlo

- Clientes o contratos europeos piden almacenamiento solo en la UE.
- Un regulador o una norma sectorial limita dónde se pueden procesar los datos personales.
- Abres una región por la latencia y no debes copiar a sus usuarios a tu región de origen.

## Cómo funciona

Enruta a cada usuario a su región en el edge, con GeoDNS o con la región de origen de una cuenta. Ejecuta allí un stack completo, con su propia base de datos, para que una petición nunca cruce la frontera. Luego audita lo que se escapa: las copias de seguridad, la analítica, los logs y una tabla global de usuarios son los culpables habituales.

El RGPD en sí no prohíbe salir de la UE. Exige una base legal para la transferencia, como las cláusulas contractuales tipo. Muchos contratos empresariales piden más, así que la residencia suele ser un requisito comercial antes que legal.

Ejemplo: un cliente hospitalario alemán exige que los historiales de pacientes nunca lleguen a un servidor de EE. UU. Una réplica global para la recuperación ante desastres rompe esa promesa, aunque nadie lea de ella.

## Qué cuesta

Ejecutas el stack una vez por región, y una función que necesita a todos los usuarios juntos, como la búsqueda global o una clasificación, se vuelve más difícil. Las llamadas entre regiones pagan latencia y tarifas de transferencia. El error habitual es arreglar la base de datos primaria y olvidarse de sus logs.

## En Quorum

El juego comprueba la misma cadena como una línea de la lista de verificación de la IPO. Hay que investigar [Controles de residencia de datos](/research/gdpr-residency) y [GeoDNS](/research/geo-dns), debe haber abierta una región de la UE con un Nodo de Usuarios de la UE, y todo Nodo de datos alcanzable desde ella debe estar en la UE, o ser un almacén que se reparte entre regiones. Por separado, la Funcionalidad de Residencia de datos, que se construye con Horas de desarrollo una vez abierta una región de la UE, permite a la Empresa crecer en ese mercado a partir de la Era Pre-IPO. Abre la región con [Múltiples regiones](/research/multi-region), y consulta [Dar el salto global](/guides/go-global) para los pasos y el glosario sobre [residencia de datos](/glossary/data-residency) y [GeoDNS](/glossary/geodns).
