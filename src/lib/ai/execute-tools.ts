import { toolRegistry, type ToolContext } from './tools/registry'

export type ToolResult = { name: string; result: unknown }

export async function ejecutarTool(params: {
  name: string
  input: Record<string, unknown>
  contexto: ToolContext
}): Promise<ToolResult> {
  const { name, input, contexto } = params
  const handler = toolRegistry[name]
  if (!handler) {
    return { name, result: { error: `Tool desconocida: ${name}` } }
  }
  const result = await handler(input, contexto)
  return { name, result }
}
