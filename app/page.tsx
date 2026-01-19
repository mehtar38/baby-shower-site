"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import MarketSurveyCharts from './components/MarketSurvey';

// Inside src/app/page.tsx (at the top, below imports)
import useEmblaCarousel from 'embla-carousel-react';

// Funny baby "product" reviews
const babyReviews = [
  {
    name: "Grandma",
    comment: "Chunky, kissable cheeks! 10/10 would snuggle again.",
  },
  {
    name: "Uncle",
    comment: "Steep learning curve on crying patterns. Documentation could be better.",
  },
  {
    name: "Mother",
    comment: "Limited battery life. Needs frequent recharging.",
  },
  {
    name: "Family Dog",
    comment: "Constant trash disposal required (diapers). Not eco-friendly.",
  },
  {
    name: "Neighbor",
    comment: "Adorable UI, but loud audio alerts. Volume control missing.",
  },
];

function ReviewCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: true,
    loop: true,
  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-white"
        aria-label="Previous review"
      >
        ←
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-white"
        aria-label="Next review"
      >
        →
      </button>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {babyReviews.map((review, i) => (
            <div
              key={i}
              className="flex-[0_0_70%] min-w-0 px-4" // Adjust width as needed
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200 h-full transition-transform duration-300">
                <p className="text-gray-700 italic mb-4">“{review.comment}”</p>
                <p className="text-sm text-gray-600 font-medium">— {review.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Optional: Use Framer Motion for smooth animations
const Confetti = dynamic(() => import("canvas-confetti"), { ssr: false });

export default function HomePage() {
  const EXPECTED_DUE_DATE = new Date("2026-06-15");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [applauseCount, setApplauseCount] = useState(0);
  const [preOrderCount, setPreOrderCount] = useState<number>(0);
  const [isPreOrdering, setIsPreOrdering] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const diff = EXPECTED_DUE_DATE.getTime() - Date.now();
      setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
    };
    calculate();
    const id = setInterval(calculate, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Fetch initial count on load
    fetch("/api/preorder")
      .then((res) => res.json())
      .then((data) => setPreOrderCount(data.count || 0))
      .catch(console.error);
  }, []);

  const handlePreOrder = async () => {
    if (isPreOrdering) return;

    setIsPreOrdering(true);

    try {
      const res = await fetch("/api/preorder", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPreOrderCount(data.count);

        // Optional: confetti!
        import("canvas-confetti").then((mod) => {
          mod.default({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.7 },
            colors: ["#ff9e85", "#a2d2ff", "#c1f3b7"],
          });
        });
      }
    } catch (err) {
      console.error("Pre-order failed:", err);
    } finally {
      setIsPreOrdering(false);
    }
  };

  // Content data
  const techSpecs = [
    { label: "Model", value: "Baby Mehta" },
    { label: "Release Date", value: "June 15, 2026" },
    { label: "Weight (est.)", value: "3.2 kg" },
    { label: "Features", value: "10 fingers, 10 toes, unlimited cuddles" },
    { label: "Compatibility", value: "All loving hearts ❤️" },
  ];

  const pressQuotes = [
    "“The most anticipated arrival of the decade!” – The Family Times",
    "“Cutest update yet. Pre-order highly recommended.” – Gossip Network",
    "“Finally, a product worth waiting for.” – Tech Reviewer",
  ];

  const systemRequirements = [
    "Unlimited patience",
    "Diapers (sold separately)",
    "A heart full of love 💖",
    "Willingness to sing off-key lullabies",
  ];

  const customerReviews = [
    { name: "Aunt Priya", comment: "Best cuddles ever! Worth the wait." },
    { name: "Uncle Joe", comment: "Tiny but mighty. Already stole my heart!" },
    {
      name: "Grandma",
      comment: "Cutest model yet. Pre-order highly recommended!",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Decorative shapes (keep these) */}
      <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-[#ffd166]/20 blur-xl"></div>
      <div className="absolute top-20 right-20 w-12 h-12 rounded-full bg-[#a2d2ff]/30 blur-xl"></div>
      <div className="absolute bottom-32 left-1/4 w-10 h-10 rounded-full bg-[#c1f3b7]/30 blur-xl"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#ff9e85]/10 blur-3xl"></div>

      {/* Hero Section – Full Width */}
      <section className="w-full bg-[#fef7f2] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Animated Text */}
            <div className="text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
              >
                Baby Mehta <span className="text-[#ff7b54]">Gen 4.0</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-lg text-gray-600 mb-6 max-w-md"
              >
                The next generation of love, laughter, and late-night cuddles.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-block px-4 py-1 bg-white/80 backdrop-blur-sm rounded-full text-sm text-gray-600 border border-gray-200 animate-pulse"
              >
                LAUNCHING SOON...
              </motion.div>
            </div>

            {/* Right: Image Frame */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                  <img
                    src="/images/baby2.webp"
                    alt="Baby Mehta Gen 4.0"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x600/fef7f2/gray?text=Coming+Soon";
                    }}
                  />
                </div>
                <div className="absolute -inset-2 rounded-2xl bg-[#a2d2ff]/30 blur-xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Pre-Order Section – Split Layout */}
<section className="w-full bg-white py-16">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
      {/* Left: CTA Text */}
      <div className="md:w-1/2 text-center md:text-left">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          If You're Excited and You Know It...
        </h3>
        <p className="text-gray-600">
          Join the growing circle of well-wishers!
        </p>
      </div>

      {/* Vertical Divider (hidden on mobile) */}
      <div className="hidden md:block w-px h-16 bg-gray-200"></div>

      {/* Right: Button + Counter */}
      <div className="md:w-1/3 flex flex-col items-center md:items-end space-y-6">
        <button
          onClick={handlePreOrder}
          disabled={isPreOrdering}
          className="w-full max-w-xs bg-gradient-to-r from-[#ff9e85] to-[#ff7b54] text-white font-bold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-[1.02] disabled:opacity-70"
        >
          {isPreOrdering ? "Pre-ordering..." : "Pre-order Now!"}
        </button>

        {/* Visual Counter */}
        {preOrderCount > 0 && (
          <div className="flex items-center">
            <div className="bg-[#f0fdf7] border border-gray-200 rounded-full w-16 h-16 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#0d9488]">{preOrderCount}</span>
            </div>
            <p className="ml-4 text-gray-700">
              {preOrderCount === 1 ? "person" : "people"} <br />
              <span className="text-sm text-gray-500">can't wait!</span>
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
</section>

      {/* System Requirements – Full Width Mint */}
      <section className="w-full bg-[#ecfdf5] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800">
              System Requirements:
            </h2>
            <div className="w-full h-px bg-gray-300 mt-3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { img: "/images/elphie.png", text: "Unlimited patience" },
              { img: "/images/penguin.png", text: "Diapers (sold separately)" },
              {
                img: "/images/bear.png",
                text: "Willingness to sing off-key lullabies",
              },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="relative rounded-2xl overflow-hidden shadow-sm">
                  <img
                    src={item.img}
                    alt={item.text}
                    className="w-full h-90 object-cover"
                    style={{ imageRendering: "auto" }}
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/600x256/ecfdf5/gray?text=Image+${i + 1}`;
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * (i + 1), duration: 0.5 }}
                    className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl py-2 px-3"
                  >
                    <p className="text-white font-medium text-center text-sm">
                      {item.text}
                    </p>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* Market Survey + CTA */}
<section className="w-full bg-[#fff5f0] py-16">
  <div className="max-w-6xl mx-auto px-6">
    <MarketSurveyCharts />

    {/* Integrated CTA Buttons */}
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
      <Link
        href="/wall"
        className="group bg-blue-300 text-white font-medium py-4 rounded-2xl text-center shadow-md hover:shadow-lg transition-all"
      >
        Submit Model Name Request
      </Link>
      <Link
        href="/predictions"
        className="group  bg-pink-300 text-white font-medium py-4 rounded-2xl text-center shadow-md hover:shadow-lg transition-all"
      >
        Invest in the Market Predictions
      </Link>
    </div>
  </div>
</section>

      {/* Press – Full Width */}
      <section className="w-full bg-[#f0f9ff] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
            Press & Media
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {pressQuotes.map((quote, i) => (
              <div
                key={i}
                className="bg-white/70 p-4 rounded-xl border border-gray-100 italic text-gray-700"
              >
                “{quote}”
              </div>
            ))}
          </div>
        </div>
      </section>


{/* Customer Reviews – Carousel */}
<section className="w-full bg-[#faf5ff] py-20">
  <div className="max-w-8xl mx-auto px-6">
    <h2 className="text-2xl font-semibold text-center mb-12 text-gray-800">
      People who owned similar products say…
    </h2>

    <ReviewCarousel />
  </div>
</section>

{/* Meet the Team */}
<section className="w-full bg-white py-16">
  <div className="max-w-4xl mx-auto px-6">
    <h2 className="text-2xl font-semibold text-center mb-12 text-gray-800">
      Meet the Core Team
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Lead Developer */}
      <div className="bg-[#fff5f0] rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-[#ff9e85]">
            <img
              src="/images/parent1.jpg"
              alt="Lead Developer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/300x300/fff5f0/gray?text=Lead+Dev";
              }}
            />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Lead Developer</h3>
        </div>
      </div>

      {/* Backend Engineer */}
      <div className="bg-[#f0f9ff] rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-[#a2d2ff]">
            <img
              src="/images/parent2.jpg"
              alt="Backend Engineer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/300x300/f0f9ff/gray?text=Backend+Eng";
              }}
            />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Backend Engineer</h3>
        </div>
      </div>
    </div>
  </div>
</section>

      <footer className="w-full bg-gray-50 py-8 text-center text-gray-500 text-sm">
        © 2026 Baby Mehta Inc. • All rights reserved 💖
      </footer>
    </div>
  );
}
