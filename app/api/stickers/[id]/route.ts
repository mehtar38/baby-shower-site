// src/app/api/stickers/[id]/route.ts
import { NextRequest } from 'next/server';
import pool from '@/db/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise<{ id: string }>
) {
  try {
    const { x, y } = await request.json();
    const { id } = await params; // ✅ await params

    if (!id || isNaN(parseInt(id))) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const result = await pool.query(
      'UPDATE name_stickers SET x = $1, y = $2 WHERE id = $3 RETURNING id',
      [x, y, parseInt(id)]
    );

    if (result.rowCount === 0) {
      return Response.json({ error: 'Sticker not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('PATCH sticker error:', error.message);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}