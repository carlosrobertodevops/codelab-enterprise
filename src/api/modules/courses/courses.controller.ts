import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';

@ApiTags('courses')
@Controller('api/courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  @ApiOkResponse({ description: 'List public courses (paginated)' })
  list(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.courses.list({
      search: search?.trim(),
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    });
  }

  @Get(':slug')
  @ApiOkResponse({ description: 'Get course by slug (public details)' })
  bySlug(@Param('slug') slug: string) {
    return this.courses.bySlug(slug);
  }
}
