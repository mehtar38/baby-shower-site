import { NextRequest } from 'next/server';
import pool from '@/db/db';

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT id, baby_name AS name, x, y, color
      FROM name_stickers
      ORDER BY created_at DESC
    `);
    return Response.json(res.rows);
  } catch (error) {
    console.error('Fetch stickers error:', error);
    return Response.json([], { status: 200 }); // safe fallback
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participantId, babyName, x, y, color } = body;

    if (!participantId || !babyName || x == null || y == null || !color) {
      return Response.json({ message: 'Missing fields' }, { status: 400 });
    }

    const res = await pool.query(
      `
        INSERT INTO name_stickers (participant_id, baby_name, x, y, color)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, baby_name AS name, x, y, color
      `,
      [participantId, babyName.trim(), x, y, color]
    );

    return Response.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Add sticker error:', error);
    return Response.json({ message: 'Failed to add sticker' }, { status: 500 });
  }
}