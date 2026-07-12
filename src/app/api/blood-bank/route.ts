import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const stock = await query('SELECT blood_group, stock_units, updated_at FROM blood_bank ORDER BY blood_group ASC');
    return NextResponse.json(stock);
  } catch (error: any) {
    console.error('Error fetching blood stock:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { bloodGroup, stockUnits } = await request.json();

    if (!bloodGroup || stockUnits === undefined) {
      return NextResponse.json({ error: 'Blood group and stock units are required' }, { status: 400 });
    }

    await query(
      `UPDATE blood_bank SET 
        stock_units = $1,
        updated_at = CURRENT_TIMESTAMP
       WHERE blood_group = $2`,
      [parseInt(stockUnits, 10), bloodGroup]
    );

    return NextResponse.json({ success: true, message: 'Blood stock updated successfully' });

  } catch (error: any) {
    console.error('Error updating blood stock:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
