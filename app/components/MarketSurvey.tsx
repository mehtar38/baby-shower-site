// src/app/components/MarketSurvey.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function MarketSurvey() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chart-data')
      .then(res => res.json())
      .then(data => {
        setChartData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading predictions...</p>;
  }

  if (chartData?.status === 'empty') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No predictions yet!</p>
        <Link
          href="/predictions"
          className="inline-block bg-gradient-to-r from-[#ff9e85] to-[#ff7b54] text-white px-6 py-2 rounded-full text-sm"
        >
          Be the first to bet!
        </Link>
      </div>
    );
  }

  if (chartData?.status !== 'success') {
    return <p className="text-center text-red-500">Failed to load data</p>;
  }

  const { gender, weights, dueDates, total } = chartData.data;

  // Gender Pie Chart
  const genderChartData = {
    labels: ['Boy', 'Girl'],
    datasets: [
      {
        data: [gender.boys || 0, gender.girls || 0],
        backgroundColor: ['#a2d2ff', '#ffd166'],
        borderWidth: 0,
      },
    ],
  };

  // Weight Histogram
  const weightBins: Record<string, number> = {};
  const bins = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5];
  bins.forEach(bin => weightBins[`${bin} kg`] = 0);
  
  weights.forEach((w: number) => {
    const bin = bins.find(b => w <= b) || bins[bins.length - 1];
    weightBins[`${bin} kg`] += 1;
  });

  const weightChartData = {
    labels: Object.keys(weightBins),
    datasets: [
      {
        label: 'Bets',
        data: Object.values(weightBins),
        backgroundColor: '#c1f3b7',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Due Date Bar Chart
  const dateLabels = dueDates.map((d: any) => {
    try {
      return new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return d.date;
    }
  });
  const dateCounts = dueDates.map((d: any) => d.count);

  const dateChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Bets',
        data: dateCounts,
        backgroundColor: '#d8b4fe',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item: any) => `${item.dataset.label}: ${item.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
      x: {
        ticks: { maxRotation: 0, minRotation: 0 },
      },
    },
  };

  return (
    <div>

      {/* Header */}
      <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
        Live Market Consensus
      </h2>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Model (Gender) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3 text-center">Model (Gender)</h3>
          <div className="h-48 flex items-center justify-center">
            <Pie 
              data={genderChartData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { position: 'bottom' },
                  tooltip: { callbacks: { label: (item) => `${item.label}: ${item.raw}` } }
                } 
              }} 
            />
          </div>
        </div>

        {/* Weight */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3 text-center">Weight</h3>
          <div className="h-48">
            <Bar data={weightChartData} options={chartOptions} />
          </div>
        </div>

        {/* Launch Date */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3 text-center">Launch Date</h3>
          <div className="h-48">
            <Bar data={dateChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Based on {total} live predictions
      </p>
    </div>
  );
}