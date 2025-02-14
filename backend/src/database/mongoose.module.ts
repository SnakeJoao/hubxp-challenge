import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URL || 'mongodb://root:root@localhost:27017/hubxp',
      {
        authSource: 'admin',
      },
    ),
  ],
})
export class DatabaseModule {}
