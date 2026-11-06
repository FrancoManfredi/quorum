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
    histogram: { name: '直方图', condition: '在任意挑战的任意评分维度达到第 90 百分位' },
    pareto: { name: '帕累托', condition: '在同一个挑战的三个评分维度均达到第 70 百分位' },
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
  },
  glossary: {
    annotation: {
      term: '注解',
      definition:
        '时间序列图上用于标记部署、配置变更或故障等事件的标记，让图中变化的原因清晰可见。',
      inGame:
        '仪表盘的每张时间序列图都会用带标签的竖线标出五类事件：架构变更（蓝色，每次仍可撤销的变更各一条）、部署（紫色）、故障（红色）、研究（绿色）和公司事件（粉色）。变量栏中每组都有一个开关可将其隐藏。用这些线确认曲线是在修复后才发生变化，而不是修复前。',
      links: [{ label: 'Grafana 文档：为可视化图表添加注释' }],
      design: [{ label: '仪表盘标注' }],
    },
    anycast: {
      term: '任播',
      definition:
        '一种路由方式：不同地点的多台服务器宣告同一个 IP 地址。互联网路由（BGP）将用户引导至其中最近的一台，让用户连接附近的服务器，也让洪泛流量分散到所有服务器。',
      inGame:
        'Anycast 会让每个区域的用户跳数减少 20 毫秒。它是 C 轮研究，需要先研究 GeoDNS。GeoDNS 会把每个区域的用户送到自己的区域，或最近的仍可用的区域。',
      links: [
        { label: 'Cloudflare 学习中心：什么是 Anycast？' },
        { label: 'RFC 4786：Anycast 服务的运行' },
        { label: '维基百科' },
      ],
      design: [],
    },
    apdex: {
      term: 'Apdex',
      definition:
        '应用性能指数：衡量用户对响应时间满意度的 0 至 1 分数。耗时低于目标 T 的请求视为满意，计满分；耗时不超过 4T 的请求视为可容忍，计半分；更慢或失败的请求计零分。',
      inGame:
        '每种请求都有自己的 T：页面浏览为 400 ms，API 读取为 200 ms，登录为 800 ms。每个请求的收益等于其价值乘以 Apdex，因此可容忍的请求只能赚取一半。Apdex 高于当前阶段的目标时，用户会增长；低于目标时，用户会流失。目标从车库创业阶段的 0.85 逐步提高到上市后的 0.94。',
      links: [
        { label: '维基百科' },
        { label: 'New Relic 文档：Apdex' },
        { label: 'Apdex 用户组织' },
      ],
      design: [{ label: 'Apdex 与收入' }],
    },
    'async-io': {
      term: '异步 I/O',
      definition:
        '发起网络或磁盘操作后，在其完成前先做其他工作，而不是阻塞线程等待。这样，一个线程就能同时处理许多尚未完成的请求。Node.js、.NET async 和 Rust 的 Tokio 都以此为基础。',
      inGame:
        'Node.js、Kestrel（C#）和 Tokio（Rust）在请求等待数据库时不占用工作槽位，因此慢查询不会耗尽它们的处理容量。而 PHP-FPM 或 Gunicorn 的工作进程会在整个等待期间一直被占用。异步运行时还能以每条连接几 KB 的开销维持实时连接（Tokio 为 5 KB，Node.js 为 20 KB），PHP 和 Gunicorn 则会拒绝这些连接。',
      links: [
        { label: 'Node.js：阻塞与非阻塞' },
        { label: 'Python 文档：asyncio' },
        { label: '维基百科' },
      ],
      design: [{ label: '并发模型' }],
    },
    'at-least-once-delivery': {
      term: '至少一次投递',
      definition:
        '一种投递保证：系统不断重发消息或调用，直到收到确认。消息不会丢失，但部分消息会到达多次，因此消费者必须具备幂等性。',
      inGame:
        '重试的调用可能到达两次。在“重复扣款”故障中，扣款超时后会重试，部分客户会被重复收费，直到你研究幂等键或关闭扣款链路的重试。在“毒消息”故障中，一项总是失败的任务不断重新出现，工作进程将 90% 的时间浪费在它身上。开启队列的死信队列可以预防，删除该消息则能结束故障。',
      links: [
        { label: 'AWS 文档：SQS 至少一次投递' },
        { label: 'RabbitMQ：消费者确认' },
        { label: 'RabbitMQ：可靠性指南' },
      ],
      design: [{ label: '投递语义' }],
    },
    autoscaling: {
      term: '自动扩缩容',
      definition:
        '自动增减机器，让容量随需求变化。控制器监测 CPU 使用率等信号，将其与目标比较，再调整副本数。新增容量需要启动时间，因此自动扩缩容擅长应对负载的缓慢变化，却难以应付突然的峰值。',
      inGame:
        '自动扩缩器（自动扩缩容研究）管理接入它的应用服务器和工作进程。当节点超过目标（CPU 或整体负载的 40%、60%、80%）时，它请求更多副本，最多 4、8、16 个或不设上限。新副本在虚拟机上 180 秒后就绪，在 Kubernetes 集群中 30 秒，且从冷态启动。负载低于目标的 60% 时它会移除一个副本，并且最多每 30 秒动作一次，所以要为突发高峰留出余量。研究定时扩缩容后，它会为已知高峰提前规划：在创业项目的高峰时刻之前两个日历小时，它按高峰负载来定容量，让副本在高峰到来时已经预热。',
      links: [
        { label: 'AWS：什么是 Amazon EC2 Auto Scaling？' },
        { label: 'Kubernetes：Pod 水平自动扩缩容' },
        { label: '维基百科' },
      ],
      design: [],
    },
    'availability-zone': {
      term: '可用区',
      definition:
        '云区域内一个独立的数据中心或一组数据中心，拥有独立的供电、制冷和网络。同一区域的可用区距离足够近，能够高速互联，也相隔足够远，单次故障通常不会同时影响两个可用区。',
      inGame:
        '游戏中称其为“可用区”。完成“多可用区”研究后，你可以将支持可用区的各节点放入 a、b 或 c 区，并为数据库、连接池、缓存、搜索引擎或队列配置位于另一区的备用节点，支出为原来的两倍。跨可用区调用会增加 1 ms 延迟，双向出站流量均按每 GB $0.01 收费。“可用区故障”会使一个区内的所有节点宕机；备用节点约 20 秒后接管，其他区的副本则继续提供服务。',
      links: [
        { label: 'AWS：区域与可用区' },
        { label: 'AWS 构建者文库：利用可用区实现静态稳定性' },
        { label: 'Google Cloud：区域与可用区' },
      ],
      design: [],
    },
    backpressure: {
      term: '背压',
      definition:
        '慢消费者要求生产者减速或停止的信号，避免缓冲区或队列无限增长。没有背压时，积压会不断增加，直到耗尽内存或延迟变得无法接受。',
      inGame:
        '队列的“最大长度”最接近背压机制：超过上限后，队列拒绝新任务，提交该任务的上传或导出请求也会失败。不设上限时，只要工作进程处理速度低于任务到达速度，队列深度就会增加。新任务必须在积压任务后面等待，而用户会按结果就绪的时间评价上传或导出：上传超过 40 秒，导出超过 4 分钟，用户就会感到沮丧。增加工作进程或提高其规格，可以降低队列深度。',
      links: [
        { label: 'AWS 构建者文库：避免难以消化的队列积压' },
        { label: 'Node.js：流中的背压' },
      ],
      design: [{ label: '队列' }],
    },
    bcrypt: {
      term: 'Bcrypt',
      definition:
        '一种 1999 年提出、基于 Blowfish 密码算法的 password 哈希函数，内置盐值，计算成本可调。成本每提高一级，计算量就翻倍，因此即使硬件不断变快，已存储的哈希仍难以快速破解。同样的缓慢计算也会在每次登录时消耗服务器 CPU。',
      inGame:
        '每次登录的哈希计算消耗 80 ms CPU 时间，更快的运行时也无法缩短它。在“事件循环阻塞”故障中，成本从 10 轮提高到 12 轮，每次登录的 CPU 开销变为 4 倍。在“撞库攻击”中，机器人会发起 20 倍的登录请求。认证服务商（通过“托管身份认证”解锁）可以将哈希计算从你的应用服务器移走，但会按用户收费。',
      links: [
        { label: 'Provos 和 Mazieres：可适应未来的密码方案（USENIX 1999）' },
        { label: 'OWASP：密码存储速查表' },
        { label: '维基百科' },
      ],
      design: [{ label: '请求类型' }],
    },
    'binary-rpc': {
      term: '二进制 RPC',
      definition:
        '一种远程过程调用，用二进制格式（例如 gRPC 上的 Protocol Buffers）而不是 JSON 这样的文本编码消息。载荷更小、解析更便宜，代价是两端必须约定同一份模式。',
      inGame:
        '研究服务间二进制 RPC 后，应用服务器或工作进程为每次内部调用做序列化所花的 CPU 减半：每次调用的参考成本从 0.02 毫秒降到 0.01 毫秒（两者都是提议值，因为研究之前游戏没有序列化成本）。它体现在发出调用的节点的 CPU 仪表上，因此 CPU 吃紧的设计可以在同样的机器上服务更多请求。',
      links: [{ label: 'gRPC 文档：gRPC 简介' }],
      design: [{ label: '性能研究' }],
    },
    'bgp-border-gateway-protocol': {
      term: 'BGP（边界网关协议）',
      definition:
        '互联网上各网络用来告知彼此能够到达哪些 IP 地址的协议。如果一个网络误撤销了路由，即使服务器仍在运行，互联网的其他部分也无法再找到它。',
      inGame:
        '“BGP 配置错误”故障可能从 C 轮开始发生。一次路由变更会让你的公司从互联网上消失：所有区域中，来自用户的每个请求都会因服务不可用而失败，最长持续 120 秒。没有研究能够预防它，故障调度器也很少选择它。点击故障上的“回滚”，即可立即结束。',
      links: [
        { label: 'Cloudflare 学习中心：什么是 BGP？' },
        { label: 'RFC 4271：BGP-4' },
        { label: 'Meta 工程博客：10 月 4 日故障的更多细节' },
      ],
      design: [],
    },
    'blast-radius': {
      term: '影响范围',
      definition:
        '一次故障所影响的系统、用户或流量的范围。可用区、单元架构和小批量部署等故障隔离措施，可以缩小故障影响范围。',
      inGame:
        '可用区故障会让该可用区内的每个节点宕机。启用多可用区后，可以把副本分散到三个可用区，并为数据节点配置几秒内接管的备用节点。部署出错时，每个随版本发布的项目会让应用服务器 8% 的请求失败，上限 40%，因此部署越小，出错越少。它只会让发布该版本的服务的流量失败。在 Node.js 上，一个慢请求会拖住同一事件循环上的所有请求，而 BEAM 会让每个请求彼此隔离。',
      links: [{ label: 'AWS Well-Architected：使用故障隔离' }, { label: 'AWS 白皮书：单元架构' }],
      design: [{ label: '语言特性' }, { label: 'CI/CD 流水线' }],
    },
    'blue-green-deployment': {
      term: '蓝绿部署',
      definition:
        '一种使用两套完全相同的生产环境的发布方式。将新版本部署到空闲环境，再一次性把全部流量切过去；出问题时再切回来，因此回滚很快。',
      inGame:
        'CI/CD 流水线提供蓝绿部署作为部署策略。新的机群启动并通过检查期间，旧机群继续提供服务，因此部署出错时最多让应用服务器 10% 的请求失败。一次部署耗时 7 分钟，并按流水线两倍的支出计费。',
      links: [
        { label: 'Martin Fowler：蓝绿部署' },
        { label: 'AWS 白皮书：蓝绿部署' },
        { label: '维基百科' },
      ],
      design: [{ label: 'CI/CD 流水线' }],
    },
    'bot-management': {
      term: '机器人管理',
      definition:
        '把自动化流量与人区分开，并按各自的方式处理：对可疑客户端发起挑战、限流或拦截，而不是让每条规则匹配都直接失败。',
      inGame:
        '研究机器人管理后，WAF 的误伤率减半而拦截率不变（减半为提议值，10 只给出方向而没有比例）：可疑客户端会收到挑战，因此被误判的真实用户仍能打开页面。机器人依旧不带来收入，通过时依旧占用容量，所以 WAF 仍是拦截它们的第一道关口。',
      links: [{ label: 'Cloudflare 学习中心：什么是机器人管理？' }],
      design: [{ label: 'WAF' }],
    },
    'brookss-law': {
      term: '布鲁克斯定律',
      definition:
        '“向已经延期的软件项目增加人手，只会让它更晚。”这句话出自 Fred Brooks 于 1975 年出版的《人月神话》。新人需要时间上手，而沟通路径的增长速度超过人数的增长速度。',
      inGame:
        '团队的有效人数为 n / (1 + 0.08(n − 1) + 0.0004·n(n − 1))，因此 8 人的效率约等于 5 人，人数超过约 48 人后，团队反而会变慢。新员工在第一个日历周也只有 30% 的工作效率。此惩罚在各团队内部单独计算，因此将人员拆分到最多 4 个团队会有所帮助，Symfony 还能将惩罚降低 30%。',
      links: [{ label: '维基百科：布鲁克斯定律' }, { label: '维基百科：人月神话' }],
      design: [{ label: '团队协调' }],
    },
    bulkhead: {
      term: '舱壁隔离',
      definition:
        '限制单个依赖能够占用的调用方资源，例如线程、连接或槽位。依赖变慢时，只会占满分给它的那部分容量，其他依赖的调用仍可正常进行。名字源于将船体分隔为多个舱室的隔墙。',
      inGame:
        '研究隔舱后，每条链路多出一个开关。带隔舱的链路允许一次调用运行 1000 毫秒；超过之后调用方放弃它、释放槽位，请求以 `timeout` 失败，因此慢依赖无法占满所有槽位。它限制的是时间而不是并发调用数，在固定负载下二者等价（Little 定律），1000 毫秒为提议值。没有它时，每次调用都会占住调用方的槽位，直到得到回答或触发链路超时（默认 30 秒）。',
      links: [{ label: 'Azure 架构中心：舱壁隔离模式' }, { label: '维基百科：舱壁（隔板）' }],
      design: [{ label: '链路设置' }],
    },
    'burn-rate': {
      term: '消耗速率',
      definition:
        '服务相对于 SLO 消耗错误预算的速度。消耗速率为 1 时，恰好在 SLO 窗口内用完整个预算；为 10 时，只需窗口十分之一的时间就会用完。团队会在消耗速率过高时呼叫值班人员，而不是为每个错误都报警。',
      inGame:
        '完成“SLO 仪表盘”研究后，仪表盘（D）会绘制错误预算消耗速率的时间曲线：用实际失败率除以 SLO 允许的失败比例。图中标出 1× 和 10×；超过 10× 时，预算会在一周结束很久之前就耗尽。修复原因或放慢部署，直到曲线降至 1× 以下。',
      links: [{ label: 'Google SRE 工作手册：基于 SLO 告警' }],
      design: [{ label: '仪表盘图表' }],
    },
    'bytecode-cache': {
      term: '字节码缓存',
      definition:
        '缓存脚本编译后的形式，让解释器无需每次运行都重新解析和编译源码。PHP 的 OPcache 将预编译的字节码保存在共享内存中，Python 写入 .pyc 文件也是出于同样的原因。',
      inGame:
        '没有字节码缓存时，PHP 每次请求都会编译所有脚本。在 PHP-FPM 之后研究 OPcache，可将 PHP 应用服务器的 CPU 处理速度提高到 2.5 倍。PHP 机器重启后，起初没有 OPcache，随着预热才逐步恢复完整的 2.5 倍加速。',
      links: [{ label: 'PHP 手册：OPcache' }, { label: 'PEP 3147：PYC 存储目录' }],
      design: [],
    },
    'cache-hit-rate': {
      term: '缓存命中率',
      definition:
        '缓存直接用自身副本回答的查询占比，无需访问后方更慢的系统。未命中时，请求会访问源站或数据库。命中率的一点变化就可能大幅改变源站负载：从 90% 降到 80%，未命中数就会翻倍。',
      inGame:
        '缓存或 CDN 节点会在卡片上显示命中率。缓存的命中率为（内存 / 热数据，约每用户 200 KB）的平方根 × TTL 系数（10 秒为 60%，60 秒为 85%，1 小时为 97%）× 最高 50% 的写入惩罚系数 × 预热程度。CDN 在 TTL 为 300 秒时，可回答 70% 的页面请求和 75% 的媒体请求；TTL 为 60 秒时乘以 0.8，1 小时时乘以 1.2，最高 95%。增加缓存内存或延长 TTL 可以提高命中率，但更长的 TTL 会返回更多过期数据。',
      links: [
        { label: 'Cloudflare：什么是缓存命中率？' },
        { label: 'AWS：缓存最佳实践' },
        { label: 'AWS 构建者文库：缓存的挑战与策略' },
      ],
      design: [],
    },
    'cache-stampede': {
      term: '缓存击穿',
      definition:
        '大量请求在同一时刻未命中相同的缓存数据，例如缓存重启或过期之后，所有请求一起涌向数据库。额外负载可能使数据库慢到缓存始终无法重新填满。',
      inGame:
        '在“缓存击穿”故障中，缓存重启后为空，所有未命中请求同时访问数据库。数据库繁忙程度达到或超过 90% 时，回填会超时，缓存持续处于冷状态。“缓存击穿保护”让冷缓存只向下游发送额外未命中请求的 25%。“缓存预热”则让缓存重启后恢复到 80% 的预热程度。',
      links: [
        { label: '维基百科' },
        { label: 'Nishtala 等：Facebook 的 Memcache 扩展实践（NSDI 2013）' },
      ],
      design: [{ label: '缓存雪崩' }, { label: '缓存雪崩故障' }],
    },
    'cache-warming': {
      term: '缓存预热',
      definition:
        '在缓存接收流量前，提前填入可能会用到的数据，避免最初的请求全部未命中。团队通常会在重启、部署或新增缓存节点后，通过加载快照或重放最近的键来预热缓存。',
      inGame:
        '缓存重启后会处于冷状态，每次未命中都会访问数据库。Redis 会自行重新加载一半数据，Memcached 则完全不会。完成“缓存预热”研究后，可以在缓存卡片上开启“预热”：缓存将在重启或缓存击穿后恢复到 80% 的预热程度。前置研究“缓存击穿保护”则用于处理剩余的未命中请求。',
      links: [{ label: 'Netflix 技术博客：缓存预热' }, { label: 'Redis 文档：持久化' }],
      design: [],
    },
    'cache-aside': {
      term: '旁路缓存',
      definition:
        '一种缓存模式：应用先查缓存，未命中时读取数据库并将结果放入缓存；写入时更新数据库，并使缓存条目失效。',
      inGame:
        '缓存直接回答已有的读取查询，将未命中请求发送给数据库。其命中率为 √(内存 / 热数据) × TTL 系数 × 预热程度，每个用户约有 200 KB 热数据。写入会穿过缓存并使数据失效，因此写入占比高会降低命中率。更长的 TTL（10 秒、60 秒或 1 小时）可以提高命中率，但也会返回更多过期数据。',
      links: [{ label: 'Azure 架构中心：旁路缓存模式' }, { label: 'AWS：缓存最佳实践' }],
      design: [{ label: '缓存策略' }],
    },
    'canary-deployment': {
      term: '金丝雀部署',
      definition:
        '一种发布方式：先将少量流量发给新版本，与旧版本比较错误率和延迟。如果金丝雀版本表现良好，就继续上线；否则，在大多数用户接触到它之前回滚。',
      inGame:
        'CI/CD 流水线提供金丝雀部署作为部署策略。一次部署会先把 5% 的流量导向新版本，因此部署出错时，在你回滚之前最多让应用服务器 5% 的请求失败。它是最慢的策略，每次部署耗时 10 分钟，并按流水线 1.5 倍的支出计费。',
      links: [{ label: 'Martin Fowler：金丝雀发布' }, { label: 'Google SRE 工作手册：金丝雀发布' }],
      design: [{ label: 'CI/CD 流水线' }],
    },
    'cascading-failure': {
      term: '级联故障',
      definition:
        '从系统的一个部分跳到另一个部分的故障：一个变慢或损坏的组件会让调用方过载，而调用方的重试和队列又会让它们的上游过载。第一个故障是触发点，后面的故障才会把一次小故障变成长时间的故障。',
      inGame:
        '从 A 轮起，无人响应的故障结束时可能引发另一个故障，后者会把前者记为原因。放任不管的慢查询会引发重试风暴，重试风暴会引发连接耗尽，内存泄漏会引发 GC 暂停风暴。只有设计对后者脆弱时，第二个故障才会启动。呼叫器会点出这条链，复盘卡片会说明它沿着什么发展。以任何方式响应故障（哪怕只是确认），都能阻止它级联，而且一条链最多只传一跳。',
      links: [{ label: 'AWS：自动化的安全免干预部署' }, { label: 'Google SRE 书：级联故障' }],
      design: [{ label: '故障级联' }],
    },
    'cdc-change-data-capture': {
      term: 'CDC（变更数据捕获）',
      definition:
        '读取数据库的变更日志，例如 PostgreSQL 的预写式日志，并将每次插入、更新和删除发布为事件。数据仓库或搜索索引等其他系统无需查询源数据库，就能保持同步。',
      inGame:
        '存在 CDC 连接器，由系列 B 的变更数据捕获解锁。把数据库连接到它，再把它连接到事件流：它从写入日志读取每一次写入，并以每秒 20,000 次变更的速度把每次变更发布为事件，因此搜索引擎或数据仓库无需应用写两次就能跟上数据库。它增加的是延迟（lag）而不是时延：写入从不等待副本。',
      links: [
        { label: '维基百科' },
        { label: 'PostgreSQL 文档：逻辑解码概念' },
        { label: 'Debezium 文档' },
      ],
      design: [{ label: 'CDC 连接器' }],
    },
    'cdn-content-delivery-network': {
      term: 'CDN（内容分发网络）',
      definition:
        '由分布在多地的缓存服务器组成的网络，将内容副本保存在用户附近。最近的边缘节点能够回答的请求无需到达源站，因此速度更快，源站也无需为此付出成本。',
      inGame:
        '“内容分发”研究解锁 CDN 组件。默认 TTL 为 300 秒时，它在边缘回答 70% 的页面请求和 75% 的媒体请求；TTL 为 60 秒时，命中率降低 20%，为 3,600 秒时提高 20%，最高 95%。边缘出站流量每 GB 收费 $0.02，而应用服务器为每 GB $0.09。“分层缓存”将媒体命中率提高到 92%。',
      links: [{ label: 'Cloudflare 学习中心：什么是 CDN？' }, { label: 'MDN：CDN' }],
      design: [],
    },
    'chaos-engineering': {
      term: '混沌工程',
      definition:
        '以受控的方式故意注入故障，弄清系统的真实行为：杀掉一个节点、增加延迟、切断一个依赖。它把对弱点的猜测变成一次测量。',
      inGame:
        '研究混沌工程后，团队面板多出一个混沌开关。开启期间，每 120 秒最弱节点会让 20% 的调用失败 10 秒，公司由此每秒获得 1 点故障洞察（全部为提议值）。开关会点名下一次实验要打的节点，注入的 `refused` 错误会出现在仪表盘的错误行里，与它要教会你看的故障并列。',
      links: [{ label: '混沌工程原则' }],
      design: [{ label: '可靠性研究' }],
    },
    'circuit-breaker': {
      term: '熔断器',
      definition:
        '调用路径上用于监测失败的开关。当失败调用过多时，它会断开一段时间，立即拒绝新调用，让调用方不再等待，也让承压的服务恢复。随后会放行少量调用，测试服务是否恢复。',
      inGame:
        '完成“熔断器”研究后，可以为每条链路开启熔断器。当链路超过一半的调用失败时，它会断开 5 秒：不发送任何请求，调用立即以“被拒绝”失败。随后它会闭合并重试。熔断器是预防“重试风暴”的三种措施之一。',
      links: [
        { label: 'Martin Fowler：熔断器' },
        { label: 'Azure 架构中心：熔断器模式' },
        { label: '维基百科' },
      ],
      design: [{ label: '链路设置' }, { label: '重试风暴' }],
    },
    'code-review': {
      term: '代码审查',
      definition:
        '在变更合并前，由另一位工程师阅读代码，以发现缺陷、保持代码一致并分享知识。现代代码审查通常比较轻量，借助工具对小批量变更进行。',
      inGame:
        '代码审查研究会让一次部署引入错误的概率降低 20%，并与自动化测试（30%）叠加。它还会在功能上线之前，在其图块上显示每个功能隐藏的代价，例如“每次写入查询成本增加 20%”。技术债会提高部署出错的概率，因此债务越多，审查越重要。',
      links: [
        { label: 'Google 工程实践：代码审查' },
        { label: '现代代码审查：Google 案例研究' },
        { label: '维基百科' },
      ],
      design: [],
    },
    'cold-start': {
      term: '冷启动',
      definition:
        '新进程、容器或函数实例启动时的延迟，以及最初几个请求的缓慢响应。它必须完成启动、加载代码和数据、填充缓存或对热点代码进行 JIT 编译，才能达到全速。',
      inGame:
        '新启动或重启的应用服务器会先启动，再预热。Java（Tomcat）副本以 30% 的速度起步，需要 30 秒才能达到满速，而 Go 一开始就是满速。自动扩缩容器新增的副本在虚拟机上需要 180 秒才能提供服务，在 Kubernetes 集群中则是 30 秒。重启后的缓存在使用 Memcached 时是空的，使用 Redis 时则预热一半；冷数据库执行查询时最多消耗两倍 CPU。无服务器函数在空闲期间不保留运行环境，因此间隔之后的第一个请求会冷启动，Rust 或 Go 需要 50 毫秒，JVM 最多需要 2,000 毫秒。',
      links: [
        { label: 'AWS Lambda 文档：执行环境生命周期' },
        { label: '维基百科：冷启动（计算）' },
      ],
      design: [{ label: '无服务器函数' }, { label: '运行时行为' }],
    },
    compression: {
      term: '压缩',
      definition:
        '在响应通过网络发送之前，用 gzip 或 Brotli 等方式将其编码为更少的字节，再由客户端解码。它能节省带宽和传输时间，但两端都要消耗 CPU。',
      inGame:
        '“压缩”研究允许你为每台应用服务器开启 gzip。页面、读取、搜索、报表、信息流和机器人响应会缩小至原来的 30%，这些请求的 CPU 开销则增加 10%。更小的响应能更快到达用户，减少机器网卡的占用，并降低源站出站流量。上传、媒体等其他请求类型的大小保持不变。',
      links: [{ label: 'MDN：HTTP 中的压缩' }, { label: 'RFC 1952：GZIP 文件格式' }],
      design: [],
    },
    'connection-pooling': {
      term: '连接池技术',
      definition:
        '保留一组已打开的数据库连接，供多个客户端共用，而不是为每个客户端或每次请求单独建立连接。这样既节省建连时间，也能避免数据库连接数超过上限。',
      inGame:
        '数据库接受 100 个连接，超出的连接会被拒绝。每个应用服务器进程都有自己的连接池：PHP 或 Gunicorn 的每个工作进程占 1 个连接，Puma 每进程占 5 个，Node.js 或 Go 占 10 个。事务模式下的连接池组件让它们共享 20 个服务端连接，但在你修复代码中的会话状态问题前，会有 5% 的池化查询失败。“连接耗尽”故障会使每个连接池的连接数翻倍。',
      links: [
        { label: 'PgBouncer：功能与连接池模式' },
        { label: 'PostgreSQL 文档：连接（max_connections）' },
        { label: '维基百科' },
      ],
      design: [{ label: '连接池' }],
    },
    'consistent-hashing': {
      term: '一致性哈希',
      definition:
        '在哈希环上将键映射到服务器的方法，增删一台服务器时，只需移动约 1/n 的键。Karger 等人于 1997 年为 Web 缓存提出此方法，Amazon 的 Dynamo 和 Apache Cassandra 也用它放置数据。',
      inGame:
        '研究负载均衡算法后，负载均衡器可以按一致性哈希分配：每个目标无论负载如何都获得相同份额的键，离开的目标只移走它自己的键。宽列存储将每个键放在 N 个副本上，“热键”故障则是一个键所在的分片达到饱和。',
      links: [
        { label: 'Karger 等：一致性哈希与随机树（STOC 1997）' },
        { label: 'DeCandia 等：Dynamo（SOSP 2007）' },
        { label: '维基百科' },
      ],
      design: [{ label: '负载均衡器' }],
    },
    'container-orchestration': {
      term: '容器编排',
      definition:
        '将容器调度到共享机器池、在故障时重启容器并进行扩缩容的软件，Kubernetes 是常见例子。把多个工作负载放在共享节点上能提高机器利用率，但相邻负载也可能互相拖慢。',
      inGame:
        '“容器编排”研究解锁 Kubernetes 集群。连接到集群的应用服务器和工作进程以 Pod 运行：支出降低 15%，自动扩缩容器新增副本只需 30 秒而非 180 秒，错误部署在发布到首批四分之一的 Pod 后就会停止，宿主机宕机的 Pod 也能在 30 秒后恢复。除非由平台团队管理，每个集群都会占用相当于半名工程师的开发工时。版本停止支持满一个季度后，可能触发强制升级，使 30% 的 Pod 请求崩溃。Pod 越繁忙，邻居干扰就越严重，会让 0.5% 至 2% 的请求额外增加 10 ms 延迟。',
      links: [
        { label: 'Kubernetes：概述' },
        { label: 'Kubernetes：Pod 和容器的资源管理' },
        { label: '利用 Borg 在 Google 进行大规模集群管理' },
      ],
      design: [],
    },
    'continuous-batching': {
      term: '连续批处理',
      definition:
        '一种语言模型服务技术：一旦有空位就把新请求加入正在运行的批次，而不是等整批结束。吞吐量上升，首字等待保持很短。',
      inGame:
        '研究连续批处理后，GPU 节点可以使用批次 8 和批次 32：每秒提示数分别为 1.6 倍和 2.2 倍，首字延迟不变。没有它，更大的批次仍然提高吞吐量，但会让首字多等 150 或 500 毫秒。所有数字都是提议值：05 只给出取舍，没有给出数字。',
      links: [{ label: 'vLLM 文档：连续批处理' }],
      design: [{ label: 'GPU 节点' }],
    },
    'continuous-delivery': {
      term: '持续交付',
      definition:
        '通过自动化流水线构建、测试和部署软件，让软件始终处于任何变更都能随时安全发布的状态。这使发布更小、更频繁，也更容易回滚。',
      inGame:
        '在持续交付研究之前，一次部署要手动花 30 分钟。研究之后，流水线 5 分钟完成部署，因此在 8 小时工作日里，算上构建和 15 分钟的检查，可以完成更多次部署。它还允许你回滚出错的部署，这会结束该故障，并让其中的功能重新排队等待下次部署；它也会解锁 CI/CD 流水线：放置一条后，它的部署策略决定部署时间，以及部署出错时最多能破坏多少。',
      links: [
        { label: 'Martin Fowler：持续交付' },
        { label: 'DORA：持续交付' },
        { label: '维基百科' },
      ],
      design: [],
    },
    'conways-law': {
      term: '康威定律',
      definition:
        '“设计系统的组织，其设计不可避免地会成为该组织沟通结构的复制品。”这句话出自 Melvin Conway 于 1968 年发表的论文。很少交流的团队，往往会构建彼此之间接口狭窄的模块。',
      inGame:
        '从天使轮起你最多可以创建 4 个团队，每个团队有自己的策略，也各自承担协调成本，因此拆分大团队会提高总开发工时。服务数量多于团队数量，就是康威定律成就所标记的错配：给每个服务配一个团队即可解决。服务的负责人负责建立它的待办列表，并在它出故障时被呼叫。',
      links: [
        { label: 'Mel Conway：康威定律' },
        { label: 'Martin Fowler：康威定律' },
        { label: '维基百科' },
      ],
      design: [{ label: '服务及其所属团队' }],
    },
    'credential-stuffing': {
      term: '撞库攻击',
      definition:
        '机器人使用其他网站泄露的用户名和 password 组合尝试登录的攻击。由于许多人会重复使用密码，这种攻击往往有效。每次尝试也会让网站付出一次缓慢的 password 哈希计算成本。',
      inGame:
        '从种子轮起，公司提供登录服务时，就可能发生“撞库攻击”故障。机器人发送的登录请求是正常速率的 19 倍，每次都要让应用服务器完整计算一次 bcrypt 哈希，从而耗尽 CPU。WAF 会拦截大部分机器人：默认严格级别 2 下可拦截 80%。认证服务商负责剩余的哈希计算，让每次登录在应用服务器上只消耗约 2 ms CPU 时间。',
      links: [
        { label: 'OWASP：撞库攻击' },
        { label: 'OWASP 速查表：预防撞库攻击' },
        { label: 'Cloudflare 学习中心：什么是撞库攻击？' },
      ],
      design: [],
    },
    'data-residency': {
      term: '数据驻留',
      definition:
        '法律或合同规定某些数据必须在指定国家或地区内存储和处理的要求。例如，欧盟的 GDPR 对向欧盟以外传输个人数据作出了限制。',
      inGame:
        '数据驻留是上市前 IPO 清单中的一项。满足条件需要拥有“数据驻留控制”和 GeoDNS，运行一个欧洲用户节点，并且其可达的每个数据节点都位于欧洲区域，或是采用分散部署的宽列存储或分布式 SQL 节点。搭建完整的欧洲访问路径，并让数据保留在当地，即可完成此项。',
      links: [
        { label: 'Cloudflare 学习中心：什么是数据本地化？' },
        { label: '维基百科：数据主权' },
      ],
      design: [],
    },
    'ddos-distributed-denial-of-service': {
      term: 'DDoS（分布式拒绝服务）',
      definition:
        '多台机器（通常来自僵尸网络）同时向服务灌入海量流量，使真实用户无法访问的攻击。防御措施会在边缘过滤垃圾流量，并将负载分散到多个地点。',
      inGame:
        '“DDoS”故障从种子轮起可能发生，最多持续 60 秒，期间会加入相当于正常需求 50 倍的机器人流量。WAF 根据严格级别过滤机器人；开启“遭受攻击模式”可拦截 99% 的机器人，代价是误拦 1% 的真实用户，并增加 40 ms 延迟。运行 WAF 时，故障调度器选择 DDoS 的频率也会降低。',
      links: [
        { label: 'Cloudflare 学习中心：什么是 DDoS 攻击？' },
        { label: 'CISA：了解拒绝服务攻击' },
        { label: 'Cloudflare 文档：遭受攻击模式' },
      ],
      design: [],
    },
    'dead-letter-queue': {
      term: '死信队列',
      definition:
        '独立存放消费者在多次尝试后仍无法处理的消息的队列。它能防止一条坏消息阻塞整个队列，并保留消息供人检查或重放。',
      inGame:
        '队列卡片的“失败任务”设置可选“无限重试”或“死信队列”，尝试次数为 1、3、10 或 25 次。失败的任务会在 30 秒后返回，交给工作进程再次执行；每次都失败的任务最终会丢失。“毒消息”故障只会影响无限重试的队列：一项总是失败的任务不断回来，工作进程将 90% 的时间耗在它身上。开启死信队列可让队列免受此故障影响，删除消息则可结束当前故障。',
      links: [
        { label: 'AWS：在 Amazon SQS 中使用死信队列' },
        { label: 'RabbitMQ：死信交换器' },
        { label: '企业集成模式：死信通道' },
      ],
      design: [],
    },
    denormalization: {
      term: '反规范化',
      definition:
        '把同一事实存放在多处，或保留一份预连接副本，让读取不必再连接或计算。读取更便宜，而每次写入都要更新每一份副本。',
      inGame:
        '研究反规范化后，数据库每次读取少花 30% 的 CPU，每次写入多花 20%（10）。它在读多的设计上划算，在写多的设计上吃亏，正是权衡卡预览在你动手之前展示的取舍。',
      links: [{ label: '维基百科：反规范化' }],
      design: [{ label: '性能线' }],
    },
    'dependency-scanning': {
      term: '依赖扫描',
      definition:
        '自动将项目使用的第三方库与已知漏洞数据库进行比对的检查。它通常在构建流水线中运行，标记出需要升级的版本。',
      inGame:
        '依赖扫描是 A 轮的安全研究，需要持续交付。它能在构建安装之前发现已发布的后门，并降低供应链攻陷事件所利用的弱点。它还是 SOC 2 计划的三个前提之一（另两个是全程 TLS 和静态加密），而 IPO 清单需要 SOC 2。',
      links: [
        { label: 'OWASP Top 10：存在漏洞和过时的组件' },
        { label: 'OWASP Dependency-Check 依赖检查工具' },
        { label: 'GitHub 文档：关于 Dependabot 警报' },
      ],
      design: [],
    },
    'distributed-tracing': {
      term: '分布式追踪',
      definition:
        '追踪一个请求经过的每个服务。每一跳都记录带有开始和结束时间的跨度，共享同一追踪 ID 的跨度组成完整调用链。调用链能显示时间花在哪里，以及哪个依赖较慢。',
      inGame:
        '分布式追踪研究（在百分位之后）会在仪表盘的服务表和瀑布图中逐节点显示每种请求类型的耗时。Analytics 节点对与它相连的节点的流量采样并转化为洞察。百分位显示 p50、p95 和 p99，看板会标出瓶颈。',
      links: [{ label: 'Dapper：Google 的追踪基础设施' }, { label: 'OpenTelemetry：调用链' }],
      design: [],
    },
    'diurnal-traffic': {
      term: '昼夜流量变化',
      definition:
        '需求随人们清醒和活动时间而每日起伏。面向消费者的服务通常在晚间达到峰值，凌晨最为安静。容量规划必须覆盖每日高峰，而低谷适合进行维护。',
      inGame:
        '需求按日历中的每日周期变化：默认在 20:00 达到平均值 1.45 倍的峰值，在 08:00 降至 0.55 倍。每个创业方向都有自己的曲线，例如金融科技在 14:00 达峰，波动幅度为 ±60%。开放更多区域后，各区域会在当地时间 20:00 达峰。模拟中的 1 秒对应日历中的 1 分钟，因此 1 倍速下 24 分钟就过完一天：要么按晚间高峰配置容量，要么让自动扩缩容器跟随曲线调整。',
      links: [
        { label: 'USENIX 1997：客户端追踪中的昼夜周期' },
        { label: 'AWS：EC2 Auto Scaling 的预测式扩缩容' },
      ],
      design: [],
    },
    'dns-round-robin': {
      term: 'DNS 轮询',
      definition:
        '通过 DNS 分散负载：同一个域名返回多个 IP 地址，服务器轮换它们的顺序，让客户端分散到不同主机。DNS 不知道主机是否存活，客户端还会按记录的 TTL 缓存结果。',
      inGame:
        '“DNS 轮询”研究解锁 DNS 组件，将用户平均分配到最多 8 台主机。没有健康检查时，宕机主机仍占有原来的流量份额，这部分请求会失败。完成“健康检查”研究后，DNS 会在 TTL 到期时剔除宕机主机，TTL 可选 30、300 或 3,600 秒。负载均衡器会更快发现宕机主机：在下一次健康检查时就会发现。',
      links: [
        { label: 'Cloudflare 学习中心：什么是轮询 DNS？' },
        { label: 'RFC 1794：DNS 对负载均衡的支持' },
        { label: '维基百科' },
      ],
      design: [],
    },
    'dora-metrics': {
      term: 'DORA 指标',
      definition:
        'DORA 研究计划提出的软件交付五项指标：变更前置时间、部署频率、失败部署恢复时间、变更失败率和返工率。前三项衡量吞吐，后两项衡量不稳定程度。',
      inGame:
        '其中两项会影响玩法。每天的部署频率最多为 480 个工作分钟 /（构建时间 + 部署时间 + 15 分钟验证），并受团队策略限制，最多为 16、8 或 4 次。“持续交付”将部署时间从 30 分钟缩短到 5 分钟。每次部署引入缺陷的基础概率为 10%，“快速推进”和技术债会提高此概率，“自动化测试”（−30%）和“代码审查”（−20%）会降低此概率；部署卡片会显示具体数值。',
      links: [{ label: 'DORA：软件交付性能指标' }, { label: 'DORA：DORA 指标的历史' }],
      design: [{ label: '部署频率' }],
    },
    downsampling: {
      term: '降采样',
      definition:
        '以更低的分辨率存储旧指标，例如从每秒一个点降为每 5 分钟或每小时一个点，让长时间范围的数据存储成本低、绘图速度快。每个粗粒度数据点会保留被替代数据点的最小值、最大值、总和和数量。',
      inGame:
        '仪表盘在 1 小时和 6 小时范围内读取每分钟采样，在 1 天和 7 天范围内读取 15 分钟聚合块（保留 7 天），在 30 天范围内读取 1 小时聚合块（保留 30 天）。图表通常用每个块的均值绘制，但 p99 曲线使用每个块中最差一分钟的值，以免平均值掩盖峰值。',
      links: [
        { label: 'Thanos 文档：压缩器与降采样' },
        { label: 'Prometheus 文档：存储' },
        { label: '维基百科：降采样' },
      ],
      design: [{ label: '仪表盘时间范围' }],
    },
    drift: {
      term: '漂移',
      definition:
        'Terraform 或 Pulumi 等工具上次部署的基础设施与当前实际运行状态之间的差异。漂移来自工具之外的变更（例如在云控制台中调整规格），以及尚未应用的代码变更。',
      inGame:
        '镜像有两种漂移：源区域变更后它会落后；你直接修改镜像则产生手动变更。应用会让镜像回到源区域的状态，并还原计划看到的手动变更。Terraform 的计划会立即看到所有手动变更。Pulumi 和 Alchemy 与其记录的状态比较，因此手动变更只有在刷新或检查漂移之后才会显示。把合理的区域差异保留为覆盖项。',
      links: [
        { label: 'Terraform 教程：使用 refresh-only 模式同步 Terraform 状态' },
        { label: 'Pulumi 文档：检测并调和漂移' },
        { label: 'Alchemy 文档：drift' },
      ],
      design: [{ label: '保持镜像同步' }],
    },
    egress: {
      term: '出站流量',
      definition:
        '离开云服务商网络、流向互联网或其他可用区或区域的数据。服务商按 GB 收费，而入站数据通常免费。',
      inGame:
        '从种子轮起，支出包含出站流量费：应用服务器发送给用户的数据每 GB $0.09，CDN 在边缘回答的页面每 GB $0.02。跨可用区调用双向各收每 GB $0.01，跨区域调用每 GB $0.02，均按当前阶段的成本指数调整。压缩能让页面和读取响应缩小 70%，代价是增加 10% CPU 开销。',
      links: [
        { label: 'Cloudflare 学习中心：什么是数据出站费用？' },
        { label: 'AWS 架构博客：数据传输成本' },
      ],
      design: [{ label: '出站流量' }],
    },
    'edge-side-includes': {
      term: '边缘端包含',
      definition:
        '一种缓存技术：边缘节点保存页面的公共部分，只为每个用户拼装个性化片段，因此登录页面仍能大部分由缓存提供。',
      inGame:
        '研究边缘端包含后，CDN 的 `page` 命中率提高 20 个百分点，从 70% 到 90%（10），因为边缘现在可以缓存登录页面的外壳。TTL 仍会乘算，命中率仍以 95% 封顶。',
      links: [{ label: 'Fastly 文档：Edge Side Includes' }],
      design: [{ label: 'CDN' }],
    },
    'encryption-at-rest': {
      term: '静态数据加密',
      definition:
        '对磁盘、数据库文件和备份等存储数据进行加密，让拿到存储介质的人没有密钥就无法读取。它能防范磁盘被盗和备份泄露，却不能防范能够查询在线系统的攻击者。',
      inGame:
        '静态加密是 B 轮的安全研究。它对流量、成本或故障没有直接影响。它是 SOC 2 计划的三个前提之一（另两个是全程 TLS 和依赖扫描），而 IPO 清单需要 SOC 2。',
      links: [
        { label: 'Google Cloud：默认静态数据加密' },
        { label: 'OWASP 速查表：加密存储' },
        { label: 'PostgreSQL 文档：加密选项' },
      ],
      design: [],
    },
    'error-budget': {
      term: '错误预算',
      definition:
        'SLO 在一个时间窗口内允许的失败额度：SLO 为 99.9% 时，允许 0.1% 的请求失败。团队可以用它承担风险，例如加快发布；预算耗尽时则放慢节奏、修复可靠性。',
      inGame:
        '从 A 轮起，游戏将最近一个日历周的失败请求与当前阶段的 SLO 比较，目标从 A 轮的 99.9% 提高到上市后的 99.99%。机器人和 WAF 拦截不计入。完成“错误预算”研究后，剩余预算超过一半时，团队速度提高 10%；预算耗尽时，速度减半。“SLO 仪表盘”会在 HUD 上显示预算，也会在仪表盘中绘制预算消耗速率曲线。',
      links: [
        { label: 'Google SRE 书籍：拥抱风险' },
        { label: 'Google SRE 工作手册：错误预算策略' },
      ],
      design: [{ label: 'SLO 与错误预算' }],
    },
    'event-loop': {
      term: '事件循环',
      definition:
        '等待 I/O 事件并逐一执行其回调的单个线程。它能以低成本处理大量等待中的连接，但任何长时间占用 CPU 的回调，都会阻塞该循环上的所有其他请求。',
      inGame:
        'Node.js 运行一个事件循环，使用一个核心；Node.js cluster 则每个核心运行一个循环。CPU 密集型请求，例如登录时耗时 80 ms 的 password 哈希计算，会拖住后面的请求，这种停顿会体现在 p99 上。在“事件循环阻塞”故障中，每次登录的 CPU 开销变为 4 倍。“libuv 线程池”研究或认证服务商可以将哈希计算移出事件循环。',
      links: [
        { label: 'Node.js：Node.js 事件循环' },
        { label: 'Node.js：不要阻塞事件循环' },
        { label: 'MDN：JavaScript 执行模型' },
      ],
      design: [{ label: '事件循环与阻塞' }],
    },
    'eventual-consistency': {
      term: '最终一致性',
      definition:
        '一种一致性模型：写入之后，副本可能暂时返回旧数据。如果没有新的写入到来，所有副本最终都会收敛到相同的最新值。',
      inGame:
        '只读副本落后于写入，因此最多有 15% 的读取返回过期数据；在“复制延迟”故障中，最高为 50%。R + W 不大于 N 的宽列存储也会返回过期数据。过期读取会导致 API 读取失败，也会导致需要读取自身写入结果的结账请求失败。“读己之写路由”会将这些读取改发到主库。',
      links: [{ label: 'Werner Vogels：最终一致性（ACM Queue）' }, { label: '维基百科' }],
      design: [{ label: '宽列存储' }],
    },
    'expand-and-contract': {
      term: '扩展与收缩',
      definition:
        '一种不锁表修改模式的办法：先加新列或新表，两边都写入，回填数据，切换读取，再删除旧结构。每一步都向后兼容，因此新旧代码可以同时运行。',
      inGame:
        '研究扩展与收缩后，模式迁移锁事故被彻底消除：只有在线模式迁移时该事故的概率约降低为原来的八分之一，而使用扩展与收缩就完全不会发生。两者都要多花开发工时：在关系型数据库上，新增查询形态的功能在线迁移多花 10%，扩展与收缩多花 25%。',
      links: [{ label: 'Martin Fowler：并行变更' }],
      design: [{ label: '数据库结构迁移' }],
    },
    'fallacies-of-distributed-computing': {
      term: '分布式计算谬误',
      definition:
        '分布式系统新手常犯的八个错误假设，由 Sun Microsystems 的 L. Peter Deutsch 等人总结：网络可靠、延迟为零、带宽无限、网络安全、拓扑不变、只有一个管理员、传输成本为零，以及网络同构。',
      inGame:
        '多种故障和成本会打破这些假设。在“网络分区”故障中，跨区域调用会持续超时，直到分区恢复或你隔离旧主节点。跨可用区调用增加 1 ms 延迟，并产生双向出站流量费；跨区域调用还要承担往返延迟。在研究“超时与重试”之前，每条链路都会等待响应 30 秒。',
      links: [{ label: '维基百科' }, { label: 'Rotem-Gal-Oz：分布式计算谬误详解（PDF）' }],
      design: [{ label: '成就' }],
    },
    'fan-out': {
      term: '扇出',
      definition:
        '一个请求衍生出多个对其他服务或数据存储的调用。一个请求等待的调用越多，其中某个调用较慢的概率就越高，因此大规模扇出会提高尾延迟和负载。',
      inGame:
        '一次页面浏览会发起 2 次读取查询；在研究“预先加载”之前，ORM 框架（Laravel、Rails、Django）会将本可 1 次完成的读取变成 3 次。“动态信息流”功能加入信息流请求：拉取模式下，一次信息流请求会读取 20 次；采用写时扇出后，只需读取 1 次，但每次写入都要填充 20 位关注者的时间线。“混合扇出”将其降为 2 次读取和 10 次时间线写入。',
      links: [
        { label: 'Dean 和 Barroso：大规模系统中的尾延迟（CACM 2013）' },
        { label: '维基百科：扇出（软件）' },
      ],
      design: [{ label: '扇出' }],
    },
    'fan-out-on-write': {
      term: '写时扇出',
      definition:
        '发布帖子时就构建每位用户的信息流：将帖子复制到每位关注者的时间线，因此读取信息流只需一次低成本查询。它将工作从读取移到写入，但对关注者众多的账号而言，成本很高。许多系统采用混合方式：普通账号推送，名人账号则在读取时拉取。',
      inGame:
        '从 C 轮起，“动态信息流”功能加入信息流请求类型，每张应用服务器卡片都有“信息流：拉取或推送”选项。拉取模式下，一次信息流请求读取 20 篇帖子。推送模式下，只读取一条预先计算的时间线，但每次写入会产生 20 次时间线写入。“混合扇出”研究将其降为 10 次写入和每次信息流请求 2 次读取，并允许缓存或宽列存储将热键分散到各个分片。',
      links: [
        { label: 'InfoQ：大规模时间线（Twitter）' },
        { label: 'High Scalability：Twitter 使用的架构' },
      ],
      design: [],
    },
    'feature-flag': {
      term: '功能开关',
      definition:
        '代码中可在运行时控制的开关，无需重新部署即可开启或关闭功能。团队用它向部分用户发布功能、进行测试，或在出问题时迅速关闭。',
      inGame:
        '功能开关研究会解锁功能开关组件。每次部署批次中的每项功能都有自己的开放比例：关闭、5%、25%、50% 或全部用户。糟糕的部署会让批次中每项功能对应的 8% 请求失败，而开关把这项功能的份额削减到它的开放比例，因此无论部署策略如何，5% 的功能最多只会破坏原本的 5%。一键关闭就能止住影响。功能的各项效果与它带来的负载都取决于曝光度，即灰度比例乘以已采用的用户比例：已关闭的功能不产生任何收益，处于 50% 的功能在用户采纳后达到一半效果；A/B 测试以灰度之外的用户为对照衡量增益。',
      links: [
        { label: 'Martin Fowler 网站：功能开关（Pete Hodgson）' },
        { label: 'OpenFeature：什么是功能开关？' },
        { label: '维基百科' },
      ],
      design: [{ label: '功能开关' }],
    },
    'four-golden-signals': {
      term: '四大黄金信号',
      definition:
        '延迟、流量、错误和饱和度：Google SRE 书籍建议面向用户的系统首先监测这四项。如果只能测量四件事，就测量它们。',
      inGame:
        '完成“指标”研究后可打开仪表盘（D）。“黄金信号”一行绘制流量（已处理量与需求量）、延迟（均值，研究“百分位数”后还显示 p99）和错误（需“结构化日志”）曲线。下方“饱和度”一行显示各节点的负载程度，顶部统计会指出最繁忙的节点。',
      links: [
        { label: 'Google SRE 书籍：监控分布式系统' },
        { label: 'Grafana 文档：仪表盘最佳实践' },
      ],
      design: [{ label: '仪表盘信号' }],
    },
    'gc-pause': {
      term: '垃圾回收停顿',
      definition:
        '垃圾回收器为查找并释放不再使用的内存，暂停或拖慢应用的时间。停顿通常只影响部分请求，因此相较于平均值，它们更容易体现在 p99 等尾延迟指标上。',
      inGame:
        '应用服务器的堆占用超过 70% 时，垃圾回收器会让最多 2% 的请求遭遇停顿。Java 使用 G1 时停顿 30 ms，Parallel 为 150 ms，ZGC 为 1 ms，但 ZGC 会损失 10% 吞吐并多用 15% 内存。Go 仅停顿 1 ms，却最多多消耗 25% CPU；“Go GC 调优”允许在 CPU 与内存之间取舍。在“GC 停顿风暴”故障中，堆会进一步填满，遭遇停顿的请求数变为 5 倍。',
      links: [
        { label: 'Go：Go 垃圾回收器指南' },
        { label: 'OpenJDK Wiki：ZGC' },
        { label: 'Oracle：Java GC 调优指南' },
      ],
      design: [{ label: '运行时行为' }],
    },
    geodns: {
      term: 'GeoDNS',
      definition:
        '根据用户位置返回不同解析结果的 DNS，让每位用户连接到附近的数据中心或区域。许多服务商还能跳过健康检查失败的区域。',
      inGame:
        'GeoDNS 是 C 轮研究，前置条件为“多区域”。没有它时，各大洲的用户都从本土区域接入，并承担两次往返延迟，例如欧洲到北美为 150 ms。有了它，各区域的用户通过本区域的用户节点接入；发生“区域故障”时，则通过最近仍在线的用户节点接入。“数据驻留”清单项也需要 GeoDNS。',
      links: [
        { label: 'Amazon Route 53：地理位置路由' },
        { label: 'Amazon Route 53：基于延迟的路由' },
        { label: '维基百科' },
      ],
      design: [],
    },
    'gil-global-interpreter-lock': {
      term: 'GIL（全局解释器锁）',
      definition:
        'CPython 默认构建中的一把锁，以及 CRuby 中的 GVL，每次只允许一个线程执行解释器代码。线程等待 I/O 时仍可交错推进，但一个进程中的 CPU 工作无法并行。CPython 3.13 新增了不含 GIL 的可选自由线程构建（PEP 703）。',
      inGame:
        'Ruby 的 Puma 必须每个核心运行一个进程，才能使用所有核心，每进程有 5 个线程，占用 180 MB。Python 的 Gunicorn 运行一组同步工作进程，每进程处理一个请求、占用 120 MB，由你设置进程池大小。Go、Java 等没有 GIL 的运行时，则用一个进程使用所有核心。',
      links: [
        { label: 'Python 文档：术语表（全局解释器锁）' },
        { label: 'PEP 703：让 GIL 变为可选' },
        { label: '维基百科' },
      ],
      design: [{ label: '并发模型' }],
    },
    gitops: {
      term: 'GitOps',
      definition:
        '一种管理基础设施的方式：期望状态以声明式代码保存在 Git 中，由 Argo CD 或 Flux 等代理拉取，并持续让实际系统与之保持一致。OpenGitOps 列出四条原则：声明式、版本化且不可变、自动拉取、持续协调。',
      inGame:
        'GitOps 是 C 轮研究，需要先完成“基础设施即代码”。它会自动把源区域的每个变更应用到每个镜像，镜像不再落后。无论使用哪种 IaC 工具，它都会在下次同步时还原手动变更，相当于开启自愈的 Argo CD，因此覆盖项是调整区域的唯一方式。一次性同步最多在 3 个日历分钟内完成，与 Argo CD 的默认轮询一致。分阶段同步会先把变更在源区域保留 60 分钟。一次性同步以影响范围换取漂移：一次错误配置推送会同时到达所有镜像。',
      links: [
        { label: 'OpenGitOps：GitOps 原则' },
        { label: 'Argo CD 文档：自动同步策略' },
        { label: 'Flux 文档：核心概念' },
      ],
      design: [{ label: 'GitOps' }],
    },
    'graceful-degradation': {
      term: '优雅降级',
      definition:
        '在超出容量时关掉昂贵且可选的部分，而不是让一切失败，从而保住服务中重要的部分：页面仍然打开，报表稍后再说。',
      inGame:
        '研究优雅降级后，应用服务器多出一个开关。饱和节点会先丢弃最贵的请求类型，导出和上传先于读取，让便宜的类型保住延迟（10）。优先级降载则相反：它先丢弃价值最低的类型，机器人和竞价先于页面。',
      links: [{ label: 'Google SRE 手册：处理过载' }],
      design: [{ label: '可靠性线' }],
    },
    'green-threads': {
      term: '绿色线程',
      definition:
        '由语言运行时而非操作系统调度的轻量线程，例如 goroutine、Java 虚拟线程和 Erlang 进程。每个只需几 KB，因此一台服务器能够同时维持数千个等待中的线程。',
      inGame:
        'Go 和 Elixir 的 BEAM 在所有核心上运行绿色线程，等待中的请求不占用工作槽位。每条打开的实时连接在 Go 上占 10 KB，在 BEAM 上占 5 KB，而 Tomcat 上的 Java 线程占 1 MB。BEAM 采用抢占式调度，因此一个请求不会拖住另一个请求，但其 CPU 处理速度不到 Go 的一半。',
      links: [
        { label: 'Go 语言之旅：Goroutine' },
        { label: 'JEP 444：虚拟线程' },
        { label: '维基百科' },
      ],
      design: [{ label: '并发模型' }],
    },
    'health-check': {
      term: '健康检查',
      definition:
        '定期发送的探测，例如向状态端点发送 HTTP 请求，用来判断服务器是否应该接收流量。浅层检查只检查服务器自身；深层检查还会检查它所依赖的数据库等系统。',
      inGame:
        '负载均衡器每 10 秒探测一次应用服务器，在下一次检查时停止向宕机服务器发送流量。“健康检查”研究新增 2 秒和 30 秒的检查间隔，以及深层检查；后者还能剔除数据库宕机或过载的应用服务器。它也允许 DNS 在 TTL 到期后移除宕机主机；没有此研究，DNS 会继续把该主机应得的流量发送给它。只有完成“健康检查端点”任务后，这些检查才会生效。',
      links: [
        { label: 'AWS 构建者文库：实现健康检查' },
        { label: 'Kubernetes 文档：存活、就绪与启动探针' },
      ],
      design: [{ label: '负载均衡器' }],
    },
    'hedged-request': {
      term: '对冲请求',
      definition:
        '当首个请求比预期更慢时，例如超过第 95 百分位延迟，向另一个副本发送相同请求，并采用最先到达的响应。只需增加少量负载，就能降低尾延迟。',
      inGame:
        '研究对冲请求后，每条链路多出一个开关。对冲链路为每次调用再发一份副本，用户取更快的回答：平均值减半，p99 下降，被调用方多收到 10% 的调用，链路的速率会显示出来。百分位数展示对冲前后的尾部。宽列存储的法定人数读取是同一思路内建在数据库中：只等 N 个副本中最快的 R 个。',
      links: [
        { label: 'Dean 和 Barroso：大规模系统中的尾延迟（CACM 2013）' },
        { label: 'gRPC 文档：请求对冲' },
      ],
      design: [{ label: '进展' }],
    },
    'hot-key': {
      term: '热点键',
      definition:
        '接收了极大比例读写的单个键，例如名人的个人资料。负责该键的单个分片或服务器达到饱和，其他机器却闲着，因此增加服务器也无济于事。',
      inGame:
        '在热点键故障（C 轮）中，繁忙的缓存或宽列存储上 30% 的读取请求访问同一个键。该节点的容量会除以 0.3 × 规格档位 + 0.7，因此规格为 4 的节点只剩大约一半。混合扇出研究可以让你为缓存或宽列存储开启键拆分。拆分会分散热点键，并终止损失。',
      links: [
        { label: 'AWS 文档：设计分区键以分散 DynamoDB 工作负载' },
        { label: 'AWS 文档：DynamoDB 中的写入分片' },
        { label: 'Redis 文档：redis-cli --hotkeys' },
      ],
      design: [{ label: '分区' }],
    },
    'http-keep-alive': {
      term: 'HTTP 持久连接',
      definition:
        '复用同一条 TCP 连接来处理多个 HTTP 请求，而不是每次重新建立连接。这样，除第一个请求外，后续请求都可跳过建连握手；对 HTTPS 而言，也能跳过 TLS 握手。',
      inGame:
        '节点之间的每次内部调用会产生 0.5 ms 的跳转延迟和 1 ms 的 TCP 握手。“连接复用”研究会消除握手，使每次内部调用只需 0.5 ms。跨越多个节点的请求，每一跳都能节省 1 ms。',
      links: [
        { label: 'MDN：HTTP/1.x 中的连接管理' },
        { label: 'RFC 9112：HTTP/1.1，连接管理' },
        { label: '维基百科' },
      ],
      design: [],
    },
    'http2-and-http3': {
      term: 'HTTP/2 与 HTTP/3',
      definition:
        '较新的 HTTP 版本。HTTP/2 在一条 TCP 连接上同时发送多个请求。HTTP/3 基于 UDP 上的 QUIC，将传输层握手和 TLS 握手合并，并防止单个数据包丢失拖住所有流。',
      inGame:
        'HTTP/3 是需要 HTTP/2 的 C 轮研究。它让用户到另一个大洲区域的往返次数减少 20%：由北美服务的欧洲用户等待 120 毫秒而不是 150 毫秒。HTTP/2 是解锁 HTTP/3 的研究。HTTP/2 让页面浏览的用户跳数延迟减少 15%。',
      links: [
        { label: 'MDN：HTTP 的演进' },
        { label: 'Cloudflare 学习中心：什么是 HTTP/3？' },
        { label: 'RFC 9114：HTTP/3' },
      ],
      design: [],
    },
    'iac-tool': {
      term: 'IaC 工具',
      definition:
        '以代码描述基础设施并加以应用的工具：它将代码与已记录的状态比较，展示计划，然后执行变更。Terraform 使用 HCL；Pulumi 和 Alchemy 使用 TypeScript 等通用语言。每个工具都会保存一份已部署内容的状态文件。',
      inGame:
        '“基础设施即代码”研究会让你选择 Terraform、Pulumi 或 Alchemy。三者都能构建所有组件，并能为每个区域设置任意值。它们的区别在于计划如何发现手动变更，与各工具的默认工作流一致：Terraform 每次计划都会读取实时状态，因此计划完整，每次应用都要等待刷新。Pulumi 与已记录的状态比较，直到你刷新。Alchemy 同样与已记录的状态比较；检查漂移会读取实时状态，修复会还原手动变更但不采用源区域的变更。更换工具会让所有同步暂停一个日历日。',
      links: [
        { label: 'Terraform 文档：什么是 Terraform？' },
        { label: 'Pulumi 文档：基础设施即代码' },
        { label: 'Alchemy 文档：Providers' },
        { label: '维基百科：基础设施即代码' },
      ],
      design: [{ label: 'IaC 工具' }],
    },
    idempotency: {
      term: '幂等性',
      definition:
        '一个操作执行两次与执行一次的效果相同时，就具有幂等性。读取天然幂等，银行卡扣款或下单则不是。幂等键是客户端随请求发送的唯一 ID，服务端可借此识别重试，并返回首次结果，而不是再次执行操作。',
      inGame:
        '结账会向支付服务商发送扣款请求。在“重复扣款”故障中，服务商延迟增加约 1.5 秒，扣款链路超时，重试会对首次已经扣款的银行卡再次扣款，这些结账请求因此以重复扣款失败。研究“幂等键”（需要“结账”），再完成“幂等键”任务，就能保证重试扣款不再重复收费。没有这项研究时，将扣款链路的重试设为“无”即可结束故障。',
      links: [
        { label: 'AWS 构建者文库：利用幂等 API 实现安全重试' },
        { label: 'Stripe API：幂等请求' },
        { label: 'RFC 9110：幂等方法' },
      ],
      design: [{ label: '支付服务' }],
    },
    'inverted-index': {
      term: '倒排索引',
      definition:
        '将每个词映射到包含该词的文档列表的索引，就像书末的索引。Lucene、Elasticsearch 等全文搜索引擎使用它，PostgreSQL 也提供 GIN 索引。搜索只需读取几个短列表，而不必扫描每一行。',
      inGame:
        '放置搜索引擎之前，数据库自行回答 q-search，每次搜索消耗 80 ms CPU 时间，是普通读取的十倍。“全文搜索”研究解锁搜索引擎，每个规格档位每秒能处理 400 次搜索，耗时约 15 ms。将它连接到应用服务器后，搜索就不再增加数据库负载。',
      links: [
        { label: '斯坦福信息检索教材：构建倒排索引' },
        { label: 'PostgreSQL 文档：GIN 索引' },
        { label: '维基百科' },
      ],
      design: [],
    },
    'jit-warmup': {
      term: 'JIT 预热',
      definition:
        '即时编译器（JIT）在程序运行时，将频繁执行的代码转为优化后的机器码。在完成热点路径的分析与编译前，新进程无法达到峰值速度，因此最初几秒或几分钟会较慢。JVM 和 .NET 都以这种方式预热；分层编译和提前收集的性能分析数据可以缩短预热时间。',
      inGame:
        '每种运行时都有初始速度和预热时间。冷启动的 Tomcat（Java）应用服务器起初只有 30% 的 CPU 处理速度，30 秒后达到全速；Kestrel（C#）起初为 60%，Node.js 为 80%，持续 15 秒；Go、BEAM 和 Tokio 则从一开始就是全速。每次重启、调整规格、切换技术栈，以及自动扩缩容器新增副本都会从冷状态开始，因此要在高峰前增加容量，而不是高峰中才加。PHP 则预热 OPcache：随着缓存填满，CPU 处理速度从 1 倍提升至 2.5 倍。',
      links: [
        { label: 'OpenJDK JEP 515：预先方法性能分析' },
        { label: 'Microsoft：OpenJDK 中分层编译的工作原理' },
        { label: '维基百科：即时编译' },
      ],
      design: [{ label: '运行时行为' }],
    },
    'leaderless-replication': {
      term: '无主复制',
      definition:
        '没有单一主节点的复制：客户端将每次写入发送给多个副本，也从多个副本读取，由法定数量决定结果。Amazon 的 Dynamo 让这种设计广为人知，Cassandra 也采用它。它能在部分副本故障时继续写入，代价是除非 R + W > N，否则可能读到过期数据。',
      inGame:
        '“无主复制”研究（需先研究“分片”）解锁宽列存储。每个键保存在 N 个副本上（1 至 5，默认为 3），读取请求其中的 R 个，写入等待 W 个（R、W 默认均为 1）。R + W > N 时，每次读取都能看到最新写入；不足时，部分读取会返回过期数据。每次写入消耗 N 次副本操作，读取消耗 R 次，每个规格档位每秒可执行 30,000 次操作。如果“实例故障”导致一个副本不可用，需要全部副本参与的法定数量请求就会失败。',
      links: [
        { label: 'Dynamo：Amazon 的高可用键值存储' },
        { label: 'Apache Cassandra 文档：Dynamo' },
      ],
      design: [],
    },
    'leap-smearing': {
      term: '闰秒平滑',
      definition:
        '针对闰秒的校时方法：服务器把多出的一秒摊在很长的时间窗口内，常常是一整天，因此时钟只是走得稍慢一点，不会跳变。Google 和 Amazon 在自己的时钟上就是这样做的。真正有害的是跳变，因为重复的一秒会让定时器触发两次，让租约提前过期。',
      inGame:
        '闰秒或时钟偏差故障会让一个区域内的每个节点延迟 1,000 毫秒才响应，并让 10% 的响应超时，直到你重启这些节点，或 60 秒后自行结束。闰秒平滑（C 轮）是防止这种跳变发生的研究。闰秒挑战把同一事件编排为一次区域性应用服务器故障。',
      links: [{ label: 'Google：闰秒平滑' }, { label: 'Cloudflare：我们如何以及为何平滑闰秒' }],
      design: [{ label: '六种故障' }],
    },
    'littles-law': {
      term: '利特尔定律',
      definition:
        '在任何稳定系统中，系统内项目的平均数量（L）等于平均到达速率（λ）乘以每项在系统内停留的平均时间（W）：L = λW。John Little 于 1961 年证明了它，无论到达模式或处理顺序如何都成立。对服务器而言，在途请求数 = 每秒请求数 × 每个请求耗时的秒数。',
      inGame:
        '为每个请求占用一个工作进程或线程的应用服务器，拥有固定数量的槽位。每个请求占用槽位的时间包括 CPU 处理时间，以及等待所有数据库调用的时间。已用槽位 = 到达速率 × 该时间，因此当每个请求等待数据库的时间变为 10 倍时，拥有 5 个工作进程的 PHP-FPM 池能处理的请求数最多会降至十分之一。可以修复慢调用、增加工作进程或线程，或迁移到等待时不占槽位的运行时（Node.js、Go、Kestrel、BEAM、Tokio）。',
      links: [
        { label: 'Little（1961）：排队公式 L = λW 的证明' },
        { label: '维基百科：利特尔定律' },
      ],
      design: [{ label: '节点之间的延迟耦合' }],
    },
    'load-balancer': {
      term: '负载均衡器',
      definition:
        '将传入请求分散到一组后端服务器，并停止向健康检查失败的后端发送请求的服务器。它让你能在一个地址后添加多台服务器，并决定每个请求交给哪一台。',
      inGame:
        '研究负载均衡后解锁负载均衡器，每档规模每秒处理 2000 个请求，并增加 1 毫秒。默认按每台应用服务器的容量分配流量。它在下次健康检查（默认每 10 秒）时移除死掉的主机，而 DNS 轮询会继续把请求发给死主机。负载均衡算法增加最少连接和两次选择，健康检查让你可以每 2 秒或 30 秒检查一次。研究 L4 负载均衡后，节点可以切到四层：每秒 20000 个请求、0.2 毫秒的跳转和 0.6 倍的成本（价格折让为提议值），但不能按类型路由、不能重试，因为它从不读取 HTTP。',
      links: [
        { label: 'Cloudflare：什么是负载均衡？' },
        { label: 'Google SRE 书籍：数据中心内的负载均衡' },
        { label: 'NGINX：将 nginx 用作 HTTP 负载均衡器' },
      ],
      design: [],
    },
    'load-shedding': {
      term: '负载卸载',
      definition:
        '服务器过载时，有意拒绝部分请求，让保留的请求能及时完成，而不是全部超时。良好的负载卸载会在工作消耗资源之前尽早拒绝，并优先丢弃最不重要或价值最低的工作。',
      inGame:
        '完成“按优先级卸载负载”研究后，可以在应用服务器上开启负载卸载。负载超过 90% 时，它会按价值从低到高整类丢弃请求（先机器人，再实时连接，再页面浏览，依此类推），直到负载回到 90%，让价值 $25 的结账请求能在过载时幸存。被丢弃的请求计为错误，会消耗错误预算，但保留下来的请求仍然很快。',
      links: [
        { label: 'AWS 构建者文库：利用负载卸载避免过载' },
        { label: 'Google SRE 手册：处理过载' },
        { label: 'Google SRE 书籍：应对级联故障' },
      ],
      design: [{ label: '故障缓解工具箱' }],
    },
    'memory-leak': {
      term: '内存泄漏',
      definition:
        '长时间运行的进程仍保留分配、却不再使用的内存，使内存用量随运行时间增长。在使用垃圾回收的语言中，泄漏通常是对象因疏忽始终可达，例如只增不减的缓存或从未移除的监听器。进程会因使用交换空间或垃圾回收而变慢，内存耗尽时则会被操作系统终止。',
      inGame:
        '“内存泄漏”故障会影响在请求间保留进程的应用服务器运行时（除 Apache mod_php 和 PHP-FPM 外的所有运行时）。泄漏每秒增加相当于 RAM 2.5% 的内存占用；超出 RAM 后会使用交换空间并变慢，达到 RAM 的 125% 时，内核会终止进程，随后冷启动重启。重启服务器可以释放内存；也可以完成并发布“修复内存泄漏”任务（15 开发工时），在下一个功能发布前阻止泄漏。',
      links: [
        { label: '维基百科：内存泄漏' },
        { label: 'Node.js 学习：内存诊断' },
        { label: 'Oracle Java 文档：排查内存泄漏' },
      ],
      design: [{ label: '运行时行为' }],
    },
    'materialized-view': {
      term: '物化视图',
      definition:
        '把查询结果存到磁盘上并按计划刷新，让报表直接读取答案而不是扫描整表。它很快，新鲜度只到上一次刷新为止。',
      inGame:
        '研究物化视图后，数据库卡片上多出一个视图。报表扫描存储的视图，CPU 减半（10）；5% 的报表答案是陈旧的，来自上次刷新之前。它是数据仓库在数据库一侧的孪生：同样便宜的扫描，无需第二套系统。',
      links: [{ label: 'PostgreSQL 文档：物化视图' }],
      design: [{ label: '数据仓库与视图' }],
    },
    'metastable-failure': {
      term: '亚稳态故障',
      definition:
        '触发因素消失后仍能自我维持的故障。短暂变慢使系统陷入不良状态，反馈循环（最常见的是重试）让负载持续高于容量，系统因而一直不可用，直到有人削减负载。Bronson 等人于 2021 年为这类故障命名。',
      inGame:
        '“重试风暴”故障会使数据库容量降至 30%，持续 20 秒。若失败比例为 f，立即重试的链路会将每次调用放大为最多 1 + f + f² + f³ 次，并把该失败比例带入下一个模拟步；数据库会将无法处理的请求排队，只有这些积压清空后故障才结束。带抖动的退避、熔断器和按优先级卸载负载都能打破循环；相比退避，对数据库进行无脑重试会让此故障发生的可能性变为 6 倍。',
      links: [
        { label: 'Bronson 等（HotOS 2021）：分布式系统中的亚稳态故障' },
        { label: 'Huang 等（OSDI 2022）：真实环境中的亚稳态故障' },
        { label: 'Marc Brooker：亚稳态与分布式系统' },
      ],
      design: [{ label: '重试风暴' }],
    },
    mirror: {
      term: '镜像',
      definition:
        '在另一个区域运行同一份基础设施代码，例如每个区域各应用一次的 Terraform 模块，或 CloudFormation StackSet。服务器很容易复制，数据却不然：每个副本都必须决定写入去向。',
      inGame:
        '完成“基础设施即代码”研究后，区域标签旁的“镜像”按钮可以把一个区域的节点和链路复制到另一个区域。每个数据库可选择只读副本、独立主库或调用源区域；对象存储可选择复制或调用源区域。应用会立即付款，新节点在构建时间结束后以冷启动状态上线。该区域的用户只有在计划落地时才会获得链路。镜像与源区域保持关联，因此可能漂移；GitOps 会自动保持同步。',
      links: [
        { label: 'Terraform 文档：模块概览' },
        { label: 'AWS 文档：使用 CloudFormation StackSets' },
      ],
      design: [{ label: '镜像一个区域' }],
    },
    'model-inference': {
      term: '模型推理',
      definition:
        '运行已训练的机器学习模型来生成答案，与训练模型相对。对大语言模型而言，GPU 逐个生成 token，因此成本与速度用每秒 token 数和首个 token 延迟衡量。你可以租用 GPU 自行部署模型，也可以调用托管 API，按 token 付费。',
      inGame:
        '一次 ai 请求会将一个 400 token 的提示发送给推理节点。LLM API（通过“托管模型”研究解锁）无需 GPU：每 1,000 token 收费 $2.50，首个 token 延迟为 600 ms，每个用量档位每秒超过 100 个提示时就会限流。GPU 节点（通过“模型服务”研究解锁）的首个 token 延迟为 300 ms，每块 T4 每秒生成 200 token，A100 为 900，H100 为 2,000。无论繁忙还是空闲，其支出都一样，因此 H100 只有保持约三分之二的繁忙程度时，才比 LLM API 便宜。',
      links: [
        { label: 'Cloudflare：AI 推理与训练的区别' },
        { label: 'vLLM 文档' },
        { label: 'PagedAttention 论文（vLLM）' },
      ],
      design: [],
    },
    'mttd-and-mtta': {
      term: 'MTTD 与 MTTA',
      definition:
        '平均检测时间是从故障开始到出现信号的平均时长。平均确认时间是从该信号出现到有人接手故障的平均时长。Google 的 SRE 一书把这两者与 MTTR 并列统计，因为一个修复很快但发现很晚的团队，依然是慢的。',
      inGame:
        '每个故障都会记录其第一个信号出现的模拟秒数，以及玩家第一次对它采取行动的秒数，其故障复盘会在 MTTR 旁显示 MTTD 和 MTTA。启用告警时，信号就是呼叫器，在规则阈值被越过的那一步触发。没有告警时，信号就是看板，即第一次出现超过 1% 请求失败的那一秒。值班人员会在呼叫出现五个日历分钟后响应，这就是轮值所保持的 MTTA。没有值班时，玩家的第一次操作就是确认。',
      links: [{ label: 'Google SRE 书：值班' }, { label: '维基百科：平均恢复时间' }],
      design: [{ label: '故障循环' }],
    },
    mttr: {
      term: 'MTTR',
      definition:
        '平均恢复时间：从故障开始到服务恢复正常的平均时长，衡量团队发现、诊断和修复问题的速度。DORA 采用范围更窄的指标：失败部署恢复时间。',
      inGame:
        '每个故障都以一份故障复盘收尾，其中显示它的 MTTR：超过 1% 请求失败的日历分钟数。故障复盘还会显示在此之前的 MTTD 和 MTTA。配有工程师的 SRE 团队会把持续时间，也就是 MTTR，缩短 40%。若故障在进行到一半时已有超过一半的时间伤害了用户，就会升级一个严重级别，并持续 1.5 倍的时间。通过快速行动来压低 MTTR：重启、替换、排空或切换受影响的节点，并研究故障复盘中的行动项。',
      links: [{ label: '维基百科：平均恢复时间' }, { label: 'DORA：软件交付性能指标' }],
      design: [{ label: '故障循环' }],
    },
    'n1-query': {
      term: 'N+1 查询',
      definition:
        '先用一次查询加载列表，再对每个条目各执行一次查询来加载关联数据：N 个条目总共需要 N + 1 次查询。ORM 的惰性加载会导致这种问题，把额外查询藏在看似普通的代码背后。预先加载则用一两次查询一并取回关联行。',
      inGame:
        'Laravel、Rails 和 Django 使用的 ORM 会在页面浏览和 API 读取中，将本可 1 次完成的读取变成 3 次。一次页面浏览因此让数据库执行 6 次读取而非 2 次，既增加数据库 CPU 开销，也延长应用服务器的等待时间。研究“预先加载”，再完成并发布“预先加载”任务（10 开发工时），即可消除这些多余查询；Symfony 和轻量框架从一开始就不会产生它们。',
      links: [
        { label: 'Rails 指南：预先加载关联' },
        { label: 'Django 文档：select_related' },
        { label: 'Laravel 文档：预先加载' },
      ],
      design: [{ label: '框架行为' }],
    },
    'network-partition': {
      term: '网络分区',
      definition:
        '将系统划分成互相无法访问的多组节点、但各组仍继续运行的网络故障。网络分区期间，分布式系统必须在可用性和一致性之间作出选择（CAP 定理）。',
      inGame:
        '当链路跨越区域时，“网络分区”故障从 C 轮起可能发生。最长 45 秒内，所有跨区域调用都会超时，但来自用户或发往 CDN 等全局组件的调用除外；基于主节点的写入还会发生分歧。点击“隔离主节点”即可结束故障。分布式 SQL 节点维持唯一的 Raft 主节点，可以降低此故障的发生概率。',
      links: [
        { label: 'ACM Queue：网络是可靠的' },
        { label: 'InfoQ：十二年后的 CAP' },
        { label: '维基百科' },
      ],
      design: [],
    },
    'node-drain': {
      term: '节点排空',
      definition:
        '有意把服务器移出轮转：不再给它分配新工作，让它已持有的请求和任务完成，然后将其关闭或升级。负载均衡器的连接排空和 Kubernetes 的 `kubectl drain` 都是这样工作的。反过来，直接终止一台繁忙的服务器会丢掉它正在处理的一切。',
      inGame:
        '研究健康检查后，节点卡片会提供排空。它立即不再接收新流量，其份额交给路径上的其他节点，并处理完手头的请求：队列会把积压交给它的工作进程。十个模拟秒后，节点清空并重新加入轮转。排空正在遭受故障的节点，会把该故障缩短到 10 秒的排空窗口；而没有其他副本分担负载的节点，会让发往它的每个请求搁浅。',
      links: [
        { label: 'Kubernetes 文档：安全地排空节点' },
        { label: 'NGINX 文档：反向代理' },
        { label: 'AWS 文档：目标组注销延迟' },
      ],
      design: [{ label: '故障缓解工具箱' }],
    },
    'object-storage': {
      term: '对象存储',
      definition:
        '在扁平命名空间中以对象形式保存文件的存储，每个对象包含键、数据和元数据，通过 HTTP API 访问。Amazon S3 等服务几乎可以无限扩展，按存储和传输的字节数收费。它适合存放数据库不擅长处理的上传文件、图片、视频和备份。',
      inGame:
        '放置对象存储之前，数据库以行的形式存储上传文件：每个 2 MB 的 blob-put 消耗 60 ms CPU 时间。“对象存储”研究解锁对象存储，以 40 ms 延迟处理上传和文件读取，没有容量上限。其支出按 S3 Standard 价格随存储的 GB 数增长，因此用户不断上传时，账单也会持续上升。',
      links: [
        { label: 'AWS：什么是 Amazon S3？' },
        { label: 'Cloudflare：什么是对象存储？' },
        { label: '维基百科' },
      ],
      design: [],
    },
    observability: {
      term: '可观测性',
      definition:
        '通过系统输出的数据（通常是日志、指标和调用链）理解其运行状态的能力。良好的可观测性，让你无需发布新代码就能回答关于故障的新问题。',
      inGame:
        '可观测性研究让你看到更多运行账目。“结构化日志”按原因拆分错误，“指标”为每个节点增加历史图表，“百分位数”显示 p50、p95 和 p99，“告警”则会在错误、p99 或饱和度超过阈值时显示呼叫横幅。分析节点对连接给它的节点流量进行采样，采样率为 1% 至 100%，并将其转化为洞察。Apdex 越低，每个样本带来的收获越多，最多翻倍；更高采样率则消耗更多 CPU 和支出。“指标”也会解锁仪表盘（D），绘制架构随时间变化的曲线。',
      links: [
        { label: 'OpenTelemetry：可观测性入门' },
        { label: 'Google SRE 书籍：监控分布式系统' },
        { label: '维基百科' },
      ],
      design: [],
    },
    'oltp-and-olap': {
      term: 'OLTP 与 OLAP',
      definition:
        '在线事务处理（OLTP）针对当前数据行执行大量小型、快速的读写，例如订单和登录。在线分析处理（OLAP）则针对历史数据执行少量大型扫描和聚合，例如报表。OLTP 数据库按行存储；OLAP 引擎通常按列存储，因此扫描只读取所需的列。',
      inGame:
        '报表请求会发送 q-scan 查询。在数据库上，扫描消耗大量 CPU，并挤出缓冲缓存中的数据，导致其他读取访问磁盘、写入排队；“报表压垮数据库”故障会使扫描量变为 10 倍。数据仓库（通过“数据仓库技术”研究解锁）将扫描从主库移走：每次耗时 1.5 秒，没有容量上限，每次扫描收费 $0.02，再乘以当前阶段的成本指数。',
      links: [
        { label: 'AWS：OLTP 与 OLAP 的区别' },
        { label: '维基百科：在线分析处理' },
        { label: '维基百科：在线事务处理' },
      ],
      design: [{ label: '数据仓库' }],
    },
    'on-call': {
      term: '值班',
      definition:
        '一组带着呼叫器、在工作时间之外响应告警的工程师轮值，这样呼叫会找到一个具体的人，而不是碰巧在看仪表盘的人。好的轮值应当安静、有边界，并且以睡眠为代价。',
      inGame:
        '值班轮换（系列 A，需先研究告警）让团队接管呼机。轮换会在事故的第一个信号后五个日历分钟确认，因此即使玩家不在，MTTA 也很短，复盘会显示这一点。没有它，呼叫要等玩家第一次点击。每次呼叫都会计入所影响服务所属团队的工程师，并消耗他们的一点心情：一个漫长的值班季度，正是工程师提出休假、加薪或辞职的原因之一。',
      links: [{ label: 'Google SRE 书：值班' }, { label: 'PagerDuty：什么是值班轮换？' }],
      design: [{ label: '故障循环' }],
    },
    'operating-margin': {
      term: '营业利润率',
      definition:
        '营业利润占收入的比例：（收入 − 运营成本）/ 收入。运营成本包括托管、工资和手续费。它显示公司在支付运营费用后，每赚一美元能留下多少。',
      inGame:
        '游戏中的利润率为（收入 − 支出）/ 收入，其中支出包括云账单、工资、出站流量和第三方费用；没有收入时显示为 −100%。利润率加上年化用户增长率，即为“40 法则”得分，它决定估值倍数：4 + 0.15 × 40 法则得分，最低 2 倍，最高 30 倍。上市后，每季度需要设定 10%、20% 或 30% 的利润率指引，超出指引会提高估值倍数，未达指引则会降低。',
      links: [{ label: 'Investopedia：营业利润率' }, { label: '维基百科' }],
      design: [],
    },
    'percentile-p50-p95-p99': {
      term: '百分位数（p50、p95、p99）',
      definition:
        '一定比例的测量值低于的数值。p50（中位数）延迟反映典型请求的体验；p99 是 99% 的请求都能低于的延迟，即每 100 个请求中有 1 个更慢。平均值会掩盖特别慢的异常请求，因此 SLO 和告警通常使用高百分位数。',
      inGame:
        '研究“百分位数”之前，HUD 显示平均延迟；研究之后，HUD 显示 p99，各请求类型会显示 p50、p95 和 p99。事件循环阻塞和 GC 停顿影响约 2% 的请求，因此会拉高 p99，而平均值和 p95 几乎不动。完成“告警”研究后，某类请求的 p99 连续 30 秒超过其 Apdex 目标的 4 倍时（默认阈值），延迟规则就会呼叫你。仪表盘的延迟图会同时绘制 p99 和均值，让你看清平均值掩盖了多少问题。',
      links: [{ label: 'Google SRE 书籍：服务等级目标' }, { label: '维基百科：百分位数' }],
      design: [{ label: '百分位数' }],
    },
    'point-in-time-recovery': {
      term: '时间点恢复',
      definition:
        '加载基础备份，再重放预写式日志到指定时间，将数据库恢复到所选时刻的准确状态。由于日志持续归档，最多只会丢失最后几分钟的写入，而非一整天。',
      inGame:
        '“时间点恢复”研究为数据库卡片增加备份选项：无、每夜备份或 PITR。每夜快照最多可能丢失一个日历日的写入，数据库支出增加 5%；PITR 约丢失 2 个日历分钟的写入，支出增加 15%。IPO 清单的灾难恢复演练会检查此 RPO，只有低于 5 分钟才算通过，除非另一区域的副本已经覆盖这些数据。',
      links: [
        { label: 'PostgreSQL 文档：持续归档与 PITR' },
        { label: 'AWS：将 RDS 实例恢复到指定时间' },
      ],
      design: [],
    },
    'power-of-two-choices': {
      term: '随机二选一',
      definition:
        '一种负载均衡方式：随机挑选两台服务器，将请求发送给负载较低的一台。Mitzenmacher 证明，相比随机选一台，随机二选一的负载分散效果有指数级提升，而且均衡器无需精确、共享地掌握所有服务器的负载。NGINX 将此方式提供为 random two least_conn。',
      inGame:
        '完成“负载均衡算法”研究后，负载均衡器可以使用“随机二选一”。它不维护全局状态，因此负载均衡器自身可处理 1.5 倍流量，但其中 10% 的流量会无视各服务器的负载而平均分配。“最少连接”完全按当前容量分配，却没有容量加成。',
      links: [
        { label: 'Mitzenmacher（2001）：随机负载均衡中二选一的力量' },
        { label: 'NGINX 文档：upstream 模块（random）' },
      ],
      design: [{ label: '负载均衡器策略' }],
    },
    'pre-fork-worker-model': {
      term: '预派生工作进程模型',
      definition:
        '一种服务器设计：主进程预先启动固定数量的工作进程，每个工作进程一次处理一个请求。Apache prefork、PHP-FPM 和 Gunicorn 都采用此方式。它能很好地隔离请求，但每个工作进程都占内存，等待中的请求也会一直占用工作进程。',
      inGame:
        'PHP-FPM 和 Python 的 Gunicorn 运行一组工作进程，可在应用服务器卡片上设为 1 至 400 个；PHP-FPM 初始为 5 个。每个进程处理一个请求，因此慢数据库调用会占满进程池。每个进程都消耗 RAM（Gunicorn 为 120 MB），所以池太大会开始使用交换空间。PHP-FPM 的“静态”模式让整个池常驻内存；“动态”和“按需”模式节省内存，但会让 2% 或 10% 的请求分别等待 20 或 50 ms 来创建进程。',
      links: [
        { label: 'Gunicorn 文档：设计' },
        { label: 'Apache HTTP Server：prefork MPM' },
        { label: 'PHP 手册：FPM 配置' },
      ],
      design: [],
    },
    'process-per-request': {
      term: '每请求独占进程',
      definition:
        '一种服务器模型：每个在途请求在完成前独占一个工作进程，例如带 mod_php 的 Apache prefork、PHP-FPM，以及 Gunicorn 的同步工作进程。它能很好地隔离请求，但每个等待中的请求都会占住进程及其内存，因此进程池大小和 RAM 限制了同时运行的请求数。',
      inGame:
        '初始运行时 Apache mod_php 为每个在途请求运行一个进程，最多 150 个；由于内嵌 PHP，每个进程占用 60 MB，RAM 很快就会耗尽。PHP-FPM 和 Gunicorn 运行由你设定大小的固定进程池（PHP-FPM 初始为 5 个工作进程）；请求等待数据库时仍占用进程，池超出机器承受能力时会使用交换空间，直到被内核终止。每个进程还有自己的数据库连接，因此大进程池也可能触及 Postgres 的 100 连接上限。',
      links: [
        { label: 'Apache HTTP Server：MPM prefork' },
        { label: 'PHP 手册：FastCGI 进程管理器（FPM）' },
        { label: 'Gunicorn 文档：设计' },
      ],
      design: [{ label: '并发模型' }],
    },
    quantization: {
      term: '量化',
      definition:
        '用更低的精度存储模型权重，例如用 8 位或 4 位整数代替 16 位浮点，从而占用更少内存、计算更快，代价是回答质量的损失。',
      inGame:
        '研究量化后，GPU 节点可以用 FP16、INT8 和 INT4。INT8 的令牌吞吐为 2 倍，INT4 为 3 倍，每个回答的价值降低 5% 或 15%。当瓶颈在 GPU、而回答可以稍微差一点时，它就划算。',
      links: [{ label: 'Hugging Face 文档：量化' }],
      design: [{ label: 'GPU 节点与精度' }],
    },
    quorum: {
      term: 'Quorum',
      definition:
        '读或写要算完成，必须有多少个副本作出响应。在 N 个副本、读法定人数 R、写法定人数 W 的情况下，R + W > N 意味着每次读取都至少会询问一个拥有最新写入的副本。这并不等于线性一致性，因为并发写入、失败的写入和宽松法定人数仍可能返回旧值。',
      inGame:
        '宽列存储把每个键保存在 N 个副本上（1 到 5 个），你可以设置 R（读取询问的副本数）和 W（写入等待的副本数）。当 R + W > N 时，读取不会错过最新的写入。较弱的法定人数需要的副本操作更少，也更早得到答复，但有些读取会返回过期数据。要求所有副本参与的法定人数，会在丢失一个副本期间失败。即使是强法定人数，也会有 2% 的过期结账和 1% 的重复结账。',
      links: [
        { label: 'Apache Cassandra 文档：可调一致性' },
        { label: 'DeCandia 等（2007）：Dynamo' },
        { label: '维基百科：法定数量（分布式计算）' },
      ],
      design: [{ label: '宽列存储' }],
    },
    raft: {
      term: 'Raft',
      definition:
        '让一组服务器上的复制日志始终一致的共识算法。选出的主节点追加每个条目，多数节点存储后才提交，因此少数节点故障时仍能工作，也绝不会提交两个不同的值。Ongaro 和 Ousterhout 于 2014 年设计它，希望使其比 Paxos 更容易理解；etcd 和 CockroachDB 都使用它。',
      inGame:
        '分布式 SQL（通过“共识数据库”研究解锁，前置为“同步复制”）基于 Raft 运行 SQL。每次写入都等待所分布区域中多数区域的往返响应，读取则询问租约持有者，成本为写入的四分之一。规格 1 时每秒处理 6,000 个事务，并在网络分区期间保持唯一主节点，因此使用它会让该故障的发生概率降至四分之一。',
      links: [
        { label: 'Raft 共识算法' },
        { label: 'Ongaro 和 Ousterhout（2014）：寻找一种易于理解的共识算法' },
        { label: 'CockroachDB 文档：复制层' },
      ],
      design: [{ label: '分布式 SQL' }],
    },
    'rate-limiting': {
      term: '限流',
      definition:
        '限制客户端在一段时间内可发起的请求数，并拒绝超出的请求，通常返回 HTTP 429“请求过多”。它保护服务免受滥用、爬虫和单个高负载客户端的影响，也让服务商公平分配容量。常见算法包括令牌桶、漏桶，以及固定窗口或滑动窗口。',
      inGame:
        'LLM API 在客户端一侧限流：每个用量层级每秒 100 条提示，超过后提示立即以 throttled 失败。API 网关把同样的限制用在自己的服务上：选一个每秒请求上限，超出的请求以 throttled 失败，整个节点一个上限，而不是每个用户或每个 API 密钥一个桶。研究限流后，上限变成令牌桶：每一步回填，并额外容纳 200 个请求，因此装得下的突发整体通过。要挡住滥用流量，WAF 仍按规则拦截机器人：偏执等级 2 时拦截 80% 的机器人，同时误伤 0.5% 的真实用户。',
      links: [
        { label: 'Cloudflare 学习中心：什么是限流？' },
        { label: 'MDN：429 请求过多' },
        { label: 'RFC 6585：补充 HTTP 状态码' },
      ],
      design: [{ label: 'API 网关' }],
    },
    'read-replica': {
      term: '只读副本',
      definition:
        '跟随主库写入、回答只读查询的数据库副本。它能减轻主库的读取负载。复制通常是异步的，因此副本可能落后，返回稍旧的数据。',
      inGame:
        '“只读副本”研究解锁只读副本节点，其运行方式类似数据库，但只回答 q-read。复制延迟为 20 ms 加上每秒每次写入带来的 2 ms，最多有 15% 的读取返回过期数据；“复制延迟”故障会将延迟放大 10 倍。“读己之写路由”将写入后的读取发往主库。另一区域的副本还能在本土区域故障时限制数据丢失量。',
      links: [{ label: 'AWS：Amazon RDS 只读副本' }, { label: 'PostgreSQL 文档：热备' }],
      design: [],
    },
    'read-your-writes-consistency': {
      term: '读己之写一致性',
      definition:
        '一种会话保证：客户端写入后，自己后续的读取能看到该次写入或更新的值，即使其他客户端仍看到旧数据。当读取发往落后于主库的副本时，这一点尤其重要；常见的解决方式是让用户写入后的一小段时间内，读取都发往主库。Terry 等人于 1994 年定义了它。',
      inGame:
        '只读副本落后于主库，因此部分读取会返回过期数据，导致 API 读取或需要读取自身写入结果的结账请求失败。研究“读己之写路由”后，在应用服务器上开启该选项：结账读取会发往主库，永不过期，其他过期读取则减少 80%。它还会大幅降低“复制延迟”故障的频率（权重从 2 降至 0.3）。',
      links: [
        { label: 'Jepsen：读己之写' },
        { label: 'Terry 等（1994）：弱一致性复制数据的会话保证' },
      ],
      design: [{ label: '只读副本' }],
    },
    'red-method': {
      term: 'RED 方法',
      definition:
        '各服务的请求速率（Rate）、错误（Errors）和耗时（Duration）：接收多少请求、多少失败，以及耗时多久。它衡量用户的实际感受，因此告警会监测它。Tom Wilkie 为它命名，将其作为 Google 四大黄金信号的服务级版本。',
      inGame:
        '完成“指标”研究后可打开仪表盘（D）。“黄金信号”一行绘制整个系统的流量、延迟随时间变化的曲线，研究“结构化日志”后还会显示错误。目前尚未提供按服务划分的 RED 行；请用黄金信号一行查看用户从何时开始受到影响。',
      links: [{ label: 'Grafana Labs：RED 方法' }, { label: 'Google SRE 书籍：监控分布式系统' }],
      design: [{ label: '仪表盘行与图表' }],
    },
    'redos-regular-expression-denial-of-service': {
      term: 'ReDoS（正则表达式拒绝服务）',
      definition:
        '精心构造的输入使回溯型正则表达式引擎耗费指数级或极长时间的拒绝服务攻击。一个糟糕的模式就能让每个请求占满一个 CPU 核心。',
      inGame:
        '运行 WAF 时，“正则回溯”故障从 B 轮起可能发生。一条新 WAF 规则会在长输入上大量回溯，使每个 WAF 的容量只剩 10%，通过它的流量会失败或排队。点击 WAF 上的“禁用规则”，即可立即结束故障。在真实系统中，对规则进行金丝雀发布，可以在问题蔓延到所有服务器之前将其发现。',
      links: [
        { label: 'OWASP：正则表达式拒绝服务' },
        { label: 'Cloudflare 博客：2019 年 7 月 2 日故障详情' },
        { label: '维基百科' },
      ],
      design: [],
    },
    'replication-lag': {
      term: '复制滞后',
      definition:
        '写入在主数据库提交后，到该次写入出现在副本上的延迟。异步副本事后才应用主库日志，因此写入量、副本上的长查询和网络延迟都会增加复制延迟。从落后的副本读取会返回旧数据。',
      inGame:
        '只读副本的延迟为 20 ms 加上每秒每次写入带来的 2 ms，其过期读取比例等于以秒计的延迟，最高 15%。“复制延迟”故障会将延迟放大 10 倍，过期读取最高达 50%。过期读取会使 API 读取和结账失败，而页面浏览可以接受；“读己之写路由”会将介意过期数据的读取发往主库。',
      links: [{ label: 'PostgreSQL 文档：热备' }, { label: 'Amazon RDS 文档：使用只读副本' }],
      design: [{ label: '只读副本' }],
    },
    'retry-with-backoff-and-jitter': {
      term: '带退避和抖动的重试',
      definition:
        '失败调用在等待一段时间后重试，每次等待时间递增（指数退避），并加入随机偏移（抖动），让同时失败的客户端不会同时重试。重试预算或次数上限限制重试带来的额外调用，避免重试成倍放大本已不堪重负的服务负载。',
      inGame:
        '研究“超时与重试”之前，每条链路等待 30 秒，且永不重试。研究之后，可将各链路超时设为 1、5 或 30 秒，并开启重试：朴素重试会立即执行，最多三次，因此失败比例为 f 的被调用方，每次调用会收到 1 + f + f² + f³ 次调用。带抖动的退避每次重试等待约 200 ms，额外调用最多增加 10%，因此能让重试风暴保持较小规模。',
      links: [
        { label: 'AWS 构建者文库：超时、重试与带抖动的退避' },
        { label: 'AWS 架构博客：指数退避与抖动' },
        { label: 'Google SRE 书籍：应对级联故障' },
      ],
      design: [{ label: '重试' }],
    },
    'rpo-and-rto': {
      term: 'RPO 与 RTO',
      definition:
        '恢复点目标（RPO）是灾难中最多可以承受丢失多长时间内的数据，以故障发生前的时间长度计。恢复时间目标（RTO）是服务恢复正常前，最多可以接受的停机时长。两者共同决定系统需要多少备份、复制和备用容量。',
      inGame:
        '数据库的备份方式决定 RPO：无备份会丢失全部数据，每夜备份最多丢失 1,440 个日历分钟，PITR（需“时间点恢复”研究）丢失 2 分钟。另一区域的只读副本将其降至该副本的复制延迟；分散部署的宽列存储或分布式 SQL 则不会丢失数据。IPO 清单的灾难恢复演练会使本土区域故障，只有错误率在 60 个日历分钟内降至 1% 以下（RTO），且 RPO 低于 5 分钟，才算通过。',
      links: [
        { label: 'AWS 白皮书：工作负载的灾难恢复（RPO 与 RTO）' },
        { label: 'PostgreSQL 文档：持续归档与时间点恢复' },
      ],
      design: [{ label: '多区域数据' }, { label: 'IPO 清单与灾备演练' }],
    },
    'rule-of-40': {
      term: '40 法则',
      definition:
        '面向软件即服务公司的经验法则：年收入增长率加利润率（均以百分比计）应至少达到 40。它用一个数字，让你可以比较高速增长但亏损的公司与增长缓慢但盈利的公司。得分超过 40 的公司通常能获得投资者更高的估值倍数。',
      inGame:
        '估值等于年收入乘以由“40 法则”得分得出的倍数：4 + 0.15 × 得分，限制在 2 至 30 之间，负分按 0 计。游戏使用最近一个日历周的用户增长率进行年化，再加上利润率，即（收入 − 支出）/ 收入。得分达到 40 是 IPO 清单中的一项，因此上市前要削减支出，或加快增长。',
      links: [{ label: '维基百科：40 法则' }, { label: 'McKinsey：SaaS 与 40 法则' }],
      design: [{ label: '估值' }],
    },
    runbook: {
      term: '运行手册',
      definition:
        '一份简短且经过测试的文档，说明某个具体告警触发时该怎么做：运行哪些检查、执行哪条命令、何时升级。系统能自行执行的操作手册就是自动化；凌晨 3 点由人阅读的操作手册，依然值得编写。',
      inGame:
        '操作手册（A 轮，值班之后）和配有工程师的 SRE 团队会解锁编写操作手册，花费 10 开发工时，针对团队已经手动处理过的一类故障。写好之后，这类故障会在第一步自行解决：复盘会把它记录为自动处理，就像集群重新调度 Pod 或备用节点接管一样，操作手册成就读取的正是这份记录。',
      links: [{ label: 'Google SRE 书：复盘文化' }, { label: 'PagerDuty：什么是操作手册？' }],
      design: [{ label: '操作手册' }],
    },
    service: {
      term: '服务',
      definition:
        '拥有独立部署流水线、由一个团队负责的代码库。把单体拆分为服务，可以让每个团队各自发布和扩展，代价是服务之间多了一次网络跳转，以及可能在服务间蔓延的故障。',
      inGame:
        '公司从一个服务，也就是单体开始，所有没有被其他服务点名的功能都留在其中。服务边界研究（B 轮）会把在用的功能拆分到一个有名称和所属团队的新服务中，花费被迁移那部分代码库的 0.3 倍开发工时。负责人会建立该服务的待办列表，并在它出问题时被呼叫，部署出错只会让发布它的服务失败。两个服务共用一个数据库，会让协调惩罚再增加一半，因此 k 乘以 1.5，直到某个服务点名了自己的数据库节点。',
      links: [
        { label: 'Martin Fowler：MonolithFirst' },
        { label: 'Martin Fowler：微服务' },
        { label: 'microservices.io：单体架构' },
      ],
      design: [{ label: '服务' }],
    },
    sharding: {
      term: '分片',
      definition:
        '按照键（例如用户 ID 的哈希）将一个数据集拆分到多个数据库（分片），让每个分片只存储和处理部分数据。它能将写入和存储扩展到单机之外，但跨分片查询必须询问所有分片，一个热键也可能压垮自己的分片，而其他分片仍闲着。',
      inGame:
        '分片研究会按键把数据库拆成 1、2、4 或 8 个分片，并解锁无主复制。每个分片都是另一台机器，按一台机器计费，写入会在它们之间分摊，因此两个分片能应对两倍的写入。读取只会询问持有其键的那一个分片，这就是为什么要靠只读副本来分担主库的读取。跨分片的事务延迟是原来的三倍。你可以在卡片上选择分片键（哈希、范围、租户或区域）。更改分片数量属于重新分片，每个 GB 的数据库数据都会消耗开发工时和日历时间。热点键故障发生在缓存或宽列存储上，其中 30% 的读取请求访问同一个键，因此该节点的容量会降到约 1 / (0.3 × 规格档位 + 0.7)。使用混合扇出可以拆分这些键。',
      links: [
        { label: '维基百科：分片（数据库架构）' },
        { label: 'MongoDB 文档：分片' },
        { label: 'AWS：什么是数据库分片？' },
      ],
      design: [{ label: '分区' }],
    },
    'shared-nothing': {
      term: '无共享架构',
      definition:
        '节点或请求不共享内存、磁盘，只通过网络协调的架构，因此各自可以独立故障、重启或扩缩容。Michael Stonebraker 于 1986 年主张将其用于数据库。PHP 将此理念应用于每个请求：每次请求都从干净的进程状态开始，结束后释放所有资源。',
      inGame:
        'Apache mod_php 和 PHP-FPM 采用无共享模式：每次请求后释放全部内存，因此“内存泄漏”故障永远不会选中它们。其他所有运行时都会跨请求保留进程，省去了每次请求的初始化，却也可能泄漏内存。代价是速度：PHP 的 CPU 处理速度是 Go 的 0.15 倍，使用 OPcache 后为 0.375 倍。',
      links: [
        { label: 'Stonebraker（1986）：支持无共享架构的理由' },
        { label: '维基百科：无共享架构' },
      ],
      design: [{ label: '运行时行为' }],
    },
    'slo-sla-sli': {
      term: 'SLO、SLA、SLI',
      definition:
        '服务等级指标（SLI）是对服务行为的测量，例如请求成功的比例。服务等级目标（SLO）是在一个时间窗口内对 SLI 设定的目标，例如 30 天内达到 99.9%。服务等级协议（SLA）是与客户签订的合同，规定未达到承诺服务等级时的后果，例如提供服务抵扣额度；其要求通常比内部 SLO 宽松。',
      inGame:
        'SLI 是可用性：过去一个日历周内得到响应的用户请求占比，不计机器人和 WAF 拦截。每个阶段都设有 SLO，从车库创业的 99% 到已上市的 99.99%，从 A 轮起，它允许的失败就是你的错误预算。SLO 仪表盘会把该预算放到 HUD 上，IPO 清单要求达到 99.95%。B2B SaaS 从 B 轮起签订 SLA，比所处阶段的目标高一档。只要某一周低于该水平，企业销售就会向客户返还赔偿金：订阅收入的 10%。',
      links: [
        { label: 'Google SRE 书籍：服务等级目标' },
        { label: 'Google SRE 工作手册：实施 SLO' },
        { label: 'Google Cloud 博客：SLI、SLA 与 SLO' },
      ],
      design: [{ label: 'SLO 与错误预算' }],
    },
    'soc-2': {
      term: 'SOC 2',
      definition:
        'AICPA 制定的审计框架。独立审计师就服务组织在安全性、可用性、处理完整性、保密性和隐私方面的控制措施出具报告。企业客户通常会要求提供 SOC 2 报告。',
      inGame:
        'SOC 2 是上市前 IPO 清单中的一项。你需要“SOC 2 计划”研究，其前置条件为“全链路 TLS”“静态数据加密”和“依赖扫描”，还需要一支至少有一名工程师的安全团队。没有它时，“审计发现问题”故障可能重置已通过的灾难恢复演练。',
      links: [{ label: 'AICPA：系统与组织控制' }, { label: '维基百科' }],
      design: [],
    },
    'spot-instance': {
      term: '竞价实例',
      definition:
        '以大幅折扣出售的闲置云容量，最低可比按需价格便宜 90%，但服务商需要时可以随时收回。AWS 会提前两分钟通知中断。竞价实例适合无状态、可容错的工作，例如批处理任务，或放在负载均衡器后且有备用容量的服务器，不适合单个数据库。',
      inGame:
        '竞价定价让节点按按需价格的 0.3× 运行，而云厂商可以收回它：竞价回收故障会先预警 10 个模拟秒，然后让节点下线。在预警期内把节点切换为按需即可取消回收。预留节点价格为 0.6×，并锁定一个日历周。GPU 短缺故障是另一回事：云厂商会收回 GPU 节点，先收 H100，使用 LLM API 作为备用可让它的发生概率降到四分之一。',
      links: [
        { label: 'AWS EC2 文档：竞价实例' },
        { label: 'AWS EC2 文档：竞价实例中断通知' },
        { label: 'Google Cloud 文档：竞价虚拟机' },
      ],
      design: [{ label: '定价模型' }],
    },
    'strangler-pattern': {
      term: '绞杀者模式',
      definition:
        '逐步替换旧系统：在前方放置路由层，将越来越多的流量或功能交给新系统，等不再有人使用旧系统时将其退役。Martin Fowler 以绞杀榕命名这种方式：藤蔓环绕树木生长，最终将其取代。它避免了高风险的一次性全面重写。',
      inGame:
        '在公司中更改服务的技术栈，会开始一次同时运行新旧版本的迁移，分四步将应用服务器流量切至新栈：5%、25%、50%，最后 100%。每一步消耗迁移开发工时的相应份额（10%、20%、30%、40%）。完成并发布“修复迁移缺陷”之前，新技术栈上的请求有 3% 会失败。迁移中的服务，其功能开发速度减半。',
      links: [
        { label: 'Martin Fowler：绞杀榕' },
        { label: 'Azure 架构中心：绞杀榕模式' },
        { label: 'AWS 实践指南：绞杀榕模式' },
      ],
      design: [{ label: '迁移' }],
    },
    'synchronous-replication': {
      term: '同步复制',
      definition:
        '主库必须等至少一个副本也存储了写入后，才确认写入的复制方式。主库故障时，不会丢失任何已确认的写入，但每次写入都要等待与副本之间的往返通信。',
      inGame:
        '同步复制研究为每个只读副本增加一个开关：开启后每次写入都要等待该副本，因此副本不会滞后，每次写入也要付出它的往返时间。它还会解锁共识数据库。分布式 SQL 每次写入都要等待多数副本，因此跨区域写入要付出往返时间。带有备用节点的数据库在所在可用区故障时也会在几秒内切换。',
      links: [
        { label: 'PostgreSQL 文档：日志传送备用服务器（同步复制）' },
        { label: 'PostgreSQL 文档：复制设置' },
        { label: '维基百科：复制（计算）' },
      ],
      design: [],
    },
    'tail-at-scale': {
      term: '大规模系统的尾延迟',
      definition:
        '一个请求扇出到许多服务器或等待多个响应时，最慢的响应决定其延迟，因此在每台服务器上罕见的延迟，对整个请求却会变得常见。若 100 台服务器各有 1% 的概率变慢，63% 的请求会遇到至少一个慢响应。Dean 和 Barroso 于 2013 年描述了此现象，并提出对冲请求等解决办法。',
      inGame:
        '一个请求会汇集路径上各节点的尾延迟事件：两个独立概率 a 和 b 合并为 1 − (1 − a)(1 − b)，因此一长串偶尔停顿的节点，其 p99 会比其中任何单个节点都差。宽列存储的读取要等待 N 个副本中第 R 快的那个；R = N 时，就得等最慢的副本。“百分位数”研究会显示体现此现象的 p99。',
      links: [
        { label: 'Dean 和 Barroso（2013）：大规模系统中的尾延迟' },
        { label: '大规模系统中的尾延迟（PDF）' },
        { label: 'Communications of the ACM：大规模系统中的尾延迟' },
      ],
      design: [{ label: '百分位数' }],
    },
    'tech-debt': {
      term: '技术债',
      definition:
        '代码中的捷径和过时设计，让后续每次变更更慢或风险更高，就像贷款利息，直到团队通过重构偿还债务。Ward Cunningham 于 1992 年提出此比喻。有些债务是为尽早交付而有意作出的取舍；其成本体现在给以后每次变更新增的工作量上。',
      inGame:
        '每个服务都有技术债百分比。每发布一个功能，“快速推进”策略下增加 6 个百分点，“平衡”为 3 点，“质量优先”为 1 点；不使用框架额外增加 1 点，故障期间发布的任务再增加 2 点。技术债最多让开发速度减半，将错误部署概率提高到 3 倍，也让所有故障更容易发生。“重构”任务（10 开发工时）可消除 20 点技术债，“质量优先”策略也会自行偿还一部分。',
      links: [{ label: 'Martin Fowler：技术债' }, { label: '维基百科：技术债' }],
      design: [{ label: '技术债' }],
    },
    'thread-pool': {
      term: '线程池',
      definition:
        '一组固定数量的线程，从共享队列中领取工作，让程序无需为每个任务创建新线程。在每请求独占线程的服务器中，池大小限制并发请求数，而等待 I/O 的请求仍会占住线程。',
      inGame:
        'Java 的 Tomcat 在一个 JVM 中运行 200 个线程，Ruby 的 Puma 每进程运行 5 个线程：每个等待中的请求都占住线程，因此慢数据库调用可以填满线程池。对 Node.js 而言，“libuv 线程池”研究会将 password 哈希计算移出事件循环，让登录不再拖住其他请求。Rust 的 Tokio 在线程池上运行异步任务，CPU 密集型任务只会阻塞其中一个工作线程。',
      links: [
        { label: '维基百科' },
        { label: 'Node.js：不要阻塞事件循环（或工作线程池）' },
        { label: 'Apache Tomcat：执行器（线程池）' },
      ],
      design: [],
    },
    'thundering-herd': {
      term: '惊群',
      definition:
        '许多客户端或进程同时唤醒并行动，例如在重启、缓存过期或共享定时器触发后，它们叠加的负载会压垮共享资源。解决方法是将群体打散：加入抖动、合并请求，以及错开重启时间。',
      inGame:
        '“缓存击穿”故障会让缓存空着重启，所有未命中请求同时访问数据库；数据库负载达到或超过 90% 时，回填超时，缓存持续处于冷状态。“缓存击穿保护”让冷缓存只向下游发送额外未命中请求的 25%，其余请求等待同一次获取；“缓存预热”让缓存恢复到 80% 的预热程度。朴素重试也是惊群：所有调用方立即重试，而带抖动的退避会将它们错开。',
      links: [{ label: '维基百科：惊群问题' }, { label: 'AWS 架构博客：指数退避与抖动' }],
      design: [{ label: '实时中枢重连' }],
    },
    'tiered-caching': {
      term: '分层缓存',
      definition:
        '一种 CDN 架构：边缘节点先询问数量较少的区域缓存或上层缓存，再访问源站。各边缘节点共享上层缓存已有的内容，从而提高命中率，减少到达源站的请求。',
      inGame:
        '“分层缓存”研究（需先研究“内容分发”）让 CDN 边缘节点先询问区域层，再访问你的源站。在默认 TTL 下，CDN 回答的媒体请求比例从 75% 提高到 92%。CDN 回答的视频请求不会增加应用服务器负载，并按更便宜的边缘出站流量价格计费。',
      links: [{ label: 'Cloudflare 文档：分层缓存' }, { label: 'AWS：CloudFront 源站保护' }],
      design: [],
    },
    timeout: {
      term: '超时',
      definition:
        '调用方在放弃前等待响应的最长时间。超时会释放调用方的线程或连接，让慢依赖无法永远占住资源；但设得太短，也会让本来能成功的调用失败。',
      inGame:
        '每条链路等待响应 30 秒。研究“超时与重试”后，可将各链路超时设为 1、5 或 30 秒。调用方只在超时前占用槽位，因此较短的超时能防止慢数据库占满应用服务器的所有槽位，超过时限的调用则以超时失败。拥有“幂等键”之前，超时后重试的扣款可能重复收费。',
      links: [
        { label: 'AWS 构建者文库：超时、重试与带抖动的退避' },
        { label: 'Google SRE 书籍：应对级联故障' },
      ],
      design: [],
    },
    'tls-certificate': {
      term: 'TLS 证书',
      definition:
        "由证书颁发机构签发、将域名与公钥绑定的签名文件。浏览器在建立 HTTPS 连接前会检查它，证书过期后则拒绝访问网站。证书有效期较短，因此团队会使用 ACME 和 Let's Encrypt 等方式自动续期。",
      inGame:
        '证书自动化研究解锁“密钥与证书”。每个终止 TLS 的节点（负载均衡器、CDN、WAF、API 网关、实时枢纽、边缘函数）都持有自己的证书。管理器运行时会在第一步为每个节点签发证书，并在其生命周期的三分之二处续期：90 个日历日，C 轮起为 45 天。没有管理器时，证书会逐个过期：经过证书已过期节点的每个请求都以 down 失败，并触发“证书过期”故障，直到管理器重新运行或玩家点击续期。',
      links: [
        { label: 'Cloudflare 学习中心：什么是 SSL 证书？' },
        { label: "Let's Encrypt：将证书有效期缩短至 45 天" },
        { label: "Let's Encrypt：常见问题" },
      ],
      design: [],
    },
    'token-bucket': {
      term: '令牌桶',
      definition:
        '一种限流算法。桶最多容纳 B 个令牌，并以固定速率 r 补充；每次请求消耗一个令牌，桶空时，请求必须等待或被拒绝。它允许最多 B 个请求的短暂突发，同时将长期平均速率保持在 r。',
      inGame:
        '突发型实例运行在 CPU 积分的令牌桶上。突发型节点在使用低于其 vCPU 20% 时赚取积分，每个 vCPU 最多存 100 核心秒，并在超过基线时消耗它们。桶空时降到 20% CPU，所以整天高负载的突发型机器会卡住；作为交换，它只花通用型的 0.4 倍。API 网关的限流研究给它同样的桶：在上限之上多 200 个请求的突发额度。',
      links: [{ label: '维基百科：令牌桶' }, { label: 'AWS EC2 文档：突发性能实例的关键概念' }],
      design: [{ label: 'API 网关' }],
    },
    'transactional-outbox': {
      term: '事务发件箱',
      definition:
        '一种同时更新数据库并发布事件、且不会丢失任何一方的方式。服务在同一个数据库事务中写入变更和一条发件箱记录，再由独立中继读取发件箱，将每个事件至少一次发布到消息代理。它避免了双写问题：数据库提交成功但发布失败，或反过来。',
      inGame:
        '在研究事务发件箱之前，从 B 轮起应用的双写偶尔会丢失：0.5% 的搜索引擎答案是陈旧的，因为发布从未落地。研究事务发件箱可以把这份比例降到零，CDC 连接器也一样，它改为从数据库日志读取变更。两者都不改变队列：接入队列的应用服务器把慢请求的异步部分交给工作进程，用户只等入队完成。',
      links: [
        { label: 'microservices.io：事务发件箱' },
        { label: 'AWS 实践指南：事务发件箱模式' },
        { label: 'Debezium 文档：发件箱事件路由器' },
      ],
      design: [{ label: '保持副本同步' }],
    },
    'use-method': {
      term: 'USE 方法',
      definition:
        'CPU、内存或连接池等各资源的利用率（Utilization）、饱和度（Saturation）和错误（Errors）。它测量原因而非症状：资源占用达到 100% 且工作仍在等待时，它很可能就是瓶颈。Brendan Gregg 将其描述为性能分析检查清单。',
      inGame:
        '仪表盘的“饱和度”一行以条形仪表、状态时间线和表格显示各节点的利用率，让你看清哪个节点最先占满。完整的逐资源 USE 行目前尚未实现。画布上，各节点卡片的负载条会显示同一利用率的当前值。',
      links: [{ label: 'Brendan Gregg：USE 方法' }],
      design: [{ label: '仪表盘行与图表' }],
    },
    utilization: {
      term: '利用率',
      definition:
        '一段时间内资源容量的使用比例：待处理工作量除以容量。利用率接近 100% 时，排队延迟会急剧增加：在简单的 M/M/1 队列中，等待时间正比于 ρ / (1 − ρ)，因此繁忙程度从 50% 提高到 90%，等待时间会变为 9 倍。',
      inGame:
        '每个节点都显示其利用率：待处理工作量除以最紧张资源的容量，无论该资源是 CPU、槽位、内存、连接还是网络。排队延迟按 ρ / (1 − ρ) 增长，节点在 70% 时警告，90% 时显示危险，超过 100% 则丢弃超出部分。瓶颈搜索只对超过 60% 的节点进行权衡，自动扩缩容器则以 40%、60% 或 80% 为目标。仪表盘的“饱和度”一行以仪表和 24 小时时间线显示各节点，并标出相同的 70% 和 90% 阈值。',
      links: [{ label: 'Brendan Gregg：USE 方法' }, { label: '维基百科：M/M/1 队列' }],
      design: [{ label: '容量、利用率与队列' }],
    },
    'vertical-and-horizontal-scaling': {
      term: '纵向与横向扩容',
      definition:
        '纵向扩容将工作负载迁移到拥有更多 CPU 和内存的更大机器。横向扩容则增加机器，将工作分摊给它们。纵向扩容简单，但有上限，通常还需要重启；横向扩容需要负载均衡器和无状态服务器，但没有硬性上限，也能承受单台机器故障。',
      inGame:
        '调整有规格节点的尺寸会让它在一档之间移动，从 nano（0.5 vCPU）到 metal（96 vCPU），每档翻倍 vCPU 和内存，但节点会重启并回到冷态。有些软件用不上多余的核心：Node.js 在一个核心上跑一个事件循环，Redis 用一个线程回答。要横向扩展，可以把更多应用服务器放在 DNS 或负载均衡器后面，每份副本的放置价格高 25%；或者让自动扩缩器增加副本，在虚拟机上需要 180 秒，在 Kubernetes 集群中需要 30 秒。实例族也很重要：研究 ARM 实例后增加一个与通用型同样 vCPU 和内存、价格为 0.8 倍的族，其 CPU 速度为 0.95 倍（提议值）。',
      links: [
        { label: 'Azure 架构中心：为横向扩容而设计' },
        { label: '维基百科：可扩展性（横向与纵向）' },
      ],
      design: [{ label: '纵向与横向' }],
    },
    'waf-web-application-firewall': {
      term: 'WAF（Web 应用防火墙）',
      definition:
        '放在 Web 应用前方的过滤器，检查 HTTP 请求，拦截符合攻击或机器人规则的请求。更严格的规则集能捕获更多攻击，也会错误拦截更多真实用户（误报）。',
      inGame:
        '研究 Web 应用防火墙后解锁 WAF 组件。它按偏执等级拦截一部分机器人请求，也误伤一部分真实用户：等级 1 拦截 60% 的机器人和 0.1% 的用户，等级 2（默认）80% 和 0.5%，等级 3 92% 和 2%，等级 4 98% 和 6%。等级越高，每个请求的 CPU 成本越高，最多为等级 1 的 4 倍。研究机器人管理后，对可疑客户端发起挑战而不是直接拦截，误伤率减半（提议值），拦截率不变。Under attack 模式拦截 99% 的机器人和 1% 的用户，并增加 40 毫秒。',
      links: [
        { label: 'Cloudflare 学习中心：什么是 WAF？' },
        { label: 'OWASP CRS：严格级别' },
        { label: 'OWASP：Web 应用防火墙' },
      ],
      design: [],
    },
    'write-through-cache': {
      term: '直写缓存',
      definition:
        '一种缓存策略：每次写入同时进入缓存和数据库，因此缓存始终保存经它写入的各键的最新值。这些键的读取命中率更高，且不会过期，但每次写入更慢，缓存也可能填满从未被读取的数据。常见替代方案是旁路缓存和异步回写。',
      inGame:
        '启用缓存策略研究后，直写是缓存的策略之一：写入会同时进入缓存和数据库，因此缓存永远不会为经由它写入的键返回过期命中，每次写入多花半毫秒。旁路缓存在写入时使键失效，所以命中率下降为写入占比的两倍，最多降一半。两次失效之间，部分命中是过期的，随着 TTL 从 10 秒增加到 1 小时，每单位写入占比为 0.5% 到 10%。',
      links: [{ label: 'Amazon ElastiCache 文档：缓存策略' }, { label: '维基百科：缓存写入策略' }],
      design: [{ label: '缓存策略' }],
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
    'night-shift': { name: '夜班', effect: '离线上限为 12、18、24 小时' },
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
