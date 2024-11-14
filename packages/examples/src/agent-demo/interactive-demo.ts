import { Logger } from "@agent-forge/logger";
import { SpecializedAgent } from "./specialized-agent";
import { processRefundTool, applyDiscountTool } from "./functions";
import * as readline from "readline";

const logger = new Logger({
  level: "info",
  destinations: [{ type: "console" }],
});

// Create agents (same as before)
const triageAgent = new SpecializedAgent(
  "triage-agent",
  "Triage Agent",
  "Determine which agent is best suited to handle the user's request, and transfer the conversation to that agent.",
  [],
  logger,
);

const salesAgent = new SpecializedAgent(
  "sales-agent",
  "Sales Agent",
  "Be super enthusiastic about selling bees.",
  [],
  logger,
);

const refundsAgent = new SpecializedAgent(
  "refunds-agent",
  "Refunds Agent",
  "Help the user with a refund. If the reason is that it was too expensive, offer the user a refund code. If they insist, then process the refund.",
  [processRefundTool, applyDiscountTool],
  logger,
);

// Set up transfer functions
triageAgent.addTransferFunction("sales-agent", () => salesAgent);
triageAgent.addTransferFunction("refunds-agent", () => refundsAgent);
salesAgent.addTransferFunction("triage-agent", () => triageAgent);
refundsAgent.addTransferFunction("triage-agent", () => triageAgent);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function runInteractiveDemo() {
  console.log("\n🤖 Welcome to the Interactive Agent Demo!\n");
  let currentAgent = triageAgent;

  try {
    while (true) {
      console.log(`\n👤 Current Agent: ${currentAgent.name}`);
      console.log(`📝 Role: ${currentAgent.getInstructions()}`);
      console.log("\nAvailable commands:");
      console.log("- transfer <agent-id>  (e.g., transfer sales-agent)");
      console.log("- refund <item-id>     (only for refunds agent)");
      console.log("- discount             (only for refunds agent)");
      console.log("- exit\n");

      const input = await askQuestion("Enter your command: ");

      if (input.toLowerCase() === "exit") {
        break;
      }

      if (input.startsWith("transfer ")) {
        const targetAgentId = input.split(" ")[1];
        const newAgent = await currentAgent.transfer(targetAgentId);
        if (newAgent) {
          currentAgent = newAgent;
          console.log(`\n✅ Transferred to: ${currentAgent.name}`);
        } else {
          console.log(`\n❌ Cannot transfer to ${targetAgentId}`);
        }
        continue;
      }

      if (input.startsWith("refund ") && currentAgent.id === "refunds-agent") {
        const itemId = input.split(" ")[1];
        const result = await processRefundTool.execute({
          itemId,
          reason: await askQuestion("Enter refund reason: "),
        });
        console.log("\n✅ Refund result:", result);
        continue;
      }

      if (input === "discount" && currentAgent.id === "refunds-agent") {
        const result = await applyDiscountTool.execute({});
        console.log("\n✅ Discount applied:", result);
        continue;
      }

      console.log("\n❌ Invalid command. Please try again.");
    }
  } finally {
    rl.close();
    console.log("\n👋 Thank you for using the Interactive Agent Demo!\n");
  }
}

if (require.main === module) {
  runInteractiveDemo().catch(console.error);
}
