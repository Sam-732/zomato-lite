"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Restaurant = { name: string; cuisine: string; area: string };

export default function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const router = useRouter();
  const { restaurantId: idStr } = use(params);
  const restaurantId = Number(idStr);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((r) => r.json())
      .then((d) => setRestaurant(d))
      .catch(() => setRestaurant(null));
  }, [restaurantId]);

  const canSubmit = rating >= 1 && comment.trim().length > 0 && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || comment.trim().length === 0) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, rating, comment: comment.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setSubmitting(false);
      return;
    }
    router.push(`/restaurant/${restaurantId}`);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-zinc-900">
          {restaurant ? restaurant.name : "Write a review"}
        </h1>
        {restaurant && (
          <p className="text-sm text-zinc-500 mt-1">
            {restaurant.cuisine} &middot; {restaurant.area}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Your rating
            </label>
            <div className="flex gap-1" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  aria-pressed={rating === n}
                  className={`h-10 w-10 rounded-full text-lg transition-colors ${
                    (hover || rating) >= n
                      ? "bg-amber-400 text-white"
                      : "bg-zinc-200 text-zinc-400"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {rating === 0
                ? "Tap a star to choose 1 to 5."
                : `Selected: ${rating} star${rating === 1 ? "" : "s"}`}
            </p>
          </div>

          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-zinc-700 mb-2"
            >
              Your comment
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was it?"
              className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-amber-500 py-3 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-amber-600"
          >
            {submitting ? "Saving..." : "Submit review"}
          </button>
        </form>
      </div>
    </main>
  );
}