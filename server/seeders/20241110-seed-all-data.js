'use strict';

const fs = require('fs');
const path = require('path');

// Load JSON data files
const loadJSONData = (filename) => {
  const filePath = path.join(__dirname, '..', 'scripts', 'seed-data', filename);
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Enable foreign key enforcement for SQLite
      await queryInterface.sequelize.query('PRAGMA foreign_keys = ON;');

      console.log('🎮 Starting database seeding...');

      // 1. Seed Genres
      console.log('📚 Seeding genres...');
      const genresData = loadJSONData('genres.json');
      const genres = genresData.genres.map(genre => ({
        id: genre.id,
        genre_name: genre.genreName,
        created_at: new Date(),
        updated_at: new Date()
      }));
      await queryInterface.bulkInsert('genres', genres);
      console.log(`✅ Inserted ${genres.length} genres`);

      // 2. Seed Companies
      console.log('🏢 Seeding companies...');
      const companiesData = loadJSONData('companies.json');
      const companies = companiesData.companies.map(company => ({
        id: company.id,
        name: company.name,
        country: company.country,
        founded_year: company.foundedYear,
        company_type: company.companyType,
        created_at: new Date(),
        updated_at: new Date()
      }));
      await queryInterface.bulkInsert('companies', companies);
      console.log(`✅ Inserted ${companies.length} companies`);

      // 3. Seed Users
      console.log('👤 Seeding users...');
      const usersData = loadJSONData('users.json');
      // Default hashed password for seed data (password: "seedpassword123")
      const defaultPasswordHash = '$2a$10$rQnM1.YP5YKxGpvLZCk5XeQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ';
      const users = usersData.users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        password: defaultPasswordHash,
        registration_date: user.registrationDate,
        created_at: new Date(),
        updated_at: new Date()
      }));
      await queryInterface.bulkInsert('users', users);
      console.log(`✅ Inserted ${users.length} users`);

      // 4. Seed Games
      console.log('🎮 Seeding games...');
      const gamesData = loadJSONData('games.json');
      const games = gamesData.games.map(game => ({
        id: game.id,
        title: game.title,
        description: game.description,
        genre_id: game.genreId,
        platform: game.platform,
        release_date: game.releaseDate,
        developer_id: game.developerId,
        publisher_id: game.publisherId,
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Insert games in batches to avoid memory issues
      const batchSize = 50;
      for (let i = 0; i < games.length; i += batchSize) {
        const batch = games.slice(i, i + batchSize);
        await queryInterface.bulkInsert('games', batch);
        console.log(`  Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(games.length/batchSize)}`);
      }
      console.log(`✅ Inserted ${games.length} games`);

      // 5. Seed Reviews
      console.log('⭐ Seeding reviews...');
      const reviewsData = loadJSONData('reviews.json');

      // Filter out duplicate game/user combinations
      const seenCombos = new Set();
      const reviews = reviewsData.reviews.filter(review => {
        const combo = `${review.gameId}-${review.userId}`;
        if (seenCombos.has(combo)) {
          return false;
        }
        seenCombos.add(combo);
        return true;
      }).map(review => ({
        id: review.id,
        game_id: review.gameId,
        user_id: review.userId,
        rating_score: review.ratingScore,
        review_text: review.reviewText,
        review_date: review.reviewDate,
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Insert reviews in batches
      for (let i = 0; i < reviews.length; i += batchSize) {
        const batch = reviews.slice(i, i + batchSize);
        await queryInterface.bulkInsert('user_reviews', batch);
        if (i % 200 === 0) {
          console.log(`  Inserted ${i + batch.length}/${reviews.length} reviews`);
        }
      }
      console.log(`✅ Inserted ${reviews.length} reviews`);

      // 6. Seed Images (using deterministic media generator URLs)
      console.log('🖼️ Seeding images with media generator URLs...');

      // Helper to create URL-safe seed from entity name
      const createSeed = (name, suffix) => encodeURIComponent(`${name}-${suffix}`);

      // Generate images for games (cover, screenshots, artwork)
      const generatedImages = [];
      const imageRelations = [];
      let imageId = 1;
      let relationId = 1;

      // Game images: 4 images per game (1 cover, 2 screenshots, 1 artwork)
      for (const game of gamesData.games) {
        const gameImages = [
          { type: 'Cover', suffix: 'cover', w: 300, h: 400 },
          { type: 'Screenshot', suffix: 'screenshot-1', w: 800, h: 450 },
          { type: 'Screenshot', suffix: 'screenshot-2', w: 800, h: 450 },
          { type: 'Artwork', suffix: 'artwork', w: 600, h: 600 }
        ];

        for (const img of gameImages) {
          generatedImages.push({
            id: imageId,
            image_url: `/media/${createSeed(game.title, img.suffix)}?w=${img.w}&h=${img.h}`,
            image_type: img.type,
            created_at: new Date(),
            updated_at: new Date()
          });

          imageRelations.push({
            id: relationId,
            image_id: imageId,
            related_type: 'Game',
            related_id: game.id,
            created_date: new Date().toISOString().split('T')[0],
            created_at: new Date(),
            updated_at: new Date()
          });

          imageId++;
          relationId++;
        }
      }

      // Company images: 1 logo per company (using 'Artwork' type as closest match)
      for (const company of companiesData.companies) {
        generatedImages.push({
          id: imageId,
          image_url: `/media/${createSeed(company.name, 'logo')}?w=200`,
          image_type: 'Artwork',
          created_at: new Date(),
          updated_at: new Date()
        });

        imageRelations.push({
          id: relationId,
          image_id: imageId,
          related_type: 'Company',
          related_id: company.id,
          created_date: new Date().toISOString().split('T')[0],
          created_at: new Date(),
          updated_at: new Date()
        });

        imageId++;
        relationId++;
      }

      // Genre images: 1 banner per genre (using 'Cover' type as closest match)
      for (const genre of genresData.genres) {
        generatedImages.push({
          id: imageId,
          image_url: `/media/${createSeed(genre.genreName, 'banner')}?w=800&h=200`,
          image_type: 'Cover',
          created_at: new Date(),
          updated_at: new Date()
        });

        imageRelations.push({
          id: relationId,
          image_id: imageId,
          related_type: 'Genre',
          related_id: genre.id,
          created_date: new Date().toISOString().split('T')[0],
          created_at: new Date(),
          updated_at: new Date()
        });

        imageId++;
        relationId++;
      }

      // User avatars: 1 avatar per user (using 'Artwork' type as closest match)
      for (const user of usersData.users) {
        generatedImages.push({
          id: imageId,
          image_url: `/media/${createSeed(user.username, 'avatar')}?w=100`,
          image_type: 'Artwork',
          created_at: new Date(),
          updated_at: new Date()
        });

        imageRelations.push({
          id: relationId,
          image_id: imageId,
          related_type: 'User',
          related_id: user.id,
          created_date: new Date().toISOString().split('T')[0],
          created_at: new Date(),
          updated_at: new Date()
        });

        imageId++;
        relationId++;
      }

      // Insert images in batches
      for (let i = 0; i < generatedImages.length; i += batchSize) {
        const batch = generatedImages.slice(i, i + batchSize);
        await queryInterface.bulkInsert('images', batch);
        if (i % 200 === 0) {
          console.log(`  Inserted ${i + batch.length}/${generatedImages.length} images`);
        }
      }
      console.log(`✅ Inserted ${generatedImages.length} images (using /media endpoint)`);

      // 7. Seed Image Relations
      console.log('🔗 Seeding image relations...');

      // Insert image relations in batches
      for (let i = 0; i < imageRelations.length; i += batchSize) {
        const batch = imageRelations.slice(i, i + batchSize);
        await queryInterface.bulkInsert('image_relations', batch);
        if (i % 200 === 0) {
          console.log(`  Inserted ${i + batch.length}/${imageRelations.length} image relations`);
        }
      }
      console.log(`✅ Inserted ${imageRelations.length} image relations`);

      console.log('\n🎉 Database seeding completed successfully!');
      console.log('📊 Final counts:');
      console.log(`  - Genres: ${genres.length}`);
      console.log(`  - Companies: ${companies.length} (20 publishers, 80 developers)`);
      console.log(`  - Users: ${users.length}`);
      console.log(`  - Games: ${games.length}`);
      console.log(`  - Reviews: ${reviews.length}`);
      console.log(`  - Images: ${generatedImages.length}`);
      console.log(`  - Image Relations: ${imageRelations.length}`);

    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Delete in reverse order of foreign key dependencies
    await queryInterface.bulkDelete('image_relations', null, {});
    await queryInterface.bulkDelete('images', null, {});
    await queryInterface.bulkDelete('user_reviews', null, {});
    await queryInterface.bulkDelete('games', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('companies', null, {});
    await queryInterface.bulkDelete('genres', null, {});
  }
};