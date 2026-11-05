## What it does

Object Storage stands for Amazon S3: a store for files that grows without limit.

It takes object puts and object gets: uploaded files and video. It sends nothing on. It has no capacity limit, and each request waits for the first byte, which is slower than a database query. See [object storage](/glossary/object-storage).

Its Burn grows with the data it holds, and that data never shrinks. Every upload adds to it.

## Storage class

The class sets what the bytes cost to keep, and what they cost to read back.

| Class             | Storage price | Reading it back                                                       |
| ----------------- | ------------- | --------------------------------------------------------------------- |
| Standard          | Full price    | At once.                                                              |
| Infrequent access | Half price    | At once, and a retrieval fee per GB, on the same bill line.           |
| Archive           | A tenth of it | Only after a restore. A `media` request fails as `timeout` meanwhile. |

Infrequent access is the class for files that are written once and rarely read, and archive for the ones kept only because a rule says so. Neither is free to read: the retrieval fee and the restore are the price of the cheaper storage. The game has no Lifecycle rules, so the player picks the class and every object follows it. The Inspector and [Data tier](/design/07-data-tier#object-storage) hold the prices.

Until you link Object Storage, the [Database](/components/database) stores files as rows. When an App Server links to both, files go to Object Storage, and the Database stops taking them.

## When to place it

Place it when uploads and video load the Database: its CPU and latency climb as the Upload or Video share of the mix grows. It unlocks with [Object storage](/research/object-storage).

## How it fails

Object Storage does not overload or fail in the game. Its problems are latency and cost.

- First-byte latency adds to every video and upload. A [CDN](/components/cdn) answers most video at the edge.
- Storage Burn only grows. Check it in the Ledger as the Company ages.
- A slow upload holds an App Server slot while the file comes up the wire. Send uploads through a [Queue](/components/queue) so the App Server keeps only the short sync part. The [Slow Uploads](/sandboxes/slow-uploads) Sandbox shows it.

::Sandbox{id="slow-uploads"}

## Tips

- Pair Object Storage with a CDN once you serve video.
- Link Workers to Object Storage when you send uploads through a Queue.
