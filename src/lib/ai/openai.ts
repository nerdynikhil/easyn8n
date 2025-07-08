import OpenAI from 'openai';
import { N8NWorkflow, WorkflowGenerationRequest } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateWorkflowWithOpenAI(request: WorkflowGenerationRequest): Promise<N8NWorkflow> {
  const { description, complexity = 'medium', category, requirements } = request;

  const systemPrompt = `You are an expert n8n workflow designer. Generate a complete, functional n8n workflow JSON based on user requirements.

Key guidelines:
- Create realistic, production-ready workflows
- Use appropriate n8n nodes for the task
- Ensure proper node connections and data flow
- Include error handling where applicable
- Use realistic node parameters and configurations
- Follow n8n best practices for workflow design

Available common n8n nodes:
- HTTP Request: For API calls
- Code: For custom JavaScript/Python logic
- If: For conditional logic
- Set: For data manipulation
- Wait: For delays
- Schedule Trigger: For time-based triggers
- Webhook: For HTTP triggers
- Gmail: For email operations
- Slack: For Slack integration
- Google Sheets: For spreadsheet operations
- Notion: For Notion database operations
- Airtable: For Airtable operations
- And many more...

Response format: Return ONLY a valid JSON object representing the n8n workflow.`;

  const userPrompt = `Create an n8n workflow for: ${description}

Complexity: ${complexity}
${category ? `Category: ${category}` : ''}
${requirements?.length ? `Additional requirements: ${requirements.join(', ')}` : ''}

Generate a complete n8n workflow JSON with:
1. Appropriate trigger node
2. Processing nodes with realistic configurations
3. Proper node connections
4. Error handling if needed
5. Output/action nodes

Make it production-ready and functional.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const workflowJson = completion.choices[0]?.message?.content;
    if (!workflowJson) {
      throw new Error('No workflow generated');
    }

    const workflow = JSON.parse(workflowJson) as N8NWorkflow;
    
    // Validate basic structure
    if (!workflow.nodes || !workflow.connections) {
      throw new Error('Invalid workflow structure');
    }

    // Ensure required properties
    workflow.id = workflow.id || generateWorkflowId();
    workflow.name = workflow.name || generateWorkflowName(description);
    workflow.active = workflow.active ?? false;

    return workflow;
  } catch (error) {
    console.error('OpenAI workflow generation error:', error);
    throw new Error('Failed to generate workflow with OpenAI');
  }
}

function generateWorkflowId(): string {
  return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateWorkflowName(description: string): string {
  // Extract a meaningful name from description
  const words = description.split(' ').slice(0, 4);
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function validateWorkflow(workflow: N8NWorkflow): Promise<boolean> {
  try {
    // Basic validation checks
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) return false;
    if (!workflow.connections || typeof workflow.connections !== 'object') return false;
    if (workflow.nodes.length === 0) return false;

    // Check for required node properties
    for (const node of workflow.nodes) {
      if (!node.id || !node.name || !node.type) return false;
      if (!node.position || !Array.isArray(node.position)) return false;
      if (!node.parameters || typeof node.parameters !== 'object') return false;
    }

    // Validate connections structure
    for (const [nodeId, connections] of Object.entries(workflow.connections)) {
      if (!workflow.nodes.find(n => n.id === nodeId)) return false;
      if (connections.main) {
        for (const connectionGroup of connections.main) {
          for (const connection of connectionGroup) {
            if (!connection.node || !workflow.nodes.find(n => n.id === connection.node)) {
              return false;
            }
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Workflow validation error:', error);
    return false;
  }
} 