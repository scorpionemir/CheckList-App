CREATE TABLE checklist_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    checklist_type_id UUID NOT NULL,

    field_key VARCHAR(100) NOT NULL,
    value VARCHAR(300) NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT checklist_options_type_fk
        FOREIGN KEY (checklist_type_id)
        REFERENCES checklist_types(id)
        ON DELETE RESTRICT,

    CONSTRAINT checklist_options_unique
        UNIQUE (checklist_type_id, field_key, value)
);