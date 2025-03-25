'use client';

import React, { useState, useEffect } from 'react';

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
  // Convert seconds -> milliseconds
  return new Date(numeric * 1000).toLocaleString();
}

export default function LIRRPage() {
  const [data, setData] = useState<FeedMessage | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/lirr');
        if (!res.ok) throw new Error('Network response was not ok');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch LIRR data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">LIRR Realtime Data</h1>
        <p>Loading LIRR data...</p>
      </main>
    );
  }

  const { header, entity } = data;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">LIRR Realtime Data</h1>

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

                {/* Vehicle Position (if available) */}
                {vehicle?.position && (
                  <div className="mb-4 text-sm">
                    <strong>Position:</strong>{' '}
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
                      {stops.map((stop:any, idx: number) => {
                        const arrivalTime = stop.arrival?.time
                          ? formatTimestamp(stop.arrival.time)
                          : '';
                        const departureTime = stop.departure?.time
                          ? formatTimestamp(stop.departure.time)
                          : '';

                        return (
                          <tr key={idx} className="odd:bg-white even:bg-gray-50">
                            <td className="px-3 py-2 border-b border-gray-200">
                              {stop.stopId || 'N/A'}
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
    </main>
  );
}
