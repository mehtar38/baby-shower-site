'use client';

import { useState, useEffect } from 'react';
// import dynamic from 'next/dynamic';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

declare global {
  interface Window {
    confetti?: unknown;
  }
}


export default function BetPage() {
  // Participant state (will be replaced by real join flow)
  const [participant, setParticipant] = useState<{ name: string; relation: string } | null>(null);
  const [participantId, setParticipantId] = useState<number | null>(null);

  // Prediction state
  const [gender, setGender] = useState<'boy' | 'girl' | null>(null);
  const [weightKg, setWeightKg] = useState<number>(3.2); // kg
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  // Form step: which full-screen view to show
  const [currentStep, setCurrentStep] = useState<'join' | 'gender' | 'weight' | 'date' | 'submitted'>('join');

  // Auto-advance on selection (except join)
  useEffect(() => {
  // Only run on client
  if (typeof window === 'undefined') return;

  // Load confetti once
  import('canvas-confetti').then((mod) => {
    (window as any).confetti = mod.default;
  });
}, []);

useEffect(() => {
  if (!gender) return;

  const fireConfetti = () => {
    const confettiFn = (window as any).confetti;
    if (!confettiFn) return;

    const colors = gender === 'boy'
      ? ['#a0cfff', '#7fbfff']
      : ['#ffc6d9', '#ffadd9'];

    confettiFn({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });
  };

  // Small delay to ensure DOM is ready
  const timer = setTimeout(fireConfetti, 100);
  return () => clearTimeout(timer);
}, [gender]);

useEffect(() => {
  if (currentStep === 'gender' && gender) {
    const timer = setTimeout(() => setCurrentStep('weight'), 800);
    return () => clearTimeout(timer);
  }

  if (currentStep === 'date' && dueDate) {
    const timer = setTimeout(() => handleSubmit(), 800);
    return () => clearTimeout(timer);
  }
}, [gender, dueDate, currentStep]);

  // Format kg → "3 kg 200 g"
  const formatWeightKg = (kg: number): string => {
    const wholeKg = Math.floor(kg);
    const grams = Math.round((kg - wholeKg) * 1000);
    if (grams === 0) return `${wholeKg} kg`;
    return `${wholeKg} kg ${grams} g`;
  };

  const handleJoin = async (name: string, relation: string) => {
    if (!name.trim() || !relation.trim()) return;

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, relation }),
      });

      if (res.ok) {
        const data = await res.json();
        setParticipant({ name, relation });
        setParticipantId(data.participantId);
        localStorage.setItem('participantId', data.participantId.toString());
        localStorage.setItem('participantName', name);
        setCurrentStep('gender');
      } else {
        const error = await res.json();
        alert(error.message || 'Name already taken! Try adding a last initial.');
      }
    } catch (err) {
      alert('Failed to join. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!participantId || !gender || !dueDate) return;

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          gender,
          weightLbs: weightKg * 2.20462, // convert kg → lbs for DB (or store kg — your call!)
          dueDate: dueDate.toISOString().split('T')[0],
        }),
      });

      if (res.ok) {
        setCurrentStep('submitted');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to save');
      }
    } catch (err) {
      alert('Network error');
    }
  };

