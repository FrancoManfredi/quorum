---
title: Full changelog
summary: Every day that changed Quorum.
section: about
order: 4
aliases: changes, updates, release notes, patch notes, what is new
toc: top
---

Every day that changed Quorum, newest first. The [changelog](/about/changelog) shows only the latest days.

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

## Tuesday, 3 November 2026

### Added

- The title screen shows a notice panel warning that saves may break between builds, alerting you before you start a playtest. ([e2ee305](https://github.com/elianiva/quorum/commit/e2ee305a36467dd7868d8b5890b9291585110909))
- The Inbox panel splits into Action, FYI, Spam, and Trash folders; CVE entries appear as patch tickets whose deadlines turn red when overdue, giving you a clear backlog view. ([3f31ad7](https://github.com/elianiva/quorum/commit/3f31ad7ba59657d9c08118315c83669d0b0fa026))
- The board lets you use Ctrl+A/C/X/V/D to select, copy, cut, paste, and duplicate; Shift + Arrow nudges; you can add or subtract with box selection; a selection frame appears; a confirmation dialog asks before selling. ([d463763](https://github.com/elianiva/quorum/commit/d4637631f4fdea6834a9ad945615a1271e9d2963))

### Changed

- Press the top-left button to open a pause menu with Resume, Settings, Export log, Exit Company, and Title options; press Escape to open the same menu; the clock pauses while the menu is open. ([715f1fb](https://github.com/elianiva/quorum/commit/715f1fb0fbbdb35b147f4ba0dd7964ef401f83cf))
- Tap the Payments card to select the node and open the Inspector; the Collect footer moves revenue into Cash without opening the Inspector. ([28de320](https://github.com/elianiva/quorum/commit/28de320c27c2dca75524938a67c0a7b82743a3e3))
- The Sandbox HUD displays Apdex and Burn targets with coloured bars and adds a row showing the measured metric; the Inspector lists mean latency alongside percentiles. ([2760ec4](https://github.com/elianiva/quorum/commit/2760ec47881c8d235683b98ff9e3774e3f6a8c08))
- The Dashboard panel keeps its history and board state when you enter a Sandbox or Challenge, so your Company’s charts stay intact across board switches. ([c2fd5ea](https://github.com/elianiva/quorum/commit/c2fd5ea75da2349ac93655f3be563ac05347c55a))
- After any action that changes the board view, the board automatically fits to the new design once drawn, so zoom and layout remain correct after opening panels like the Glossary. ([5cb0161](https://github.com/elianiva/quorum/commit/5cb01617fbcfa8a514747d48d1b177efbaf6a4d2))

## Monday, 2 November 2026

### Added

- Swipe the Founder’s badge into the reader, hear a beep, and watch the title screen appear with its music. ([eab7072](https://github.com/elianiva/quorum/commit/eab7072bba6690da4a2d27b278da7d369bb57621))
- Open Company, Sandbox, or Challenge screens via their own URLs; use the browser’s back and forward buttons to move between them, and each navigation adds a history entry. ([856c3e0](https://github.com/elianiva/quorum/commit/856c3e04f2f24d8ded0e6145e2b8917f5ac80e94))

### Changed

- View the Team panel as a board with columns Up next, In progress, Shipping, Live; each card shows an ID, a kind label, Dev Hours, avatars, and the Shipping column displays the next deploy countdown and bad-deploy chance. ([a055a55](https://github.com/elianiva/quorum/commit/a055a55300ce327b4ea3d37d68a9095735c4bdb5))
- Open Research as a fullscreen tree for each track; the tree grows upward through one band per Era, scrolls like a page, and centers on the selected item. ([c6734fa](https://github.com/elianiva/quorum/commit/c6734fac3daca7e43cba7bb092bc6bdd59851243))
- See the build dock display controls only when the first Company needs them; the dock lists placeable items and the next unlock, the Research tree shows the next Era, and the “How to play” guide no longer opens automatically. ([87f7131](https://github.com/elianiva/quorum/commit/87f7131788a0b80d8f483bba3f1cc0848d6a929e))
- Notice node cards with a higher header that includes a medallion extending from the top-left corner; the medallion shows the group badge shape and a status mark, while the title sits beside it. ([471503a](https://github.com/elianiva/quorum/commit/471503ab8ae3f674805bf2c9af2b002b37f03cb4))
- Browse the Inbox panel to see mail for every topic, with badges coloured in the sender’s brand hue, and a taller window that keeps cards clear of each other. ([989a1d2](https://github.com/elianiva/quorum/commit/989a1d256dbc971aaf7a960197bbcb4ee96598bb))
- Pause the Company to stop link animations, keeping belts and chevrons still while you inspect or plan. ([7be2109](https://github.com/elianiva/quorum/commit/7be2109f03e5ad6efdd8c336f7b5a625d5a9df0b))

## Sunday, 1 November 2026

### Added

- The Era selector now includes the Series A Era. Choose a runtime such as Go, Java, C#, Elixir, or Rust, and see cross-zone latency, SLO meters, and an autoscaler that adds copies to a Node. ([c558c59](https://github.com/elianiva/quorum/commit/c558c5961fd9550bf396af574174af1e7e787142))
- The component palette now offers Search Engine, Object Storage, Queue, Worker, and a CDN component with adjustable TTL and WAF paranoia levels. Drag these parts onto the board and watch queue depth and egress burn. ([37aa546](https://github.com/elianiva/quorum/commit/37aa54655e9d4ff10ae22d5b3848cc00674ade03))
- A Team panel appears in the HUD, displaying Dev Hours from the Founder and Engineers, the Feature backlog, and available deploy slots. Open the panel to assign work and track progress. ([86f50f2](https://github.com/elianiva/quorum/commit/86f50f28b78f178d9c48ac3777dea8f4dbe1ebd6))
- Undo and Redo buttons sit on the toolbar, letting you step back or forward without changing Cash. The Tradeoff card displays a preview ghost and a Settling ring that fills as the simulation stabilises. ([88e25d0](https://github.com/elianiva/quorum/commit/88e25d0890c938e59c18c35704139ae69a10add1))
- Research appears as a tech tree with coloured shape badges for Edge, Compute, Data, and Ops tracks, plus a progress bar that fills as Insight accumulates. Click a node to open a side pane showing its description and prerequisites. ([1e58def](https://github.com/elianiva/quorum/commit/1e58def7eedbd4565f399987deea6acb3e7618fc))

### Changed

- Cards lift slightly when you drag them, snap to the grid with a subtle shadow, and show a coloured ring when selected. Links glow when created and fade out when cut, accompanied by subtle sound cues. ([c12e736](https://github.com/elianiva/quorum/commit/c12e736e67144717b315aebe9e6730c33ed3b0ce))
- Links appear as straight right-angle pipes that bend softly, thickening with traffic volume and tinting by packet type. Backward links route under cards for a clearer layout. ([b8ae307](https://github.com/elianiva/quorum/commit/b8ae307527fdddf943f36693d412edc9dfe5bb4a))

### Fixed

- Runtime names on App Server cards truncate with an ellipsis, and components lacking a framework show a dash instead of blank space, preventing overlap of UI elements. ([a23c746](https://github.com/elianiva/quorum/commit/a23c746d2fe5dd550dd8f8da9c246928e7af2531))

## Saturday, 31 October 2026

### Changed

- When an incident starts, the simulation clock slows to normal speed so you have time to react, and the failure hint now says “Select it and click Replace.” ([91fb61f](https://github.com/elianiva/quorum/commit/91fb61fbab4a340dd817b9d6a20f1a59e07392b4))
- The HUD displays the hour-averaged Apdex and its target; the Users card shows that Apdex value, and latency appears in seconds with millisecond precision. ([433d8de](https://github.com/elianiva/quorum/commit/433d8dedb68ee92458bffb99e4dc08ac80a9fe52))
- On the title screen, cables thread through the gaps between plates, request packets travel along each cable’s centerline beneath the machines, and the menu cable joint aligns with the new lead height. ([07468fa](https://github.com/elianiva/quorum/commit/07468fab7dc649365b583341992d9273b8d29512))
- The title screen builds a bench in real time: plates drop and land with shock outlines, request packets glide across the floating bench, and the dark night-shift theme lifts machines as you hover over menu options. ([ee8393f](https://github.com/elianiva/quorum/commit/ee8393f169b54b647f211c5bea0895770a277459))
- Press any button and feel feedback; the dock tray, inspector, panels, alerts, toasts, and card transitions now enter smoothly, while reduced-motion mode retains simple fades. ([53bdffe](https://github.com/elianiva/quorum/commit/53bdffe84f2e41292a66616ebef09b2033630a33))
- The HUD transforms into an icon-first toolbar with a stat stack; secondary UI sections remain folded until you open them, node cards show icons next to their labels, and buttons adopt the Geist font with a raised 3D fill. ([e267fce](https://github.com/elianiva/quorum/commit/e267fce1ae68a8bef1b99b428411c18f4d7450a5))
- The UI switches to the Graphite palette, near-neutral greys, primary ink, and four depth elevations, and the progress bar displays its fill width. ([01a6835](https://github.com/elianiva/quorum/commit/01a6835519699bbb792cd789ff126f5c6e260d4a))
- Component illustrations now use a consistent blueprint style across the game. ([6ebfb87](https://github.com/elianiva/quorum/commit/6ebfb87347beb1c7ef5c9bbe7e7a504ea78688ef))

## Saturday, 17 October 2026

### Added

- On the title screen you see a hero banner, four action buttons and a session note that act as the main menu. ([8c075c1](https://github.com/elianiva/quorum/commit/8c075c1ba32d78bdb3da4100af0d0ce7a9b14992), [280ab9e](https://github.com/elianiva/quorum/commit/280ab9e8f5df886351e0b575dba23aa21ee7f6bc))
- When you start a Run you move to the run canvas, the month clock starts, and the tick counter resets to the start of the month. ([8c075c1](https://github.com/elianiva/quorum/commit/8c075c1ba32d78bdb3da4100af0d0ce7a9b14992))
- When the month reaches its final tick you are taken to the report screen, ending the run. ([8c075c1](https://github.com/elianiva/quorum/commit/8c075c1ba32d78bdb3da4100af0d0ce7a9b14992))
- If you enter an invalid four-character room code a rejection toast appears; a valid code opens the lobby and shows the available seats. ([8c075c1](https://github.com/elianiva/quorum/commit/8c075c1ba32d78bdb3da4100af0d0ce7a9b14992))
- When you open the Tradeoff overlay your design choice is recorded, the month clock pauses, and it resumes when you close the overlay. ([8c075c1](https://github.com/elianiva/quorum/commit/8c075c1ba32d78bdb3da4100af0d0ce7a9b14992), [768522b](https://github.com/elianiva/quorum/commit/768522b39162811c21d2f300bab73496f35ecec2))
- Toast messages disappear automatically after a short delay, keeping the screen clear. ([8c075c1](https://github.com/elianiva/quorum/commit/8c075c1ba32d78bdb3da4100af0d0ce7a9b14992))
- On the design canvas nodes, links and packets animate; drag to pan and use the mouse wheel to zoom. ([c5ce6ec](https://github.com/elianiva/quorum/commit/c5ce6eca7d43f30fa42e6f97b08805dca5df4374))
- On the run screen you see a header HUD with Capital, Burn, load, p95, errors and speed controls, metric charts, a ledger table, and pause and Tradeoff overlays. ([c18ded8](https://github.com/elianiva/quorum/commit/c18ded8aeca262c3387eed8c027529174f6095bb), [280ab9e](https://github.com/elianiva/quorum/commit/280ab9e8f5df886351e0b575dba23aa21ee7f6bc))
