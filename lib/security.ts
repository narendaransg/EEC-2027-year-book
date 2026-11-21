const ALLOWED_HOUSES = new Set([
  'House Stark',
  'House Targaryen',
  'House Lannister',
  'House Baratheon',
  'House Tyrell',
  'House Martell',
  'House Arryn',
  'House Tully',
  'House Greyjoy',
]);

// Core profanity & slur patterns (matched against normalized lowercase text)
const BLOCKED_TERMS = [
  'fuck',
  'fucker',
  'fucking',
  'motherfucker',
  'bitch',
  'bitches',
  'bastard',
  'asshole',
  'dickhead',
  'cunt',
  'slut',
  'whore',
  'nigger',
  'nigga',
  'faggot',
  'retard',
  'retarded',
  'chutiya',
  'madarchod',
  'behenchod',
  'bhenchod',
  'bhosdike',
  'gandu',
  'randi',
  'harami',
  'lavde',
  'laude',
  'thevdiya',
  'punda',
  'otha',
  'oombu',
  'sunni',
];

function normalizeForFilter(input: string): string {
  return input
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[^a-z\s]/g, '');
}

export function containsProfanity(input: string): boolean {
  if (!input) return false;
  const normalized = normalizeForFilter(input);
  const words = normalized.split(/\s+/).filter(Boolean);
  const collapsed = normalized.replace(/\s+/g, '');

  for (const term of BLOCKED_TERMS) {
    if (words.includes(term)) return true;
    if (term.length >= 5 && collapsed.includes(term)) return true;
  }
  return false;
}

export function sanitizeText(
  raw: unknown,
  maxLen: number,
  options: { multiline?: boolean } = {}
): string {
  let str = String(raw ?? '');

  // Strip zero-width & control characters
  str = str.replace(/[\u200B-\u200D\uFEFF]/g, '');
  if (options.multiline) {
    str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    str = str.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  } else {
    str = str.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ');
  }

  // Neutralize raw angle brackets
  str = str.replace(/[<>]/g, '');

  return str.trim().slice(0, maxLen);
}

export function sanitizeHouse(raw: unknown): string {
  const cleaned = sanitizeText(raw, 40);
  if (ALLOWED_HOUSES.has(cleaned)) return cleaned;
  return 'House Stark';
}

export function validateSafeHttpUrl(raw: unknown, maxLen = 260): {
  valid: boolean;
  url: string | null;
  error?: string;
} {
  const cleaned = sanitizeText(raw, maxLen);
  if (!cleaned) return { valid: true, url: null };

  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return {
        valid: false,
        url: null,
        error: 'Only HTTP or HTTPS links are allowed.',
      };
    }
    if (parsed.username || parsed.password) {
      return {
        valid: false,
        url: null,
        error: 'Links with embedded credentials are not allowed.',
      };
    }
    return { valid: true, url: parsed.toString() };
  } catch {
    return {
      valid: false,
      url: null,
      error: 'Please enter a valid Spotify or YouTube URL.',
    };
  }
}

export function validateImageBuffer(
  buffer: Buffer,
  mimeType: string
): { valid: boolean; ext: string; error?: string } {
  const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
  if (buffer.byteLength === 0) {
    return { valid: false, ext: '', error: 'Empty image file.' };
  }
  if (buffer.byteLength > MAX_BYTES) {
    return { valid: false, ext: '', error: 'Portrait must be under 4 MB.' };
  }

  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!allowedTypes.has(mimeType)) {
    return {
      valid: false,
      ext: '',
      error: 'Only JPG, PNG, or WebP portraits are allowed.',
    };
  }

  // Verify actual magic bytes
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;
  const isPng =
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const isWebp =
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';

  if (isJpeg) return { valid: true, ext: 'jpg' };
  if (isPng) return { valid: true, ext: 'png' };
  if (isWebp) return { valid: true, ext: 'webp' };

  return {
    valid: false,
    ext: '',
    error: 'Uploaded file does not match a valid JPG, PNG, or WebP image.',
  };
}
