import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type PostDocument = mongoose.HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop()
  post: string;
  @Prop()
  prompt: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type TopicsDocument = mongoose.HydratedDocument<Topics>;

@Schema()
export class Topics {
  @Prop()
  topics: string[];
  @Prop()
  usedTopics: string[];
}

export const TopicsSchema = SchemaFactory.createForClass(Topics);

export type FirstWordDocument = mongoose.HydratedDocument<FirstWord>;

@Schema()
export class FirstWord {
  @Prop()
  words: string[];
}

export const FirstWordSchema = SchemaFactory.createForClass(FirstWord);
