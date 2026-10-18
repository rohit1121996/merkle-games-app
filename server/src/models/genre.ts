import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';
import { GenreAttributes } from '@/types';

export interface GenreInstance extends Model<GenreAttributes>, GenreAttributes {
  associate?: (models: any) => void;
}

export interface GenreModelType extends ModelStatic<GenreInstance> {
  associate: (models: any) => void;
}

export const GenreModel = (sequelize: Sequelize, dataTypes: typeof DataTypes): GenreModelType => {
  const Genre = sequelize.define<GenreInstance>('Genre', {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: dataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'genre_name'
    }
  }, {
    tableName: 'genres',
    timestamps: true,
    underscored: true
  });

  (Genre as GenreModelType).associate = function(models: any) {
    Genre.hasMany(models.Game, {
      foreignKey: 'genre_id',
      as: 'games'
    });
  };

  return Genre as GenreModelType;
};