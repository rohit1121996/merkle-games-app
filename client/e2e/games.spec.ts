import { expect, test } from "@playwright/test";

test("SSR renders games and hydrates without repeating the initial API calls", async ({
  page,
}) => {
  const apiRequests: string[] = [];
  await page.route("https://images.example/**", (route) => route.abort());
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith("/api/")) {
      apiRequests.push(url.pathname + url.search);
    }
  });

  const response = await page.goto("/", { waitUntil: "networkidle" });
  const html = await response?.text();
  expect(html).toContain("Sample Adventure");
  expect(html).toContain('href="/games/98101"');
  await expect(page).toHaveTitle("Markle Games");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Browse and explore video games from the Markle Games API.",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Markle Games",
  );
  await expect(page.locator('meta[name="description"]')).toHaveCount(1);

  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).toBeVisible();
  await expect(
    page.getByText("Adventure", { exact: true }).last(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Puzzle Quest" }),
  ).toBeVisible();
  await expect(page.locator(".game-card")).toHaveCount(15);
  await expect(page.locator(".game-card h3").nth(0)).toHaveText("Puzzle Quest");
  await expect(page.locator(".game-card h3").nth(1)).toHaveText(
    "Sample Adventure",
  );
  const releaseDates = await page
    .locator(".game-card .release-date")
    .allTextContents();
  expect(releaseDates).toHaveLength(15);
  expect(
    releaseDates.every((date) => /\b201[5-7]\b/.test(date)),
  ).toBe(true);
  await expect(
    page.getByRole("img", {
      name: "Average rating 9.2 out of 10 from 18 reviews",
    }),
  ).toBeVisible();
  await expect(page.locator(".fallback-image").first()).toBeVisible();
  expect(apiRequests).toEqual([]);

  await page.getByLabel("Sort by:").selectOption("releaseDate");
  await expect(page.locator(".game-card h3").nth(0)).toHaveText(
    "Sample Adventure",
  );
  await expect(page.locator(".game-card h3").nth(1)).toHaveText("Puzzle Quest");

  await page.getByLabel("Sort by:").selectOption("rating");
  await expect(page.locator(".game-card h3").nth(0)).toHaveText("Puzzle Quest");
  await expect(page.locator(".game-card h3").nth(1)).toHaveText(
    "Sample Adventure",
  );

  await page.getByLabel("Genre:").selectOption("7");

  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Puzzle Quest" }),
  ).not.toBeVisible();

  expect(apiRequests.filter((path) => path.startsWith("/api/games"))).toHaveLength(
    1,
  );
});

test("returns a 404 and noindex metadata for an unknown game", async ({
  page,
}) => {
  const response = await page.goto("/games/999999");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("alert").getByRole("heading", {
      name: "Unable to load game details",
    }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
});

test("prioritizes the first game cover and lazy-loads other covers", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const covers = page.locator(".game-card img");
  await expect(covers.first()).toHaveAttribute("loading", "eager");
  await expect(covers.first()).toHaveAttribute("fetchpriority", "high");
  await expect(covers.nth(1)).toHaveAttribute("loading", "lazy");

  await page.locator(".game-card a").first().click();
  await expect(page.locator(".hero-image img")).toHaveAttribute(
    "loading",
    "eager",
  );
  await expect(page.locator(".hero-image img")).toHaveAttribute(
    "fetchpriority",
    "high",
  );
});

test("filters the featured games by genre and search", async ({ page }) => {
  const gameRequests: string[] = [];
  await page.goto("/", { waitUntil: "networkidle" });
  await page.route("**/api/games?*", async (route) => {
    const url = new URL(route.request().url());
    gameRequests.push(url.pathname + url.search);
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        games: [
          {
            id: "filtered-game",
            title: "Filtered Game",
            description: "A game used to test filtering.",
            image: "",
            releaseDate: "2016-01-15",
            developer: "Test Studio",
            genres: ["Adventure"],
            rating: { count: 0, average: 0 },
            reviews: [],
          },
        ],
      }),
    });
  });

  await page.getByLabel("Genre:").selectOption("7");
  await expect(
    page.getByRole("heading", { name: "Filtered Game" }),
  ).toBeVisible();
  await expect(page.locator(".game-card")).toHaveCount(1);
  await expect.poll(() => gameRequests.length).toBe(1);
  const genreQuery = new URLSearchParams(gameRequests[0]?.split("?")[1]);
  expect(genreQuery.get("genre")).toBe("7");

  gameRequests.length = 0;
  await page
    .getByRole("searchbox", { name: "Search games by title" })
    .fill("puzzle");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(
    page.getByRole("heading", { name: "Filtered Game" }),
  ).toBeVisible();
  await expect.poll(() => gameRequests.length).toBe(1);
  const combinedQuery = new URLSearchParams(gameRequests[0]?.split("?")[1]);
  expect(combinedQuery.get("genre")).toBe("7");
  expect(combinedQuery.get("search")).toBe("puzzle");
});

