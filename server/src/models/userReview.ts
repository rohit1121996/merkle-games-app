import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';
import { UserReviewAttributes } from '@/types';

export interface UserReviewInstance extends Model<UserReviewAttributes>, UserReviewAttributes {
  associate?: (models: any) => void;
}

export interface UserReviewModelType extends ModelStatic<UserReviewInstance> {
  associate: (models: any) => void;
}

export const UserReviewModel = (sequelize: Sequelize, dataTypes: typeof DataTypes): UserReviewModelType => {
  const UserReview = sequelize.define<UserReviewInstance>('UserReview', {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    game_id: {
      type: dataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    user_id: {
      type: dataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    rating: {
      type: dataTypes.REAL,
      allowNull: false,
      field: 'rating_score',
      validate: {
        min: 0,
        max: 10
      }
    },
    review_text: {
      type: dataTypes.TEXT,
      allowNull: true
    },
    review_date: {
      type: dataTypes.DATE,
      allowNull: false,
      defaultValue: dataTypes.NOW
    }
  }, {
    tableName: 'user_reviews',
    timestamps: true,
    underscored: true
  });

  (UserReview as UserReviewModelType).associate = function(models: any) {
    UserReview.belongsTo(models.Game, {
      foreignKey: 'game_id',
      as: 'game'
    });
    UserReview.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return UserReview as UserReviewModelType;
};