CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    actor_id UUID,

    action VARCHAR(100) NOT NULL,

    target_type VARCHAR(100),
    target_id UUID,

    details JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id
    ON audit_logs(actor_id);

CREATE INDEX idx_audit_logs_action
    ON audit_logs(action);

CREATE INDEX idx_audit_logs_target
    ON audit_logs(target_type, target_id);

CREATE INDEX idx_audit_logs_created_at
    ON audit_logs(created_at);