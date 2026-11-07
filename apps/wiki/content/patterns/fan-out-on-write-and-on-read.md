---
title: Fan-out on write and on read
summary: Build a user's feed either when someone posts, by copying the post to every follower, or when the user reads, by gathering posts from everyone they follow.
section: patterns
group: Scaling reads and compute
order: 212
aliases: fan-out, fanout, feed, timeline, push model, pull model, hybrid fan-out, celebrity problem, twitter
---

Fan-out on write does the work at post time, and fan-out on read does it at view time.

## Use it when

- Reads of the feed far outnumber posts, so the cost belongs on the write.
- A feed must load fast, because it is the first screen.
- Accounts have a bounded number of followers, or you can treat the huge ones separately.

## How it works

On read (pull), the feed request asks for the latest posts of each followed account and merges them. Posting is cheap and reading is slow. On write (push), a post is copied into each follower's stored timeline, so reading is one lookup. If a user has 200 followers, one post makes 200 small writes.

The problem is the account with 50 million followers, where one post means 50 million writes. Twitter's published design pushes for most accounts and pulls the posts of the most followed ones at read time. This hybrid is the common answer.

## What it costs

Push multiplies writes, stores a timeline per user, and wastes work on followers who never log in. Pull makes the busiest request the most expensive and slow at the tail. The hybrid needs a rule for who counts as large, and the merge adds complexity.

## In Quorum

Fan-out is a setting on the [App Server](/components/server): pull or push. Push writes timelines through the data tier. Researching [Hybrid fan-out](/research/hybrid-fanout) turns push into the hybrid and lets a [Cache](/components/cache) split hot keys. Feeds start in a late Era, so both Designs run there with the other kinds' backends linked.

::Design{id="fanout-pull"}

::Design{id="fanout-push"}

The [Hot key](/incidents/hot-key) incident is the celebrity problem. The glossary defines [fan-out](/glossary/fan-out) and [fan-out on write](/glossary/fan-out-on-write).
