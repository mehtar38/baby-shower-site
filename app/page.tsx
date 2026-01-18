// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  // 👶 Update this to the real due date!
  const EXPECTED_DUE_DATE = new Date('2026-06-15');

  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const calculateDays = () => {
      const today = new Date();
      const diffTime = EXPECTED_DUE_DATE.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays > 0 ? diffDays : 0);
    };

    calculateDays();
    const interval = setInterval(calculateDays, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  // 💖 Fun facts about the parents (customize these!)
  const funFacts = [
    "Met while studying abroad in Spain 🇪🇸",
    "Share a love for hiking and sourdough bread 🥖",
    "Once drove cross-country in a van named 'Luna' 🚐",
    "Can’t agree on whether pineapple belongs on pizza 🍍"
  ];

  // 📸 Your uploaded photos
  const babyPhotos = [
    '/images/baby1.jpg',
    '/images/baby1.jpg',
    // Add more if you like!
  ].filter(src => src); // remove empty if needed

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mt-6">
          Welcome to Baby Mehta’s Shower! 👶
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          A place to guess, suggest, and celebrate!
        </p>
      </header>

      {/* Countdown */}
      <section className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-6 mb-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Due Date Countdown</h2>
        {daysLeft !== null ? (
          <div className="text-5xl font-bold text-purple-600">{daysLeft}</div>
        ) : (
          <div className="text-2xl">...</div>
        )}
        <p className="text-gray-600 mt-1">
          {daysLeft === 0 ? 'Baby could arrive any moment!' : 'days until baby arrives!'}
        </p>
      </section>

      {/* Photos */}
      {babyPhotos.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Baby Sneak Peeks</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {babyPhotos.map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-md border-2 border-white">
                <img
                  src={src}
                  alt={`Baby photo ${i + 1}`}
                  className="w-40 h-40 md:w-48 md:h-48 object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fun Facts */}
      <section className="max-w-2xl mx-auto bg-white/70 rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">About the Parents</h2>
        <ul className="space-y-2">
          {funFacts.map((fact, i) => (
            <li key={i} className="flex items-start">
              <span className="text-pink-500 mr-2">•</span>
              <span className="text-gray-700">{fact}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Action Buttons */}
      <section className="max-w-xs mx-auto grid grid-cols-1 gap-4">
        <Link
          href="/predictions"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-full text-center shadow-lg hover:opacity-90 transition"
        >
          Make Predictions 🎲
        </Link>
        <Link
          href="/wall"
          className="bg-gradient-to-r from-blue-400 to-teal-400 text-white font-bold py-4 px-6 rounded-full text-center shadow-lg hover:opacity-90 transition"
        >
          Suggest Names 🏷️
        </Link>
      </section>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        Made with love for Baby Mehta 💖
      </footer>
    </div>
  );
}