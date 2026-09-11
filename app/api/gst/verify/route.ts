import { NextRequest, NextResponse } from 'next/server';
import { fetchGSTDetailsFromSandbox } from '@/lib/services/sandboxGst';
import { validateGSTIN } from '@/lib/businessTypeConfig';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gstin = searchParams.get('gstin');

  if (!gstin) {
    return NextResponse.json(
      { success: false, error: 'GSTIN parameter is required' },
      { status: 400 }
    );
  }

  const formatCheck = validateGSTIN(gstin);
  if (!formatCheck.valid) {
    return NextResponse.json(
      { success: false, error: formatCheck.error },
      { status: 400 }
    );
  }

  try {
    const result = await fetchGSTDetailsFromSandbox(gstin);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
