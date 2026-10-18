const fs = require("fs");

// Load existing games
const gamesData = JSON.parse(fs.readFileSync("/Users/kasper.siggaard/Code/interview-projects/game-api/scripts/seed-data/games.json", "utf8"));

// Game title components
const prefixes = ["Rise of", "Chronicles of", "Tales of", "Dark", "Neo", "Legend of", "Mystic", "Shadow", "Epic", "Final", "Eternal", "Cyber", "Star", "Iron", "Crystal", "Thunder", "Phantom", "Infinite", "Lost", "Sacred", "Ancient", "Burning", "Frozen", "Golden", "Silver"];
const middles = ["World", "Castle", "Realm", "Empire", "Galaxy", "Quest", "Hunters", "Warriors", "Knights", "Dragons", "Heroes", "Legends", "Titans", "Kingdoms", "Odyssey", "Frontiers", "Horizons", "Dominion", "Conquest", "Legacy", "Spirits", "Echoes", "Shores", "Peaks", "Valleys"];
const suffixes = ["Resurrection", "Unlimited", "Zero", "Origins", "Reborn", "Ultimate", "Destiny", "Chronicles", "Saga", "Legacy", "Revolution", "Awakening", "Ascension", "Eclipse", "Prophecy", "Genesis", "Requiem", "Covenant", "Reckoning", "Redemption"];

const descriptions = [
  "A thrilling action-packed experience with stunning visuals and immersive gameplay.",
  "An open-world adventure with endless possibilities and discoveries.",
  "An innovative title that pushes the boundaries of what games can achieve.",
  "An epic adventure that challenges players to explore vast worlds and overcome incredible odds.",
  "A fast-paced action game with responsive controls and exciting combat.",
  "A narrative-driven experience that explores complex themes and emotions.",
  "A competitive multiplayer experience that brings players together from around the world.",
  "A heartwarming journey through beautifully crafted environments.",
  "A challenging game that rewards skill and perseverance.",
  "A unique blend of genres that creates something truly special.",
  "An atmospheric experience that will stay with you long after playing.",
  "A polished gem with attention to every detail.",
  "A revolutionary approach to the genre with innovative mechanics.",
  "A nostalgic throwback with modern sensibilities.",
  "A deep and engaging experience for dedicated players."
];

const platforms = ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X", "Xbox One", "Nintendo Switch", "Mobile", "PC/Steam", "Multi-platform", "VR"];

// Developers: 21-100 (original) + 121-200 (new developers)
const developerIds = [...Array.from({length: 80}, (_, i) => i + 21), ...Array.from({length: 80}, (_, i) => i + 121)];

// Publishers: 1-20 (original) + 101-120 (new publishers)
const publisherIds = [...Array.from({length: 20}, (_, i) => i + 1), ...Array.from({length: 20}, (_, i) => i + 101)];

// All 30 genres
const genreIds = Array.from({length: 30}, (_, i) => i + 1);

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(startYear, endYear) {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function generateTitle(index) {
  const style = index % 5;
  switch (style) {
    case 0: return getRandomElement(prefixes) + " " + getRandomElement(middles);
    case 1: return getRandomElement(middles) + " " + getRandomElement(suffixes);
    case 2: return getRandomElement(prefixes) + " " + getRandomElement(middles) + " " + getRandomElement(suffixes);
    case 3: return getRandomElement(middles);
    case 4: return getRandomElement(prefixes) + " " + getRandomElement(middles) + " " + (Math.floor(Math.random() * 5) + 2);
  }
}

const usedTitles = new Set(gamesData.games.map(function(g) { return g.title; }));

const newGames = [];
for (let i = 261; i <= 520; i++) {
  let title;
  do {
    title = generateTitle(i);
  } while (usedTitles.has(title));
  usedTitles.add(title);

  newGames.push({
    id: i,
    title: title,
    description: getRandomElement(descriptions),
    genreId: getRandomElement(genreIds),
    platform: getRandomElement(platforms),
    releaseDate: getRandomDate(1990, 2025),
    developerId: getRandomElement(developerIds),
    publisherId: getRandomElement(publisherIds)
  });
}

gamesData.games = gamesData.games.concat(newGames);
fs.writeFileSync("/Users/kasper.siggaard/Code/interview-projects/game-api/scripts/seed-data/games.json", JSON.stringify(gamesData, null, 2));
console.log("Added " + newGames.length + " new games. Total games: " + gamesData.games.length);
