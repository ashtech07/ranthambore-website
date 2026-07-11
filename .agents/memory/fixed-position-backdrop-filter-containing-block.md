---
name: Fixed-position elements clipped by ancestor backdrop-filter
description: Why a `position: fixed` overlay/drawer can render tiny or clipped instead of covering the viewport, and how to fix it.
---

`backdrop-filter`, `filter`, and `transform` on an ancestor element create a new
containing block for `position: fixed` descendants (same as `transform` does).
A `fixed inset-0` child then positions/sizes itself relative to that ancestor's
box instead of the viewport — so a full-screen overlay/drawer nested inside a
blurred/translated header can end up clipped to the header's own (small)
height, exposing whatever is behind it.

**Why:** Hit this with a mobile nav drawer (`fixed inset-0`) rendered as a
child of a `<header>` that had `backdrop-blur-[2px]` applied for a glass-nav
effect. The drawer had a solid background color in its className and looked
correct by code review alone, but at runtime it was clipped to the header bar,
making the menu appear to have "no background" over the hero content below.

**How to apply:** If a full-screen `fixed` overlay/modal/drawer must live
inside (or be a sibling that shares a JSX return with) an element using
`backdrop-filter`/`filter`/`transform`, render it through a portal
(`createPortal(..., document.body)`) instead of leaving it nested — this is
the most reliable fix and avoids depending on DOM structure staying decoupled
from that ancestor.
