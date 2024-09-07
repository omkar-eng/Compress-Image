import { Sequelize } from 'sequelize';
import initProcessImageModel from '../models/processImage.model';
import { dbConnection } from '../../config/var';

class PostgresProxy {
  private static instance: PostgresProxy;
  sequelize: Sequelize;

  private constructor() {
    this.sequelize = new Sequelize(dbConnection, {
      host: 'localhost',
      dialect: 'postgres',
      logging: console.log,
    });
  }

  public static getInstance(): PostgresProxy {
    if (!PostgresProxy.instance) {
      PostgresProxy.instance = new PostgresProxy();
    }
    return PostgresProxy.instance;
  }

  public getSequelize(): Sequelize {
    return this.sequelize;
  }

  async sync() {
    await this.sequelize.query('CREATE SCHEMA IF NOT EXISTS "tenant"');
    initProcessImageModel(this.sequelize);
    await this.sequelize.sync({ alter: true });
  }
}

export const postgresProxy = PostgresProxy.getInstance();