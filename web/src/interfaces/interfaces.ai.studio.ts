export interface AISFlow {
  flow: {
    id: string
    created_at: number
    created_by: string
    updated_at: number
    updated_by: string
    deleted_at: null | string
    display_name: string
    version: number
    account_id: string
    public: boolean
    status: string
    template: boolean
    template_group: null | string
    use_case: null | string
    cloned_from: null | string
    cb_tile_metadata: null | string
    description: null | string
    agent_widget_enabled: boolean
    agent_widget_skills: string[]
  }
  etag: string
}
