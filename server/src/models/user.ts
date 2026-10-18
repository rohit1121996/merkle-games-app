import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';
import { UserAttributes } from '@/types';

export interface UserInstance extends Model<UserAttributes>, UserAttributes {
  associate?: (models: any) => void;
}

export interface UserModelType extends ModelStatic<UserInstance> {
  associate: (models: any) => void;
}

export const UserModel = (sequelize: Sequelize, dataTypes: typeof DataTypes): UserModelType => {
  const User = sequelize.define<UserInstance>('User', {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: dataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: dataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    registration_date: {
      type: dataTypes.DATE,
      allowNull: false,
      defaultValue: dataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  (User as UserModelType).associate = function(models: any) {
    User.hasMany(models.UserReview, {
      foreignKey: 'user_id',
      as: 'reviews'
    });
  };

  return User as UserModelType;
};