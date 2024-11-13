import { WorkflowEngine, customerServiceWorkflow } from '@nodejs-orchestration/workflow';
import { ToolRegistry } from '@nodejs-orchestration/tools';
import { RetryManager } from '@nodejs-orchestration/error-handler';
import { Logger } from '@nodejs-orchestration/logger';
import { sentimentAnalysisTool, issueCategorizer, responseGenerator, escalationHandler } from './tools/openai-tools';

const logger = new Logger({
  level: 'info',
  destinations: [{ type: 'console' }],
  redactKeys: ['apiKey']
});

async function runDemo() {
  const toolRegistry = new ToolRegistry();
  const retryManager = new RetryManager({
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000
  }); 

  toolRegistry.registerTool(sentimentAnalysisTool);
  toolRegistry.registerTool(issueCategorizer);
  toolRegistry.registerTool(responseGenerator);
  toolRegistry.registerTool(escalationHandler);

  const workflowEngine = new WorkflowEngine(toolRegistry, retryManager, logger);

  const inquiries = [
    "I've been charged twice for my subscription this month. This is unacceptable!",
    "How do I reset my password? I've been trying for hours.",
    "I love your product! Just wanted to say thank you for the great service."
  ];

  for (const inquiry of inquiries) {
    console.log('\n-----------------------------------');
    console.log('Processing inquiry:', inquiry);
    console.log('-----------------------------------\n');

    try {
      const results = await workflowEngine.executeWorkflow(customerServiceWorkflow, {
        inquiry
      });

      console.log('Workflow Results:');
      console.log('Sentiment Analysis:', results['analyze-inquiry']);
      console.log('Issue Category:', results['categorize-issue']);
      console.log('Generated Response:', results['generate-response']);
    } catch (error) {
      console.error('Workflow failed:', error);
    }
  }
}

if (require.main === module) {
  runDemo().catch(console.error);
} 