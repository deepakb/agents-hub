import { Tool } from '@agent-forge/tools';

export const processRefundTool: Tool = {
  id: 'process-refund',
  name: 'Process Refund',
  description: 'Process a refund for an item',
  execute: async (params) => {
    const { itemId, reason = 'NOT SPECIFIED' } = params;
    console.log(`[mock] Refunding item ${itemId} because ${reason}...`);
    return { success: true, message: 'Success!' };
  },
  schema: {
    input: { itemId: 'string', reason: 'string' },
    output: { success: 'boolean', message: 'string' }
  }
};

export const applyDiscountTool: Tool = {
  id: 'apply-discount',
  name: 'Apply Discount',
  description: 'Apply a discount to the user\'s cart',
  execute: async () => {
    console.log('[mock] Applying discount...');
    return { success: true, discount: '11%' };
  },
  schema: {
    input: {},
    output: { success: 'boolean', discount: 'string' }
  }
};
