import { describe, expect, it } from "vitest";
import { formatGameItem } from "~/src/server/utils/game";

describe("formatGameItem", () => {
  it("maps backend game fields into the client game shape", () => {
    const game = formatGameItem(
      {
        id: 42,
        title: "Example",
        description: "Description",
        release_date: "2024-04-01",
        developer: { name: "Studio" },
        genre: { name: "Puzzle" },
      },
      "https://games.example",
    );

    expect(game).toEqual({
      id: "42",
      title: "Example",
      description: "Description",
      releaseDate: "2024-04-01",
      developer: "Studio",
      genres: ["Puzzle"],
      image: "",
      rating: { count: 0, average: 0 },
      reviews: [],
    });
  });

  it("uses the cover image when available and resolves relative image paths", () => {
    const game = formatGameItem(
      {
        id: 1,
        title: "Example",
        release_date: "2024-04-01",
        images: [
          { image_type: "Screenshot", image_url: "/screenshots/1.jpg" },
          { image_type: "Cover", image_url: "/covers/1.jpg" },
        ],
      },
      "https://games.example",
    );

    expect(game.image).toBe("https://games.example/covers/1.jpg");
  });

  it("keeps absolute image URLs unchanged", () => {
    const game = formatGameItem(
      {
        id: 1,
        title: "Example",
        release_date: "2024-04-01",
        images: [
          { image_type: "Cover", image_url: "https://cdn.example/1.jpg" },
        ],
      },
      "https://games.example",
    );

    expect(game.image).toBe("https://cdn.example/1.jpg");
  });

  it("uses supplied statistics and maps review details", () => {
    const game = formatGameItem(
      {
        id: 7,
        title: "Example",
        release_date: "2024-04-01",
        average_rating: 8.26,
        total_reviews: 12,
        reviews: [
          {
            id: 15,
            rating: 10,
            review_text: "Excellent",
            user: { username: "player1" },
          },
        ],
      },
      "",
    );

    expect(game.rating).toEqual({ count: 12, average: 8.3 });
    expect(game.reviews).toEqual([
      {
        id: "15",
        username: "player1",
        rating: 10,
        text: "Excellent",
      },
    ]);
  });

  it("calculates averages without converting the backend's ten-point scale", () => {
    const game = formatGameItem(
      {
        id: 8,
        title: "Example",
        release_date: "2024-04-01",
        reviews: [{ id: 1, rating: 8 }, { id: 2, rating: 10 }],
      },
      "",
    );

    expect(game.rating).toEqual({ count: 2, average: 9 });
  });

  it("calculates an average from reviews when backend stats are absent", () => {
    const game = formatGameItem(
      {
        id: 2,
        title: "Example",
        release_date: "2024-04-01",
        reviews: [
          { id: 1, rating: 4 },
          { id: 2, rating: 5 },
        ],
      },
      "",
    );

    expect(game.rating).toEqual({ count: 2, average: 4.5 });
  });

  it("uses fallback values for missing optional backend fields", () => {
    const game = formatGameItem(
      { id: 3, title: "Example", release_date: "2024-04-01" },
      "",
    );

    expect(game.description).toBe("");
    expect(game.developer).toBe("Unknown");
    expect(game.genres).toEqual([]);
    expect(game.image).toBe("");
    expect(game.rating).toEqual({ count: 0, average: 0 });
  });
});
