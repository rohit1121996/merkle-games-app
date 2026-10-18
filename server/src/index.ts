import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import db from './models';
import routes from './routes';
import mediaRoutes from './routes/mediaRoutes';
import unstableModeRoutes from './routes/unstableModeRoutes';
import { createUnstableMiddleware, getConfig } from './middleware/unstableMode';
import { typeDefs, resolvers } from './graphql';
import { colorize, createBox } from './utils/colors';

const app: express.Application = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static('public'));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Game API',
      version: '1.0.0',
      description: 'A comprehensive API for managing video game database',
    },
    servers: [
      {
        url: `http://localhost:${PORT}${process.env.API_PREFIX || '/api'}/${process.env.API_VERSION || 'v1'}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GraphQL Sandbox route
app.get('/graphql-sandbox', (req: Request, res: Response) => {
  res.sendFile('graphql-sandbox.html', { root: 'public' });
});

// Unstable mode toggle endpoints (mounted BEFORE the unstable middleware so they're never dropped)
app.use('/admin', unstableModeRoutes);

// Media routes (deterministic pattern generator)
app.use('/media', createUnstableMiddleware('media'), mediaRoutes);

// API Routes
app.use(`${process.env.API_PREFIX || '/api'}/${process.env.API_VERSION || 'v1'}`, createUnstableMiddleware('api'), routes);

// Error handling middleware
interface AppError extends Error {
  status?: number;
}

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Function to start server
async function startServer(): Promise<void> {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database models (in production, use migrations)
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync({ alter: false, force: false });
      console.log(colorize.success('🗄️  Database models synchronized successfully!'));
    }


    // Create HTTP server
    const httpServer = http.createServer(app);

    // Create Apollo Server with v4 configuration
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    // Start Apollo Server
    await apolloServer.start();

    // Apply GraphQL middleware
    const graphqlPath = process.env.GRAPHQL_PATH || '/graphql';
    app.use(
      graphqlPath,
      cors<cors.CorsRequest>(),
      express.json(),
      createUnstableMiddleware('api'),
      expressMiddleware(apolloServer, {
        context: async () => ({
          db
        }),
      }) as any
    );

    // Start HTTP server
    await new Promise<void>(resolve => httpServer.listen(PORT, resolve));

    // Colorful startup messages
    console.log('');
    console.log(colorize.rainbow('🎮 ================================= 🎮'));
    console.log(colorize.server('🚀 GAME API SERVER STARTED SUCCESSFULLY! 🚀'));
    console.log(colorize.rainbow('🎮 ================================= 🎮'));
    console.log('');

    const serverInfo = [
      `${colorize.bold('🌐 Server:')} Running on port ${colorize.port(PORT.toString())}`,
      '',
      `${colorize.bold('📚 Available Endpoints:')}`,
      `  🔗 REST API: ${colorize.url(`http://localhost:${PORT}${process.env.API_PREFIX || '/api'}/${process.env.API_VERSION || 'v1'}`)}`,
      `  ⚡ GraphQL: ${colorize.url(`http://localhost:${PORT}${process.env.GRAPHQL_PATH || '/graphql'}`)}`,
      `  🛠️  Sandbox: ${colorize.url(`http://localhost:${PORT}/graphql-sandbox`)}`,
      `  📖 API Docs: ${colorize.url(`http://localhost:${PORT}/api-docs`)}`,
      `  🎨 Media:   ${colorize.url(`http://localhost:${PORT}/media/example-seed?w=400`)}`,
      '',
      `${colorize.success('✅ All systems operational!')}`
    ];

    console.log(createBox(serverInfo, '🎮 GAME API'));
    console.log('');

    const unstableConfig = getConfig();
    const portStr = PORT.toString();
    console.log(colorize.bold('🧪 UNSTABLE MODE (frontend resilience testing):'));
    if (unstableConfig.enabled) {
      console.log(
        colorize.warning(
          `   Currently ON — errorRate=${unstableConfig.errorRate}, failureModes=[${unstableConfig.failureModes.join(', ')}], endpoints=${unstableConfig.endpoints}`
        )
      );
    } else {
      console.log(colorize.dim('   Currently OFF — flip on hard mode and find out if your frontend is bulletproof:'));
    }
    console.log(`   ${colorize.info('on:    ')}${colorize.url(`curl http://localhost:${portStr}/admin/unstable-mode-on`)}`);
    console.log(`   ${colorize.info('tune:  ')}${colorize.url(`curl 'http://localhost:${portStr}/admin/unstable-mode-on?errorRate=0.3&failureModes=error500,hang'`)}`);
    console.log(`   ${colorize.info('scope: ')}${colorize.url(`curl 'http://localhost:${portStr}/admin/unstable-mode-on?endpoints=images-only'`)}`);
    console.log(`   ${colorize.info('off:   ')}${colorize.url(`curl http://localhost:${portStr}/admin/unstable-mode-off`)}`);
    console.log(`   ${colorize.info('status:')}${colorize.url(`curl http://localhost:${portStr}/admin/unstable-mode`)}`);
    console.log('');
  } catch (error) {
    console.log('');
    console.log(colorize.error('❌ ================================== ❌'));
    console.log(colorize.error('💥 FAILED TO START GAME API SERVER! 💥'));
    console.log(colorize.error('❌ ================================== ❌'));
    console.log('');
    console.error(colorize.error(`🚨 Error: ${(error as Error).message}`));
    console.log('');
    process.exit(1);
  }
}

// Start the server (skip when imported in test environment)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;