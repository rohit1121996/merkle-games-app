import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';
import { CompanyAttributes } from '@/types';

export interface CompanyInstance extends Model<CompanyAttributes>, CompanyAttributes {
  associate?: (models: any) => void;
}

export interface CompanyModelType extends ModelStatic<CompanyInstance> {
  associate: (models: any) => void;
}

export const CompanyModel = (sequelize: Sequelize, dataTypes: typeof DataTypes): CompanyModelType => {
  const Company = sequelize.define<CompanyInstance>('Company', {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: dataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    country: {
      type: dataTypes.STRING(50),
      allowNull: true
    },
    founded_year: {
      type: dataTypes.INTEGER,
      allowNull: true
    },
    logo: {
      type: dataTypes.STRING(255),
      allowNull: true
    },
    company_type: {
      type: dataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['Developer', 'Publisher']]
      }
    }
  }, {
    tableName: 'companies',
    timestamps: true,
    underscored: true
  });

  (Company as CompanyModelType).associate = function(models: any) {
    Company.hasMany(models.Game, {
      foreignKey: 'developer_id',
      as: 'developedGames'
    });
    Company.hasMany(models.Game, {
      foreignKey: 'publisher_id',
      as: 'publishedGames'
    });
  };

  return Company as CompanyModelType;
};