import { Workflow } from "../types";

export const customerServiceWorkflow: Workflow = {
  id: "customer-service",
  name: "Customer Service Automation",
  description: "Automates customer inquiry handling and resolution",
  steps: [
    {
      id: "analyze-inquiry",
      name: "Analyze Customer Inquiry",
      toolId: "sentiment-analysis",
      params: {
        inquiry: "{{context.inquiry}}",
      },
      onError: { retry: true },
    },
    {
      id: "categorize-issue",
      name: "Categorize Issue",
      toolId: "issue-categorizer",
      params: {},
      dependsOn: ["analyze-inquiry"],
    },
    {
      id: "generate-response",
      name: "Generate Response",
      toolId: "response-generator",
      params: {},
      dependsOn: ["categorize-issue"],
      onError: {
        fallback: "human-escalation",
      },
    },
    {
      id: "human-escalation",
      name: "Escalate to Human Agent",
      toolId: "escalation-handler",
      params: {},
    },
  ],
};
