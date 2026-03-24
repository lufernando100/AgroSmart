// Manual types — replace with: supabase gen types typescript

export type SectorType = 'coffee' | 'livestock' | 'cocoa' | 'other'
export type UserRole = 'farmer' | 'warehouse' | 'admin' | 'cooperative'
export type OrderStatus = 'pending' | 'confirmed' | 'rejected' | 'delivered' | 'cancelled'
export type PriceOrigin =
  | 'manual'
  | 'whatsapp_photo'
  | 'api_integration'
  | 'sipsa_reference'
export type ExpenseCategory =
  | 'fertilizer'
  | 'agrochemical'
  | 'tool'
  | 'labor'
  | 'transport'
  | 'seed'
  | 'other'
export type CropStage = 'nursery' | 'establishment' | 'production' | 'stump'
export type PlotStatus =
  | 'newly_planted'
  | 'in_production'
  | 'due_for_renewal'
  | 'renewed'
export type AlertType =
  | 'weather'
  | 'pest'
  | 'price'
  | 'fertilization'
  | 'harvest'
  | 'general'
export type Channel = 'whatsapp' | 'pwa'
export type NutrientLevel = 'low' | 'medium' | 'high'

export interface User {
  id: string
  phone: string
  name: string
  national_id?: string
  coffee_registry_id?: string
  role: UserRole
  sector: SectorType
  avatar_url?: string
  active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Farm {
  id: string
  user_id: string
  name: string
  vereda?: string
  municipality: string
  department: string
  altitude_masl?: number
  location?: unknown
  total_area_ha?: number
  created_at: string
  updated_at: string
}

export interface Plot {
  id: string
  farm_id: string
  name: string
  variety?: string
  age_years?: number
  plant_density_per_ha?: number
  shade_percentage?: number
  area_ha?: number
  status: PlotStatus
  polygon?: unknown
  crop_stage: CropStage
  last_flowering_date?: string
  estimated_harvest_date?: string
  fertilization_date?: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  sector: SectorType
  icon?: string
  sort_order: number
  active: boolean
}

export interface Warehouse {
  id: string
  user_id?: string
  name: string
  tax_id?: string
  whatsapp_phone?: string
  email?: string
  municipality: string
  department: string
  address?: string
  location?: unknown
  hours_text?: string
  accepts_digital_orders: boolean
  commission_percentage: number
  active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  category_id?: string
  name: string
  short_name?: string
  brand?: string
  presentation?: string
  unit_of_measure: string
  weight_kg?: number
  composition?: Record<string, number>
  description?: string
  image_url?: string
  sector: SectorType
  active: boolean
  metadata: Record<string, unknown>
  created_at: string
}

export interface Price {
  id: string
  product_id: string
  warehouse_id: string
  unit_price: number
  price_per_nutrient_kg?: number
  is_available: boolean
  stock_quantity?: number
  origin: PriceOrigin
  valid_until?: string
  updated_at: string
  created_at: string
}

/** Stored in orders.metadata (JSONB) — keys in English */
export type OrderMetadataFarmerWhatsappNotify = {
  at: string
  status: 'sent' | 'failed' | 'skipped_no_phone'
}

export interface Order {
  id: string
  order_number: string
  farmer_id: string
  warehouse_id: string
  status: OrderStatus
  channel: Channel
  subtotal: number
  commission: number
  total: number
  warehouse_confirmed_price?: number
  notes?: string
  warehouse_notes?: string
  confirmed_at?: string
  delivered_at?: string
  created_at: string
  updated_at: string
  /** Extensible JSON — see database/11_orders_metadata.sql */
  metadata?: Record<string, unknown>
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface SoilAnalysis {
  id: string
  plot_id?: string
  farm_id: string
  user_id: string
  lab_name?: string
  analysis_date?: string
  registered_at: string
  image_url?: string
  input_channel?: Channel
  ph?: number
  organic_matter?: number
  nitrogen?: number
  phosphorus?: number
  potassium?: number
  calcium?: number
  magnesium?: number
  aluminum?: number
  sodium?: number
  sulfur?: number
  iron?: number
  copper?: number
  manganese?: number
  zinc?: number
  boron?: number
  cec?: number
  electrical_conductivity?: number
  interpretation?: Record<string, string>
  recommendation?: Record<string, unknown>
  recommendation_text?: string
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  farm_id?: string
  plot_id?: string
  order_id?: string
  category: ExpenseCategory
  description?: string
  amount: number
  expense_date: string
  supplier?: string
  invoice_image_url?: string
  invoice_data?: Record<string, unknown>
  source: string
  created_at: string
}

export interface FloweringRecord {
  id: string
  plot_id: string
  user_id: string
  flowering_date: string
  intensity?: 'alta' | 'media' | 'baja'
  image_url?: string
  estimated_harvest_date?: string
  fertilization_date?: string
  borer_critical_period_start?: string
  notes?: string
  created_at: string
}
