import { researcherAgent, bloggerAgent } from './agents';

async function runBlogDemo() {
  console.log('Starting Blog Demo...');
  
  // Simulate a research task
  const researchResult = await researcherAgent.getTools()[0].execute({ query: 'Top 5 technical skills to learn in 2025' });
  console.log('Research Result:', researchResult);

  // Simulate generating blog content
  const blogContent = await bloggerAgent.getTools()[0].execute({ researchData: researchResult.report });
  console.log('Blog Content:', blogContent);
}

if (require.main === module) {
  runBlogDemo().catch(console.error);
} 