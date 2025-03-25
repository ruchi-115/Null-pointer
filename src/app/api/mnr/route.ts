// app/api/mnr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { transit_realtime } from 'gtfs-realtime-bindings';

const MNR_FEED = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/mnr%2Fgtfs-mnr';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(MNR_FEED);
    const buffer = await response.arrayBuffer();
    const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));

    return NextResponse.json(feed);
  } catch (error) {
    console.error('Error fetching MNR feed:', error);
    return new NextResponse('Failed to fetch MNR feed', { status: 500 });
  }
}
