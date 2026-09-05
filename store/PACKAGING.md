# Packaging & Submission Checklist — Prompt Expander

## 1. Host the privacy policy (one-time)

Simplest option — a raw GitHub link works for the CWS privacy policy field:

```bash
git add store/PRIVACY_POLICY.md manifest.json public/icons
git commit -m "Add store assets: icons, privacy policy, listing copy"
git push
```

Then use this URL in the dashboard's "Privacy policy" field:

```
https://raw.githubusercontent.com/aravindanugonda/text-expander/main/store/PRIVACY_POLICY.md
```

(If you'd rather have a real rendered page, enable GitHub Pages for this repo
under Settings → Pages, source = main branch, and use the Pages URL to
`store/PRIVACY_POLICY.md` instead — either satisfies the requirement.)

## 2. Build the upload zip

Run the packaging script, which zips only what Chrome needs (no `.git`,
`tests/`, `plan.md`, `store/`, or the prompt-library `.import.json` files):

```bash
./store/package.sh
```

This produces `dist/prompt-expander-<version>.zip` at the repo root — that's
the file you upload to the dashboard.

## 3. Chrome Web Store Developer Dashboard steps

1. Go to https://chrome.google.com/webstore/devconsole (the $5 one-time
   developer fee should already be paid since you have a profile).
2. Click **New Item** (you have 2 submission slots — this uses one, as a
   draft, until you publish).
3. Upload `dist/prompt-expander-<version>.zip`.
4. Fill in the **Store listing** tab using `store/LISTING.md`:
   - Description (short + detailed)
   - Category: Productivity
   - Language: English
   - Icon: `public/icons/icon128.png` (also used automatically from the
     manifest, but the dashboard has its own upload slot for the listing
     icon — reuse the same file)
5. Upload at least one **screenshot** (1280x800 or 640x400 px):
   - Load the unpacked extension locally (`chrome://extensions` → Developer
     Mode → Load unpacked → select this repo folder)
   - Open the popup or options page, create/use a snippet, and capture a
     screenshot showing it in action
6. Go to the **Privacy practices** tab:
   - Paste the single-purpose description from `store/LISTING.md`
   - Justify each permission (`storage`, `clipboardRead`, host permission)
     using the text in `store/LISTING.md`
   - Add the privacy policy URL from step 1
   - Complete the data-usage disclosure checkboxes (no data collected)
7. Click **Save Draft**. You do not need to click **Submit for Review** yet —
   saving as a draft is enough to have it staged in your account.

## 4. When you're ready to actually publish

Click **Submit for Review** from the dashboard. Expect a manual review delay
(often several days to ~2 weeks) because of the broad host permission and
clipboard access — this is normal and not a sign of an error in the
submission.
