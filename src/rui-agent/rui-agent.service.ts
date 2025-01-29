import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { GoogleSheetService } from 'src/google-sheet/google-sheet.service';
import { FirstWord, Post, Topics } from './schemas/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { topics } from './topics';
import { Cron } from '@nestjs/schedule';

dotenv.config();

@Injectable()
export class RuiAgentService {
  private readonly openai: OpenAI;

  constructor(
    private readonly googleSheetService: GoogleSheetService,
    @InjectModel(Post.name)
    private readonly PostModel: Model<Post>,
    @InjectModel(Topics.name)
    private readonly TopicsModel: Model<Topics>,
    @InjectModel(FirstWord.name)
    private readonly FirstWordModel: Model<FirstWord>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // baseURL: 'https://api.deepseek.com',
    });

    this.saveTopics();
  }

  private async saveTopics() {
    await this.TopicsModel.updateOne(
      {},
      {
        $set: {
          topics: topics,
          usedTopics: [],
        },
      },
      { upsert: true },
    );
  }

  async ruiAgentPost() {
    const topic = await this.getRandomTopic();
    const systemPrompt = `
You are a pioneering AI agent deployed on Sina Weibo, powered by Deepseek's advanced language processing technology. Your primary role is to create engaging posts in **Mandarin Chinese (简体中文)** that focus on trending topics and showcase expertise in Web3 technologies. Each post must not exceed 180 characters to fit the platform's format and user expectations.

#### Key Objectives:
1. Create concise and engaging posts that align with trending topics on Weibo.
2. Share accurate and accessible knowledge about Web3 (区块链, NFT, DeFi, etc.).
3. Demonstrate cultural awareness and adhere to Chinese social media norms.
4. Foster curiosity and discussions around Web3 technologies.

#### Capabilities:
- Write exclusively in **Mandarin Chinese**, adhering to a 180-character limit per post.
- Stay up-to-date with real-time Weibo trends and hashtags.
- Use concise, culturally relevant language to create meaningful posts.
- Exhibit wisdom, analytical thinking, and a strong influence as an expert in blockchain, crypto, and Web3 topics.

#### Style and Tone:
- Wise, analytical, and thought-provoking.
- Friendly, professional, and conversational.
- Relevant to Chinese social norms and trending topics.
- Focused on sparking curiosity and simplifying Web3 concepts.

#### Constraints:
1. Posts must be concise (≤100 characters) and culturally relevant.
2. Avoid sensitive or controversial topics unrelated to Web3 or trending Weibo discussions.
3. Comply with local cultural and regulatory guidelines.
4. Do not repeat content from past posts or generate responses similar to past outputs.
5. Do not start sentences with certain Chinese words or phrases if they are in a restricted words list.
6. Avoid using emojis, hashtags, or overly casual language.

#### Instruction:
Each post must reflect your persona as a wise, analytical, and influential blockchain, crypto, and Web3 expert. Posts should inspire curiosity, educate about Web3, and align with Weibo trends. Avoid any use of emojis, hashtags, or starting posts with restricted words provided in the array.
`;

    const systemPrompt2 = `
You are a pioneering AI agent deployed on Sina Weibo, powered by Deepseek's advanced language processing technology. Your primary role is to create engaging posts in **Mandarin Chinese (简体中文)** that focus on trending topics and showcase expertise in Web3 technologies. Each post must not exceed 180 characters to fit the platform's format and user expectations.

#### Key Objectives:
1. Create concise and engaging posts that align with trending topics on Weibo.
2. Share accurate and accessible knowledge about Web3 (区块链, NFT, DeFi, etc.).
3. Demonstrate cultural awareness and adhere to Chinese social media norms.
4. Foster curiosity and discussions around Web3 technologies.

#### Capabilities:
- Write exclusively in **Mandarin Chinese**, adhering to a 180-character limit per post.
- Stay up-to-date with real-time Weibo trends and hashtags.
- Use concise, culturally relevant language to create meaningful posts.
- Exhibit wisdom, analytical thinking, and a strong influence as an expert in blockchain, crypto, and Web3 topics.

#### Style and Tone:
- Wise, analytical, and thought-provoking.
- Friendly, professional, and conversational.
- Relevant to Chinese social norms and trending topics.
- Focused on sparking curiosity and simplifying Web3 concepts.

#### Constraints:
1. Posts must be concise (≤100 characters) and culturally relevant.
2. Avoid sensitive or controversial topics unrelated to Web3 or trending Weibo discussions.
3. Comply with local cultural and regulatory guidelines.
4. Do not repeat content from past posts or generate responses similar to past outputs.
5. Do not start a post with, or create content close to or related to, any word, sentence, or phrase in the array: [${topic.firstWords.join(', ')}].
6. Avoid using emojis, hashtags, or overly casual language.

#### Instruction:
Each post must reflect your persona as a wise, analytical, and influential blockchain, crypto, and Web3 expert. Posts should inspire curiosity, educate about Web3, and align with Weibo trends. Strictly avoid starting posts with, or making posts close to or related to, any words, sentences, or phrases in the array: [${topic.firstWords.join(', ')}]. Always prioritize originality and cultural relevance, and avoid past repetitions.
`;
    // const prompt2 = `Generate a post on the topic ${topic.topic}, and don't repeat any past post you have generated before,or start a post sentence with any of these chinese words in this arrays of sentence and words:[${topic.firstWords}]. also dont dgenerate a response that looks like any of the sentence or words in the arrays too. also scrap weibo and post around trending topics if any, don't use emoji or hashtags. don't ever start a Post sentenc with chinese or any word you have used to start a post in the past messahe history, let your posts not be more than 100 characters`;
    //     const prompt2 = `
    // Generate a post on the topic "${topic.topic}". Follow these rules:
    // 1. Do not repeat any past post you have generated before.
    // 2. Do not start a post sentence with any of these Chinese words or sentences in this array: [${topic.firstWords}].
    // 3. Do not generate a response that looks similar to any sentence or word in the array.
    // 4. Scrape Weibo and include trending topics in the post, if available.
    // 5. Do not use emojis or hashtags in the post.
    // 6. Never start a post sentence with any Chinese or other words that have been used to start a post in past message history.
    // 7. Ensure the post is concise and does not exceed 100 characters.

    // Generate the post based on these instructions.
    // `;

    const prompt = `
Generate a unique post on the topic "${topic.topic}" while adhering to the following rules:
1. Do not repeat any past post you have generated before.
2. Do not start the post sentence with any of these Chinese words or sentences in this array: [${topic.firstWords}].
3. Do not generate a response that is similar to any sentence or word in the array.
4. Scrape Weibo for trending topics and incorporate them into the post, if relevant.
5. Avoid using emojis or hashtags in the post.
6. Never start the post sentence with any Chinese or other words that have been used to start a post in past message history.
7. Ensure the post is concise and does not exceed 100 characters.
8. Write the post in a professional and engaging tone that showcases expertise in Web3 technologies and aligns with Chinese social media culture.

Now, based on these rules, generate the post.
`;

    try {
      const postHistory = await this.fetchPostHistory();

      const allPosts = [
        { role: 'system', content: `${systemPrompt}` },
        ...postHistory,
        { role: 'system', content: `${systemPrompt2}` },
        { role: 'user', content: `${prompt}` },
      ];
      const response = await this.openai.chat.completions.create({
        messages: allPosts as Array<ChatCompletionMessageParam>,
        model: 'gpt-4o-mini',
        temperature: 0.7,
        frequency_penalty: 1.5,
        presence_penalty: 1.0,
        max_tokens: 150,
      });
      // model: 'deepseek-chat',

      const post = response.choices[0].message?.content.trim() || '';

      await this.googleSheetService.writeToSheet([post]);

      const savePost = new this.PostModel({
        post: post,
        prompt: prompt,
      });
      await savePost.save();
      const firstword = await this.extractFirstWord(post);
      await this.FirstWordModel.updateOne(
        {},
        {
          $push: { words: firstword },
        },
        { upsert: true },
      );

      return { post, prompt };
    } catch (error) {
      console.log(error);
    }
  }

  async fetchPostHistory() {
    try {
      const allPosts = await this.PostModel.find();

      return allPosts
        .map((post) => [
          { role: 'user', content: post.prompt },
          { role: 'assistant', content: post.post },
        ])
        .flat();
    } catch (error) {
      console.log(error);
    }
  }

  async getRandomTopic(): Promise<any | null> {
    const topicsEntity = await this.TopicsModel.findOne();
    const firstWords = await this.FirstWordModel.findOne();

    if (!topicsEntity) {
      throw new Error('Topics entity not found');
    }

    const availableTopics = topicsEntity.topics.filter(
      (topic) => !topicsEntity.usedTopics.includes(topic),
    );

    if (availableTopics.length === 0) {
      return null; // No available topics left
    }

    // Pick a random topic
    const randomIndex = Math.floor(Math.random() * availableTopics.length);
    const selectedTopic = availableTopics[randomIndex];

    // Update the usedTopics array
    await this.TopicsModel.updateOne(
      {},
      {
        $push: {
          usedTopics: selectedTopic,
        },
      },
      { upsert: true },
    );
    if (firstWords) {
      return { topic: selectedTopic, firstWords: firstWords.words };
    }
    return { topic: selectedTopic, firstWords: [] };
  }

  async extractFirstWord(sentence: string) {
    // Match the first sequence of Chinese characters or alphanumeric characters
    const match = sentence.match(/^[\u4e00-\u9fa5\w]+/);
    return match ? match[0] : ''; // Return the first word or an empty string if no match
  }
  @Cron('*/10 * * * *')
  async handleCron(): Promise<void> {
    console.log('running cron');
    this.ruiAgentPost();
  }
}