test("shows the responsive game grid at desktop and mobile widths", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const grid = page.locator(".game-grid-container");
  const desktopColumns = await grid.evaluate(
    (element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(desktopColumns).toBeGreaterThanOrEqual(2);

  await page.setViewportSize({ width: 320, height: 812 });
  const mobileColumns = await grid.evaluate(
    (element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(mobileColumns).toBe(1);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});

test("opens a game details page and returns to the game list", async ({
  page,
}) => {
  const listApiRequests: string[] = [];
  await page.route("https://images.example/**", (route) => route.abort());
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === "/api/games" ||
      url.pathname === "/api/genres"
    ) {
      listApiRequests.push(url.pathname + url.search);
    }
  });

  await page.goto("/", { waitUntil: "networkidle" });
  expect(listApiRequests).toEqual([]);
  await page.getByRole("heading", { name: "Sample Adventure" }).click();

  await expect(page).toHaveURL(/\/games\/98101$/);
  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).toBeVisible();
  await expect(page.getByText("A story-driven adventure.")).toBeVisible();
  await expect(page.getByText("May 10, 2017")).toBeVisible();
  await expect(page.getByText("Studio North")).toBeVisible();
  await expect(page.getByText("Adventure", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Average rating 10 out of 10 from 1 reviews",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Rated 10 out of 10" }),
  ).toBeVisible();
  await expect(page.locator(".fallback-image")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Player Reviews (1)" }),
  ).toBeVisible();
  await expect(page.getByText("player-one")).toBeVisible();
  await expect(page.getByText("A great game from start to finish.")).toBeVisible();

  await page.getByRole("link", { name: "Back to games" }).click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).toBeVisible();
  expect(listApiRequests).toEqual([]);
});

test("SSR renders a directly opened game details page", async ({ page }) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith("/api/")) {
      apiRequests.push(url.pathname + url.search);
    }
  });

  const response = await page.goto("/games/98101", {
    waitUntil: "networkidle",
  });

  expect(await response?.text()).toContain("Sample Adventure</h1>");
  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).toBeVisible();
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page).toHaveTitle("Sample Adventure | Markle Games");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "A story-driven adventure.",
  );
  await expect(page.locator('meta[name="description"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Sample Adventure | Markle Games",
  );
  expect(apiRequests).toEqual([]);
});

test("shows a clear state when a game has no reviews", async ({ page }) => {
  await page.goto("/games/98300", { waitUntil: "networkidle" });

  await expect(
    page.getByRole("heading", { name: "Player Reviews (0)" }),
  ).toBeVisible();
  await expect(page.getByText("No reviews yet.")).toBeVisible();
});

test("renders listing and game details without client-side JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const browserApiRequests: string[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith("/api/")) {
      browserApiRequests.push(url.pathname + url.search);
    }
  });

  const listingResponse = await page.goto("/");
  expect(listingResponse?.status()).toBe(200);
  await expect(page).toHaveTitle("Markle Games");
  await expect(
    page.getByRole("heading", { name: "Featured Games" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Puzzle Quest" }),
  ).toBeVisible();
  await expect(page.locator(".game-card")).toHaveCount(15);

  const detailsResponse = await page.goto("/games/98101");
  expect(detailsResponse?.status()).toBe(200);
  await expect(page).toHaveTitle("Sample Adventure | Markle Games");
  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).toBeVisible();
  await expect(page.getByText("A story-driven adventure.")).toBeVisible();
  await expect(page.getByText("Studio North")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Player Reviews (1)" }),
  ).toBeVisible();
  expect(browserApiRequests).toEqual([]);

  await context.close();
});

