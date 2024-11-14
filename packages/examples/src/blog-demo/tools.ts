import OpenAI from 'openai';
import { Tool } from '@nodejs-orchestration/tools';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const researchTopic: Tool = {
  id: 'research-topic',
  name: 'Research Topic',
  description: 'Generate research report',
  execute: async (params) => {
    const query = params.query as string;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Conduct research on the following topic and provide a detailed report.'
        },
        {
          role: 'user',
          content: query
        }
      ]
    });
    return { report: response.choices[0].message.content };
  },
  schema: {
    input: { query: 'string' },
    output: { report: 'string' }
  }
};

export const generateBlogContent: Tool = {
  id: 'generate-blog-content',
  name: 'Generate Blog Content',
  description: 'Generate technical blog content based on research report',
  execute: async (params) => {
    const researchData = params.researchData as string;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Create compelling technical blog content based on the following research report.'
        },
        {
          role: 'user',
          content: researchData
        }
      ]
    });
    return { content: response.choices[0].message.content };
  },
  schema: {
    input: { researchData: 'string' },
    output: { content: 'string' }
  }
}; 