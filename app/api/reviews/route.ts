// app/api/reviews/route.ts
// POST /api/reviews
// The ONLY way a new review enters the system.
//
// Business rules, enforced HERE on the backend (never trust the frontend):
//  1. rating must be a whole number from 1 to 5.
//  2. comment must be a non-empty string after trimming whitespace.
//  3. restaurantId must point at a restaurant that actually exists.
// On success: exactly ONE row inserted, HTTP 201, return the new review id.
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    );
  }

  const { restaurantId, rating, comment } = (body ?? {}) as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  // Check 1 — rating is a whole number (integer) from 1 to 5.
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'rating must be a whole number from 1 to 5.' },
      { status: 400 }
    );
  }

  // Check 2 — comment is non-empty after trimming whitespace.
  if (typeof comment !== 'string' || comment.trim().length === 0) {
    return NextResponse.json(
      { error: 'comment must be a non-empty string.' },
      { status: 400 }
    );
  }

  // Check 3 — the restaurant actually exists. We ask the database.
  const restaurants = await sql`
    SELECT id FROM restaurants WHERE id = ${restaurantId}
  `;

  if (restaurants.length === 0) {
    return NextResponse.json(
      { error: 'No restaurant with that id exists.' },
      { status: 400 }
    );
  }

  // All checks passed. Insert exactly one row. Nothing else changes.
  const inserted = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment.trim()})
    RETURNING id
  `;

  return NextResponse.json(
    { success: true, reviewId: inserted[0].id },
    { status: 201 }
  );
}
