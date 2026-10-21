# Changelog

本项目（codearts2api）的变更记录，**新的在最前面**。

条目组织方式与上游升级流程见 [README 的「变更记录与升级」](README.md#变更记录与升级)。

---

<details open>
<summary><b>2026-10-21 · 上游升级 <code>ec2667f</code>（gitee master，CodeArts 上下文窗口改正）</b></summary>

## 上游升级

依赖从 `6b437fdb1062aac9225800210d56a1437538f855` 更新到 `ec2667f3cb32449947bf55a2e509f6793a3c104c`（53 个提交 / 38 个非 merge，13 个文件 +624 −1030）。

> ⚠️ **gitee 的 master 会被反复 rebase/force-push**：本次同步期间它连续改写了两次历史（`5aca46a` 与 `ec2667f` 树完全相同，只是 SHA 不同）。旧的 pin SHA 因此会变成「不可达提交」，CI 里 `npm install` 报 `fatal: reference is not a tree` 就是这么来的。遇到这个报错不要以为是网络问题 —— `git ls-remote origin refs/heads/master` 取当前 SHA 重新提 pin 即可。

> ⚠️ gitee 侧把历史改写过：`6b437fd` **不再是新 master 的祖先**。所以本次是「按内容比」而不是按提交祖先比 —— 渠道集合（`provider-registry` 的 22 个 id）逐一比对完全一致，差异只在下面这些文件。

### 上游改动

- **fix(codearts): 上下文窗口取值改正** —— 权威来源是 IDE 内核日志 `provider.models[*].limit.context`（2026-09-11~10-21 共 42 份），不是 HTTP 目录端点（那两个端点根本不下发窗口字段）
  - `GLM-5.2` / `glm-5.3`：`202_752` → **`1_048_576`**（上游 10-21 起改成 1M）。旧值留着的后果是静默的：占用比被顶成 100%，自动压缩阈值卡在 `0.8×202752≈162K`，1M 的能力永远吃不到
  - `deepseek-v4.1-flash`：`1_000_000` → `1_048_576`（按 IDE 权威值改正）
  - `glm-5.3-flash` / `deepseek-v4-flash` / `-pro`：补 1M；`openpangu-2.0-flash` / `-pro` 补 524_288；`glm-5.2-sft-harmony` 维持 202_752
- **feat(codearts): 目录外模型 id 的兜底窗口** —— 新增回调：`codearts` 未知 id 仍给具名兜底（目录窗口全来自本地静态表，缺了会让占用条整条消失），其余 12 家**不提供**⇒ 未知模型不声明 context（编一个就是假窗口）。回调必须传 `modelId`
- **fix(accio)+fix(css)**：补上 trae 那类缺陷的第二个入口 + 面板窄条的根因修法
- **docs**：新增 `docs/agent-notes/providers-codearts.md`；删掉 `providers-buddy.md`、buddy 指纹 e2e 与对应单测，并把 tencent 指纹里「DSH 身份首句」那条规则移除（`tencent-fingerprint.ts` −150 行）
- 移除 `test:e2e:buddy-fingerprint` 脚本

### 本仓库处理

- 业务核心 pin 提到 `5aca46a`（`package.json` 与 `package-lock.json` 的 `resolved` 三处同步）
- **CI 改成「先质检再发布」**：`build-image.yml` 新增 `verify` 作业 —— 用同一份 Dockerfile 构建镜像但**不推送**，然后在镜像里跑 `npm test`，`build-and-push` 通过 `needs: verify` 依赖它。测试不过就永远发不出镜像
- 构建期补丁无需改动：`5aca46a` 的 `opencode-rpc.ts` 仍是 `KEY_PATTERN = /^sk-[A-Za-z0-9_-]{20,}$/` 与 `OPENCODE_ACCOUNT_${tail.toUpperCase()}`，两处改写照旧命中
- `/admin` 宿主桩无需改动：客户端插件的 `ctx.*` 成员集合与上一版完全一致（仍含 `inject`）


</details>

<details>
<summary><b>2026-10-21 · 上游升级 <code>6b437fd</code>（直达 gitee master，共 66 个提交）</b></summary>

## 上游升级

依赖从 `78dc506cf42bb1821a20cd4378f2b81cd8de8ded` 更新到 `6b437fdb1062aac9225800210d56a1437538f855`，**跳过了 GitHub 中间层当时的 pin `b0940ca`，直接跟到 gitee `master`**（2026-10-17 用户已批准这条路径）。跨 66 个提交。

### 上游改动

- fix(pii): 事故手机号真正闭环 —— 从守卫自证断言与白名单里清掉真实号码
- test(pii): 守卫补四条凭据判据 + 扫进 tests/ —— 修「守卫全绿却没保护住真凭据」
- fix(tencent-fingerprint): DSH 身份首句换官方同形措辞 + 落地两站探针（修 4 个探针缺陷）
- test(pii): 补三条「真实凭据」形态判据 —— PEM 私钥 / sk- 密钥 / JWT
- fix(test): 跟上宿主 claimStyles 新签名 —— 修「对拍用例被静默 skip」的既有失败
- fix(model-center): 修三处真缺陷 + 补 mounted 复位 —— 筛选归零 / 搜索命中被藏 / 全关按钮恒不禁用
- fix(build): prepare 内联真实命令 —— 不再依赖任何包管理器（pnpm 10/11 上安装必失败）
- fix(jet-hub): 模型级「全关」不再连带关掉整个供应商 + 独立池判据收敛为一份
- fix(credits): 独立池不进分档也不进聚合折算 —— 修前后端口径分叉
- fix(codearts): 目录倍率补 bareName + 转仓内口径「x{n}」—— 修聚合挑不到 codearts
- test(credit-expiry): 合并 !134 后补 exclusivePoolRemaining 字段 —— 修 3 条全等断言变红
- fix(raccoon): 图片能力改判「默认支持 + 纯文本黑名单」—— 修同族新模型 -1017 又被判 text
- docs: 登记 client 的哨兵兜底缺口 + 两轮审计报告
- fix(autoclaw): 订正 zai_glm-5.3-flash 的 isFree 失实标记
- fix(pii): 脱敏 master 遗留的真实手机号
- feat(autoclaw): 补永久锁开关 + 修降级误报 + 文案订正
- test(守卫): 补三处零覆盖 + 修两条新守卫的无牙判据
- fix(文案): Qoder / AStudio 锁定文案与代码行为相反
- fix(分档): deductionEndTime 判据改 Number() + 挡住两格类型污染
- fix(astudio): reportPickedAccount 改 true —— 原 false 让 reportAccount 成为死接线
- docs(AGENTS): 记 lib/ 陈旧会让端到端验证验证到旧代码
- docs(astudio): 如实登记时区未验证项 + 订正 replace(' ','T') 的真实必要性
- fix(qoder): 永久哨兵在「两条支路」上都必须拦截
- test(astudio): 锁「同一语义两处渲染必须同步」—— 防独立池标注再次漏改
- fix(astudio): 徽标弹窗也标注独立池 —— 同一语义的第二处渲染漏改
- fix(astudio): 独立池（星火积分）单独标注 —— 不再混进「永久」桶冒充通用积分
- fix(astudio): 资源包分桶整条不渲染 —— 到期判据绕过 packageExpiryMs + windowDays 未回传
- feat(codearts): 目录显示消耗倍率（含错峰档），修两处静默丢字段
- fix(build): `prepare` 不再依赖全局 pnpm —— 没有 pnpm 的机器也能安装/更新本插件
- docs(audit): 补 PR131（Qoder 三档分档 + 锁定永久积分）审计记录
- feat(qoder): 补永久/长期/临期三档分档 + 锁定永久积分
- feat(codearts): 套餐周期转临期 + 赠送包「即将到期」拆到逐包，三档合计恒等于 total
- feat(codearts): 显示「其中 N 即将到期」—— 上游只下发聚合标量，做不出三档分档
- feat(jet-hub): 供应商弹窗增加「模型列表」统一管理屏
- feat(minimax): 补永久/长期/临期三档分档 + 锁定永久积分
- fix(astudio): PR 自查三处修正（失效文件引用 / 迁就测试的顺序 / 断言越界）
- feat(astudio): 补永久/长期/临期三档分档 + 锁定永久积分


### `b0940ca` → `6b437fd` 追加的 18 个提交

- feat(jet-hub): 原生侧栏入口 + 「侧栏」开关；单账号账号卡不再不占满宽度（PR !139）
- fix(jet-hub): 三档合计必须等于 total —— 临期数字用总额，倒计时降级为「其中」限定语（PR !135）
- fix(trae): 多 tool_call 时结果内嵌图片插到 `role:tool` 之前致 4027（PR !128）
- fix(cline): 补 minimax-m3.1-flash 的 maxTokens 声明 —— 请求不带 max_tokens 会退回网关默认 4096，长回答被静默截断（PR !138）
- refactor(credential-resolver): isFreeModel 改为必填 —— 漏接从「静默失效」变成编译错误（PR !137）
- fix(qoder): 积分「一直读取中」改成带原因的失败文案 + 多账号并发；免费模型不再被「锁定永久积分」误拦（PR !136）
- fix(tencent-fingerprint): 补第 5 条指纹 —— DSH Web 运行面那两句（真实报障「只改第 1 行仍被拦」）
- fix(accio) + fix(css): 补 trae 那类缺陷的第二个入口 + 面板窄条的根因修法
- fix(audit): 修三处阻断/重要缺陷 —— qoder 免费判据只查远端、批量隔离被打破、徽标 title 残句
- docs(pii) / docs(audit): 审计结论登记与「守卫自己会出现在审计脚本里」的误报说明

### 本仓库处理

- **合并上游 6 个提交**：上游升级脚本化（`scripts/upgrade-upstream.mjs`）、多架构镜像发布、README 面向用户重写、Node 22 → 24
- **关闭上游带进来的两套自动 CI**：`upgrade-upstream.yml` 的每日定时（会自动改 pin 并推 `main`，打乱本仓库发布节奏）与 `publish-image.yml` 的自动触发（与本仓库 `build-image.yml` 重复发布）。两个文件都保留、只留 `workflow_dispatch`
- **修 `/admin` 宿主桩 ctx 缺 `inject`**：上游本次新增的侧栏入口在注册期调 `ctx.inject(['layout'], …)` 拿作用域副本，而本仓库 `/admin` 的桩 ctx 只提供 `effect` / `slots` / `connection`，实测整页白屏成「管理界面加载失败：ctx.inject is not a function」。补成「服务缺失」语义（回调一个不含 `layout` 的 ctx）—— 上游内部对 layout 全部用 `?.` 兜底，拿不到就不撤销选中，与真 DSH 上「布局服务缺失」行为一致
- **构建期补丁仍然必需**：上游到 `6b437fd` 仍是 `/^sk-[A-Za-z0-9_-]{20,}$/` 与 `OPENCODE_ACCOUNT_${tail}`，本仓库 `scripts/patch-upstream.mjs` 的两处改写（key 形态放宽到 `oc_` 开头、派生凭据名补非法字符消歧）继续生效

### 验证

- Docker 构建成功，`patch-upstream` 两处均输出 `patched`（`opencode-rpc.js` 的 key 判据 + client hint）
- 构建产物内 `package-lock.json` 锁定的 commit = `6b437fdb1062aac9225800210d56a1437538f855`；`sidebarEntry` 符号在产物中出现 6 次，而该符号在 `b0940ca` 的源码里为 0 次 —— 证明 pin 确实解析到了 6b437fd，不是缓存
- 渠道集合无变化：`provider-registry` 的 22 个 id / 20 个注册函数，与升级前一致
- `npm test`：**41 / 41 通过**（补 `inject` 之前是 39/41，两条 admin 用例红）

</details>

<details>
<summary><b>2026-10-21 · 上游升级脚本化：每日自动升级 + 测试去硬编码 + README 面向用户</b></summary>

## 上游升级自动化

新增 [`scripts/upgrade-upstream.mjs`](scripts/upgrade-upstream.mjs) 与
[`.github/workflows/upgrade-upstream.yml`](.github/workflows/upgrade-upstream.yml)：
上游升级从「每次手工来一遍」变成**每天自动跑一次**。

- **定时**：每天**北京时间 08:08**（cron 写 `8 0 * * *` —— GitHub 用 UTC 且按小时错开）；
  也可在 Actions 页**手动触发**。
- **上游 hash 没变就跳过**：不装、不构建、不改文件、不提交，工作区一个字节都不动。
- **有更新则**跑完整链路：改 `package.json` → `npm install` → 核对 lock 的 `resolved`
  → `npm run build` → `npm test` / `lint` / `format:check` → 把上游这一段的
  **commit 标题**（只取标题，不取正文）写进 `CHANGELOG.md` → 自动 `git commit`。
- **失败即失败**：任何一步非零退出，workflow 变红 ⇒ GitHub 发失败通知邮件，
  失败原因还会写进 Actions 的 Summary。
- **不会留下半成品**：依赖装不上会**回滚** `package.json` 与 `package-lock.json`；
  测试不过就**不提交**。另有一道自检 —— 两个文件的 hash 不一致时直接报错退出
  （那是从前一次失败中留下的状态，会导致此后永远「误判无更新」而卡住不再升级）。
- 提交身份为 `upgrade-bot <upgrade-bot@users.noreply.github.com>`。

## 测试与文档去硬编码（上游新增渠道从此零改动）

此前 provider 名单是**双向**断言、且断言了渠道总数与导航文案 —— 上游每加一个渠道，
本仓库都得跟着改一次。这是自动化最大的噪音源，故改为：

- `tests/host.test.mjs`：`EXPECTED_PROVIDERS` 改为**单向**断言「期望 ⊆ 实际」——
  **只防删、不防增**。上游新增渠道不再让测试变红；删除或改名已有渠道仍会红
  （那是契约破坏，必须有人看一眼）。
- `tests/admin-ui.test.mjs`：去掉渠道文案名单与导航总数断言，只断言「渲染出了多个渠道
  入口 + 聚合面板存在 + 按钮无空文案」。
- `README.md`：三处「N 个渠道」改为不写死。

## 其他

- **Docker 基础镜像升到 `node:24-slim`**（原 `node:22-slim`）。
- **Prettier 改 `endOfLine: "auto"`**：本机是 Windows 且 Git 配了 `core.autocrlf=true`，
  工作区被检成 CRLF，而 Prettier 默认要 LF ⇒ 一批**本来没动过**的文件也报格式错误。
  `endOfLine: "auto"` 让它跟随文件自身行尾，根治了 README 里记的那个「行尾陷阱」。
  （CI 是 Linux runner、检出即 LF，不受此影响；Docker 构建只跑 `npm install` 与
  `npm run build`，**不跑**格式检查，同样不受影响。）
- **README 重写**：面向使用者 —— 去掉折叠块，把「架构 / 开发 / 升级流程」等开发者内容
  归到独立章节，主线只留「装什么、怎么用、怎么部署、出问题怎么办」。

</details>

<details>
<summary><b>2026-10-21 · 上游升级 <code>78dc506</code>：新增 AutoClaw 国际版（第 21 个渠道）、窄屏适配</b></summary>

## 上游升级

依赖从 `cafe269872f4b99af15745981ce8ff8e085b959b` 更新到
`78dc506cf42bb1821a20cd4378f2b81cd8de8ded`，版本号仍为 **0.2.1-rc.2**
（`peerDependencies` 与 `dependencies` 未变，无需换基础包）。上游 23 个 commit，本仓库
**产品代码 0 行改动** —— 只有测试期望列表与文档里的渠道数跟着变。

### 新增 AutoClaw 国际版渠道（`autoclawintl`）

第 **21** 个渠道，与「AutoClaw（智谱）」并列（文案 `AutoClaw (国际版)`）。上游判定它该
独立成 provider 而不是加站点参数，判据与 `minimaxintl` 同款 —— 账号体系（手机号 vs 邮箱）、
API 主机（`autoglm-acceleration-api.zhipuai.cn` vs `autoglm-api.autoglm.ai`）、登录方式
（短信验证码 vs Z.ai OAuth）三处全不同，实测国内 token 打国际基址一律 `410000 用户未登录`
/ 推理 401 ⇒ 用户体系物理隔离。

**登录走本地导入**：零复制，复用同一份 `autoclaw-credits.ts`，因此积分能力与国内版一致。
面板上它紧跟在 `autoclaw` 之后、`accio` 之前（适配器注册顺序）。

### Jet Hub 窄屏适配

此前**只有弹窗内部**有 media 查询，主布局一条都没有 ⇒ 窄屏（约 400px）下
`.dim-jh-rail` 固定 228px 会把右面板压成窄缝、操作按钮被裁断、中文提示逐字竖排。
现在主布局改为**上下两段**（rail 在面板小屏时从左侧栏变成顶部横条），用量浮层也不再
以徽标为锚点向左硬展开 240px，而是 **portal 到 `document.body` 并按视口锚定**（修 Edge
旧内核在 `container-type: inline-size` 下锚定失效导致左边缘飞出视口的问题）。

⚠️ 这两处都是**上游客户端产物**，本仓库 `npm run build` 重新拷贝即可，无需改代码。

### 其他上游修复

- **关闭供应商后不再被目录增长静默重开**（Gitee IKP8OF）：此前 `setEnabled(false)`
  只把**当时**目录的模型写进黑名单，而 `provider.status` 的 `closed` 是按**当前**目录派生
  ⇒ 目录增长后「已关闭」的渠道会自己回到「已打开」分组。现在两处判据同源。
- **Buddy / WorkBuddy 补登 DSH 身份首句风控指纹**：两个腾讯系端点对
  `You are an AI agent powered by DeepSeek Harness.` 做行首锚定的内容级风控
  （400 / `code 11128`），此前表现为「每轮必 400、换号换模型都无效」。
- **Loomy 三条既有缺陷**：HTTP 200 + 业务码 `100002` 现在也换号；凭据探测改为针对**本轮**
  凭据；探测失败按退避处理，401/403 分支的探测失败不再打断整轮。
- **AutoClaw 审计整改**：修 P0「国际版一键导入仍读国内目录且绕过归属校验」、同账号去重、
  积分批次改**净额**口径（修「全显示成永久」）。
- **聚合路由**：候选能力解析改串行、失败不缓存（此前每轮白等 60 秒）；预算超时不再被读成
  用户取消。

### 本仓库侧的改动

- `tests/host.test.mjs`：`EXPECTED_PROVIDERS` 加入 `autoclawintl`（在 `autoclaw` 之后、
  `accio` 之前），渠道注释 20 → 21。
- `tests/admin-ui.test.mjs`：导航数 21 → 22（21 渠道 + 1 聚合面板）；按 `minimaxintl` 的
  同款做法**分别**断言「AutoClaw (智谱)」与「AutoClaw (国际版)」—— 只写 `includes("AutoClaw")`
  的话国际版被删掉也不会红。
- `README.md`：特性、管理界面、真机确认三处的渠道数 20 → 21。

验证：`npm test` 36/36 通过，`npm run lint` / `format:check` 干净，启动日志有
`上游契约核对通过`（端点与槽名未变，`src/upstream.js` 无需改动）。

### 本仓库追加（合并时补齐）

- 上游中间层本次只有 1 个提交：`2ef6f55`（升级 pin 到 `78dc506`）。gitee 业务核心
  `cafe269..78dc506` 为 **23 个提交**（其中 15 个非 merge），改动集中在 AutoClaw 侧
  （`autoclaw-auth.ts` +215、`autoclaw-oauth.ts` +301、`autoclaw-product.ts` +116）
  与新增的两个单测文件（`autoclaw-credits.spec.ts`、`autoclaw-intl-site.spec.ts`）。
- 上游 CHANGELOG 写的验证条数是 `36/36`（那是上游仓库自己的用例数），本仓库实际基线是
  **`npm test` 41/41 通过、`npx eslint .` 通过**（v1.10.0 起上游带 14 个鉴权用例）。
- **构建期补丁继续生效**：`cafe269..78dc506` 区间 `src/opencode-rpc.ts` **零改动**，
  `KEY_PATTERN` 与 `slotNamesOf` 两个锚点不变，构建输出 `pattern: patched; refName: patched`。
- **pin 解析实证**：镜像内 `dsh-codearts-auth/lib/` 下 `autoclaw-oauth.js` /
  `autoclaw-product.js` 存在且为 `78dc506` 版本；运行时 `listProviders()` 实测 **23 项**
  = 21 个渠道 + `aggregate` + `jet-hub-auto`，`autoclawintl` 位于 `autoclaw` 之后、`accio` 之前。
- `tests/host.test.mjs` 里那句「相对顺序」注释同步补上 `autoclawintl` 与 `astudio`
  （上游加渠道时只改数组、没改注释，容易误导下一个人）。
- 「AutoClaw 一键导入」的国际版归属校验与「关闭供应商后被目录增长静默重开」两条修复
  都在本 pin 内，属上游行为，本仓库不额外打补丁。
- 产品代码 0 行改动；未部署、未重建任何运行中实例。

</details>

<details>
<summary><b>2026-10-20 · 管理端登录鉴权、<code>/v1/*</code> 默认可用、Qoder 模型列表改走远端；上游升级 <code>cafe269</code></b></summary>

## 管理端登录鉴权

部署到公网不再需要反向代理做访问控制，服务自带登录页。

**使用方式**：首次启动生成 `<CODEARTS2API_HOME>/admin-key`，打开 `/admin` 粘贴即可进入。
密钥固定不变，要换就删除该文件，或改用 `CODEARTS2API_ADMIN_KEY` 指定。

**管理密钥与网关 Key 是两把**：网关 Key 给调用方访问 `/v1/*`，管理密钥用来进后台。
分开是为了让「把网关 Key 发给别人」不等于「把后台也交出去」。

| 能力        | 说明                                                                      |
| ----------- | ------------------------------------------------------------------------- |
| 浏览器登录  | 登录后下发 HttpOnly 会话 Cookie，30 天有效                                |
| 脚本 / 监控 | 支持 `Authorization: Bearer <admin-key>`                                  |
| 防爆破      | 登录失败按来源 IP 限速：10 次 / 10 分钟                                   |
| 关闭鉴权    | `CODEARTS2API_ADMIN_AUTH=0`（仅限本机，启动日志与 `/healthz` 会如实反映） |

**受保护范围**：`/`、`/admin`、`/api/jet-hub` 及全部管理静态资源需要登录。

**不需要登录的**：`/healthz`（不含密钥，供监控）、`/v1/*`（用网关 Key）、
`/api/jet-hub/captcha-carrier`（验证码页面，需被内嵌浏览器直接打开）。

**响应安全头**：管理页面统一带 CSP、`X-Frame-Options: DENY`、`nosniff`、`Referrer-Policy`。

## `/v1/*` 默认可用

不再需要 `PROXY_GATEWAY=1`。此前忘记设置会表现为 `/v1/*` 全 404，容器里不易察觉。
需要关闭时设 `PROXY_GATEWAY=0`，该端口会返回明确的 `proxy_disabled` 提示。

## 上游升级

依赖从 `82da5df88e90b831a833011b4ce506a934fdb1bc` 更新到
`cafe269872f4b99af15745981ce8ff8e085b959b`，版本号仍为 **0.2.1-rc.2**
（`peerDependencies` 与 `dependencies` 未变，无需换基础包）。

### Qoder 模型列表改走远端（本次重点）

此前 Qoder / Qoder(中国版) 的模型列表**恒用编译期快照**（国际版 2026-09-21、中国版
2026-09-27），一次远端请求都不发。上游因此改价、改免费额度、上下架模型都不会被感知。

现在 `/v1/models` 走远端目录，**倍率与免费标记跟随上游实时变化**：

- 上游已把 `DeepSeek-Flash` 调为免费（0×）、`mmodel` 改名 `MiniMax-M3.1-Flash`（0.2 → 0.1），
  这些变化现在能正确显示（此前一直显示旧的 0.1×）。
- 远端目录**按账号下发**（一个免费额度号上游可能只给 2 条），所以缓存即「上次成功那个
  账号的目录」。能力与元数据（图片支持、上下文长度、思考档位）取「远端 ∪ 内置表」的并集 ——
  否则某个账号的窄目录会把模型误判成「不支持图片」并退化显示名。
- 远端拉取失败或未登录时自动回退内置表，功能不受影响。

### 思考档位解析对齐官方客户端

- 档位白名单从 7 个收敛为官方的 **6 个**（`none`/`low`/`medium`/`high`/`xhigh`/`max`，无 `minimal`）。
- `efforts` 现在同时接受**数组、逗号/空格分隔字符串、对象**三种形态。
- 补齐顶层 `default_effort`、`supports_disabled`、`available_reasoning_effort`（后者是一个
  `thinking_config` 对象，且仅在条目自身无档位时才读）的解析。

### 其他

- **新增 AStudio（讯飞 astronautStudio）渠道** —— 第 20 个渠道。它没有 OAuth：登录靠
  **导入本机桌面端已登录的会话文件**
  （`%LOCALAPPDATA%\Programs\AStudio Data\userdata\astron-session.json`，可用
  `DSH_ASTUDIO_SESSION_FILE` 指向别处）。⚠️ 远程/容器部署看不到本机会话，
  需要用「打开认证页」或该环境变量指路径。
- **模型目录 20 分钟 TTL + 后台刷新**：`/v1/models` 不再每次都等上游拉目录，
  **网关首轮响应明显变快**；用户改设置时立即失效缓存。
- **共享余额读数改为先回旧值再后台保鲜**：面板打开更快。
- **聚合路由**：取消请求不再被当作渠道不可用（此前取消一次 = 该渠道消失 60 秒）。
- **TRAE 签到**收尾参与 1024 打卡抽奖。
- **CodeArts**：修复 30 天硬上限导致的续期漏窗。
- **AutoClaw**：token 死线以 JWT exp 为准；非法思考档位本地拦截，避免按最贵档计费。

渠道数 19 → **20**。

### 本仓库追加（合并时补齐）

- 上游中间层本次 3 个提交：`207e234` 管理端鉴权、`a081c85` 不信任 `X-Forwarded-*`、`55e531f`
  升级 pin 到 `cafe269`。gitee 业务核心 `b5dab83..cafe269` 为 **3 个提交**（全部非 merge），
  改动集中在 Qoder：新增 `src/qoder-catalog.ts`（543 行）把模型目录改走远端，
  配套 `qoder-adapter.ts` / `qoder-auth.ts` / `qoder-wasm.ts` 与 4 个测试文件。
- **渠道集合与注册顺序未变**（仍是 20 个渠道 + `aggregate` + `jet-hub-auto`），
  `tests/host.test.mjs` 与 `tests/admin-ui.test.mjs` 的期望无需调整。
- **构建期补丁在新 pin 上继续生效**：`cafe269` 的 `src/opencode-rpc.ts` 与 `b5dab83` 一致，
  `KEY_PATTERN` 与 `slotNamesOf` 两个锚点原样存在。
- Dockerfile 冲突：本仓库此前记录「上游自 `f10d1e5` 起监听地址可经 `DSH_OPENAI_GATEWAY_HOST`
  修改」，上游这一版把该注释改回「硬编码」。按**事实**取本仓库侧（该变量确实存在），
  并补上上游新增的「`PROXY_GATEWAY` 现已冗余」说明。
- README 冲突三处：环境变量表按「上游新增 + 本仓库的 `DSH_OPENAI_GATEWAY_HOST` 行」合并
  （新增 `CODEARTS2API_ADMIN_KEY`、`CODEARTS2API_ADMIN_AUTH`，`PROXY_GATEWAY` 默认值改「开」）；
  `PROXY_GATEWAY` 段落保留本仓库的 `DSH_OPENAI_GATEWAY_HOST` 说明并追加关闭方式；
  「发布镜像版本」段落是本仓库独有的内容，完整保留。
- CHANGELOG 自动合并把本仓库 v1.9.0 条目（`b5dab83` / AStudio）整段覆盖掉了 ——
  两边都是「2026-10-20」的条目，git 按同位置取舍。已从 `66d56a6` 恢复该条目。
- ⚠️ **升级注意**：本版起 `/admin` 需要登录，管理密钥在 `<CODEARTS2API_HOME>/admin-key`
  （首次启动生成，`0600`，只在生成那一次打印到日志）。`/v1/*` 的网关 Key 不变。
  反向代理上的 Basic Auth 可以撤掉。

</details>

<details>
<summary><b>2026-10-20 · 上游升级到 <code>b5dab83</code>（新增 AStudio + 模型目录刷新器）</b></summary>

依赖从 `82da5df88e90b831a833011b4ce506a934fdb1bc` 更新到
`b5dab839fe04d3a05a331c4a7d6b073a876c71f3`。版本号仍是 **0.2.1-rc.2**、`peerDependencies`
与 `dependencies` **一字未改**（上游这次纯发 commit），所以 `@deepseek-ai/dsh-*` 基础包
照旧，本仓库无需换 peer，也无需在 `src/host.js` 里补任何服务。

### 上游变化（43 个 commit，+10627/−184）

- **新增 AStudio（讯飞 astronautStudio）渠道** —— 第 20 个渠道。它**没有 OAuth**：登录靠
  **导入本机桌面端已登录的会话文件**
  （`%LOCALAPPDATA%\Programs\AStudio Data\userdata\astron-session.json`，可用
  `DSH_ASTUDIO_SESSION_FILE` 覆盖）。三处协议事实与本插件其它家都不同：推理基址在
  `/model-gateway/v1` 而目录在 `/api/v1/model-manager`（拼 `/v1/models` 恒 404）、推理端点
  **只认裸 slug**（填 `builtin/<base64>` 回 502 `model_not_found`）、失败有两种信封
  （目录面是 HTTP 200 + `code !== 0`）。⚠️ 因为默认路径读 `LOCALAPPDATA`，
  **远程/容器部署看不到本机会话**，需要用「打开认证页」或 env 指路径（已写进 README）。
- **模型目录 20 分钟 TTL + 后台刷新器**：新增 `isCatalogFresh` 作**唯一**新鲜度判据，
  A 类四家（loomy / minimax / zcode / raccoon）与 B 类四家 + officeace + astudio 全部接入，
  `be42b25` 遗留的「刷新器拿不到各家 `refresh`」由 `3186eaf` 补了 12 家转发 +
  参与度检测（否则刷新器**空转**）。用户改设置时立即失效缓存。对本项目的意义：
  `/v1/models` 不再每次都等上游拉目录（`a80ab4a` 实测旧路径卡 7 秒，
  `a4765aa` 实测 `resolveModel` 阻塞 70 秒），**网关首轮响应明显变快**。
- **共享余额读数改为 stale-while-revalidate**：先回旧值、后台定时保鲜，面板打开更快。
- **聚合路由**：取消请求不再被折算成 `UNUSABLE`（此前取消一次 = 该渠道消失 60 秒）；
  目录缓存判据并入 `isCatalogFresh`，消掉第二份实现；复审修掉 3 Critical + 2 Important。
- **TRAE 签到收尾参与 1024 打卡抽奖**（`trae-lottery.ts`，454 行用例）。
- **CodeArts**：补 `refresh` 寿命腿（30 天硬上限导致的续期漏窗 + `refreshable` 永真）；
  APIG 瞬时签名故障改为**有界重发** + abort 守卫。
- **AutoClaw**：`access_token` 死线改以 **JWT exp** 为准（删掉编造的 7 天，IKOYEG）；
  非法思考档位本地拦截，避免按最贵档静默计费。
- **登录失败文案**： 「未开通」类失败不再拼「请重新点击「+ 新建账号」」这条**假出路**。

### 本仓库改动与验证

- `package.json` / `package-lock.json` 各一处依赖行。
- **测试期望是本次唯一需要动的代码**（这正是「新增渠道 0 行」那条承诺的兑现方式）：
  `tests/host.test.mjs` 的 `EXPECTED_PROVIDERS` 加 `"astudio"`（位置在 `accio` 之后、
  `modelscope` 之前 —— 由实际注册序实测得到，不是照注册表抄）；`tests/admin-ui.test.mjs`
  导航断言加 `AStudio`，总数 20 → **21**（20 渠道 + 1 聚合）。
- 渠道数文案 19 → **20**（README 三处 + 测试注释两处）。
- `npm run build` 重建产物（`public/upstream-jet-hub.js` 含 34 处 `astudio`）。
- `npm test` **22/22 通过**；`npm run lint`、`npm run format:check` 通过；
  `npm start` 契约核对行正常，`/healthz` 的 `providers` 实测为 20 渠道 + `aggregate` +
  `jet-hub-auto`。
- **产品代码 0 行改动**。未用真实账号验证 AStudio 链路（需要本机装桌面端并扫码）与
  TRAE 抽奖（需要真机签到）。

### 坑

**① 同上次：npm 11 `allow-scripts` + pnpm 新包冷却期**，命令仍需
`--userconfig <干净 npmrc>` 与 `PNPM_CONFIG_MINIMUM_RELEASE_AGE=0`（详见上一条）。
本次还额外撞了一次 `ECONNRESET`（拉 `undici` 时），原样重试即过 —— 不需要改配置。

**② `EXPECTED_PROVIDERS` 的顺序只能靠实测。** 上游 `provider-registry.ts` 的声明顺序与
`index.ts` 的**适配器注册顺序不同**，而断言比的是后者。快速拿真值：

```bash
node -e "import('./tests/helpers.mjs').then(async h=>{const a=await h.startTestApp();
console.log(JSON.stringify(a.host.ctx.get('llm').listProviders().map(e=>e.id)));await a.close();process.exit(0)})"
```

### 本仓库追加（合并时补齐）

- 提交数订正：上游条目写「43 个 commit」，实测 `82da5df..b5dab83` 为 **46 个提交**
  （其中 40 个非 merge 提交），差异来自上游统计口径，以 `git rev-list --count` 为准。
- README 有一处**两侧都改同一行**的冲突：本仓库此前把 opencode 那行改成
  「`sk-` 或新版 `oc_sk_` key」，上游同时在该行追加 `astudio`。按「两边都保留」解决，
  最终为「`sk-` 或新版 `oc_sk_` key」+「`astudio`（导入本机桌面端会话）」。
- 渠道数 19 → **20**（README 三处、`tests/admin-ui.test.mjs` 注释、`tests/host.test.mjs` 注释）；
  导航断言总数 20 → **21**（20 渠道 + 1 聚合面板）。
- **构建期补丁在新 pin 上继续生效**：`scripts/patch-upstream.mjs` 两处修补均打出
  `pattern: patched; refName: patched`（`src/opencode-rpc.ts` 在
  `82da5df..b5dab83` 之间**零改动**，故补丁锚点不变）。
- 验证：`npm test` **27/27 通过**、`npx eslint .` 通过；镜像内确认 AStudio 相关产物存在
  （证明 pin 真解析到 `b5dab83`）；真实进程 + HTTP RPC 复测 OpenCode 尾段含连字符的 key
  仍能入库、重复添加返回 `existed: true`。
- 产品代码 0 行改动；未部署、未重建任何运行中实例。

</details>

<details>
<summary><b>2026-10-19 · 上游升级到 <code>82da5df</code>（Accio 请求级换号 + Gemini 出口代理）</b></summary>

依赖从 `b0a6409e96181943672c6a65c549964ed50a56be` 更新到
`82da5df88e90b831a833011b4ce506a934fdb1bc`（版本号仍是 **0.2.1-rc.2** —— 上游这次只发
commit、没有动 `package.json` 的 version，所以 `@deepseek-ai/dsh-*` 基础包**维持原版本**，
本仓库不需要换 peer）。

### 上游变化（8 个 commit）

- **Accio（阿里）请求级账号轮换**（IKM3ZV，本次最重要的修复）：402 / 流内 `error_code:402`、
  429、401/403 现在会**自动切到池内下一个账号**（`ACCIO_MAX_ROTATE = 8`），并按类别写冷却
  （额度至 UTC+8 当日 24:00、限流 1h、**认证类只换号不写冷却**）。改前整条请求路径**零换号**
  —— 池里登录 N 个账号也不带来 N 倍可用性。⚠️ 这一项把 `accio` 在
  `provider-registry.ts` 的 `rateLimit` 从 `false` 翻回 `true`，`probeById` 与
  `WRITES_RATE_LIMIT_PROVIDERS` 三处同改，因此面板上 Accio 的「重测 / 重置」**从恒为惰性
  变成真正可用**。
- **Gemini 出口代理**（IKLTZ2）：Gemini 全部端点都在墙外，而 Node 的 `fetch`（undici）
  **既不读 Windows 系统代理、也不读 `HTTP(S)_PROXY`** ⇒ 症状是「浏览器授权成功、面板里
  账号一直不出现」，极易误判成 `client_secret` / `redirect_uri` 配错。上游新增 `gemini-proxy.ts`，
  账号卡片上多一个**「代理」按钮**（填 `http://…` / `socks5://…` / 带认证的地址，「测试连接」
  直接打 Google 端点，避免用 ip-api 造出假阳性）；登录、续期、积分、对话四条腿全部走它，
  探测与聚合折算路径也补上了同一个按账号 fetcher。连不上时提示改成「疑似需要代理 + 根因码」
  （如 `UND_ERR_CONNECT_TIMEOUT`），不再是裸 `fetch failed`。
- **Qoder「未开通每日领取」判据重做**（IKJSHK + PR !117 审计整改 P0-1）：改用服务端活动列表
  三态 + **「本次请求是否真的带上了成对 machine 头」**作第三腿。旧判据在「拿不到 machine 头」
  的纯插件环境下会把**全部 qoder / qodercn 账号误判为未开通**并渲染成「请先用 Qoder 官方客户端
  登录一次」；该误报本次修掉。
- **OpenAI 网关绑定探针显式直连**（IKM3UI）：免疫 `NODE_USE_ENV_PROXY` 等环境代理，避免
  「本机回环探测被代理带走」。
- 另有 OpenCode 面板与聚合路由的多处小修（客户端 `opencode-proxy-modal` 增加 Gemini 版弹窗）。

### 本仓库改动与验证

- 只改 `package.json` / `package-lock.json` 的一行依赖（两个文件各一处 `resolved` 同步）；
  **产品代码 0 行改动**，渠道数量仍是 **19 个渠道 + 1 个聚合面板**，测试期望列表**无需更新**。
- `npm run build` 重新拷贝上游客户端产物（`public/upstream-jet-hub.js` 已含 `GeminiProxyModal`，
  与 `node_modules` 里的 `lib/client/jet-hub.js` **哈希一致**）。
- `npm test` **22/22 通过**；`npm run lint` 通过；`npm run format:check` 通过
  （见下方「本机行尾」）。
- `npm start` 启动日志含契约核对行
  （`上游契约核对通过：/api/jet-hub, /api/jet-hub/captcha-carrier`），端口 8326 被既有实例
  占用时网关只记 `EADDRINUSE` 并跳过，不影响 `/admin`（文档已写明的已知边界）。
- 未用真实账号验证新换号策略与 Gemini 代理通路（需要墙外出口与多个 Accio / Gemini 账号）。

### 安装说明

**① npm 11 的 `allow-scripts` 可能导致 git 依赖安装失败。**
若 `~/.npmrc` 里有 `allow-scripts=true`，npm 11 会报
`EALLOWSCRIPTS: --allow-scripts is not allowed in project-scoped installs`，
而外层显示为 `git dep preparation failed`。解决：删掉该行，或指定一个干净的 userconfig：

```bash
npm install "dsh-codearts-auth@git+…#<commit>" --include=dev --no-audit --no-fund \
  --userconfig /tmp/clean-npmrc   # 里面只留 registry
```

**② pnpm 11 的新包冷却期**：上游刚发布的包在 24 小时内会被拒装，
需加前缀 `PNPM_CONFIG_MINIMUM_RELEASE_AGE=0`。

**③ 行尾差异**：Git 的 `core.autocrlf=true` 可能让 `npm run format:check` 报错，
用 `git ls-files --eol` 检查并统一为 LF。

### 本仓库追加（合并时补齐）

- 上游只写了「依赖一行」；本仓库实际合并的是 zhuweiyou `db497f8`（含 `be0b221` +
  `db497f8` 两个提交），落点与 gitee master 完全一致（`82da5df` 即 gitee 当前 master，
  不再需要跳过中间层单独提 pin）。
- 渠道集合与注册顺序在 `22cc4f8..82da5df` 之间**完全未变**（19 个渠道 + 2 条聚合路由，
  顺序仍是 `gemini → autoclaw → accio → modelscope → zcode → officeace → opencode`），
  测试期望无需改动；`tests/admin-ui.test.mjs` 合并时自动并出了重复的 `"AutoClaw"`
  断言，已清掉（`"AutoClaw (智谱)"` 保留）。
- **构建期补丁在新 pin 上继续生效**：`scripts/patch-upstream.mjs` 两处修补均打出
  `pattern: patched; refName: patched`，镜像内实测 `KEY_PATTERN` 为
  `/^[A-Za-z0-9_-]{20,}$/`、`slotNamesOf` 带 `safeTail` + 4 位哈希。
- 验证：`npm test` **27/27 通过**、`npx eslint .` 通过；镜像内确认
  `gemini-proxy.js` 存在（证明 pin 真解析到 `82da5df` 而非旧提交）；
  用真实进程 + HTTP RPC 复测尾段含连字符的 key，仍能入库且重复添加返回
  `existed: true`。
- 产品代码 0 行改动；未部署、未重建任何运行中实例。

</details>

<details>
<summary><b>2026-10-18 · 同步升级上游与 DSH 基础包（<code>b0a6409</code> / 0.2.1-rc.2）+ 新增 AutoClaw</b></summary>

依赖从 `1266165…`（0.2.0-rc.11）更新到 `b0a6409e96181943672c6a65c549964ed50a56be`
（**0.2.1-rc.2**）。这次上游**连 DSH 基础包一起升了**，本仓库必须跟着换 ——
上游把 peer 要求改成了 `^0.2.1-rc.2`，旧的 `0.2.0-rc.2` **已不再被接受**：

| 包                               | 旧版本       | 新版本       |
| -------------------------------- | ------------ | ------------ |
| `@deepseek-ai/cordis`            | `4.0.4`      | `4.0.5`      |
| `@deepseek-ai/dsh-attachment`    | `0.2.0-rc.2` | `0.2.1-rc.2` |
| `@deepseek-ai/dsh-credentials`   | `0.2.0-rc.2` | `0.2.1-rc.2` |
| `@deepseek-ai/dsh-llm`           | `0.2.0-rc.2` | `0.2.1-rc.2` |
| （另有 `-local` 两包同版本跟随） |              |              |

⚠️ `cordis` 是**连带**升级：`0.2.1-rc.2` 的 DSH 包要求 `~4.0.5`，留着 `4.0.4` 会解析失败。

### 上游变化

- **新增 AutoClaw（智谱）渠道**：登录即领积分、1M 上下文模型反代、流水批次展示临期倒计时。
- **OpenCode / minimax / officeace / buddy**：可达性判据、国际站余额与签到、签到审计、
  11128 / 11140 分类与按账号换号等多处修复。
- 客户端多模式弹窗的 `select` 失效改为卡片单选组（覆盖 ZCode / Accio / AutoClaw）。

### ⚠️ 安装障碍：pnpm 11 的「新包冷却期」

pnpm 11 默认拒绝安装**发布不足 24 小时**的包。上游把它刚发布的 `0.2.1-rc.2`
写进了**自己的** `pnpm-lock.yaml`，而 npm 拉 git 依赖时会在克隆目录里跑上游的
`prepare`（`pnpm install` + `pnpm build:all`），于是整体安装失败：

```
The lockfile contains entries that the active policies reject.
@deepseek-ai/dsh-llm@0.2.1-rc.2 was published at …, within the minimumReleaseAge cutoff
```

放行方式对照（**只有环境变量有效**）：

| 写法                                                          | 结果    |
| ------------------------------------------------------------- | ------- |
| `PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 npm install …`             | ✅ 生效 |
| `.npmrc` 里写 `minimum-release-age=0` / `minimumReleaseAge=0` | ❌ 无效 |
| `npm_config_minimum_release_age=0`（npm_config 前缀）         | ❌ 无效 |
| 用户级 `~/.npmrc`、全局 pnpm rc                               | ❌ 无效 |

已在 [README 快速开始](README.md#快速开始)与 `Dockerfile` 两处**写明**这条命令及
失效原因（这是**限时**问题：那批包满 24 小时后裸 `npm install` 自动恢复）。

### 本仓库改动与验证

- 更新 `package.json` 全部 7 项依赖与 `package-lock.json`；渠道集合**新增 `autoclaw`**。
- 更新测试期望：渠道注册顺序 `gemini → autoclaw → accio → modelscope → zcode`（**19 个渠道
  - 2 条聚合路由**）；导航 **20 项**，新增独立断言 `AutoClaw (智谱)`。
- README 渠道数量改 19，并新增 pnpm 冷却期说明；`Dockerfile` 给安装层加放行变量。
- `npm test` **22/22 通过**；`npm run lint`、`npm run format:check` 与 `git diff --check` 通过。
- **产品代码 0 行改动**；管理界面产物由 `npm run build` 重建。未用真实账号验证新渠道推理。

</details>

<details>
<summary><b>2026-10-18 · 放开 OpenCode key 的 <code>sk-</code> 前缀校验（支持 <code>oc_sk_</code>）</b></summary>

OpenCode 的 API key 已改为 `oc_sk_` 开头（例：`oc_sk_6ad03dad9d70_n9YpdGWibElciBlnqho_PxFhxFtbmyqI`），
而上游 `dsh-codearts-auth` 的形状校验仍写死 `/^sk-[A-Za-z0-9_-]{20,}$/`，导致在 `/admin`
添加账号时直接被判「形状不对」，新 key 根本进不了账号池。

本轮**取消前缀要求**，只保留「字符集 + 至少 20 位」的形状校验（挡手滑与占位符，
有效性仍由首次真实请求决定），并同步改掉错误文案与前端「形如 sk-…」的提示。

实现方式：`scripts/patch-upstream.mjs` 在镜像构建期（`npm run build` 之后）修补
`node_modules/dsh-codearts-auth/lib/opencode-rpc.js`。该脚本幂等，且**匹配不到目标
字面量时让构建直接失败** —— 上游改写法时不会静默退回被拒状态。

验证：新增 `tests/opencode-key.test.mjs`（5 例：`oc_sk_` 放行、`sk-` 仍放行、
残缺输入仍拒绝、重复 key 复用同一账号、尾段含连字符的 key 也能入库），全套 **27/27 通过**、
ESLint 通过；并用真实进程 + HTTP RPC 实测该 key 成功入库（账号 `opencode-xftbmyqi`）。

**追加修复（同日）**：只放开前缀还不够。上游用 key **尾 8 位**派生凭据名
`OPENCODE_ACCOUNT_${tail.toUpperCase()}`，而 `@deepseek-ai/dsh-credentials`
的 `REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/` 只收 shell 标识符字符。尾段含 `-`
的 key（如 `...C9Az-jQD`）会抛
`credential ref "OPENCODE_ACCOUNT_C9AZ-JQD" must match ...`。

补丁同时把尾段非法字符替换为 `_`，并附加「整把 key 的 4 位哈希」消歧
（避免 `A-B` 与 `A_B` 撞到同一凭据）；账号 id 仍用原尾段，所以重复 key 复用
同一账号的行为不变。实测该 key 入库后凭据名为 `OPENCODE_ACCOUNT_C9AZ_JQD_96F4`。

</details>

<details>
<summary><b>2026-10-18 · 同步上游至 gitee <code>22cc4f8</code>（35 个提交）</b></summary>

本轮将 gitee 业务核心 `iJetLi/deepseek-harness-codearts` 的依赖 pin 从 `510bf91` 更新到 `22cc4f8`，同时合并 GitHub 中间层 `zhuweiyou/codearts2api` 的 `1266165`（该提交已包含于 gitee 提交图）。上游新增 AutoClaw，并含 ModelScope 接入及其后续变更；provider 注册总数由 17 增至 19（新增 ModelScope 和 AutoClaw）。

</details>

<details>
<summary><b>2026-10-17 · 上游升级到 <code>1266165</code>（新增 ModelScope）</b></summary>

依赖从 `0225f08ae6db4b5b2e8d3df71061c9660dee0ddb` 更新到
`1266165baf6cc2918a06ac35a2df472980c89d6e`，版本仍为 `0.2.0-rc.11`。

### 上游变化

- **新增 ModelScope（魔搭）渠道**：访问令牌管理、魔粒余额、聚合轮换、模型黑名单与模型兜底目录。
- **聚合面板**：三态门控、手工排序、未接入渠道可手动参与，以及面板与选号共享余额缓存。
- **CodeBuddy**：补偿积分展示与手动领取；完善 11128 / 11140 错误的按账号换号，避免把可用账号误判为渠道不可用。
- **OfficeAce / Loomy**：修复账号与凭据脱节、无痕换号，以及余额陈旧缓存和错误分类。

### 本仓库改动与验证

- 同步更新依赖声明与 npm 锁文件；DSH 基础包版本保持不变，上游 peer 依赖要求未变。
- 更新渠道注册顺序及界面导航断言：**18 个渠道 + 2 条聚合路由**；导航 **19 项**，明确断言 `ModelScope (魔搭)`。
- 更新 README 渠道数量；**产品代码 0 行改动**，管理界面产物由 `npm run build` 重建。
- `npm test` **22/22 通过**；`npm run lint`、`npm run format:check` 与 `git diff --check` 通过。
- 隔离状态目录下，插件装配契约、管理界面渲染及网关反代通过；未用真实账号验证新增渠道推理。

</details>

<details>
<summary><b>2026-10-17 · 直接跟进 gitee 上游 <code>510bf91</code>（跳过 zhuweiyou 中转，28 提交）</b></summary>

本轮按用户指示**跳过 GitHub 上游 `zhuweiyou/codearts2api`**，直接把 `dsh-codearts-auth`
的 pin 从 `0225f08` 提到 gitee 业务核心仓库 `iJetLi/deepseek-harness-codearts` 的 master
`510bf91`。跳过中转换来的代价是「测试期望与 CHANGELOG 由本仓库自己维护」——本轮渠道集合
未变，测试期望无需改动。

上游增量：**28 个提交**（含 8 个合并提交，无合并 20 个）、66 个文件、+19349 / −2622 行。
包名/版本仍是 `dsh-providers-hub 0.2.0-rc.11`；上游自身 `package.json` 只新增 3 条 e2e 脚本，
**dependencies / peerDependencies / engines 均未变**，故本仓库只需改 pin 与锁文件。

### 上游变化

按 20 个非合并提交归类：

- **buddy（10 条，本轮主战场）**：`11140` 安全策略拦截、`11128` conversation id missing
  等**按账号**换号档落地（原先一条账号异常会导致「整条渠道全灭」）；「400 换号块」经
  PR105 / PR109 多轮审计整改，修掉饱和误伤、5xx 误命中、单凭据文案谎报、流内通道零守卫等。
  `IKM7SG` 渠道校验判据补「request illegal」形态，**不再把可用账号封 30 分钟**；
  「三头准入」结论按账号更正（真机复测证伪了整渠道口径）。
- **officeace（2 条）**：`IKM741` 账号/凭据双向脱节 + 面板读数说谎 + 无痕窗口换号失效
  （含真机实测）；两路独立审计整改修 7 个真缺陷（P0×3 + P1 + P2×3）。
- **loomy（2 条）**：`IKMCOO` 陈旧兼顶、面板/选号共享读数、错误契约三档；审计整改补
  陈旧标注丢失、`force` 死代码、并发兼顶失效。
- **面板（2 条）**：PR#102 合并后的双审计整改（拖动失效、排序/提示/可见性若干缺陷；
  重探判据抽成纯函数并覆盖）。
- **新功能**：`CodeBuddy 限时补偿积分`的状态展示与手动领取；**未接入渠道可进聚合**
  （默认不参与、可手工打开）+ 手工排序 + 余额读数共享缓存。

### 本仓库改动与验证

| 项           | 结果                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| 依赖锁定     | `package.json` 与 `package-lock.json` 的 pin 从 `0225f08` 更新到 `510bf91`              |
| 契约核对     | `/api/jet-hub` 与 `/api/jet-hub/captcha-carrier` **均未变**；渠道集合**未变**（仍 17 个） |
| **产品代码** | **0 行**；前端产物由 `npm run build` 重建                                               |
| 行为测试     | **22/22 通过**；`eslint .` 通过                                                          |
| 依赖实证     | 构建产物里出现 `lib/balance-cache.js`、`lib/buddy-compensation.js` —— 二者均为 `510bf91` 新增，证明 pin 确实解析到新提交 |
| 启动验证     | 契约核对通过；`/admin` 200；`/v1/models` 不带 Key 返回 401                                |

> ⚠️ **本仓库的 pin 现在领先 GitHub 上游**（zhuweiyou 仍停在 `0225f08`）。
> 等它下次升级时 `package.json` / `package-lock.json` 会冲突，取 pin 较新的那一侧即可。

</details>

<details>
<summary><b>2026-10-16 · 上游升级到 <code>0225f08</code>（新增 MiniMax Code 国际版）</b></summary>

上游增量：**14 个提交**（`023de5f` → `0225f08`，含 4 个合并提交，其中无合并提交 10 个）、
64 个文件、+4766 / −1343 行。版本仍是 `0.2.0-rc.11`。

### 上游变化

这一轮**只有一条新渠道是功能增量**，其余是渠道加固与文档/断言纠偏。

- **新增第 17 个渠道：MiniMax Code 国际版（`minimaxintl`）**（`63f08f4` + 复审 `0f9022d`，PR103）。
  它与中国版**共用同一套 `src/minimax*.ts` 实现**，差异全在 `MINIMAX_INTL` 配置
  （主机 `account.minimax.io` / `agent.minimax.io`、目录 region `en`、凭据 ref 前缀
  `MINIMAXINTL_`；product 只差 6 个字段）。两站**账号不互通、API 主机不同**，故是两个
  provider 而非一个 provider 加站点参数。同批还加了 **minimax 传输级重试** —— 真机报到
  `fetch failed`，根因是 `self-signed certificate in certificate chain`（同一凭据连打 10 次
  签到端点只成功 5 次）。复审补了 5 处零守卫并修 6 处文档失实。
- **buddy / workbuddy `X-Conversation-*` 三头**（`b554b73` → `5fa1195`，PR104）：先按
  「修 workbuddy 全线 400 / 11128」补三头，**真机约 90 次请求复测又把核心结论证伪**
  （剥三头 15/15 成功，与带三头完全一致），最终以「三头非准入必要」的整改结论落地，
  并补 `buddy-growth` 与逐 provider 点名用例。
- **loomy 额度冷却终点改为 UTC+8 当日 24:00**（`2945203`，IKL80H）：原先记的是
  「撞墙时刻 + 24h」滑动窗口，23:50 烧光额度会把解禁时刻落到**次日 23:50** —— 跨过 0 点
  上游已经放行，插件仍报「可用账号均在限流中」并把同一时刻显示在面板上。
- **OfficeAce 上下文窗口**（`83ced0d`，IKM3A0）：初版这一列**没有任何实测依据**（GLM 三行与
  CodeArts 表逐字相同、`deepseek-v4.1-flash` 查无出处），真机取证后逐项改正 —— 实测上限
  `1_048_576`，初版小 **5.3 倍**，症状不是报错而是**静默降级**（0.8× 阈值提前压缩，
  1M 能力永远吃不到）。
- **聚合「两个 Auto」澄清与名单守卫**（`1f47685` + `76e1e03`，PR101）：轮换名单七家 → 九家
  （补 accio / officeace），点明真正决定候选表可见性的是 `WIRED_EXPIRY_PROVIDERS` 而非
  `AGGREGATE_CHANNELS`（只加后者是静默失效，该陷阱已复发三次）；新增「模型选择器里为什么
  有两个 Auto」一节；复审再修正 4 处失实断言、补齐 5 处过期名单并加名单守卫。
- ⚠️ **`reasoning_effort` 的结论被上游翻盘**：10-14 那条记的「workbuddy 一律不发」已被
  **撤回**（`e261cd6`）—— 真机复测证明它是该渠道的**思考开关**（`1361706`），不发等于
  把思考关掉。

### 本仓库改动与验证

| 项           | 结果                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| 依赖锁定     | `package.json` 与 `package-lock.json` 从 `023de5f` 更新到 `0225f08ae6db4b5b2e8d3df71061c9660dee0ddb`，同步更新锁文件 |
| 契约核对     | 端点路径 / 端点名 / `inject` **均未变**；渠道集合**新增 `minimaxintl`**                                              |
| **产品代码** | **0 行**；前端产物由 `npm run build` 重建                                                                            |
| 行为测试     | **22/22 通过**；lint 与 `prettier --check . --end-of-line auto` 通过                                                 |
| 启动验证     | 契约核对通过；**19 条 provider 路由**（17 渠道 + 2 条聚合路由）；`/admin` 200；`/healthz` 正常                       |
| 真机验证     | 未做（本轮无新增账号需求）；沿用上一轮结论                                                                           |

改动文件：`package.json`、`package-lock.json`、`tests/host.test.mjs`、
`tests/admin-ui.test.mjs`、`README.md`、`CHANGELOG.md`。

### 跟随上游更新的测试期望

**① 渠道列表 + 界面导航**：`minimaxintl` 是**第二次调用 `registerMinimaxLlm`**，注册在
`minimax` 之后、`gemini` **之前**；导航由 17 项变 **18 项**（17 渠道 + 1 聚合面板）。

**② 两个 MiniMax 站要分别断言**：界面标签是 `MiniMax Code (中国版)` 与
`MiniMax Code (国际版)`。此前只写 `includes("MiniMax Code")`，**两站都命中**，
国际版被删也不会红 —— 已改为两条独立断言。

> 💡 又见「薄胶水」：上游这一轮 64 个文件、+4766 行，新增一条渠道并把国内站改了名 ——
> 本仓库的**产品代码仍是 0 行**，只更新了**测试期望**与文档。

</details>

<details>
<summary><b>2026-10-15 · 上游升级到 <code>023de5f</code>（0.2.0-rc.11）</b></summary>

依赖从 `50023bc3f462c33be5ea37bda76326fc15bc59b6` 更新到
`023de5fcd66433efbfcb08003d30e8a4db756c77`，同步更新 npm 锁文件。

### 上游变化

- **OpenCode**：适配 V2 协议与客户端工具别名，剔除门禁工具调用，避免整轮报错。
- **OfficeAce**：修复批量续期、永久积分锁定执行及 401 归因与熔断。
- **图片与工具调用**：接通 Accio 逐模型图片能力，修复工具结果内层图片丢失、空名工具调用导致的 400。
- **原生搜索**：新增 buddy / workbuddy / qoder / qodercn 搜索接线与持久化总开关；该接线依赖 DSH 宿主服务，不代表本独立网关新增搜索接口。
- **包名**：改为 `dsh-providers-hub`，客户端注册 id 同步跟随；本仓库保留 `dsh-codearts-auth` 依赖别名，现有导入与构建无需修改。

### 本仓库验证

- `npm run build` 通过，管理界面产物已重建。
- `npm test` **22/22 通过**，包含管理界面渲染、插件装配契约、18 条 provider 路由及网关反代验证。
- `npm run lint` 与 `npm run format:check` 通过，**产品代码 0 行改动**。
- 测试使用临时状态目录与独立端口，未使用真实账号进行推理验证。

</details>

<details>
<summary><b>2026-10-14 · 上游两次升级（<code>b37dbf4</code> → <code>50023bc</code>）+ 新增 Accio 渠道</b></summary>

这一天做了两轮上游升级。

### 第一次升级：`dab6a7c` → `b37dbf4`（新增 Accio 渠道）

上游增量：**11 个提交**（含分支合并共 23 个）、98 个文件、+17436 / −816 行。

**上游变化**

- **新增第 16 个渠道：Accio（阿里）** —— 脱离 IDE 的 PKCE 登录 + 免签名推理；
  并接入聚合轮换（`WIRED_EXPIRY_PROVIDERS`）。
- **minimax**：`tool-call-delta` 携带 `name`，并补齐空名 `tool_call` 防线。
- **DSML 归一化**：修标签笔误致「内容凭空消失」（补齐 `invoke` / `parameter` 空白）
  与四处真缺陷；**OfficeAce** 修「模型选择器看不到模型」（打错 host，`maasBaseUrl` 是死字段）。
- 错误处理逐条核实后修 4 处，并补回被审计证伪的净回归与两处零守卫。

**跟随上游更新：渠道列表与界面导航**

`accio` 加入，导航由 16 项变 **17 项**。⚠️ 值得记一笔的是**顺序**：本次不仅新增渠道，
`gemini` 之后的相对顺序也变了：

```
… minimax, gemini, accio, zcode, officeace, opencode, aggregate, jet-hub-auto
```

⚠️ 这个顺序**与 `src/provider-registry.ts` 里的声明顺序不同** —— 断言比的是**适配器注册
顺序**（`index.ts` 里 `registerXxxLlm` 的调用序）。我一开始按注册表文件推断，得出了错误的
插入位置；改为**让测试报出实际顺序**后再更新，并在 `EXPECTED_PROVIDERS` 旁写明这条，
免得下次再照注册表抄。

### 第二次升级：`b37dbf4` → `50023bc`（图片处理与登录失败反馈）

上游增量：**7 个提交**（含分支合并共 8 个）、21 个文件、+2608 / −235 行。

**上游变化**

- **图片**：工具结果里的图片与提问**合并为同一条消息** —— 修「模型不支持识别图片」；
  buddy 补修图片合并的漏网序列；loomy 的 `qwen-3.8-max` 远端漏报 `input_modalities`，
  补图片能力覆盖表。⚠️ 覆盖表改为**查表时归一**，修「上游改大小写即静默失效」。
- **登录失败不再无声**（IKLI7J）：OfficeAce 授权完成后若服务端凭据校验失败
  （账号未订阅 ModelArts MaaS），界面原先**零提示**、停在「正在登录…」约 5 分钟。
  根因是两条失败通路都被前端丢掉（只判 `done`、以及「删占位条目」与「还没授权完」同形）。
  补了 **`login.poll` 终态失败通道**（两侧同改）。
- **workbuddy** 发 `reasoning_effort` 会吞掉正文 —— 该渠道改为一律不发。

### 本仓库改动与验证（两轮）

| 项           | 结果                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 依赖锁定     | `package.json` 与 `package-lock.json` 指向 `50023bc3f462c33be5ea37bda76326fc15bc59b6`                                    |
| 契约核对     | 端点路径 / 端点名 / `inject` **均未变**；渠道集合新增 `accio`（第二次升级未再变）                                        |
| **产品代码** | **0 行**；前端产物由 `npm run build` 重建                                                                                |
| 行为测试     | **22/22 通过**；lint 与 `prettier --check . --end-of-line auto` 通过                                                     |
| 启动验证     | 契约核对通过；**18 条 provider 路由**（16 渠道 + 2 条聚合路由）；`/admin` 200；65 个模型                                 |
| 真机验证     | **已实测**（备用端口 + 副本状态目录）：`/v1/chat/completions` 正常；**图片输入实测可用**（1×1 红点 PNG，模型答「红色」） |

改动文件：`package.json`、`package-lock.json`、`tests/host.test.mjs`、
`tests/admin-ui.test.mjs`、`README.md`。

> 💡 又见「薄胶水」：这两轮共 119 个文件、+20000 行，新增一个完整渠道并改了两处协议 ——
> 本仓库的**产品代码仍是 0 行**，只更新了两处**测试期望**。

</details>

<details>
<summary><b>2026-10-13 · 上游升级到 <code>dab6a7c</code>（新增 OfficeAce 渠道）</b></summary>

上游增量：**14 个提交**（`d14636e` → `dab6a7c`，含分支合并共 34 个）、98 个文件、
+13644 / −1426 行。版本仍是 `0.2.0-rc.10`。

### 上游变化

- **新增第 15 个渠道：OfficeAce**（电脑果办）。本次 14 个提交里有 11 个围绕它：
  凭据改走 DSH 凭据库按 ref 索引（多账号 / 号池真正可用）、**图片输入**（多模态）、
  自动领取每日签到福利、登录与续期回填账号池 `expiresAt`、修「授权完却登录失败」、
  修「渠道老是停」的三处根因、单凭据渠道禁止重复登录、无痕窗口换账号登录。
- **DSML 工具调用标记归一化**：修「模型停住不动 / 标签当正文」。⚠️ 根因是
  OfficeAce 漏发工具定义；另补完 8 个正文出口的接线与防回归守卫。
- 审计修正若干（OfficeAce 与 DSML 两处）。

### 本仓库改动与验证

| 项           | 结果                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| 依赖锁定     | `package.json` 与 `package-lock.json` 指向 `dab6a7ca7a7321f4ed5228dc12e9a480130d188b`    |
| 契约核对     | 端点路径 / 端点名 / `inject` **均未变**；渠道集合**新增 `officeace`**                    |
| **产品代码** | **0 行**；前端产物由 `npm run build` 重建                                                |
| 行为测试     | **22/22 通过**；lint 与 `prettier --check . --end-of-line auto` 通过                     |
| 启动验证     | 契约核对通过；**17 条 provider 路由**（15 渠道 + 2 条聚合路由）；`/admin` 200；65 个模型 |
| 真机验证     | **已实测**（备用端口 + 副本状态目录）：`/v1/chat/completions` 正常                       |

改动文件：`package.json`、`package-lock.json`、`tests/host.test.mjs`、
`tests/admin-ui.test.mjs`、`tests/jet-hub.test.mjs`。

### 跟随上游更新的两处测试期望

**① 渠道列表 + 界面导航**：`officeace` 注册在 `zcode` 与 `opencode` **之间**
（顺序参与 `deepEqual` 断言），导航由 15 项变 16 项。这正是上一轮加的**双向断言**
发挥作用 —— 上游一加渠道就红，并直接报出缺哪个（若不写双向断言，这里会静默通过）。

**② 供应商级开关：订正一处「判据错套」**（我方此前的理解有偏差）

本次测试报出「关闭供应商」**成功**了（`ok: true, models: 9`），而 2026-10-11 那轮
我们断言的是「目录不完整即拒绝」。查上游源码后确认：**这是它刻意的判据分工**，
我们此前把模型级的判据错套到了供应商级上。

| 端点                              | 判据                  | 目录不完整时                             |
| --------------------------------- | --------------------- | ---------------------------------------- |
| `model.setAllDisabled`（模型级）  | `catalog.complete`    | **拒绝**、不落盘                         |
| `provider.setEnabled`（供应商级） | `catalog.remoteError` | 读**失败**才拒绝；读到但为空**照常关闭** |

上游的理由：「远端读到但为空」**正是「该供应商没有账号」的正常状态**，此时模型选择器
本就一条都选不到，用适配器兜底表落盘是自洽的；若也按 `complete` 拒绝，
**无账号的供应商将永远无法关闭**。

已按此语义订正断言（无账号环境下应关闭成功、且确实写入黑名单），并做**反向验证**
（改回旧期望确实变红，证明不是空覆盖）。

> 💡 又见「薄胶水」：上游 98 个文件、+13644 行，新增一个完整渠道（含图片输入与签到）——
> 本仓库的**产品代码仍是 0 行**，只更新了两处**测试期望**。

</details>

<details>
<summary><b>2026-10-12 · 上游两次升级（<code>224bdfa</code> → <code>d14636e</code>）+ 前端产物改为生产构建</b></summary>

这一天做了两轮上游升级，外加一处本仓库的构建修复。

### 第一次升级：`04de37c` → `224bdfa`（版本 `0.2.0-rc.3` → `0.2.0-rc.10`）

上游增量：**15 个提交**（含分支合并共 19 个）、71 个文件、+11315 / −1539 行。

**上游变化**

- **模型目录与开关一致性**（IKJW33 相邻问题）：「关闭全部 / 关闭供应商」不再只写
  **兜底子集**黑名单 —— 目录不完整时**直接拒绝并报可读原因**，不落盘、不广播。
  旧行为会让供应商显示「已关闭」而目录外的模型**依旧可选**。
- **minimax** 接上请求级换号与冷却（IKJW32）；**qoder** 补 wasm 对象释放，
  修「会话随机瞬间失败 unreachable」的根因。
- **超限回 413 而非断连**（IKKUBJ）：上限与图片声明自洽、keep-alive 不再落 5 秒。
- 一批修复：codearts 额度错误码文案不被替换（IKJVCW）、lobsterai 余额判据收紧为
  「能不能解析成数字」、raccoon 网关 499 归 aborted、DSH 会话命名失败（IKKVDH）、
  auto 用量徽标恢复（+ 计费倍率）、图片 `imageMaxBytes` 漏赋值（IKKX0T）。

**顺带修掉一条因上游语义变更而失败的测试**

`jet-hub.test.mjs` 的「供应商级开关」红了，原因是本次上游改成「目录不完整即拒绝关闭」
（见上）。测试环境没有真实账号、远端目录必然读不到，恰好命中该拒绝路径 ——
**是上游有意的正确修复，不是回归**。按新语义改成断言「**拒绝**且**不落盘**」，并加一条
「被拒绝后 `closed` 仍为 false」锁住半开状态；**反向验证**过（改回旧期望确实变红）。

### 第二次升级：`224bdfa` → `d14636e`（版本仍是 `0.2.0-rc.10`）

上游增量：**5 个提交**（含分支合并共 10 个）、23 个文件、+2869 / −627 行。

**上游变化**

- **积分操作按需自愈续期**（IKKHL5）：遇到账号过期导致积分行 401 时，自动续期后**静默
  补读账号**，用户不必手点刷新；gemini 续期补上超时。⚠️ 上游为该自愈加了**整轮预算**
  （否则 39 个账号全过期最坏要等约 39 分钟，会把症状从「积分行 401」恶化成「整个端点
  超时」）。
- **buddy** 两处修复：wire 首条为 assistant 时补最小 system（修 space-bunny 的
  `11148`）、腾讯风控指纹改写补上 assistant 正文与 DSH 直连路径。
- 文档订正：图片「100001 哨兵」与「617 px/token 外推」两条论证失实（IKKX0T 第二轮，
  **无产品行为变化**）。

### 本仓库改动：前端产物改为固定生产模式

`build.mjs` 原先按 `NODE_ENV` 切换生产 / 开发，但 **esbuild 的 `build()` 不会自己替换
`process.env.NODE_ENV`**（只有 `minify: true` 时才顺带定义）—— 于是在「不压缩」这个
默认档下，打进来的是 **React 开发版**（还会往控制台打一堆 warning），而 Dockerfile
跑的正是默认档。

这个 IIFE 只服务 `/admin`，**不存在需要开发版的场景**，故 `define` 与 `minify`
**一并写死为生产**；按环境变量切换只会让「本地产物」与「镜像产物」不是同一个东西。

### 验证（两轮升级 + 构建修复）

| 项           | 结果                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 依赖锁定     | `package.json` 与 `package-lock.json` 指向 `d14636e6d6f8d656146749dea39110a333632c9f`                                                                         |
| 契约核对     | 端点路径 / 端点名 / `inject` / 渠道集合（14 + `aggregate`）**均未变**                                                                                         |
| **产品代码** | **0 行**（仅 `build.mjs` 的构建配置，与上游无关）                                                                                                             |
| 行为测试     | **22/22 通过**；lint 与 `prettier --check . --end-of-line auto` 通过                                                                                          |
| 启动验证     | 契约核对通过；**16 条 provider 路由**；`/admin` 200；65 个模型                                                                                                |
| 真机验证     | **已实测**（备用端口 + 副本状态目录）：`/v1/chat/completions`、`/v1/responses`（回复正常）、`credits.balances` / `credits.status` / `provider.status` 均 `ok` |
| 文档         | README 重写目录与文案；CHANGELOG 说明移入 README，此处只留记录                                                                                                |

改动文件：`package.json`、`package-lock.json`、`build.mjs`、`README.md`、`CHANGELOG.md`、
`tests/jet-hub.test.mjs`。

> 💡 又见「薄胶水」：上游这两轮共 94 个文件、近 +14200 行，涉及能力注册表重构、
> 积分自愈、多处协议修复 —— 本仓库的**产品代码仍是 0 行**。

</details>

<details>
<summary><b>2026-10-12 · 本仓库：GHCR 发布版本号镜像 + admin 产物按生产模式构建</b></summary>

### GHCR 发布版本号镜像

此前工作流**任何触发**都只推 `:latest` + `:<sha>`，部署端无法钉版本。

- `.github/workflows/build-image.yml` 增加 `v*` tag 触发：推送 `v1.2.3` → 发布
  **`:1.2.3`**（去 `v` 前缀，与 registry 惯例一致）；分支 / 手动触发仍是
  `:latest` + `:<sha>`。
- 多 tag 用 bash 数组生成，**不用多行字符串** —— 后者在 YAML 块标量里会把续行缩进
  字面带进 tag 值，产出 ` ghcr.io/...` 这种带前导空格的脏 tag。已实测两种触发路径，
  `GITHUB_OUTPUT` 解析出的 tag 均无前导空格。
- 实测发布：`v1.0.0` → CI `runs/38196758067` 成功，GHCR 出现 `1.0.0`；匿名
  `docker manifest inspect ghcr.io/heatonz/codearts2api:1.0.0` 可解析出 manifest。

### admin 产物改为固定生产模式构建（跟随上游 `9c85a71`）

`build.mjs` 原按 `NODE_ENV` 切换 `minify`，而 Dockerfile 的 `npm run build` 不带
`NODE_ENV` ⇒ **镜像里打进的是 React 开发版**。上游改为显式 `define` + `minify: true`，
本仓库镜像随之拿到生产版产物。

</details>

<details>
<summary><b>2026-10-10 · 上游升级到 <code>6df19b8</code>（Token 用量记账修复 + 历史热力图）</b></summary>

上游增量：**16 个提交**（`ecbb268` → `6df19b8`）、19 个文件、+2986 / −442 行。

### 上游变化

- **Token 用量记账一系修复**：排除元数据帧的首字计时（TTFT 不再被首帧污染）、
  延续请求的账号上下文、取消传播与桶键判据、锁回收收紧、校验并隔离历史数据；
  新增**逐日删除历史用量**与历史分位数统计（p50 / p90 TPS）。
- **用量面板 UI**：历史用量改为**青色热力图**（四行），修复弹窗渲染崩溃
  （IKKGYN 浮层定位内联 + 渲染期自愈 + disposer 引用计数）。
- **样式标签加 `data-plugin` 署名**（IKK764）：避免被别的插件认领后连带删除，
  导致「Jet Hub 整套 UI 掉样式」。

### 本仓库改动与验证

| 项           | 结果                                                                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 依赖锁定     | `package.json` 与 `package-lock.json` 均指向 `6df19b88ee7cbc26d00d262dcd554f1b49e0ffae`                                                                                                      |
| 契约核对     | 端点路径 / 端点名 / `inject` / 渠道列表（14 + `aggregate`）**均未变**                                                                                                                        |
| **产品代码** | **0 行**；前端产物由 `npm run build` 重建                                                                                                                                                    |
| 行为测试     | **22/22 通过**；lint 与 `prettier --check . --end-of-line auto` 通过                                                                                                                         |
| 启动验证     | 契约核对通过；**16 条 provider 路由**；`/admin` 200；64 个模型                                                                                                                               |
| 真机验证     | **已实测**（备用端口 + 副本状态目录）：`/v1/chat/completions`、`/v1/responses` 正常；**`usage.tokenLedger` 正确记录了两次请求**（含 inputTokens / reasoningTokens / TTFT / TPS / accountId） |
| 测试修复     | 修掉「反代与直连目录比对」的偶发失败（时序竞态，详见下）                                                                                                                                     |

改动文件：`package.json`、`package-lock.json`、`tests/host.test.mjs`。

### 关于样式署名改动的一个核查

本次上游给 `<style>` 标签加了 `data-plugin` 署名，注释里大量提到宿主
`claimStyles` / `removeOwnedStyles`（`dsh-client-modules`）。已核查：这些只是**注释引用**，
代码里**没有实际调用**宿主接口 —— 而本项目用自己写的 loader shim 接管客户端装载，
没有这套归属机制。因此该改动对本仓库**无影响**，`/admin` 渲染照常。

> 💡 又一次契约零改动：上游改了 19 个文件、新增一整套用量面板与记账逻辑，
> 本仓库仅 2 行 git commit 变更（且都是自动生成）。

### 修掉一条偶发失败的测试（真缺陷，不是噪声）

`host.test.mjs` 的「反代结果应与直连完全一致」本次**偶发变红**：25 次运行红 3 次。
差异恒定是**直连多出几个 `opencode/*` 模型**。

- **根因是测试时序，不是反代出错**：上游网关的模型目录**异步长出来** ——
  `apply()` 返回时 OpenCode 匿名通道与各渠道远端目录还在路上。原测试「读一次反代
  → 读一次直连」再比对，两次之间目录长大就红。
- **修法**：逐轮**并发**读两侧直到相等（上限 15s）；刻意**不**放松成子集断言 ——
  子集会让「反代真的丢模型」也变绿。
- **反向验证**：临时改 `src/server.js` 让反代丢掉一个模型 ⇒ 该用例**确实变红**
  （否则就是空覆盖）。验证后产品代码已还原，`git diff` 确认无残留。
- **压力验证**：修复后连跑 25 次，**0 次失败**。

</details>

<details>
<summary><b>2026-10-09 · 上游升级到 <code>ecbb268</code>（额度耗尽退出候选 / 零输出改道）</b></summary>

上游增量：**6 个提交**（`3b71a7e` → `ecbb268`）、32 个文件、+4367 / −120 行。

### 上游变化

- **额度已尽的渠道退出候选**：zcode / buddy 系 / codearts / `auto` 不再把没额度的
  渠道排在前面白试（IKJW31 一系）。
- **`auto` 目标「收下请求却零输出」时顺位改道下一个渠道**（B 方案）。
- **`aggregate` 的上下文窗口改为按候选集最大值声明** —— 此前写死 200K，
  因而拿不到候选渠道真实支持的 1M 窗口。
- loomy 的 `spark-x` 窗口按真实值 262144 落地（远端虚报 1M）；
  opencode 代理出口改用与 dispatcher 同源的 fetch（IKK4BY）。

### 本仓库改动与验证

| 项           | 结果                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 依赖锁定     | `package.json` 与 `package-lock.json` 均指向 `ecbb26810eba65b39e50553e1f6e84a507ba0301`                                                                        |
| 契约核对     | 端点路径 / 端点名 / `inject` / 渠道列表（14 + `aggregate`）**均未变**                                                                                          |
| **产品代码** | **0 行**；前端产物由 `npm run build` 重建                                                                                                                      |
| 行为测试     | **22/22 通过**；lint 与 `prettier --check . --end-of-line auto` 通过                                                                                           |
| 启动验证     | 契约核对通过；**16 条 provider 路由**；`/admin` 200                                                                                                            |
| 真机验证     | **已实测**：换端口 + 副本状态目录启动，`/v1/chat/completions`、`/v1/responses` 与 **`aggregate/deepseek-v4-1-flash` 聚合转发**（跨渠道选号，1.4s）全部真实跑通 |

改动文件：`package.json`、`package-lock.json`。

> ⚠️ **偶发网络故障**（与上游无关）：官方源拉 `typescript` 时
> `ECONNRESET` 导致 `git dep preparation failed`。实测两源连通性均正常，
> 换镜像重试即成功。锁文件里的镜像地址源自首个提交，本次仅 2 行 git commit 变更。

</details>

<details>
<summary><b>2026-10-08 · 上游两次升级（<code>3f00aba</code> 新增 aggregate 聚合渠道 → <code>3b71a7e</code> 备份合并导入）</b></summary>

这一天连升两个版本：先引入聚合渠道与设置面板，随后备份能力大改。

### 第一次：`3f00aba`（新增 `aggregate` 聚合渠道与设置面板）

上游增量：**4 个提交**（`e73cd2f` → `3f00aba`）；依赖版本：`0.2.0-rc.3`。

**上游变化**

- **新增 `aggregate` provider**：把同一模型的跨渠道候选归到规范模型名下，按额度临期
  顺序选择渠道，并在尚未输出内容时支持失败切换。与 `jet-hub-auto` 共用临期探针。
- **新增聚合设置面板**：查看模型及候选渠道、设置是否参与轮换、按临期排序；
  新增聚合目录、拒绝表、实际转发渠道等 RPC。导航为 **14 个渠道 + 1 个聚合面板**，
  provider 路由为 **16 条**（含 `aggregate` / `jet-hub-auto`）。
- 修复聚合供应商一键关闭后，动态模型目录增长导致供应商被静默重新打开的问题；
  更新依赖版本号与上游文档。

**本仓库改动与验证**

| 项           | 结果                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| 依赖锁定     | `package.json` 与 `package-lock.json` 均指向 `3f00aba4c1fe1a2556f9a5032977551f2af6e820` |
| **产品代码** | **0 行**；前端产物由 `npm run build` 重建                                               |
| 契约与启动   | `npm start` 契约核对通过；16 条 provider 路由，网关正常监听                             |
| 行为测试     | **22/22 通过**；新增聚合目录与实际渠道 RPC 透传测试                                     |
| 界面验证     | jsdom 实际渲染通过，包含聚合面板，导航数量精确断言为 15                                 |
| 规范检查     | lint 通过；`prettier --check . --end-of-line auto` 通过（见下）                         |
| HTTP 冒烟    | 独立临时状态目录启动；`/healthz` 正常、`/admin` 返回 200                                |
| 真机推理     | 本轮未使用真实账号验证文本、图片或跨渠道失败切换                                        |

同步更新 provider 双向断言与 README；未修改上游源码，也未读写真实账号状态目录。

**本机环境注意事项**

- npm 11 的用户级 `allow-scripts=true` 与 Git 依赖准备阶段冲突，首轮安装报
  `EALLOWSCRIPTS`。使用临时用户配置完成安装，未修改全局配置，临时文件已清理。
- Windows 本机 `core.autocrlf=true`，工作区文件为 CRLF，默认 `npm run format:check`
  因换行符差异失败；使用 `--end-of-line auto` 后全量通过。未为本轮升级批量改写
  无关文件或更改项目格式配置。

### 第二次：`3b71a7e`（备份可选账号导入 / 合并导入）

上游增量：**9 个提交**（`3f00aba` → `3b71a7e`）、50 个文件、+7402 / −487 行。

**上游变化**

- **备份能力大改**：可**只导出选中的账号**；导入分**两种模式** ——
  「整体还原」（默认，覆盖整个账号池与模型黑名单）与**「单独导入」**
  （只追加、已存在的跳过，不动黑名单与锁定表）；并支持直接导入
  **第三方账号列表**（自动转换格式）。
- **限额账号自动沉底**：撞到限额的号让位给额度未用完的号。
- 修复重启后对话框模型消失（远端目录落地不广播 + 残缺目录被永久缓存，IKJVTF）；
  备份审计修掉 19 条缺陷（含 1 条 Critical：沉底写出 `undefined` 空洞）。

**本仓库改动与验证**

| 项           | 结果                                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| 依赖锁定     | `package.json` 与 `package-lock.json` 均指向 `3b71a7e7d02f677173a29cba0e29ca8fafe0cf85`                                    |
| 契约核对     | 端点路径 / 端点名 / `inject` / 渠道列表（14 + `aggregate`）**均未变**                                                      |
| **产品代码** | **0 行**；前端产物由 `npm run build` 重建                                                                                  |
| 启动验证     | 契约核对通过；仍为 **16 条 provider 路由**；`/admin` 200、`backup.export` 正常                                             |
| 行为测试     | **22/22 通过**；lint 与 `prettier --check . --end-of-line auto` 通过                                                       |
| 真机验证     | **已实测**：换端口 + 副本状态目录启动，`/v1/chat/completions` 与 `/v1/responses` 均真实跑通（`buddy/deepseek-v4.1-flash`） |

改动文件：`package.json`、`package-lock.json`、`README.md`。

**顺带修掉的文档过时说法**

README 原先写「**导入备份是「整体替换」，不是合并**」，并把它当作必须提醒的风险
（导入会覆盖掉 OpenCode 匿名通道）。本次上游新增 `merge` 模式后这句已不准确 ——
现改为列出两种模式及各自适用场景，并说明「只想加账号请选『单独导入』」。

> 💡 契约零改动再次印证「薄胶水」：上游新增 `accountIds` / `mode` 两个**可选**
> 参数与一整套 UI，本仓库的通用透传一条代码都不用动（默认值保持旧行为）。

</details>

<details>
<summary><b>2026-10-07 · 上游升级到 <code>e73cd2f</code>（新增 jet-hub-auto 聚合路由）</b></summary>

提交：`a4f97d8` ｜ 上游增量：**124 个提交**

### 上游变化

- **新增聚合路由 `jet-hub-auto`**：不是独立渠道，而是「在 `AUTO_PROVIDERS`
  （`codearts` / `loomy` / `zcode` / `buddy` / `workbuddy`）里按额度与限流自动挑一个」
  的入口。因此 provider 路由变 **15 条**，而 `/admin` 的渠道列表仍是 **14 个**
  （聚合路由不占 UI 一行，已实测确认）。
- zcode 冷启动首轮切号空转、边缘 CDN 的 HTML 错误页不再当业务错误报（IKJRM4）
- 账本「982.5 tok/s」离谱速率（TPS 分母塌缩）、图片能力三态判定、buddy 五档声明等

### 本仓库改动

| 项                                       | 结果                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| 契约核对（端点路径 / 端点名 / `inject`） | 未变                                                                     |
| **产品代码**                             | **0 行**                                                                 |
| 第 4 步测试                              | 先 2 处失败（见下，符合预期），修正后 **21/21 通过**                     |
| 第 5 步启动                              | 契约核对通过，**15 条 provider 路由**                                    |
| 第 6 步真机                              | 文本推理、图片输入、`/v1/responses` 均正常；目录出现 `jet-hub-auto/auto` |

改动文件：`package.json`、`package-lock.json`、`tests/host.test.mjs`、
`tests/admin-ui.test.mjs`、`README.md`。

### 修掉的两个测试缺陷

1. ✅ **上一轮加的双向断言本次发挥作用**：上游新增 `jet-hub-auto` 时
   `host.test.mjs` 准确失败并报出缺哪个 —— 不像上一轮那样静默通过。
2. ⚠️ **另一条断言过严**：`admin-ui.test.mjs` 原先断言上游 bundle 请求的外部模块
   **恰好**是 `["react", "react-dom"]`。本次上游把 `react-dom` 收进内部、只剩
   `require("react")`，而界面**照常渲染**（挂载是我们入口 `web/admin.jsx` 用
   react-dom 做的），测试却红了。已改为断言**子集**（只要求「不请求我们提供不了的
   模块」）+ 至少含 `react`：上游做减法不再误报，做加法（引入第三个依赖 → 会白屏）
   仍会准确失败。

</details>

<details>
<summary><b>2026-10-04 · 上游升级到 <code>a01fc6b</code>（新增 Gemini 渠道 + 网关新出口）</b></summary>

提交：`ea6e777` ｜ 上游增量：**94 个文件、+19190 行**

### 上游变化

- **新增第 14 个 provider：Gemini Code Assist**
- 网关新增两个出口：**`/v1/responses`**（OpenAI Responses API）
  与 **`/v1/reasoning-efforts`**（思考档位对照表）
- 思考循环中止后自动续跑、Codex 的 namespace/custom/tool_search 工具不再让整轮
  对话失败、上游状态码穿透、流式错误帧状态码门禁、trae 历史闸门删除等一批修复

### 本仓库改动

| 项           | 结果                                                                |
| ------------ | ------------------------------------------------------------------- |
| 契约核对     | 未变                                                                |
| **产品代码** | **0 行**                                                            |
| 第 4 步测试  | **21/21 通过**；lint、format:check 通过                             |
| 第 5 步启动  | 通过，**14 个渠道**                                                 |
| 第 6 步真机  | 文本推理正常；两个新出口**直接可用**；`/admin` 自动出现 Gemini 渠道 |

> 💡 两个新增出口（`/v1/responses`、`/v1/reasoning-efforts`）**没写任何代码**就能用
> —— 因为 `/v1/*` 是通用透传，不枚举端点。新增渠道同理：`/admin` 的渠道列表与
> 模型目录都是动态读的。

### 修掉的测试缺陷

⚠️ `EXPECTED_PROVIDERS` 原先只断言「期望的都在」（`includes` 子集），
于是上游**新增** `gemini` 时测试**依然全绿** —— 与 README 原先写的「新增渠道时这条
会失败」不符，那句说法当时是错的。已改为 `deepEqual` **双向断言**：增删渠道都会失败，
并在报错里直接列出期望与实际列表、告诉你去改哪里。

</details>

<details>
<summary><b>2026-10-03 · 项目起步（首个提交 / 图片输入 / ESLint + Prettier / 上游 <code>586ca00</code>）</b></summary>

这一天完成了项目落地：从首个提交到图片输入、代码规范，并走了第一次上游升级。

### 首个提交 —— `f2f4475`

把 `deepseek-harness-codearts` 的 Jet Hub 多渠道管理与本机 OpenAI 网关搬到独立后端，
**不依赖 DSH 宿主**：

- `src/host.js` —— 宿主装配（`credentials` / `attachments` / `commands` /
  `connection` / `llm` 五个服务 + 装载插件 + 契约核对）★核心
- `/admin` —— 上游 Jet Hub 设置页**原样复用**（桩掉 `slots` 把它的组件捞出来渲染）
- `POST /api/jet-hub` —— 管理 RPC 原样透传
- `PROXY_GATEWAY=1` 时 `/v1/*` 反代到插件网关（上游网关绑死 `127.0.0.1`，
  容器部署必须开）
- 状态目录独立（`~/.codearts2api`），**不读写** `~/.dsh`
- 21 条测试；Dockerfile；6 步升级流程文档

### 支持图片输入 —— `4eca014`

- 装载官方 `@deepseek-ai/dsh-attachment-local`，网关**入站落盘**与适配器
  **出站内联**两端都可用；图片存 `<CODEARTS2API_HOME>/attachments/`，
  按 sha256 内容寻址。
- `tests/attachments.test.mjs`：附件服务装配、落盘往返与内容寻址、媒体类型硬校验、
  外部链接被拒、坏图报可读错。
- ⚠️ 必须在 `ctx.plugin(plugin)` **之前**装载：插件用 `ctx.get('attachments')` 取它
  （不是 `inject`），服务缺失时**不报错**、只静默失去图片能力。
- 外部 `image_url` 仍**拒绝**（上游硬编码，防 SSRF）。是否需要支持见 README
  「待定项：是否支持外部 image_url」——已记录方案 B 与防护清单。

### 加入 ESLint 与 Prettier —— `eb14e42`

- 配置参考 `../oc2api`（`semi: false` / `printWidth: 120` / flat config）。
- **排除编译产物**：`public/admin.js`、`public/upstream-jet-hub.js`
  （构建时从上游拷贝/打包而来，约 1.6MB）。
- 新增脚本：`lint`、`lint:fix`、`format`、`format:check`。
- 启用时修掉 `build.mjs` 的一个未使用导入。

### 上游升级到 `586ca00` —— `3f8568a`

上游增量：12 个提交、35 个文件、+3883 行。变化为 zcode 双通道支持、buddy 限流误报修复、
raccoon 图片能力白名单、badge 四处展示缺陷。

| 项           | 结果                                                        |
| ------------ | ----------------------------------------------------------- |
| 契约核对     | 未变                                                        |
| **产品代码** | **0 行**（唯一改动是 `package.json` + `package-lock.json`） |
| 第 4 步测试  | **21/21 通过**                                              |
| 第 5 步启动  | 通过，13 个渠道                                             |
| 第 6 步真机  | 模型目录 7 个；文本推理与图片输入均正常                     |

> 💡 上游改了 35 个文件、+3883 行，本项目**一行代码都没动** —— 这就是
> 「薄胶水 + 复用而非拷贝」的收益。

> ⚠️ **预期行为**：若本机 DSH 正在运行，它会占用插件网关的默认
> 端口 `8326`，本仓库实例会记一条 `EADDRINUSE` 并**跳过网关启动**（管理界面与
> 其它功能不受影响）。要同时跑，换个端口：
> `DSH_OPENAI_GATEWAY_PORT=18432 npm start`。

</details>
