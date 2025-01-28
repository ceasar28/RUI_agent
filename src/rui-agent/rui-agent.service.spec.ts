import { Test, TestingModule } from '@nestjs/testing';
import { RuiAgentService } from './rui-agent.service';

describe('RuiAgentService', () => {
  let service: RuiAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuiAgentService],
    }).compile();

    service = module.get<RuiAgentService>(RuiAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
