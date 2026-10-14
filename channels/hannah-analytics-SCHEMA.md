# Hannah Analytics capture and rebuild contract

This file describes a new private Studio pull. The template is deliberately unconfirmed and must not be published as measured data. Do not copy missing October metrics from the September dashboard.

## Capture

Record the exact date-picker range and actual content filter for each 7, 28, 90 and 365-day window. `dataThrough` is the last date with reported data, independent of a date-picker range that may include a partial day. The dates in the template are an example ending October 12; replace them with the dates actually selected.

Each window has `metrics` and a `prior.metrics` object. Capture these numeric fields when Studio serves them:

| Field | Unit | Notes |
|---|---|---|
| `views` | count | Exact export total preferred; do not convert a rounded UI card into an exact count. |
| `watchHours` | hours | Total watch time. |
| `netSubscribers` | signed count | Subscribers gained minus lost; not the current channel subscriber count. |
| `impressions` | count | Studio impressions; exclude views not counted as impressions. |
| `ctr` | fraction | 5.6 percent is `0.056`. Capture Studio's own aggregate rate. |
| `avdSeconds` | seconds | Average view duration, not average view percentage. |
| `avp` | fraction | 37.9 percent is `0.379`. |
| `engagedViews` | count | Optional; leave absent when not available. |
| `revenue` | currency | Optional estimated revenue. Also set `currency` if captured. |

Optional `display` and `prior.display` objects preserve the exact rounded UI strings for these fields. Optional `precision` labels identify fields as `rounded`. Comparisons use the numeric captured figures; absent values are withheld.

`audience` may contain `returningViewers`, `newViewers`, `regularViewers`, `casualViewers`, `sourceDays`, `from`, `to`, `basis` (`viewers` or `watch-time`) and `note`. Do not sum daily unique viewers to create a window unique-viewer total. If Studio only serves a 28-day audience split, identify its own date range; do not imply that it belongs to a selected 7-day or yearly window.

Daily rows use the same descriptive fields plus `date`. CSV imports recognize the common Studio export headers: Date, Views, Watch time (hours), Subscribers, Impressions, Impressions click-through rate (%), Average view duration, Average percentage viewed (%), Returning viewers, New viewers and Engaged views. CSV percentage columns are converted to fractions. Inline JSON rates must already be fractions. Add each CSV path to `dailyCsvFiles`; imports merge complementary columns by date and reject conflicting numbers.

Daily charts need the exported values for CTR, average view percentage and returning/new viewers. Additive counts alone cannot populate these dimensions. A 730-day export enables the yearly prior-period chart; a current 365-day export can populate current yearly charts while leaving the prior chart unavailable. Missing dates and metrics remain gaps.

`sources` identifies each capture or export with its `id`, `label`, `kind`, `capturedAtUtc`, `scope` and relevant window/metrics. `trafficEvidence` may hold the newly observed Part 2 advertising split with `videoId`, `scope`, `totalViews`, `advertisingViews`, `advertisingShare` and `sourceRef`. It is distinct from channel-wide paid traffic.

## Existing dashboard schema

The original `window.__DASH__` has `channelId`, `channel`, `pulledAt`, `dataThrough`, `dailyDays`, `defaultDays`, `windows`, `daily`, `trend`, `uploads`, `niche` and `baseline`. Each window has five headline tiles and Clickability, Watchability and Replayability dimensions. Daily keys are `d` date, `v` views, `e` engaged views, `i` impressions, `c` CTR, `h` watch hours, `a` AVD seconds, `p` AVP, `s` net subscribers, `r` returning viewers, `n` new viewers and `q` the old fitted retention score.

The new builder preserves the 7/28/90/year selector and dimension expanders. Fresh watchability uses the measured average view percentage. It does not relabel the old fitted cross-channel retention model as a fresh result. An optional compare control overlays actual prior-period daily rows in the expanded charts. The existing Hannah dashboard has no prior-period toggle to preserve.

## Publishing boundary

Root collects the authorized Studio evidence and coordinates publication. The delegated builder may write compiled data and preview output, but must not mutate the channel HTML without explicit integration approval. `--apply` is the explicit integration action. Keep the marked public-results update separate from the Analytics source date.
