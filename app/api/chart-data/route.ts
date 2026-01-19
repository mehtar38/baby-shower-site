// src/app/api/chart-data/route.ts
import { NextRequest } from 'next/server';
import pool from '@/db/db';

export async function GET() {
  try {
    // Check if predictions table has data
    const countRes = await pool.query('SELECT COUNT(*) FROM predictions WHERE gender IS NOT NULL');
    const totalCount = parseInt(countRes.rows[0].count, 10);

    if (totalCount === 0) {
      return Response.json({ status: 'empty' });
    }

    // 1. Gender Distribution
    const genderRes = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN gender = 'boy' THEN 1 ELSE 0 END), 0) as boys,
        COALESCE(SUM(CASE WHEN gender = 'girl' THEN 1 ELSE 0 END), 0) as girls
      FROM predictions
      WHERE gender IN ('boy', 'girl')
    `);
    const boys = parseInt(genderRes.rows[0].boys);
    const girls = parseInt(genderRes.rows[0].girls);

    // 2. Weight Distribution (in kg)
    const weightRes = await pool.query(`
      SELECT weight_lbs
      FROM predictions
      WHERE weight_lbs IS NOT NULL
    `);
    const weights = weightRes.rows.map(row => {
      const lbs = parseFloat(row.weight_lbs);
      return parseFloat((lbs * 0.45359237).toFixed(1)); // Convert to kg
    });

    // 3. Due Date Distribution
    const dateRes = await pool.query(`
      SELECT due_date, COUNT(*) as count
      FROM predictions
      WHERE due_date IS NOT NULL
      GROUP BY due_date
      ORDER BY due_date
    `);
    const dueDates = dateRes.rows.map(row => ({
      date: row.due_date, // Keep as ISO string
      count: parseInt(row.count),
    }));

    return Response.json({
      status: 'success',
      data: {
        gender: { boys, girls },
        weights,
        dueDates,
        total: totalCount,
      },
    });

  } catch (error: any) {
    console.error('❌ Chart API Error:', error.message || error);
    return Response.json(
      { status: 'error', message: 'Failed to load chart data' },
      { status: 500 }
    );
  }
}