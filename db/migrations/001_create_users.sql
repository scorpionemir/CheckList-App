CREATE EXTENSION IF NOT EXISTS pgcrypto;


CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username VARCHAR(20) NOT NULL,
    password_hash TEXT NOT NULL,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    father_name VARCHAR(100) NOT NULL,

    national_id VARCHAR(20) NOT NULL,
    mobile VARCHAR(20) NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_username_unique
        UNIQUE (username),

    CONSTRAINT users_national_id_unique
        UNIQUE (national_id),

    CONSTRAINT users_mobile_unique
        UNIQUE (mobile),

    CONSTRAINT users_username_national_id_check
        CHECK (username = national_id)
);