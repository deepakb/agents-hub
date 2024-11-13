import OpenAI from 'openai';
import { Tool } from '@nodejs-orchestration/tools';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const sentimentAnalysisTool: Tool = {
  id: 'sentiment-analysis',
  name: 'Sentiment Analysis',
  description: 'Analyzes the sentiment of customer inquiries',
  execute: async (params) => {
    const inquiry = params.inquiry as string;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the following customer inquiry. Return JSON with fields: sentiment (positive/negative/neutral), intensity (1-10)'
        },
        {
          role: 'user',
          content: inquiry
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  },
  schema: {
    input: { inquiry: 'string' },
    output: { sentiment: 'string', intensity: 'number' }
  }
};

export const issueCategorizer: Tool = {
  id: 'issue-categorizer',
  name: 'Issue Categorizer',
  description: 'Categorizes customer issues',
  execute: async (params) => {
    const inquiry = params.inquiry as string;
    const sentiment = params.previousResults['analyze-inquiry'];
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Categorize the following customer inquiry. Return JSON with fields: category (billing/technical/account/other), urgency (high/medium/low)'
        },
        {
          role: 'user',
          content: `Inquiry: ${inquiry}\nSentiment Analysis: ${JSON.stringify(sentiment)}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  },
  schema: {
    input: { inquiry: 'string' },
    output: { category: 'string', urgency: 'string' }
  }
};

export const responseGenerator: Tool = {
  id: 'response-generator',
  name: 'Response Generator',
  description: 'Generates appropriate responses to customer inquiries',
  execute: async (params) => {
    const inquiry = params.inquiry as string;
    const sentiment = params.previousResults['analyze-inquiry'];
    const category = params.previousResults['categorize-issue'];
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Generate a professional and empathetic response to the customer inquiry. Return JSON with fields: response (string), followUpNeeded (boolean)'
        },
        {
          role: 'user',
          content: `Inquiry: ${inquiry}\nAnalysis: ${JSON.stringify({sentiment, category})}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  },
  schema: {
    input: { inquiry: 'string' },
    output: { response: 'string', followUpNeeded: 'boolean' }
  }
};

export const escalationHandler: Tool = {
  id: 'escalation-handler',
  name: 'Escalation Handler',
  description: 'Handles escalation to human agents',
  execute: async (params) => {
    return {
      escalated: true,
      message: 'This inquiry has been escalated to a human agent who will contact you shortly.',
      ticketId: `TICKET-${Date.now()}`
    };
  },
  schema: {
    input: { inquiry: 'string' },
    output: { escalated: 'boolean', message: 'string', ticketId: 'string' }
  }
}; 