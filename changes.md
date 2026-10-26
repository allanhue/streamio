# Playback window fix and future guidance

## What changed

- Removed the sandboxed third-party iframe playback path that could show “This content can’t be embedded in a sandboxed frame.”
- Kept direct HLS playback in Streamio’s built-in player.
- For non-HLS providers, the play buttons open the provider URL in a separate, unsandboxed browser window.
- Reuses one named `streamio-player` window so repeated play actions navigate the same window instead of creating more player tabs.
- Allows only absolute `http:` and `https:` stream URLs before opening them. Invalid or unsupported URLs are not opened.
- Shows an in-app message if the browser blocks the player window.
- Applied the same play behavior to the watch page, series page, and dashboard.

The shared implementation is in `app/components/open_stream_button.tsx` and `app/lib/watch.ts`.

## Important limitation

The reusable-window behavior limits windows opened by Streamio. It does **not** prevent the third-party provider page from opening links, pop-ups, or navigating that window. Once playback is loaded as a top-level page on another site, browser same-origin rules prevent Streamio from controlling that page.

Do not claim that a single-window limit blocks third-party navigation. To block navigation originating inside a player, playback must run in a controllable surface, such as:

- Streamio’s built-in player for direct media formats it supports (for example, HLS).
- An embed or player API whose provider explicitly supports the required playback and navigation controls.

An iframe sandbox can prevent some navigation and pop-ups, but may also stop a provider player from working and cause the embedding error. Do not add or remove sandbox permissions as a guess; verify the provider’s documented requirements and test playback.

##  implementation checklist

1. Keep all non-HLS “Play in new window” actions routed through `OpenStreamButton` and `openStreamWindow`; do not add one-off `window.open`, raw external links, or `_blank` buttons for player URLs.
2. Validate the complete URL before opening it. Accept only explicitly supported schemes; never treat an invalid URL as a successful open.
3. Reuse the named player window when the product requires a single player window. This is a usability limit, not a security boundary.
4. Keep direct HLS sources in the built-in player when supported; do not route them through a third-party page unnecessarily.
5. If a future requirement is to block provider links, first identify a provider-supported embed/API or a direct media source. Do not assume Streamio can filter links on a cross-origin page.
6. Test from every playback entry point (watch page, series, dashboard, and any newly added surface): valid provider URL, invalid URL, HLS URL, browser pop-up blocking, and repeated play clicks.
7. Before changing iframe or window behavior, inspect the provider URL and its documentation, then test in the production browser environment. Confirm the player starts and the original Streamio page remains available.

## Verification

```powershell
npx eslint app/lib/watch.ts app/components/open_stream_button.tsx app/ui/dashboard.tsx app/series/page.tsx app/watch/page.tsx
npx tsc --noEmit
```

