CREATE TABLE checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    checklist_type_id UUID NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'submitted',

    checklist_date DATE NOT NULL,
    site_name VARCHAR(300) NOT NULL,

    data JSONB NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ,

    CONSTRAINT checklists_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT checklists_type_fk
        FOREIGN KEY (checklist_type_id)
        REFERENCES checklist_types(id)
        ON DELETE RESTRICT,

    CONSTRAINT checklists_status_check
        CHECK (status IN ('submitted', 'removed')),

    CONSTRAINT checklists_deleted_at_check
        CHECK (
            (status = 'submitted' AND deleted_at IS NULL)
            OR
            (status = 'removed' AND deleted_at IS NOT NULL)
        )
);

CREATE INDEX idx_checklists_user_id
    ON checklists(user_id);

CREATE INDEX idx_checklists_type_id
    ON checklists(checklist_type_id);

CREATE INDEX idx_checklists_date
    ON checklists(checklist_date);

CREATE INDEX idx_checklists_status
    ON checklists(status);

CREATE INDEX idx_checklists_user_type
    ON checklists(user_id, checklist_type_id);