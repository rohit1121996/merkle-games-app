import request from 'supertest';
import { Response } from 'supertest';
import { Express } from 'express';
import { Sequelize } from 'sequelize';
import { GameAttributes, AuthenticatedUser } from '@/types';

// Import app and database
const app: Express = require('../src/index');
const db: any = require('../src/models');

interface AuthResponse {
  token: string;
  user: AuthenticatedUser;
}

interface GameResponse {
  id: number;
  title: string;
  description?: string;
  genre_id: number;
  platform: string;
  release_date?: Date;
  developer_id?: number;
  publisher_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface GameCreateRequest {
  title: string;
  description?: string;
  genre_id: number;
  platform: string;
  release_date?: Date;
  developer_id?: number;
  publisher_id?: number;
}

interface GameUpdateRequest {
  title?: string;
  description?: string;
  genre_id?: number;
  platform?: string;
  release_date?: Date;
  developer_id?: number;
  publisher_id?: number;
}

describe('Merkle Games API Endpoints', () => {
  let authToken: string;
  let testGame: GameResponse;

  beforeAll(async () => {
    // Wait for database connection
    await db.sequelize.authenticate();

    // Register and login a test user
    const registerRes: Response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    const authResponse: AuthResponse = registerRes.body;
    authToken = authResponse.token;

    // Create a test game
    const gameRes: Response = await request(app)
      .post('/api/v1/games')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Game',
        description: 'A test game',
        genre_id: 1,
        platform: 'PC'
      } as GameCreateRequest);

    testGame = gameRes.body as GameResponse;
  });

  afterAll(async () => {
    // Clean up test data
    if (testGame && testGame.id) {
      await request(app)
        .delete(`/api/v1/games/${testGame.id}`)
        .set('Authorization', `Bearer ${authToken}`);
    }

    // Delete test user
    await db.User.destroy({
      where: { email: 'test@example.com' }
    });

    await db.sequelize.close();
  });

  describe('GET /api/v1/games', () => {
    it('should return a list of games', async () => {
      const response: Response = await request(app)
        .get('/api/v1/games')
        .expect(200);

      expect(response.body).toHaveProperty('games');
      expect(Array.isArray(response.body.games)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('should support pagination', async () => {
      const response: Response = await request(app)
        .get('/api/v1/games?page=1&limit=5')
        .expect(200);

      expect(response.body.games.length).toBeLessThanOrEqual(5);
      expect(response.body.page).toBe(1);
    });
  });

  describe('GET /api/v1/games/:id', () => {
    it('should return a specific game', async () => {
      const response: Response = await request(app)
        .get(`/api/v1/games/${testGame.id}`)
        .expect(200);

      const game: GameResponse = response.body;
      expect(game.id).toBe(testGame.id);
      expect(game.title).toBe('Test Game');
    });

    it('should return 404 for non-existent game', async () => {
      await request(app)
        .get('/api/v1/games/99999')
        .expect(404);
    });
  });

  describe('POST /api/v1/games', () => {
    it('should create a new game when authenticated', async () => {
      const newGame: GameCreateRequest = {
        title: 'New Test Game',
        description: 'Another test game',
        genre_id: 1,
        platform: 'PlayStation 5'
      };

      const response: Response = await request(app)
        .post('/api/v1/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newGame)
        .expect(201);

      const createdGame: GameResponse = response.body;
      expect(createdGame.title).toBe(newGame.title);
      expect(createdGame.description).toBe(newGame.description);

      // Clean up
      await request(app)
        .delete(`/api/v1/games/${createdGame.id}`)
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('should reject creation without authentication', async () => {
      const newGame: GameCreateRequest = {
        title: 'Unauthorized Game',
        genre_id: 1,
        platform: 'PC'
      };

      await request(app)
        .post('/api/v1/games')
        .send(newGame)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const invalidGame = {
        description: 'Missing title and genre'
      };

      await request(app)
        .post('/api/v1/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidGame)
        .expect(400);
    });
  });

  describe('PUT /api/v1/games/:id', () => {
    it('should update an existing game', async () => {
      const updates: GameUpdateRequest = {
        title: 'Updated Test Game',
        platform: 'PC, Xbox'
      };

      const response: Response = await request(app)
        .put(`/api/v1/games/${testGame.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      const updatedGame: GameResponse = response.body;
      expect(updatedGame.title).toBe(updates.title);
      expect(updatedGame.platform).toBe(updates.platform);
    });

    it('should return 404 for non-existent game', async () => {
      await request(app)
        .put('/api/v1/games/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/games/:id', () => {
    it('should delete a game', async () => {
      // Create a game to delete
      const gameToDelete: Response = await request(app)
        .post('/api/v1/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Game to Delete',
          genre_id: 1,
          platform: 'PC'
        } as GameCreateRequest);

      const gameToDeleteData: GameResponse = gameToDelete.body;

      await request(app)
        .delete(`/api/v1/games/${gameToDeleteData.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/v1/games/${gameToDeleteData.id}`)
        .expect(404);
    });
  });
});