const EXPECTED_DUE_DATE = new Date('2026-06-15');
const minDate = new Date(EXPECTED_DUE_DATE);
minDate.setDate(EXPECTED_DUE_DATE.getDate() - 14);
const maxDate = new Date(EXPECTED_DUE_DATE);
maxDate.setDate(EXPECTED_DUE_DATE.getDate() + 14);

  // Render full-screen sections
  return (
    <div className="font-sans">
      {/* Join Screen */}
{currentStep === 'join' && (
  <div className="min-h-screen bg-gradient-to-b from-amber-50 to-pink-50 flex flex-col items-center justify-center p-6">
    <div className="text-center max-w-md w-full">
      <h1 className="text-4xl font-bold text-purple-700 mb-2">👶 Welcome!</h1>
      <p className="text-gray-600 mb-8">Tell us who you are so we can save your guesses!</p>
      
      <input
        type="text"
        id="name-input"
        placeholder="Your Name"
        className="w-full p-4 rounded-xl border text-black border-pink-200 bg-white shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-pink-300"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const name = (e.target as HTMLInputElement).value.trim();
            const relationInput = document.getElementById('relation-input') as HTMLInputElement;
            if (name && relationInput?.value.trim()) {
              handleJoin(name, relationInput.value.trim());
            }
          }
        }}
      />

      <input
        type="text"
        id="relation-input"
        placeholder="Relation to Baby (e.g., Aunt, Best Friend, Uncle...)"
        className="w-full p-4 rounded-xl border text-black border-purple-200 bg-white shadow-sm mb-6 focus:outline-none focus:ring-2 focus:ring-purple-300"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const relation = (e.target as HTMLInputElement).value.trim();
            const nameInput = document.getElementById('name-input') as HTMLInputElement;
            if (relation && nameInput?.value.trim()) {
              handleJoin(nameInput.value.trim(), relation);
            }
          }
        }}
      />
      
      <button
        onClick={() => {
          const nameInput = document.getElementById('name-input') as HTMLInputElement;
          const relationInput = document.getElementById('relation-input') as HTMLInputElement;
          const name = nameInput?.value.trim();
          const relation = relationInput?.value.trim();
          if (name && relation) {
            handleJoin(name, relation);
          } else {
            alert('Please enter both your name and relation!');
          }
        }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition"
      >
        Start Predicting!
      </button>
    </div>
  </div>
)}

      {/* Gender Screen */}
      {currentStep === 'gender' && (
        <div className="min-h-screen bg-linear-to-b from-blue-50 to-pink-50 flex flex-col items-center justify-center p-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Is it a <span className="text-blue-500">boy</span> or a <span className="text-pink-500">girl</span>?
          </h2>
          <div className="flex gap-12">
            <button
              onClick={() => setGender('boy')}
              className="flex flex-col items-center bg-blue-100 hover:bg-blue-200 rounded-3xl w-40 h-40 justify-center transition transform hover:scale-105 shadow-lg"
            >
              <span className="text-5xl mb-2">👶</span>
              <span className="font-bold text-blue-700">Boy</span>
            </button>
            <button
              onClick={() => setGender('girl')}
              className="flex flex-col items-center bg-pink-100 hover:bg-pink-200 rounded-3xl w-40 h-40 justify-center transition transform hover:scale-105 shadow-lg"
            >
              <span className="text-5xl mb-2">👧</span>
              <span className="font-bold text-pink-700">Girl</span>
            </button>
          </div>
        </div>
      )}

      {/* Weight Screen */}
      {currentStep === 'weight' && (
        <div className="min-h-screen bg-linear-to-b from-green-50 to-amber-50 flex flex-col items-center justify-center p-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            How much will baby weigh?
          </h2>
          <div className="text-2xl font-semibold text-purple-600 mb-8">
            {formatWeightKg(weightKg)}
          </div>
          <input
            type="range"
            min="1.8"
            max="4.5"
            step="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(parseFloat(e.target.value))}
            className="w-4/5 h-4 bg-gray-200 rounded-full appearance-none accent-purple-500"
          />
          <div className="flex justify-between w-4/5 text-sm text-gray-500 mt-2">
            <span>1.8 kg</span>
            <span>4.5 kg</span>
          </div>
          <button
            onClick={() => setCurrentStep('date')}
            className="mt-12 bg-linear-to-r from-purple-400 to-pink-400 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90"
          >
            Next: Pick Due Date
          </button>
        </div>
      )}

      {/* Date Screen */}
      {currentStep === 'date' && (
        <div className="min-h-screen bg-linear-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            When will baby arrive?
          </h2>
          <div className="bg-white rounded-2xl p-4 shadow-xl max-w-xs">
            <DayPicker
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              fromDate={minDate}
              toDate={maxDate}
              classNames={{
                day_selected: 'bg-pink-500 text-white',
                nav_button: 'text-purple-600 hover:text-purple-800',
              }}
            />
          </div>
        </div>
      )}

      {/* Submitted */}
      {currentStep === 'submitted' && (
        <div className="min-h-screen bg-linear-to-b from-yellow-50 to-red-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">All Done!</h2>
          <p className="text-lg text-gray-700 max-w-md">
            Your prediction is locked in! Thanks for playing, {participant?.name}!
          </p>
          <p className="mt-4 text-sm text-gray-500">
            You can’t change your guess — may the best predictor win!
          </p>
        </div>
      )}
    </div>
  );
}