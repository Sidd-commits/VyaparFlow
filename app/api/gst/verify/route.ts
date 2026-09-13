import { NextRequest, NextResponse } from 'next/server';
import { fetchGSTDetailsFromSandbox } from '@/lib/services/sandboxGst';
import { validateGSTIN } from '@/lib/businessTypeConfig';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Rate limiting: 20 requests per minute per IP
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`gst_verify:${clientIp}`, 20, 60 * 1000);
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        success: false,
        error: `Rate limit exceeded. Too many GST verification requests. Please retry in ${rateLimit.resetSeconds}s.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': rateLimit.resetSeconds.toString(),
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

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

