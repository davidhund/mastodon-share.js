# mastodon-share.js

Accessible and multilingual share-on-Mastodon button that remembers your instance.

- No dependencies, pure vanilla JS (ES module)
- One shared dialog for multiple buttons on the same page
- Remembers the user's Mastodon instance in `localStorage`
- Fully configurable labels (i18n-ready)
- Accessible: uses `<dialog>`, `aria-label`, visually-hidden text

---

## Installation

**npm**

```bash
npm install do-mastodon-share
```

**Direct download**

Copy `dist/mastodon-share.min.js` into your project.

---

## Usage

Add an anchor with the class `mastodon-share` and initialize the script:

```html
<a class="mastodon-share" href="https://share.joinmastodon.org/">
  Deel via Mastodon
</a>

<script type="module">
  import initMastodonShare from 'mastodon-share.js';
  initMastodonShare();
</script>
```

On first click a dialog prompts the user for their Mastodon instance. After saving, the link is updated and the instance is stored in `localStorage` for future visits.

Multiple buttons on one page share the same stored instance and the same dialog — a single `initMastodonShare()` call initializes all of them.

---

## Options

Pass an options object directly or via a global variable declared before the module loads:

```html
<!-- Via global variable -->
<script>
  var mastodon_sharebutton = {
    dialog_save: "Save and share",
    via: "@myaccount@mastodon.social"
  };
</script>
<script type="module">
  import initMastodonShare from 'mastodon-share.js';
  initMastodonShare(mastodon_sharebutton);
</script>

<!-- Or as a direct argument -->
<script type="module">
  import initMastodonShare from 'mastodon-share.js';
  initMastodonShare({
    dialog_save: "Save and share",
    via: "@myaccount@mastodon.social"
  });
</script>
```

| Option | Default | Description |
|---|---|---|
| `anchor_class` | `"mastodon-share"` | CSS class used to find share links. |
| `hidden_class` | `"visuallyhidden"` | Class for the visually-hidden accessible text. Requires your own CSS (see [Styles](#styles)). |
| `storage_key` | `"mastodon_sharebutton_key"` | `localStorage` key used to persist the instance. |
| `linktext_share_initialized` | `"Deel via Mastodon"` | Accessible link text when an instance is stored. |
| `linktext_share_uninitialized` | *(instruction text)* | Accessible link text when no instance is set yet. |
| `edit_instance` | `"Bewerk je Mastodon-server"` | Label and `aria-label` for the edit button. |
| `dialog_label` | `"Wat is je Mastodon server?"` | Heading inside the dialog. |
| `dialog_hint` | *(example text)* | Help text next to the input field. |
| `dialog_hint_invalid` | *(error message)* | Error shown on invalid input. Use `%SERVER%` as a placeholder for the entered value. |
| `dialog_cancel` | `"Sluiten"` | Label for the dialog close button. |
| `dialog_save` | `"Ga verder"` | Label for the dialog confirm button. |
| `via` | `"@DigitaleOverheid@social.overheid.nl"` | Optional mention appended to the shared text. Set to `""` to omit. |

---

## Styles

The script adds the following class names and elements to the DOM. All visual styling is left to you.

| Selector | Element | Description |
|---|---|---|
| `.mastodon-share` | Share link | The original anchor (configurable via `anchor_class`). |
| `.mastodon-share__link` | Initialized link | Class added to the anchor after initialization. |
| `.mastodon-share__link-icon` | Icon | `<span>` containing the Mastodon SVG icon, prepended to the link. |
| `.mastodon-share__link__text` | Accessible text | Visually-hidden `<span>` with the descriptive link text. Also receives `hidden_class`. |
| `.mastodon-edit` | Edit button | Button that appears after an instance is saved. Inserted directly after the share link. |
| `.mastodon-edit__text` | Edit button text | `<span>` with the visible edit button label. |
| `.mastodon-share-dialog` | Dialog | One shared `<dialog>`, appended as the last child of `<body>`. |
| `.mastodon-share-dialog__hint` | Dialog hint | Help text next to the input; replaced with the error message on invalid input. |
| `.mastodon-share-dialog.is-invalid` | Dialog (error state) | State class added to the dialog on invalid instance input. |

### Minimal CSS example

```css
/* Required for accessibility */
.visuallyhidden {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.mastodon-share {
  display: inline-flex;
  align-items: center;
  gap: .5em;
  padding: .5em;
  background: #6364ff;
  color: #fff;
  border-radius: .375rem;
  text-decoration: none;
  font-weight: 500;
}
.mastodon-share:hover { background: #4a4bcc; }

.mastodon-share__link-icon svg { display: block; }

.mastodon-edit {
  padding: .25em .6em;
  border: 1px solid #6364ff;
  border-radius: .25rem;
  background: transparent;
  color: #6364ff;
  font: inherit;
  font-size: .85em;
  cursor: pointer;
}
.mastodon-edit:hover { background: #6364ff; color: #fff; }

.mastodon-share-dialog {
  border: 1px solid #ddd;
  border-radius: .5rem;
  padding: 1.5rem;
  max-width: 30rem;
  width: 100%;
}
.mastodon-share-dialog::backdrop { background: rgb(0 0 0 / .75); }
.mastodon-share-dialog.is-invalid input {
  border-color: #c0392b;
  outline-color: #c0392b;
}
```

---

## Development

```bash
npm install
npm run build   # format + bundle → dist/mastodon-share.min.js
```

Open `index.html` locally to try the demo.

---

## License

[EUPL-1.2](https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12)

Inspired by [codepo8/mastodon-share](https://github.com/codepo8/mastodon-share).
