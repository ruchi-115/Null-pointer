'use client';

import React from 'react';
import Link from 'next/link';

const feedOptions = [
  { key: 'ace', label: 'ACE' },
  { key: 'g', label: 'G' },
  { key: 'nqrw', label: 'NQRW' },
  { key: 'default', label: 'Default' },
  { key: 'bdfm', label: 'BDFM' },
  { key: 'jz', label: 'JZ' },
  { key: 'l', label: 'L' },
  { key: 'si', label: 'SI' },
];

export default function SubwaysMainPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Select a Subway Feed</h1>
      <p className="mb-4">Choose one of the available subway feeds to view real-time data:</p>
      <ul className="space-y-2">
        {feedOptions.map((option) => (
          <li key={option.key}>
            <Link href={`/subways/${option.key}`}>
              <span className="text-blue-600 hover:underline cursor-pointer">
                {option.label} Feed
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
