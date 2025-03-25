import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">NYC Transit Hub</h1>
      <p className="mb-6 text-lg">
        Welcome to the NYC Transit Hub. Choose a transit feed to view real-time data:
      </p>
      <ul className="space-y-4">
        <li>
          <Link href="/subways" className="text-blue-600 hover:underline">
            Subways
          </Link>
        </li>
        <li>
          <Link href="/lirr" className="text-blue-600 hover:underline">
            LIRR
          </Link>
        </li>
        <li>
          <Link href="/mnr" className="text-blue-600 hover:underline">
            Metro‑North Railroad
          </Link>
        </li>
      </ul>
    </main>
  );
}
