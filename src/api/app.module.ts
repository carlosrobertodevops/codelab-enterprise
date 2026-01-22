import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './infra/prisma/prisma.module';
import { RedisModule } from './infra/redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { CoursesModule } from './modules/courses/courses.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 300, // baseline; tune per route with decorators if needed
      },
    ]),
    PrismaModule,
    RedisModule,
    HealthModule,
    CoursesModule,
  ],
})
export class AppModule {}
