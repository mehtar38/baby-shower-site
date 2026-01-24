import { NextRequest } from 'next/server';
import pool from '@/db/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received prediction:', body);
    const { participantId, gender, weightLbs, dueDate } = body;

    // Validate input
    if (!participantId || !gender || weightLbs == null || !dueDate) {
      return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!['boy', 'girl'].includes(gender)) {
      return Response.json({ message: 'Invalid gender' }, { status: 400 });
    }

    const weightNum = parseFloat(weightLbs);
    if (isNaN(weightNum) || weightNum < 4 || weightNum > 10) {
      return Response.json({ message: 'Weight must be between 4 and 10 lbs' }, { status: 400 });
    }

    // Check if participant exists
    const participantRes = await pool.query(
      'SELECT id FROM participants WHERE id = $1',
      [participantId]
    );

    if (participantRes.rows.length === 0) {
      return Response.json({ message: 'Participant not found' }, { status: 404 });
    }

    // Check if prediction already exists
    const existingRes = await pool.query(
      'SELECT id FROM predictions WHERE participant_id = $1',
      [participantId]
    );

    if (existingRes.rows.length > 0) {
      return Response.json({ message: 'You have already submitted a prediction!' }, { status: 409 });
    }

    // Insert prediction
    await pool.query(
      `
        INSERT INTO predictions (participant_id, gender, weight_lbs, due_date, bet_amount)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [participantId, gender, weightNum, dueDate, body.betAmount] // bet_amount is fixed at 100 for fun
    );

    return Response.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error('Prediction error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}