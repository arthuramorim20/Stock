export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      entradas_estoque: {
        Row: {
          data_entrada: string | null
          id: number
          origem: string | null
          produto_id: number | null
          quantidade: number
        }
        Insert: {
          data_entrada?: string | null
          id?: number
          origem?: string | null
          produto_id?: number | null
          quantidade: number
        }
        Update: {
          data_entrada?: string | null
          id?: number
          origem?: string | null
          produto_id?: number | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "entradas_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria: string | null
          criado_em: string | null
          descricao: string | null
          estoque: number | null
          id: number
          nome: string
          preco: number
          sku: string
        }
        Insert: {
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          estoque?: number | null
          id?: number
          nome: string
          preco: number
          sku: string
        }
        Update: {
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          estoque?: number | null
          id?: number
          nome?: string
          preco?: number
          sku?: string
        }
        Relationships: []
      }
      saidas_estoque: {
        Row: {
          data_saida: string | null
          destino: string | null
          id: number
          produto_id: number | null
          quantidade: number
        }
        Insert: {
          data_saida?: string | null
          destino?: string | null
          id?: number
          produto_id?: number | null
          quantidade: number
        }
        Update: {
          data_saida?: string | null
          destino?: string | null
          id?: number
          produto_id?: number | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "saidas_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_estoque: {
        Args: { p_id: number; p_novo_estoque: number }
        Returns: undefined
      }
      buscar_por_sku: {
        Args: { p_sku: string }
        Returns: {
          categoria: string | null
          criado_em: string | null
          descricao: string | null
          estoque: number | null
          id: number
          nome: string
          preco: number
          sku: string
        }[]
      }
      criar_produto: {
        Args: {
          p_nome: string
          p_descricao: string
          p_preco: number
          p_categoria: string
          p_sku: string
          p_estoque?: number
        }
        Returns: {
          id: number
          nome: string
          preco: number
        }[]
      }
      deletar_entrada_estoque: {
        Args: { p_id: number }
        Returns: undefined
      }
      deletar_produto: {
        Args: { p_id: number }
        Returns: undefined
      }
      listar_entradas_por_periodo: {
        Args: { p_data_inicio: string; p_data_fim: string }
        Returns: {
          data_entrada: string | null
          id: number
          origem: string | null
          produto_id: number | null
          quantidade: number
        }[]
      }
      listar_entradas_por_produto: {
        Args: { p_produto_id: number }
        Returns: {
          data_entrada: string | null
          id: number
          origem: string | null
          produto_id: number | null
          quantidade: number
        }[]
      }
      produtos_estoque_baixo: {
        Args: { limite_estoque?: number }
        Returns: {
          categoria: string | null
          criado_em: string | null
          descricao: string | null
          estoque: number | null
          id: number
          nome: string
          preco: number
          sku: string
        }[]
      }
      registrar_entrada_estoque: {
        Args: { p_produto_id: number; p_quantidade: number; p_origem?: string }
        Returns: {
          id: number
          produto_id: number
          quantidade: number
          data_entrada: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
