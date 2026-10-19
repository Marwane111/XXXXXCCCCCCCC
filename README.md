# TITAN / Part Six — Pinterest-inspired mobile design edition

Original mobile-first styling informed by Pinterest search results for “Netflix mobile screen UI design”. No Netflix branding or Pinterest images are bundled. English interface; Arabic red TITAN wordmark; no emoji or gold.

## Run
Extract all files to a folder, run `python -m http.server 8000` in that folder, and visit http://localhost:8000 . ES modules require HTTP hosting. Use a trusted local network to test from Android. Upload the same folder to a static HTTPS host to deploy; no deployment has been performed.

## Included
Manual featured selector (up to five loaded titles), horizontal poster rails and desktop scroll buttons, mobile SVG navigation, collection chips, loaded-catalogue search/type/genre/sort, local My List storage/export, catalogue JSON import, compact layout, native accessible detail dialog, provider page loader and error handling. No UI libraries or external fonts. Provider connection is manual so opening the app does not automatically contact it.

## Provider caveats
The catalogue adapter is provisional: live responses have not been inspected/tested for this delivery. It recognizes arrays or results/items/data/movies/tvshows arrays and explicit fields. Invalid records are omitted; unrecognized schemas fail rather than inventing titles. Catalogue pages do not imply global popularity or streaming availability. CORS, provider terms and image usage authorization require verification. No proxy or access-control bypass is included. Only TMDB HTTPS artwork URLs are permitted by this version's artwork allowlist. Change it only for trusted authorized sources.

## Import
Import JSON array or {"items": [...]} of real authorized records with id/tmdb_id/imdb_id and title/name. type is movie or tv. Optional fields: poster_path/poster, backdrop_path/backdrop, overview, year/release_date/first_air_date, original_language/language, genres (strings or name objects), vote_average/rating (0–10). No fake demo titles are supplied. Exported My List can be imported as catalogue records; it does not automatically restore saved membership.

## Scope
This is a standalone visual edition, not a complete replacement of every Part Five feature. Playback is deliberately disabled; metadata-detail network fetches, personal notes, history and full year/language filtering are not included. No playback progress, licensing, cloud accounts, global recommendation engine or superiority to Netflix is claimed. Data remains in this browser; blocked storage may prevent persistence.

## Testing
Packaging and static file/reference checks only. Browser execution, JS parsing, responsive device tests, API/CORS, accessibility behavior, performance and playback have NOT been tested. See TEST_REPORT.json. No live URL exists.

## Manual checks
Start server; check browser console; import real catalogue; use Home/Discover/My List and browser Back; search/type/genre/sort; choose featured dots; open details and Escape; save/remove/export; test malformed and oversized JSON; connect provider and test outages; test 360px/390px/desktop, zoom, keyboard focus and reduced motion.

## Visual references
https://in.pinterest.com/pin/netflix-app-uiux-redesign-concept--34691859620324784/
https://www.pinterest.com/pin/netflix-redesign-ui-concept--12666442695474545/
References are third-party concepts, not official Netflix design requirements. Artwork is not copied.
