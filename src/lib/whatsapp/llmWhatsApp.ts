import { generateText, tool, type CoreMessage } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { z } from 'zod'
import { SYSTEM_PROMPT } from '@/lib/ai/system_prompt_tools'
import { ejecutarTool } from '@/lib/ai/execute-tools'
import type { Channel } from '@/types/database'

export async function runLLMParaWhatsApp(params: {
  farmerId: string
  textoUsuario: string
}): Promise<string> {
  const modelProvider = process.env.LLM_PROVIDER || 'anthropic' // 'anthropic', 'google', 'openai', 'deepseek', 'xai', etc
  const modelName = process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022' // The specific model string
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let model: any;

  if (modelProvider === 'google') {
    const key = process.env.GOOGLE_API_KEY || process.env.LLM_API_KEY
    if (!key) return 'El asistente no está configurado (API_KEY requerida).'
    const google = createGoogleGenerativeAI({ apiKey: key })
    model = google(modelName)
  } else if (modelProvider === 'openai') {
    const key = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY
    if (!key) return 'El asistente no está configurado (API_KEY requerida).'
    const openai = createOpenAI({ apiKey: key })
    model = openai(modelName)
  } else if (modelProvider === 'deepseek') {
    const key = process.env.DEEPSEEK_API_KEY || process.env.LLM_API_KEY
    if (!key) return 'El asistente no está configurado (API_KEY requerida).'
    const deepseek = createDeepSeek({ apiKey: key })
    model = deepseek(modelName)
  } else if (modelProvider === 'openai-compatible') {
     // Esto permite usar CUALQUIER API que sea compatible con el estándar de OpenAI
     // (ej. Groq, xAI, LMStudio local, vLLM, Ollama, Together AI, etc.)
     const key = process.env.LLM_API_KEY
     const url = process.env.LLM_BASE_URL
     if (!key || !url) return 'Falta configurar LLM_API_KEY o LLM_BASE_URL para el proveedor genérico.'
     
     const customOpenAI = createOpenAI({
        apiKey: key,
        baseURL: url,
     })
     model = customOpenAI(modelName)
  } else {
    // Default to anthropic
    const key = process.env.ANTHROPIC_API_KEY || process.env.LLM_API_KEY
    if (!key) return 'El asistente no está configurado (API_KEY requerida).'
    const anthropic = createAnthropic({ apiKey: key })
    model = anthropic(modelName)
  }

  const system = `${SYSTEM_PROMPT}\n\n## Contexto de esta conversación\n- caficultor_id (UUID): ${params.farmerId}\n- Usa siempre este caficultor_id en crear_pedido y buscar_productos.`

  const messages: CoreMessage[] = [
    { role: 'user', content: params.textoUsuario },
  ]

  try {
    const { text } = await generateText({
      model,
      system,
      messages,
      maxSteps: 5,
      tools: {
        buscar_productos: tool({
          description: 'Busca productos en el catalogo por nombre, categoria o tipo. Devuelve productos con precios de almacenes cercanos al caficultor.',
          parameters: z.object({
            termino_busqueda: z.string().describe("Nombre del producto o termino de busqueda. Ej: '25-4-24', 'urea', 'fungicida', 'glifosato'"),
            categoria: z.enum(["fertilizante", "agroquimico", "herramienta", "semilla", "todos"]).optional().describe("Categoria para filtrar"),
            caficultor_id: z.string().describe("UUID del caficultor para calcular distancias a almacenes"),
          }),
          execute: async (args) => {
            return await ejecutarTool({
              name: 'buscar_productos',
              input: args,
              contexto: { farmerId: params.farmerId, channel: 'whatsapp' as Channel },
            }).then(r => r.result)
          },
        }),
        crear_pedido: tool({
          description: "Crea un pedido nuevo de un caficultor a un almacen. El pedido queda en estado 'pendiente' hasta que el almacen confirme.",
          parameters: z.object({
            caficultor_id: z.string().describe("UUID del caficultor que hace el pedido"),
            almacen_id: z.string().describe("UUID del almacen seleccionado"),
            items: z.array(z.object({
              producto_id: z.string(),
              cantidad: z.number(),
              precio_unitario: z.number()
            })).describe("Lista de productos con cantidad y precio"),
            canal: z.enum(["whatsapp", "pwa"]).describe("Canal desde donde se hizo el pedido"),
            notas: z.string().optional().describe("Notas adicionales del caficultor")
          }),
          execute: async (args) => {
            return await ejecutarTool({
              name: 'crear_pedido',
              input: args,
              contexto: { farmerId: params.farmerId, channel: 'whatsapp' as Channel },
            }).then(r => r.result)
          },
        }),
        notificar_almacen: tool({
          description: "Envia una notificacion al almacen por WhatsApp. Usado cuando hay un nuevo pedido o cuando el caficultor tiene una consulta para el almacen.",
          parameters: z.object({
             almacen_id: z.string(),
             tipo: z.enum(["nuevo_pedido", "consulta", "cancelacion"]),
             mensaje: z.string(),
             pedido_id: z.string().optional()
          }),
          execute: async (args) => {
            return await ejecutarTool({
              name: 'notificar_almacen',
              input: args,
              contexto: { farmerId: params.farmerId, channel: 'whatsapp' as Channel },
            }).then(r => r.result)
          },
        }),
      },
    })

    return text || 'Listo, revisa las opciones anteriores.'
  } catch (err) {
    console.error('Error in LLM Generation:', err)
    return 'Hubo un problema procesando tu consulta con el asistente.'
  }
}
