import { sequelize } from './sequelize';
import '../database/models/UserModel';

export const migrate = async (): Promise<void> => {
  await sequelize.sync();
};
