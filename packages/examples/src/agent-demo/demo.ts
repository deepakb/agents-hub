import { Logger } from '@nodejs-orchestration/logger';
import { SpecializedAgent } from './specialized-agent';
import { processRefundTool, applyDiscountTool } from './functions';

const logger = new Logger({
  level: 'info',
  destinations: [{ type: 'console' }]
});

// Create agents
const triageAgent = new SpecializedAgent(
  'triage-agent',
  'Triage Agent',
  'Determine which agent is best suited to handle the user\'s request, and transfer the conversation to that agent.',
  [],
  logger
);

const salesAgent = new SpecializedAgent(
  'sales-agent',
  'Sales Agent',
  'Be super enthusiastic about selling bees.',
  [],
  logger
);

const refundsAgent = new SpecializedAgent(
  'refunds-agent',
  'Refunds Agent',
  'Help the user with a refund. If the reason is that it was too expensive, offer the user a refund code. If they insist, then process the refund.',
  [processRefundTool, applyDiscountTool],
  logger
);

// Set up transfer functions
triageAgent.addTransferFunction('sales-agent', () => salesAgent);
triageAgent.addTransferFunction('refunds-agent', () => refundsAgent);

salesAgent.addTransferFunction('triage-agent', () => triageAgent);
refundsAgent.addTransferFunction('triage-agent', () => triageAgent);

// Example usage
async function runDemo() {
  console.log('Starting with Triage Agent...');
  let currentAgent = triageAgent;

  // Simulate a conversation flow
  console.log(`Current agent: ${currentAgent.name}`);
  
  // Transfer to Sales Agent
  currentAgent = await currentAgent.transfer('sales-agent') || currentAgent;
  console.log(`Transferred to: ${currentAgent.name}`);
  
  // Transfer back to Triage
  currentAgent = await currentAgent.transfer('triage-agent') || currentAgent;
  console.log(`Transferred to: ${currentAgent.name}`);
  
  // Transfer to Refunds Agent
  currentAgent = await currentAgent.transfer('refunds-agent') || currentAgent;
  console.log(`Transferred to: ${currentAgent.name}`);
  
  // Execute a refund
  if (currentAgent.id === 'refunds-agent') {
    const result = await processRefundTool.execute({
      itemId: 'item_123',
      reason: 'Customer dissatisfied'
    });
    console.log('Refund result:', result);
  }
}

if (require.main === module) {
  runDemo().catch(console.error);
} 