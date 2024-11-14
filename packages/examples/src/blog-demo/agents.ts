import { SpecializedAgent } from './specialized-agent';
import { Logger } from '@agent-forge/logger';
import { researchTopic, generateBlogContent } from './tools';

const logger = new Logger({
  level: 'info',
  destinations: [{ type: 'console' }]
});

export const researcherAgent = new SpecializedAgent(
  'researcher-agent',
  'Researcher Agent',
  'You are a researcher agent specialized in researching. If you are satisfied with the research, handoff the report to blogger.',
  [researchTopic],
  logger
);

export const bloggerAgent = new SpecializedAgent(
  'blogger-agent',
  'Blogger Agent',
  'You are a top technical blogger agent specialized in creating compelling technical content for blogs based on research report. Be concise.',
  [generateBlogContent],
  logger
); 