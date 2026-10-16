import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiUrl } from '@/config/api';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const response = await fetch(getApiUrl('/auth/me'), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const json = await response.json();
    return NextResponse.json({ user: json.data });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
