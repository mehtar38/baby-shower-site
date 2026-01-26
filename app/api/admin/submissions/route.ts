// src/app/api/admin/submissions/route.ts
import { NextRequest } from 'next/server';
import pool from '@/db/db';

export async function GET() {
  try {
    // Group by name + relation, sum bets
    const res = await pool.query(`
      SELECT 
        p.name,
        p.relation,
        SUM(pr.bet_amount) as total_bet,
        -- Get latest prediction values for display
        MAX(pr.gender) as gender,
        MAX(pr.weight_lbs) as weight_lbs,
        MAX(pr.due_date) as due_date
      FROM participants p
      JOIN predictions pr ON p.id = pr.participant_id
      GROUP BY p.name, p.relation
      ORDER BY total_bet DESC
    `);

    return Response.json(res.rows);
  } catch (error) {
    console.error('Admin submissions error:', error);
    return Response.json({ error: 'Failed to load' }, { status: 500 });
  }
}