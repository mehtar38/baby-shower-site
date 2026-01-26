/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    confetti?: unknown;
  }
}
const YEAR = 2026;
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function BetPage() {
  const [participant, setParticipant] = useState<{
    name: string;
    relation: string;
  } | null>(null);
  const [participantId, setParticipantId] = useState<number | null>(null);

  // Prediction state
  const [gender, setGender] = useState<"boy" | "girl" | null>(null);
  const [weightKg, setWeightKg] = useState<number>(3.2);
  const [dueDate, setDueDate] = useState<string>(""); // Store as string (YYYY-MM-DD)
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );

  // BETTING STATE
  const [bets, setBets] = useState<Record<string, number>>({
    gender: 100,
    weight: 100,
    date: 100,
  });

  // Captcha
  const [captchaCode, setCaptchaCode] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    import("canvas-confetti").then((mod) => {
      (window as any).confetti = mod.default;
    });
  }, []);

  useEffect(() => {
    if (!gender) return;
    const fireConfetti = () => {
      const confettiFn = (window as any).confetti;
      if (!confettiFn) return;
      const colors =
        gender === "boy" ? ["#a2d2ff", "#7abfff"] : ["#ff9e85", "#ff7b54"];
      confettiFn({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors,
      });
    };
    const timer = setTimeout(fireConfetti, 100);
    return () => clearTimeout(timer);
  }, [gender]);

  const formatWeightKg = (kg: number): string => {
    const wholeKg = Math.floor(kg);
    const grams = Math.round((kg - wholeKg) * 1000);
    if (grams === 0) return `${wholeKg} kg`;
    return `${wholeKg} kg ${grams} g`;
  };

  const handleJoin = async (name: string, relation: string) => {
    if (!name.trim() || !relation.trim()) {
      alert("Please enter both your name and relation!");
      return;
    }

    try {
      // Save participant to DB FIRST
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, relation }),
      });

      if (res.ok) {
        const data = await res.json();

        // Save to state AND localStorage
        setParticipant({ name, relation });
        setParticipantId(data.participantId);
        localStorage.setItem("participantId", data.participantId.toString());
        localStorage.setItem("participantName", name);

        // Show CAPTCHA
        setShowCaptcha(true);
      } else {
        const error = await res.json();
        alert(
          error.message || "Name already taken! Try adding a last initial.",
        );
      }
    } catch (err) {
      alert("Failed to join. Please try again.");
      console.error("Join error:", err);
    }
  };

  const handleCaptchaSubmit = async () => {
    if (captchaCode.toLowerCase().trim() !== "10 kalol") {
      setCaptchaError("Incorrect!");
      return;
    }
    setShowCaptcha(false);
    setCurrentStep("gender");
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!participantId || !gender || !dueDate) {
      alert("Please complete all steps!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total bet amount
      const totalBet = bets.gender + bets.weight + bets.date;

      // Send to API
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantId,
          gender,
          weightLbs: weightKg * 2.20462, // Convert kg → lbs
          dueDate: dueDate, // Already in YYYY-MM-DD format
          betAmount: totalBet, // Total bet across all questions
        }),
      });

      if (response.ok) {
        setCurrentStep("submitted");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to save prediction. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------ DATE HELPERS ------------------ */
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isSameDay = (dateStr1: string, dateStr2: string) => {
    return dateStr1 === dateStr2;
  };

  const getMonthDates = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, month, i + 1),
    );
  };

  const monthDates = getMonthDates(YEAR, selectedMonth);
  const monthStartOffset = new Date(YEAR, selectedMonth, 1).getDay();

  // BET HANDLERS
  const setPresetBet = (question: string, amount: number) => {
    setBets((prev) => ({ ...prev, [question]: amount }));
  };

  // const setCustomBetAmount = (question: string, value: string) => {
  //   const num = parseInt(value) || 100;
  //   setBets(prev => ({ ...prev, [question]: Math.max(100, num) }));
  // };

  // NAVIGATION HANDLERS
  const handleNext = () => {
    if (currentStep === "gender" && gender) {
      setCurrentStep("weight");
    } else if (currentStep === "weight") {
      setCurrentStep("date");
    }
  };

  const [currentStep, setCurrentStep] = useState<
    "join" | "gender" | "weight" | "date" | "review" | "submitted"
  >("join");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div
      className="font-sans min-h-screen"
      style={{
        backgroundImage: `url('/images/quiz-bg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Add overlay for readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Join Screen */}
      {currentStep === "join" && !showCaptcha && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-md w-full">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome!</h1>
            <p className="text-gray-400 mb-8">May we see an ID please</p>

            <input
              type="text"
              id="name-input"
              placeholder="Your Name"
              className="w-full p-4 rounded-xl border text-white border-[#334155] bg-[#1e293b] shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]"
            />
            <input
              type="text"
              id="relation-input"
              placeholder="Relation to Baby (e.g., Aunt, Best Friend...)"
              className="w-full p-4 rounded-xl border text-white border-[#334155] bg-[#1e293b] shadow-sm mb-6 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]"
            />

            <button
              onClick={() => {
                const nameInput = document.getElementById(
                  "name-input",
                ) as HTMLInputElement;
                const relationInput = document.getElementById(
                  "relation-input",
                ) as HTMLInputElement;
                const name = nameInput?.value.trim();
                const relation = relationInput?.value.trim();
                if (name && relation) {
                  handleJoin(name, relation);
                } else {
                  alert("Please enter both your name and relation!");
                }
              }}
              className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition transform hover:scale-105"
            >
              Start Predicting!
            </button>
          </div>
        </div>
      )}

      {/* CAPTCHA Screen */}
      {showCaptcha && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Verify you are a Human
          </h2>
          <p className="text-xs mb-3 text-gray-300">
            {" "}
            To continue, type the characters you see in the picture{" "}
          </p>

          <div className="mb-6 max-w-xs">
            <img
              src="/images/captcha-meme.jpg"
              alt="CAPTCHA Meme"
              className="w-full rounded-xl border border-[#334155]"
            />
          </div>

          <input
            type="text"
            value={captchaCode}
            onChange={(e) => setCaptchaCode(e.target.value)}
            placeholder="Enter Captcha..."
            className="w-full max-w-xs p-3 rounded-full border border-[#334155] bg-[#1e293b] text-white text-center mb-4 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]"
            onKeyDown={(e) => e.key === "Enter" && handleCaptchaSubmit()}
          />

          {captchaError && <p className="text-red-400 mb-4">{captchaError}</p>}

          <button
            onClick={handleCaptchaSubmit}
            className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] text-white font-bold py-2 px-6 rounded-full"
          >
            Let the Games Begin!
          </button>

          <button
            onClick={() => setShowCaptcha(false)}
            className="mt-4 text-gray-400 hover:text-white"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Gender Screen */}
      {currentStep === "gender" && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Is it a <span className="text-[#ff6b6b]">boy</span> or a{" "}
            <span className="text-[#8b5cf6]">girl</span>?
          </h2>

          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            {[100].map((amount) => (
              <button
                key={amount}
                onClick={() => setPresetBet("gender", amount)}
                className={`px-4 py-2 rounded-full font-bold ${
                  bets.gender === amount
                    ? "bg-[#ff6b6b] text-white"
                    : "bg-[#334155] text-gray-300 border border-[#475569]"
                }`}
              >
                ₹{amount}
              </button>
            ))}
            {/* <input
              type="number"
              min="100"
              value={bets.gender}
              onChange={(e) => setCustomBetAmount('gender', e.target.value)}
              placeholder="Custom"
              className="w-24 bg-[#334155] text-white rounded-full px-3 py-2 border border-[#475569] text-center"
            /> */}
          </div>

          <div className="flex gap-8">
            <button
              onClick={() => setGender("boy")}
              className={`flex flex-col items-center w-40 h-40 rounded-2xl justify-center transition-all ${
                gender === "boy"
                  ? "bg-[#ff6b6b]/20 border-2 border-[#ff6b6b] scale-105"
                  : "bg-[#1e293b] border-2 border-[#334155] hover:bg-[#334155]"
              }`}
            >
              {/* <span className="text-4xl mb-2"></span> */}
              <img
                src="/images/baby_mickie.png"
                alt="Boy Image"
                className="mb-2 max-h-52 w-full max-w-md mx-auto"
              />

              <span className="font-bold text-white">Boy</span>
            </button>
            <button
              onClick={() => setGender("girl")}
              className={`flex flex-col items-center w-40 h-40 rounded-2xl justify-center transition-all ${
                gender === "girl"
                  ? "bg-[#8b5cf6]/20 border-2 border-[#8b5cf6] scale-105"
                  : "bg-[#1e293b] border-2 border-[#334155] hover:bg-[#334155]"
              }`}
            >
              <img
                src="/images/baby_minnie.png"
                alt="Girl Image"
                className="mb-2  w-full max-w-md mx-auto"
              />
              <span className="font-bold mb-2 text-white">Girl</span>
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={!gender}
            className={`mt-17 px-8 py-3 rounded-full font-bold text-white ${
              gender
                ? "bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-700 cursor-not-allowed"
            }`}
          >
            Lock In Answer →
          </button>

          <button
            onClick={() => setCurrentStep("join")}
            className="mt-6 text-gray-400 hover:text-white"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Weight Screen */}
      {currentStep === "weight" && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <h2 className="text-3xl font-bold text-center text-white mb-6">
            How much will baby weigh?
          </h2>

          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            {[100].map((amount) => (
              <button
                key={amount}
                onClick={() => setPresetBet("weight", amount)}
                className={`px-4 py-2 rounded-full font-bold ${
                  bets.weight === amount
                    ? "bg-[#ff6b6b] text-white"
                    : "bg-[#334155] text-gray-300 border border-[#475569]"
                }`}
              >
                ₹{amount}
              </button>
            ))}
            {/* <input
              type="number"
              min="100"
              value={bets.weight}
              onChange={(e) => setCustomBetAmount('weight', e.target.value)}
              placeholder="Custom"
              className="w-24 bg-[#334155] text-white rounded-full px-3 py-2 border border-[#475569] text-center"
            /> */}
          </div>

          <div className="text-2xl font-semibold text-white mb-6">
            {formatWeightKg(weightKg)}
          </div>
          <input
            type="range"
            min="1.8"
            max="4.5"
            step="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(parseFloat(e.target.value))}
            className="w-4/5 h-3 bg-[#334155] rounded-full appearance-none accent-[#ff6b6b]"
          />
          <div className="flex justify-between w-4/5 text-sm text-gray-400 mt-2">
            <span>1.8 kg</span>
            <span>4.5 kg</span>
          </div>

          <button
            onClick={() => setCurrentStep("date")}
            className="mt-8 px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Lock In Weight →
          </button>

          <button
            onClick={() => setCurrentStep("gender")}
            className="mt-6 text-gray-400 hover:text-white"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Date Screen */}
      {currentStep === "date" && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            When will baby arrive?
          </h2>

          {/* BET AMOUNTS */}
          <div className="mb-6 flex gap-2">
            {[100].map((a) => (
              <button
                key={a}
                onClick={() => setPresetBet("date", a)}
                className={`px-4 py-2 rounded-full font-bold ${
                  bets.date === a
                    ? "bg-[#ff6b6b] text-white"
                    : "bg-[#334155] text-gray-300"
                }`}
              >
                ₹{a}
              </button>
            ))}
            {/* <input
              type="number"
              value={bets.date}
              onChange={e => setCustomBetAmount('date', e.target.value)}
              className="w-24 bg-[#334155] text-white rounded-full px-3 py-2 text-center"
            /> */}
          </div>

          {/* CALENDAR */}
          <div className="bg-[#1e293b] rounded-2xl p-5 shadow-xl border border-[#334155] max-w-sm w-full">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() =>
                  setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1))
                }
                className="text-white hover:text-[#ff6b6b] p-2"
              >
                ←
              </button>
              <p className="text-center text-white font-semibold">
                {new Date(YEAR, selectedMonth).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <button
                onClick={() =>
                  setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1))
                }
                className="text-white hover:text-[#ff6b6b] p-2"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {WEEKDAYS.map((d, i) => (
                <div
                  key={`weekday-${i}`}
                  className="text-gray-500 font-semibold text-sm"
                >
                  {d}
                </div>
              ))}

              {Array.from({ length: monthStartOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {monthDates.map((date) => {
                const dateStr = formatDate(date);
                const selected = isSameDay(dueDate, dateStr);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setDueDate(dateStr)}
                    className={`w-10 h-10 rounded-full font-bold transition ${
                      selected
                        ? "bg-[#ff6b6b] text-white scale-110"
                        : "bg-[#334155] text-gray-300 hover:bg-[#475569]"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex gap-6">
            <button
              onClick={() => setCurrentStep("weight")}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <button
              disabled={!dueDate}
              onClick={() => setCurrentStep("review")}
              className={`px-6 py-2 rounded-full font-bold ${
                dueDate
                  ? "bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] text-white"
                  : "bg-gray-700 text-gray-500"
              }`}
            >
              Confirm Date →
            </button>
          </div>
        </div>
      )}

      {/* Review Screen */}
      {currentStep === "review" && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Final Review
          </h2>
          <div className="bg-[#1e293b] rounded-2xl p-6 shadow-md max-w-md w-full border border-[#334155]">
            <div className="space-y-4 text-white">
              <div>
                <p className="text-gray-400">Gender</p>
                <p className="font-bold">
                  {gender === "boy" ? "Boy" : "Girl"} (₹{bets.gender})
                </p>
              </div>
              <div>
                <p className="text-gray-400">Weight</p>
                <p className="font-bold">
                  {formatWeightKg(weightKg)} (₹{bets.weight})
                </p>
              </div>
              <div>
                <p className="text-gray-400">Due Date</p>
                <p className="font-bold">
                  {dueDate
                    ? new Date(dueDate + "T00:00:00").toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric" },
                      )
                    : "Not set"}{" "}
                  (₹{bets.date})
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setCurrentStep("date")}
              className="text-gray-400 hover:text-white"
            >
              ← Edit Date
            </button>
            <button
              onClick={() => setShowConfirmation(true)} // 👈 Show modal instead of submitting
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-full font-bold text-white ${
                isSubmitting
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
            >
              {isSubmitting ? "Placing Bet..." : "Place Final Bet!"}
            </button>
          </div>
          {/* Confirmation Modal */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-md border border-[#334155]">
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  Final Confirmation
                </h3>

                {/* Image Placeholder */}
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-32 rounded-full bg-[#334155] flex items-center justify-center">
                    <img
                      src="/images/shouting-baby.png"
                      alt="Naishil Kaka"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Message */}
                <p className="text-gray-300 text-center mb-6">
                  Your bet will only be considered once the money is paid to
                  Naishil Kaka
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 bg-[#334155] text-white py-2 rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmation(false);
                      handleSubmit(); // 👈 Actually submit
                    }}
                    className="flex-1 bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] text-white py-2 rounded-full"
                  >
                    Confirm Bet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submitted */}
      {currentStep === "submitted" && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-[#ff6b6b] mb-4">All Done!</h2>
          <p className="text-lg text-gray-300 max-w-md text-center">
            Your predictions are locked in! Also, this is all subject to market
            risk. Anyways, thanks for playing {participant?.name}{" "}
            {participant?.relation} !
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-6 bg-[#1e293b] text-[#ff6b6b] font-bold py-2 px-6 rounded-full shadow border border-[#ff6b6b]"
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
