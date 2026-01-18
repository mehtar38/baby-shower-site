// src/app/api/join/route.ts
import { NextRequest } from 'next/server';
import pool from '@/db/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, relation } = body;

    // Validate input
    if (!name || !relation) {
      return Response.json({ message: 'Name and relation are required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanRelation = relation.trim();

    if (cleanName.length === 0 || cleanRelation.length === 0) {
      return Response.json({ message: 'Name and relation cannot be empty' }, { status: 400 });
    }

    // Check if name is already taken
    const existing = await pool.query(
      'SELECT id FROM participants WHERE name = $1',
      [cleanName]
    );

    if (existing.rows.length > 0) {
      return Response.json({ message: 'That name is already taken! Please use a unique name (e.g., "Alex K." or "Uncle Alex").' }, { status: 409 });
    }

    // Insert new participant
    const result = await pool.query(
      'INSERT INTO participants (name, relation) VALUES ($1, $2) RETURNING id',
      [cleanName, cleanRelation]
    );

    const participantId = result.rows[0].id;

    return Response.json({ participantId }, { status: 201 });

  } catch (error) {
    console.error('Join error:', error);
    return Response.json({ message: 'Failed to join. Please try again.' }, { status: 500 });
  }
}