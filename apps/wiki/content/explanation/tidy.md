---
title: How Tidy arranges the board
summary: The role columns Tidy uses, how it chooses each card's row, and the layouts it rejects.
section: explanation
order: 15
aliases: tidy, tidy by role, shift+t, layout, board layout, role column, columns, arrangement
gdd: /design/15-ui-ux
---

Tidy turns a region's Board into a left-to-right picture of the request path. Press `Shift+T`, and every card moves into the column for its job, then into a row that lines it up with the cards it calls. The view fits the result, and `Z` undoes the whole layout in one step.

The column answers where in the request path a card sits. The row answers what it talks to. That is why Tidy is worth running after a big change: it turns a pile of cards into a picture of the path.

## The seven columns

Tidy reads the Board as seven columns, left to right:

| Column | Holds                                                                                                                                   |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Users, DNS, CDN, WAF, and an entry API Gateway or [Load Balancer](/components/lb)                                                       |
| 2      | App Server, Serverless Function, Kubernetes Cluster, GPU Node, Edge Function, and the Autoscalers that scale them                       |
| 3      | Queue, Event Stream, CDC Connector, Realtime Hub, Connection Pooler, Object Storage, Document Store, and the Read Replicas that fill it |
| 4      | Worker, Cache, the Worker's Autoscaler, and the Read Replicas that fill it                                                              |
| 5      | Database, Vector Index, Wide-column Store, Distributed SQL, Data Warehouse, and the Read Replicas that fill it                          |
| 6      | Search Engine, Auth Provider, Payment Provider, LLM API, Push Provider                                                                  |
| 7      | [Analytics](/components/analytics), Payments                                                                                            |

A card's column comes from its role, not from its place in a Link chain. That is the decision the rest of the layout follows. A Database stays in the data column even when a long chain of Links would put it further left, and two App Servers share a column even when one sits behind a Cache and the other does not.

Some placements override the role:

- **The inbound path keeps its order.** In column 1, Users sit above DNS, CDN, WAF, API Gateway and Load Balancer, top to bottom. Tidy never reorders these cards by their neighbours.
- **A Load Balancer or API Gateway can sit inside the flow.** If every Link into it comes from the entry column, it stays in column 1. If compute or data feeds it, Tidy gives it a column of its own, sorted just left of the leftmost card it fronts and never left of its feeder. A Load Balancer between App Servers and Connection Poolers lands between those two columns. One between App Servers and Databases lands just left of the data tier.
- **An Autoscaler follows the Node it scales.** Link one to an App Server or Worker, and it moves into that Node's column. An Autoscaler with no such Link goes to the strip below the Board.

A [Read Replica](/components/replica) has its own rule. Tidy counts the cards already in columns 3, 4 and 5, ignoring replicas, and puts each replica in the shortest of those columns. Four replicas fed by App Servers therefore spread across the data columns instead of stacking in one. Tidy takes replicas in their current top-to-bottom order, so their old rows decide which one fills which column. If a Link into a replica comes from a Database, Cache, Connection Pooler, Object Storage or Document Store, it sits in that parent's column instead. A data parent wins over a Cache, and a Cache wins over the rest.

Two groups sit outside the request path. External providers and Analytics sit right of the data, so a call from compute runs forward, at the cost of crossing the data columns. The rest of the control plane, which means CI/CD Pipeline, Feature Flags, Secrets and Certificates, Service Mesh, and an Autoscaler with no Node, fills rows under the lowest card.

## How a card's row is chosen

Each column has a fixed vertical order by role. Autoscalers sit above App Servers. Queue sits above Read Replicas, which sit above Connection Pooler, Object Storage and Document Store. In the worker column, Autoscalers sit above Workers, Workers above Read Replicas, and Read Replicas above Cache. In the data column, Read Replicas sit above Database, and Data Warehouse sits below it.

Inside a role block, Tidy orders cards by their neighbours. It gives each neighbour a place between 0 and 1 by its order in its column, then averages those places. A Queue with three Workers at 0.2, 0.4 and 0.6 gets 0.4, which is its place among the other Queues. A card with no neighbours in another column keeps its current place.

Four sweeps settle the order: left to right, right to left, then each way again. Column 1 is never reordered, and a card never leaves its role block.

Then Tidy aligns the rows. Each neighbour pulls a card toward its center with a weight of 1 divided by that neighbour's own number of Links, so a hub with twenty Links gives each of its cards a twentieth of a vote. A card moves 30% of the way to the weighted mean. A pooling pass then keeps the cards in order and leaves at least 24 px between them: when two targets would cross, it averages them into a block and tries again. Five passes, each recentered on the Board's average row, settle the result.

The row is the part you can predict least exactly, because it depends on the Links you drew. The column is the part you can predict exactly.

## Where the columns start and wrap

Tidy anchors the result at the top-left of the cards it replaces: the leftmost current x and the topmost current y become the origin. Columns stand one card plus six clearances apart, 360 px with a 216 px card and a 24 px clearance. A column taller than 3,000 board units wraps. The overflow starts a new sub-column one pitch to the right, again from the top, so the limit caps height and spends width. A 61-Node board lands at 2376×2890 px instead of one 3536-high stack. Each sub-column is aligned on its own.

The control strip goes below the lowest card, four clearances down, and fills left to right.

## What it costs

- A Load Balancer that is fed and fronted by the same compute or data column has no gap to sit in. Tidy keeps it right of its feeder, so some of its Links run backward. A Load Balancer or API Gateway that compute or data feeds but that fronts nothing has no column to aim at, so it lands at the far right.
- A Read Replica placed to balance a column can still have a Link that runs right to left.
- Providers and Analytics at the far right keep compute calls forward, but every wire to them crosses the data columns.
- Tidy does not keep a manual arrangement. Your old rows break ties and choose the order replicas fill columns, but the columns and the alignment override the rest. It has no randomness: the same cards in the same places always produce the same layout.
- Tidy does not keep a [Data Group](/explanation/the-data-tier) in one block. If the data column wraps, a boxed group can span two sub-columns and its frame stretches across the gap.
- The 3,000-unit limit caps height, not width. A Board with many cards in one role grows sideways.
- The control strip follows no Links, so it is packed, not aligned.
- A Zone has no column or row of its own. It is a failure domain, not a tier, so two App Servers in different Zones share a column and the card and Link tint still show the Zone.
- Tidy moves cards only. It does not change a Link or the Simulation, and `Z` undoes the layout in one step.

## Layouts Tidy rejects

**A band per Zone.** A Zone is a failure domain, not a tier. A band per Zone gives each Zone its own row of the pipeline, so a three-Zone Company stacks the same shape up to three times. A call between Zones, the one that pays latency and Egress, then runs between bands instead of along the path. The Zone already has the card and Link tint.

**A lane per Component type.** Every type gets its own block, and the blocks are grouped into the build dock's lanes. It reads like a catalogue: ten App Servers become one tall block of identical cards, and a Link between two App Servers stays inside that block, so it cannot run left to right. The player needs the path between types, not a shelf for each type.

**A general layered drawing.** A Sugiyama-style layout assigns columns by the longest Link chain, then reorders and straightens. It cuts crossings in an arbitrary graph well, but it lets a Cache's column depend on the chain that reaches it, so the same Component can land in a different column on another Board. Its aspect-ratio bound can also push a column's overflow into the next column to hit a target shape. Tidy chooses a column a player can name over a layout that only reduces crossings.

**A force-directed layout.** Cards push apart and Links pull together. It has no columns and no left-to-right rule, so it cannot show the request path, and a small change to one card can reshape the rest. Tidy makes the path legible, not the graph organic.
