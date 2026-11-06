The Data Warehouse stands for BigQuery: a columnar database built to scan large tables for reports.

## When to place it

- Place it when Reports appear in the mix and the Database slows across every kind, not just reports. It unlocks with [Data warehousing](/research/data-warehouse).
- Place it before the Series B Era's reports grow, not after the first incident.

The [Analytics on Primary](/sandboxes/analytics-primary) Sandbox shows it.

::Sandbox{id="analytics-primary"}

## How it works

It takes report scans and sends nothing on. Each scan is slow but has no capacity limit, and you pay for each scan on top of a small Burn. See [OLTP and OLAP](/glossary/oltp-and-olap).

Until you link a Data Warehouse, the [Database](/components/database) runs report scans on the primary. A scan there evicts the buffer cache and holds locks, so reads and writes of every kind slow. When an App Server links to both, scans go to the Warehouse, and the primary stops running them.

## How it fails

The Warehouse itself does not overload in the game. What goes wrong:

- Each scan is slow, so report latency stays high. Reports are judged against their own target, so that is usually fine.
- Paid per scan, a heavy report mix shows up as a third-party cost in the Ledger.

### [Report kills the database](/incidents/report-db)

- **Signs:** A quarter-end report scans every table on the primary, every kind slows down, and the Database's Inspector reads "A report is scanning every table."
- **Do now:** Select the Database and press **Cancel report**.
- **Prevent:** Place a Data Warehouse. It takes the scan, so it never reaches the primary.

### [Region outage](/incidents/region)

- **Signs:** Every Node in one region goes grey at once, and that region's board goes grey with them.
- **Do now:** Nothing speeds it up. **Fail over** moves only Nodes that hold no data, so this one stays down until the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts. A store spread across regions needs nothing from you.
- **Prevent:** Research [Multiple regions](/research/multi-region) and [GeoDNS](/research/geo-dns), then run a copy of it in a second region.

:::Note{tone="real"}
Separating analytics from transactions is a classic lesson. Real teams copy data to a warehouse so reports never compete with checkouts.
:::
