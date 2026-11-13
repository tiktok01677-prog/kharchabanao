# KharchaBanao — Personal Expense & Savings Planner

A standalone, local-first personal budgeting progressive web app (PWA) designed for GitHub Pages. **Purple/indigo design, independent of the previous green shopkeeping apps.**

## Features

- Transaction journal: expense/income, categories, notes, dates, edit/delete, search and filters.
- Overview with balance, monthly income/spend, recent activity, 6-month spending chart and spending split.
- Expense calendar with daily transaction markers.
- Category budget envelopes with progress and overspending indicators.
- Savings goals with planned contributions (do not affect cash balance).
- Monthly recurring templates: due indicators and manual “Record now” action (no automatic posting).
- Insights page and CSV transaction export.
- JSON full backup/restore, optional sample data, theme choice and currency **display** choice.
- Responsive desktop/mobile navigation; installable PWA with offline cache after first successful HTTPS visit.
- Privacy, help, terms and contact pages.

## GitHub Pages

1. Extract ZIP and open the `kharchabanao` folder.
2. Upload its **contents** (not a nested wrapper folder) to the root of a GitHub repository.
3. In the repo: Settings → Pages → Deploy from a branch → `main` / `/(root)`.
4. Open the published HTTPS URL. It works from project subpaths because asset URLs are relative.
5. Replace placeholders on `contact.html` and `privacy.html` with your actual developer name and support email before publishing.

## Run locally

Module scripts need an HTTP origin; double-clicking `index.html` through `file://` is not supported.

```bash
python -m http.server 8080
```

Open `http://localhost:8080` inside the `kharchabanao` folder. For offline installation, publish under HTTPS.

## Data and privacy

All personal records are stored in this origin's `localStorage`; no server API or bank integration is included. No external font, analytics, advertisement or tracking scripts are used. **Not end-to-end encrypted.** Local data can be removed by browser cleanup, WebView data clearing or app uninstall; back up regularly. Hosting providers may log normal access metadata. This app does not provide automatic exchange-rate conversion.

## Android WebView (future step)

Use a Java `Activity` that loads the published HTTPS URL, enables JavaScript + DOM storage, and handles safe navigations. Android WebView often does not download `blob:` JSON/CSV automatically; integrate a trustworthy save-file bridge and a file chooser before listing export/restore as working Android features. Test on a physical phone. The ZIP is **website source, not APK/AAB**.

Suggested Android package: `com.kharchabanao.app`.

## Tests

```bash
node --test tests/*.test.mjs
```

Core calculations and backup validation have automated tests. Mobile/WebView real-device testing is still necessary.
