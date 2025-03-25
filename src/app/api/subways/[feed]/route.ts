// app/api/subways/[feed]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { transit_realtime } from 'gtfs-realtime-bindings';

// Map each feed key to its endpoint URL.
const FEED_URLS: { [key: string]: string } = {
  ace: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
  g: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',
  nqrw: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
  default: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
  bdfm: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
  jz: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',
  l: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
  si: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si',
};

export async function GET(request: NextRequest, { params }: { params: { feed: string }}) {
  const { feed } = params;
  const feedUrl = FEED_URLS[feed];
  if (!feedUrl) {
    return NextResponse.json({ error: 'Invalid feed specified' }, { status: 400 });
  }
  try {
    const response = await fetch(feedUrl);
    const buffer = await response.arrayBuffer();
    const feedData = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    return NextResponse.json(feedData);
  } catch (error) {
    console.error('Error fetching Subway feed:', error);
    return NextResponse.json({ error: 'Failed to fetch Subway feed' }, { status: 500 });
  }
}
