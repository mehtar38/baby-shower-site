'use client';

import { useState, useEffect, useRef } from 'react';

interface Sticker {
  id: number;
  name: string;
  x: number;
  y: number;
  color: string;
}

export default function StickerWall() {
  const [nameInput, setNameInput] = useState('');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggedPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Load stickers on mount
  useEffect(() => {
    fetch('/api/stickers')
      .then(res => res.json())
      .then(data => {
        console.log('Loaded stickers:', data);
        setStickers(data);
      })
      .catch(err => {
        console.error('Load error:', err);
        setError('Failed to load names');
      });
  }, []);

  const handleAddSticker = async () => {
    if (!nameInput.trim()) {
      setError('Please enter a name!');
      return;
    }

    const pastelColors = [
      '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf',
      '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'
    ];
    const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];

    // Calculate random position within container bounds
    const container = containerRef.current;
    const maxX = container ? container.clientWidth - 160 : 300;
    const maxY = container ? container.clientHeight - 120 : 300;
    
    const x = Math.random() * Math.max(0, maxX);
    const y = Math.random() * Math.max(0, maxY);

    try {
      const res = await fetch('/api/stickers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: null, // Not required anymore
          babyName: nameInput.trim(),
          x: Math.round(x),
          y: Math.round(y),
          color,
        }),
      });

      if (res.ok) {
        const newSticker = await res.json();
        console.log('Added sticker:', newSticker);
        setStickers(prev => [...prev, newSticker]);
        setNameInput('');
        setError(null);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to add name');
      }
    } catch (err) {
      console.error('Add sticker error:', err);
      setError('Network error');
    }
  };

  const handleDragStart = (id: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
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
        const maxX = container.clientWidth - 160;
        const maxY = container.clientHeight - 120;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
      }

      // Store the current dragged position
      draggedPositionRef.current = { x: newX, y: newY };

      setStickers(prev =>
        prev.map(s => s.id === id ? { ...s, x: newX, y: newY } : s)
      );
    };

    const upHandler = async () => {
      // Save final position to DB using the ref
      if (draggedPositionRef.current) {
        const { x, y } = draggedPositionRef.current;
        try {
          const res = await fetch(`/api/stickers/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x: Math.round(x), y: Math.round(y) }),
          });
          
          if (res.ok) {
            console.log(`Saved position for sticker ${id}:`, { x, y });
          } else {
            console.error('Failed to save position');
          }
        } catch (err) {
          console.error('Save position error:', err);
        }
        draggedPositionRef.current = null;
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
    <div className="min-h-screen bg-[#f5f0ff] p-4 relative">
      {/* Header */}
      <div className="text-center mb-6 pt-6">
        <h1 className="text-3xl font-bold text-blue-950 mb-2">
          🎀 Baby Name Wall 🎀
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Suggest a name and add it to the wall!
        </p>
      </div>

      {/* Input Bar */}
      <div className="max-w-md mx-auto mb-6 flex gap-2">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Suggest a baby name..."
          className="flex-1 p-3 rounded-full border border-blue-950 focus:outline-none focus:ring-2 focus:ring-purple-300 text-blue-950"
          onKeyDown={(e) => e.key === 'Enter' && handleAddSticker()}
        />
        <button
          onClick={handleAddSticker}
          className="bg-purple-400 text-white px-6 rounded-full font-medium shadow-md hover:opacity-90 transition"
        >
          Add
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}

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
                width: '130px',
                height: '90px',
              }}
              onMouseDown={(e) => handleDragStart(sticker.id, e)}
              onTouchStart={(e) => handleDragStart(sticker.id, e)}
            >
              {/* 3D Sticky Note */}
              <div
                className="w-full h-full rounded-xl flex items-center justify-center p-3 text-center shadow-lg transform transition-transform hover:scale-105"
                style={{
                  backgroundColor: sticker.color,
                  fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                  color: 'black',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                  transform: `rotate(${(sticker.id % 5) - 2}deg)`,
                  wordWrap: 'break-word',
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
        {/* <p className="text-sm text-gray-500">
          Drag names to move them around! {stickers.length} name{stickers.length !== 1 ? 's' : ''} on the wall
        </p> */}
        <button
          onClick={() => window.location.href = '/'}
          className="inline-block bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full text-sm text-purple-700 font-medium border border-purple-200 hover:bg-white transition"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}