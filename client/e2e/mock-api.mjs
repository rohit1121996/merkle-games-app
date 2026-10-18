import { createServer } from "node:http";

const port = Number(process.env.MOCK_API_PORT ?? 8011);

const games = [
  {
    id: 98101,
    title: "Sample Adventure",
    description: "A story-driven adventure.",
    release_date: "2017-05-10",
    developer: { name: "Studio North" },
    genre: { id: 7, name: "Adventure" },
    images: [
      {
        image_type: "Cover",
        image_url: "https://images.example/sample-adventure.jpg",
      },
    ],
  },
  {
    id: 98202,
    title: "Puzzle Quest",
    description: "A thoughtful puzzle game.",
    release_date: "2016-09-18",
    developer: { name: "Studio South" },
    genre: { id: 9, name: "Puzzle" },
    images: [
      {
        image_type: "Cover",
        image_url: "https://images.example/puzzle-quest.jpg",
      },
    ],
  },
];

games.push(
  ...Array.from({ length: 13 }, (_, index) => ({
    id: 98300 + index,
    title: `Featured Game ${index + 1}`,
    description: "A featured game for the browser test fixture.",
    release_date: `2015-${String((index % 12) + 1).padStart(2, "0")}-15`,
    developer: { name: "Fixture Studio" },
    genre: { id: 11, name: "Strategy" },
    images: [
      {
        image_type: "Cover",
        image_url: `https://images.example/featured-${index + 1}.jpg`,
      },
    ],
  })),
);

const reviews = [
  {
    id: 1,
    rating: 10,
    review_text: "A great game from start to finish.",
    user: { username: "player-one" },
  },
];

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
};

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  const path = url.pathname.replace("/api/v1", "");

  if (path === "/genres") {
    return sendJson(response, 200, {
      data: [
        { id: 7, name: "Adventure" },
        { id: 9, name: "Puzzle" },
      ],
    });
  }

  if (path === "/games") {
    const genreId = url.searchParams.get("genre");
    const searchTerm = url.searchParams.get("search")?.toLowerCase();
    const matchingGames = games.filter((game) => {
      const matchesGenre = !genreId || String(game.genre.id) === genreId;
      const matchesSearch =
        !searchTerm || game.title.toLowerCase().includes(searchTerm);
      return matchesGenre && matchesSearch;
    });
    const limit = Number(url.searchParams.get("limit") || 12);

    return sendJson(response, 200, {
      data: matchingGames.slice(0, limit),
      _metadata: {
        page: 1,
        limit,
        total: matchingGames.length,
        totalPages: Math.max(1, Math.ceil(matchingGames.length / limit)),
      },
    });
  }

  const gameStats = /^\/games\/(\d+)\/stats$/.exec(path);
  if (gameStats) {
    const statsByGameId = {
      98101: { average_rating: 7.6, total_reviews: 9 },
      98202: { average_rating: 9.2, total_reviews: 18 },
    };
    return sendJson(response, 200, {
      data: statsByGameId[gameStats[1]] ?? {
        average_rating: 0,
        total_reviews: 0,
      },
    });
  }

  const gameDetails = /^\/games\/(\d+)$/.exec(path);
  if (gameDetails) {
    const game = games.find((item) => String(item.id) === gameDetails[1]);
    if (!game) {
      return sendJson(response, 404, { error: { message: "Game not found" } });
    }

    return sendJson(response, 200, {
      data: {
        ...game,
        reviews: game.id === 98101 ? reviews : [],
      },
    });
  }

  return sendJson(response, 404, { error: { message: "Not found" } });
});

server.listen(port, "127.0.0.1");
