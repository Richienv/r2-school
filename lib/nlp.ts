// Pure natural-language parsers for the Hermes NL fallbacks (server-safe).

// Extract a study duration in minutes from free text.
// Handles "2hr", "2 hrs", "2 hours", "1.5 h", "2 jam", "30min", "45 minutes",
// "30 menit", and combinations like "2 hours 30 min".
export function parseDuration(text: string): number | null {
  const t = text.toLowerCase();
  let minutes = 0;
  let found = false;

  const hr = t.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|jam|h)\b/);
  if (hr) {
    minutes += Math.round(parseFloat(hr[1]) * 60);
    found = true;
  }

  const mn = t.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|min|menit|m)\b/);
  if (mn) {
    minutes += Math.round(parseFloat(mn[1]));
    found = true;
  }

  return found && minutes > 0 ? minutes : null;
}

// Map mood keywords to a 1-5 focus rating. EN + ID.
export function parseFocus(text: string): number | null {
  const t = text.toLowerCase();
  if (/(sharp|locked\s?in|lock\s?in|focused|fokus|deep work|deep|dialed|in the zone|productive|on fire)/.test(t))
    return 5;
  if (/(tired|distracted|dead|exhausted|sleepy|groggy|capek|cape|ngantuk|lelah|burnt? ?out|foggy)/.test(t))
    return 2;
  if (/(ok|okay|decent|fine|alright|so so|so-so|lumayan|biasa|average|meh)/.test(t)) return 3;
  return null;
}

// Strip duration/course noise to leave a plausible "topic" string.
export function guessTopic(text: string): string | null {
  const cleaned = text
    .replace(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|jam|h)\b/gi, " ")
    .replace(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|min|menit|m)\b/gi, " ")
    .replace(/\b(just|finished|done|did|baru|selesai|abis|habis|study|studied|belajar|review|reviewed|felt|feeling|fokus|focused|sharp|tired|of|for|the|a|an)\b/gi, " ")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length >= 3 ? cleaned : null;
}
