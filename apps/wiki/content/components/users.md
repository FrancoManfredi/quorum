Users stands for the people on the internet who type your domain into a browser or open your app.

## When to place it

- You never place Users, and you cannot sell it. You act on its link instead.
- Put [DNS](/components/dns) or a [Load Balancer](/components/lb) in front of your App Servers when the board refuses a second link from Users: one host is not enough.

## How it works

The Node sends every request kind in the current Era's mix (see [Eras](/eras)). Each request pays the user hop before it reaches your first Node. How many users you have depends on Apdex and growth, as [Users and growth](/explanation/users-and-growth) explains.

A domain resolves to one host, so Users take one routing link. To reach more than one App Server, link Users to DNS or a Load Balancer and let that Node split the traffic.

From the Series C Era, users live in four regions. Each region you open gets its own Users Node on its own tab. The [GeoDNS](/research/geo-dns) Research sends each region's users to their own region, or to the nearest live one.

## How it fails

Users never fail by themselves, but everything they reach can.

- If the one Node behind Users goes down, every request fails.

### [Certificate expired](/incidents/certificate)

- **Signs:** Every browser refuses the site, and a "Certificate expired" banner appears with a **Renew** button.
- **Do now:** Press **Renew** on the banner. The certificate is issued again at once.
- **Prevent:** Research [Certificate automation](/research/cert-automation).

### [BGP misconfiguration](/incidents/bgp)

- **Signs:** A routing change withdraws your Company from the internet, and users cannot reach any region. A banner appears with a **Roll back** button.
- **Do now:** Press **Roll back** on the banner to undo the change.
- **Prevent:** No Research prevents it, and it is rare.

### [Traffic spike](/incidents/spike)

- **Signs:** Demand runs at ×3 to ×10 for minutes, and every card goes amber, then red.
- **Do now:** Add copies or sizes to the Nodes that saturate. With [Priority load shedding](/research/load-shedding), set **Shed low value** on the App Servers.
- **Prevent:** Keep spare capacity, add an Autoscaler or a CDN, and research [Priority load shedding](/research/load-shedding).

### [Bot surge](/incidents/bot-surge)

- **Signs:** The `bot` kind climbs on every card as scrapers arrive.
- **Do now:** Place a [WAF](/components/waf) after Users. It stops bots at its block rate, and a higher paranoia level stops more of them.
- **Prevent:** Research [Web application firewall](/research/waf) and place one.

### [DDoS](/incidents/ddos)

- **Signs:** Demand runs at ×50 of junk.
- **Do now:** Select the WAF and press **Under attack**. It challenges every request. Without a WAF, nothing speeds it up; it ends on its own after at most 60 s.
- **Prevent:** Research [Web application firewall](/research/waf) and [Content delivery](/research/cdn), and place both at the edge.

## Tips

- Link Users to a Load Balancer, not to an App Server, as soon as you can afford one.
- Put a CDN or WAF directly after Users: they work best at the edge.

:::Note{tone="real"}
Real browsers and resolvers cache a domain's answer, so a single A record really does send everyone to one address. See [DNS round robin](/glossary/dns-round-robin) and [BGP](/glossary/bgp-border-gateway-protocol).
:::
