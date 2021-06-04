import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';
import { ValidationPipe } from './@core/pipes/validation.pipe';

(async () => {
  const configService = new ConfigService();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
    cors: true,
  });

  //is used for transform pipes message
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
    }),
  );

  //is used for allow custom pipes attribute
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(helmet());
  app.use(rateLimit({ windowMs: 60 * 1000, max: 1000 }));

  await app.listen(configService.get<number>('APP_PORT') || 3000);
})();
