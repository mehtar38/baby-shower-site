'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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

  // Redirect if not joined + load stickers
  useEffect(() => {
    const id = localStorage.getItem('participantId');
    if (!id) {
      router.push('/bet');
      return;
    }

    // Load existing stickers
    fetch('/api/stickers')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load stickers');
        return res.json();
      })
      .then((data) => setStickers(data))
      .catch((err) => console.error('Load error:', err));
  }, [router]);

  const handleAddSticker = async () => {
    const id = localStorage.getItem('participantId');
    if (!id || !nameInput.trim()) return;

    const pastelColors = [
      '#ffadad',
      '#ffd6a5',
      '#fdffb6',
      '#caffbf',
      '#9bf6ff',
      '#a0c4ff',
      '#bdb2ff',
      '#ffc6ff',
    ];
    const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];

    try {
      const res = await fetch('/api/stickers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: parseInt(id),
          babyName: nameInput.trim(),
          x: 300,
          y: 200,
          color,
        }),
      });

      if (res.ok) {
        const newSticker = await res.json();
        setStickers((prev) => [...prev, newSticker]);
        setNameInput('');
        setError(null);
      } else {
        setError('Failed to add sticker. Try again!');
      }
    } catch (err) {
      setError('Network error. Are you online?');
    }
  };

  const handleDragStart = (id: number, e: React.MouseEvent | React.TouchEvent) => {
    const sticker = stickers.find((s) => s.id === id);
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
        const maxX = container.clientWidth - 100;
        const maxY = container.clientHeight - 40;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
      }

      setStickers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, x: newX, y: newY } : s))
      );
    };

    const upHandler = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 p-4 relative">
      <h1 className="text-3xl font-bold text-center text-purple-800 mb-4 pt-6">
        🎀 Baby Name Wall 🎀
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Suggest a name and place it anywhere!
      </p>

      <div className="max-w-md mx-auto mb-6 flex gap-2">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Suggest a baby name..."
          className="flex-1 p-3 rounded-full border text-black border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
          onKeyDown={(e) => e.key === 'Enter' && handleAddSticker()}
        />
        <button
          onClick={handleAddSticker}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 rounded-full font-medium"
        >
          Add
        </button>
      </div>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Sticker Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-[70vh] bg-white/50 rounded-2xl border-2 border-dashed border-purple-200 overflow-hidden"
      >
        {stickers.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No names yet! Be the first to suggest one 💖
          </div>
        ) : (
          stickers.map((sticker) => (
            <div
              key={sticker.id}
              className="absolute cursor-move px-4 py-2 rounded-xl font-bold shadow-md select-none touch-none"
              style={{
                left: `${sticker.x}px`,
                top: `${sticker.y}px`,
                backgroundColor: sticker.color,
                userSelect: 'none',
              }}
              onMouseDown={(e) => handleDragStart(sticker.id, e)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleDragStart(sticker.id, e);
              }}
            >
              {sticker.name}
            </div>
          ))
        )}
      </div>

      <p className="text-center text-sm text-gray-500 mt-4">
        Drag names to move them around!
      </p>
    </div>
  );
}