/**
 * 构建期补丁：放开 OpenCode API key 的 `sk-` 前缀硬校验。
 *
 * ## 为什么要打这个补丁
 *
 * 上游 `dsh-codearts-auth` 在 `lib/opencode-rpc.js` 里用
 * `const KEY_PATTERN = /^sk-[A-Za-z0-9_-]{20,}$/` 校验新增账号的 key。
 * OpenCode 现在的 key 已改成 `oc_sk_` 开头
 * （例：`oc_sk_6ad03dad9d70_n9YpdGWibElciBlnqho_PxFhxFtbmyqI`），
 * 旧正则把合法 key 直接判成「形状不对」，添加账号根本进不了账号池。
 *
 * ## 补丁做了什么
 *
 * 1. 把前缀要求去掉，只保留「字符集 + 最短长度」的形状校验
 *    （挡手滑/占位符，不承担有效性验证）：`/^[A-Za-z0-9_-]{20,}$/`。
 * 2. 改掉错误文案里「应以 sk- 开头」的过时说法。
 * 3. `public/upstream-jet-hub.js` 里「形如 sk-…」的提示同步补上 `oc_sk_…`
 *    （纯文案，找不到就只告警，不失败）。
 *
 * ## 为什么必须带断言
 *
 * 补丁改的是 `node_modules` 里的**上游构建产物**。上游下一次改这个文件时，
 * 正则字面量可能变样，静默失败会让「已修好」变成假象 —— 所以：
 * 找不到目标就**直接让构建失败**（exit 1），而不是打出一句 warning 继续。
 * 也是幂等的：已经补过（正则已是新值）时直接通过。
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

/** 新形状：不限前缀，只要求 20 位以上的 URL-safe 字符。 */
const NEW_PATTERN_LINE = "const KEY_PATTERN = /^[A-Za-z0-9_-]{20,}$/;"

/** 旧正则（上游原始写法），用于断言「确实还停在旧形态」。 */
const OLD_PATTERN_RE = /const KEY_PATTERN = \/\^sk-\[A-Za-z0-9_-\]\{20,\}\$\//

/** 旧错误文案片段 → 新文案。 */
const OLD_MESSAGE = "应以 sk- 开头、至少 20 位"
const NEW_MESSAGE = "应为 20 位以上的字母/数字/下划线/连字符"

function patchRpcFile() {
  if (!existsSync(RPC_FILE)) {
    throw new Error(`找不到上游 RPC 文件：${RPC_FILE}`)
  }
  const before = readFileSync(RPC_FILE, "utf8")

  // 幂等：已经是我们写的正则 → 直接返回。
  if (before.includes(NEW_PATTERN_LINE)) {
    return "skipped (already patched)"
  }
  if (!OLD_PATTERN_RE.test(before)) {
    throw new Error(
      "上游 opencode-rpc.js 里没找到预期的 KEY_PATTERN 字面量 —— " +
        "上游多半改了 key 校验写法，请人工复核后再更新本补丁（不要静默放过）。",
    )
  }

  let after = before.replace(OLD_PATTERN_RE, NEW_PATTERN_LINE)
  if (after.includes(OLD_MESSAGE)) {
    after = after.split(OLD_MESSAGE).join(NEW_MESSAGE)
  }
  if (after === before) {
    throw new Error("补丁未产生任何变化，拒绝继续（说明匹配到但替换失败）。")
  }
  writeFileSync(RPC_FILE, after)
  return "patched"
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

const rpcState = patchRpcFile()
const hintState = patchClientHint()
console.log(`[patch-upstream] opencode-rpc.js: ${rpcState}`)
console.log(`[patch-upstream] client hint: ${hintState}`)

// 终检：文件里必须真的只剩新形态，没有遗留的 sk- 前缀锚点。
const finalContent = readFileSync(RPC_FILE, "utf8")
if (!finalContent.includes(NEW_PATTERN_LINE) || OLD_PATTERN_RE.test(finalContent)) {
  throw new Error("补丁终检失败：opencode-rpc.js 仍是旧形态。")
}
if (finalContent.includes(OLD_MESSAGE)) {
  throw new Error("补丁终检失败：错误文案仍是旧说法。")
}
console.log("[patch-upstream] OK")
