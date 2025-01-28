import { Controller, Get } from '@nestjs/common';
import { RuiAgentService } from './rui-agent.service';
import { GoogleSheetService } from 'src/google-sheet/google-sheet.service';

@Controller('rui-agent')
export class RuiAgentController {
  constructor(
    private readonly ruiAgentService: RuiAgentService,
    private readonly googleSheetService: GoogleSheetService,
  ) {}

  @Get()
  getData() {
    return this.ruiAgentService.ruiAgentPost();
  }

  // @Get('posts')
  // getPosts() {
  //   return this.googleSheetService.writeToSheet();
  // }
}
