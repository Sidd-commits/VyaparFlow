import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'Document';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${name}</title>
      <style>
        body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f1f5f9; }
        .card { background: white; padding: 3rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); text-align: center; max-width: 500px; }
        h1 { color: #0f172a; margin-bottom: 1rem; }
        p { color: #64748b; margin-bottom: 2rem; line-height: 1.5; }
        .tag { background: #e0f2fe; color: #0369a1; padding: 0.5rem 1rem; border-radius: 9999px; font-weight: bold; font-size: 0.875rem; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Mock Document Viewer</h1>
        <p>This is a simulated viewer for <strong>${name}</strong>. In a full production environment, this would securely serve the actual uploaded PDF or image file from cloud storage (e.g., AWS S3).</p>
        <div class="tag">MVP Mode Active</div>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
