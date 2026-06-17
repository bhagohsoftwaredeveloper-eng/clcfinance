import { NextResponse } from 'next/server';

// Pick a fresh verse on every request (no static caching of this route).
export const dynamic = 'force-dynamic';

/**
 * Curated list of encouraging verses. We pick a random one on each load, while
 * keeping the list curated so pure-random obscure passages (e.g. genealogies)
 * never show up on the login screen.
 */
const VERSE_REFERENCES = [
  'John 3:16', 'Philippians 4:13', 'Jeremiah 29:11', 'Psalm 23:1', 'Proverbs 3:5-6',
  'Isaiah 41:10', 'Romans 8:28', 'Joshua 1:9', 'Philippians 4:6-7', 'Psalm 46:1',
  'Matthew 6:33', 'Psalm 118:24', '2 Corinthians 5:7', 'Isaiah 40:31', 'Psalm 27:1',
  'Romans 12:2', 'Galatians 5:22-23', 'Hebrews 11:1', 'Psalm 119:105', 'Matthew 11:28',
  'John 14:6', 'Psalm 37:4', 'Proverbs 16:3', 'Lamentations 3:22-23', '2 Timothy 1:7',
  'Psalm 91:1', 'Nehemiah 8:10', 'Colossians 3:23', 'James 1:5', 'Micah 6:8', 'Zephaniah 3:17',
];

const FALLBACK = {
  text: 'I can do all things through Christ who strengthens me.',
  reference: 'Philippians 4:13',
};

export async function GET() {
  const reference = VERSE_REFERENCES[Math.floor(Math.random() * VERSE_REFERENCES.length)];

  try {
    // The verse text for a given reference never changes, so we can still cache
    // each individual verse for a day. The randomness comes from which one we pick.
    const res = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}`, {
      next: { revalidate: 86_400 },
    });

    if (res.ok) {
      const data = await res.json();
      const text = (data.text || '').replace(/\s+/g, ' ').trim();
      if (text) {
        return NextResponse.json({ text, reference: data.reference || reference });
      }
    }
  } catch {
    // fall through to the built-in fallback below
  }

  return NextResponse.json(FALLBACK);
}
