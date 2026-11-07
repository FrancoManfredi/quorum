Object Storage stands for Amazon S3: a store for files that grows without limit.

## When to place it

- Place it when uploads and video load the Database: its CPU and latency climb as the Upload or Video share of the mix grows. It unlocks with [Object storage](/research/object-storage).
- Add a [CDN](/components/cdn) once you serve video.
- Check its Burn in the Ledger as the Company ages, because it only grows.

The [Slow Uploads](/sandboxes/slow-uploads) Sandbox shows a slow upload holding an App Server slot.

::Sandbox{id="slow-uploads"}

## How it works

It has no capacity limit, and each request waits for the first byte, which is slower than a database query. Object puts and gets arrive carrying uploaded files and video, and no Component sits behind it. See [object storage](/glossary/object-storage).

Its Burn grows with the data it holds, and that data never shrinks. Every upload adds to it.

Until you link Object Storage, the [Database](/components/database) stores files as rows. When an App Server links to both, files go to Object Storage, and the Database stops taking them.

## Options

**Product.** The store is S3, or R2 with [Egress optimization](/research/egress-optimization). R2 has no egress to the internet, and a read waits a little longer for its first byte unless a CDN is on the board. Every read and write also bills per request, at its product's price.

**Storage class.** The class sets what the bytes cost to keep, and what they cost to read back.

| Class             | Storage price | Reading it back                                                       |
| ----------------- | ------------- | --------------------------------------------------------------------- |
| Standard          | Full price    | At once.                                                              |
| Infrequent access | Half price    | At once, and a retrieval fee per GB, on the same bill line.           |
| Archive           | A tenth of it | Only after a restore. A `media` request fails as `timeout` meanwhile. |

Infrequent access suits files that are written once and rarely read. Archive suits the ones kept only because a rule says so. Neither is free to read, because the retrieval fee and the restore are the price of the cheaper storage. The Inspector and [Data tier](/design/07-data-tier#object-storage) hold the prices.

**Lifecycle.** [Lifecycle rules](/research/lifecycle-rules) move objects on their own once they are old enough. Each object past the window drops one class, from Standard to Infrequent access and from Infrequent access to Archive. A store that has been filling for a while holds most of its bytes in the cheaper class, and the oldest share of its reads fails as a timeout until those objects are restored. The Inspector shows how much of the store is past the window, and [Data tier](/design/07-data-tier#object-storage) holds the rule.

## How it fails

Object Storage does not overload or fail on its own in the game. Its problems are latency and cost.

- First-byte latency adds to every video and upload. A CDN answers most video at the edge.
- Storage Burn only grows. Check it in the Ledger as the Company ages.
- A slow upload holds an App Server slot while the file comes up the wire. Send uploads through a [Queue](/components/queue) so the App Server keeps only the short sync part.

### [Region outage](/incidents/region)

- **Signs:** Every Node in one region goes grey at once, and that region's board goes grey with them.
- **Do now:** Nothing speeds it up. **Fail over** moves only Nodes that hold no data, so this one stays down until the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts. A store spread across regions needs nothing from you.
- **Prevent:** Research [Multiple regions](/research/multi-region) and [GeoDNS](/research/geo-dns), then run a copy of it in a second region.

## Tips

- Pair Object Storage with a CDN once you serve video.
- Link Workers to Object Storage when you send uploads through a Queue.
