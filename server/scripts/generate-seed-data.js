#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Game title components for procedural generation
const gamePrefixes = [
  'Super', 'Mega', 'Ultra', 'Epic', 'Dark', 'Shadow', 'Crystal', 'Golden',
  'Silver', 'Crimson', 'Azure', 'Eternal', 'Mystic', 'Ancient', 'Neo',
  'Cyber', 'Quantum', 'Infinite', 'Ultimate', 'Legend of', 'Tales of',
  'Chronicles of', 'Rise of', 'Fall of', 'Return to', 'Escape from'
];

const gameNouns = [
  'Warriors', 'Legends', 'Heroes', 'Quest', 'Saga', 'Adventure', 'Journey',
  'Battle', 'War', 'Conflict', 'Storm', 'Knight', 'Dragon', 'Phoenix',
  'Realm', 'Kingdom', 'Empire', 'City', 'World', 'Universe', 'Galaxy',
  'Fortress', 'Castle', 'Dungeon', 'Arena', 'Colosseum', 'Odyssey',
  'Raiders', 'Hunters', 'Guardians', 'Defenders', 'Champions', 'Titans'
];

const gameSuffixes = [
  'Returns', 'Reborn', 'Revolution', 'Resurrection', 'Remastered',
  'HD', '2', '3', '4', 'X', 'Zero', 'Origins', 'Chronicles',
  'Legacy', 'Forever', 'Online', 'Unlimited', 'Plus', 'Prime'
];

const platforms = [
  'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X', 'Xbox One',
  'Nintendo Switch', 'PC/Steam', 'Multi-platform', 'Mobile', 'VR'
];

const gameDescriptions = [
  'An epic adventure that challenges players to explore vast worlds and overcome incredible odds.',
  'A thrilling action-packed experience with stunning visuals and immersive gameplay.',
  'A strategic masterpiece that combines deep mechanics with engaging storytelling.',
  'An innovative title that pushes the boundaries of what games can achieve.',
  'A heartwarming journey through beautifully crafted environments.',
  'A competitive multiplayer experience that brings players together from around the world.',
  'A narrative-driven experience that explores complex themes and emotions.',
  'A challenging game that rewards skill and perseverance.',
  'An open-world adventure with endless possibilities and discoveries.',
  'A fast-paced action game with responsive controls and exciting combat.'
];

// Generate unique game titles
function generateGameTitle(index) {
  const usePrefix = Math.random() > 0.3;
  const useSuffix = Math.random() > 0.6;

  let title = '';
  if (usePrefix) {
    title += gamePrefixes[Math.floor(Math.random() * gamePrefixes.length)] + ' ';
  }
  title += gameNouns[Math.floor(Math.random() * gameNouns.length)];
  if (useSuffix) {
    title += ' ' + gameSuffixes[Math.floor(Math.random() * gameSuffixes.length)];
  }

  // Add index to ensure uniqueness
  if (index > 100) {
    title += ` ${Math.floor(index / 50)}`;
  }

  return title;
}

// Generate random date between two dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate games data
function generateGames() {
  const games = [];
  const startDate = new Date('2010-01-01');
  const endDate = new Date('2024-11-01');

  for (let i = 1; i <= 260; i++) {
    const genreId = Math.floor(Math.random() * 15) + 1;
    const developerId = Math.floor(Math.random() * 80) + 21; // Developers are ID 21-100
    const publisherId = Math.floor(Math.random() * 20) + 1; // Publishers are ID 1-20
    const releaseDate = randomDate(startDate, endDate);

    games.push({
      id: i,
      title: generateGameTitle(i),
      description: gameDescriptions[Math.floor(Math.random() * gameDescriptions.length)],
      genreId: genreId,
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      releaseDate: releaseDate.toISOString().split('T')[0],
      developerId: developerId,
      publisherId: publisherId
    });
  }

  return games;
}

// Generate user data
function generateUsers() {
  const users = [];
  const userNames = [
    'GamerPro', 'NinjaPlayer', 'DragonSlayer', 'PhoenixRising', 'ShadowHunter',
    'CyberKnight', 'MysticMage', 'ThunderBolt', 'IceQueen', 'FireStorm',
    'DarkKnight', 'LightBringer', 'StormRider', 'StarGazer', 'MoonWalker',
    'SunChaser', 'WindRunner', 'EarthShaker', 'WaveRider', 'CloudJumper'
  ];

  for (let i = 1; i <= 50; i++) {
    const baseName = userNames[Math.floor(Math.random() * userNames.length)];
    const registrationDate = randomDate(new Date('2020-01-01'), new Date('2024-10-01'));

    users.push({
      id: i,
      username: `${baseName}${i}`,
      email: `${baseName.toLowerCase()}${i}@gameapi.com`,
      registrationDate: registrationDate.toISOString().split('T')[0]
    });
  }

  return users;
}

