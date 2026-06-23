import { ArrayNotEmpty, IsArray, IsUrl } from 'class-validator';
import type { CreateJobRequest } from '@url-checker/shared';

// Тело POST /api/jobs: непустой массив валидных URL
export class CreateJobDto implements CreateJobRequest {
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({ require_protocol: true }, { each: true })
  urls!: string[];
}
