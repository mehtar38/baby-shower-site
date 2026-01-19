'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Sticker {
  id: number;
  name: string;
  x: number;
  y: number;
  color: string;
}

export default function StickerWall() {
  const router = useRouter();
  const [nameInput, setNameInput] = useState('');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Redirect if not joined
  useEffect(() => {
    const id = localStorage.getItem('participantId');
    if (!id) {
      router.push('/predictions');
      return;
    }

    fetch('/api/stickers')
      .then(res => res.json())
      .then(data => setStickers(data))
      .catch(err => console.error('Load error:', err));
  }, [router]);

  const handleAddSticker = async () => {
    const id = localStorage.getItem('participantId');
    if (!id || !nameInput.trim()) return;

    const pastelColors = [
      '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf',
      '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'
    ];
    const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];

    try {
      const res = await fetch('/api/stickers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: parseInt(id),
          babyName: nameInput.trim(),
          x: 150 + Math.random() * 200,
          y: 100 + Math.random() * 200,
          color,
        }),
      });

      if (res.ok) {
        const newSticker = await res.json();
        setStickers(prev => [...prev, newSticker]);
        setNameInput('');
        setError(null);
      } else {
        setError('Failed to add name. Try again!');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleDragStart = (id: number, e: React.MouseEvent | React.TouchEvent) => {
    const sticker = stickers.find(s => s.id === id);
    if (!sticker || !containerRef.current) return;

    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startLeft = sticker.x;
    const startTop = sticker.y;

    const moveHandler = (moveE: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in moveE ? moveE.touches[0].clientX : moveE.clientX;
      const clientY = 'touches' in moveE ? moveE.touches[0].clientY : moveE.clientY;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      let newX = startLeft + deltaX;
      let newY = startTop + deltaY;

      const container = containerRef.current;
      if (container) {
        const maxX = container.clientWidth - 140; // wider note
        const maxY = container.clientHeight - 100;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
      }

      setStickers(prev =>
        prev.map(s => s.id === id ? { ...s, x: newX, y: newY } : s)
      );
    };

    const upHandler = async () => {
      // Save final position to DB
      const finalSticker = stickers.find(s => s.id === id);
      if (finalSticker) {
        try {
          await fetch(`/api/stickers/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x: finalSticker.x, y: finalSticker.y }),
          });
        } catch (err) {
          console.error('Save position failed:', err);
        }
      }

      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('touchend', upHandler);
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
    window.addEventListener('touchmove', moveHandler, { passive: false });
    window.addEventListener('touchend', upHandler);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4 relative">
      {/* Header */}
      <div className="text-center mb-6 pt-6">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">
          🎀 Baby Name Wall 🎀
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Suggest a name and place it anywhere on the wall!
        </p>
      </div>

      {/* Input Bar */}
      <div className="max-w-md mx-auto mb-6 flex gap-2">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Suggest a baby name..."
          className="flex-1 p-3 rounded-full border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
          onKeyDown={(e) => e.key === 'Enter' && handleAddSticker()}
        />
        <button
          onClick={handleAddSticker}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 rounded-full font-medium shadow-md hover:opacity-90 transition"
        >
          Add
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Sticker Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-[70vh] bg-white/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-purple-200 overflow-hidden"
      >
        {stickers.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No names yet! Be the first to suggest one 💖
          </div>
        ) : (
          stickers.map((sticker) => (
            <div
              key={sticker.id}
              className="absolute cursor-move select-none touch-none"
              style={{
                left: `${sticker.x}px`,
                top: `${sticker.y}px`,
                width: '140px',
                height: '100px',
              }}
              onMouseDown={(e) => handleDragStart(sticker.id, e)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleDragStart(sticker.id, e);
              }}
            >
              {/* 3D Sticky Note */}
              <div
                className="w-full h-full rounded-xl flex items-center justify-center p-3 text-center shadow-lg transform transition-transform hover:scale-105"
                style={{
                  backgroundColor: sticker.color,
                  fontFamily: "'Comic Sans MS', 'Marker Felt', cursive", // playful font
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                  transform: 'rotate(-1deg)',
                }}
              >
                {sticker.name}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center space-y-4">
        <p className="text-sm text-gray-500">
          Drag names to move them around!
        </p>
        <Link
          href="/"
          className="inline-block bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full text-sm text-purple-700 font-medium border border-purple-200 hover:bg-white transition"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}