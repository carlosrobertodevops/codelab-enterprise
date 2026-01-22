import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';

type ListArgs = { search?: string; page: number; limit: number };

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async list({ search, page, limit }: ListArgs) {
    const safePage = Math.max(1, page || 1);
    const safeLimit = Math.min(50, Math.max(1, limit || 12));

    const cacheKey = `courses:list:${search || ''}:${safePage}:${safeLimit}`;
    const cached = await this.redis.client.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, items] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          imageUrl: true,
          status: true,
          level: true,
          createdAt: true,
        },
      }),
    ]);

    const result = { page: safePage, limit: safeLimit, total, items };
    await this.redis.client.set(cacheKey, JSON.stringify(result), 'EX', 60);
    return result;
  }

  async bySlug(slug: string) {
    const cacheKey = `courses:slug:${slug}`;
    const cached = await this.redis.client.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        tags: true,
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: { orderBy: { position: 'asc' } },
          },
        },
      },
    });

    if (!course) throw new NotFoundException('Course not found');

    await this.redis.client.set(cacheKey, JSON.stringify(course), 'EX', 120);
    return course;
  }
}
