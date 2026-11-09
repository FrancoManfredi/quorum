import type { Messages } from '../messages.ts'

export const catalog: Messages['catalog'] = {
  achievements: {
    'hello-world': { name: '你好，世界', condition: '处理第一个请求' },
    'works-on-my-machine': { name: '在我机器上没问题', condition: '部署一次带有错误的版本' },
    'split-brain': { name: '脑裂', condition: '将数据库拆分至独立节点' },
    'averages-lie': { name: '均值会说谎', condition: '在 p99 超过平均值 5 倍时研究百分位数' },
    'shared-nothing': {
      name: '无共享',
      condition: '只用 PHP-FPM 服务器达到种子轮，且没有发生内存故障',
    },
    blocked: { name: '已拦截', condition: '让一个 Node.js 服务因某一类请求而 p99 上升 100 毫秒' },
    'off-by-one-region': { name: '差一个区域', condition: '让用户访问到距离超过 150 毫秒的区域' },
    'littles-law': { name: '利特尔法则', condition: '通过修复数据库来解决应用服务器瓶颈' },
    metastable: { name: '亚稳态', condition: '从重试风暴中恢复' },
    'big-rewrite': { name: '大重写', condition: '在一家公司内把所有服务迁移到新语言' },
    strangler: { name: '绞杀者', condition: '分四步切换流量完成迁移，且错误率低于 1%' },
    quorum: { name: 'Quorum', condition: '跨三个区域运行 R + W > N 的宽列存储' },
    eventually: { name: '最终一致', condition: '在十亿用户规模下运行 R = 1、W = 1' },
    polyglot: { name: '多语言专家', condition: '同时在生产环境运行五种语言' },
    'zero-gc': { name: '零垃圾回收', condition: '运行一个承受 100,000 rps 的 Rust 服务' },
    'no-cache': { name: '无缓存', condition: '不使用缓存和 CDN 达到 A 轮' },
    celebrity: {
      name: '名人效应',
      condition: '在没有热点键错误的情况下服务一条拥有 1000 万粉丝的帖子',
    },
    'follow-the-sun': {
      name: '追逐太阳',
      condition: '服务四个区域，且没有节点在本地峰值时超过 70%',
    },
    'postgres-for-everything': {
      name: '一切交给 Postgres',
      condition: '仅使用 Postgres 数据组件达到 B 轮',
    },
    'hug-of-death': { name: '热情压垮服务器', condition: '挺过 10 倍流量尖峰且不流失用户' },
    'egress-shock': { name: '出站流量冲击', condition: '让出站流量成为账单上最大的一项' },
    'chaos-monkey': { name: '混沌猴', condition: '挺过 100 次随机终止' },
    blameless: { name: '无责复盘', condition: '撰写 50 篇故障复盘' },
    nines: { name: '可靠性之九', condition: '连续一个日历周保持 99.99% 的可用性' },
    'five-nines': { name: '五个九', condition: '完成五个九挑战' },
    monoglot: { name: '单一语言专家', condition: '只使用一种语言完成 IPO' },
    'default-alive': { name: '默认可持续', condition: '不接受任何融资完成 IPO' },
    unicorn: { name: '独角兽', condition: '达到 10 亿美元估值' },
    decacorn: { name: '超级独角兽', condition: '达到 100 亿美元估值' },
    'everyone-online': { name: '人人在线', condition: '达到 60 亿用户' },
    'warm-start': { name: '热启动', condition: '在流量高峰期间扩容 JVM 服务，且 p99 没有退化' },
    'rule-of-40': { name: '40 法则', condition: '作为上市公司，让“40 法则”得分达到 80' },
    'beat-and-raise': { name: '超预期并上调指引', condition: '连续八个季度超出业绩指引' },
    'serial-founder': { name: '连续创业者', condition: '在每个创业方向完成退出' },
    'two-hard-things': { name: '两件难事', condition: '在缓存上经历一次陈旧读取事件' },
    'conways-law': { name: '康威定律', condition: '服务数多于团队数，然后修正' },
    fallacies: { name: '谬误', condition: '在事件中经历分布式计算的八个谬误' },
    'thundering-herd': { name: '惊群', condition: '在没有错误的情况下度过重连风暴' },
    runbook: { name: '运行手册', condition: '让事件在没有玩家操作的情况下自行解决' },
    finops: { name: 'FinOps', condition: '同时运行预留、按需和竞价节点组成的集群' },
    'spot-the-difference': { name: '找不同', condition: '在没有错误的情况下度过竞价实例回收' },
    'let-it-crash': {
      name: '让它崩溃',
      condition: '让一个 Elixir 服务承受 1,000 次崩溃且没有失败请求',
    },
  },
  backups: {
    none: { name: '无' },
    nightly: { name: '每夜备份' },
    pitr: { name: 'PITR' },
  },
  buildGroups: {
    edge: { label: '边缘网络' },
    compute: { label: '计算' },
    data: { label: '数据' },
    ops: { label: '运维' },
  },
  cacheKeys: {
    full: { name: '路径、查询串和 Cookie' },
    query: { name: '路径和查询串' },
    path: { name: '仅路径' },
  },
  cacheStrategies: {
    aside: { name: '旁路缓存' },
    'read-through': { name: '穿透读' },
    'write-through': { name: '穿透写' },
    'write-behind': { name: '异步写' },
  },
  collectors: {
    g1: { label: 'G1' },
    parallel: { label: '并行' },
    zgc: { label: 'ZGC' },
  },
  components: {
    users: {
      name: '用户',
      product: '互联网',
      blurb: '流量的起点。域名解析到一台主机，因此用户只走一条连线。',
    },
    payments: {
      name: '支付',
      product: '发票',
      blurb: '收入暂存在这里。收款箱大约能容纳一分钟的收入。',
    },
    analytics: {
      name: '分析',
      product: 'OpenTelemetry',
      blurb: '将任意节点连接到这里，对其流量采样并转化为洞察。',
    },
    server: {
      name: '应用服务器',
      product: 'VM',
      blurb: '运行你的代码，响应请求并向数据库发送查询。',
    },
    database: {
      name: '数据库',
      product: 'PostgreSQL 或 MySQL',
      blurb: '数据的唯一来源。Postgres 为每个连接创建一个进程；MySQL 为每个连接分配一个线程。',
    },
    dns: {
      name: 'DNS',
      product: 'Route 53',
      blurb: '在最多 8 台主机之间轮询。没有健康检查：故障主机仍会分到流量。',
    },
    lb: {
      name: '负载均衡器',
      product: 'NGINX',
      blurb: '在应用服务器之间分配流量，并在下次健康检查时剔除故障主机。',
    },
    pooler: { name: '连接池', product: 'PgBouncer', blurb: '多条应用连接共用 20 条数据库连接。' },
    cache: {
      name: '缓存',
      product: 'Redis',
      blurb: '热点数据能放入内存时，直接响应读取。写入穿透缓存并使缓存失效。',
    },
    replica: {
      name: '只读副本',
      product: 'PostgreSQL 副本',
      blurb: '响应读取，但落后于写入，因此部分 API 读取会返回旧数据。',
    },
    auth: { name: '身份认证服务', product: 'Auth0', blurb: '代为计算密码哈希，按用户收费。' },
    search: {
      name: '搜索引擎',
      product: 'Elasticsearch',
      blurb: '响应搜索查询，每档规格支持每秒 400 次查询。',
    },
    storage: {
      name: '对象存储',
      product: 'Amazon S3',
      blurb: '存放上传文件，容量不限，按实际存储量收费。',
    },
    doc: {
      name: '文档数据库',
      product: 'MongoDB, Firestore',
      blurb:
        '存文档而不是行。没有连接、也没有需要池化的连接：读写共用一个固定吞吐，而每个查询都要有自己的索引。',
    },
    queue: {
      name: '队列',
      product: 'RabbitMQ',
      blurb: '先接收任务，再由工作进程处理。用户只需等待入队。',
    },
    worker: {
      name: '工作进程',
      product: 'Sidekiq',
      blurb: '运行队列任务，用户无需等待。请连接到导出任务所需的数据源。',
    },
    log: {
      name: '事件流',
      product: 'Apache Kafka',
      blurb:
        '是日志而不是队列：事件读完后仍然保留，消费者可以重放。每个消费者读一个分区，按自己的节奏落后。',
    },
    fn: {
      name: '无服务器函数',
      product: 'AWS Lambda',
      blurb:
        '按请求运行你的代码，无需为机器付费：空闲时不花钱，闲置后会有冷启动，同时可跑 1,000 个执行。',
    },
    cdn: {
      name: 'CDN',
      product: 'Cloudflare',
      blurb: '就近响应可缓存的页面，边缘出站流量更便宜。',
    },
    waf: {
      name: 'WAF',
      product: 'ModSecurity',
      blurb: '在流量抵达应用前拦截机器人，但也会误拦部分真实用户。',
    },
    gw: {
      name: 'API 网关',
      product: 'Kong',
      blurb: '为 API 调用限流并转发。超过速率限制后，请求以 throttled 失败，并按请求计费。',
    },
    ws: {
      name: '实时中枢',
      product: 'Socket.IO',
      blurb: '为每条实时消息保持一个打开的连接。能容纳多少取决于运行时。',
    },
    psp: {
      name: '支付服务',
      product: 'Stripe',
      blurb: '为结账处理银行卡扣款，每笔收取 2.9% 加 $0.30。',
    },
    autoscaler: {
      name: '自动扩缩容器',
      product: '自动扩缩容组',
      blurb: '连接应用服务器或工作进程。高负载时增加副本，空闲时减少副本。',
    },
    ci: {
      name: 'CI/CD 流水线',
      product: 'GitHub Actions',
      blurb: '发布等待中的内容。部署策略决定部署耗时、成本，以及糟糕部署的影响范围。',
    },
    cluster: {
      name: 'Kubernetes 集群',
      product: 'Kubernetes',
      blurb: '连接应用服务器或工作进程，部署到共享节点：支出减少 15%，30 秒即可新增副本。',
    },
    warehouse: {
      name: '数据仓库',
      product: 'BigQuery',
      blurb: '按列执行报表扫描，每次耗时 1.5 秒，不限次数，按扫描收费。',
    },
    vec: {
      name: '向量索引',
      product: 'pgvector, Pinecone, Qdrant',
      blurb: '在你的向量上回答最近邻查询。索引常驻内存，能访问到它的请求赚得更多。',
    },
    gpu: {
      name: 'GPU 节点',
      product: 'NVIDIA 上的 vLLM',
      blurb: '以每秒 token 数衡量 AI 推理吞吐量，每档规格使 GPU 数量翻倍。',
    },
    edge: {
      name: '边缘函数',
      product: 'Cloudflare Workers',
      blurb: '在用户身边运行小型处理程序：5 毫秒、没有冷启动，用 CPU 上限代替机器。',
    },
    llm: {
      name: '大模型 API',
      product: '托管模型',
      blurb: '无需 GPU 即可处理 AI 请求，按 token 收费，并有速率限制。',
    },
    msgp: {
      name: '推送服务',
      product: 'Amazon SNS',
      blurb: '发送推送通知和邮件，按条收费，每秒支持 10,000 条。',
    },
    wide: {
      name: '宽列存储',
      product: 'Apache Cassandra',
      blurb: '将每个键复制到 N 个节点。读取请求其中 R 个，写入等待 W 个确认。',
    },
    dsql: {
      name: '分布式 SQL',
      product: 'CockroachDB',
      blurb: '基于 Raft 的 SQL，每次写入都等待多数副本确认。',
    },
    cdc: {
      name: 'CDC 连接器',
      product: 'Debezium',
      blurb: '把数据库连接到它。它从写入日志读取每一次变更并发布到事件流，应用因此无需写两次。',
    },
    mesh: {
      name: '服务网格',
      product: 'Istio',
      blurb:
        '把应用服务器和工作进程连接到它。每个服务旁的边车会重试并断开其调用，并观测它们：每跳 +1 ms，并占用 5% 的 CPU。',
    },
    ff: {
      name: '功能开关',
      product: 'LaunchDarkly',
      blurb:
        '把一项功能逐步开放给 5%、25%、50% 或全部用户，并可一键关闭。糟糕的部署只会波及拥有它的那部分用户。',
    },
    pki: {
      name: '密钥与证书',
      product: "Let's Encrypt",
      blurb: '保管密钥，并在 TLS 证书到期前续期。若它没有运行，证书会按日历到期，站点随之下线。',
    },
  },
  dbRetentions: {
    keep: { name: '全部保留' },
    archive: { name: '30 天后归档' },
    delete: { name: '30 天后删除' },
  },
  deployStrategies: {
    recreate: { name: '重建部署' },
    rolling: { name: '滚动部署' },
    'blue-green': { name: '蓝绿部署' },
    canary: { name: '金丝雀部署' },
  },
  deviceInfo: {
    desktop: { name: '桌面' },
    mobile: { name: '手机' },
    tablet: { name: '平板' },
  },
  dockGroups: {
    edge: { label: '边缘网络' },
    compute: { label: '计算' },
    data: { label: '数据' },
    messaging: { label: '消息' },
    platform: { label: '平台' },
    insight: { label: '可观测性' },
    managed: { label: '托管' },
  },
  eras: [
    { name: '车库创业', question: '一台机器能撑到什么时候？', arrivals: '页面访问与 API 读取。' },
    {
      name: '天使轮',
      question: '数据库成为瓶颈时怎么办？',
      arrivals: '写入争抢数据库资源。开放招聘，故障开始出现。',
    },
    {
      name: '种子轮',
      question: '一种应用服务器无法应付所有请求时怎么办？',
      arrivals: '搜索、上传与机器人流量。队列、工作进程、CDN 和 WAF。',
    },
    {
      name: 'A 轮',
      question: '整个可用区故障时怎么办？',
      arrivals: '视频、聊天、结账与竞价。可用区、自动扩缩容与错误预算。',
    },
    {
      name: 'B 轮',
      question: '分析和 AI 共用为交易设计的数据库时会怎样？',
      arrivals: '导出、报表与 AI 请求。数据仓库、GPU、重试与熔断器。',
    },
    {
      name: 'C 轮',
      question: '用户遍布四大洲时怎么办？',
      arrivals: '信息流、Webhook 与推送。区域、GeoDNS、法定人数与共识。',
    },
    {
      name: '上市前',
      question: '你能证明公司已准备好上市吗？',
      arrivals: '上市清单：可靠性、SOC 2、灾难恢复演练、数据驻留与 40 法则。',
    },
    {
      name: '已上市',
      question: '你能每个季度都超过业绩指引吗？',
      arrivals: '季度、业绩指引与市场估值倍数。游戏没有终点。',
    },
  ],
  exits: {
    'acqui-hire': { name: '人才收购' },
    acquisition: { name: '公司收购' },
    ipo: { name: 'IPO' },
    'step-down': { name: '卸任' },
  },
  families: {
    burstable: {
      name: '突发性能型',
      blurb: '便宜。空闲时积累 CPU 积分，耗尽后 CPU 性能降至 20%。',
    },
    general: { name: '通用型', blurb: '1 vCPU : 4 GB。' },
    compute: { name: '计算', blurb: '1 vCPU : 2 GB。' },
    memory: { name: '内存', blurb: '1 vCPU : 8 GB。' },
    arm: { name: 'ARM', blurb: '与通用型相同但便宜 20%。部分运行时和库需要移植工作。' },
  },
  features: {
    'landing-page': { name: '着陆页', effect: '市场规模 +20%，页面访问量 +10%' },
    'signup-flow': { name: '注册流程', effect: '增长 +15%，写入请求提前出现' },
    pagination: {
      name: '分页',
      effect: 'API 读取的传输字节数减半',
      hidden: '新增一种没有索引的查询模式',
    },
    'password-login': { name: '密码登录', effect: '开始出现登录请求：每次消耗 80 毫秒 CPU 时间' },
    'paid-plans': { name: '付费套餐', effect: '写入收入增加 30%，另有订阅收入' },
    'email-digests': {
      name: '邮件摘要',
      effect: '流失 −10%。摘要邮件以一批任务集中发送：导出量翻倍，每个 400 毫秒 CPU 和 50 次读取',
      hidden: '发送是一批集中的任务',
    },
    'search-filters': {
      name: '搜索筛选',
      effect: '搜索收入增加 25%',
      hidden: '每次搜索查询的成本增加 40%',
    },
    'profile-photos': {
      name: '头像',
      effect: '增长 +10%，开始出现上传请求：每次消耗 120 毫秒 CPU 时间',
    },
    'public-api': {
      name: '公开 API',
      effect: '市场规模 +25%，API 读取量 +30%',
      hidden: '机器人流量 +50%',
    },
    'infinite-scroll': {
      name: '无限滚动',
      effect: 'API 读取收入增加 10%，用户发起的读取量增加 40%',
    },
    video: { name: '视频', effect: '市场规模 +40%，开始出现视频请求：每次 5 MB' },
    chat: { name: '聊天', effect: '流失率 −20%，实时消息会持续占用连接' },
    checkout: { name: '结账', effect: '开始出现结账请求：每次 $25，由支付服务处理' },
    'notifications-center': { name: '通知中心', effect: '增长 +10%，实时消息量 +20%' },
    'mobile-app': { name: '移动应用', effect: '市场规模 +60%，API 读取量 +50%' },
    'data-export': {
      name: '数据导出',
      effect: '写入收入增加 20%。开始出现导出请求：每次消耗 400 毫秒 CPU 时间，并执行 50 次读取',
    },
    dashboards: { name: '仪表盘', effect: '市场规模 +10%。开始出现报表请求：每次执行一次全表扫描' },
    'ai-assistant': {
      name: 'AI 助手',
      effect: '开始出现 AI 请求：每次 $24，由 GPU 节点或大模型 API 处理',
    },
    recommendations: {
      name: '推荐系统',
      effect: '视频请求量 +30%',
      hidden: '导出请求量 +30%：模型进行批量训练',
    },
    'audit-log': {
      name: '审计日志',
      effect: '市场规模 +10%：企业客户可以购买了',
      hidden: '每次写入查询的成本增加 20%',
    },
    'activity-feed': {
      name: '动态信息流',
      effect: '市场规模 +50%。开始出现信息流请求：每次执行 20 次读取，或通过写时扇出读取一条时间线',
    },
    webhooks: {
      name: 'Webhook',
      effect: '市场规模 +20%。开始出现 Webhook 请求：调用客户服务器，每次耗时 800 毫秒',
    },
    'push-notifications': {
      name: '推送通知',
      effect: '增长 +15%。开始通过推送服务发送通知',
      hidden: '流失率 +5%：用户厌倦了这些通知',
    },
    localization: { name: '本地化', effect: '北美以外的市场规模 +40%' },
    'offline-mode': {
      name: '离线模式',
      effect: '流失率 −10%',
      hidden: '写入量 +10%：设备重新连接时会集中同步',
    },
    'single-sign-on': { name: '单点登录', effect: '市场规模 +10%：企业客户通过 SAML 登录' },
    'data-residency': { name: '数据驻留', effect: '欧盟市场必备：欧盟数据留在欧盟区域' },
    'status-page': { name: '状态页', effect: '流失率 −10%：用户能看到你正在处理问题' },
    'usage-pricing': { name: '按用量计费', effect: '导出、写入、AI 请求和 Webhook 的收入增加 15%' },
  },
  frameworks: {
    none: { name: '无框架', blurb: '运行快，功能开发慢。' },
    jetzig: {
      name: 'Jetzig',
      blurb:
        '文件路由、模板、数据库查询和后台任务一应俱全：功能交付快。CPU 1.3×，每个进程 25 MB，工具链较年轻。',
    },
    tokamak: {
      name: 'Tokamak',
      blurb:
        '基于 http.zig 的依赖注入容器：显式接线减少协调和技术债。CPU 1.05×，每个进程 5 MB，生态较小。',
    },
    servant: {
      name: 'Servant',
      blurb:
        'API 类型就是契约：路由、客户端和文档都由它推导，团队协调更少、偏移更少。CPU 1.0×，每个进程 2 MB，但有类型层面的学习曲线。',
    },
    ihp: {
      name: 'IHP',
      blurb:
        '开箱即用：代码生成、类型安全查询构建器和内置任务队列。CPU 1.3×，每个进程 40 MB，功能交付快，但基于 Nix 工具链。',
    },
    laravel: {
      name: 'Laravel',
      blurb:
        '功能交付快，后台工作少花 20% 的开发工时。CPU 1.8×（worker 模式下 1.1×），Eloquent 一次读取会发出 3 条查询。',
    },
    rails: {
      name: 'Rails',
      blurb: '功能上线快，页面访问收入增加 20%。CPU 消耗为 1.5 倍，并有 N+1 查询。',
    },
    express: { name: 'Express', blurb: '精简且无处不在。CPU 1.1×，中间件泛滥让技术债增长快 10%。' },
    django: {
      name: 'Django',
      blurb: '功能交付快，借助管理站点，内部工具少花 30% 的开发工时。CPU 1.4×，并有 N+1 查询。',
    },
    symfony: {
      name: 'Symfony',
      blurb: '结构严谨：协调成本少 30%，技术债增长慢 30%。CPU 1.5×，没有 N+1 查询。',
    },
    sinatra: { name: 'Sinatra', blurb: '轻量。CPU 消耗为 1.1 倍。' },
    flask: { name: 'Flask', blurb: '轻量。CPU 消耗为 1.1 倍。' },
    gin: { name: 'Gin', blurb: '轻量路由器。CPU 消耗为 1.05 倍。' },
    'spring-boot': {
      name: 'Spring Boot',
      blurb: '为大团队提供结构：协调成本少 30%。CPU 1.3×，多 200 MB，启动多 15 秒。',
    },
    aspnet: { name: 'ASP.NET Core', blurb: '快速且功能齐全。CPU 消耗为 1.05 倍。' },
    phoenix: { name: 'Phoenix', blurb: 'LiveView 页面收入增加 30%。CPU 消耗为 1.1 倍。' },
    axum: { name: 'Axum', blurb: '基于 Tokio 和 Tower。不增加 CPU 消耗。' },
    actix: { name: 'Actix Web', blurb: '基准测试中速度名列前茅。CPU 消耗为 0.95 倍。' },
    fastapi: {
      name: 'FastAPI',
      blurb:
        '使用 Pydantic 校验，并拥有最好的模型胶水生态：`ai` 请求多赚 15%。CPU 1.15×，且仅限 ASGI 服务器。10 MB。',
    },
    fastify: {
      name: 'Fastify',
      blurb: '基于模式的序列化：读取少用 20% 的 CPU。自身没有开销。5 MB。',
    },
    nextjs: {
      name: 'Next.js',
      blurb:
        '服务端渲染和增量静态再生：页面多赚 50%，CPU 为 1.6×，CDN 可应答其中 40%。每个进程 30 MB。',
    },
    nestjs: {
      name: 'NestJS',
      blurb: '为大团队提供结构：协调成本少 30%。CPU 1.3×，每个进程 20 MB。',
    },
    fiber: {
      name: 'Fiber',
      blurb: '基于 fasthttp 的 Express 风格 API：没有 CPU 开销，不支持 HTTP/2。每个进程 5 MB。',
    },
    quarkus: {
      name: 'Quarkus',
      blurb: '为原生镜像而生：GraalVM 构建时间减半。CPU 1.1×，每个进程 100 MB。',
    },
    hono: {
      name: 'Hono',
      blurb: '基于 Web 标准的小型路由：没有 CPU 开销。每个进程 2 MB。',
    },
    elysia: {
      name: 'Elysia',
      blurb:
        '为 Bun 而生，类型从服务端检查到客户端：技术债增长慢 15%。没有 CPU 开销。每个进程 5 MB。',
    },
    koa: {
      name: 'Koa',
      blurb: 'Express 的继任者，基于 async 函数：CPU 1.05×。每个进程 5 MB。',
    },
    adonis: {
      name: 'AdonisJS',
      blurb:
        'Laravel 的理念搬到 Node.js：功能交付快。CPU 1.4×，每个进程 25 MB，Lucid ORM 会产生 N+1 查询。',
    },
    codeigniter: {
      name: 'CodeIgniter',
      blurb: '不碍事的小型 PHP 框架：CPU 1.1×。每个进程 4 MB。',
    },
    sanic: {
      name: 'Sanic',
      blurb: '从底层起就是异步：CPU 1.05×。每个进程 10 MB。',
    },
    rocket: {
      name: 'Rocket',
      blurb: '类型安全的路由，样板代码少：Rust 中写起来最快。CPU 1.05×。每个进程 3 MB。',
    },
  },
  glossary: {
    annotation: {
      term: '注解',
    },
    anycast: {
      term: '任播',
    },
    apdex: {
      term: 'Apdex',
    },
    'async-io': {
      term: '异步 I/O',
    },
    'at-least-once-delivery': {
      term: '至少一次投递',
    },
    autoscaling: {
      term: '自动扩缩容',
    },
    'availability-zone': {
      term: '可用区',
    },
    backpressure: {
      term: '背压',
    },
    bcrypt: {
      term: 'Bcrypt',
    },
    'binary-rpc': {
      term: '二进制 RPC',
    },
    'bgp-border-gateway-protocol': {
      term: 'BGP（边界网关协议）',
    },
    'blast-radius': {
      term: '影响范围',
    },
    'blue-green-deployment': {
      term: '蓝绿部署',
    },
    'bot-management': {
      term: '机器人管理',
    },
    'brookss-law': {
      term: '布鲁克斯定律',
    },
    bulkhead: {
      term: '舱壁隔离',
    },
    'burn-rate': {
      term: '消耗速率',
    },
    'bytecode-cache': {
      term: '字节码缓存',
    },
    'cache-hit-rate': {
      term: '缓存命中率',
    },
    'cache-stampede': {
      term: '缓存击穿',
    },
    'cache-warming': {
      term: '缓存预热',
    },
    'cache-aside': {
      term: '旁路缓存',
    },
    'canary-deployment': {
      term: '金丝雀部署',
    },
    'cascading-failure': {
      term: '级联故障',
    },
    'cdc-change-data-capture': {
      term: 'CDC（变更数据捕获）',
    },
    'cdn-content-delivery-network': {
      term: 'CDN（内容分发网络）',
    },
    'chaos-engineering': {
      term: '混沌工程',
    },
    'circuit-breaker': {
      term: '熔断器',
    },
    'code-review': {
      term: '代码审查',
    },
    'cold-start': {
      term: '冷启动',
    },
    compression: {
      term: '压缩',
    },
    'connection-pooling': {
      term: '连接池技术',
    },
    'consistent-hashing': {
      term: '一致性哈希',
    },
    'container-orchestration': {
      term: '容器编排',
    },
    'continuous-batching': {
      term: '连续批处理',
    },
    'continuous-delivery': {
      term: '持续交付',
    },
    'conways-law': {
      term: '康威定律',
    },
    'credential-stuffing': {
      term: '撞库攻击',
    },
    'data-residency': {
      term: '数据驻留',
    },
    'ddos-distributed-denial-of-service': {
      term: 'DDoS（分布式拒绝服务）',
    },
    'dead-letter-queue': {
      term: '死信队列',
    },
    denormalization: {
      term: '反规范化',
    },
    'dependency-scanning': {
      term: '依赖扫描',
    },
    'distributed-tracing': {
      term: '分布式追踪',
    },
    'diurnal-traffic': {
      term: '昼夜流量变化',
    },
    'dns-round-robin': {
      term: 'DNS 轮询',
    },
    'dora-metrics': {
      term: 'DORA 指标',
    },
    downsampling: {
      term: '降采样',
    },
    drift: {
      term: '漂移',
    },
    egress: {
      term: '出站流量',
    },
    'edge-side-includes': {
      term: '边缘端包含',
    },
    'encryption-at-rest': {
      term: '静态数据加密',
    },
    'error-budget': {
      term: '错误预算',
    },
    'event-loop': {
      term: '事件循环',
    },
    'eventual-consistency': {
      term: '最终一致性',
    },
    'expand-and-contract': {
      term: '扩展与收缩',
    },
    'fallacies-of-distributed-computing': {
      term: '分布式计算谬误',
    },
    'fan-out': {
      term: '扇出',
    },
    'fan-out-on-write': {
      term: '写时扇出',
    },
    'feature-flag': {
      term: '功能开关',
    },
    'four-golden-signals': {
      term: '四大黄金信号',
    },
    'gc-pause': {
      term: '垃圾回收停顿',
    },
    geodns: {
      term: 'GeoDNS',
    },
    'gil-global-interpreter-lock': {
      term: 'GIL（全局解释器锁）',
    },
    gitops: {
      term: 'GitOps',
    },
    'graceful-degradation': {
      term: '优雅降级',
    },
    'green-threads': {
      term: '绿色线程',
    },
    'health-check': {
      term: '健康检查',
    },
    'hedged-request': {
      term: '对冲请求',
    },
    'hot-key': {
      term: '热点键',
    },
    'http-keep-alive': {
      term: 'HTTP 持久连接',
    },
    'http2-and-http3': {
      term: 'HTTP/2 与 HTTP/3',
    },
    'iac-tool': {
      term: 'IaC 工具',
    },
    idempotency: {
      term: '幂等性',
    },
    'inverted-index': {
      term: '倒排索引',
    },
    'jit-warmup': {
      term: 'JIT 预热',
    },
    'leaderless-replication': {
      term: '无主复制',
    },
    'leap-smearing': {
      term: '闰秒平滑',
    },
    'littles-law': {
      term: '利特尔定律',
    },
    'load-balancer': {
      term: '负载均衡器',
    },
    'load-shedding': {
      term: '负载卸载',
    },
    'memory-leak': {
      term: '内存泄漏',
    },
    'materialized-view': {
      term: '物化视图',
    },
    'metastable-failure': {
      term: '亚稳态故障',
    },
    mirror: {
      term: '镜像',
    },
    'model-inference': {
      term: '模型推理',
    },
    'mttd-and-mtta': {
      term: 'MTTD 与 MTTA',
    },
    mttr: {
      term: 'MTTR',
    },
    'n1-query': {
      term: 'N+1 查询',
    },
    'network-partition': {
      term: '网络分区',
    },
    'node-drain': {
      term: '节点排空',
    },
    'object-storage': {
      term: '对象存储',
    },
    observability: {
      term: '可观测性',
    },
    'oltp-and-olap': {
      term: 'OLTP 与 OLAP',
    },
    'on-call': {
      term: '值班',
    },
    'operating-margin': {
      term: '营业利润率',
    },
    'percentile-p50-p95-p99': {
      term: '百分位数（p50、p95、p99）',
    },
    'point-in-time-recovery': {
      term: '时间点恢复',
    },
    'power-of-two-choices': {
      term: '随机二选一',
    },
    'pre-fork-worker-model': {
      term: '预派生工作进程模型',
    },
    'process-per-request': {
      term: '每请求独占进程',
    },
    quantization: {
      term: '量化',
    },
    quorum: {
      term: 'Quorum',
    },
    raft: {
      term: 'Raft',
    },
    'rate-limiting': {
      term: '限流',
    },
    'read-replica': {
      term: '只读副本',
    },
    'read-your-writes-consistency': {
      term: '读己之写一致性',
    },
    'red-method': {
      term: 'RED 方法',
    },
    'redos-regular-expression-denial-of-service': {
      term: 'ReDoS（正则表达式拒绝服务）',
    },
    'replication-lag': {
      term: '复制滞后',
    },
    'retry-with-backoff-and-jitter': {
      term: '带退避和抖动的重试',
    },
    'rpo-and-rto': {
      term: 'RPO 与 RTO',
    },
    'rule-of-40': {
      term: '40 法则',
    },
    runbook: {
      term: '运行手册',
    },
    service: {
      term: '服务',
    },
    sharding: {
      term: '分片',
    },
    'shared-nothing': {
      term: '无共享架构',
    },
    'slo-sla-sli': {
      term: 'SLO、SLA、SLI',
    },
    'soc-2': {
      term: 'SOC 2',
    },
    'spot-instance': {
      term: '竞价实例',
    },
    'strangler-pattern': {
      term: '绞杀者模式',
    },
    'synchronous-replication': {
      term: '同步复制',
    },
    'tail-at-scale': {
      term: '大规模系统的尾延迟',
    },
    'tech-debt': {
      term: '技术债',
    },
    'thread-pool': {
      term: '线程池',
    },
    'thundering-herd': {
      term: '惊群',
    },
    'tiered-caching': {
      term: '分层缓存',
    },
    timeout: {
      term: '超时',
    },
    'tls-certificate': {
      term: 'TLS 证书',
    },
    'token-bucket': {
      term: '令牌桶',
    },
    'transactional-outbox': {
      term: '事务发件箱',
    },
    'use-method': {
      term: 'USE 方法',
    },
    utilization: {
      term: '利用率',
    },
    'vertical-and-horizontal-scaling': {
      term: '纵向与横向扩容',
    },
    'waf-web-application-firewall': {
      term: 'WAF（Web 应用防火墙）',
    },
    'write-through-cache': {
      term: '直写缓存',
    },
  },
  gpuModels: {
    small: { name: '小型（3B）' },
    medium: { name: '中型（7B）' },
    large: { name: '大型（34B）' },
  },
  incidents: {
    spike: {
      name: '流量突增',
      cause: '一家大型新闻网站链接到了你的网站，需求增至三倍。',
      prevention: '预留容量、缓存、更多应用服务器。',
    },
    instance: {
      name: '实例故障',
      cause: '虚拟机所在的宿主机宕机了。',
      prevention: '在负载均衡器后部署第二个副本，它会跳过宕机主机。',
    },
    connections: {
      name: '连接耗尽',
      cause: '一次部署让所有连接池的大小翻倍，Postgres 拒绝了超额连接。',
      prevention: '使用连接池组件，或缩小各个连接池。',
    },
    loop: {
      name: '事件循环阻塞',
      cause: '密码哈希的计算成本从 10 轮增至 12 轮：每次登录的 CPU 开销变为 4 倍。',
      prevention: '使用 libuv 线程池、认证服务商，或不受单个事件循环限制的运行时。',
    },
    leak: {
      name: '内存泄漏',
      cause: '一个常驻进程不断泄漏内存，直到被内核终止。',
      prevention: '重启服务，或使用 PHP：它会在每次请求后释放全部资源。',
    },
    'slow-query': {
      name: '慢查询',
      cause: '新功能带来了一条没有索引的查询，每次读取都会扫描整张表。',
      prevention: '查询分析能找出缺失的索引，缓存能让大多数读取不必访问表。',
    },
    'bad-deploy': {
      name: '部署出错',
      cause: '一次部署引入了错误，发送到应用服务器的请求纷纷失败。',
      prevention: '可回滚的发布流水线、自动化测试，以及更小规模的部署。',
    },
    'bot-surge': {
      name: '机器人流量激增',
      cause: '爬虫发现了网站，一半流量变成了机器人。',
      prevention: '在应用服务器前部署 WAF。',
    },
    stuffing: {
      name: '撞库攻击',
      cause: '机器人用泄露的密码撞库：登录量增至 20 倍，每次都要计算 bcrypt 哈希。',
      prevention: 'WAF 拦下大多数机器人，剩余的哈希计算交给认证服务商。',
    },
    stampede: {
      name: '缓存击穿',
      cause: '缓存重启后空空如也，所有未命中请求同时涌向数据库。',
      prevention: '缓存击穿防护合并未命中请求；缓存预热在流量到来前重新填充缓存。',
    },
    poison: {
      name: '毒消息',
      cause: '一个总会失败的任务不断回来。工作进程忙着重试它，顾不上处理队列。',
      prevention: '死信队列将失败的任务移到一旁。',
    },
    ddos: {
      name: 'DDoS',
      cause: '攻击者用正常流量 50 倍的请求淹没了边缘节点。',
      prevention: '部署 WAF，并在攻击开始时开启受攻击模式。CDN 承接可缓存的流量。',
    },
    'cluster-upgrade': {
      name: '强制集群升级',
      cause:
        '云服务商将一个不再受支持的 Kubernetes 集群升级了。使用已移除 API 的 Pod 陷入了崩溃重启循环。',
      prevention: '每季度至少升级一次集群，或让平台团队负责保持版本更新。',
    },
    certificate: {
      name: '证书过期',
      cause: 'TLS 证书过期了，所有浏览器都拒绝访问网站。',
      prevention: '证书自动化会在过期前续期。',
    },
    'psp-outage': {
      name: '支付服务中断',
      cause: '支付服务商宕机了，所有结账都失败了。',
      prevention: '你这边无计可施：故障在对方。对方恢复后，结账也会恢复。',
    },
    zone: {
      name: '可用区故障',
      cause: '整个可用区发生故障，其中的所有节点都变成了灰色。',
      prevention: '在第二个可用区部署副本并预留容量，再为数据库配置备用实例。',
    },
    'disk-full': {
      name: '磁盘已满',
      cause: '日志和 WAL 填满了数据库磁盘，所有写入都失败了。',
      prevention: '磁盘告警能及早发现问题，扩容存储卷即可解决。',
    },
    'repl-lag': {
      name: '复制滞后',
      cause: '一阵写入高峰让副本落后了几秒，写入后的读取返回了旧数据。',
      prevention: '读己之写路由会将这些读取发送到主库。',
    },
    'latency-regression': {
      name: '延迟回退',
      cause: '一次部署给每个请求多加了一个同步调用：每个响应都慢了 150 毫秒。',
      prevention: '在请求路径上做百分位与追踪，并用金丝雀监控 p99。',
    },
    'gc-storm': {
      name: '垃圾回收停顿风暴',
      cause: '堆内存使用率超过 90%，垃圾回收器让十分之一的请求暂停。',
      prevention: '增加内存、使用 ZGC 或调整 GOGC。重启即可结束本次故障。',
    },
    'retry-storm': {
      name: '重试风暴',
      cause: '数据库变慢了 20 秒，调用方同时重试，重试让数据库持续过载。',
      prevention: '带随机抖动的退避、熔断器和负载丢弃。',
    },
    'deadline-day': {
      name: '截止日',
      cause: '合同截止日到来：所有机构同时提交工作，需求是平时的 3 倍。',
      prevention: '预留容量、降载，并为截止日的工作加一个队列。',
    },
    'double-charge': {
      name: '重复扣款',
      cause: '支付服务商变慢，扣款超时后被重试，部分用户被扣了两次款。',
      prevention: '使用幂等键。关闭扣款连线上的重试即可结束本次故障。',
    },
    'report-db': {
      name: '报表压垮数据库',
      cause: '季度末报表扫描了主库的所有表，所有请求类型都变慢了。',
      prevention: '数据仓库将扫描任务从主库分离出去。',
    },
    'gpu-shortage': {
      name: 'GPU 短缺',
      cause: '服务商回收了一台 GPU 节点，本月没有可用的 H100 容量。',
      prevention: 'GPU 不足时，LLM API 可以接手提示词请求。',
    },
    regex: {
      name: '正则回溯',
      cause: '一条新 WAF 规则在长输入上发生回溯，所有 WAF 的 CPU 占用都达到 100%。',
      prevention: '先在金丝雀实例上试运行规则，禁用该规则即可结束本次故障。',
    },
    region: {
      name: '区域故障',
      cause: '整个地域发生故障，它的画布变成了灰色。',
      prevention: '开放第二个地域，用 GeoDNS 将用户导向那里，并让两个地域都持有数据。',
    },
    partition: {
      name: '网络分区',
      cause: '地域间失去联系，跨地域调用超时，依赖主节点的写入出现了分歧。',
      prevention: '共识存储确保只有一个主节点。隔离旧主节点即可结束本次故障。',
    },
    'hot-key': {
      name: '热点键',
      cause: '一位名人发了帖。30% 的读取都在请求同一个键，所在分片不堪重负。',
      prevention: '将热点键拆分到多个分片，并在应用服务器中缓存它们。',
    },
    config: {
      name: '错误配置推送',
      cause:
        '一次配置变更同时到达了所有应用服务器和 Worker，它们一起崩溃。GitOps 一次性同步还把它带到了每个镜像。',
      prevention: '回滚即可结束。GitOps 分阶段同步会先把变更限制在一个区域。',
    },
    bgp: {
      name: 'BGP 配置错误',
      cause: '一次路由变更让整家公司从互联网消失，所有地域都无法访问。',
      prevention: '审查路由变更。回滚即可结束本次故障。',
    },
    audit: {
      name: '审计问题',
      cause: 'SOC 2 审计员发现了缺项，灾难恢复演练的成绩不再有效。',
      prevention: '安全团队会修复审计发现的问题，避免它们导致成绩重置。',
    },
    'dr-drill': {
      name: '灾难恢复演练',
      cause: '按脚本让主地域发生故障，以衡量恢复能力。',
      prevention: '在一小时内从另一个地域处理所有请求类型，且不丢失写入。',
    },
    breach: {
      name: '数据泄露',
      cause: '一个已披露的漏洞超过截止日期仍未修补，随后遭到了利用。',
      prevention: '在工单到期前完成修补。团队待办队列会显示截止日期。',
    },
    'credential-leak': {
      name: '凭据泄露',
      cause: '一个钓鱼页面骗走了公司凭据，一个陌生人使用了它们。',
      prevention: '看域名，不要看标志。把邮件举报为钓鱼邮件，它就不再有按钮。',
    },
    'spot-reclaim': {
      name: '竞价回收',
      cause: '云厂商需要收回容量。它在 10 秒预警后回收了一个竞价节点。',
      prevention: '混合实例池、优雅关闭，以及负载均衡器后的按需副本。',
    },
    'stale-read': {
      name: '陈旧读取',
      cause: '缓存返回了超过 TTL 的值：写密集的表超过了失效速度，同一行的读取返回了旧值。',
      prevention: '缩短 TTL、使用写穿透缓存，或采用写后读路由。',
    },
    reconnect: {
      name: '重连风暴',
      cause: '实时中心重启。所有客户端在同一秒重连。',
      prevention: '重连抖动可以分散洪峰，集群则让它拥有多台机器。',
    },
    'runaway-bill': {
      name: '失控账单',
      cause: '自动扩缩容在没有流量高峰时达到上限，支出上升却没有额外收入。',
      prevention: '降低自动扩缩容上限，并逐行查看云账单。',
    },
    mtu: {
      name: 'MTU 不匹配',
      cause: '合作方网络使用更小的数据包尺寸。大于其 MTU 的上传在途中超时。',
      prevention: '限制数据包大小，或让大文件上传留在同一网络。',
    },
    'hot-shard': {
      name: '大租户热点分片',
      cause:
        '最大租户的键落在了同一个分片上。它的读写消耗 3× 的 CPU，该分片上的其他一切都要排在它后面等待。',
      prevention: '按键对租户做分片，并把它的读取放在数据库前面的缓存中。',
    },
    'premiere-spike': {
      name: '首映高峰',
      cause: '一部首映上线了：视频需求是平时的 4×，全部集中在同一分钟。',
      prevention: 'CDN 分层缓存、预留容量和负载削减。',
    },
    'launch-day': {
      name: '上线日',
      cause: '游戏上线了：实时消息是平时的 6×，每个客户端同时连接。',
      prevention: '按峰值配置的实时枢纽、重连抖动和负载削减。',
    },
    'flash-sale': {
      name: '闪购',
      cause: '一场闪购：几分钟内结账量是平时的 20×。',
      prevention: '结账任务用队列、自动扩缩器和负载削减。',
    },
    'jvm-warmup': {
      name: '负载下的 JVM 预热',
      cause:
        '自动扩缩器在流量高峰期间添加了 Java 应用服务器，新副本冷启动运行：前 30 秒只有 30% 的速度。',
      prevention:
        '负载均衡器的慢启动、计划扩缩容，以及启动即热的 GraalVM 原生镜像。启用慢启动后，新副本会逐步接管流量，因此不会以冷状态应答。',
    },
    'migration-lock': {
      name: '数据库迁移锁',
      cause:
        '一次迁移对最大的表执行了 ALTER TABLE。它在复制表期间一直持有锁，每个写入都排在它后面，直到超时。',
      prevention: '在线表结构迁移可以在不持有锁的情况下修改大表。',
    },
    'supply-chain': {
      name: '供应链攻击',
      cause: '一个依赖发布了恶意版本，一次部署安装了它。该包在应用服务器中运行，并把数据外传。',
      prevention:
        '依赖扫描会在构建安装之前发现已发布的后门；Deno 权限会阻止软件包读取它不需要的内容。',
    },
    'accidental-delete': {
      name: '误删数据',
      cause: '一名运维人员删除了数据。一张表没了，所有需要它的查询都失败了。',
      prevention: '时间点恢复可以把表恢复到删除前一分钟。恢复演练证明备份可以恢复。',
    },
    'operator-typo': {
      name: '运维手误',
      cause: '一条本来只想移除一个节点的命令匹配到了整个组件，它的大部分节点也随之消失。',
      prevention: '变更生效前的计划和评审会显示它将删除什么，因此手误在计划阶段就被拦下。',
    },
    'table-bloat': {
      name: '表膨胀',
      cause:
        'PostgreSQL 会保留每个被更新行的旧版本,直到 VACUUM 清理。大量更新超过了清理速度,表里堆满死行:每次读写都消耗更多 CPU。',
      prevention: '保留窗口让表保持精简,而 MySQL 引擎没有需要清理的死行。',
    },
    'page-leak': {
      name: '缓存页面泄露',
      cause: 'CDN 用不含 Cookie 的键缓存了已登录页面,并把一个用户的页面发给了另一个用户。',
      prevention: '缓存键包含 Cookie,个人页面就不会被共享。',
    },
    'leap-second': {
      name: '闰秒或时钟偏移',
      cause:
        '一次闰秒让时钟重复了一秒。定时器触发了两次，租约提前过期，整个区域内的请求和锁都超时了。',
      prevention: '闰秒平滑把这一秒分摊到一整天，因此没有时钟会跳变。',
    },
    'stale-opcache': {
      name: 'OPcache 过期',
      cause:
        'OPcache 在关闭 validate_timestamps 的情况下运行，而一次部署没有将它重置。PHP 服务器继续用旧代码处理新的数据库结构，一部分请求失败。',
      prevention: 'CI/CD 流水线会在每次部署时重置 OPcache。重启可手动清空缓存。',
    },
    'bun-compat': {
      name: '运行时兼容性',
      cause:
        '一个在 Node.js 上能用的包在不够成熟的 Bun 上无法使用。触及它的一部分请求失败，直到该包被替换。',
      prevention: '自动化测试在服务发布所用的运行时上运行，在部署之前就能发现问题包。',
    },
    'gevent-compat': {
      name: '库不兼容',
      cause:
        'gevent 会对标准库打猴子补丁，而有一个库经不起这种改动：它的调用阻塞了 hub，一部分请求失败。',
      prevention: '自动化测试在发布前于 gevent 下运行服务，并指出是哪个库出错。',
    },
    'split-brain': {
      name: '脑裂',
      cause:
        '一次网络分区把一个分布式 Erlang 集群切成两半。每一半都继续为自己的客户端提供服务，一半的实时消息从未到达另一半。',
      prevention: '混沌实验能在分区发生之前发现问题。重启可让节点重新加入集群。',
    },
  },
  kinds: {
    page: { label: '页面浏览' },
    read: { label: 'API 读取' },
    write: { label: 'API 写入' },
    login: { label: '登录' },
    search: { label: '搜索' },
    upload: { label: '上传' },
    bot: { label: '机器人' },
    media: { label: '视频' },
    rt: { label: '实时' },
    buy: { label: '结账' },
    job: { label: '导出' },
    report: { label: '报表' },
    ai: { label: 'AI 提示' },
    'q-read': { label: '读取查询' },
    'q-write': { label: '写入查询' },
    auth: { label: '认证调用' },
    'q-search': { label: '搜索查询' },
    'blob-put': { label: '对象上传' },
    task: { label: '任务' },
    'blob-get': { label: '对象获取' },
    'q-tx': { label: '事务' },
    charge: { label: '扣款' },
    'q-scan': { label: '扫描' },
    infer: { label: '推理' },
    feed: { label: '信息流' },
    hook: { label: 'Webhook' },
    push: { label: '通知' },
    bid: { label: '竞价请求' },
    notify: { label: '推送消息' },
    callout: { label: '客户调用' },
    'k-write': { label: '时间线写入' },
  },
  lbPolicies: {
    weighted: { label: '加权' },
    'round-robin': { label: '轮询' },
    'least-conn': { label: '最少连接' },
    p2c: { label: '二选一' },
    hash: { label: '一致性哈希' },
  },
  logAcks: {
    '0': { name: '不确认' },
    '1': { name: '分区首领' },
    all: { name: '全部副本' },
  },
  mutators: {
    'chaos-monkey': { name: '混沌猴', rule: '从种子轮起，实例故障成为主要故障类型' },
    'hn-front-page': { name: '登上 Hacker News 首页', rule: '流量突增频率变为三倍' },
    'legacy-monolith': {
      name: '遗留单体应用',
      rule: '庞大的 PHP 代码库：迁移成本 ×3，初始技术债为 40%',
    },
    'one-region': { name: '永远单区域', rule: '禁止在主区域以外放置节点' },
    'no-caches': { name: '禁用缓存', rule: '禁用缓存和 CDN' },
    'tight-budget': { name: '预算紧张', rule: '融资金额减半' },
    'single-language': { name: '单一语言', rule: '所有应用服务器都运行 PHP' },
    postgres: { name: '一切交给 Postgres', rule: '禁用缓存、宽列存储、共识存储和数据仓库' },
    'strict-slo': { name: '严格 SLO', rule: 'SLO 要求提高一级' },
    'shared-tenancy': { name: '共享租户', rule: '吵闹的邻居会抢占每个实例的 CPU' },
  },
  perks: {
    'angel-network': { name: '天使投资人网络', effect: '初始现金 ×2' },
    'alumni-network': { name: '前同事网络', effect: '天使轮增加 1 位工程师' },
    'institutional-knowledge': { name: '组织知识', effect: '退出后保留 1 项研究' },
    'pattern-recognition': { name: '模式识别', effect: '洞察 +20%' },
    'founders-reputation': { name: '创始人声誉', effect: '用户增长 +10%' },
    'better-terms': { name: '更好的融资条款', effect: '每轮融资的股权稀释减少 2 个百分点' },
    'night-shift': { name: '夜班', effect: '开发工时 +10%' },
    'time-dilation': { name: '时间膨胀', effect: '依次解锁 20 倍、40 倍速度' },
    playbooks: { name: '运维手册', effect: '运维手册栏位数为 2、5、10、25' },
    'war-stories': { name: '实战经验', effect: '未完成行动项对故障概率的增幅减半' },
    'head-start': { name: '领先起步', effect: '依次从天使轮、种子轮、A 轮起步' },
    autopilot: { name: '自动驾驶', effect: '策略：排入最便宜的研究、招聘、让应用服务器保持低负载' },
  },
  pmModes: {
    static: { label: '静态' },
    dynamic: { label: '动态' },
    ondemand: { label: '按需' },
  },
  policies: {
    'move-fast': { label: '快速推进' },
    balanced: { label: '均衡' },
    quality: { label: '质量优先' },
  },
  pools: {
    page: { label: '页面浏览' },
    read: { label: 'API 读取' },
    write: { label: 'API 写入' },
    login: { label: '登录' },
    search: { label: '搜索' },
    upload: { label: '上传' },
    bot: { label: '机器人' },
    media: { label: '视频' },
    rt: { label: '实时' },
    buy: { label: '结账' },
    job: { label: '导出' },
    report: { label: '报表' },
    ai: { label: 'AI 提示' },
    feed: { label: '信息流' },
    hook: { label: 'Webhook' },
    push: { label: '通知' },
    bid: { label: '竞价请求' },
    failure: { label: '失败' },
  },
  pricings: {
    'on-demand': { name: '按需', blurb: '全价。可随时移除节点。' },
    reserved: {
      name: '预留',
      blurb: '0.6×，承诺期为一个日历周。在期满前出售，仍需支付支出。',
    },
    spot: { name: '竞价', blurb: '0.3×。云服务商可以在提前 10 秒通知后回收该节点。' },
  },
  regionInfo: {
    na: { name: '北美', short: '北美' },
    eu: { name: '欧洲', short: '欧洲' },
    apac: { name: '亚太', short: '亚太' },
    sa: { name: '南美', short: '南美' },
  },
  research: {
    stripe: { blurb: '支付节点自动收款。', name: 'Stripe Billing' },
    'dns-rr': { blurb: '解锁 DNS，将用户分配到最多 8 台主机。', name: 'DNS 轮询' },
    'load-balancing': { blurb: '解锁负载均衡器，按容量分流并跳过故障主机。', name: '负载均衡' },
    'health-checks': { blurb: 'DNS 不再将用户发送到故障主机。', name: '健康检查' },
    'auth-provider': { blurb: '解锁身份认证服务，登录不再占用你的 CPU。', name: '托管身份认证' },
    caching: { blurb: '解锁 Redis，大多数读取查询不再抵达数据库。', name: '缓存技术' },
    pooling: { blurb: '解锁 PgBouncer，应用连接共用少量数据库连接。', name: '连接池技术' },
    replication: { blurb: '解锁只读副本。', name: '只读副本' },
    'eager-loading': {
      blurb: '修复 N+1 查询：ORM 框架每次只发 1 条读取查询，而非 3 条。',
      name: '预先加载',
    },
    'query-analysis': {
      blurb: 'EXPLAIN 定位缺少索引的查询。可在数据库卡片上添加索引。',
      name: '查询分析',
    },
    logs: {
      blurb: '按原因分类错误：滞留、丢弃、拒绝、宕机、旧数据与内存耗尽。',
      name: '结构化日志',
    },
    metrics: { blurb: '显示每个节点的历史图表。', name: '指标' },
    percentiles: { blurb: '在均值旁显示 p50、p95 和 p99，看清均值掩盖的问题。', name: '百分位数' },
    alerting: { blurb: '错误率、p99 或饱和度超过阈值时，显示告警条。', name: '告警' },
    funnels: { blurb: '定位并修复注册流失环节：用户增长 +10%。', name: '漏斗分析' },
    'php-fpm': { blurb: '使用工作进程池替代 Apache 进程，池大小由你设置。', name: 'PHP-FPM' },
    opcache: { blurb: 'PHP 不再为每次请求编译脚本：CPU 处理速度提升至 2.5 倍。', name: 'OPcache' },
    'lang-ruby': {
      blurb:
        '每个核心一个进程，每个进程 5 个线程。线程可交叠等待；GVL 将 CPU 执行限制在单个核心上。',
      name: 'Ruby',
    },
    'lang-node': {
      blurb: '单个事件循环。等待没有额外开销，但只使用一个核心，一个慢请求就会拖住所有其他请求。',
      name: 'Node.js',
    },
    'lang-python': {
      blurb: '一组同步工作进程，每个处理一个请求。类似 PHP-FPM，但每个工作进程消耗更多内存。',
      name: 'Python',
    },
    'node-cluster': {
      blurb: '每个核心一个事件循环。用上所有核心，内存和连接数也随核心数增加。',
      name: 'Node.js 集群模式',
    },
    'libuv-pool': { blurb: '将密码哈希移出事件循环，登录不再阻塞其他请求。', name: 'libuv 线程池' },
    'fw-laravel': {
      blurb:
        '功能交付快，后台工作少花 20% 的开发工时。CPU 1.8×（worker 模式下 1.1×），Eloquent 一次读取会发出 3 条查询。',
      name: 'Laravel',
    },
    'fw-rails': {
      blurb: '功能上线快，页面访问收入增加 20%。CPU 消耗为 1.5 倍，并有 N+1 查询。',
      name: 'Rails',
    },
    'fw-express': {
      blurb: '精简且无处不在。CPU 1.1×，中间件泛滥让技术债增长快 10%。',
      name: 'Express',
    },
    'fw-django': {
      blurb: '功能交付快，借助管理站点，内部工具少花 30% 的开发工时。CPU 1.4×，并有 N+1 查询。',
      name: 'Django',
    },
    'fw-symfony': {
      blurb: '结构严谨：协调成本少 30%，技术债增长慢 30%。CPU 1.5×，没有 N+1 查询。',
      name: 'Symfony',
    },
    'fw-sinatra': { blurb: '轻量。CPU 消耗为 1.1 倍。', name: 'Sinatra' },
    'fw-flask': { blurb: '轻量。CPU 消耗为 1.1 倍。', name: 'Flask' },
    keepalive: { blurb: 'Keep-alive：内部调用跳过 TCP 握手，每次仅需 1 毫秒。', name: '连接复用' },
    gzip: { blurb: 'Gzip：页面和读取响应缩小 70%，CPU 消耗增加 10%。', name: '压缩' },
    timeouts: { blurb: '将调用超时设为 1、5 或 30 秒，并重试失败的调用。', name: '超时与重试' },
    'lb-algorithms': { blurb: '最少连接与随机二选一算法。', name: '负载均衡算法' },
    ci: {
      blurb: '流水线将部署从 30 分钟缩短到 5 分钟，并能回滚错误部署。包含 Recreate 与 Rolling。',
      name: '持续交付',
    },
    'blue-green': {
      blurb: '蓝绿部署：新版本在旧版本旁启动，错误部署最多影响 10% 的请求。',
      name: '蓝绿部署',
    },
    canary: {
      blurb: '金丝雀部署：5% 的流量先接触新版本。影响面最小，部署最慢。',
      name: '金丝雀部署',
    },
    'code-review': { blurb: '发布前显示功能的隐藏成本，错误部署概率降低 20%。', name: '代码审查' },
    'testing-culture': {
      blurb: '流水线在每次部署前运行测试，错误部署概率降低 30%。',
      name: '自动化测试',
    },
    'full-text-search': { blurb: '解锁搜索引擎，Postgres 不再处理搜索。', name: '全文搜索' },
    'object-storage': { blurb: '解锁对象存储，上传文件不再写入 Postgres。', name: '对象存储' },
    'cache-strategies': {
      blurb: '穿透读、穿透写和异步写：由缓存负责加载和写入。',
      name: '缓存策略',
    },
    'lifecycle-rules': { blurb: '旧对象会自动迁移到更便宜的存储类别。', name: '存储生命周期规则' },
    retention: { blurb: '数据库归档或删除旧行：存储更便宜，报表更慢。', name: '保留策略' },
    cdn: { blurb: '解锁 CDN：边缘响应页面，出站流量更便宜。', name: '内容分发' },
    waf: { blurb: '解锁 WAF：拦截机器人，但也会误拦部分真实用户。', name: 'Web 应用防火墙' },
    'api-gateway': { blurb: '解锁 API 网关：一个为所有 API 调用限流的总入口。', name: 'API 网关' },
    websockets: { blurb: '解锁实时中枢：维持实时消息所需的打开连接。', name: 'WebSockets' },
    'background-jobs': { blurb: '解锁工作进程，让代码在请求路径之外运行。', name: '后台任务' },
    queues: { blurb: '解锁队列，应用服务器将慢任务交给工作进程。', name: '消息队列' },
    'stampede-protection': {
      blurb: '冷缓存合并未命中请求，防止填充缓存时压垮数据库。',
      name: '缓存击穿防护',
    },
    'cache-warming': { blurb: '缓存重启后保留大部分热数据。', name: '缓存预热' },
    'lang-go': {
      blurb:
        'Goroutine 分布于所有核心。等待只需几 KB 内存，不占用工作进程。堆满时，GC 会消耗 CPU。',
      name: 'Go',
    },
    'lang-java': {
      blurb:
        '一个 JVM，200 个线程在所有核心上运行。启动时只有 30% 的速度，需预热 30 秒。每个等待中的请求占用一个线程。',
      name: 'Java',
    },
    'lang-csharp': {
      blurb: '.NET 在所有核心上异步运行。等待不占用线程，JIT 预热比 JVM 更短。',
      name: 'C#',
    },
    'fw-gin': { blurb: '轻量路由器。CPU 消耗为 1.05 倍。', name: 'Gin' },
    'fw-spring-boot': {
      blurb: '为大团队提供结构：协调成本少 30%。CPU 1.3×，多 200 MB，启动多 15 秒。',
      name: 'Spring Boot',
    },
    'fw-aspnet': { blurb: '快速且功能齐全。CPU 消耗为 1.05 倍。', name: 'ASP.NET Core' },
    tracing: { blurb: '逐节点显示每种请求的耗时，并标出各类请求最慢的一跳。', name: '分布式追踪' },
    'trace-search': { blurb: '研究速度提升 25%。', name: '调用链搜索' },
    notebooks: { blurb: '研究速度提升 25%。', name: '笔记本' },
    'cert-automation': { blurb: '证书在过期前自动续期。', name: '证书自动化' },
    'lang-elixir': {
      blurb: '抢占式进程分布于所有核心。请求之间互不阻塞，每个进程单独回收垃圾。CPU 运算较慢。',
      name: 'Elixir',
    },
    'lang-rust': {
      blurb: '异步任务分布于所有核心，无 GC，内存开销小。CPU 密集任务会阻塞一个工作线程。',
      name: 'Rust',
    },
    'lang-zig': {
      blurb:
        '使用显式分配器的原生代码，无 GC。64 线程服务器使用所有核心，但每个等待中的请求占用一个线程。持久状态仍可能泄漏内存。',
      name: 'Zig',
    },
    'lang-haskell': {
      blurb:
        'Warp 在多个核心上运行轻量 GHC 线程。专家开发效率高，但编译和招聘较慢。I/O 等待不占用系统线程；共享堆 GC 会带来暂停和 CPU 开销。',
      name: 'Haskell',
    },
    'fw-phoenix': { blurb: 'LiveView 页面收入增加 30%。CPU 消耗为 1.1 倍。', name: 'Phoenix' },
    checkout: { blurb: '解锁支付服务与结账功能。', name: '结账' },
    'tiered-caching': {
      blurb: 'CDN 边缘节点先访问区域缓存，再回源：92% 的视频由边缘提供。',
      name: '分层缓存',
    },
    'multi-az': {
      blurb: '在三个可用区中放置节点，并为数据节点设置跨区备用节点。',
      name: '多可用区',
    },
    autoscaling: {
      blurb: '解锁自动扩缩容器，根据负载调整应用服务器或工作进程副本数。',
      name: '自动扩缩容',
    },
    containers: { blurb: '解锁 Kubernetes 集群：支出减少 15%，扩容耗时 30 秒。', name: '容器编排' },
    serverless: {
      blurb: '解锁无服务器函数：按请求运行你的代码，无需为机器付费。',
      name: '无服务器',
    },
    'reserved-instances': { blurb: '预留定价：承诺一个日历周，0.6×。', name: '预留实例' },
    'spot-instances': { blurb: '竞价定价：0.3×，直到云厂商收回该节点。', name: '竞价实例' },
    'slo-dashboards': { blurb: '在顶部仪表盘显示错误预算。', name: 'SLO 仪表盘' },
    'error-budgets': {
      blurb: '预算充足时团队提速 10%；预算耗尽时暂停新功能，开发速度减半。',
      name: '错误预算',
    },
    'backoff-jitter': {
      blurb: '重试等待并分散执行，额外调用不超过 10% 的预算。',
      name: '带抖动的退避',
    },
    'circuit-breakers': {
      blurb: '连线一半的调用失败时，暂停调用 5 秒，然后重试。',
      name: '熔断器',
    },
    'load-shedding': {
      blurb: '应用服务器饱和时，优先丢弃价值最低的请求类型。',
      name: '按优先级卸载负载',
    },
    'idempotency-keys': { blurb: '重试扣款不会重复收费。', name: '幂等键' },
    'ryw-routing': { blurb: '应用服务器可将写入之后的读取发送到主节点。', name: '读己之写路由' },
    'gogc-tuning': {
      blurb: 'GOGC 可设为 50、100 或 200：在内存占用与垃圾回收 CPU 消耗之间取舍。',
      name: 'Go 垃圾回收调优',
    },
    'fw-axum': { blurb: '基于 Tokio 和 Tower。不增加 CPU 消耗。', name: 'Axum' },
    'fw-actix': { blurb: '基准测试中速度名列前茅。CPU 消耗为 0.95 倍。', name: 'Actix Web' },
    zgc: {
      blurb: 'Java 停顿从 30 毫秒降至 1 毫秒，代价是吞吐量降低 10%、内存增加 15%。',
      name: 'ZGC',
    },
    'data-warehouse': { blurb: '解锁数据仓库，报表不再扫描主数据库。', name: '数据仓库技术' },
    'event-streaming': { blurb: '解锁事件流：保留消息的日志，消费者可以重放。', name: '事件流' },
    embeddings: {
      blurb: '解锁向量索引。AI 回答会用到你自己的文档，Python 也能保住加成。',
      name: '向量嵌入',
    },
    'hosted-models': { blurb: '解锁大模型 API：无需 GPU，按 token 付费。', name: '托管模型' },
    'model-serving': {
      blurb: '解锁 GPU 节点：持续忙碌时，AI 推理每 token 成本更低。',
      name: '模型推理服务',
    },
    pitr: {
      blurb: '数据库备份：每夜快照，或通过 WAL 归档将恢复点目标缩短至几分钟。',
      name: '时间点恢复',
    },
    'tls-everywhere': { blurb: '加密所有内部连线。SOC 2 必需。', name: '全链路 TLS' },
    http2: { blurb: '一条连接承载多个请求：页面访问的用户侧延迟减少 15%。', name: 'HTTP/2' },
    'sync-replication': { blurb: '写入等待副本确认。共识机制必需。', name: '同步复制' },
    'restore-drills': { blurb: '测试备份，确保关键时刻能够恢复。', name: '恢复演练' },
    'dependency-scanning': {
      blurb: '每次构建检查依赖库的已知漏洞。SOC 2 必需。',
      name: '依赖扫描',
    },
    sharding: { blurb: '按键将数据分布到多个节点。', name: '分片' },
    'encryption-at-rest': { blurb: '加密磁盘和备份。SOC 2 必需。', name: '静态数据加密' },
    'multi-region': { blurb: '在另一个大洲开设区域，每个区域对应一个标签页。', name: '多区域' },
    'geo-dns': { blurb: '用户访问本地区域，或最近的正常区域。', name: 'GeoDNS' },
    'infra-as-code': {
      blurb: '选择一个 IaC 工具。把一个区域镜像到另一个区域，并应用计划保持同步。',
      name: '基础设施即代码',
    },
    gitops: { blurb: '镜像自动同步，一次性或分阶段。', name: 'GitOps' },
    anycast: { blurb: '所有地区的用户侧延迟减少 20 毫秒。', name: '任播' },
    'document-db': {
      blurb: '解锁文档数据库：不用改表结构，但也没有连接查询。',
      name: '文档数据库',
    },
    'edge-compute': { blurb: '解锁边缘函数：在用户身边运行的小型处理程序。', name: '边缘计算' },
    http3: { blurb: '远端用户的用户侧延迟减少 20%。', name: 'HTTP/3' },
    notifications: { blurb: '解锁推送服务。', name: '通知' },
    'hybrid-fanout': { blurb: '普通账号用推送，大账号用拉取。缓存拆分热点键。', name: '混合扇出' },
    leaderless: { blurb: '解锁宽列存储，可调整读写法定人数。', name: '无主复制' },
    consensus: { blurb: '解锁分布式 SQL。', name: '共识数据库' },
    'dr-drills': { blurb: '执行上市清单要求的灾难恢复演练。', name: '灾难恢复演练' },
    soc2: { blurb: '上市清单项目。', name: 'SOC 2 合规计划' },
    'gdpr-residency': { blurb: '上市清单项目：欧盟用户由欧盟区域提供服务。', name: '数据驻留控制' },
    'security-team': {
      blurb: '上市清单项目。审计问题会在造成进度重置前得到修复。',
      name: '安全团队',
    },
    'investor-relations': { blurb: '估值倍数 +2。', name: '投资者关系' },
    'guidance-modeling': { blurb: '显示超过各档业绩指引的概率。', name: '业绩指引建模' },
    'php-jit': {
      blurb: 'PHP 8 JIT：Web 类请求 1.05× CPU，CPU 密集型请求 1.6×。对页面和读取几乎没有帮助。',
      name: 'PHP JIT',
    },
    'worker-threads': {
      blurb: '一个包含 4 个工作线程（40 MB）的线程池，把 CPU 密集的请求类型移出事件循环。',
      name: 'Node.js 工作线程',
    },
    yjit: { blurb: 'Ruby 的 JIT：CPU 工作 1.3×，内存多 20%。', name: 'YJIT' },
    gevent: {
      blurb:
        '绿色线程让每个进程可同时等待大量 I/O，因此慢数据库不再占住 worker。猴子补丁可能让某个库出错。每个连接 30 KB。',
      name: 'gevent',
    },
    asgi: {
      blurb:
        '像 Node.js 一样异步，但 CPU 更慢：阻塞调用会卡住循环。按设计的每个连接 30 KB 保持实时连接。',
      name: 'ASGI 配 Uvicorn',
    },
    'php-worker-mode': {
      blurb:
        'FrankenPHP、RoadRunner 或 Octane：应用只启动一次，框架的每请求开销随之消失。失去“无共享”，内存泄漏与状态串扰重新可能出现。',
      name: 'PHP worker 模式',
    },
    swoole: {
      blurb:
        '事件循环上的协程，像 Node.js 一样异步 I/O，每个请求没有框架开销。阻塞扩展会卡住循环。可承载实时连接，每个 20 KB。',
      name: 'Swoole',
    },
    bun: {
      blurb:
        '更快的事件循环，启动即时，因此比 Node.js 更适合自动扩缩和部署。60 MB，无启动时间。不够成熟：在 Node.js 上能用的包可能在它上面出错。',
      name: 'Bun',
    },
    deno: {
      blurb:
        '权限机制挡住大多数供应链攻击，代价是功能开发慢 10%：兼容的软件包更少。事件循环与 Node.js 相同。',
      name: 'Deno',
    },
    falcon: {
      blurb: '纤程让每个进程可持有大量空闲连接。阻塞的 gem 会卡住循环。每个连接 100 KB。',
      name: 'Falcon',
    },
    pypy: {
      blurb:
        '纯 Python 的 CPU 性能是 Gunicorn 的三倍，需要 JIT 预热。对 C 扩展支持差，因此没有 ML 生态加成。每个 worker 200 MB。',
      name: 'PyPy',
    },
    'virtual-threads': {
      blurb:
        '等待不再占住平台线程，慢数据库只增加延迟。原生 (JNI) 调用仍会钉住载体线程，JVM 仍要预热 30 秒。实时连接每个 10 KB。',
      name: 'Java 虚拟线程',
    },
    webflux: {
      blurb:
        '每个进程一个循环即可实现极高并发，但构建和调试慢 20%。阻塞调用会卡住循环，JVM 仍需预热。400 MB。',
      name: 'Spring WebFlux',
    },
    fasthttp: {
      blurb:
        '比 net/http 快四分之一，代价是功能开发慢 10%：API 非标准，部分中间件不可用，也没有 HTTP/2。',
      name: 'fasthttp',
    },
    'spawn-blocking': {
      blurb: 'CPU 密集型请求移到阻塞线程池，因此 Tokio 任务不再卡住工作线程。',
      name: 'Tokio 阻塞池',
    },
    'graal-native': {
      blurb:
        '启动时间不到 100 毫秒，无需预热，内存为 JVM 的 60%，速度为其 0.80×，构建时间为三倍。每个连接一个线程，与 Tomcat 相同。非常适合无服务器函数。',
      name: 'GraalVM 原生镜像',
    },
    'native-aot': {
      blurb:
        '没有 JIT，因此一启动就是全速，而且更小：100 MB。速度为 0.90×，大量使用反射的库需要开发工时。',
      name: '.NET Native AOT',
    },
    'distributed-erlang': {
      blurb: 'BEAM 实时枢纽依靠自带的内置发布/订阅组成集群，不需要单独的骨干。分区可能导致脑裂。',
      name: '分布式 Erlang',
    },
    nifs: {
      blurb:
        '原生代码让 Elixir 的 CPU 密集型请求快 3×。NIF 不会被抢占，其中一次崩溃会拖垮整个虚拟机。',
      name: 'NIF',
    },
    jemalloc: {
      blurb: '长期运行的 Rust 服务内存碎片更少：1.05× CPU，启动时内存多 5%。',
      name: 'jemalloc',
    },
    'free-threading': {
      blurb:
        '每个核心上都是真正的并行线程，每线程慢 10%，每个连接一个线程并不便宜。尚未就绪的 C 扩展会花费开发工时。8 个线程，每个连接 100 KB。',
      name: '自由线程 Python',
    },
    'fw-fastapi': {
      blurb:
        '使用 Pydantic 校验，并拥有最好的模型胶水生态：`ai` 请求多赚 15%。CPU 1.15×，且仅限 ASGI 服务器。10 MB。',
      name: 'FastAPI',
    },
    'fw-fastify': {
      blurb: '基于模式的序列化：读取少用 20% 的 CPU。自身没有开销。5 MB。',
      name: 'Fastify',
    },
    'fw-nextjs': {
      blurb:
        '服务端渲染和增量静态再生：页面多赚 50%，CPU 为 1.6×，CDN 可应答其中 40%。每个进程 30 MB。',
      name: 'Next.js',
    },
    'fw-nestjs': {
      blurb: '为大团队提供结构：协调成本少 30%。CPU 1.3×，每个进程 20 MB。',
      name: 'NestJS',
    },
    'fw-fiber': {
      blurb: '基于 fasthttp 的 Express 风格 API：没有 CPU 开销，不支持 HTTP/2。每个进程 5 MB。',
      name: 'Fiber',
    },
    'fw-quarkus': {
      blurb: '为原生镜像而生：GraalVM 构建时间减半。CPU 1.1×，每个进程 100 MB。',
      name: 'Quarkus',
    },
    'fw-hono': {
      blurb: '基于 Web 标准的小型路由：没有 CPU 开销。每个进程 2 MB。',
      name: 'Hono',
    },
    'fw-elysia': {
      blurb:
        '为 Bun 而生，类型从服务端检查到客户端：技术债增长慢 15%。没有 CPU 开销。每个进程 5 MB。',
      name: 'Elysia',
    },
    'fw-koa': {
      blurb: 'Express 的继任者，基于 async 函数：CPU 1.05×。每个进程 5 MB。',
      name: 'Koa',
    },
    'fw-adonis': {
      blurb:
        'Laravel 的理念搬到 Node.js：功能交付快。CPU 1.4×，每个进程 25 MB，Lucid ORM 会产生 N+1 查询。',
      name: 'AdonisJS',
    },
    'fw-codeigniter': {
      blurb: '不碍事的小型 PHP 框架：CPU 1.1×。每个进程 4 MB。',
      name: 'CodeIgniter',
    },
    'fw-sanic': {
      blurb: '从底层起就是异步：CPU 1.05×。每个进程 10 MB。',
      name: 'Sanic',
    },
    'fw-rocket': {
      blurb: '类型安全的路由，样板代码少：Rust 中写起来最快。CPU 1.05×。每个进程 3 MB。',
      name: 'Rocket',
    },
    'fw-jetzig': {
      blurb:
        '文件路由、模板、数据库查询和后台任务一应俱全：功能交付快。CPU 1.3×，每个进程 25 MB，工具链较年轻。',
      name: 'Jetzig',
    },
    'fw-tokamak': {
      blurb:
        '基于 http.zig 的依赖注入容器：显式接线减少协调和技术债。CPU 1.05×，每个进程 5 MB，生态较小。',
      name: 'Tokamak',
    },
    'fw-servant': {
      blurb:
        'API 类型就是契约：路由、客户端和文档都由它推导，团队协调更少、偏移更少。CPU 1.0×，每个进程 2 MB，但有类型层面的学习曲线。',
      name: 'Servant',
    },
    'fw-ihp': {
      blurb:
        '开箱即用：代码生成、类型安全查询构建器和内置任务队列。CPU 1.3×，每个进程 40 MB，功能交付快，但基于 Nix 工具链。',
      name: 'IHP',
    },
    'build-cache': {
      blurb: '共享构建产物和依赖缓存：每个 Stack 的构建快 25%。',
      name: '构建缓存',
    },
    'dev-environment': {
      blurb: '一个容器固定所有编译器和工具：新员工用一半的上手时间达到全速。',
      name: '可复现开发环境',
    },
    'static-analysis': {
      blurb: '每次变更在发布前都经过 linter 和类型检查：坏部署减少 20%。',
      name: '静态分析',
    },
    'formal-verification': {
      blurb:
        '证明和基于属性的测试能抓住测试遗漏的 bug：坏部署减少 50%，但每个功能的开发工时增加 15%。',
      name: '形式化验证',
    },
    cdc: { blurb: '解锁 CDC 连接器：副本跟随写入日志，无需第二次写入。', name: '变更数据捕获' },
    'service-boundaries': {
      blurb: '拆分服务：一个拥有自己的团队、自己的部署和自己的爆炸半径的新代码库。',
      name: '服务边界',
    },
    'service-mesh': { blurb: '解锁服务网格：每条链路上的重试、熔断与指标。', name: '服务网格' },
    'feature-flags': {
      blurb: '解锁功能开关：功能只触达一部分用户，糟糕的部署也如此。',
      name: '功能开关',
    },
    'secrets-management': { blurb: '密钥存放在保险库中，钓鱼页面无物可偷。', name: '密钥管理' },
    'spam-filter': {
      blurb: '为收件箱添加过滤器，把垃圾邮件归入专属文件夹，偶尔也会误放真邮件。',
      name: '垃圾邮件过滤',
    },
    'on-call': { blurb: '值班人员接听呼叫，所以事故在几分钟内得到确认。', name: '值班轮换' },
    runbooks: { blurb: '为团队处理过的事故类型编写手册：此后它会自行解决。', name: '操作手册' },
    'sre-team': {
      blurb: '解锁 SRE 团队：MTTR 降低 40%，未关闭的行动项权重减半。',
      name: 'SRE 团队',
    },
    'enterprise-sales': {
      blurb: '签订 SLA：某一周的可用性未达标，就要向客户返还赔偿金。',
      name: '企业销售',
    },
    'online-migrations': {
      blurb: '在不持有锁的情况下修改大表，因此迁移期间写入仍然畅通。',
      name: '在线表结构迁移',
    },
    'leap-smearing': {
      blurb: '把一个闰秒分摊到全天，因此没有时钟跳变，也没有租约提前过期。',
      name: '闰秒平滑',
    },
    'ab-testing': {
      blurb: '用功能开关留下的对照用户衡量功能增益，并给出置信区间。',
      name: 'A/B 测试',
    },
    'hiring-pipeline': {
      blurb: '招聘人员维护人才管道，因此每次招聘少花 30% 的日历时间。',
      name: '招聘管道',
    },
    'trunk-based': {
      blurb: '小改动每天多次合入同一分支，因此团队交付频率提高 50%。',
      name: '主干开发',
    },
    'platform-team': {
      blurb: '解锁平台团队：它负责集群与流水线，并将部署时间减半。',
      name: '平台团队',
    },
    'data-team': {
      blurb: '解锁数据团队：报表与 AI 功能成本降低 30%，管道的延迟减半。',
      name: '数据团队',
    },
    'l4-lb': {
      blurb:
        '负载均衡器直接转发 TCP 而不解析 HTTP：吞吐量提升十倍，跳转耗时只有五分之一，价格更低，但无法按请求类型路由，也无法重试。',
      name: 'L4 负载均衡',
    },
    'rate-limiting': {
      blurb: '网关上的令牌桶：不超过桶容量的突发流量整体放行，长期平均值保持在限额。',
      name: '限流',
    },
    esi: {
      blurb: 'CDN 缓存登录页面的公共外壳，在边缘填充个人部分，因此页面浏览量命中率提高 20%。',
      name: '边缘端包含',
    },
    'bot-management': {
      blurb: 'WAF 对可疑客户端发起挑战而不是直接拦截：拦截的机器人一样多，被误伤的真人更少。',
      name: '机器人管理',
    },
    'scheduled-scaling': {
      blurb: '自动扩缩器在已知的每日高峰之前增加副本，高峰到来时副本已经预热。',
      name: '定时扩缩容',
    },
    'arm-instances': {
      blurb: '解锁 ARM 实例族：vCPU 和内存与通用型相同，价格为 0.8 倍。',
      name: 'ARM 实例',
    },
    quantization: {
      blurb: 'GPU 节点运行 INT8 或 INT4 权重：更快、更省内存，每个回答的价值降低 5% 或 15%。',
      name: '量化',
    },
    'continuous-batching': {
      blurb: 'GPU 节点随到随批处理提示，因此更大的批次提高吞吐量，却不增加首字延迟。',
      name: '连续批处理',
    },
    bulkheads: {
      blurb: '链路限制单个依赖最多占用调用者的多少槽位：慢依赖丢弃自己的调用，其余请求照常处理。',
      name: '隔舱',
    },
    'graceful-degradation': {
      blurb: '饱和的应用服务器先关闭最耗资源的功能类型：便宜的类型保持时延，昂贵的类型快速失败。',
      name: '优雅降级',
    },
    'hedged-requests': {
      blurb:
        '链路在 p95 之后为慢调用再发一份副本，取更快的回答：长尾下降，被调用方多收到 10% 的请求。',
      name: '对冲请求',
    },
    'chaos-engineering': {
      blurb: '定时实验让你的最弱节点失败几秒并点名它：实验带来故障洞察，也证明设计能够存活。',
      name: '混沌工程',
    },
    denormalization: {
      blurb: '数据库保留一份预连接副本：读取的 CPU 成本降低 30%，每次写入增加 20%。',
      name: '反规范化',
    },
    precompute: {
      blurb: '数据库用存储的视图回答报表：扫描 CPU 减半，数字的陈旧程度与刷新周期相同。',
      name: '物化视图',
    },
    'binary-rpc': {
      blurb: '服务用二进制而不是文本序列化调用：每次内部调用的序列化 CPU 减半。',
      name: '服务间二进制 RPC',
    },
    outbox: {
      blurb: '写入与其事件在同一事务中提交，再由中继发布：发布失败时副本不再分叉。',
      name: '事务发件箱',
    },
    'expand-contract': {
      blurb: '模式变更先加入新结构、回填数据，再删除旧结构：不加表锁，迁移永远不会阻塞写入。',
      name: '扩展与收缩',
    },
    profiling: {
      blurb: '指出限制每个节点的资源：CPU、工作进程、内存、连接数或磁盘。',
      name: '持续性能分析',
    },
    'tail-sampling': { blurb: '保留慢请求和失败的链路：故障洞察翻倍。', name: '尾部采样' },
    rum: { blurb: '来自用户一侧的延迟，按设备拆分：桌面、手机和平板。', name: '真实用户监控' },
    'anomaly-detection': {
      blurb: '预测明天的流量高峰，并在事故达到峰值前发出预警。',
      name: '异常检测',
    },
    'credential-protection': {
      blurb: '在撞库机器人流量到达登录接口之前拦截大部分。',
      name: '撞库防护',
    },
    'pen-testing': { blurb: '每个日历周揭示一次设计中最薄弱的事故类型。', name: '渗透测试' },
    rightsizing: {
      blurb: '标记高峰利用率低于 30% 的节点，方便找出配置过大的实例。',
      name: '容量优化报告',
    },
    'egress-optimization': {
      blurb: '按 R2 定价的对象存储变体：访问互联网不收出口流量费。',
      name: '出口流量优化',
    },
    'unit-economics': { blurb: '每种请求类型中，每次成功服务请求的成本。', name: '单位经济模型' },
    'cost-allocation': {
      blurb: '根据每个服务拥有的节点，按服务和团队计算成本。',
      name: '成本分摊',
    },
    'savings-plans': {
      blurb: '每个计算节点的消耗费用减免 20%，无论是否按需计费，且不需要逐节点承诺。',
      name: '节省计划',
    },
  },
  researchTracks: {
    infrastructure: { label: '基础设施' },
    data: { label: '数据' },
    reliability: { label: '可靠性' },
    observability: { label: '可观测性' },
    performance: { label: '性能' },
    runtimes: { label: '运行时' },
    frameworks: { label: '框架' },
    security: { label: '安全' },
    product: { label: '产品' },
    cost: { label: '成本' },
  },
  runtimes: {
    mod_php: {
      blurb:
        'Apache 为每个正在处理的请求启动一个进程，最多 150 个。每个进程都内嵌 PHP，因此内存很快就会耗尽。',
      name: 'Apache mod_php',
    },
    php_fpm: {
      blurb:
        'NGINX 后方固定数量的 PHP 工作进程。每个等待中的请求占用一个工作进程。请求间不共享状态：没有内存泄漏。',
      name: 'PHP-FPM',
    },
    php_worker: {
      blurb:
        'FrankenPHP、RoadRunner 或 Octane：应用只启动一次，框架的每请求开销随之消失。失去“无共享”，内存泄漏与状态串扰重新可能出现。',
      name: 'PHP worker 模式',
    },
    swoole: {
      blurb:
        '事件循环上的协程，像 Node.js 一样异步 I/O，每个请求没有框架开销。阻塞扩展会卡住循环。可承载实时连接，每个 20 KB。',
      name: 'Swoole',
    },
    puma: {
      blurb:
        '每个核心一个进程，每个进程 5 个线程。线程可交叠等待；GVL 将 CPU 执行限制在单个核心上。',
      name: 'Puma',
    },
    unicorn: {
      blurb:
        '每个槽位一个 Rails 进程：简单可靠，但吃内存。一个等待中的请求就占住整个进程，因此拒绝实时连接。',
      name: '独角兽',
    },
    falcon: {
      blurb: '纤程让每个进程可持有大量空闲连接。阻塞的 gem 会卡住循环。每个连接 100 KB。',
      name: 'Falcon',
    },
    node: {
      blurb: '单个事件循环。等待没有额外开销，但只使用一个核心，一个慢请求就会拖住所有其他请求。',
      name: 'Node.js',
    },
    node_cluster: {
      blurb: '每个核心一个事件循环。用上所有核心，内存和连接数也随核心数增加。',
      name: 'Node.js 集群',
    },
    bun: {
      blurb:
        '更快的事件循环，启动即时，因此比 Node.js 更适合自动扩缩和部署。60 MB，无启动时间。不够成熟：在 Node.js 上能用的包可能在它上面出错。',
      name: 'Bun',
    },
    deno: {
      blurb:
        '权限机制挡住大多数供应链攻击，代价是功能开发慢 10%：兼容的软件包更少。事件循环与 Node.js 相同。',
      name: 'Deno',
    },
    gunicorn: {
      blurb: '一组同步工作进程，每个处理一个请求。类似 PHP-FPM，但每个工作进程消耗更多内存。',
      name: 'Gunicorn',
    },
    gevent: {
      blurb:
        '绿色线程让每个进程可同时等待大量 I/O，因此慢数据库不再占住 worker。猴子补丁可能让某个库出错。每个连接 30 KB。',
      name: 'Gunicorn 配 gevent',
    },
    uvicorn: {
      blurb:
        '像 Node.js 一样异步，但 CPU 更慢：阻塞调用会卡住循环。按设计的每个连接 30 KB 保持实时连接。',
      name: 'Uvicorn ASGI',
    },
    python_ft: {
      blurb:
        '每个核心上都是真正的并行线程，每线程慢 10%，每个连接一个线程并不便宜。尚未就绪的 C 扩展会花费开发工时。8 个线程，每个连接 100 KB。',
      name: '自由线程 CPython',
    },
    pypy: {
      blurb:
        '纯 Python 的 CPU 性能是 Gunicorn 的三倍，需要 JIT 预热。对 C 扩展支持差，因此没有 ML 生态加成。每个 worker 200 MB。',
      name: 'PyPy',
    },
    go: {
      blurb:
        'Goroutine 分布于所有核心。等待只需几 KB 内存，不占用工作进程。堆满时，GC 会消耗 CPU。',
      name: 'Go net/http',
    },
    fasthttp: {
      blurb:
        '比 net/http 快四分之一，代价是功能开发慢 10%：API 非标准，部分中间件不可用，也没有 HTTP/2。',
      name: 'fasthttp',
    },
    tomcat: {
      blurb:
        '一个 JVM，200 个线程在所有核心上运行。启动时只有 30% 的速度，需预热 30 秒。每个等待中的请求占用一个线程。',
      name: 'Tomcat',
    },
    java_virtual: {
      blurb:
        '等待不再占住平台线程，慢数据库只增加延迟。原生 (JNI) 调用仍会钉住载体线程，JVM 仍要预热 30 秒。实时连接每个 10 KB。',
      name: 'Java 虚拟线程',
    },
    webflux: {
      blurb:
        '每个进程一个循环即可实现极高并发，但构建和调试慢 20%。阻塞调用会卡住循环，JVM 仍需预热。400 MB。',
      name: 'Spring WebFlux',
    },
    graal: {
      blurb:
        '启动时间不到 100 毫秒，无需预热，内存为 JVM 的 60%，速度为其 0.80×，构建时间为三倍。每个连接一个线程，与 Tomcat 相同。非常适合无服务器函数。',
      name: 'GraalVM 原生镜像',
    },
    kestrel: {
      blurb: '.NET 在所有核心上异步运行。等待不占用线程，JIT 预热比 JVM 更短。',
      name: 'Kestrel',
    },
    native_aot: {
      blurb:
        '没有 JIT，因此一启动就是全速，而且更小：100 MB。速度为 0.90×，大量使用反射的库需要开发工时。',
      name: 'Native AOT',
    },
    beam: {
      blurb: '抢占式进程分布于所有核心。请求之间互不阻塞，每个进程单独回收垃圾。CPU 运算较慢。',
      name: 'BEAM',
    },
    tokio: {
      blurb: '异步任务分布于所有核心，无 GC，内存开销小。CPU 密集任务会阻塞一个工作线程。',
      name: 'Tokio',
    },
    zig: {
      blurb:
        '使用显式分配器的原生代码，无 GC。64 线程服务器使用所有核心，但每个等待中的请求占用一个线程。持久状态仍可能泄漏内存。',
      name: 'Zig 多线程服务器',
    },
    warp: {
      blurb:
        'Warp 在多个核心上运行轻量 GHC 线程。专家开发效率高，但编译和招聘较慢。I/O 等待不占用系统线程；共享堆 GC 会带来暂停和 CPU 开销。',
      name: 'Haskell（GHC + Warp）',
    },
  },
  shardKeys: {
    hash: { name: '用户 ID 的哈希' },
    range: { name: 'ID 范围' },
    tenant: { name: '按租户' },
    region: { name: '按区域' },
  },
  storageClasses: {
    standard: { name: '标准' },
    infrequent: { name: '低频访问' },
    archive: { name: '归档' },
  },
  storageIops: {
    general: { name: '通用型' },
    provisioned: { name: '预置 IOPS' },
  },
  tasks: {
    'add-index': { name: '添加索引', effect: '结束一次慢查询故障，并为一种查询模式添加索引' },
    'eager-loading': { name: '预先加载', effect: 'ORM 框架不再发送 N+1 查询' },
    'fix-leak': { name: '修复内存泄漏', effect: '下一个功能上线前不会再发生内存泄漏' },
    'session-state': { name: '移除会话状态', effect: '事务级连接池不再导致查询出错' },
    refactor: { name: '重构', effect: '技术债 −20 个百分点' },
    'fix-bugs': { name: '修复迁移缺陷', effect: '新技术栈不再导致请求失败' },
    'upgrade-cluster': {
      name: '升级集群',
      effect: '所有 Kubernetes 集群连续一个季度都运行受支持的版本',
    },
    runbook: { name: '编写操作手册', effect: '一种事故类型会自行解决，无需玩家操作' },
    'idempotency-keys': { name: '幂等键', effect: '重试的结账不会重复扣款' },
    'off-loop': {
      name: '把 CPU 工作移出事件循环',
      effect: 'Node.js 与 Python 异步把耗 CPU 的请求类型交给工作线程',
    },
    'timeouts-retries': {
      name: '添加超时与重试',
      effect: '应用服务器或 Worker 发出的每条链路都获得 5 秒超时和退避重试',
    },
    'graceful-shutdown': {
      name: '优雅停机',
      effect: '部署和缩容会处理完进行中的请求，而不是让它们失败',
    },
    'health-check': { name: '健康检查端点', effect: '负载均衡器可以进行深度健康检查' },
    'load-test': { name: '压力测试', effect: '在一个日历日内显示每个节点在两倍需求下的情况' },
  },
  vecIndexes: {
    exact: { name: '精确' },
    hnsw: { name: 'HNSW' },
  },
  ventures: {
    'b2b-saas': { name: '企业 SaaS', summary: '晚间高峰' },
    'consumer-social': {
      name: '大众社交',
      summary: '用户翻倍，每人价值减半；媒体 +50%；病毒式流量高峰出现频率翻倍',
    },
    fintech: {
      name: '金融科技',
      summary: '工作时间；购买 ×4，写入 +50%；读到过期的资金数据会被罚款',
    },
    streaming: { name: '流媒体', summary: '深夜高峰；媒体 ×4；出口流量成本为三倍' },
    'game-backend': { name: '游戏后端', summary: '晚间高峰；实时流量 ×4' },
    'ai-startup': { name: 'AI 创业公司', summary: '需求平稳；AI 流量 ×3' },
    'e-commerce': { name: '电子商务', summary: '购买 ×2，搜索 ×2；每月定期促销' },
    'developer-platform': {
      name: '开发者平台',
      summary: '需求平稳但有突发；读取 ×2；C 轮起 Webhook ×3；不得使用朴素重试',
    },
    healthcare: { name: '医疗健康', summary: '工作时间高峰；写入 +50%；A 轮起数据留在主区域' },
    'ad-tech': { name: '广告科技', summary: '需求平稳且巨大；竞价 ×10；超过 100 毫秒的请求不赚钱' },
    government: {
      name: '政府合同',
      summary: '工作时间高峰与截止日峰值；只能用 Java 或 C#；部署需等待一天',
    },
    bootstrapped: { name: '自筹资金独立开发', summary: '无融资轮次；保留 100% 股权' },
  },
  guided: {
    'out-of-credits': {
      name: '积分耗尽',
      objectives: [
        { goal: '持续 90 秒处理所有请求。' },
        { goal: '需求增至 4 倍。持续 2 分钟将 Apdex 保持在 0.85 以上。' },
        { goal: '夜间流量降回初始水平。将 Apdex 保持在 0.85 以上，支出不超过 $0.12/秒。' },
      ],
    },
    'shared-box': {
      name: '共享主机',
      objectives: [
        { goal: '持续 90 秒将 Apdex 保持在 0.85 以上。' },
        { goal: '需求翻倍。将 Apdex 保持在 0.9 以上，支出不超过 $0.16/秒。' },
        { goal: '夜间流量降回初始水平。将 Apdex 保持在 0.9 以上，支出不超过 $0.11/秒。' },
      ],
    },
    'second-server': {
      name: '第二台服务器',
      objectives: [
        { goal: '持续 90 秒将 Apdex 保持在 0.9 以上。' },
        { goal: '一台服务器即将故障。持续 2 分钟将 Apdex 保持在 0.85 以上。' },
        { goal: '需求翻倍。再次发生故障时，仍将 Apdex 保持在 0.9 以上。' },
      ],
    },
    'connection-limit': {
      name: '连接上限',
      objectives: [
        { goal: '持续 90 秒处理所有请求。' },
        { goal: '需求翻倍。持续 2 分钟将 Apdex 保持在 0.9 以上。' },
        { goal: '一次部署会使所有连接池翻倍。将错误率控制在 1% 以下。' },
      ],
    },
    'event-loop-stall': {
      name: '事件循环停滞',
      objectives: [
        { goal: '持续 2 分钟将 p99 保持在 300 毫秒以下。' },
        { goal: '密码哈希耗时将增至 4 倍。持续 2 分钟将 p99 保持在 600 毫秒以下。' },
      ],
    },
    'read-mostly': {
      name: '读多写少',
      objectives: [
        { goal: '持续 90 秒将 Apdex 保持在 0.9 以上。' },
        { goal: '需求翻倍。将 Apdex 保持在 0.9 以上，支出不超过 $2.60/秒。' },
        { goal: '一个缺少索引的查询即将上线。随后持续 2 分钟将 Apdex 保持在 0.85 以上。' },
      ],
    },
    stampede: {
      name: '缓存击穿',
      objectives: [
        { goal: '持续 90 秒将 Apdex 保持在 0.9 以上。' },
        { goal: '缓存即将重启。持续 2 分钟将 Apdex 保持在 0.85 以上。' },
        {
          goal: '需求增加 50%。缓存再次重启。将 Apdex 保持在 0.85 以上，支出不超过 $8.00/秒。',
        },
      ],
    },
    'slow-uploads': {
      name: '缓慢的上传',
      objectives: [
        { goal: '持续 90 秒将 Apdex 保持在 0.9 以上。' },
        { goal: '需求增加了 60%。将 Apdex 保持在 0.9 以上，且支出不超过每秒 $6.00。' },
        { goal: '一个任务将持续失败。连续 2 分钟让队列保持在 500 个任务以内。' },
      ],
    },
    bots: {
      name: '机器人',
      objectives: [
        { goal: '持续 90 秒将 Apdex 保持在 0.9 以上。' },
        { goal: '爬虫即将涌入。持续 2 分钟将 Apdex 保持在 0.9 以上。' },
        { goal: '它们回来了。将 Apdex 保持在 0.9 以上，支出不超过 $10.80/秒。' },
      ],
    },
    'zone-outage': {
      name: '可用区故障',
      objectives: [
        { goal: '持续 90 秒将 Apdex 保持在 0.9 以上。' },
        { goal: '一个可用区即将故障。持续 2 分钟将 Apdex 保持在 0.85 以上。' },
        {
          goal: '需求增加 50%。可用区再次故障。将 Apdex 保持在 0.85 以上，支出不超过 $22.20/秒。',
        },
      ],
    },
    'cold-start': {
      name: '冷启动',
      objectives: [
        { goal: '持续 90 秒将 Apdex 保持在 0.9 以上。' },
        { goal: '4 倍的流量尖峰即将到来。持续 2 分钟将 Apdex 保持在 0.85 以上。' },
        { goal: '夜间流量。将 Apdex 保持在 0.9 以上，支出不超过 $17.40/秒。' },
      ],
    },
    'stale-checkout': {
      name: '结账读到旧数据',
      objectives: [
        { goal: '持续 90 秒将 Apdex 保持在 0.9 以上。' },
        { goal: '写入即将积压。持续 2 分钟保证每次结账正确。', watch: { label: '结账' } },
        { goal: '需求增加 50%，写入再次涌入。全程保证每次结账正确。', watch: { label: '结账' } },
      ],
    },
    'gc-pauses': {
      name: '垃圾回收停顿',
      objectives: [
        {
          goal: '持续 90 秒将 API 读取的 p99 保持在 110 毫秒以内。',
          watch: { label: '读取 p99' },
        },
        {
          goal: '堆即将被填满。持续 2 分钟将 API 读取的 p99 保持在 110 毫秒以内。',
          watch: { label: '读取 p99' },
        },
        {
          goal: '它再次被填满。将读取的 p99 保持在 110 毫秒以内，支出不超过 $93.20/秒。',
          watch: { label: '读取 p99' },
        },
      ],
    },
    'retry-storm': {
      name: '重试风暴',
      objectives: [
        { goal: '持续 90 秒将 Apdex 保持在 0.9 以上。' },
        { goal: '数据库将变慢 20 秒。将错误率降回 1% 以下并保持 2 分钟。' },
        { goal: '它再次变慢。将错误率降到 1% 以下并保持，支出不超过 $197.00/秒。' },
      ],
    },
    'analytics-primary': {
      name: '在主库上运行分析',
      objectives: [
        { goal: '持续 90 秒将 Apdex 保持在 0.9 以上。' },
        { goal: '季度末：一份报表将扫描所有表。持续 2 分钟将 Apdex 保持在 0.85 以上。' },
        { goal: '需求增加 50%。将 Apdex 保持在 0.9 以上，支出不超过 $254.00/秒。' },
      ],
    },
    'far-away': {
      name: '远方的用户',
      objectives: [
        { goal: '持续 2 分钟处理所有请求。' },
        {
          goal: '一半用户生活在北美以外。持续 2 分钟将 API 读取的平均耗时降到 140 毫秒以下。',
          watch: { label: '读取平均延迟' },
        },
      ],
    },
    'missed-write': {
      name: '遗漏的写入',
      objectives: [
        {
          goal: '每次 API 读取都必须看到最新写入。保持 2 分钟。',
          watch: { label: '最新数据读取' },
        },
        {
          goal: '一个副本即将故障。持续 2 分钟保证读取最新数据，错误率低于 1%。',
          watch: { label: '最新数据读取' },
        },
      ],
    },
    'hot-key': {
      name: '热点键',
      objectives: [
        { goal: '持续 2 分钟将 Apdex 保持在 0.9 以上。' },
        { goal: '一位大账号即将发帖。持续 2 分钟将 Apdex 保持在 0.85 以上。' },
      ],
    },
  },
  challenges: {
    'hello-world': {
      name: '你好，世界',
      brief: '用一台机器处理每秒 20 次请求，支出低于 $0.05/秒。',
      inspiredBy: '每个项目的首次部署',
    },
    'split-the-box': {
      name: '拆分主机',
      brief: '应用和数据库共用一台机器。在 p99 低于 300 ms 的情况下达到 100 rps。',
      inspiredBy: '大多数公司的第一步扩容',
    },
    slashdotted: {
      name: '流量爆棚',
      brief: '固定预算下，应对持续 3 分钟的 10 倍流量。',
      inspiredBy: 'Slashdot 效应',
    },
    c10k: {
      name: 'C10k',
      brief: '10,000 个并发连接。每个请求独占一个进程的服务器会拒绝接入。',
      inspiredBy: 'Dan Kegel 提出的 C10k 问题（1999）',
    },
    'event-loop': {
      name: '事件循环',
      brief: '仅限 Node.js，登录占比 5%，p99 低于 300 毫秒。',
      inspiredBy: 'Node.js：“别阻塞事件循环”',
    },
    'too-many-connections': {
      name: '连接过多',
      brief: '40 台应用服务器，一个 Postgres。不允许拒绝连接。',
      inspiredBy: 'PostgreSQL 连接数限制',
    },
    shoestring: {
      name: '穷酸版 Stack Overflow',
      brief: '使用不超过 12 个节点，处理 800 rps。',
      inspiredBy: 'Stack Overflow 用少量服务器承载巨大流量',
    },
    'n-plus-one': {
      name: 'N+1 问题',
      brief: '存在 N+1 查询的 Rails 应用。修复需要 12 个开发工时。',
      inspiredBy: 'ORM 延迟加载',
    },
    'thirteen-engineers': {
      name: '十三位工程师',
      brief: 'Rails 应用承受 400 rps。13 位工程师只有一天时间：104 个开发工时。',
      inspiredBy: 'Facebook 收购 Instagram 时，它只有 13 名员工（2012）',
    },
    'credential-stuffing': {
      name: '撞库攻击',
      brief: '机器人用泄露的密码尝试登录。确保真实用户仍能登录。',
      inspiredBy: '针对登录端点的常见攻击',
    },
    'black-friday': {
      name: '黑色星期五',
      brief: '第 5 分钟起的 5 分钟内需求翻三倍。尽量少花钱。',
      inspiredBy: '零售业的高峰日',
    },
    'us-east-1': {
      name: 'us-east-1',
      brief: '第 5 分钟时一个可用区宕机。保持 99.9% 的请求成功。',
      inspiredBy: 'AWS us-east-1 的多次故障',
    },
    'exactly-once': {
      name: '恰好一次',
      brief: '支付服务商两次变慢，每次响应需要 2 秒。每笔结账只扣款一次。',
      inspiredBy: '支付幂等性',
    },
    'two-million-sockets': {
      name: '两百万个套接字',
      brief: '两百万个聊天长连接。以最低成本维持它们。',
      inspiredBy: 'Phoenix 在单台服务器上达到 200 万个 WebSocket 连接（2015）',
    },
    'pokemon-go': {
      name: 'Pokémon GO',
      brief: '上线首日：需求在 10 分钟内达到预测值的 50 倍。',
      inspiredBy: 'Pokémon GO 上线时的流量达到计划目标的约 50 倍（2016）',
    },
    'healthcare-launch': {
      name: '医疗网站上线日',
      brief: '第 2 分钟上线，这套设计有不少问题。把它们找出来。',
      inspiredBy: 'healthcare.gov 上线（2013）',
    },
    'thundering-herd': {
      name: '惊群',
      brief: '聊天服务器在第 2 分钟重启。24 万个客户端同时重连并登录。',
      inspiredBy: '重连风暴',
    },
    'read-states': {
      name: '已读状态',
      brief: '堆内存两次填满。使用任意运行时，将 p99 保持在 90 ms 以下。',
      inspiredBy: 'Discord 把一个服务从 Go 迁移到 Rust，以消除 GC 尖峰（2020）',
    },
    'fail-whale': {
      name: '故障鲸',
      brief: '将信息流请求的 p99 保持在 200 ms 以下。有些账号拥有 1,000 万粉丝。',
      inspiredBy: 'Twitter 的时间线扩展难题',
    },
    'reports-at-noon': {
      name: '正午报表',
      brief: '财务在第 2 和第 5 分钟于主库运行报表，且不允许取消。保持结账流畅。',
      inspiredBy: '在事务型数据库上运行分析查询',
    },
    'gpu-economics': {
      name: 'GPU 经济学',
      brief: '响应每一条 AI 提示，并保留 15% 的收入作为利润。',
      inspiredBy: '自托管推理与托管 API 的对比',
    },
    metastable: {
      name: '亚稳态',
      brief: '重试风暴正在肆虐。以最少改动恢复服务。',
      inspiredBy: 'Metastable failures in distributed systems',
    },
    'regex-of-doom': {
      name: '致命正则',
      brief: '第 2 分钟，一条新 WAF 规则让所有 WAF 的 CPU 占用达到 100%。恢复服务。',
      inspiredBy: 'Cloudflare 故障，2019 年 7 月 2 日',
    },
    'forty-three-seconds': {
      name: '43 秒',
      brief: '地域间的连接在第 2 分钟断开。保持只有一个主节点。',
      inspiredBy: 'GitHub 网络分区，2018 年 10 月 21 日',
    },
    'follow-the-sun': {
      name: '追逐太阳',
      brief: '在一天内应对四个区域各自的晚高峰，将开支控制在每秒 $700 以下。',
      inspiredBy: '全球每日高峰',
    },
    celebrity: {
      name: '名人效应',
      brief: '第 2 分钟时一位名人发帖。30% 的读取请求访问同一个键。',
      inspiredBy: '来自爆红账号的热点键',
    },
    'gone-from-the-internet': {
      name: '从互联网消失',
      brief: '第 2 分钟的一次路由变更让所有地域与互联网断开。恢复连通。',
      inspiredBy: 'Facebook 故障，2021 年 10 月 4 日',
    },
    'the-typo': {
      name: '一字之差',
      brief: '第 2 分钟，一条本应删除单台服务器的命令删除了整个搜索层。',
      inspiredBy: 'Amazon S3 故障，2017 年 2 月 28 日',
    },
    'leap-second': {
      name: '闰秒',
      brief:
        '第 2 分钟，亚太地域的时钟重复了一秒，当地所有应用服务器的 CPU 占用飙至 100%。将 p99 保持在 380 ms 以下。',
      inspiredBy: '2012 年的闰秒',
    },
    'rule-of-40': {
      name: '40 法则',
      brief: '本次运行中用户增长 25%。达到增长率与利润率之和为 40 的目标：保持 15% 的利润率。',
      inspiredBy: 'SaaS 的 40 法则',
    },
    'postgres-for-everything': {
      name: '一切交给 Postgres',
      brief: '仅用 Postgres 存储数据，处理所有请求类型，且 p99 低于 800 ms。',
      inspiredBy: '“用 Postgres 就够了”的主张',
    },
    'five-nines': {
      name: '五个九',
      brief: '四周内：两台服务器和一个地域发生故障，流量有一次增至三倍。成功处理 99.999% 的请求。',
      inspiredBy: '99.999% 的可用性目标',
    },
  },
}
