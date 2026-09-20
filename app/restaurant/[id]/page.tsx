"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

type Review = { id: number; rating: number; comment: string; createdAt: string };
type Data = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? "text-amber-400" : "text-zinc-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

function formatCreatedAt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}


export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const [data, setData] = useState<Data | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => setData(d))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
        <h1 className="text-xl font-semibold text-zinc-900">Restaurant not found.</h1>
        <Link href="/" className="mt-4 text-sm text-amber-600 hover:underline">
          Back to home
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-amber-600 hover:underline">
          ← All restaurants
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">{data.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {data.cuisine} · {data.area}
        </p>

        {/* The big number. It arrives already computed from the backend API -
            there is NO calculation here. This prints exactly what the API sent. */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-5xl font-bold text-zinc-900">
            {data.averageRating === null ? "—" : data.averageRating}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            <Stars n={Math.round(data.averageRating ?? 0)} />{" "}
            {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}
          </p>
        </div>

        {data.latestReview ? (
          <section className="mt-8">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
              Latest review
            </h2>
            <div className="mt-2 rounded-2xl border-2 border-amber-400 bg-white p-5">
              <div className="flex items-center justify-between">
                <Stars n={data.latestReview.rating} />
                <span className="text-xs text-zinc-400">
                  {formatCreatedAt(data.latestReview.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-700">{data.latestReview.comment}</p>
            </div>
          </section>
        ) : (
          <section className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-zinc-600">
              Nobody has reviewed this place yet.
            </p>
            <Link
              href={`/review/${id}`}
              className="mt-3 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            >
              Be the first
            </Link>
          </section>
        )}

        {data.reviews.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
              Older reviews
            </h2>
            <ul className="mt-2 space-y-3">
              {data.reviews.map((r) => (
                <li key={r.id} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Stars n={r.rating} />
                    <span className="text-xs text-zinc-400">{formatCreatedAt(r.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-700">{r.comment}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 text-center">
          <Link
            href={`/review/${id}`}
            className="inline-block rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            Write a review
          </Link>
        </div>
      </div>
    </main>
  );
}
