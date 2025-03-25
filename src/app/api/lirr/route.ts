// app/api/lirr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { transit_realtime } from 'gtfs-realtime-bindings';

const LIRR_FEED = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/lirr%2Fgtfs-lirr';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(LIRR_FEED);
    const buffer = await response.arrayBuffer();
    const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));

    return NextResponse.json(feed);
  } catch (error) {
    console.error('Error fetching LIRR feed:', error);
    return new NextResponse('Failed to fetch LIRR feed', { status: 500 });
  }
}
