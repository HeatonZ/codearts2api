/**
 * 构建期补丁：修 OpenCode 账号导入的两处上游形状假设。
 *
 * ## 补丁一：放开 key 的 `sk-` 前缀校验
 *
 * 上游 `dsh-codearts-auth` 在 `lib/opencode-rpc.js` 里用
 * `const KEY_PATTERN = /^sk-[A-Za-z0-9_-]{20,}$/` 校验新增账号的 key。
 * OpenCode 现在的 key 已改成 `oc_sk_` 开头
 * （例：`oc_sk_6ad03dad9d70_n9YpdGWibElciBlnqho_PxFhxFtbmyqI`），
 * 旧正则把合法 key 直接判成「形状不对」，添加账号根本进不了账号池。
 * 改为只保留「字符集 + 最短长度」：`/^[A-Za-z0-9_-]{20,}$/`。
 *
 * ## 补丁二：凭据名必须能当环境变量名
 *
 * 上游用 key **最后 8 位**派生凭据名：`OPENCODE_ACCOUNT_${tail.toUpperCase()}`。
 * 新 key 尾段可能含 `-`（如 `C9Az-jQD`），而 `@deepseek-ai/dsh-credentials`
 * 的 `REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/` 只收 shell 标识符字符，
 * 于是直接抛 `credential ref "OPENCODE_ACCOUNT_C9AZ-JQD" must match ...`。
 * 修法：尾段非法字符换成 `_`，再拼「整把 key」的短哈希消歧（避免 A-B / A_B
 * 撞名）；账号 id 仍用原尾段，所以「同 key 重复添加复用同一账号」不变。
 *
 * ## 为什么必须带断言
 *
 * 补丁改的是 `node_modules` 里的**上游构建产物**。上游下一次改这个文件时，
 * 字面量可能变样，静默失败会让「已修好」变成假象 —— 所以：
 * 找不到目标就**直接让构建失败**（exit 1），而不是打出一句 warning 继续。
 * 也是幂等的：已经补过时直接通过。
 *
 * 用法（镜像构建里在 `npm run build` 之后执行）：
 *   node scripts/patch-upstream.mjs
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"

const require = createRequire(import.meta.url)

/** 上游包的 package.json 路径（用解析而不是硬编码目录层级）。 */
const upstreamPkg = require.resolve("dsh-codearts-auth/package.json")
const upstreamRoot = dirname(upstreamPkg)

const RPC_FILE = join(upstreamRoot, "lib", "opencode-rpc.js")
const CLIENT_BUNDLE = join(process.cwd(), "public", "upstream-jet-hub.js")

/** 新形状：不限前缀，只要求 20 位以上的 URL-safe 字符（分号由原文保留，不要写进来）。 */
const NEW_PATTERN_BODY = "const KEY_PATTERN = /^[A-Za-z0-9_-]{20,}$/"
const NEW_PATTERN_LINE = `${NEW_PATTERN_BODY};`

/** 旧正则（上游原始写法，不含行尾分号 —— 分号由后面的原样文本保留），用于断言「确实还停在旧形态」。 */
const OLD_PATTERN_RE = /const KEY_PATTERN = \/\^sk-\[A-Za-z0-9_-\]\{20,\}\$\//

/** 旧错误文案片段 → 新文案。 */
const OLD_MESSAGE = "应以 sk- 开头、至少 20 位"
const NEW_MESSAGE = "应为 20 位以上的字母/数字/下划线/连字符"

// ── 补丁二：slotNamesOf 的凭据名净化 ─────────────────────────────────
/** 上游原样的整个 slotNamesOf 函数体。 */
const OLD_SLOT_RE =
  /function slotNamesOf\(apiKey\) \{\s*const tail = apiKey\.slice\(-8\);\s*return \{ id: `\$\{OPENCODE\.id\}-\$\{tail\.toLowerCase\(\)\}`, refName: `OPENCODE_ACCOUNT_\$\{tail\.toUpperCase\(\)\}` \};\s*\}/

/** 替换实现：id 保持原尾段（沿用去重语义），refName 净化成合法标识符。 */
const NEW_SLOT_IMPL = [
  "function slotNamesOf(apiKey) {",
  "    const tail = apiKey.slice(-8);",
  // 净化：非 [A-Za-z0-9_] 一律变 _（凭据名要能当环境变量名）。
  "    const safeTail = tail.toUpperCase().replace(/[^A-Za-z0-9_]/g, '_');",
  // 短哈希消歧：净化会丢信息（A-B 与 A_B 都变 A_B），加哈希保证唯一。
  "    const disambiguator = createHash('sha256').update(apiKey).digest('hex').slice(0, 4).toUpperCase();",
  "    return { id: `${OPENCODE.id}-${tail.toLowerCase()}`, refName: `OPENCODE_ACCOUNT_${safeTail}_${disambiguator}` };",
  "}",
].join("\n")

