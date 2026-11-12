---
title: Changelog
summary: What changed in Quorum over the last few days.
section: about
order: 3
aliases: changes, updates, release notes, patch notes, what is new
toc: top
---

Quorum has no versions. It changes all the time, and this page lists the latest days, newest first, so you can see what moved since you last played. A page on this wiki can lag behind the game by a few days. Older days are in the [full changelog](/about/changelog/all).

## Wednesday, 11 November 2026

### Changed

- Show the sectioned menu and settings in the wiki ([67f1e40](https://github.com/elianiva/quorum/commit/67f1e408a1d704176e0f8fa6bba3900ecfea3dfd))
- Rework the home menu and settings into sections ([41cd1e9](https://github.com/elianiva/quorum/commit/41cd1e955f1156c27e9ee10288d8a10ae512329a))
- Keep a panel above the scrim that blurs the board ([1bb68ca](https://github.com/elianiva/quorum/commit/1bb68ca3842024d2ebb90e66d772536a2d5672cf))
- Open the pause menu from the Sandbox HUD button ([21e4e55](https://github.com/elianiva/quorum/commit/21e4e55d59c7fc94280596968991ad5720e86285))
- Add the changelog entry for 2026-11-10 (#48) ([6bb6fcc](https://github.com/elianiva/quorum/commit/6bb6fcc4e06339918392a3eec648cf0b07d4f1ea))
- Remove the press page ([b835409](https://github.com/elianiva/quorum/commit/b835409bcf86774e4ee179e1944dd0d83fc59fa4))
- Give every Venture its own traffic profile ([dd286ff](https://github.com/elianiva/quorum/commit/dd286ff572fbc686cb86c2ba5ab4ed823b709824))
- Report board start failures to Sentry ([61c70f8](https://github.com/elianiva/quorum/commit/61c70f832ebf65355b1213413f75c29edac40761))
- Fix board start under a CSP without unsafe-eval ([05f269d](https://github.com/elianiva/quorum/commit/05f269d4454af1e30da8de9154ea3f22ca454d78))
- feat(web): import a Company from a save file on the title screen ([f2293dd](https://github.com/elianiva/quorum/commit/f2293dd2b4a83a4f82046c6c0966d3d0847a4a96))
- feat(web): move Company saves as files and prune unreadable ones ([8aec25e](https://github.com/elianiva/quorum/commit/8aec25ea8c2e201916918190ba1c6f72d71f08b6))
- Describe the reason first lever card in the wiki ([e289326](https://github.com/elianiva/quorum/commit/e289326240e3f3ac3fe620bd01dd7b381098ad88))
- Rework the Product lever card into a reason first hint ([047afe9](https://github.com/elianiva/quorum/commit/047afe9014307694af53ba1be5a77567a721a77d))
- Teach players to raise a pool with a product lever ([bfdae3c](https://github.com/elianiva/quorum/commit/bfdae3cf7ddeeab29eb5e5e6a738347f9f173c17))
- Record the product levers as built in the design record ([6769c39](https://github.com/elianiva/quorum/commit/6769c396496d1f90c8b2d01ab4d3a3252fd20b6e))
- Put product levers in the Research screen and the free Sandbox ([6f29014](https://github.com/elianiva/quorum/commit/6f2901477d2237376cb1344b567a0916bc0d7ac0))
- Build product levers into the Simulation ([8dd7b00](https://github.com/elianiva/quorum/commit/8dd7b00d0f654f592398418b22e6fff8d2319982))
- Trace product levers to real products and mark the baseline ([7299ef0](https://github.com/elianiva/quorum/commit/7299ef06d61f39a7c53c072c9a191afaaa3f3a74))
- Set the lever constants and put the mechanic on the roadmap ([52a19cf](https://github.com/elianiva/quorum/commit/52a19cf8e1921eeddc715a035c21766b2e58a7dc))
- Cap product levers by Venture and turn them off in Challenges ([c5a38b6](https://github.com/elianiva/quorum/commit/c5a38b6c4f4e6b9e850a2e7608a090b9b7116fb8))

## Tuesday, 10 November 2026

### Changed

- Limit launch traffic and cache assets ([e2b39a0](https://github.com/elianiva/quorum/commit/e2b39a0269d6e8803f3c68683dded5116a5f7b73))
- Animate phone sheets from the bottom ([cb92063](https://github.com/elianiva/quorum/commit/cb92063ce8aa1e2eafa846795457e73146d78dd1))
- Give Company saves a stable format ([43d9f2c](https://github.com/elianiva/quorum/commit/43d9f2c6ea9ae76b5289cbd0dcda6c6c67a2c852))
- Load languages on demand ([399b1f1](https://github.com/elianiva/quorum/commit/399b1f12e677b282734575bc34b1f783ad8ce5e3))
- Fit the Board to a phone ([e6f8ac8](https://github.com/elianiva/quorum/commit/e6f8ac883547961a6149dface0cf3638fc8f7f97))
- Prepare the title screen for launch ([ad41761](https://github.com/elianiva/quorum/commit/ad417617d118309e3f6efc6dcfd16a1701b3feb5))
- Cut the test suite down to what guards behaviour ([7fca78f](https://github.com/elianiva/quorum/commit/7fca78f9d47f235290f2e70220064f08d37fdacb))
- Add screenshot mode and rename teams and services ([4869421](https://github.com/elianiva/quorum/commit/4869421eca3c8777667115b463a0d0abc106b5fb))
- Fix component inbound and outbound contracts ([f3a3ca4](https://github.com/elianiva/quorum/commit/f3a3ca43e5c715a2936f2dad8cb790d821c21594))
- Explain how Tidy arranges the board ([9669b3b](https://github.com/elianiva/quorum/commit/9669b3b3eeffb6fff36dfb44f9172779bdc0f583))
- Cut the board's per-frame work and its per-card render groups ([d67dd79](https://github.com/elianiva/quorum/commit/d67dd790901efe836679e3eb69d10764db9fddba))
- Delay Board hovers until the pointer rests ([e37adad](https://github.com/elianiva/quorum/commit/e37adad917ab7409927bc5108cd5c4d545f44dc4))
- Move the board's frame and pointer code out of its controller ([0d02ad0](https://github.com/elianiva/quorum/commit/0d02ad067f8f2d15fd2a10c30a951275324b1871))
- Bring the Spanish messages up to date ([e0bd024](https://github.com/elianiva/quorum/commit/e0bd024c949048ba9fdbe8b88c4c65c171de4838))
- Split the board into one module per layer ([9d601e0](https://github.com/elianiva/quorum/commit/9d601e096200bcaa9aa28e59f2f12c775550ced2))
- Tidy by traffic: Load Balancer mid-board, providers and Analytics at the right ([64c8cf6](https://github.com/elianiva/quorum/commit/64c8cf6b283e176ada2e96ea9375a6555855d010))
- Measure Dashboard charts by their panel and pack its rows ([b1c9916](https://github.com/elianiva/quorum/commit/b1c9916a3a8ce1b0b12b18001f454134240a151f))
- Add Spanish as an interface language (#46) ([2baa808](https://github.com/elianiva/quorum/commit/2baa808854e74fd49097f2d3f6789801f46d2c40))
- Refresh the layout harness fixture ([13ef92e](https://github.com/elianiva/quorum/commit/13ef92e18959c1dd04cdc8fd65d8da139dc7a904))

## Sunday, 8 November 2026

### Added

- The Board draws coloured labels that follow teammates’ cursors, so you can watch their pointers move across the Company in real time. ([6e587a3](https://github.com/elianiva/quorum/commit/6e587a3857919d9b7492e3a4265d724ad780fc65))
- A toast shows you each new Seat’s name when someone joins, and the funding offer panel replaces the static deal cards with a live vote. ([32c99db](https://github.com/elianiva/quorum/commit/32c99db43411353e30d8f1bf17107e15cad3a79a))
- The Team panel warns you when the team exceeds the engineer limit, displays “Waiting on you: team too big” with the count of blocked items, and offers an Approve button to clear the wait. ([95d1170](https://github.com/elianiva/quorum/commit/95d1170e25da0d23df3d4937eef8c9484a1c0e3d))
- Rename your Seat, and the Room panel lists each Seat as a coloured chip while showing the Room code with a copy button for easy sharing. ([c19df13](https://github.com/elianiva/quorum/commit/c19df1310c991bd48b2ead81de56ea51c2f551fb))

### Changed

- The Read Replica inspector displays the primary’s database engine and tells whether writes wait for the replica, revealing the trade-offs between database types. ([72070b8](https://github.com/elianiva/quorum/commit/72070b8f1e36e5acf325de795814ce9074aca6d3))
- Research opens in a full-height sidebar; stalled Studies show a progress meter and the requirement they await, and queued items list their stall reason beside each entry. ([8cdf975](https://github.com/elianiva/quorum/commit/8cdf9751aa4f00162255e9a51c13e39688bbc04d))
- Runtime and Framework stack pickers appear as inline searchable lists in a fixed scrollable area; use arrow keys to move through rows and press Enter to select an option while the Tradeoff card stays open. ([e78d115](https://github.com/elianiva/quorum/commit/e78d115ca15f854f342862b26a075015998b715b))

### Fixed

- The Dashboard fills its traffic and latency charts from the Room’s data, so recent periods show up instead of staying empty. ([195382e](https://github.com/elianiva/quorum/commit/195382eb90128b9b6e7a2902c6eeb4cc9dcf2b3f))

## Saturday, 7 November 2026

### Added

- The wiki now includes a Patterns section that teaches system design in small pieces. Open Patterns from the wiki to browse them and apply them in your Designs. ([29835af](https://github.com/elianiva/quorum/commit/29835af7427c93ef51e0b5b963dfb1bff150e768))
- The Settings panel adds a Volume slider. Drag the slider to adjust the warning-tone level and hear the change instantly. ([5f9446e](https://github.com/elianiva/quorum/commit/5f9446e0f830aa9dd0038ff969a18fa2d890432f))
- The Settings panel adds an Easy mode toggle. Turn it on to run the clock at normal speed, restore the Pause button and speed controls, and have severe incidents pause automatically. ([aee5f6b](https://github.com/elianiva/quorum/commit/aee5f6bd6ff13882541e2fd84af8ea56be8a1deb))

### Changed

- Rush now shows its cost before you start it. After it finishes, it adds penalties to the Service and the Feature’s deployment, and a toast confirms the added penalties. ([6f48fdd](https://github.com/elianiva/quorum/commit/6f48fdd62d02fab2838db6727bbbea4eb6162e0a))
- Dragging a row in the Research queue makes the row slide smoothly to a highlighted drop slot, showing exactly where it will land. ([553d3b2](https://github.com/elianiva/quorum/commit/553d3b296fca3478ba1361dc441fedbe28719856))
- Research-tree node boxes expand, and long names wrap above the cost instead of being cut off, letting you read full names without ellipsis at any zoom level. ([d2fc5e8](https://github.com/elianiva/quorum/commit/d2fc5e826f5e9d4c5818bd8c51abecd9f75ef192))
- Inbox label chips increase in height, gain wider padding and a visible outline, and the label row scrolls sideways instead of wrapping, keeping each label clear and preventing overlap. ([2675f9f](https://github.com/elianiva/quorum/commit/2675f9fc8082be8682da7780d81dc9b981f87576))

## Friday, 6 November 2026

### Added

- The Study queue lets you drag studies to a new position; a rounded drop ring shows where you can place them, and each study retains its progress after moving. ([1884543](https://github.com/elianiva/quorum/commit/1884543cf55662766ee726cf0a8c1d7642183e39))
- Add `?amp` to any URL to open the Amp feedback overlay, where you type comments and send quick feedback. ([36d2a57](https://github.com/elianiva/quorum/commit/36d2a5792dbf7ffcf162ba3b85abe649a3bd18cb))

### Changed

- The Company HUD expands, showing the full net cash and runway numbers without clipping. ([1884543](https://github.com/elianiva/quorum/commit/1884543cf55662766ee726cf0a8c1d7642183e39))
- Select a language and every label, tooltip and description switches to it instantly. ([a939bac](https://github.com/elianiva/quorum/commit/a939bacabe4f2727d2c744dbbb207770eed258bc))

### Fixed

- The game starts reliably in any browser, and a stray key press or automatic page translation no longer crashes it. ([7e6b2fc](https://github.com/elianiva/quorum/commit/7e6b2fc72dc971b5d028b7df5b990aaf159f6f35))

## Thursday, 5 November 2026

### Added

- In the Inspector, a “Recycle workers” picker lets you toggle periodic worker recycling, and a “Sessions” sticky picker for Load Balancers lets you choose balanced or sticky session handling. ([588eaf6](https://github.com/elianiva/quorum/commit/588eaf6e294a2a64c5eeffb2453de2ddabf7a708))
- The Inspector displays a warning with a “Move auth in-house” button that queues the authentication migration and shows its cost. ([88e315b](https://github.com/elianiva/quorum/commit/88e315b95f4765f27c67f1d74341cbbec54ee297))
- On the Dashboard, a Waterfall table appears under Services and a Real-User-Monitoring table appears under Users. ([84b24bd](https://github.com/elianiva/quorum/commit/84b24bd9422124bc07175727e2c6f2214b782e2b))
- The Cost panel adds rows that break down the cost of each request after you unlock research. ([8f2d60a](https://github.com/elianiva/quorum/commit/8f2d60aff1875d8ebff57de3c1fc5e18ae6d35b1))
- The Team panel shows DORA metrics, deploy frequency, lead time, change-failure rate, and MTTR, once you add a CI/CD pipeline. ([8f2d60a](https://github.com/elianiva/quorum/commit/8f2d60aff1875d8ebff57de3c1fc5e18ae6d35b1))
- The Incident panel displays detection time, acknowledgement time, a Runbook button, a Drain button to remove a Node from rotation, and SLA credit information for missed SLO targets. ([88d1a09](https://github.com/elianiva/quorum/commit/88d1a099a300059e7d1803f64a0e68d9f08cc07f))

### Changed

- The Churn panel lists the slowest hop and the internet hop for each device, showing the added latency for each. ([4fd2a3a](https://github.com/elianiva/quorum/commit/4fd2a3ae7d1d10fd250ea644303f7e23e5242134))

### Fixed

- Incident alarms now show queue and budget fields. ([4fd2a3a](https://github.com/elianiva/quorum/commit/4fd2a3ae7d1d10fd250ea644303f7e23e5242134))

## Wednesday, 4 November 2026

### Added

- The Dashboard now includes rows for Alerts, Services, Resources and Users, plus per-Component charts for Load Balancer, Database, Cache, Queue, CDN and managed Components, and markers for Deploy, Incident, Company and Design changes. ([5c0c0e7](https://github.com/elianiva/quorum/commit/5c0c0e7cea16c9a2f192682a414467e39c755c31))
- Press `$` to open the Cost panel; it splits Burn into compute, data, storage, egress, third parties, observability and salaries, and also shows Revenue and margin. ([b8cb017](https://github.com/elianiva/quorum/commit/b8cb01792bba1897b5de59c5258e7b2c7de4a7a2))
- The Inspector shows two new buttons next to a Node’s size: “Buy ten sizes” and “Buy to the largest size”, letting you resize the Node in bulk with one click. ([e8870b3](https://github.com/elianiva/quorum/commit/e8870b3d982413f4b2e66994935485e5073567eb))
- A book-open icon appears in the title-screen taskbar; clicking it opens the wiki in a new browser tab. ([27bf73f](https://github.com/elianiva/quorum/commit/27bf73f87ac64acdd9758b89867b51151f7d3fa2))
- Settings now contain a Usage Data toggle that lets you opt out of anonymous product analytics, with the privacy policy linked beside it. ([b43ef66](https://github.com/elianiva/quorum/commit/b43ef664507a93ba359d2388ab19a8ea3cc2676b))

### Changed

- Folded sections in the Inspector remain in the same open or closed state when you advance simulation steps, and the sandbox controls on phones keep their open state after you touch them. ([23b170f](https://github.com/elianiva/quorum/commit/23b170f6ca48d5fc4646d6fb20ea3e44458a278f))
- The Companies page lists every saved Company with its name and logo; the title screen shows all Companies and lets you open, rename or delete each file. ([69e82d0](https://github.com/elianiva/quorum/commit/69e82d01af6017c5afd40e9017d60ba12cc209c4))

### Fixed

- A Spot reclaim now warns you before the Node is downsized, and switching the Node to on-demand during the warning cancels it. ([5c0c0e7](https://github.com/elianiva/quorum/commit/5c0c0e7cea16c9a2f192682a414467e39c755c31))
