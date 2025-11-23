/*
Pinterest-style Moodboard — Single-file React app (JSX)

Features included:
- Responsive image grid (Pinterest-like) using CSS Grid
- Filters by aesthetic (Cottagecore, Earthy Goddess, Black Girl, Colombian)
- Search by tag/title
- Pin modal with metadata, tags, and cultural attribution
- Boards: create boards, save/unsave pins (stored in localStorage)
- Simple upload form (mock — stores data in-memory and localStorage)
- Accessible controls and keyboard-friendly modal
- Tailwind CSS utility classes used for styling
- Small Framer Motion animation where appropriate (optional)

Installation / usage (summary):
1) Create a React app (Vite or CRA).
2) Install dependencies (optional):
   npm install react react-dom framer-motion
   (lucide-react and shadcn components are optional — this file uses inline SVGs so no extra icons are required.)
3) Setup TailwindCSS in your project (https://tailwindcss.com/docs/guides/vite)
4) Drop this file into src/App.jsx and run the dev server.

Notes: This is a single-file starting point. For production split into components and add an API for persistent assets.
*/

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MasonryGrid, { SAMPLE_PINS } from './components/MasonryGrid';


// -------------------------
// Sample pin data (replace with API calls in production)
// -------------------------
const SAMPLE_PIN = [
    {
        id: 'p1',
        title: 'Sunset over cottage meadow',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop',
        tags: ['sunset', 'cottagecore', 'meadow'],
        aesthetics: ['cottagecore'],
        attribution: { author: 'Unsplash Photographer', origin: 'Unsplash' },
    },
    {
        id: 'p2',
        title: 'Earthy goddess braids',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=80&auto=format&fit=crop',
        tags: ['braids', 'earthy-goddess', 'natural-hair'],
        aesthetics: ['earthy-goddess','black-girl'],
        attribution: { author: 'Photographer B', origin: 'Instagram' },
    },
    {
        id: 'p3',
        title: 'Handwoven Colombian textile',
        image: 'https://images.unsplash.com/photo-1562158070-6d8f5d3b6f6a?w=1200&q=80&auto=format&fit=crop',
        tags: ['colombian', 'textile', 'crafts'],
        aesthetics: ['colombian'],
        attribution: { author: 'Local Artisan', origin: 'Market' },
    },
    {
        id: 'p4',
        title: 'Boho sunset and crystals',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80&auto=format&fit=crop',
        tags: ['sunset','boho','crystals'],
        aesthetics: ['earthy-goddess'],
        attribution: { author: 'Photographer C', origin: 'Portfolio' },
    },
    {
        id: 'p5',
        title: 'Black girl braids inspiration',
        image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=1200&q=80&auto=format&fit=crop',
        tags: ['braids','natural','black-girl'],
        aesthetics: ['black-girl'],
        attribution: { author: 'Photographer D', origin: 'Studio' },
    },
    {
        id: 'p6',
        title: 'Cottage interior with teacups',
        image: 'https://images.unsplash.com/photo-1505692794405-06f1d2d8a6b9?w=1200&q=80&auto=format&fit=crop',
        tags: ['interior','cottagecore','cozy'],
        aesthetics: ['cottagecore'],
        attribution: { author: 'Designer X', origin: 'Blog' },
    },
    {
        id: 'p7',
        title: 'Colombian street festival',
        image: 'https://images.unsplash.com/photo-1549213783-8284d0336a46?w=1200&q=80&auto=format&fit=crop',
        tags: ['colombian','dance','festival'],
        aesthetics: ['colombian'],
        attribution: { author: 'Photographer E', origin: 'Documentary' },
    },
    {
        id: 'p8',
        title: 'Natural hair care routine',
        image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1200&q=80&auto=format&fit=crop',
        tags: ['natural-hair','care','black-girl'],
        aesthetics: ['black-girl'],
        attribution: { author: 'Creator Y', origin: 'YouTube' },
    },
    {
        id: 'p9',
        title: 'Wildflower path',
        image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80&auto=format&fit=crop',
        tags: ['wildflowers','path','cottagecore'],
        aesthetics: ['cottagecore'],
        attribution: { author: 'Photographer F', origin: 'Portfolio' },
    },
    {
        id: 'p10',
        title: 'Braids with beads — cultural nod',
        image: 'https://images.unsplash.com/photo-1516685304081-de7947d419d0?w=1200&q=80&auto=format&fit=crop',
        tags: ['braids','beads','culture','black-girl'],
        aesthetics: ['black-girl','earthy-goddess'],
        attribution: { author: 'Photographer G', origin: 'Archive' },
    },
    {
        id: 'p11',
        title: 'Tropical Colombian landscape',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop',
        tags: ['landscape','colombia','tropical'],
        aesthetics: ['colombian'],
        attribution: { author: 'Photographer H', origin: 'Travel' },
    },
    {
        id: 'p12',
        title: 'Handmade pottery and herbs',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80&auto=format&fit=crop',
        tags: ['pottery','herbs','earthy-goddess'],
        aesthetics: ['earthy-goddess'],
        attribution: { author: 'Maker Z', origin: 'Studio' },
    },
];

