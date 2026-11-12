---
title: WAF y gestión de bots
summary: Filtra el tráfico hostil en el edge con un firewall que bloquea patrones de ataque conocidos, y desafía a los clientes sospechosos en lugar de bloquearlos para que los usuarios reales sigan pasando.
section: patterns
group: Security and edge
order: 802
aliases: waf, web application firewall, modsecurity, owasp, paranoia level, under attack mode, bot, bots, scraper, ddos, challenge, captcha, firewall de aplicaciones web, nivel de paranoia, modo bajo ataque, gestión de bots, desafío
---

Un firewall de aplicaciones web inspecciona cada petición y descarta las que coinciden con reglas de ataque, antes de que cuesten trabajo a tus servidores.

## Cuándo usarlo

- Los bots o los scrapers son una gran parte del tráfico, y los servidores de aplicaciones gastan CPU en ellos.
- Ves sondeos de inyección SQL o de path traversal en los logs.
- Empieza una inundación, y necesitas un interruptor que descarte rápido el tráfico hostil.

## Cómo funciona

Un WAF aplica reglas como el OWASP Core Rule Set. Su **nivel de paranoia** va de 1 a 4. El nivel 1 tiene pocas reglas y rara vez bloquea a un usuario real, y cada nivel superior detecta más ataques y marca más peticiones reales.

La **gestión de bots** puntúa primero al cliente. Uno sospechoso recibe un desafío (una prueba de trabajo o un CAPTCHA) en lugar de un bloqueo, de modo que un usuario real al que juzgó mal aún puede pasar. El **modo bajo ataque**, como lo llama Cloudflare, desafía a todos durante un tiempo. Detiene casi toda la basura durante una inundación, y cuesta a los usuarios reales un paso extra.

Ejemplo: un formulario de inicio de sesión en el nivel 4 bloquea más sondeos de inyección, pero un cliente cuya contraseña contiene `'--` también puede ser bloqueado y llamar a soporte.

## Qué cuesta

Más reglas significan más CPU y algo de latencia en cada petición, y un falso positivo es un cliente perdido. Empieza en un nivel bajo y súbelo según la evidencia. Un WAF te gana tiempo mientras parcheas una aplicación vulnerable y nunca reemplaza el parche.

## En Quorum

Coloca un WAF delante de los servidores, como abajo.

::Design{id="waf-tuned"}

El nivel de paranoia es un compromiso: más bots bloqueados, más usuarios reales bloqueados, más CPU por petición. **Bajo ataque** es un interruptor de la tarjeta del WAF que sube la tasa de bloqueo y añade latencia, así que úsalo durante una inundación y apágalo después. Un usuario real al que bloquea el WAF recibe un error de cliente, que no gasta el presupuesto de error. [Firewall de aplicaciones web](/research/waf) desbloquea el [WAF](/components/waf), y [Gestión de bots](/research/bot-management) reduce a la mitad sus falsos positivos. Los incidentes [Oleada de bots](/incidents/bot-surge) y [DDoS](/incidents/ddos) son la prueba, y el glosario define el [WAF](/glossary/waf-web-application-firewall) y la [gestión de bots](/glossary/bot-management).
