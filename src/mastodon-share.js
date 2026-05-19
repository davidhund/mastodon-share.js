import buildMastodonShareUrl from "./utils/build-mastodon-share-url.js";
import {
	deleteLocalStorage,
	readLocalStorage,
	writeLocalStorage,
} from "./utils/local-storage.js";
import normalizeHostName from "./utils/normalize-hostname.js";

/**
 * @module mastodon-share.js
 * @description
 * Accessible and multilingual share-on-Mastodon button
 * that remembers your instance.
 * Inspired by https://github.com/codepo8/mastodon-share
 * @author digitaleoverheid.nl
 * @license EUPL-1.2
 */

/**
 * Initialize Mastodon Share Button(s)
 * - Only labels are options, id's / classes are fixed
 * @param {object} mastodon_sharebutton options: could be globally defined
 */
export default function initMastodonShare(mastodon_sharebutton = {}) {
	const defaults = {
		version: "4.0.0",
		anchor_class: "mastodon-share",
		hidden_class: "visuallyhidden",
		storage_key: "mastodon_sharebutton_key",
		linktext_share_initialized: "Deel via Mastodon",
		linktext_share_uninitialized:
			"Om deze pagina te delen via Mastodon, voer je eerst je server in",
		edit_instance: "Bewerk je Mastodon-server",
		dialog_label: "Wat is je Mastodon server?",
		dialog_hint:
			"Bijvoorbeeld: mastodon.social, mastodon.online, mas.to of social.overheid.nl.",
		dialog_hint_invalid:
			"'%SERVER%' is geen geldige server naam zoals bijvoorbeeld 'mastodon.social' of 'social.overheid.nl'.",
		dialog_cancel: "Sluiten",
		dialog_save: "Ga verder",
		via: "@DigitaleOverheid@social.overheid.nl",
	};

	const options = { ...defaults, ...mastodon_sharebutton };

	const anchors = document.querySelectorAll(`.${options.anchor_class}`);
	if (!anchors.length) return;

	// Shared stored instance
	let storedInstance = readLocalStorage(options.storage_key);
	const isLocalStorageAvailable = storedInstance !== -1;
	if (!isLocalStorageAvailable) storedInstance = null;

	// Create ONE shared dialog
	const _dialogID = `mastodon_dialog_${crypto.randomUUID()}`;
	document.body.insertAdjacentHTML(
		"beforeend",
		`<dialog id="${_dialogID}" class="mastodon-share-dialog" aria-labelledby="${_dialogID}-label" closedby="any">
			<form method="dialog" class="mastodon-share-dialog__form">
				<label class="mastodon-share-dialog__label" id="${_dialogID}-label" for="${_dialogID}-input">${options.dialog_label}</label>
				<p class="mastodon-share-dialog__hint" id="${_dialogID}-hint">${options.dialog_hint}</p>
				<input class="mastodon-share-dialog__input" name="instance" data-1p-ignore data-bwignore data-lpignore="true" data-form-type="other" id="${_dialogID}-input" type="text" value="" aria-describedby="${_dialogID}-hint" autofocus="">
				<button class="mastodon-share-dialog__save" type="submit" value="save" id="${_dialogID}-save">${options.dialog_save}</button>
				<button class="mastodon-share-dialog__cancel" type="button" value="cancel" id="${_dialogID}-cancel">${options.dialog_cancel}</button>
			</form>
		</dialog>`,
	);
	const dialog = document.getElementById(_dialogID);

	// Tracks which anchor last triggered the dialog (for window.open on save)
	let activeAnchor = null;

	function openDialog(anchor) {
		if (!dialog) return;
		activeAnchor = anchor;
		const input = dialog.querySelector('input[type="text"]');
		if (input && storedInstance) input.value = storedInstance;
		dialog.returnValue = "";
		dialog.showModal();
	}

	function resetDialogState() {
		if (!dialog) return;
		dialog.classList.remove("is-invalid");
		const hint = dialog.querySelector(`#${_dialogID}-hint`);
		if (hint) hint.innerText = options.dialog_hint;
	}

	function setDialogInvalidState(detail) {
		if (!dialog) return;
		dialog.classList.add("is-invalid");
		const hint = dialog.querySelector(`#${_dialogID}-hint`);
		if (hint) {
			hint.innerText = options.dialog_hint_invalid.replace("%SERVER%", detail);
		}
		openDialog(activeAnchor);
	}

	// Initialize each anchor; collect instances for bulk updates on dialog save
	const instances = [...anchors].map((anchor) =>
		initSingleAnchor(
			anchor,
			options,
			isLocalStorageAvailable,
			storedInstance,
			(a) => openDialog(a),
		),
	);

	// Dialog events — wired once, shared across all anchors
	if (dialog) {
		const dialog_close_button = dialog.querySelector('button[value="cancel"]');

		dialog.addEventListener("close", () => {
			resetDialogState();
			if (dialog.returnValue !== "save") return;

			const input = dialog.querySelector('input[type="text"]');
			let updated = null;

			if (input?.value) {
				updated = normalizeHostName(input.value);
				if (!updated) {
					setDialogInvalidState(input.value);
					return;
				}
				input.value = updated;
				dialog.returnValue = updated;
			}

			if (updated !== storedInstance) {
				storedInstance = updated;
				if (updated) {
					writeLocalStorage(options.storage_key, updated);
					for (const inst of instances) inst.setInstance(updated);
					window.open(activeAnchor?.getAttribute("href"), "_blank");
				} else {
					deleteLocalStorage(options.storage_key);
					for (const inst of instances) inst.removeInstance();
				}
			}
		});

		if (dialog_close_button) {
			dialog_close_button.addEventListener("click", () => {
				dialog.close("cancel");
			});
		}

		// Fallback for browsers without closedby="any" support
		dialog.addEventListener("click", (event) => {
			if (event.target === dialog) dialog.close("cancel");
		});
	}
}

