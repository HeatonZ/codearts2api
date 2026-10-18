/**
 * OpenCode 账号 key 形状校验（回归断言）。
 *
 * ## 背景
 *
 * OpenCode 的 API key 已从 `sk-…` 改成 `oc_sk_…`（例：
 * `oc_sk_6ad03dad9d70_n9YpdGWibElciBlnqho_PxFhxFtbmyqI`）。
 * 上游 `dsh-codearts-auth` 的形状校验仍写着 `/^sk-[A-Za-z0-9_-]{20,}$/`，
 * 会把新 key 直接拒掉 —— 本项目在镜像构建期打补丁放开前缀
 * （见 `scripts/patch-upstream.mjs`）。
 *
 * 这个测试**走真实 RPC**（HTTP `/api/jet-hub` → 上游 handleOpencodeRpc），
 * 断言补丁确实生效。补丁若被上游改版冲掉，这里会立刻红。
 *
 * ⚠️ 只断言「形状校验放行」，不断言 key 有效：有效性要等真实请求才知，
 * 这里也不该拿真 key 发外网。
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import { startTestApp, rpc } from "./helpers.mjs"

/** 用户实际提供的 `oc_sk_` 形态 key（形状测试用，非真实凭据）。 */
const OC_KEY = "oc_sk_6ad03dad9d70_n9YpdGWibElciBlnqho_PxFhxFtbmyqI"

/** 传统 `sk-` 形态仍须放行（老 key 尚在池里）。 */
const SK_KEY = `sk-${"a".repeat(48)}`

/**
 * 用户实际踩到的那把 key：尾段 `C9Az-jQD` 含连字符。
 *
 * 上游用它派生凭据名 `OPENCODE_ACCOUNT_C9AZ-JQD`，而凭据名只能是 shell
 * 标识符（`[A-Za-z_][A-Za-z0-9_]*`），于是抛
 * `credential ref ... must match` —— 这是独立于 `sk-` 前缀的第二个坑。
 */
const HYPHEN_TAIL_KEY = "oc_sk_e931bde41a37_D8ijTPYPtvTSEwY_2k21wGluC9Az-jQD"

test("opencode.addAccount 接受尾段带连字符的 key（凭据名净化）", async (t) => {
  const app = await startTestApp()
  t.after(() => app.close())

  const result = await rpc(app.origin, "opencode.addAccount", { apiKey: HYPHEN_TAIL_KEY })
  assert.equal(result?.ok, true, `尾段含 - 的 key 应被接受，实际：${JSON.stringify(result)}`)

  // 凭据名必须能通过 credentials 的 REF_PATTERN（这里顺带核对它真的被净化了）。
  const listed = await rpc(app.origin, "account.list", { provider: "opencode" })
  const entry = listed?.value?.accounts?.find((a) => a.id === result.value.accountId)
  assert.ok(entry, "账号应出现在账号列表")
  assert.match(
    entry.credentialRef,
    /^[A-Za-z_][A-Za-z0-9_]*$/,
    `凭据名必须是合法标识符，实际：${entry.credentialRef}`,
  )
})

test("opencode.addAccount 接受 oc_sk_ 前缀的新 key", async (t) => {
  const app = await startTestApp()
  t.after(() => app.close())

  const result = await rpc(app.origin, "opencode.addAccount", { apiKey: OC_KEY })
  assert.equal(result?.ok, true, `oc_sk_ key 应被接受，实际：${JSON.stringify(result)}`)
  assert.ok(result.value?.accountId, "应返回 accountId")
})

test("opencode.addAccount 仍接受 sk- 前缀的老 key", async (t) => {
  const app = await startTestApp()
  t.after(() => app.close())

  const result = await rpc(app.origin, "opencode.addAccount", { apiKey: SK_KEY })
  assert.equal(result?.ok, true, `sk- key 应被接受，实际：${JSON.stringify(result)}`)
})

test("opencode.addAccount 仍挡住明显的残缺输入", async (t) => {
  const app = await startTestApp()
  t.after(() => app.close())

  const cases = [
    { label: "空串", apiKey: "" },
    { label: "只有前缀", apiKey: "sk-" },
    { label: "过短", apiKey: "oc_sk_short" },
    { label: "含空格", apiKey: "oc_sk_6ad03dad 9d70n9YpdGWibElciBlnqho" },
    { label: "占位符", apiKey: "<your-api-key-here>" },
  ]
  for (const { label, apiKey } of cases) {
    const result = await rpc(app.origin, "opencode.addAccount", { apiKey })
    assert.equal(result?.ok, false, `${label} 应被拒绝，实际：${JSON.stringify(result)}`)
  }
})

test("重复 key 复用同一账号，而非新建两个额度桶", async (t) => {
  const app = await startTestApp()
  t.after(() => app.close())

  const first = await rpc(app.origin, "opencode.addAccount", { apiKey: OC_KEY })
  const second = await rpc(app.origin, "opencode.addAccount", { apiKey: OC_KEY })
  assert.equal(first?.ok, true)
  assert.equal(second?.ok, true)
  assert.equal(second.value?.existed, true, "第二次应标记为已存在")
  assert.equal(second.value?.accountId, first.value?.accountId, "账号 id 应一致")
})
