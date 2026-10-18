import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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

test("searches games by title", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await page
    .getByRole("searchbox", { name: "Search games by title" })
    .fill("puzzle");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(
    page.getByRole("heading", { name: "Puzzle Quest" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).not.toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Puzzle Quest" }),
  ).toBeVisible();
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

test("supports keyboard access to the main content and theme control", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page.getByRole("button", { name: "Switch to dark mode" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Switch to light mode" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("supports keyboard search, game navigation, and returning to the list", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const search = page.getByRole("searchbox", { name: "Search games by title" });
  await page.keyboard.press("Tab");
  await expect(search).toBeFocused();
  await search.fill("puzzle");
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("heading", { name: "Puzzle Quest" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).not.toBeVisible();

  const clearButton = page.getByRole("button", { name: "Clear" });
  await clearButton.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).toBeVisible();

  const gameLink = page.getByRole("link", { name: "Sample Adventure" });
  await expect(gameLink).toBeVisible();
  await gameLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/games\/98101$/);

  const backLink = page.getByRole("link", { name: "Back to games" });
  await backLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/");
});

test("announces loading, empty results, and errors accessibly", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.route("**/api/games?*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        games: [],
      }),
    });
  });

  const search = page.getByRole("searchbox", { name: "Search games by title" });
  await search.fill("missing");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("#results-announcement")).toHaveText(
    "Updating game results.",
  );
  await expect(page.locator(".games-results")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await expect(page.locator(".empty-state-container")).toContainText(
    "No games found.",
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);

  await page.unroute("**/api/games?*");
  let failRequest = true;
  await page.route("**/api/games?*", (route) =>
    failRequest
      ? route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 502,
            statusMessage: "Could not load games",
          }),
        })
      : route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            games: [],
          }),
        }),
  );
  await search.fill("unavailable");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(
    page.getByRole("alert").getByRole("heading", {
      name: "Unable to load games",
    }),
  ).toBeVisible();
  const errorAlert = page.getByRole("alert");
  await expect(errorAlert.locator("p")).toHaveText(
    "We couldn't load games right now. Please try again.",
  );
  await expect(errorAlert).not.toContainText(/GET.*\/api\/games/i);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);

  failRequest = false;
  const retryButton = page.getByRole("button", { name: "Try again" });
  await retryButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".empty-state-container")).toContainText(
    "No games found.",
  );
});

test("keeps reduced-motion preferences respected", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });

  const gameCard = page.locator(".game-card").first();
  await expect(gameCard).toBeVisible();
  expect(
    await gameCard.evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe("0s");
});

test("has no automated WCAG 2.2 AA violations on listing or detail pages", async ({
  page,
}) => {
  await page.route("https://images.example/**", (route) => route.abort());
  await page.goto("/", { waitUntil: "networkidle" });

  const listingResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(listingResults.violations).toEqual([]);
  await expect(page.locator("main h1")).toHaveCount(1);

  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  const darkListingResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(darkListingResults.violations).toEqual([]);

  await page.goto("/games/98101", { waitUntil: "networkidle" });
  const detailResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(detailResults.violations).toEqual([]);

  await page.getByRole("button", { name: "Switch to light mode" }).click();
  const lightDetailResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(lightDetailResults.violations).toEqual([]);

  await page.setViewportSize({ width: 320, height: 812 });
  const narrowDetailResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(narrowDetailResults.violations).toEqual([]);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
