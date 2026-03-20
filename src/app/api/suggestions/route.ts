import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) return NextResponse.json([]);
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
       console.warn(`[Proxy] Google suggest returned status: ${res.status}`);
       return NextResponse.json([]);
    }
    
    const text = await res.text();    
    const json = JSON.parse(text);
    if (Array.isArray(json) && Array.isArray(json[1])) {
       return NextResponse.json(json[1]);
    }
    return NextResponse.json([]);
  } catch (e: any) {
    console.error(`[Proxy Error]`, e.message);
    return NextResponse.json([]);
  }
}
