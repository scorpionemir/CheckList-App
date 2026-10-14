
const pool = require("../db/database");

const getAuditLogs = async (req, res) => {
    try {
        const page = Math.max(
            1,
            Number.parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            100,
            Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
        );

        const offset = (page - 1) * limit;

        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim().slice(0, 200)
                : "";

        const action =
            typeof req.query.action === "string"
                ? req.query.action.trim().slice(0, 100)
                : "";

        const isValidDate = (value) => {
            if (
                typeof value !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(value)
            ) {
                return false;
            }

            const date = new Date(`${value}T00:00:00.000Z`);

            return (
                !Number.isNaN(date.getTime()) &&
                date.toISOString().slice(0, 10) === value
            );
        };

        const from = isValidDate(req.query.from)
            ? req.query.from
            : null;

        const to = isValidDate(req.query.to)
            ? req.query.to
            : null;

        if (from && to && from > to) {
            return res.status(400).json({
                message: "تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.",
            });
        }

        const eventsCte = `
            WITH events AS (
                SELECT
                    al.id,
                    al.actor_id,
                    al.action,
                    al.target_type,
                    al.target_id,
                    al.details,
                    al.created_at,
                    'audit'::text AS source,

                    u.username,
                    u.first_name,
                    u.last_name,

                    COALESCE(c.site_name, cb.site_name) AS site_name,
                    ct.name AS checklist_type_name

                FROM audit_logs al

                LEFT JOIN users u
                    ON u.id = al.actor_id

                LEFT JOIN checklists c
                    ON c.id = al.target_id
                    AND al.target_type = 'checklist'

                LEFT JOIN checklist_backups cb
                    ON cb.checklist_id = al.target_id
                    AND al.target_type = 'checklist'

                LEFT JOIN checklist_types ct
                    ON ct.id = COALESCE(
                        c.checklist_type_id,
                        cb.checklist_type_id
                    )

                UNION ALL

                SELECT
                    eh.id,
                    eh.editor_id AS actor_id,

                    COALESCE(
                        eh.changes->>'action',
                        'checklist.updated'
                    ) AS action,

                    'checklist'::text AS target_type,
                    eh.checklist_id AS target_id,
                    eh.changes AS details,
                    eh.created_at,
                    'edit_history'::text AS source,

                    u.username,
                    u.first_name,
                    u.last_name,

                    COALESCE(c.site_name, cb.site_name) AS site_name,
                    ct.name AS checklist_type_name

                FROM checklist_edit_history eh

                LEFT JOIN users u
                    ON u.id = eh.editor_id

                LEFT JOIN checklists c
                    ON c.id = eh.checklist_id

                LEFT JOIN checklist_backups cb
                    ON cb.checklist_id = eh.checklist_id

                LEFT JOIN checklist_types ct
                    ON ct.id = COALESCE(
                        c.checklist_type_id,
                        cb.checklist_type_id
                    )

                -- رویدادهایی که در audit_logs ثبت شده‌اند
                -- از این بخش حذف می‌شوند تا تکراری نمایش داده نشوند.
                WHERE eh.changes->>'action' IS NULL
            ),

            filtered_events AS (
                SELECT *
                FROM events
                WHERE
                    (
                        $1::text = ''
                        OR COALESCE(username, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(first_name, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(last_name, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(action, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(site_name, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(checklist_type_name, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(target_id::text, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(details::text, '') ILIKE '%' || $1 || '%'
                    )

                    AND (
                        $2::text = ''
                        OR action = $2
                    )

                    AND (
                        $3::date IS NULL
                        OR created_at >= $3::date
                    )

                    AND (
                        $4::date IS NULL
                        OR created_at < ($4::date + INTERVAL '1 day')
                    )
            )
        `;

        const params = [search, action, from, to];

        const countQuery = `
            ${eventsCte}
            SELECT
                COUNT(*)::int AS total,

                COUNT(*) FILTER (
                    WHERE action = 'checklist.updated'
                )::int AS edits,

                COUNT(*) FILTER (
                    WHERE action = 'checklist.deleted'
                )::int AS deletions,

                COUNT(*) FILTER (
                    WHERE action = 'checklist.restored'
                )::int AS restorations

            FROM filtered_events
        `;

        const logsQuery = `
            ${eventsCte}
            SELECT
                id,
                actor_id,
                action,
                target_type,
                target_id,
                details,
                created_at,
                source,
                username,
                first_name,
                last_name,
                site_name,
                checklist_type_name

            FROM filtered_events

            ORDER BY created_at DESC, id DESC

            LIMIT $5
            OFFSET $6
        `;

        const [countResult, logsResult] = await Promise.all([
            pool.query(countQuery, params),
            pool.query(logsQuery, [...params, limit, offset]),
        ]);

        const summaryRow = countResult.rows[0];

        const total = Number(summaryRow.total) || 0;
        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            logs: logsResult.rows,

            pagination: {
                page,
                limit,
                total,
                totalPages,
            },

            summary: {
                total,
                edits: Number(summaryRow.edits) || 0,
                deletions: Number(summaryRow.deletions) || 0,
                restorations: Number(summaryRow.restorations) || 0,
            },
        });
    } catch (error) {
        console.error("Get audit logs error:", error);

        return res.status(500).json({
            message: "Failed to get audit logs",
        });
    }
};

module.exports = {
    getAuditLogs,
};
