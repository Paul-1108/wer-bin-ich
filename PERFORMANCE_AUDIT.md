# Performance Audit

Audit-Ziel: Lighthouse Performance Mobile mindestens 80.

## Ergebnis

Gemessen gegen den lokalen Production-Build unter `http://localhost:3000`.

| Messung | Score | FCP | LCP | TBT | CLS | Speed Index |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Nach Optimierung | 98 | 0.8 s | 2.3 s | 80 ms | 0 | 0.8 s |

Der Report liegt in `lighthouse-performance.json`.

## Behobene Punkte

1. Font-Last reduziert: `app/layout.tsx` laedt nur noch `Figtree` statt `Figtree`, `Geist` und `Geist_Mono`.
2. Font-Rendering optimiert: `next/font` nutzt `display: "swap"`, damit Text waehrend des Font-Ladevorgangs sichtbar bleibt.
3. Unnoetiges JavaScript auf der Startseite reduziert: `SetSelection` ist jetzt eine Server Component mit Server-Form statt Client-State, `useRouter` und clientseitiger Zod-Validierung.

## Hinweise

- Die App rendert keine `<img>`-Elemente auf der geprueften Startseite; deshalb war `next/image` hier kein sinnvoller Optimierungspunkt.
- Nach der Optimierung meldet Lighthouse als groesstes verbleibendes Potential `Reduce unused JavaScript` mit ca. 59 KiB Einsparung. Der Score liegt trotzdem deutlich ueber dem Zielwert.
