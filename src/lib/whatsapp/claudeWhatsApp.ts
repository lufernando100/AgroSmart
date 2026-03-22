import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, ASSISTANT_TOOLS } from '@/lib/ai/system_prompt_tools'
import { ejecutarTool } from '@/lib/ai/execute-tools'
import type { ConversacionCanal } from '@/types/database'

const TOOL_ALLOW = new Set([
  'buscar_productos',
  'crear_pedido',
  'notificar_almacen',
])

function anthropicTools(): Anthropic.Tool[] {
  return ASSISTANT_TOOLS.filter((t) => TOOL_ALLOW.has(t.name)).map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema as Anthropic.Tool['input_schema'],
  }))
}

export async function runClaudeParaWhatsApp(params: {
  caficultorId: string
  textoUsuario: string
}): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    return 'El asistente no está configurado (ANTHROPIC_API_KEY).'
  }

  const client = new Anthropic({ apiKey: key })
  const model =
    process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514'

  const system = `${SYSTEM_PROMPT}\n\n## Contexto de esta conversación\n- caficultor_id (UUID): ${params.caficultorId}\n- Usa siempre este caficultor_id en crear_pedido y buscar_productos.`

  const tools = anthropicTools()
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: params.textoUsuario },
  ]

  let turns = 0
  while (turns < 6) {
    turns += 1
    const res = await client.messages.create({
      model,
      max_tokens: 4096,
      system,
      messages,
      tools,
    })

    const blocks = res.content
    const toolUses = blocks.filter((b) => b.type === 'tool_use')
    const textBlocks = blocks.filter((b) => b.type === 'text')

    if (res.stop_reason === 'end_turn' || toolUses.length === 0) {
      const text = textBlocks
        .map((b) => (b.type === 'text' ? b.text : ''))
        .join('\n')
        .trim()
      return text || 'Listo, revisa las opciones anteriores.'
    }

    messages.push({ role: 'assistant', content: blocks })

    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const tu of toolUses) {
      if (tu.type !== 'tool_use') continue
      const input =
        typeof tu.input === 'object' && tu.input !== null && !Array.isArray(tu.input)
          ? (tu.input as Record<string, unknown>)
          : {}
      const out = await ejecutarTool({
        name: tu.name,
        input,
        contexto: {
          caficultorId: params.caficultorId,
          canal: 'whatsapp' as ConversacionCanal,
        },
      })
      toolResults.push({
        type: 'tool_result',
        tool_use_id: tu.id,
        content: JSON.stringify(out.result),
      })
    }

    messages.push({ role: 'user', content: toolResults })
  }

  return 'Demasiadas herramientas en una sola respuesta. Intenta de nuevo con una petición más corta.'
}
