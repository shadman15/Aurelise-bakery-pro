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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string | null
          county: string | null
          created_at: string
          id: string
          is_default: boolean | null
          postcode: string
          street: string
          type: Database["public"]["Enums"]["address_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string | null
          county?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          postcode: string
          street: string
          type?: Database["public"]["Enums"]["address_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string | null
          county?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          postcode?: string
          street?: string
          type?: Database["public"]["Enums"]["address_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          customizations: Json | null
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          size: string
        }
        Insert: {
          created_at?: string
          customizations?: Json | null
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          size: string
        }
        Update: {
          created_at?: string
          customizations?: Json | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          size?: string
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
          allergen_acknowledged: boolean | null
          created_at: string
          currency: string | null
          customer_info: Json
          delivery_address: Json | null
          delivery_date: string
          delivery_fee: number | null
          delivery_time: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          id: string
          order_date: string
          order_number: string
          payment_intent_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          special_instructions: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number | null
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          allergen_acknowledged?: boolean | null
          created_at?: string
          currency?: string | null
          customer_info: Json
          delivery_address?: Json | null
          delivery_date: string
          delivery_fee?: number | null
          delivery_time?: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          id?: string
          order_date: string
          order_number: string
          payment_intent_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          allergen_acknowledged?: boolean | null
          created_at?: string
          currency?: string | null
          customer_info?: Json
          delivery_address?: Json | null
          delivery_date?: string
          delivery_fee?: number | null
          delivery_time?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          id?: string
          order_date?: string
          order_number?: string
          payment_intent_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_sizes: {
        Row: {
          created_at: string
          id: string
          is_available: boolean | null
          price: number
          product_id: string
          size: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean | null
          price: number
          product_id: string
          size: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean | null
          price?: number
          product_id?: string
          size?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          allergens: string[] | null
          category_id: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          ingredients: string[] | null
          name: string
          short_description: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          allergens?: string[] | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          ingredients?: string[] | null
          name: string
          short_description?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          allergens?: string[] | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          ingredients?: string[] | null
          name?: string
          short_description?: string | null
          slug?: string
          updated_at?: string
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
      profiles: {
        Row: {
          created_at: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean | null
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean | null
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          type: Database["public"]["Enums"]["setting_type"]
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          type?: Database["public"]["Enums"]["setting_type"]
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          type?: Database["public"]["Enums"]["setting_type"]
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      address_type: "HOME" | "WORK" | "OTHER"
      delivery_type: "PICKUP" | "DELIVERY"
      order_status:
        | "PENDING"
        | "CONFIRMED"
        | "PREPARING"
        | "READY"
        | "COMPLETED"
        | "CANCELLED"
      payment_status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
      setting_type: "TEXT" | "NUMBER" | "BOOLEAN" | "JSON"
      user_role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
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
      address_type: ["HOME", "WORK", "OTHER"],
      delivery_type: ["PICKUP", "DELIVERY"],
      order_status: [
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "COMPLETED",
        "CANCELLED",
      ],
      payment_status: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      setting_type: ["TEXT", "NUMBER", "BOOLEAN", "JSON"],
      user_role: ["CUSTOMER", "ADMIN", "SUPER_ADMIN"],
    },
  },
} as const