// Generate reviews data
function generateReviews() {
  const reviews = [];
  const reviewTexts = [
    'Amazing game! Absolutely loved every minute of it.',
    'Great graphics and gameplay, but the story could be better.',
    'One of the best games I\'ve played this year!',
    'Solid gameplay mechanics, worth the price.',
    'Good game, but has some bugs that need fixing.',
    'Incredible experience from start to finish.',
    'Fun to play but gets repetitive after a while.',
    'Exceeded my expectations! Highly recommended.',
    'Not bad, but I expected more from this title.',
    'Masterpiece! This is how games should be made.',
    'Entertaining but lacks depth in some areas.',
    'Perfect balance of challenge and fun.',
    'Beautiful art style and engaging gameplay.',
    'Could use some improvements but overall enjoyable.',
    'Outstanding game design and execution.',
    'Decent game with room for improvement.',
    'Absolutely fantastic! Can\'t stop playing.',
    'Good value for money, hours of entertainment.',
    'Interesting concept but poor execution.',
    'One of my favorite games of all time!'
  ];

  // Track used combinations to ensure uniqueness
  const usedCombinations = new Set();
  let reviewId = 1;

  // Generate 1200 reviews with unique game/user combinations
  while (reviews.length < 1200) {
    const gameId = Math.floor(Math.random() * 260) + 1;
    const userId = Math.floor(Math.random() * 50) + 1;
    const combination = `${gameId}-${userId}`;

    // Skip if this combination already exists
    if (usedCombinations.has(combination)) {
      continue;
    }

    usedCombinations.add(combination);
    const ratingScore = (Math.random() * 4 + 1).toFixed(1); // Rating between 1.0 and 5.0
    const reviewDate = randomDate(new Date('2021-01-01'), new Date('2024-11-01'));

    reviews.push({
      id: reviewId++,
      gameId: gameId,
      userId: userId,
      ratingScore: parseFloat(ratingScore),
      reviewText: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
      reviewDate: reviewDate.toISOString().split('T')[0]
    });
  }

  return reviews;
}

// Generate images data
function generateImages() {
  const images = [];
  const imageTypes = ['Screenshot', 'Cover', 'Artwork'];
  let imageId = 1;

  // Generate 3-5 images for each game
  for (let gameId = 1; gameId <= 260; gameId++) {
    const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images per game

    for (let j = 0; j < numImages; j++) {
      const imageType = imageTypes[Math.floor(Math.random() * imageTypes.length)];
      images.push({
        id: imageId++,
        imageUrl: `https://placeholder.gamedb.com/images/game${gameId}_${imageType.toLowerCase()}${j + 1}.jpg`,
        imageType: imageType
      });
    }
  }

  return images;
}

// Generate image relations
function generateImageRelations(images) {
  const relations = [];
  let relationId = 1;

  images.forEach(image => {
    // Most images will be related to games
    const gameId = Math.floor((image.id - 1) / 4) + 1; // Approximate game ID based on image ID

    relations.push({
      id: relationId++,
      imageId: image.id,
      relatedType: 'Game',
      relatedId: Math.min(gameId, 260), // Ensure it doesn't exceed max games
      createdDate: new Date().toISOString().split('T')[0]
    });
  });

  // Company logos are not needed since we don't have images for them yet

  return relations;
}

// Main function to generate all seed data
function generateAllSeedData() {
  console.log('🎮 Generating Game DB seed data...');

  const seedData = {
    games: generateGames(),
    users: generateUsers(),
    reviews: generateReviews(),
    images: generateImages()
  };

  seedData.imageRelations = generateImageRelations(seedData.images);

  // Save each data type to separate JSON files
  const dataTypes = ['games', 'users', 'reviews', 'images', 'imageRelations'];

  dataTypes.forEach(type => {
    const filePath = path.join(__dirname, 'seed-data', `${type}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ [type]: seedData[type] }, null, 2));
    console.log(`✅ Generated ${seedData[type].length} ${type} -> ${filePath}`);
  });

  // Create a summary file
  const summary = {
    totalGames: seedData.games.length,
    totalUsers: seedData.users.length,
    totalReviews: seedData.reviews.length,
    totalImages: seedData.images.length,
    totalImageRelations: seedData.imageRelations.length,
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(__dirname, 'seed-data', 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log('\n📊 Seed Data Summary:');
  console.log(`  - Games: ${summary.totalGames}`);
  console.log(`  - Users: ${summary.totalUsers}`);
  console.log(`  - Reviews: ${summary.totalReviews}`);
  console.log(`  - Images: ${summary.totalImages}`);
  console.log(`  - Image Relations: ${summary.totalImageRelations}`);
  console.log('\n🎉 Seed data generation complete!');
}

// Run the generator
generateAllSeedData();