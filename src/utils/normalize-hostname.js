/**
 * Normalize user input to hostname only (no protocol/path)
 * @param {string} rawInput
 * @returns {string | null}
 */
export default function normalizeHostName(rawInput) {
	// Remove:
	// - protocol
	// - whitespace
	// - trailing slash
	const trimmed = String(rawInput)
		.replace(/https?:\/\//gi, "")
		.replace(/\s/g, "")
		.replace(/\/$/g, "")
		.trim();

	if (!trimmed) return null;
	// Test for tld-ness
	if (!trimmed.match(/\.\w{2,}/)) return null;
	try {
		const instanceUrl = new URL(`https://${trimmed}`);
		return instanceUrl.hostname;
	} catch {
		return null;
	}
}
