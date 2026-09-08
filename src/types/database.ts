// Auto-generated from the live Supabase schema (project: ag-fresh-eggs / esonknehxriqmpqwkvjl).
// Regenerate with the Supabase MCP `generate_typescript_types` tool after any migration.
// Do not hand-edit table shapes here — add app-level types in `src/types/domain.ts` instead.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          created_at: string
          customer_phone: string
          distance_km: number | null
          full_address: string
          id: string
          is_default: boolean
          is_within_zone: boolean
          label: string
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          created_at?: string
          customer_phone: string
          distance_km?: number | null
          full_address: string
          id?: string
          is_default?: boolean
          is_within_zone?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          created_at?: string
          customer_phone?: string
          distance_km?: number | null
          full_address?: string
          id?: string
          is_default?: boolean
          is_within_zone?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_phone_fkey"
            columns: ["customer_phone"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["phone"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string
        }
        Relationships: []
      }
      chat_logs: {
        Row: {
          created_at: string
          id: string
          message: string
          resolved: boolean
          role: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          resolved?: boolean
          role: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          resolved?: boolean
          role?: string
          session_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          business_discount_pct: number
          created_at: string
          credit_balance: number
          is_business: boolean
          manual_rewards_issued: number
          name: string | null
          phone: string
          referral_code: string | null
          referral_discount_used: boolean
          referred_by: string | null
        }
        Insert: {
          business_discount_pct?: number
          created_at?: string
          credit_balance?: number
          is_business?: boolean
          manual_rewards_issued?: number
          name?: string | null
          phone: string
          referral_code?: string | null
          referral_discount_used?: boolean
          referred_by?: string | null
        }
        Update: {
          business_discount_pct?: number
          created_at?: string
          credit_balance?: number
          is_business?: boolean
          manual_rewards_issued?: number
          name?: string | null
          phone?: string
          referral_code?: string | null
          referral_discount_used?: boolean
          referred_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["phone"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          id: string
          keywords: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          id?: string
          keywords: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          id?: string
          keywords?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          order_id: string
          status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          order_id: string
          status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          discount: number
          distance_km: number | null
          id: string
          items: Json
          order_number: number
          payment_method: string
          payment_status: string
          razorpay_payment_id: string | null
          status: string
          subtotal: number
          total: number
        }
        Insert: {
          address: string
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number
          distance_km?: number | null
          id?: string
          items: Json
          order_number?: never
          payment_method?: string
          payment_status?: string
          razorpay_payment_id?: string | null
          status?: string
          subtotal: number
          total: number
        }
        Update: {
          address?: string
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number
          distance_km?: number | null
          id?: string
          items?: Json
          order_number?: never
          payment_method?: string
          payment_status?: string
          razorpay_payment_id?: string | null
          status?: string
          subtotal?: number
          total?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          order_id: string
          raw_webhook_payload: Json | null
          razorpay_order_id: string
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          order_id: string
          raw_webhook_payload?: Json | null
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string
          raw_webhook_payload?: Json | null
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          changed_at: string
          id: string
          new_price: number | null
          old_price: number | null
          pack_label: string | null
          product_id: string | null
        }
        Insert: {
          changed_at?: string
          id?: string
          new_price?: number | null
          old_price?: number | null
          pack_label?: string | null
          product_id?: string | null
        }
        Update: {
          changed_at?: string
          id?: string
          new_price?: number | null
          old_price?: number | null
          pack_label?: string | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          business_price: number | null
          id: string
          in_stock: boolean
          low_stock_threshold: number
          pack_label: string
          pieces: number
          price: number
          sort_order: number
          stock_qty: number | null
          updated_at: string
        }
        Insert: {
          business_price?: number | null
          id?: string
          in_stock?: boolean
          low_stock_threshold?: number
          pack_label: string
          pieces: number
          price: number
          sort_order?: number
          stock_qty?: number | null
          updated_at?: string
        }
        Update: {
          business_price?: number | null
          id?: string
          in_stock?: boolean
          low_stock_threshold?: number
          pack_label?: string
          pieces?: number
          price?: number
          sort_order?: number
          stock_qty?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      // Hand-added ahead of the live schema — run the migration in
      // PLAY_STORE_DEPLOYMENT.md / the FCM setup notes, then regenerate this file with
      // the Supabase MCP `generate_typescript_types` tool to replace this block for real.
      push_tokens: {
        Row: {
          created_at: string
          fcm_token: string
          id: string
          phone: string
          platform: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fcm_token: string
          id?: string
          phone: string
          platform?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fcm_token?: string
          id?: string
          phone?: string
          platform?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          active: boolean
          created_at: string
          customer_name: string | null
          discount_pct: number
          frequency: string
          id: string
          pack_label: string
          phone: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          customer_name?: string | null
          discount_pct?: number
          frequency?: string
          id?: string
          pack_label: string
          phone?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          customer_name?: string | null
          discount_pct?: number
          frequency?: string
          id?: string
          pack_label?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_phone_fkey"
            columns: ["phone"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["phone"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
