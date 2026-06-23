import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsStore } from './jobs.store';
import { JobProcessorService } from './job-processor.service';
import { httpUrlChecker, realDelayer } from './http-url-checker';

@Module({
  controllers: [JobsController],
  providers: [
    JobsStore,
    JobsService,
    {
      // Собираем процессор с реальными зависимостями (сеть + задержка)
      provide: JobProcessorService,
      useFactory: (store: JobsStore) =>
        new JobProcessorService(store, httpUrlChecker, realDelayer),
      inject: [JobsStore],
    },
  ],
})
export class JobsModule {}
