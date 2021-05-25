import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';

(async () => {
  const configService = new ConfigService();
  const app = await NestFactory.create(AppModule);

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

  await app.listen(configService.get<number>('APP_PORT') || 3000);
})();
