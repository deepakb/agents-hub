import { researcherAgent, bloggerAgent } from './agents';
import { Tool } from '@agent-forge/tools';

interface ResearchResult {
  report: string;
}

interface BlogResult {
  content: string;
}

async function runBlogDemo() {
  console.log('Starting Blog Demo...');
  
  // Simulate a research task
  const researchResult = await researcherAgent.getTools()[0].execute({ 
    query: 'Top 5 technical skills to learn in 2025' 
  }) as ResearchResult;
  
  console.log('Research Result:', researchResult);

  // Simulate generating blog content
  const blogContent = await bloggerAgent.getTools()[0].execute({ 
    researchData: researchResult.report 
  }) as BlogResult;
  
  console.log('Blog Content:', blogContent);
}

if (require.main === module) {
  runBlogDemo().catch(console.error);
} 