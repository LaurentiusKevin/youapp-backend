import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot(process.env.HOST_MONGODB!)],
  exports: [MongooseModule],
})
export class DatabaseModule {}
