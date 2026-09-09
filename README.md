# Rahul AI Lab

Three small, interactive demonstrations by **Rahul Rachhoya**. Built to let prospective clients try a specific workflow, inspect its result, and discuss a custom project.

**Demo collection:** https://rahulrachhoya.is-a.dev/rahul-ai-lab/

**Source:** https://github.com/RahulRachhoya/rahul-ai-lab

| Demo | Try it | What it demonstrates |
| --- | --- | --- |
| Sourcebook | [Document discovery](https://rahulrachhoya.is-a.dev/rahul-ai-lab/#sourcebook) | Chunking text, semantic retrieval, source references, abstention |
| Inbox Pilot | [Support triage](https://rahulrachhoya.is-a.dev/rahul-ai-lab/#inbox) | Category similarity, rule-based priority, editable template replies |
| Catalog Compass | [Product discovery](https://rahulrachhoya.is-a.dev/rahul-ai-lab/#catalog) | Semantic ranking, strict category/price filters, inspectable matches |

These are original portfolio demos, not client implementations or production services. All sample businesses, orders, products and prices are fictional.

## Try it in a minute

1. Open one demo. Use the sample or enter non-sensitive text.
2. Run it immediately in **Keyword mode**, or choose **Enable semantic AI** to download the language model.
3. In semantic mode, run the same example again and inspect the source passages or matching scores.
4. Change the input, compare the result, and download it as JSON.

No account or API key is required. The model takes time and browser memory to download and initialize. Inference speed depends on the visitor's device. Keyword mode remains available when a device or network cannot load AI.

### Three reproducible walkthroughs

- **Sourcebook:** ask “How long does a refund take?” The sample refund paragraph states 5–10 business days after inspection. Then replace the source text with your own short handbook and ask a relevant question. Retrieved passages are quotations, not generated answers.
- **Inbox Pilot:** try the duplicate-charge sample. Inspect the suggested billing queue, rule-based review priority and editable reply. Try an unrelated or vague message to exercise manual review.
- **Catalog Compass:** describe something to block out office noise. The noise-cancelling headphones should rank prominently in semantic mode. Set the maximum price to 40 to see the strict budget filter remove them. Set it to 0 to test the empty state.

The numeric scores describe similarity or keyword overlap. They are not calibrated probabilities, business accuracy claims or measured client outcomes.

## Honest AI boundaries

The site has two explicitly labelled modes:

- **Semantic AI:** `Xenova/all-MiniLM-L6-v2` sentence embeddings, quantized to q8, through Transformers.js 3.8.1 and ONNX Runtime in a Web Worker. Vectors are mean-pooled and normalized; ranking uses their dot product (cosine similarity).
- **Keyword mode:** meaningful-word overlap, with simple plural normalization. Document search also weights matching section titles.

Inbox priority always uses disclosed keyword rules. Reply drafts always use templates. No language model writes the replies. This implementation is not a general chatbot or a complete retrieval-augmented generation system.

Semantic retrieval uses deliberately simple demo thresholds and category examples. These are heuristics, not validated confidence calibration. A source can contain incorrect information; retrieving it does not make it true. A production project needs a representative evaluation set and requirements specific to its business.

## Cost and data flow

The selected deployment uses a **public GitHub repository and GitHub Pages**, with standard GitHub-hosted Actions. No paid AI API, server, database, domain purchase or paid plan is needed for this implementation.

Visitors download the model and runtime, then inference runs on their devices. There is no application backend, analytics integration, email sender or payment integration. The code does not upload entered documents or messages. Model assets may be cached by the browser; a bounded in-memory embedding cache is cleared when the worker/page is discarded.

External requests still occur:

- GitHub Pages serves site assets.
- jsDelivr serves the pinned Transformers.js runtime and its dependencies.
- Hugging Face serves model files.
- Google Fonts serves the typefaces.

These providers can receive ordinary connection metadata such as an IP address. Downloads use the visitor's bandwidth and computation uses their device resources. Browser caches are managed by the browser. Free services have limits and can change their policies; this is not a promise of unlimited or permanently free hosting.

No secret belongs in the frontend or this repository. Do not use confidential client data during a public demo.

## Run locally

Requires Node.js 22 or later. There are no npm package dependencies to install.

```sh
git clone https://github.com/RahulRachhoya/rahul-ai-lab.git
cd rahul-ai-lab
npm start
```

Open `http://127.0.0.1:4174/rahul-ai-lab/`.

```sh
npm run check
npm test
npm run build
```

The build copies only the six public website files into `dist/`. The local server uses an explicit allowlist; it does not expose documentation, tests or tool metadata. Use HTTP locally: module workers do not reliably work from `file://`.

## Delivery pipeline

```text
Feature branch → pull request → syntax + logic tests + static build
                                      ↓
                              review and merge to main
                                      ↓
                          checks → website artifact → Pages
```

`.github/workflows/pages.yml`:

1. Runs syntax checks and the logic tests on pull requests and pushes to `main`.
2. Produces a website-only build.
3. Publishes only after the check job passes, and only from `main`.
4. Uses GitHub's short-lived deployment permissions; no personal token is embedded.

Set the repository's **Settings → Pages → Source** to **GitHub Actions**. For a fork, use the same setting and update the public URLs. Hash routes and relative asset paths support project subdirectories.

Workflow gates do not replace branch protection: maintainers can still edit repository settings or workflows. Browser AI and CDN availability are checked manually; the logic test suite does not download a model.

For updates and rollback, see [OPERATIONS.md](OPERATIONS.md).

## Project map

| File | Purpose |
| --- | --- |
| `index.html`, `styles.css`, `favicon.svg` | Accessible responsive site and visual identity |
| `app.mjs` | Three interactive demos, navigation, validation, exports |
| `core.mjs` | Fictional sample data and testable retrieval/routing helpers |
| `ai-worker.mjs` | Model loading and local embedding inference |
| `core.test.mjs` | Meaningful tests for retrieval, filters, safety and edge cases |
| `build.mjs`, `server.mjs` | Static build and local preview |
| `.github/workflows/pages.yml` | Checks and deployment |

## From demo to a client project

Each demo intentionally has one narrow job. A custom project starts with a business outcome, a representative set of sample inputs, and acceptance criteria.

- **Sourcebook expansion:** document formats, permissions, ingestion updates, reliable citations and an evaluated answer-generation layer.
- **Inbox expansion:** approved inbox integration, business-specific categories, real policy context, review controls and delivery tracking.
- **Catalog expansion:** a real product feed, attribute extraction, retrieval evaluation, availability updates and shop integration.

Those are possible future scopes, not features included here. Customer hosting and model costs must be assessed separately; these demos do not commit Rahul to paying a client's operating costs.

Discuss a project through the [Rahul Studio contact flow](https://rahulrachhoya.is-a.dev/rahul-studio/#contact).

## Upstream references

- [Transformers.js](https://huggingface.co/docs/transformers.js/index)
- [Model card and model assets](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- [GitHub Pages documentation](https://docs.github.com/en/pages)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [Official Pages deployment action](https://github.com/actions/deploy-pages)

Upstream libraries and model weights retain their own licenses. Model weights are downloaded from their provider and are not committed to this repository.