const AESTHETIC_OPTIONS = [
    { key: 'all', label: 'All' },
    { key: 'cottagecore', label: 'Cottagecore' },
    { key: 'earthy-goddess', label: 'Earthy Goddess' },
    { key: 'black-girl', label: 'Black Girl' },
    { key: 'colombian', label: 'Colombian' },
];

// -------------------------
// Utility hooks for localStorage-backed boards
// -------------------------
function useLocalStorageState(key, defaultValue) {
    const [state, setState] = useState(() => {
        try {
            const s = localStorage.getItem(key);
            return s ? JSON.parse(s) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (e) {
            // ignore
        }
    }, [key, state]);

    return [state, setState];
}

// -------------------------
// Main App
// -------------------------
export default function App() {
    const [pins, setPins] = useLocalStorageState('pins_v1', SAMPLE_PINS);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedPin, setSelectedPin] = useState(null);
    const [boards, setBoards] = useLocalStorageState('boards_v1', [
        { id: 'b-default', name: 'Favorites', pins: [] },
    ]);
    const [showBoardsPanel, setShowBoardsPanel] = useState(false);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return pins.filter((p) => {
            if (filter !== 'all' && !p.aesthetics.includes(filter)) return false;
            if (!q) return true;
            if (p.title.toLowerCase().includes(q)) return true;
            if (p.tags.some((t) => t.toLowerCase().includes(q))) return true;
            return false;
        });
    }, [pins, filter, query]);

    function toggleSave(pinId, boardId) {
        setBoards((prev) =>
            prev.map((b) => {
                if (b.id !== boardId) return b;
                const has = b.pins.includes(pinId);
                return { ...b, pins: has ? b.pins.filter((x) => x !== pinId) : [...b.pins, pinId] };
            })
        );
    }

    function createBoard(name) {
        const id = 'b-' + Math.random().toString(36).slice(2, 9);
        setBoards((prev) => [...prev, { id, name, pins: [] }]);
    }

    function handleUpload(form) {
        // Minimal client-side upload emulation — in production, POST to an API and return saved pin
        const id = 'p-' + Math.random().toString(36).slice(2, 9);
        const newPin = {
            id,
            title: form.title || 'Untitled',
            image: form.image || 'https://via.placeholder.com/800x1000?text=Uploaded',
            tags: (form.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
            aesthetics: form.aesthetics || ['cottagecore'],
            attribution: { author: form.author || 'Uploader', origin: 'User Upload' },
        };
        setPins((p) => [newPin, ...p]);
    }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Logo />
                        <h1 className="text-lg font-semibold">Moodboard — Cottagecore · Earthy · Black Girl · Colombian</h1>
                    </div>

                    <div className="ml-auto flex gap-2 items-center">
                        <SearchBar value={query} onChange={setQuery} />
                        <button
                            onClick={() => setShowBoardsPanel((s) => !s)}
                            className="px-3 py-2 rounded-md border hover:bg-gray-50"
                        >
                            Boards
                        </button>
                        <UploadButton onUpload={handleUpload} />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <FilterBar value={filter} onChange={setFilter} />

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <section className="md:col-span-2">
                        <PinGrid pins={filtered} onOpen={setSelectedPin} boards={boards} toggleSave={toggleSave} />
                    </section>

                    <aside className="hidden md:block">
                        <BoardsPanel
                            boards={boards}
                            pins={pins}
                            createBoard={createBoard}
                            toggleSave={toggleSave}
                            onClose={() => setShowBoardsPanel(false)}
                            open={showBoardsPanel}
                        />

                        <CurationNotes />
                    </aside>
                </div>
            </main>

            <AnimatePresence>
                {selectedPin && (
                    <PinModal pin={selectedPin} onClose={() => setSelectedPin(null)} boards={boards} toggleSave={toggleSave} />
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}

// -------------------------
// UI Subcomponents
// -------------------------
function Logo() {
    return (
        <div className="flex items-center gap-2">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="6" fill="#FDE68A" />
                <path d="M7 12l3 3 7-7" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}

function SearchBar({ value, onChange }) {
    return (
        <div className="relative">
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-64 px-3 py-2 border rounded-md focus:outline-none"
                placeholder="Search by tag, title, or vibe"
                aria-label="Search pins"
            />
        </div>
    );
}

function UploadButton({ onUpload }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button onClick={() => setOpen(true)} className="px-3 py-2 rounded-md border hover:bg-gray-50">
                Upload
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
                        >
                            <h3 className="text-lg font-medium mb-3">Upload mock pin</h3>
                            <UploadForm
                                onCancel={() => setOpen(false)}
                                onSubmit={(form) => {
                                    onUpload(form);
                                    setOpen(false);
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function UploadForm({ onCancel, onSubmit }) {
    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [tags, setTags] = useState('');
    const [aesthetic, setAesthetic] = useState('cottagecore');
    const [author, setAuthor] = useState('');

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({ title, image, tags, aesthetics: [aesthetic], author });
            }}
            className="space-y-3"
        >
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border px-2 py-2 rounded" />
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL" className="w-full border px-2 py-2 rounded" />
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma-separated tags" className="w-full border px-2 py-2 rounded" />
            <select value={aesthetic} onChange={(e) => setAesthetic(e.target.value)} className="w-full border px-2 py-2 rounded">
                <option value="cottagecore">Cottagecore</option>
                <option value="earthy-goddess">Earthy Goddess</option>
                <option value="black-girl">Black Girl</option>
                <option value="colombian">Colombian</option>
            </select>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author / Attribution" className="w-full border px-2 py-2 rounded" />

            <div className="flex gap-2 justify-end">
                <button type="button" onClick={onCancel} className="px-3 py-2 rounded border">
                    Cancel
                </button>
                <button type="submit" className="px-3 py-2 rounded bg-amber-400">
                    Upload
                </button>
            </div>
        </form>
    );
}

function FilterBar({ value, onChange }) {
    return (
        <div className="flex gap-3 items-center">
            {AESTHETIC_OPTIONS.map((o) => (
                <button
                    key={o.key}
                    onClick={() => onChange(o.key)}
                    className={`px-3 py-2 rounded-md border ${value === o.key ? 'bg-amber-100' : 'bg-white'}`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

function PinGrid({ pins, onOpen, boards, toggleSave }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pins.map((p) => (
                <PinCard key={p.id} pin={p} onOpen={() => onOpen(p)} boards={boards} toggleSave={toggleSave} />
            ))}
        </div>
    );
}

function PinCard({ pin, onOpen, boards, toggleSave }) {
    const heightClass = 'aspect-[4/5]';
    return (
        <div className="rounded overflow-hidden shadow-sm bg-white">
            <div className={`relative ${heightClass} cursor-pointer`} onClick={onOpen}>
                <img src={pin.image} alt={pin.title} className="w-full h-full object-cover" />

                <div className="absolute top-2 right-2 flex gap-2">
                    <BoardSaveMenu pin={pin} boards={boards} toggleSave={toggleSave} />
                </div>
            </div>

            <div className="p-3">
                <h3 className="font-medium text-sm truncate">{pin.title}</h3>
                <div className="mt-2 text-xs text-gray-600 flex gap-2 flex-wrap">
                    {pin.tags.slice(0, 3).map((t) => (
                        <span key={t} className="px-2 py-1 bg-gray-100 rounded">{t}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BoardSaveMenu({ pin, boards, toggleSave }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((s) => !s);
                }}
                className="px-2 py-1 rounded bg-white border shadow-sm text-xs"
                aria-haspopup
            >
                Save
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow p-2 z-20">
                    {boards.map((b) => {
                        const saved = b.pins.includes(pin.id);
                        return (
                            <div key={b.id} className="flex items-center justify-between py-1">
                                <span className="text-sm">{b.name}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSave(pin.id, b.id);
                                    }}
                                    className="text-xs px-2 py-1 rounded border"
                                >
                                    {saved ? 'Remove' : 'Save'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function BoardsPanel({ boards, pins, createBoard, toggleSave, open, onClose }) {
    const [name, setName] = useState('');
    return (
        <div className={`p-3 border rounded ${open ? '' : 'opacity-90'}`}>
            <h4 className="font-semibold mb-2">Boards</h4>
            <div className="space-y-2">
                {boards.map((b) => (
                    <div key={b.id} className="border rounded p-2">
                        <div className="flex items-center justify-between">
                            <strong>{b.name}</strong>
                            <span className="text-xs text-gray-600">{b.pins.length} pins</span>
                        </div>
                        <div className="mt-2 text-xs grid grid-cols-3 gap-1">
                            {b.pins.slice(0, 6).map((pid) => {
                                const p = pins.find((x) => x.id === pid);
                                if (!p) return null;
                                return <img key={pid} src={p.image} className="w-full h-12 object-cover rounded" alt="" />;
                            })}
                        </div>
                    </div>
                ))}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!name.trim()) return;
                        createBoard(name.trim());
                        setName('');
                    }}
                    className="mt-3 flex gap-2"
                >
                    <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 border px-2 py-2 rounded" placeholder="New board name" />
                    <button type="submit" className="px-3 py-2 rounded bg-amber-400">Create</button>
                </form>
            </div>
        </div>
    );
}

function CurationNotes() {
    return (
        <div className="mt-4 p-3 text-sm text-gray-700 border rounded">
            <h5 className="font-semibold">Curation notes</h5>
            <p className="mt-2">Keep content focused on the selected aesthetics. Use tags and attributions to preserve cultural context. Avoid mixing unrelated content.</p>
        </div>
    );
}

function PinModal({ pin, onClose, boards, toggleSave }) {
    useEffect(() => {
        function handler(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                className="bg-white rounded shadow-lg max-w-4xl w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <img src={pin.image} alt={pin.title} className="w-full h-96 object-cover" />
                    </div>

                    <div className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-semibold">{pin.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{pin.tags.join(' · ')}</p>
                            </div>
                            <div>
                                <button onClick={onClose} className="px-2 py-1 border rounded">Close</button>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-700">
                            <strong>Attribution:</strong>
                            <div>{pin.attribution?.author} — {pin.attribution?.origin}</div>

                            <div className="mt-3">
                                <strong>Details:</strong>
                                <p className="mt-1 text-sm">This pin belongs to: {pin.aesthetics.join(', ')}</p>
                            </div>

                            <div className="mt-3">
                                <strong>Save to board</strong>
                                <div className="mt-2 space-y-1">
                                    {boards.map((b) => (
                                        <div key={b.id} className="flex items-center justify-between">
                                            <div className="text-sm">{b.name}</div>
                                            <div>
                                                <button
                                                    onClick={() => toggleSave(pin.id, b.id)}
                                                    className="px-2 py-1 rounded border text-sm"
                                                >
                                                    {b.pins.includes(pin.id) ? 'Remove' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <hr className="my-3" />

                            <div className="text-xs text-gray-500">Be mindful of cultural context — include short notes where helpful to avoid flattening traditions.</div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function Footer() {
    return (
        <footer className="py-6 text-center text-sm text-gray-600">
            Built as a focused moodboard: Cottagecore · Earthy goddess · Black girl · Colombian culture
        </footer>
    );
}
