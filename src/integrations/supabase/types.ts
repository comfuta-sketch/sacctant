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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          aceita_contrato: boolean
          agencia: string | null
          bairro: string | null
          banco: string | null
          cep: string | null
          conta_ou_pix: string | null
          cpf: string
          created_at: string
          dados_completos: Json
          data_nascimento: string | null
          documentos_marcados: Json | null
          email: string
          id: string
          logradouro: string | null
          nome: string
          numero: string | null
          observacoes: string | null
          ocupacao: string | null
          status: Database["public"]["Enums"]["status_servico"]
          telefone: string
          titulo_eleitor: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aceita_contrato?: boolean
          agencia?: string | null
          bairro?: string | null
          banco?: string | null
          cep?: string | null
          conta_ou_pix?: string | null
          cpf: string
          created_at?: string
          dados_completos?: Json
          data_nascimento?: string | null
          documentos_marcados?: Json | null
          email: string
          id?: string
          logradouro?: string | null
          nome: string
          numero?: string | null
          observacoes?: string | null
          ocupacao?: string | null
          status?: Database["public"]["Enums"]["status_servico"]
          telefone: string
          titulo_eleitor?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aceita_contrato?: boolean
          agencia?: string | null
          bairro?: string | null
          banco?: string | null
          cep?: string | null
          conta_ou_pix?: string | null
          cpf?: string
          created_at?: string
          dados_completos?: Json
          data_nascimento?: string | null
          documentos_marcados?: Json | null
          email?: string
          id?: string
          logradouro?: string | null
          nome?: string
          numero?: string | null
          observacoes?: string | null
          ocupacao?: string | null
          status?: Database["public"]["Enums"]["status_servico"]
          telefone?: string
          titulo_eleitor?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contratos: {
        Row: {
          assinado_em: string | null
          assinatura_base64: string | null
          cliente_id: string
          created_at: string
          dados_preenchidos: Json
          enviado_em: string | null
          id: string
          modelo_storage_path: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
          visualizado_em: string | null
        }
        Insert: {
          assinado_em?: string | null
          assinatura_base64?: string | null
          cliente_id: string
          created_at?: string
          dados_preenchidos?: Json
          enviado_em?: string | null
          id?: string
          modelo_storage_path?: string | null
          status?: string
          tipo?: string
          titulo: string
          updated_at?: string
          user_id: string
          visualizado_em?: string | null
        }
        Update: {
          assinado_em?: string | null
          assinatura_base64?: string | null
          cliente_id?: string
          created_at?: string
          dados_preenchidos?: Json
          enviado_em?: string | null
          id?: string
          modelo_storage_path?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
          visualizado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          cliente_id: string
          created_at: string
          id: string
          mime_type: string | null
          nome_arquivo: string
          storage_path: string
          tamanho_bytes: number | null
          tipo: string
          uploaded_by: string | null
          user_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          id?: string
          mime_type?: string | null
          nome_arquivo: string
          storage_path: string
          tamanho_bytes?: number | null
          tipo: string
          uploaded_by?: string | null
          user_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          id?: string
          mime_type?: string | null
          nome_arquivo?: string
          storage_path?: string
          tamanho_bytes?: number | null
          tipo?: string
          uploaded_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          consentimento_lgpd_em: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          consentimento_lgpd_em?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          consentimento_lgpd_em?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      solicitacao_mensagens: {
        Row: {
          autor_id: string
          autor_tipo: string
          created_at: string
          id: string
          mensagem: string
          nome_arquivo: string | null
          solicitacao_id: string
          storage_path: string | null
        }
        Insert: {
          autor_id: string
          autor_tipo?: string
          created_at?: string
          id?: string
          mensagem?: string
          nome_arquivo?: string | null
          solicitacao_id: string
          storage_path?: string | null
        }
        Update: {
          autor_id?: string
          autor_tipo?: string
          created_at?: string
          id?: string
          mensagem?: string
          nome_arquivo?: string | null
          solicitacao_id?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacao_mensagens_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes: {
        Row: {
          assunto: string
          categoria: string
          cliente_id: string | null
          concluida_em: string | null
          created_at: string
          descricao: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assunto: string
          categoria?: string
          cliente_id?: string | null
          concluida_em?: string | null
          created_at?: string
          descricao?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assunto?: string
          categoria?: string
          cliente_id?: string | null
          concluida_em?: string | null
          created_at?: string
          descricao?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      tutoriais: {
        Row: {
          categoria: string | null
          conteudo: string | null
          created_at: string
          descricao: string | null
          id: string
          ordem: number
          publicado: boolean
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          publicado?: boolean
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          publicado?: boolean
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "cliente"
      status_servico: "aguardando_documentos" | "em_analise" | "concluido"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "cliente"],
      status_servico: ["aguardando_documentos", "em_analise", "concluido"],
    },
  },
} as const
