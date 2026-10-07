CREATE TABLE checklist_edit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    checklist_id UUID NOT NULL,

    editor_id UUID,

    changes JSONB NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT checklist_edit_history_checklist_fk
        FOREIGN KEY (checklist_id)
        REFERENCES checklists(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_checklist_edit_history_checklist_id
    ON checklist_edit_history(checklist_id);

CREATE INDEX idx_checklist_edit_history_created_at
    ON checklist_edit_history(created_at);