/** 补丁二是否已生效（特征串，与执行顺序无关）。 */
const SLOT_PATCHED_MARK = "const safeTail = tail.toUpperCase().replace(/[^A-Za-z0-9_]/g, '_');"

/** 上游 import crypto 的方式（补丁二要用 createHash）。 */
const OLD_CRYPTO_IMPORT = "import { randomBytes } from 'node:crypto';"
const NEW_CRYPTO_IMPORT = "import { randomBytes, createHash } from 'node:crypto';"

function patchRpcFile() {
  if (!existsSync(RPC_FILE)) {
    throw new Error(`找不到上游 RPC 文件：${RPC_FILE}`)
  }
  const before = readFileSync(RPC_FILE, "utf8")
  let after = before
  const states = []

  // ① KEY_PATTERN：去掉 sk- 前缀锚点。
  if (after.includes(NEW_PATTERN_LINE)) {
    states.push("pattern: skipped (already patched)")
  } else {
    if (!OLD_PATTERN_RE.test(after)) {
      throw new Error(
        "上游 opencode-rpc.js 里没找到预期的 KEY_PATTERN 字面量 —— " +
          "上游多半改了 key 校验写法，请人工复核后再更新本补丁（不要静默放过）。",
      )
    }
    after = after.replace(OLD_PATTERN_RE, NEW_PATTERN_BODY)
    if (after.includes(OLD_MESSAGE)) after = after.split(OLD_MESSAGE).join(NEW_MESSAGE)
    states.push("pattern: patched")
  }

  // ② slotNamesOf：凭据名净化 + 哈希消歧。
  if (after.includes(SLOT_PATCHED_MARK)) {
    states.push("refName: skipped (already patched)")
  } else {
    if (!OLD_SLOT_RE.test(after)) {
      throw new Error(
        "上游 opencode-rpc.js 里没找到预期的 slotNamesOf 实现 —— " +
          "上游多半改了凭据名派生方式，请人工复核后更新本补丁（不要静默放过）。",
      )
    }
    after = after.replace(OLD_SLOT_RE, NEW_SLOT_IMPL)
    if (after.includes(OLD_CRYPTO_IMPORT)) {
      after = after.replace(OLD_CRYPTO_IMPORT, NEW_CRYPTO_IMPORT)
    }
    states.push("refName: patched")
  }

  if (after === before && states.every((s) => s.includes("skipped"))) {
    return { state: states.join("; "), content: before }
  }
  writeFileSync(RPC_FILE, after)
  return { state: states.join("; "), content: after }
}

function patchClientHint() {
  if (!existsSync(CLIENT_BUNDLE)) {
    return "skipped (no client bundle)"
  }
  const before = readFileSync(CLIENT_BUNDLE, "utf8")
  const OLD_HINT = "形如 sk-…"
  const NEW_HINT = "形如 sk-… 或 oc_sk_…"
  if (!before.includes(OLD_HINT)) {
    return before.includes(NEW_HINT) ? "skipped (already patched)" : "skipped (hint not found)"
  }
  const after = before.split(OLD_HINT).join(NEW_HINT)
  writeFileSync(CLIENT_BUNDLE, after)
  const count = after.split(NEW_HINT).length - 1
  return `patched (${count} hint)`
}

const rpc = patchRpcFile()
const hintState = patchClientHint()
console.log(`[patch-upstream] opencode-rpc.js: ${rpc.state}`)
console.log(`[patch-upstream] client hint: ${hintState}`)

// 终检：每一条都必须真的成立。
const finalContent = readFileSync(RPC_FILE, "utf8")
const failures = []
if (!finalContent.includes(NEW_PATTERN_LINE)) failures.push("KEY_PATTERN 未改成无前缀形态")
if (OLD_PATTERN_RE.test(finalContent)) failures.push("仍有 sk- 前缀正则残留")
if (finalContent.includes(OLD_MESSAGE)) failures.push("错误文案仍是「应以 sk- 开头」")
if (!finalContent.includes(SLOT_PATCHED_MARK)) failures.push("slotNamesOf 未净化凭据名")
if (!finalContent.includes("${safeTail}_${disambiguator}")) failures.push("凭据名未带哈希消歧后缀")
if (!finalContent.includes("createHash")) failures.push("缺少 createHash 导入/调用")
if (failures.length > 0) {
  throw new Error(`补丁终检失败：\n- ${failures.join("\n- ")}`)
}
console.log("[patch-upstream] OK")
