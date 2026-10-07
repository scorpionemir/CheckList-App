CREATE TABLE checklist_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    checklist_id UUID NOT NULL,
    user_id UUID NOT NULL,
    checklist_type_id UUID NOT NULL,

    checklist_date DATE NOT NULL,
    site_name VARCHAR(300) NOT NULL,

    checklist_data JSONB NOT NULL,

    deleted_by UUID,
    delete_reason TEXT NOT NULL,

    deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT checklist_backups_checklist_fk
        FOREIGN KEY (checklist_id)
        REFERENCES checklists(id)
        ON DELETE RESTRICT,

    CONSTRAINT checklist_backups_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT checklist_backups_type_fk
        FOREIGN KEY (checklist_type_id)
        REFERENCES checklist_types(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_checklist_backups_checklist_id
    ON checklist_backups(checklist_id);

CREATE INDEX idx_checklist_backups_user_id
    ON checklist_backups(user_id);

CREATE INDEX idx_checklist_backups_deleted_at
    ON checklist_backups(deleted_at);