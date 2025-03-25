
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type FeedMessage = {
  header: {
    gtfsRealtimeVersion: string;
    timestamp: number;
  };
  entity: any[];
};

function formatTimestamp(ts?: string | number) {
  if (!ts) return '';
  const numeric = typeof ts === 'string' ? parseInt(ts, 10) : ts;
  if (Number.isNaN(numeric)) return '';
  return new Date(numeric * 1000).toLocaleString();
}

// Helper to parse the stops CSV file (stops.txt).
// The CSV columns: top_id,stop_name,stop_lat,stop_lon,location_type,parent_station
function parseStopsCSV(text: string) {
  const lines = text.trim().split('\n');
  const mapping: Record<
    string,
    { stop_name: string; stop_lat: number; stop_lon: number }
  > = {};
  // Skip the header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const [top_id, stop_name, stop_lat, stop_lon] = line.split(',');
    mapping[top_id] = {
      stop_name,
      stop_lat: parseFloat(stop_lat),
      stop_lon: parseFloat(stop_lon),
    };
  }
  return mapping;
}

export default function SubwayFeedPage() {
  const { feed } = useParams();
  const [data, setData] = useState<FeedMessage | null>(null);
  const [stopsMapping, setStopsMapping] = useState<
    Record<string, { stop_name: string; stop_lat: number; stop_lon: number }>
  >({});

  // Fetch realtime feed data from our dynamic API route.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/subways/${feed}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch Subway data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [feed]);

  // Load and parse the stops mapping from stops.txt.
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await fetch('/stops.txt');
        const text = await res.text();
        const mapping = parseStopsCSV(text);
        setStopsMapping(mapping);
      } catch (err) {
        console.error('Failed to fetch stops data:', err);
      }
    };
    fetchStops();
  }, []);

  if (!data) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">{feed} Feed</h1>
        <p>Loading data...</p>
        <Link href="/subways">
          <span className="text-blue-600 hover:underline mt-4 block cursor-pointer">
            Back to Feed Selection
          </span>
        </Link>
      </main>
    );
  }

  const { header, entity } = data;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {feed} Subway Feed Real-Time Data
      </h1>
      <div className="mb-6">
        <p className="text-gray-600">
          <strong>GTFS Version:</strong> {header.gtfsRealtimeVersion} |{' '}
          <strong>Feed Timestamp:</strong> {formatTimestamp(header.timestamp)}
        </p>
      </div>
      {entity && entity.length > 0 ? (
        <div className="space-y-6">
          {entity.map((train, idx) => {
            const { tripUpdate, vehicle } = train;
            const tripInfo = tripUpdate?.trip || {};
            const stops = tripUpdate?.stopTimeUpdate || [];

            return (
              <div
                key={train.id || idx}
                className="bg-white rounded shadow p-4 border border-gray-200"
              >
                {/* Train Heading */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Train ID: {train.id} (Trip {tripInfo.tripId})
                  </h2>
                  {vehicle?.currentStatus && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">
                      {vehicle.currentStatus}
                    </span>
                  )}
                </div>

                {/* Basic Trip Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <strong>Route ID:</strong> {tripInfo.routeId}
                  </div>
                  <div>
                    <strong>Start Time:</strong> {tripInfo.startTime}
                  </div>
                  <div>
                    <strong>Start Date:</strong> {tripInfo.startDate}
                  </div>
                  <div>
                    <strong>Vehicle Timestamp:</strong>{' '}
                    {formatTimestamp(vehicle?.timestamp)}
                  </div>
                </div>

                {/* Vehicle Position */}
                {vehicle?.position && (
                  <div className="mb-4 text-sm">
                    <strong>Vehicle Position:</strong>{' '}
                    {vehicle.position.latitude.toFixed(5)},{' '}
                    {vehicle.position.longitude.toFixed(5)}
                  </div>
                )}

                {/* Stop Time Updates */}
                <div className="overflow-auto">
                  <table className="table-auto w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="px-3 py-2 border-b border-gray-200">
                          Stop ID
                        </th>
                        <th className="px-3 py-2 border-b border-gray-200">
                          Stop Name
                        </th>
                        <th className="px-3 py-2 border-b border-gray-200">
                          Stop Lat, Lon
                        </th>
                        <th className="px-3 py-2 border-b border-gray-200">
                          Arrival Time
                        </th>
                        <th className="px-3 py-2 border-b border-gray-200">
                          Arrival Delay
                        </th>
                        <th className="px-3 py-2 border-b border-gray-200">
                          Departure Time
                        </th>
                        <th className="px-3 py-2 border-b border-gray-200">
                          Departure Delay
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stops.map((stop: any, idx: number) => {
                        const arrivalTime = stop.arrival?.time
                          ? formatTimestamp(stop.arrival.time)
                          : '';
                        const departureTime = stop.departure?.time
                          ? formatTimestamp(stop.departure.time)
                          : '';
                        const stopDetails = stopsMapping[stop.stopId] || null;

                        return (
                          <tr key={idx} className="odd:bg-white even:bg-gray-50">
                            <td className="px-3 py-2 border-b border-gray-200">
                              {stop.stopId || 'N/A'}
                            </td>
                            <td className="px-3 py-2 border-b border-gray-200">
                              {stopDetails ? stopDetails.stop_name : '—'}
                            </td>
                            <td className="px-3 py-2 border-b border-gray-200">
                              {stopDetails
                                ? `${stopDetails.stop_lat.toFixed(5)}, ${stopDetails.stop_lon.toFixed(5)}`
                                : '—'}
                            </td>
                            <td className="px-3 py-2 border-b border-gray-200">
                              {arrivalTime || '—'}
                            </td>
                            <td className="px-3 py-2 border-b border-gray-200">
                              {stop.arrival?.delay ? `${stop.arrival.delay}s` : '—'}
                            </td>
                            <td className="px-3 py-2 border-b border-gray-200">
                              {departureTime || '—'}
                            </td>
                            <td className="px-3 py-2 border-b border-gray-200">
                              {stop.departure?.delay ? `${stop.departure.delay}s` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No train data found.</p>
      )}

      <Link href="/subways">
        <span className="text-blue-600 hover:underline mt-4 block cursor-pointer">
          Back to Feed Selection
        </span>
      </Link>
    </main>
  );
}
