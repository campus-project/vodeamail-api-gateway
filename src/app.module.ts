import { Module } from '@nestjs/common';
import { ApplicationModule } from './application/application.module';
import { TestService } from './test/test.service';

@Module({
  imports: [ApplicationModule],
  providers: [TestService],
})
export class AppModule {}
