import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { sequelize } from '../sequelize';

export type RevokedTokenType = 'access' | 'refresh';

/**
 * Modelo Sequelize para tokens revocados.
 */
export class RevokedTokenModel extends Model<
  InferAttributes<RevokedTokenModel>,
  InferCreationAttributes<RevokedTokenModel>
> {
  declare jti: string;
  declare tokenType: RevokedTokenType;
  declare expiresAt: Date;
  declare createdAt: CreationOptional<Date>;
}

RevokedTokenModel.init(
  {
    jti: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true,
    },
    tokenType: {
      type: DataTypes.ENUM('access', 'refresh'),
      allowNull: false,
      field: 'token_type',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'revoked_tokens',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);
