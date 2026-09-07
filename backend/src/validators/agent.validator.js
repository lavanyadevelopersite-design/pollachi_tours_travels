const { z } = require('zod');

const agentBodySchema = z.object({
  agent_name: z
    .string()
    .trim()
    .min(1, 'Agent name is required')
    .max(150, 'Agent name must be at most 150 characters'),
  is_active: z.boolean().optional(),
});

const createAgentSchema = z.object({
  body: agentBodySchema,
});

const updateAgentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: agentBodySchema.partial(),
});

module.exports = { createAgentSchema, updateAgentSchema };
