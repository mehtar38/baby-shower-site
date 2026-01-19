import pool from '@/db/db';

// GET: Return total pre-order count
export async function GET() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM preorders');
    const count = parseInt(res.rows[0].count, 10);
    return Response.json({ count });
  } catch (error) {
    console.error('Fetch preorders error:', error);
    return Response.json({ count: 0 }, { status: 200 });
  }
}

// POST: Add a new pre-order
export async function POST() {
  try {
    await pool.query('INSERT INTO preorders DEFAULT VALUES');
    // Return updated count
    const res = await pool.query('SELECT COUNT(*) FROM preorders');
    const count = parseInt(res.rows[0].count, 10);
    return Response.json({ count });
  } catch (error) {
    console.error('Add preorder error:', error);
    return Response.json({ error: 'Failed to pre-order' }, { status: 500 });
  }
}