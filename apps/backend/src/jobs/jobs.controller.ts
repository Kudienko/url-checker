import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import type { CreateJobResponse, Job, JobSummary } from '@url-checker/shared';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Post()
  create(@Body() dto: CreateJobDto): CreateJobResponse {
    return this.jobs.create(dto.urls);
  }

  @Get()
  list(): JobSummary[] {
    return this.jobs.listSummaries();
  }

  @Get(':id')
  getOne(@Param('id') id: string): Job {
    const job = this.jobs.getJob(id);
    if (!job) throw new NotFoundException(`Job ${id} not found`);
    return job;
  }

  @Delete(':id')
  @HttpCode(200)
  cancel(@Param('id') id: string): { ok: boolean } {
    const ok = this.jobs.cancel(id);
    if (!ok) throw new NotFoundException(`Job ${id} not found`);
    return { ok };
  }
}
