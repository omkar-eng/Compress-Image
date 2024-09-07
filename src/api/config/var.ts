import dotenv from 'dotenv';

dotenv.config();

export const env = process.env.NODE_ENV;
export const dbConnection = process.env.DATADB_CONNECTIONSTRING as string;
export const redisUrl = process.env.REDIS_URL as string;
export const port = process.env.PORT;