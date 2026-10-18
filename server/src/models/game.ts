import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';
import { GameAttributes } from '@/types';

export interface GameInstance extends Model<GameAttributes>, GameAttributes {
  associate?: (models: any) => void;
}

export interface GameModelType extends ModelStatic<GameInstance> {
  associate: (models: any) => void;
}

export const GameModel = (sequelize: Sequelize, dataTypes: typeof DataTypes): GameModelType => {
  const Game = sequelize.define<GameInstance>('Game', {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: dataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: dataTypes.TEXT,
      allowNull: true
    },
    genre_id: {
      type: dataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'genres',
        key: 'id'
      }
    },
    platform: {
      type: dataTypes.STRING(100),
      allowNull: true
    },
    release_date: {
      type: dataTypes.STRING, // SQLite stores dates as strings
      allowNull: true
    },
    developer_id: {
      type: dataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    publisher_id: {
      type: dataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      }
    }
  }, {
    tableName: 'games',
    timestamps: true,
    underscored: true
  });

  (Game as GameModelType).associate = function(models: any) {
    Game.belongsTo(models.Genre, {
      foreignKey: 'genre_id',
      as: 'genre'
    });
    Game.belongsTo(models.Company, {
      foreignKey: 'developer_id',
      as: 'developer'
    });
    Game.belongsTo(models.Company, {
      foreignKey: 'publisher_id',
      as: 'publisher'
    });
    Game.hasMany(models.UserReview, {
      foreignKey: 'game_id',
      as: 'reviews'
    });
    Game.belongsToMany(models.Image, {
      through: models.ImageRelation,
      foreignKey: 'related_id',
      otherKey: 'image_id',
      as: 'images',
      constraints: false,
      scope: {
        related_type: 'Game'
      }
    });
  };

  return Game as GameModelType;
};