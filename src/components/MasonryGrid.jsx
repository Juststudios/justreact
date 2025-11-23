/*
Masonry Grid Component (React + Tailwind) — single-file component

Features:
- CSS-columns based Masonry layout (no external dependency)
- Responsive: 1 / 2 / 3 / 4 columns using Tailwind responsive utilities
- Uses `break-inside-avoid` to keep cards from breaking across columns
- Accepts `pins` as props and exposes minimal callbacks: onOpen(pin)
- Includes a lightweight PinCard (with lazy image loading and aspect handling)
- Exports both sample data and the MasonryGrid component for quick integration

Integration: drop this file into `src/components/MasonryGrid.jsx` and import:

import MasonryGrid, { SAMPLE_PINS } from './components/MasonryGrid';

<MasonryGrid pins={SAMPLE_PINS} onOpen={(pin) => console.log(pin)} />

Notes:
- For a true Pinterest feel you can pair this with the existing PinModal/boards logic you already have.
- This layout is resilient and SEO-friendly: images load in document order and columns are purely visual.
- If you want column-order preservation instead of top-to-bottom flow, use JavaScript-based Masonry libraries (Macy, Masonry, or CSS Grid with explicit row placement).
*/

import React from 'react';

// -------------------------
// Sample data (replace with API)
// -------------------------
export const SAMPLE_PINS = [
    {
        id: 'm1',
        title: 'Sunset over cottage meadow',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop',
        tags: ['sunset', 'cottagecore', 'meadow'],
        aesthetics: ['cottagecore'],
        attribution: { author: 'Unsplash Photographer', origin: 'Unsplash' },
    },
    {
        id: 'm2',
        title: 'Earthy goddess braids',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=80&auto=format&fit=crop',
        tags: ['braids', 'earthy-goddess', 'natural-hair'],
        aesthetics: ['earthy-goddess','black-girl'],
        attribution: { author: 'Photographer B', origin: 'Instagram' },
    },
    {
        id: 'm3',
        title: 'Handwoven Colombian textile',
        image: 'https://images.unsplash.com/photo-1562158070-6d8f5d3b6f6a?w=1200&q=80&auto=format&fit=crop',
        tags: ['colombian', 'textile', 'crafts'],
        aesthetics: ['colombian'],
        attribution: { author: 'Local Artisan', origin: 'Market' },
    },
    // add more sample pins as needed
];

// -------------------------
// MasonryGrid component
// -------------------------
export default function MasonryGrid({ pins = [], onOpen = () => {} }) {
    // `columns-*` utilities in Tailwind control the number of columns at breakpoints.
    // `gap-x` is the column gap, `gap-y` is the vertical gap between items.
    // Each item uses `break-inside-avoid` so it won't split between columns.

    return (
        <div className="masonry-root">
            <div
                className={`columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-x-4 gap-y-6`}
                // Tailwind doesn't produce a DOM property `column-gap` via `gap-x`, so we rely on Tailwind's generated classes.
            >
                {pins.map((p) => (
                    <article
                        key={p.id}
                        className="mb-6 break-inside-avoid rounded overflow-hidden bg-white shadow-sm"
                        onClick={() => onOpen(p)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') onOpen(p); }}
                    >
                        <PinCard pin={p} />
                    </article>
                ))}
            </div>

            {/* Minimal styles to ensure consistent gaps in environments where Tailwind `columns-*` + `gap-*` may not provide `column-gap` */}
            <style jsx>{`
        .masonry-root .columns-1 { column-gap: 1rem; }
        .masonry-root .columns-2 { column-gap: 1rem; }
        .masonry-root .columns-3 { column-gap: 1rem; }
        .masonry-root .columns-4 { column-gap: 1rem; }

        /* Safari fix: ensure images don't exceed column width */
        .masonry-root img { width: 100%; height: auto; display: block; }
      `}</style>
        </div>
    );
}

// -------------------------
// PinCard (lightweight)
// -------------------------
function PinCard({ pin }) {
    // We allow images of variable height — the card will naturally size in the column flow.
    // Show a simple caption area with title and tags.

    return (
        <div className="w-full cursor-pointer">
            <div className="relative">
                <img
                    src={pin.image}
                    alt={pin.title}
                    loading="lazy"
                    className="w-full h-auto object-cover rounded-t"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600x800?text=Image+unavailable'; }}
                />
            </div>

            <div className="p-3">
                <h3 className="text-sm font-medium leading-tight truncate">{pin.title}</h3>
                <div className="mt-2 text-xs text-gray-600 flex gap-2 flex-wrap">
                    {pin.tags?.slice(0, 4).map((t) => (
                        <span key={t} className="px-2 py-1 bg-gray-100 rounded">{t}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