/**
 * Initialize a single share anchor
 * @param {HTMLAnchorElement} anchor
 * @param {object} options
 * @param {boolean} isLocalStorageAvailable
 * @param {string|null} initialStoredInstance
 * @param {function} triggerOpenDialog  called with the anchor element to open the shared dialog
 * @returns {{ setInstance: Function, removeInstance: Function }}
 */
function initSingleAnchor(
	anchor,
	options,
	isLocalStorageAvailable,
	initialStoredInstance,
	triggerOpenDialog,
) {
	const _anchorID = `mastodon_share_${crypto.randomUUID()}`;
	anchor.setAttribute("id", _anchorID);
	const org_href = anchor.getAttribute("href");
	let storedInstance = initialStoredInstance;

	if (storedInstance) setAnchorHref();

	anchor.classList.add(`mastodon-share__link`);
	anchor.innerText = "";

	const _icon = document.createElement("span");
	_icon.innerHTML = `<svg role="presentation" height="1em" viewBox="0 0 74 79" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M73.7014 17.4323C72.5616 9.05152 65.1774 2.4469 56.424 1.1671C54.9472 0.950843 49.3518 0.163818 36.3901 0.163818H36.2933C23.3281 0.163818 20.5465 0.950843 19.0697 1.1671C10.56 2.41145 2.78877 8.34604 0.903306 16.826C-0.00357854 21.0022 -0.100361 25.6322 0.068112 29.8793C0.308275 35.9699 0.354874 42.0498 0.91406 48.1156C1.30064 52.1448 1.97502 56.1419 2.93215 60.0769C4.72441 67.3445 11.9795 73.3925 19.0876 75.86C26.6979 78.4332 34.8821 78.8603 42.724 77.0937C43.5866 76.8952 44.4398 76.6647 45.2833 76.4024C47.1867 75.8033 49.4199 75.1332 51.0616 73.9562C51.0841 73.9397 51.1026 73.9184 51.1156 73.8938C51.1286 73.8693 51.1359 73.8421 51.1368 73.8144V67.9366C51.1364 67.9107 51.1302 67.8852 51.1186 67.862C51.1069 67.8388 51.0902 67.8184 51.0695 67.8025C51.0489 67.7865 51.0249 67.7753 50.9994 67.7696C50.9738 67.764 50.9473 67.7641 50.9218 67.7699C45.8976 68.9569 40.7491 69.5519 35.5836 69.5425C26.694 69.5425 24.3031 65.3699 23.6184 63.6327C23.0681 62.1314 22.7186 60.5654 22.5789 58.9744C22.5775 58.9477 22.5825 58.921 22.5934 58.8965C22.6043 58.8721 22.621 58.8505 22.6419 58.8336C22.6629 58.8167 22.6876 58.8049 22.714 58.7992C22.7404 58.7934 22.7678 58.794 22.794 58.8007C27.7345 59.9796 32.799 60.5746 37.8813 60.5733C39.1036 60.5733 40.3223 60.5733 41.5447 60.5414C46.6562 60.3996 52.0437 60.1408 57.0728 59.1694C57.1983 59.1446 57.3237 59.1233 57.4313 59.0914C65.3638 57.5847 72.9128 52.8555 73.6799 40.8799C73.7086 40.4084 73.7803 35.9415 73.7803 35.4523C73.7839 33.7896 74.3216 23.6576 73.7014 17.4323ZM61.4925 47.3144H53.1514V27.107C53.1514 22.8528 51.3591 20.6832 47.7136 20.6832C43.7061 20.6832 41.6988 23.2499 41.6988 28.3194V39.3803H33.4078V28.3194C33.4078 23.2499 31.3969 20.6832 27.3894 20.6832C23.7654 20.6832 21.9552 22.8528 21.9516 27.107V47.3144H13.6176V26.4937C13.6176 22.2395 14.7157 18.8598 16.9118 16.3545C19.1772 13.8552 22.1488 12.5719 25.8373 12.5719C30.1064 12.5719 33.3325 14.1955 35.4832 17.4394L37.5587 20.8853L39.6377 17.4394C41.7884 14.1955 45.0145 12.5719 49.2765 12.5719C52.9614 12.5719 55.9329 13.8552 58.2055 16.3545C60.4017 18.8574 61.4997 22.2371 61.4997 26.4937L61.4925 47.3144Z" fill="inherit"/></svg>`;
	_icon.classList.add(`mastodon-share__link-icon`, "icon");
	anchor.prepend(_icon);

	anchor.insertAdjacentHTML(
		"beforeend",
		`<span id="${_anchorID}_explainer" class="mastodon-share__link__text ${options.hidden_class}">${storedInstance ? options.linktext_share_initialized : options.linktext_share_uninitialized}</span>`,
	);
	const hiddenSpan = document.getElementById(`${_anchorID}_explainer`);

	anchor.insertAdjacentHTML(
		"afterend",
		`<button ${!isLocalStorageAvailable || !storedInstance ? "hidden" : ""} id="${_anchorID}_edit" class="mastodon-edit" aria-label="${options.edit_instance}">
			<span class="mastodon-edit__text">${options.edit_instance}</span>
		</button>`,
	);
	const editButton = document.getElementById(`${_anchorID}_edit`);

	anchor.addEventListener("click", onShareClick);

	if (editButton) {
		editButton.addEventListener("click", (event) => {
			event.preventDefault();
			triggerOpenDialog(anchor);
		});
	}

	function onShareClick(event) {
		if (storedInstance) return event;
		event.preventDefault();
		triggerOpenDialog(anchor);
	}

	function setAnchorHref() {
		anchor.setAttribute(
			"href",
			storedInstance
				? buildMastodonShareUrl(
						storedInstance,
						[
							document.title,
							location.href,
							options?.via ? `via ${options.via}` : "",
						]
							.filter(Boolean)
							.join("\n"),
					)
				: org_href,
		);
	}

	function setInstance(val) {
		storedInstance = val;
		setAnchorHref();
		if (hiddenSpan) hiddenSpan.innerText = options.linktext_share_initialized;
		if (editButton) editButton.removeAttribute("hidden");
	}

	function removeInstance() {
		storedInstance = null;
		setAnchorHref();
		if (hiddenSpan) hiddenSpan.innerText = options.linktext_share_uninitialized;
		if (editButton) editButton.setAttribute("hidden", true);
	}

	return { setInstance, removeInstance };
}
