import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const departments = await query(
      `SELECT d.id, d.name, d.description, d.floor,
              (SELECT COUNT(*) FROM doctors doc WHERE doc.department_id = d.id) as doctor_count
       FROM departments d
       ORDER BY d.floor ASC, d.name ASC`
    );
    return NextResponse.json(departments);
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, floor } = await request.json();

    if (!name || floor === undefined) {
      return NextResponse.json({ error: 'Name and floor are required' }, { status: 400 });
    }

    const res = await query(
      'INSERT INTO departments (name, description, floor) VALUES ($1, $2, $3) RETURNING id',
      [name.trim(), description || '', parseInt(floor, 10)]
    );

    return NextResponse.json({ success: true, message: 'Department created successfully', id: res[0].id });
  } catch (error: any) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
    }

    await query('DELETE FROM departments WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Department deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
