import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    let userId = '';

    const user = await verifyAuth(request);
    if (user) {
      userId = user.id;
    } else {
      const { searchParams } = new URL(request.url);
      const paramId = searchParams.get('user_id');
      if (paramId) {
        userId = paramId;
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const notifications = await query(
      `SELECT id, title, message, read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    let userId = '';

    const user = await verifyAuth(request);
    if (user) {
      userId = user.id;
    } else {
      const { searchParams } = new URL(request.url);
      const paramId = searchParams.get('user_id');
      if (paramId) {
        userId = paramId;
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { id } = await request.json();

    if (id) {
      // Mark specific notification as read
      await query(
        'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
    } else {
      // Mark all as read
      await query(
        'UPDATE notifications SET read = TRUE WHERE user_id = $1',
        [userId]
      );
    }

    return NextResponse.json({ success: true, message: 'Notifications marked as read' });
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
