/**
 * Construct the Mastodon Share URL
 * @param {string} hostname
 * @param {string} text
 * @returns {string}
 */
export default function buildMastodonShareUrl(hostname, text) {
	if (!hostname || !text) {
		return "";
	}
	return `https://${hostname}/share?text=${encodeURIComponent(text)}`;
}
