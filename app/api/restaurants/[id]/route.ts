// app/api/restaurants/[id]/route.ts
// GET /api/restaurants/:id
//
// Loads ONE restaurant page. Everything the screen needs to draw arrives in
// a single response -- the backend does the AVG, COUNT, and sorting right now.
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

type RestaurantRow = {
  id: number;
  name: string;
  cuisine: string;
  area: string;
};

type ReviewRow = {
  id: number;
  restaurant_id: number;
  rating: number;
  comment: string;
  created_at: string;
};

function toReview(r: ReviewRow) {
  return {
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId) || restaurantId < 1) {
    return NextResponse.json(
      { error: 'Restaurant id must be a positive whole number.' },
      { status: 400 }
    );
  }

  const restaurantRows = await sql`
    SELECT id, name, cuisine, area
    FROM restaurants
    WHERE id = ${restaurantId}
  `;

  if (restaurantRows.length === 0) {
    return NextResponse.json(
      { error: 'Restaurant not found.' },
      { status: 404 }
    );
  }

  const restaurant = restaurantRows[0] as RestaurantRow;

  // Every review for this restaurant, newest created_at first. PostgreSQL
  // sorts for us -- the frontend never sorts anything.
  const reviewRows = (await sql`
    SELECT id, restaurant_id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC, id DESC
  `) as ReviewRow[];

  // No reviews yet: the honest "nothing here" shape. avg stays null, count is 0.
  if (reviewRows.length === 0) {
    return NextResponse.json({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating: null,
      totalReviews: 0,
      latestReview: null,
      reviews: [],
    });
  }

  // The two live calculations -- AVG and COUNT -- happen in the database, now.
  const stats = await sql`
    SELECT
      AVG(rating)::numeric AS average_rating,
      COUNT(*)::int        AS total_reviews
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
  `;

  const latest = reviewRows[0];
  const older = reviewRows.slice(1);

  return NextResponse.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating: Number(Number(stats[0].average_rating).toFixed(1)),
    totalReviews: stats[0].total_reviews,
    latestReview: toReview(latest),
    reviews: older.map(toReview),
  });
}
