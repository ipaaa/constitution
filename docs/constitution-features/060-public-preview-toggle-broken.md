---
id: 060
title: "?public=true 預覽開關失效"
status: design
source: constitution-features/056 第二節 B1a
started:
completed:
verdict:
score: 0.5
worktree:
issue:
pr:
mod-block:
---

修好 `?public=true` 預覽開關，讓它真的把站鎖成公開三頁，成為可用的預覽工具。

## Problem

`LaunchGate.tsx:32`、`Navbar.tsx:34`、`TrackCards.tsx:31` 三處的真分支取的是 `LAUNCHED_PAGES` 而非 `PUBLIC_PAGES`。因為 `NEXT_PUBLIC_PUBLIC_MODE` 未設時 `LAUNCHED_PAGES === ALL_PAGES`，所以開了 `?public=true` 也還是看到全部頁面——這個開關現在鎖不住任何東西。

## Proposed approach

三處的真分支改取 `PUBLIC_PAGES`。

**這只修預覽開關，不是上線控制。** feature `056` 的 design stage 已判定「夥伴看全部、公眾看三頁」這個目標在現行架構下做不到（無登入機制，前端 `localStorage` 可被繞過），該目標已移除。本票交付的是一個給自己看的預覽工具，不得被當成公開後的可見性控制。

## Out of scope

不建立登入或權限機制。不處理 `noindex` 的移除（屬 `056` 的 gate）。
