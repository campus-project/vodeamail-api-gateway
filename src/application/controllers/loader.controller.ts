import { Controller, Get } from '@nestjs/common';
import { Public } from '../../@core/decorators/is-public.decorator';

@Controller()
export class LoaderController {
  @Public()
  @Get('loaderio-5f6a5bed467e7d14aa3ebc295f7589eb')
  loaderTest() {
    return 'loaderio-5f6a5bed467e7d14aa3ebc295f7589eb';
  }
}
