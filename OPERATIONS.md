# Maintaining Rahul AI Lab

## One source of truth

The public repository is `RahulRachhoya/rahul-ai-lab`. Work from a current clone. All three demos share one small site and one deployment pipeline.

Avoid independently editing multiple copies of the site. Downloaded ZIPs are snapshots, not a synchronized working copy.

## Make a change

1. Pull the current `main` branch.
2. Create a short feature branch.
3. Change the relevant files and run `npm run check`, `npm test`, `npm run build`.
4. Preview using `npm start`. Check the affected demo on desktop and at a narrow phone width.
5. Open a pull request with the problem, resulting behavior and validation performed.
6. Confirm the workflow passes and review the diff.
7. Merge to `main`. The workflow checks the merged version before deploying.
8. Wait for the deployment job to succeed, then open the public site and try the changed behavior.

For a small browser-only edit, GitHub's file editor can create a branch and pull request. The same checks run. Never enter API keys in that editor.

## Before presenting to a client

- Open the exact public demo link.
- Enable semantic AI and wait for the ready message.
- Run the sample once to warm the model cache.
- Explain the fictional sample data and the actual model/template boundaries.
- Ask the prospect to try a different input.
- Show the result's method, source passages or category matches.
- Discuss a narrow deliverable using their own acceptance criteria.

Warm-up avoids using the first minute of a live call for model downloads. It does not change a new visitor's first-load experience.

## Deploy and recover

- **Deployment status:** repository → Actions → Check and publish demos.
- **Manual rerun:** Actions → Check and publish demos → Run workflow.
- **New fork setup:** Settings → Pages → select GitHub Actions.
- **Rollback:** revert the problem commit through a reviewed pull request; merge the revert. A fresh successful workflow republishes the previous behavior.
- **Failed tests:** deployment does not run. Correct the failure; do not remove a useful check just to make deployment green.
- **AI download failure:** use keyword mode, check provider availability and browser compatibility, then retry. The application never switches to a paid API.
- **Blank project page:** check that the Pages source is Actions and the six website files were included in the deployment artifact.

GitHub Pages publishes static files. There is no application server to restart and no database to restore.

## Keep the budget at zero

Keep this public demo repository on the free static hosting route. Do not add paid Actions runners, cloud APIs, automatic top-ups, a database or a paid domain. Check provider terms before changing hosting or adding services.

Demo traffic, asset size and external model downloads are still subject to provider limits. If a free limit is reached, reduce scope or pause the affected feature instead of enabling paid overages.

## Deliberate demo scope

Keep the public suite to three focused workflows until a concrete need justifies more:

- One short text document at a time; text/Markdown import only.
- One support message at a time; five example queues.
- Eight fictional catalog products; price and category filters.
- Downloadable results; no stored accounts or history.
- Human review; no autonomous sending, purchasing or account actions.

## Manual regression checklist

- Homepage links and direct `#sourcebook`, `#inbox`, `#catalog` URLs work.
- AI loads and displays a useful failure message if unavailable.
- Each result names the actual mode used.
- Sourcebook returns the refund source; unrelated questions can return no match.
- Text resembling HTML remains text.
- Empty and whitespace-only inputs produce helpful validation.
- Inbox can route a billing message and request manual review for weak matches.
- The editable reply is copied/exported without being sent.
- Catalog applies category and price limits before ranking; a zero budget has no products.
- Downloads contain the input, result and method shown.
- Navigation during inference does not render stale results into a different demo.
- Phone layouts fit the viewport and controls remain usable.
- No unexpected browser console errors appear.

Model/runtime updates should be deliberate. Test the real browser flow and examples again after changing a version or model.
