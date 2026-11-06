The CDN answers cacheable content at the edge, near the user, as Cloudflare does with its network of edge servers.

## When to place it

- Place it when page views or video load your App Servers. See [Cut the cloud bill](/guides/cut-the-cloud-bill). It unlocks with [Content delivery](/research/cdn).
- Place it when egress is a large line in the Ledger.
- Skip it for API reads, writes, logins and checkouts. A CDN does not cache them, so they always reach the origin.

## How it works

Place it right after [Users](/components/users). It takes every request kind, answers most page views and video at the edge, and sends the misses and every other kind on to your origin. It has no capacity limit and serves every region.

Egress from the edge costs less than egress from your App Servers, so a CDN also cuts the cloud bill once egress is billed. A longer TTL raises the hit ratio, and the [Tiered caching](/research/tiered-caching) Research lifts how much video the edge answers. See [CDN](/glossary/cdn-content-delivery-network) and [egress](/glossary/egress).

## Options

- **TTL**: the default is a sensible start. A longer TTL raises the hit ratio, so raise it when pages change rarely.
- **Purge on deploy**: a release empties the CDN, and the origin takes the misses while it refills, a small stampede on every deploy. Without it the edge keeps serving the last release's pages until their TTL passes, so some users see old pages after a deploy.
- **Cache key**: what makes two requests the same page. A key with the path, the query string and the cookies shares nothing between users. Leaving out the query string or the cookie lifts the hit ratio. With [Edge-side includes](/research/esi) a logged-in page is cached, so a key without the cookie can serve one user's page to another. That is the Cached page leak incident, and users leave at once.

## How it fails

The CDN itself does not overload in the game. What goes wrong:

- Every request pays the edge hop, including the misses that go on to the origin.
- A short TTL lowers the hit ratio, and more traffic reaches your origin.
- Without one, a [DDoS](/incidents/ddos) or [Traffic spike](/incidents/spike) hits your App Servers in full. A CDN takes the cacheable part.

## Tips

- Pair it with [Object Storage](/components/storage) when you serve video.
- Place a [WAF](/components/waf) after the CDN, so the WAF sees only the misses.
- Raise the TTL when pages change rarely.
