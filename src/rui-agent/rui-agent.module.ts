import { Module } from '@nestjs/common';
import { RuiAgentService } from './rui-agent.service';
import { RuiAgentController } from './rui-agent.controller';
import { GoogleSheetModule } from 'src/google-sheet/google-sheet.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FirstWord,
  FirstWordSchema,
  Post,
  PostSchema,
  Topics,
  TopicsSchema,
} from './schemas/post.schema';

@Module({
  imports: [
    GoogleSheetModule,
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Topics.name, schema: TopicsSchema }]),
    MongooseModule.forFeature([
      { name: FirstWord.name, schema: FirstWordSchema },
    ]),
  ],
  providers: [RuiAgentService],
  controllers: [RuiAgentController],
})
export class RuiAgentModule {}
