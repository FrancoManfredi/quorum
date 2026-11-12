---
title: Ayuda a mejorar la wiki
summary: Cómo se hace la wiki, de dónde salen sus números y cómo enviar una corrección.
section: about
order: 1
aliases: edit, contribute, github, bug, report a bug, issue, feedback, open source, editar, contribuir, error, reportar un error, comentarios, código abierto
---

## De dónde salen los datos

La wiki tiene dos fuentes:

- **Los números, los desbloqueos y las listas** salen del catálogo del juego cuando se compila la wiki.
  Nadie escribe una estadística a mano, así que una estadística de la wiki coincide con el juego en la
  última compilación. El juego cambia cada semana, así que mira el [registro de cambios](/about/changelog)
  para ver qué se movió.
- **El texto** se escribe a mano en Markdown, en `apps/wiki/content`, dentro del
  [repositorio de Quorum](https://github.com/elianiva/quorum).

## Envía una corrección

1. Abre la página que quieres corregir.
2. Selecciona **Edit on GitHub** al final de la página.
3. Cambia el texto y abre una pull request.

Escribe frases cortas y usa las palabras que usa el juego, como **Nodo**, **Diseño** y
**Conocimiento**. No escribas un número que pertenezca al juego. Describe el comportamiento y deja que
el cuadro de datos de la página muestre el número.

## Vistas en vivo

Algunas páginas muestran partes del juego real, como la tarjeta de un Nodo o un tablero en marcha.
Usan el mismo código que el juego, así que se ven y se comportan igual.
