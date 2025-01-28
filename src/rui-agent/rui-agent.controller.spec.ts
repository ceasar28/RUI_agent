import { Test, TestingModule } from '@nestjs/testing';
import { RuiAgentController } from './rui-agent.controller';

describe('RuiAgentController', () => {
  let controller: RuiAgentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RuiAgentController],
    }).compile();

    controller = module.get<RuiAgentController>(RuiAgentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
