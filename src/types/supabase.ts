export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alertas: {
        Row: {
          datos: Json | null
          enviada_at: string | null
          enviada_por: Database["public"]["Enums"]["conversacion_canal"] | null
          id: string
          leida: boolean | null
          leida_at: string | null
          mensaje: string
          tipo: Database["public"]["Enums"]["alerta_tipo"]
          titulo: string
          usuario_id: string
        }
        Insert: {
          datos?: Json | null
          enviada_at?: string | null
          enviada_por?: Database["public"]["Enums"]["conversacion_canal"] | null
          id?: string
          leida?: boolean | null
          leida_at?: string | null
          mensaje: string
          tipo: Database["public"]["Enums"]["alerta_tipo"]
          titulo: string
          usuario_id: string
        }
        Update: {
          datos?: Json | null
          enviada_at?: string | null
          enviada_por?: Database["public"]["Enums"]["conversacion_canal"] | null
          id?: string
          leida?: boolean | null
          leida_at?: string | null
          mensaje?: string
          tipo?: Database["public"]["Enums"]["alerta_tipo"]
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          sent_at: string | null
          sent_via: Database["public"]["Enums"]["channel"] | null
          title: string
          type: Database["public"]["Enums"]["alert_type"]
          user_id: string
        }
        Insert: {
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          sent_at?: string | null
          sent_via?: Database["public"]["Enums"]["channel"] | null
          title: string
          type: Database["public"]["Enums"]["alert_type"]
          user_id: string
        }
        Update: {
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          sent_at?: string | null
          sent_via?: Database["public"]["Enums"]["channel"] | null
          title?: string
          type?: Database["public"]["Enums"]["alert_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      almacenes: {
        Row: {
          acepta_pedidos_digitales: boolean | null
          activo: boolean | null
          comision_porcentaje: number | null
          created_at: string | null
          departamento: string
          direccion: string | null
          email: string | null
          horario: string | null
          id: string
          metadata: Json | null
          municipio: string
          nit: string | null
          nombre: string
          telefono_whatsapp: string | null
          ubicacion: unknown
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          acepta_pedidos_digitales?: boolean | null
          activo?: boolean | null
          comision_porcentaje?: number | null
          created_at?: string | null
          departamento: string
          direccion?: string | null
          email?: string | null
          horario?: string | null
          id?: string
          metadata?: Json | null
          municipio: string
          nit?: string | null
          nombre: string
          telefono_whatsapp?: string | null
          ubicacion?: unknown
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          acepta_pedidos_digitales?: boolean | null
          activo?: boolean | null
          comision_porcentaje?: number | null
          created_at?: string | null
          departamento?: string
          direccion?: string | null
          email?: string | null
          horario?: string | null
          id?: string
          metadata?: Json | null
          municipio?: string
          nit?: string | null
          nombre?: string
          telefono_whatsapp?: string | null
          ubicacion?: unknown
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "almacenes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      analisis_suelo: {
        Row: {
          aluminio: number | null
          azufre: number | null
          boro: number | null
          calcio: number | null
          canal: Database["public"]["Enums"]["conversacion_canal"] | null
          cice: number | null
          cobre: number | null
          conductividad_electrica: number | null
          created_at: string | null
          fecha_analisis: string | null
          fecha_registro: string | null
          finca_id: string
          fosforo: number | null
          hierro: number | null
          id: string
          imagen_url: string | null
          interpretacion: Json | null
          laboratorio: string | null
          lote_id: string | null
          magnesio: number | null
          manganeso: number | null
          materia_organica: number | null
          nitrogeno: number | null
          ph: number | null
          potasio: number | null
          recomendacion: Json | null
          recomendacion_texto: string | null
          sodio: number | null
          usuario_id: string
          zinc: number | null
        }
        Insert: {
          aluminio?: number | null
          azufre?: number | null
          boro?: number | null
          calcio?: number | null
          canal?: Database["public"]["Enums"]["conversacion_canal"] | null
          cice?: number | null
          cobre?: number | null
          conductividad_electrica?: number | null
          created_at?: string | null
          fecha_analisis?: string | null
          fecha_registro?: string | null
          finca_id: string
          fosforo?: number | null
          hierro?: number | null
          id?: string
          imagen_url?: string | null
          interpretacion?: Json | null
          laboratorio?: string | null
          lote_id?: string | null
          magnesio?: number | null
          manganeso?: number | null
          materia_organica?: number | null
          nitrogeno?: number | null
          ph?: number | null
          potasio?: number | null
          recomendacion?: Json | null
          recomendacion_texto?: string | null
          sodio?: number | null
          usuario_id: string
          zinc?: number | null
        }
        Update: {
          aluminio?: number | null
          azufre?: number | null
          boro?: number | null
          calcio?: number | null
          canal?: Database["public"]["Enums"]["conversacion_canal"] | null
          cice?: number | null
          cobre?: number | null
          conductividad_electrica?: number | null
          created_at?: string | null
          fecha_analisis?: string | null
          fecha_registro?: string | null
          finca_id?: string
          fosforo?: number | null
          hierro?: number | null
          id?: string
          imagen_url?: string | null
          interpretacion?: Json | null
          laboratorio?: string | null
          lote_id?: string | null
          magnesio?: number | null
          manganeso?: number | null
          materia_organica?: number | null
          nitrogeno?: number | null
          ph?: number | null
          potasio?: number | null
          recomendacion?: Json | null
          recomendacion_texto?: string | null
          sodio?: number | null
          usuario_id?: string
          zinc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analisis_suelo_finca_id_fkey"
            columns: ["finca_id"]
            isOneToOne: false
            referencedRelation: "fincas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisis_suelo_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisis_suelo_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      caficultor_cooperativa: {
        Row: {
          caficultor_id: string
          cooperativa_id: string
          fecha_ingreso: string | null
        }
        Insert: {
          caficultor_id: string
          cooperativa_id: string
          fecha_ingreso?: string | null
        }
        Update: {
          caficultor_id?: string
          cooperativa_id?: string
          fecha_ingreso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caficultor_cooperativa_caficultor_id_fkey"
            columns: ["caficultor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caficultor_cooperativa_cooperativa_id_fkey"
            columns: ["cooperativa_id"]
            isOneToOne: false
            referencedRelation: "cooperativas"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          activo: boolean | null
          icono: string | null
          id: string
          nombre: string
          orden: number | null
          sector: Database["public"]["Enums"]["sector_tipo"]
        }
        Insert: {
          activo?: boolean | null
          icono?: string | null
          id?: string
          nombre: string
          orden?: number | null
          sector?: Database["public"]["Enums"]["sector_tipo"]
        }
        Update: {
          activo?: boolean | null
          icono?: string | null
          id?: string
          nombre?: string
          orden?: number | null
          sector?: Database["public"]["Enums"]["sector_tipo"]
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean | null
          icon: string | null
          id: string
          name: string
          sector: Database["public"]["Enums"]["sector_type"]
          sort_order: number | null
        }
        Insert: {
          active?: boolean | null
          icon?: string | null
          id?: string
          name: string
          sector?: Database["public"]["Enums"]["sector_type"]
          sort_order?: number | null
        }
        Update: {
          active?: boolean | null
          icon?: string | null
          id?: string
          name?: string
          sector?: Database["public"]["Enums"]["sector_type"]
          sort_order?: number | null
        }
        Relationships: []
      }
      conversaciones: {
        Row: {
          audio_url: string | null
          canal: Database["public"]["Enums"]["conversacion_canal"]
          contenido: string
          contenido_tipo: string | null
          costo_estimado: number | null
          created_at: string | null
          escalado_a_humano: boolean | null
          id: string
          imagen_url: string | null
          rol: string
          tokens_input: number | null
          tokens_output: number | null
          tools_usadas: Json | null
          transcripcion: string | null
          usuario_id: string
          whatsapp_message_id: string | null
        }
        Insert: {
          audio_url?: string | null
          canal: Database["public"]["Enums"]["conversacion_canal"]
          contenido: string
          contenido_tipo?: string | null
          costo_estimado?: number | null
          created_at?: string | null
          escalado_a_humano?: boolean | null
          id?: string
          imagen_url?: string | null
          rol: string
          tokens_input?: number | null
          tokens_output?: number | null
          tools_usadas?: Json | null
          transcripcion?: string | null
          usuario_id: string
          whatsapp_message_id?: string | null
        }
        Update: {
          audio_url?: string | null
          canal?: Database["public"]["Enums"]["conversacion_canal"]
          contenido?: string
          contenido_tipo?: string | null
          costo_estimado?: number | null
          created_at?: string | null
          escalado_a_humano?: boolean | null
          id?: string
          imagen_url?: string | null
          rol?: string
          tokens_input?: number | null
          tokens_output?: number | null
          tools_usadas?: Json | null
          transcripcion?: string | null
          usuario_id?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assistant_prompt_version: string | null
          audio_url: string | null
          channel: Database["public"]["Enums"]["channel"]
          content: string
          content_type: string | null
          created_at: string | null
          escalated_to_human: boolean | null
          estimated_cost_usd: number | null
          id: string
          image_url: string | null
          role: string
          tokens_input: number | null
          tokens_output: number | null
          tools_used: Json | null
          transcription: string | null
          user_id: string
          whatsapp_message_id: string | null
        }
        Insert: {
          assistant_prompt_version?: string | null
          audio_url?: string | null
          channel: Database["public"]["Enums"]["channel"]
          content: string
          content_type?: string | null
          created_at?: string | null
          escalated_to_human?: boolean | null
          estimated_cost_usd?: number | null
          id?: string
          image_url?: string | null
          role: string
          tokens_input?: number | null
          tokens_output?: number | null
          tools_used?: Json | null
          transcription?: string | null
          user_id: string
          whatsapp_message_id?: string | null
        }
        Update: {
          assistant_prompt_version?: string | null
          audio_url?: string | null
          channel?: Database["public"]["Enums"]["channel"]
          content?: string
          content_type?: string | null
          created_at?: string | null
          escalated_to_human?: boolean | null
          estimated_cost_usd?: number | null
          id?: string
          image_url?: string | null
          role?: string
          tokens_input?: number | null
          tokens_output?: number | null
          tools_used?: Json | null
          transcription?: string | null
          user_id?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperativas: {
        Row: {
          activa: boolean | null
          contacto_nombre: string | null
          contacto_telefono: string | null
          created_at: string | null
          departamento: string | null
          id: string
          municipio: string | null
          nit: string | null
          nombre: string
          numero_asociados: number | null
        }
        Insert: {
          activa?: boolean | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string | null
          departamento?: string | null
          id?: string
          municipio?: string | null
          nit?: string | null
          nombre: string
          numero_asociados?: number | null
        }
        Update: {
          activa?: boolean | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string | null
          departamento?: string | null
          id?: string
          municipio?: string | null
          nit?: string | null
          nombre?: string
          numero_asociados?: number | null
        }
        Relationships: []
      }
      cooperatives: {
        Row: {
          active: boolean | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          department: string | null
          id: string
          member_count: number | null
          municipality: string | null
          name: string
          tax_id: string | null
        }
        Insert: {
          active?: boolean | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          member_count?: number | null
          municipality?: string | null
          name: string
          tax_id?: string | null
        }
        Update: {
          active?: boolean | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          member_count?: number | null
          municipality?: string | null
          name?: string
          tax_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string | null
          description: string | null
          expense_date: string
          farm_id: string | null
          id: string
          invoice_data: Json | null
          invoice_image_url: string | null
          order_id: string | null
          plot_id: string | null
          source: string | null
          supplier: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string | null
          description?: string | null
          expense_date: string
          farm_id?: string | null
          id?: string
          invoice_data?: Json | null
          invoice_image_url?: string | null
          order_id?: string | null
          plot_id?: string | null
          source?: string | null
          supplier?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string | null
          description?: string | null
          expense_date?: string
          farm_id?: string | null
          id?: string
          invoice_data?: Json | null
          invoice_image_url?: string | null
          order_id?: string | null
          plot_id?: string | null
          source?: string | null
          supplier?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_cooperative: {
        Row: {
          cooperative_id: string
          farmer_id: string
          joined_at: string | null
        }
        Insert: {
          cooperative_id: string
          farmer_id: string
          joined_at?: string | null
        }
        Update: {
          cooperative_id?: string
          farmer_id?: string
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_cooperative_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farmer_cooperative_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          altitude_masl: number | null
          created_at: string | null
          department: string
          id: string
          location: unknown
          municipality: string
          name: string
          total_area_ha: number | null
          updated_at: string | null
          user_id: string
          vereda: string | null
        }
        Insert: {
          altitude_masl?: number | null
          created_at?: string | null
          department: string
          id?: string
          location?: unknown
          municipality: string
          name: string
          total_area_ha?: number | null
          updated_at?: string | null
          user_id: string
          vereda?: string | null
        }
        Update: {
          altitude_masl?: number | null
          created_at?: string | null
          department?: string
          id?: string
          location?: unknown
          municipality?: string
          name?: string
          total_area_ha?: number | null
          updated_at?: string | null
          user_id?: string
          vereda?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fincas: {
        Row: {
          altitud_msnm: number | null
          area_total_ha: number | null
          created_at: string | null
          departamento: string
          id: string
          municipio: string
          nombre: string
          ubicacion: unknown
          updated_at: string | null
          usuario_id: string
          vereda: string | null
        }
        Insert: {
          altitud_msnm?: number | null
          area_total_ha?: number | null
          created_at?: string | null
          departamento: string
          id?: string
          municipio: string
          nombre: string
          ubicacion?: unknown
          updated_at?: string | null
          usuario_id: string
          vereda?: string | null
        }
        Update: {
          altitud_msnm?: number | null
          area_total_ha?: number | null
          created_at?: string | null
          departamento?: string
          id?: string
          municipio?: string
          nombre?: string
          ubicacion?: unknown
          updated_at?: string | null
          usuario_id?: string
          vereda?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fincas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      floraciones: {
        Row: {
          created_at: string | null
          fecha_estimada_cosecha: string | null
          fecha_fertilizacion: string | null
          fecha_floracion: string
          id: string
          imagen_url: string | null
          intensidad: string | null
          lote_id: string
          notas: string | null
          periodo_critico_broca_inicio: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          fecha_estimada_cosecha?: string | null
          fecha_fertilizacion?: string | null
          fecha_floracion: string
          id?: string
          imagen_url?: string | null
          intensidad?: string | null
          lote_id: string
          notas?: string | null
          periodo_critico_broca_inicio?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          fecha_estimada_cosecha?: string | null
          fecha_fertilizacion?: string | null
          fecha_floracion?: string
          id?: string
          imagen_url?: string | null
          intensidad?: string | null
          lote_id?: string
          notas?: string | null
          periodo_critico_broca_inicio?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "floraciones_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "floraciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      flowering_records: {
        Row: {
          borer_critical_period_start: string | null
          created_at: string | null
          estimated_harvest_date: string | null
          fertilization_date: string | null
          flowering_date: string
          id: string
          image_url: string | null
          intensity: string | null
          notes: string | null
          plot_id: string
          user_id: string
        }
        Insert: {
          borer_critical_period_start?: string | null
          created_at?: string | null
          estimated_harvest_date?: string | null
          fertilization_date?: string | null
          flowering_date: string
          id?: string
          image_url?: string | null
          intensity?: string | null
          notes?: string | null
          plot_id: string
          user_id: string
        }
        Update: {
          borer_critical_period_start?: string | null
          created_at?: string | null
          estimated_harvest_date?: string | null
          fertilization_date?: string | null
          flowering_date?: string
          id?: string
          image_url?: string | null
          intensity?: string | null
          notes?: string | null
          plot_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flowering_records_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flowering_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos: {
        Row: {
          categoria: Database["public"]["Enums"]["gasto_categoria"]
          created_at: string | null
          descripcion: string | null
          factura_datos: Json | null
          factura_imagen_url: string | null
          fecha: string
          finca_id: string | null
          id: string
          lote_id: string | null
          monto: number
          origen: string | null
          pedido_id: string | null
          proveedor: string | null
          usuario_id: string
        }
        Insert: {
          categoria: Database["public"]["Enums"]["gasto_categoria"]
          created_at?: string | null
          descripcion?: string | null
          factura_datos?: Json | null
          factura_imagen_url?: string | null
          fecha: string
          finca_id?: string | null
          id?: string
          lote_id?: string | null
          monto: number
          origen?: string | null
          pedido_id?: string | null
          proveedor?: string | null
          usuario_id: string
        }
        Update: {
          categoria?: Database["public"]["Enums"]["gasto_categoria"]
          created_at?: string | null
          descripcion?: string | null
          factura_datos?: Json | null
          factura_imagen_url?: string | null
          fecha?: string
          finca_id?: string | null
          id?: string
          lote_id?: string | null
          monto?: number
          origen?: string | null
          pedido_id?: string | null
          proveedor?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gastos_finca_id_fkey"
            columns: ["finca_id"]
            isOneToOne: false
            referencedRelation: "fincas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      jornales: {
        Row: {
          created_at: string | null
          dias: number
          fecha_fin: string | null
          fecha_inicio: string
          finca_id: string | null
          id: string
          labor: string
          lote_id: string | null
          notas: string | null
          pago_por_dia: number
          pago_total: number
          trabajador_nombre: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          dias: number
          fecha_fin?: string | null
          fecha_inicio: string
          finca_id?: string | null
          id?: string
          labor: string
          lote_id?: string | null
          notas?: string | null
          pago_por_dia: number
          pago_total: number
          trabajador_nombre: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          dias?: number
          fecha_fin?: string | null
          fecha_inicio?: string
          finca_id?: string | null
          id?: string
          labor?: string
          lote_id?: string | null
          notas?: string | null
          pago_por_dia?: number
          pago_total?: number
          trabajador_nombre?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jornales_finca_id_fkey"
            columns: ["finca_id"]
            isOneToOne: false
            referencedRelation: "fincas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornales_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornales_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_entries: {
        Row: {
          created_at: string | null
          days: number
          end_date: string | null
          farm_id: string | null
          id: string
          notes: string | null
          pay_per_day: number
          plot_id: string | null
          start_date: string
          task: string
          total_pay: number
          user_id: string
          worker_name: string
        }
        Insert: {
          created_at?: string | null
          days: number
          end_date?: string | null
          farm_id?: string | null
          id?: string
          notes?: string | null
          pay_per_day: number
          plot_id?: string | null
          start_date: string
          task: string
          total_pay: number
          user_id: string
          worker_name: string
        }
        Update: {
          created_at?: string | null
          days?: number
          end_date?: string | null
          farm_id?: string | null
          id?: string
          notes?: string | null
          pay_per_day?: number
          plot_id?: string | null
          start_date?: string
          task?: string
          total_pay?: number
          user_id?: string
          worker_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "labor_entries_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_entries_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes: {
        Row: {
          area_ha: number | null
          created_at: string | null
          densidad_plantas_ha: number | null
          edad_anios: number | null
          estado: Database["public"]["Enums"]["lote_estado"] | null
          etapa: Database["public"]["Enums"]["cultivo_etapa"] | null
          fecha_estimada_cosecha: string | null
          fecha_fertilizacion: string | null
          finca_id: string
          id: string
          metadata: Json | null
          nombre: string
          poligono: unknown
          porcentaje_sombrio: number | null
          ultima_floracion: string | null
          updated_at: string | null
          variedad: string | null
        }
        Insert: {
          area_ha?: number | null
          created_at?: string | null
          densidad_plantas_ha?: number | null
          edad_anios?: number | null
          estado?: Database["public"]["Enums"]["lote_estado"] | null
          etapa?: Database["public"]["Enums"]["cultivo_etapa"] | null
          fecha_estimada_cosecha?: string | null
          fecha_fertilizacion?: string | null
          finca_id: string
          id?: string
          metadata?: Json | null
          nombre: string
          poligono?: unknown
          porcentaje_sombrio?: number | null
          ultima_floracion?: string | null
          updated_at?: string | null
          variedad?: string | null
        }
        Update: {
          area_ha?: number | null
          created_at?: string | null
          densidad_plantas_ha?: number | null
          edad_anios?: number | null
          estado?: Database["public"]["Enums"]["lote_estado"] | null
          etapa?: Database["public"]["Enums"]["cultivo_etapa"] | null
          fecha_estimada_cosecha?: string | null
          fecha_fertilizacion?: string | null
          finca_id?: string
          id?: string
          metadata?: Json | null
          nombre?: string
          poligono?: unknown
          porcentaje_sombrio?: number | null
          ultima_floracion?: string | null
          updated_at?: string | null
          variedad?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lotes_finca_id_fkey"
            columns: ["finca_id"]
            isOneToOne: false
            referencedRelation: "fincas"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          channel: Database["public"]["Enums"]["channel"]
          commission: number | null
          confirmed_at: string | null
          created_at: string | null
          delivered_at: string | null
          farmer_id: string
          id: string
          notes: string | null
          order_number: string
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at: string | null
          warehouse_confirmed_price: number | null
          warehouse_id: string
          warehouse_notes: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["channel"]
          commission?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          farmer_id: string
          id?: string
          notes?: string | null
          order_number: string
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at?: string | null
          warehouse_confirmed_price?: number | null
          warehouse_id: string
          warehouse_notes?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["channel"]
          commission?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          farmer_id?: string
          id?: string
          notes?: string | null
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          warehouse_confirmed_price?: number | null
          warehouse_id?: string
          warehouse_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_items: {
        Row: {
          cantidad: number
          created_at: string | null
          id: string
          pedido_id: string
          precio_unitario: number
          producto_id: string
          subtotal: number
        }
        Insert: {
          cantidad: number
          created_at?: string | null
          id?: string
          pedido_id: string
          precio_unitario: number
          producto_id: string
          subtotal: number
        }
        Update: {
          cantidad?: number
          created_at?: string | null
          id?: string
          pedido_id?: string
          precio_unitario?: number
          producto_id?: string
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedido_items_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          almacen_id: string
          caficultor_id: string
          canal: Database["public"]["Enums"]["conversacion_canal"]
          comision: number | null
          confirmado_at: string | null
          created_at: string | null
          entregado_at: string | null
          estado: Database["public"]["Enums"]["pedido_estado"] | null
          id: string
          notas: string | null
          notas_almacen: string | null
          numero: string
          precio_confirmado_almacen: number | null
          subtotal: number
          total: number
          updated_at: string | null
        }
        Insert: {
          almacen_id: string
          caficultor_id: string
          canal: Database["public"]["Enums"]["conversacion_canal"]
          comision?: number | null
          confirmado_at?: string | null
          created_at?: string | null
          entregado_at?: string | null
          estado?: Database["public"]["Enums"]["pedido_estado"] | null
          id?: string
          notas?: string | null
          notas_almacen?: string | null
          numero: string
          precio_confirmado_almacen?: number | null
          subtotal: number
          total: number
          updated_at?: string | null
        }
        Update: {
          almacen_id?: string
          caficultor_id?: string
          canal?: Database["public"]["Enums"]["conversacion_canal"]
          comision?: number | null
          confirmado_at?: string | null
          created_at?: string | null
          entregado_at?: string | null
          estado?: Database["public"]["Enums"]["pedido_estado"] | null
          id?: string
          notas?: string | null
          notas_almacen?: string | null
          numero?: string
          precio_confirmado_almacen?: number | null
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_almacen_id_fkey"
            columns: ["almacen_id"]
            isOneToOne: false
            referencedRelation: "almacenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_caficultor_id_fkey"
            columns: ["caficultor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      plots: {
        Row: {
          age_years: number | null
          area_ha: number | null
          created_at: string | null
          crop_stage: Database["public"]["Enums"]["crop_stage"] | null
          estimated_harvest_date: string | null
          farm_id: string
          fertilization_date: string | null
          id: string
          last_flowering_date: string | null
          metadata: Json | null
          name: string
          plant_density_per_ha: number | null
          polygon: unknown
          shade_percentage: number | null
          status: Database["public"]["Enums"]["plot_status"] | null
          updated_at: string | null
          variety: string | null
        }
        Insert: {
          age_years?: number | null
          area_ha?: number | null
          created_at?: string | null
          crop_stage?: Database["public"]["Enums"]["crop_stage"] | null
          estimated_harvest_date?: string | null
          farm_id: string
          fertilization_date?: string | null
          id?: string
          last_flowering_date?: string | null
          metadata?: Json | null
          name: string
          plant_density_per_ha?: number | null
          polygon?: unknown
          shade_percentage?: number | null
          status?: Database["public"]["Enums"]["plot_status"] | null
          updated_at?: string | null
          variety?: string | null
        }
        Update: {
          age_years?: number | null
          area_ha?: number | null
          created_at?: string | null
          crop_stage?: Database["public"]["Enums"]["crop_stage"] | null
          estimated_harvest_date?: string | null
          farm_id?: string
          fertilization_date?: string | null
          id?: string
          last_flowering_date?: string | null
          metadata?: Json | null
          name?: string
          plant_density_per_ha?: number | null
          polygon?: unknown
          shade_percentage?: number | null
          status?: Database["public"]["Enums"]["plot_status"] | null
          updated_at?: string | null
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plots_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_participantes: {
        Row: {
          cantidad: number
          created_at: string | null
          pool_id: string
          usuario_id: string
        }
        Insert: {
          cantidad: number
          created_at?: string | null
          pool_id: string
          usuario_id: string
        }
        Update: {
          cantidad?: number
          created_at?: string | null
          pool_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_participantes_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_participantes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_participants: {
        Row: {
          created_at: string | null
          pool_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          pool_id: string
          quantity: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          pool_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_participants_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "purchase_pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pools_compra: {
        Row: {
          cantidad_minima: number
          cantidad_total: number | null
          created_at: string | null
          departamento: string
          estado: string | null
          fecha_limite: string
          id: string
          municipio: string
          precio_objetivo: number | null
          producto_id: string
        }
        Insert: {
          cantidad_minima: number
          cantidad_total?: number | null
          created_at?: string | null
          departamento: string
          estado?: string | null
          fecha_limite: string
          id?: string
          municipio: string
          precio_objetivo?: number | null
          producto_id: string
        }
        Update: {
          cantidad_minima?: number
          cantidad_total?: number | null
          created_at?: string | null
          departamento?: string
          estado?: string | null
          fecha_limite?: string
          id?: string
          municipio?: string
          precio_objetivo?: number | null
          producto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pools_compra_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      precios: {
        Row: {
          actualizado_at: string | null
          almacen_id: string
          created_at: string | null
          disponible: boolean | null
          id: string
          origen: Database["public"]["Enums"]["precio_origen"]
          precio_por_kg_nutriente: number | null
          precio_unitario: number
          producto_id: string
          stock_cantidad: number | null
          vigente_hasta: string | null
        }
        Insert: {
          actualizado_at?: string | null
          almacen_id: string
          created_at?: string | null
          disponible?: boolean | null
          id?: string
          origen?: Database["public"]["Enums"]["precio_origen"]
          precio_por_kg_nutriente?: number | null
          precio_unitario: number
          producto_id: string
          stock_cantidad?: number | null
          vigente_hasta?: string | null
        }
        Update: {
          actualizado_at?: string | null
          almacen_id?: string
          created_at?: string | null
          disponible?: boolean | null
          id?: string
          origen?: Database["public"]["Enums"]["precio_origen"]
          precio_por_kg_nutriente?: number | null
          precio_unitario?: number
          producto_id?: string
          stock_cantidad?: number | null
          vigente_hasta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precios_almacen_id_fkey"
            columns: ["almacen_id"]
            isOneToOne: false
            referencedRelation: "almacenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precios_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      precios_historial: {
        Row: {
          almacen_id: string
          id: string
          origen: Database["public"]["Enums"]["precio_origen"]
          precio_unitario: number
          producto_id: string
          registrado_at: string | null
        }
        Insert: {
          almacen_id: string
          id?: string
          origen: Database["public"]["Enums"]["precio_origen"]
          precio_unitario: number
          producto_id: string
          registrado_at?: string | null
        }
        Update: {
          almacen_id?: string
          id?: string
          origen?: Database["public"]["Enums"]["precio_origen"]
          precio_unitario?: number
          producto_id?: string
          registrado_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precios_historial_almacen_id_fkey"
            columns: ["almacen_id"]
            isOneToOne: false
            referencedRelation: "almacenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precios_historial_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      precios_referencia: {
        Row: {
          created_at: string | null
          departamento: string | null
          fecha_reporte: string
          fuente: string | null
          id: string
          precio_maximo: number | null
          precio_minimo: number | null
          precio_promedio: number | null
          producto_nombre: string
        }
        Insert: {
          created_at?: string | null
          departamento?: string | null
          fecha_reporte: string
          fuente?: string | null
          id?: string
          precio_maximo?: number | null
          precio_minimo?: number | null
          precio_promedio?: number | null
          producto_nombre: string
        }
        Update: {
          created_at?: string | null
          departamento?: string | null
          fecha_reporte?: string
          fuente?: string | null
          id?: string
          precio_maximo?: number | null
          precio_minimo?: number | null
          precio_promedio?: number | null
          producto_nombre?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          id: string
          origin: Database["public"]["Enums"]["price_origin"]
          product_id: string
          recorded_at: string | null
          unit_price: number
          warehouse_id: string
        }
        Insert: {
          id?: string
          origin: Database["public"]["Enums"]["price_origin"]
          product_id: string
          recorded_at?: string | null
          unit_price: number
          warehouse_id: string
        }
        Update: {
          id?: string
          origin?: Database["public"]["Enums"]["price_origin"]
          product_id?: string
          recorded_at?: string | null
          unit_price?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          created_at: string | null
          id: string
          is_available: boolean | null
          origin: Database["public"]["Enums"]["price_origin"]
          price_per_nutrient_kg: number | null
          product_id: string
          stock_quantity: number | null
          unit_price: number
          updated_at: string | null
          valid_until: string | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          origin?: Database["public"]["Enums"]["price_origin"]
          price_per_nutrient_kg?: number | null
          product_id: string
          stock_quantity?: number | null
          unit_price: number
          updated_at?: string | null
          valid_until?: string | null
          warehouse_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          origin?: Database["public"]["Enums"]["price_origin"]
          price_per_nutrient_kg?: number | null
          product_id?: string
          stock_quantity?: number | null
          unit_price?: number
          updated_at?: string | null
          valid_until?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prices_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          activo: boolean | null
          categoria_id: string | null
          composicion: Json | null
          created_at: string | null
          descripcion: string | null
          id: string
          imagen_url: string | null
          marca: string | null
          metadata: Json | null
          nombre: string
          nombre_corto: string | null
          peso_kg: number | null
          presentacion: string | null
          sector: Database["public"]["Enums"]["sector_tipo"]
          unidad_medida: string
        }
        Insert: {
          activo?: boolean | null
          categoria_id?: string | null
          composicion?: Json | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          marca?: string | null
          metadata?: Json | null
          nombre: string
          nombre_corto?: string | null
          peso_kg?: number | null
          presentacion?: string | null
          sector?: Database["public"]["Enums"]["sector_tipo"]
          unidad_medida: string
        }
        Update: {
          activo?: boolean | null
          categoria_id?: string | null
          composicion?: Json | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          marca?: string | null
          metadata?: Json | null
          nombre?: string
          nombre_corto?: string | null
          peso_kg?: number | null
          presentacion?: string | null
          sector?: Database["public"]["Enums"]["sector_tipo"]
          unidad_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          brand: string | null
          category_id: string | null
          composition: Json | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          presentation: string | null
          sector: Database["public"]["Enums"]["sector_type"]
          short_name: string | null
          unit_of_measure: string
          weight_kg: number | null
        }
        Insert: {
          active?: boolean | null
          brand?: string | null
          category_id?: string | null
          composition?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          presentation?: string | null
          sector?: Database["public"]["Enums"]["sector_type"]
          short_name?: string | null
          unit_of_measure: string
          weight_kg?: number | null
        }
        Update: {
          active?: boolean | null
          brand?: string | null
          category_id?: string | null
          composition?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          presentation?: string | null
          sector?: Database["public"]["Enums"]["sector_type"]
          short_name?: string | null
          unit_of_measure?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_pools: {
        Row: {
          created_at: string | null
          deadline: string
          department: string
          id: string
          minimum_quantity: number
          municipality: string
          product_id: string
          state: string | null
          target_price: number | null
          total_quantity: number | null
        }
        Insert: {
          created_at?: string | null
          deadline: string
          department: string
          id?: string
          minimum_quantity: number
          municipality: string
          product_id: string
          state?: string | null
          target_price?: number | null
          total_quantity?: number | null
        }
        Update: {
          created_at?: string | null
          deadline?: string
          department?: string
          id?: string
          minimum_quantity?: number
          municipality?: string
          product_id?: string
          state?: string | null
          target_price?: number | null
          total_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_pools_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_prices: {
        Row: {
          avg_price: number | null
          created_at: string | null
          department: string | null
          id: string
          max_price: number | null
          min_price: number | null
          product_name: string
          report_date: string
          source: string | null
        }
        Insert: {
          avg_price?: number | null
          created_at?: string | null
          department?: string | null
          id?: string
          max_price?: number | null
          min_price?: number | null
          product_name: string
          report_date: string
          source?: string | null
        }
        Update: {
          avg_price?: number | null
          created_at?: string | null
          department?: string | null
          id?: string
          max_price?: number | null
          min_price?: number | null
          product_name?: string
          report_date?: string
          source?: string | null
        }
        Relationships: []
      }
      soil_analysis: {
        Row: {
          aluminum: number | null
          analysis_date: string | null
          boron: number | null
          calcium: number | null
          cec: number | null
          copper: number | null
          created_at: string | null
          electrical_conductivity: number | null
          farm_id: string
          id: string
          image_url: string | null
          input_channel: Database["public"]["Enums"]["channel"] | null
          interpretation: Json | null
          iron: number | null
          lab_name: string | null
          magnesium: number | null
          manganese: number | null
          nitrogen: number | null
          organic_matter: number | null
          ph: number | null
          phosphorus: number | null
          plot_id: string | null
          potassium: number | null
          recommendation: Json | null
          recommendation_text: string | null
          registered_at: string | null
          sodium: number | null
          sulfur: number | null
          user_id: string
          zinc: number | null
        }
        Insert: {
          aluminum?: number | null
          analysis_date?: string | null
          boron?: number | null
          calcium?: number | null
          cec?: number | null
          copper?: number | null
          created_at?: string | null
          electrical_conductivity?: number | null
          farm_id: string
          id?: string
          image_url?: string | null
          input_channel?: Database["public"]["Enums"]["channel"] | null
          interpretation?: Json | null
          iron?: number | null
          lab_name?: string | null
          magnesium?: number | null
          manganese?: number | null
          nitrogen?: number | null
          organic_matter?: number | null
          ph?: number | null
          phosphorus?: number | null
          plot_id?: string | null
          potassium?: number | null
          recommendation?: Json | null
          recommendation_text?: string | null
          registered_at?: string | null
          sodium?: number | null
          sulfur?: number | null
          user_id: string
          zinc?: number | null
        }
        Update: {
          aluminum?: number | null
          analysis_date?: string | null
          boron?: number | null
          calcium?: number | null
          cec?: number | null
          copper?: number | null
          created_at?: string | null
          electrical_conductivity?: number | null
          farm_id?: string
          id?: string
          image_url?: string | null
          input_channel?: Database["public"]["Enums"]["channel"] | null
          interpretation?: Json | null
          iron?: number | null
          lab_name?: string | null
          magnesium?: number | null
          manganese?: number | null
          nitrogen?: number | null
          organic_matter?: number | null
          ph?: number | null
          phosphorus?: number | null
          plot_id?: string | null
          potassium?: number | null
          recommendation?: Json | null
          recommendation_text?: string | null
          registered_at?: string | null
          sodium?: number | null
          sulfur?: number | null
          user_id?: string
          zinc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "soil_analysis_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soil_analysis_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soil_analysis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      traceability: {
        Row: {
          active: boolean | null
          certificate_url: string | null
          coordinates_verified: boolean | null
          created_at: string | null
          deforestation_verified: boolean | null
          good_practices: Json | null
          harvest_period: string | null
          id: string
          plot_id: string
          qr_code: string | null
          satellite_verification_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          certificate_url?: string | null
          coordinates_verified?: boolean | null
          created_at?: string | null
          deforestation_verified?: boolean | null
          good_practices?: Json | null
          harvest_period?: string | null
          id?: string
          plot_id: string
          qr_code?: string | null
          satellite_verification_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          certificate_url?: string | null
          coordinates_verified?: boolean | null
          created_at?: string | null
          deforestation_verified?: boolean | null
          good_practices?: Json | null
          harvest_period?: string | null
          id?: string
          plot_id?: string
          qr_code?: string | null
          satellite_verification_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "traceability_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traceability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trazabilidad: {
        Row: {
          activo: boolean | null
          buenas_practicas: Json | null
          certificado_url: string | null
          coordenadas_verificadas: boolean | null
          created_at: string | null
          deforestacion_verificada: boolean | null
          fecha_verificacion_satelital: string | null
          id: string
          lote_id: string
          periodo_cosecha: string | null
          qr_code: string | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          activo?: boolean | null
          buenas_practicas?: Json | null
          certificado_url?: string | null
          coordenadas_verificadas?: boolean | null
          created_at?: string | null
          deforestacion_verificada?: boolean | null
          fecha_verificacion_satelital?: string | null
          id?: string
          lote_id: string
          periodo_cosecha?: string | null
          qr_code?: string | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          activo?: boolean | null
          buenas_practicas?: Json | null
          certificado_url?: string | null
          coordenadas_verificadas?: boolean | null
          created_at?: string | null
          deforestacion_verificada?: boolean | null
          fecha_verificacion_satelital?: string | null
          id?: string
          lote_id?: string
          periodo_cosecha?: string | null
          qr_code?: string | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trazabilidad_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trazabilidad_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          coffee_registry_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          national_id: string | null
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          sector: Database["public"]["Enums"]["sector_type"]
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          coffee_registry_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          national_id?: string | null
          phone: string
          role?: Database["public"]["Enums"]["user_role"]
          sector?: Database["public"]["Enums"]["sector_type"]
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          coffee_registry_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          national_id?: string | null
          phone?: string
          role?: Database["public"]["Enums"]["user_role"]
          sector?: Database["public"]["Enums"]["sector_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          activo: boolean | null
          avatar_url: string | null
          cedula: string | null
          cedula_cafetera: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          nombre: string
          rol: Database["public"]["Enums"]["usuario_rol"]
          sector: Database["public"]["Enums"]["sector_tipo"]
          telefono: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          avatar_url?: string | null
          cedula?: string | null
          cedula_cafetera?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          nombre: string
          rol?: Database["public"]["Enums"]["usuario_rol"]
          sector?: Database["public"]["Enums"]["sector_tipo"]
          telefono: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          avatar_url?: string | null
          cedula?: string | null
          cedula_cafetera?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          nombre?: string
          rol?: Database["public"]["Enums"]["usuario_rol"]
          sector?: Database["public"]["Enums"]["sector_tipo"]
          telefono?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          accepts_digital_orders: boolean | null
          active: boolean | null
          address: string | null
          commission_percentage: number | null
          created_at: string | null
          department: string
          email: string | null
          hours_text: string | null
          id: string
          location: unknown
          metadata: Json | null
          municipality: string
          name: string
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          accepts_digital_orders?: boolean | null
          active?: boolean | null
          address?: string | null
          commission_percentage?: number | null
          created_at?: string | null
          department: string
          email?: string | null
          hours_text?: string | null
          id?: string
          location?: unknown
          metadata?: Json | null
          municipality: string
          name: string
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          accepts_digital_orders?: boolean | null
          active?: boolean | null
          address?: string | null
          commission_percentage?: number | null
          created_at?: string | null
          department?: string
          email?: string | null
          hours_text?: string | null
          id?: string
          location?: unknown
          metadata?: Json | null
          municipality?: string
          name?: string
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      disablelongtransactions: { Args: never; Returns: string }
      distance_km: {
        Args: { point1: unknown; point2: unknown }
        Returns: number
      }
      distancia_km: {
        Args: { punto1: unknown; punto2: unknown }
        Returns: number
      }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      gettransactionid: { Args: never; Returns: unknown }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      alert_type:
        | "weather"
        | "pest"
        | "price"
        | "fertilization"
        | "harvest"
        | "general"
      alerta_tipo:
        | "clima"
        | "plaga"
        | "precio"
        | "fertilizacion"
        | "cosecha"
        | "general"
      channel: "whatsapp" | "pwa"
      conversacion_canal: "whatsapp" | "pwa"
      crop_stage: "nursery" | "establishment" | "production" | "stump"
      cultivo_etapa: "almacigo" | "levante" | "produccion" | "zoca"
      expense_category:
        | "fertilizer"
        | "agrochemical"
        | "tool"
        | "labor"
        | "transport"
        | "seed"
        | "other"
      gasto_categoria:
        | "fertilizante"
        | "agroquimico"
        | "herramienta"
        | "mano_de_obra"
        | "transporte"
        | "semilla"
        | "otro"
      lote_estado:
        | "recien_sembrado"
        | "en_produccion"
        | "para_renovar"
        | "renovado"
      nutrient_level: "low" | "medium" | "high"
      nutriente_nivel: "bajo" | "medio" | "alto"
      order_status:
        | "pending"
        | "confirmed"
        | "rejected"
        | "delivered"
        | "cancelled"
      pedido_estado:
        | "pendiente"
        | "confirmado"
        | "rechazado"
        | "entregado"
        | "cancelado"
      plot_status:
        | "newly_planted"
        | "in_production"
        | "due_for_renewal"
        | "renewed"
      precio_origen:
        | "manual"
        | "foto_whatsapp"
        | "integracion_api"
        | "referencia_sipsa"
      price_origin:
        | "manual"
        | "whatsapp_photo"
        | "api_integration"
        | "sipsa_reference"
      sector_tipo: "cafe" | "ganaderia" | "cacao" | "otro"
      sector_type: "coffee" | "livestock" | "cocoa" | "other"
      user_role: "farmer" | "warehouse" | "admin" | "cooperative"
      usuario_rol: "caficultor" | "almacen" | "admin" | "cooperativa"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_type: [
        "weather",
        "pest",
        "price",
        "fertilization",
        "harvest",
        "general",
      ],
      alerta_tipo: [
        "clima",
        "plaga",
        "precio",
        "fertilizacion",
        "cosecha",
        "general",
      ],
      channel: ["whatsapp", "pwa"],
      conversacion_canal: ["whatsapp", "pwa"],
      crop_stage: ["nursery", "establishment", "production", "stump"],
      cultivo_etapa: ["almacigo", "levante", "produccion", "zoca"],
      expense_category: [
        "fertilizer",
        "agrochemical",
        "tool",
        "labor",
        "transport",
        "seed",
        "other",
      ],
      gasto_categoria: [
        "fertilizante",
        "agroquimico",
        "herramienta",
        "mano_de_obra",
        "transporte",
        "semilla",
        "otro",
      ],
      lote_estado: [
        "recien_sembrado",
        "en_produccion",
        "para_renovar",
        "renovado",
      ],
      nutrient_level: ["low", "medium", "high"],
      nutriente_nivel: ["bajo", "medio", "alto"],
      order_status: [
        "pending",
        "confirmed",
        "rejected",
        "delivered",
        "cancelled",
      ],
      pedido_estado: [
        "pendiente",
        "confirmado",
        "rechazado",
        "entregado",
        "cancelado",
      ],
      plot_status: [
        "newly_planted",
        "in_production",
        "due_for_renewal",
        "renewed",
      ],
      precio_origen: [
        "manual",
        "foto_whatsapp",
        "integracion_api",
        "referencia_sipsa",
      ],
      price_origin: [
        "manual",
        "whatsapp_photo",
        "api_integration",
        "sipsa_reference",
      ],
      sector_tipo: ["cafe", "ganaderia", "cacao", "otro"],
      sector_type: ["coffee", "livestock", "cocoa", "other"],
      user_role: ["farmer", "warehouse", "admin", "cooperative"],
      usuario_rol: ["caficultor", "almacen", "admin", "cooperativa"],
    },
  },
} as const
