// src/app/api/stickers/[id]/route.ts
import { NextRequest } from 'next/server';
import pool from '@/db/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { x, y } = await request.json();
    const id = parseInt(params.id);

    await pool.query(
      'UPDATE name_stickers SET x = $1, y = $2 WHERE id = $3',
      [x, y, id]
    );

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to update' }, { status: 500 });
  }
}