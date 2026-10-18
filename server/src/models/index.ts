import { Sequelize, DataTypes } from 'sequelize';
import config from '../config/database';
import { GenreModel, GenreModelType } from './genre';
import { CompanyModel, CompanyModelType } from './company';
import { GameModel, GameModelType } from './game';
import { UserModel, UserModelType } from './user';
import { UserReviewModel, UserReviewModelType } from './userReview';
import { ImageModel, ImageModelType } from './image';
import { ImageRelationModel, ImageRelationModelType } from './imageRelation';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database!,
  dbConfig.username!,
  dbConfig.password!,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    storage: dbConfig.storage, // CRITICAL: Include storage for SQLite
    logging: dbConfig.logging,
    define: dbConfig.define
  }
);

// Initialize models
const Genre = GenreModel(sequelize, DataTypes);
const Company = CompanyModel(sequelize, DataTypes);
const Game = GameModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const UserReview = UserReviewModel(sequelize, DataTypes);
const Image = ImageModel(sequelize, DataTypes);
const ImageRelation = ImageRelationModel(sequelize, DataTypes);

const db = {
  Sequelize,
  sequelize,
  Genre,
  Company,
  Game,
  User,
  UserReview,
  Image,
  ImageRelation,
};

// Set up associations
// Call associate on each model directly
if (Genre.associate) Genre.associate(db);
if (Company.associate) Company.associate(db);
if (Game.associate) Game.associate(db);
if (User.associate) User.associate(db);
if (UserReview.associate) UserReview.associate(db);
if (Image.associate) Image.associate(db);
if (ImageRelation.associate) ImageRelation.associate(db);

// Export models individually for destructuring
export { Genre, Company, Game, User, UserReview, Image, ImageRelation, sequelize };

// Export default for legacy compatibility
export default db;