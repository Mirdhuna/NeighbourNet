/*
===============================================================================
===============================================================================
*/
-- EXTENSION THAT PROVIDE CRYPTOGRAPHIC FUNCTIONS.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- ============================================================================
-- 1. CLEAN REBUILD
-- ============================================================================
DROP VIEW IF EXISTS vw_frontend_offers CASCADE;
DROP VIEW IF EXISTS vw_frontend_needs CASCADE;

DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS needs CASCADE;
DROP TABLE IF EXISTS activity_history CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS post_status CASCADE;
DROP TYPE IF EXISTS response_status CASCADE;
DROP TYPE IF EXISTS visibility_type CASCADE;

-- ============================================================================
-- REMOVE OLD GEOLOCATION ROUTINES / SIGNATURES
-- ============================================================================
DROP FUNCTION IF EXISTS fn_haversine_km(NUMERIC, NUMERIC, NUMERIC, NUMERIC);
DROP FUNCTION IF EXISTS fn_search_needs_frontend(NUMERIC, NUMERIC, NUMERIC, TEXT, VARCHAR, VARCHAR, BOOLEAN, VARCHAR);
DROP FUNCTION IF EXISTS fn_search_offers_frontend(NUMERIC, NUMERIC, NUMERIC, TEXT, VARCHAR, VARCHAR, BOOLEAN, VARCHAR);
DROP FUNCTION IF EXISTS fn_get_need_frontend(BIGINT, NUMERIC, NUMERIC);
DROP FUNCTION IF EXISTS fn_get_offer_frontend(BIGINT, NUMERIC, NUMERIC);
DROP PROCEDURE IF EXISTS sp_register_user(VARCHAR, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, NUMERIC, NUMERIC, NUMERIC, BIGINT);
DROP PROCEDURE IF EXISTS sp_update_profile(BIGINT, VARCHAR, VARCHAR, VARCHAR, TEXT, VARCHAR, NUMERIC, NUMERIC, NUMERIC);
DROP PROCEDURE IF EXISTS sp_post_need(BIGINT, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT[], BIGINT);
DROP PROCEDURE IF EXISTS sp_post_offer(BIGINT, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT[], BIGINT);

-- ============================================================================
-- 2. ENUM TYPES
-- ============================================================================
CREATE TYPE post_status AS ENUM
    ('active', 'fulfilled', 'expired', 'removed');

CREATE TYPE response_status AS ENUM
    ('pending', 'accepted', 'rejected');

CREATE TYPE visibility_type AS ENUM
    ('public', 'neighborhood', 'private');

CREATE TYPE report_status AS ENUM
    ('pending', 'reviewed', 'dismissed');

-- ============================================================================
-- 3. USERS
-- ============================================================================
CREATE TABLE users (
    user_id           BIGSERIAL PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    username          VARCHAR(50)  NOT NULL UNIQUE,
    email             VARCHAR(150) NOT NULL UNIQUE,
    password_hash     TEXT         NOT NULL,
    phone_number      VARCHAR(20),
    bio               TEXT,
    address           VARCHAR(255),
    preferred_radius  NUMERIC(6,2) NOT NULL DEFAULT 5.0
                      CHECK (preferred_radius > 0),
    trust_score       NUMERIC(5,2) NOT NULL DEFAULT 0.00
                      CHECK (trust_score >= 0 AND trust_score <= 100),
    is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    profile_photo     TEXT,
    joined_date       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================================================
-- 4. ADMIN
-- ============================================================================
CREATE TABLE admin (
    admin_id       BIGSERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    username       VARCHAR(50)  NOT NULL UNIQUE,
    email          VARCHAR(150) NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    created_date   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. CATEGORIES
-- ============================================================================
CREATE TABLE categories (
    category_id          BIGSERIAL PRIMARY KEY,
    category_name        VARCHAR(100) NOT NULL UNIQUE,
    category_description TEXT
);

-- ============================================================================
-- 6. NEEDS
-- ============================================================================
CREATE TABLE needs (
    need_id          BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id      BIGINT REFERENCES categories(category_id) ON DELETE SET NULL,
    title            VARCHAR(150) NOT NULL,
    description      TEXT NOT NULL,
    urgency          VARCHAR(20) NOT NULL DEFAULT 'medium'
                     CHECK (urgency IN ('low','medium','high','emergency')),
    duration         VARCHAR(100) NOT NULL DEFAULT 'Flexible',
    location         VARCHAR(255) NOT NULL,
    search_radius    NUMERIC(6,2) NOT NULL DEFAULT 5.0
                     CHECK (search_radius > 0),
    tags             TEXT[] NOT NULL DEFAULT '{}',
    photo            TEXT,
    quantity         INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    visibility       visibility_type NOT NULL DEFAULT 'public',
    status           post_status NOT NULL DEFAULT 'active',
    created_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_needs_user ON needs(user_id);
CREATE INDEX idx_needs_category ON needs(category_id);
CREATE INDEX idx_needs_status ON needs(status);
CREATE INDEX idx_needs_urgency ON needs(urgency);
CREATE INDEX idx_needs_created ON needs(created_date DESC);

-- ============================================================================
-- 7. OFFERS
-- ============================================================================
CREATE TABLE offers (
    offer_id         BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id      BIGINT REFERENCES categories(category_id) ON DELETE SET NULL,
    title            VARCHAR(150) NOT NULL,
    description      TEXT NOT NULL,
    condition        VARCHAR(30) NOT NULL DEFAULT 'N/A'
                     CHECK (condition IN ('Like new','Good','Fair','Fresh','N/A')),
    availability     VARCHAR(100) NOT NULL DEFAULT 'Flexible',
    pickup_option    VARCHAR(30) NOT NULL DEFAULT 'Pickup only'
                     CHECK (pickup_option IN ('Pickup only','Can deliver','Either')),
    location         VARCHAR(255) NOT NULL,
    search_radius    NUMERIC(6,2) NOT NULL DEFAULT 5.0
                     CHECK (search_radius > 0),
    tags             TEXT[] NOT NULL DEFAULT '{}',
    photo            TEXT,
    quantity         INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    visibility       visibility_type NOT NULL DEFAULT 'public',
    status           post_status NOT NULL DEFAULT 'active',
    created_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offers_user ON offers(user_id);
CREATE INDEX idx_offers_category ON offers(category_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_condition ON offers(condition);
CREATE INDEX idx_offers_created ON offers(created_date DESC);

-- ============================================================================
-- 8. RESPONSES
-- ============================================================================
CREATE TABLE responses (
    response_id      BIGSERIAL PRIMARY KEY,
    need_id          BIGINT NOT NULL REFERENCES needs(need_id) ON DELETE CASCADE,
    offer_id         BIGINT REFERENCES offers(offer_id) ON DELETE SET NULL,
    user_id          BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message          TEXT,
    status           response_status NOT NULL DEFAULT 'pending',
    created_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_date   TIMESTAMP
);

CREATE INDEX idx_responses_need ON responses(need_id);
CREATE INDEX idx_responses_user ON responses(user_id);
CREATE INDEX idx_responses_status ON responses(status);

-- ============================================================================
-- 9. RATINGS AND REVIEWS
-- ============================================================================
CREATE TABLE ratings (
    rating_id        BIGSERIAL PRIMARY KEY,
    reviewer_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rated_user_id    BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating_value     SMALLINT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    created_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (reviewer_id <> rated_user_id)
);

CREATE TABLE reviews (
    review_id         BIGSERIAL PRIMARY KEY,
    reviewer_id       BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reviewed_user_id  BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    review_text       TEXT NOT NULL,
    created_date      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (reviewer_id <> reviewed_user_id)
);

CREATE INDEX idx_ratings_rated_user ON ratings(rated_user_id);
CREATE INDEX idx_reviews_reviewed_user ON reviews(reviewed_user_id);

-- ============================================================================
-- 10. BOOKMARKS
-- ============================================================================
CREATE TABLE bookmarks (
    bookmark_id       BIGSERIAL PRIMARY KEY,
    user_id           BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    need_id           BIGINT REFERENCES needs(need_id) ON DELETE CASCADE,
    offer_id          BIGINT REFERENCES offers(offer_id) ON DELETE CASCADE,
    created_date      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (need_id IS NOT NULL AND offer_id IS NULL)
        OR
        (need_id IS NULL AND offer_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX uq_bookmark_need
    ON bookmarks(user_id, need_id)
    WHERE need_id IS NOT NULL;

CREATE UNIQUE INDEX uq_bookmark_offer
    ON bookmarks(user_id, offer_id)
    WHERE offer_id IS NOT NULL;

-- ============================================================================
-- 11. MESSAGES / CONVERSATIONS
-- ============================================================================
CREATE TABLE conversations (
    conversation_id  BIGSERIAL PRIMARY KEY,
    user_one_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    user_two_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (user_one_id <> user_two_id),
    CHECK (user_one_id < user_two_id)
);

CREATE UNIQUE INDEX uq_conversation_pair
    ON conversations(user_one_id, user_two_id);

CREATE TABLE messages (
    message_id       BIGSERIAL PRIMARY KEY,
    conversation_id  BIGINT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    sender_id        BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message_text     TEXT NOT NULL,
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    created_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation
    ON messages(conversation_id, created_date);

CREATE INDEX idx_messages_sender
    ON messages(sender_id);

-- ============================================================================
-- 12. USER SETTINGS
-- ============================================================================
CREATE TABLE user_settings (
    user_id          BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    push_alerts      BOOLEAN NOT NULL DEFAULT TRUE,
    sms_alerts       BOOLEAN NOT NULL DEFAULT FALSE,
    email_alerts     BOOLEAN NOT NULL DEFAULT TRUE,
    public_profile   BOOLEAN NOT NULL DEFAULT TRUE,
    show_location    BOOLEAN NOT NULL DEFAULT TRUE,
    language         VARCHAR(30) NOT NULL DEFAULT 'English',
    dark_mode        BOOLEAN NOT NULL DEFAULT FALSE,
    profile_visibility VARCHAR(20) NOT NULL DEFAULT 'Everyone'
                     CHECK (profile_visibility IN ('Everyone','Only Friends','Only Me')),
    updated_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 13. REPORTS
-- ============================================================================
CREATE TABLE reports (
    report_id        BIGSERIAL PRIMARY KEY,
    reporter_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    need_id          BIGINT REFERENCES needs(need_id) ON DELETE CASCADE,
    offer_id         BIGINT REFERENCES offers(offer_id) ON DELETE CASCADE,
    reason           TEXT NOT NULL,
    status           report_status NOT NULL DEFAULT 'pending',
    created_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (need_id IS NOT NULL AND offer_id IS NULL)
        OR
        (need_id IS NULL AND offer_id IS NOT NULL)
    )
);

-- ============================================================================
-- 14. ACTIVITY HISTORY
-- ============================================================================
CREATE TABLE activity_history (
    activity_id      BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    activity_type    VARCHAR(60) NOT NULL,
    reference_id     BIGINT,
    description      TEXT,
    created_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user
    ON activity_history(user_id, created_date DESC);

-- ============================================================================
-- 15. UPDATED DATE TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_set_updated_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_date := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_date();

CREATE TRIGGER trg_needs_updated
BEFORE UPDATE ON needs
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_date();

CREATE TRIGGER trg_offers_updated
BEFORE UPDATE ON offers
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_date();

CREATE TRIGGER trg_conversations_updated
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_date();

CREATE TRIGGER trg_settings_updated
BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_date();

-- ============================================================================
-- 17. ACTIVITY LOGGER
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_log_activity(
    p_user_id BIGINT,
    p_activity_type VARCHAR,
    p_reference_id BIGINT,
    p_description TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO activity_history(
        user_id, activity_type, reference_id, description
    )
    VALUES (
        p_user_id, p_activity_type, p_reference_id, p_description
    );
END;
$$;

-- ============================================================================
-- 18. USER REGISTRATION
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_register_user(
    IN p_name VARCHAR,
    IN p_username VARCHAR,
    IN p_email VARCHAR,
    IN p_password TEXT,
    IN p_phone VARCHAR DEFAULT NULL,
    IN p_address VARCHAR DEFAULT NULL,
    IN p_radius NUMERIC DEFAULT 5.0,
    INOUT p_user_id BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NULLIF(TRIM(p_name), '') IS NULL THEN
        RAISE EXCEPTION 'Name is required';
    END IF;

    IF NULLIF(TRIM(p_username), '') IS NULL THEN
        RAISE EXCEPTION 'Username is required';
    END IF;

    IF NULLIF(TRIM(p_email), '') IS NULL THEN
        RAISE EXCEPTION 'Email is required';
    END IF;

    IF NULLIF(p_password, '') IS NULL THEN
        RAISE EXCEPTION 'Password is required';
    END IF;

    IF EXISTS (
        SELECT 1 FROM users
        WHERE lower(email) = lower(trim(p_email))
           OR lower(username) = lower(trim(p_username))
    ) THEN
        RAISE EXCEPTION 'Username or email already exists';
    END IF;

    INSERT INTO users(
        name, username, email, password_hash, phone_number,
        address, preferred_radius
    )
    VALUES (
        trim(p_name),
        trim(p_username),
        lower(trim(p_email)),
        crypt(p_password, gen_salt('bf')),
        p_phone,
        p_address,
        COALESCE(p_radius, 5.0)
    )
    RETURNING user_id INTO p_user_id;

    INSERT INTO user_settings(user_id) VALUES (p_user_id);

    CALL sp_log_activity(
        p_user_id, 'ACCOUNT_CREATED', p_user_id, 'User registered'
    );
END;
$$;

-- ============================================================================
-- 19. LOGIN - accepts either email OR username
-- Frontend Login.jsx supplies email.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_login(
    p_login VARCHAR,
    p_password TEXT
)
RETURNS TABLE(
    user_id BIGINT,
    name VARCHAR,
    email VARCHAR,
    username VARCHAR,
    is_verified BOOLEAN,
    trust_score NUMERIC,
    is_valid BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.user_id,
        u.name,
        u.email,
        u.username,
        u.is_verified,
        u.trust_score,
        (u.password_hash = crypt(p_password, u.password_hash)) AS is_valid
    FROM users u
    WHERE (lower(u.email) = lower(trim(p_login))
        OR lower(u.username) = lower(trim(p_login)))
      AND u.is_active = TRUE;
END;
$$;

-- ============================================================================
-- 20. PROFILE
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_get_profile(p_user_id BIGINT)
RETURNS TABLE(
    user_id BIGINT,
    name VARCHAR,
    username VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    bio TEXT,
    location VARCHAR,
    verified BOOLEAN,
    trust_score NUMERIC,
    joined_at TIMESTAMP,
    initial TEXT
)
LANGUAGE sql
AS $$
    SELECT
        u.user_id,
        u.name,
        u.username,
        u.email,
        u.phone_number,
        u.bio,
        u.address,
        u.is_verified,
        u.trust_score,
        u.joined_date,
        upper(left(trim(u.name), 1))
    FROM users u
    WHERE u.user_id = p_user_id
      AND u.is_active = TRUE;
$$;

CREATE OR REPLACE PROCEDURE sp_update_profile(
    IN p_user_id BIGINT,
    IN p_name VARCHAR DEFAULT NULL,
    IN p_phone VARCHAR DEFAULT NULL,
    IN p_address VARCHAR DEFAULT NULL,
    IN p_bio TEXT DEFAULT NULL,
    IN p_email VARCHAR DEFAULT NULL,
    IN p_radius NUMERIC DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users WHERE user_id = p_user_id AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'User % not found', p_user_id;
    END IF;

    IF p_email IS NOT NULL AND EXISTS (
        SELECT 1
        FROM users
        WHERE lower(email) = lower(trim(p_email))
          AND user_id <> p_user_id
    ) THEN
        RAISE EXCEPTION 'Email already exists';
    END IF;

    UPDATE users
    SET name = COALESCE(NULLIF(trim(p_name), ''), name),
        phone_number = COALESCE(p_phone, phone_number),
        address = COALESCE(p_address, address),
        bio = COALESCE(p_bio, bio),
        email = COALESCE(lower(trim(p_email)), email),
        preferred_radius = COALESCE(p_radius, preferred_radius)
    WHERE user_id = p_user_id;

    CALL sp_log_activity(
        p_user_id, 'PROFILE_UPDATED', p_user_id, 'Profile updated'
    );
END;
$$;

CREATE OR REPLACE PROCEDURE sp_deactivate_account(
    IN p_user_id BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE users
    SET is_active = FALSE
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User % not found', p_user_id;
    END IF;

    CALL sp_log_activity(
        p_user_id, 'ACCOUNT_DEACTIVATED', p_user_id, 'Account deactivated'
    );
END;
$$;

-- ============================================================================
-- 21. SETTINGS
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_get_settings(p_user_id BIGINT)
RETURNS TABLE(
    user_id BIGINT,
    name VARCHAR,
    username VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    push_alerts BOOLEAN,
    sms_alerts BOOLEAN,
    email_alerts BOOLEAN,
    public_profile BOOLEAN,
    show_location BOOLEAN,
    language VARCHAR,
    dark_mode BOOLEAN,
    visibility VARCHAR
)
LANGUAGE sql
AS $$
    SELECT
        u.user_id,
        u.name,
        u.username,
        u.email,
        u.phone_number,
        s.push_alerts,
        s.sms_alerts,
        s.email_alerts,
        s.public_profile,
        s.show_location,
        s.language,
        s.dark_mode,
        s.profile_visibility
    FROM users u
    JOIN user_settings s ON s.user_id = u.user_id
    WHERE u.user_id = p_user_id;
$$;

-- Settings.jsx field names: name, username, email, phone, darkMode,
-- profilePublic, language, visibility, emailAlerts, pushAlerts, smsAlerts.
CREATE OR REPLACE PROCEDURE sp_update_settings(
    IN p_user_id BIGINT,
    IN p_push_alerts BOOLEAN DEFAULT NULL,
    IN p_sms_alerts BOOLEAN DEFAULT NULL,
    IN p_email_alerts BOOLEAN DEFAULT NULL,
    IN p_public_profile BOOLEAN DEFAULT NULL,
    IN p_show_location BOOLEAN DEFAULT NULL,
    IN p_language VARCHAR DEFAULT NULL,
    IN p_dark_mode BOOLEAN DEFAULT NULL,
    IN p_visibility VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_visibility IS NOT NULL
       AND p_visibility NOT IN ('Everyone','Only Friends','Only Me') THEN
        RAISE EXCEPTION 'Invalid profile visibility: %', p_visibility;
    END IF;

    INSERT INTO user_settings(user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    UPDATE user_settings
    SET push_alerts = COALESCE(p_push_alerts, push_alerts),
        sms_alerts = COALESCE(p_sms_alerts, sms_alerts),
        email_alerts = COALESCE(p_email_alerts, email_alerts),
        public_profile = COALESCE(p_public_profile, public_profile),
        show_location = COALESCE(p_show_location, show_location),
        language = COALESCE(p_language, language),
        dark_mode = COALESCE(p_dark_mode, dark_mode),
        profile_visibility = COALESCE(p_visibility, profile_visibility)
    WHERE user_id = p_user_id;
END;
$$;

-- ============================================================================
-- 22. CATEGORY MANAGEMENT
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_add_category(
    IN p_name VARCHAR,
    IN p_description TEXT DEFAULT NULL,
    INOUT p_category_id BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO categories(category_name, category_description)
    VALUES (trim(p_name), p_description)
    ON CONFLICT (category_name)
    DO UPDATE SET category_description =
        COALESCE(EXCLUDED.category_description, categories.category_description)
    RETURNING category_id INTO p_category_id;
END;
$$;

-- ============================================================================
-- 23. NEED CREATION
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_post_need(
    IN p_user_id BIGINT,
    IN p_category_name VARCHAR,
    IN p_title VARCHAR,
    IN p_description TEXT,
    IN p_urgency VARCHAR DEFAULT 'medium',
    IN p_duration VARCHAR DEFAULT 'Flexible',
    IN p_location VARCHAR DEFAULT NULL,
    IN p_radius NUMERIC DEFAULT 5.0,
    IN p_photo TEXT DEFAULT NULL,
    IN p_tags TEXT[] DEFAULT NULL,
    INOUT p_need_id BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_category_id BIGINT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users WHERE user_id = p_user_id AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'Active user % not found', p_user_id;
    END IF;

    IF NULLIF(trim(p_title), '') IS NULL
       OR NULLIF(trim(p_description), '') IS NULL
       OR NULLIF(trim(p_location), '') IS NULL THEN
        RAISE EXCEPTION 'Title, description and location are required';
    END IF;

    IF p_urgency NOT IN ('low','medium','high','emergency') THEN
        RAISE EXCEPTION 'Invalid urgency: %', p_urgency;
    END IF;

    SELECT category_id
    INTO v_category_id
    FROM categories
    WHERE lower(category_name) = lower(trim(p_category_name));

    IF v_category_id IS NULL THEN
        INSERT INTO categories(category_name)
        VALUES (trim(p_category_name))
        ON CONFLICT (category_name) DO NOTHING;

        SELECT category_id
        INTO v_category_id
        FROM categories
        WHERE lower(category_name) = lower(trim(p_category_name));
    END IF;

    INSERT INTO needs(
        user_id, category_id, title, description, urgency, duration,
        location, search_radius, tags, photo
    )
    VALUES (
        p_user_id, v_category_id, trim(p_title), trim(p_description),
        p_urgency, COALESCE(NULLIF(trim(p_duration), ''), 'Flexible'),
        trim(p_location),
        COALESCE(p_radius, 5.0),
        COALESCE(p_tags, ARRAY[trim(p_category_name)]::TEXT[]),
        p_photo
    )
    RETURNING need_id INTO p_need_id;

    CALL sp_log_activity(
        p_user_id, 'NEED_POSTED', p_need_id, 'Need posted: ' || p_title
    );
END;
$$;

-- ============================================================================
-- 24. OFFER CREATION
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_post_offer(
    IN p_user_id BIGINT,
    IN p_category_name VARCHAR,
    IN p_title VARCHAR,
    IN p_description TEXT,
    IN p_condition VARCHAR DEFAULT 'N/A',
    IN p_availability VARCHAR DEFAULT 'Flexible',
    IN p_pickup_option VARCHAR DEFAULT 'Pickup only',
    IN p_location VARCHAR DEFAULT NULL,
    IN p_radius NUMERIC DEFAULT 5.0,
    IN p_photo TEXT DEFAULT NULL,
    IN p_tags TEXT[] DEFAULT NULL,
    INOUT p_offer_id BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_category_id BIGINT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users WHERE user_id = p_user_id AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'Active user % not found', p_user_id;
    END IF;

    IF NULLIF(trim(p_title), '') IS NULL
       OR NULLIF(trim(p_description), '') IS NULL
       OR NULLIF(trim(p_location), '') IS NULL THEN
        RAISE EXCEPTION 'Title, description and location are required';
    END IF;

    IF p_condition NOT IN ('Like new','Good','Fair','Fresh','N/A') THEN
        RAISE EXCEPTION 'Invalid condition: %', p_condition;
    END IF;

    IF p_pickup_option NOT IN ('Pickup only','Can deliver','Either') THEN
        RAISE EXCEPTION 'Invalid pickup option: %', p_pickup_option;
    END IF;

    SELECT category_id
    INTO v_category_id
    FROM categories
    WHERE lower(category_name) = lower(trim(p_category_name));

    IF v_category_id IS NULL THEN
        INSERT INTO categories(category_name)
        VALUES (trim(p_category_name))
        ON CONFLICT (category_name) DO NOTHING;

        SELECT category_id
        INTO v_category_id
        FROM categories
        WHERE lower(category_name) = lower(trim(p_category_name));
    END IF;

    INSERT INTO offers(
        user_id, category_id, title, description, condition,
        availability, pickup_option, location, search_radius, tags, photo
    )
    VALUES (
        p_user_id, v_category_id, trim(p_title), trim(p_description),
        p_condition,
        COALESCE(NULLIF(trim(p_availability), ''), 'Flexible'),
        p_pickup_option,
        trim(p_location),
        COALESCE(p_radius, 5.0),
        COALESCE(p_tags, ARRAY[trim(p_category_name)]::TEXT[]),
        p_photo
    )
    RETURNING offer_id INTO p_offer_id;

    CALL sp_log_activity(
        p_user_id, 'OFFER_POSTED', p_offer_id, 'Offer posted: ' || p_title
    );
END;
$$;

-- ============================================================================
-- 25. FRONTEND-SHAPED NEED VIEW
-- ============================================================================
CREATE OR REPLACE VIEW vw_frontend_needs AS
SELECT
    n.need_id AS id,
    n.user_id AS owner_user_id,
    n.title,
    n.description,
    c.category_name AS category,
    n.urgency,
    n.duration,
    n.location,
    n.search_radius AS radius,
    n.tags,
    n.photo,
    n.status,
    n.created_date,
    u.name AS requester_name,
    upper(left(trim(u.name), 1)) AS requester_initial,
    u.is_verified AS verified,
    u.trust_score,
    u.is_active
FROM needs n
JOIN users u ON u.user_id = n.user_id
LEFT JOIN categories c ON c.category_id = n.category_id;

-- ============================================================================
-- 26. FRONTEND-SHAPED OFFER VIEW
-- ============================================================================
CREATE OR REPLACE VIEW vw_frontend_offers AS
SELECT
    o.offer_id AS id,
    o.user_id AS owner_user_id,
    o.title,
    o.description,
    c.category_name AS category,
    o.condition,
    o.availability,
    o.pickup_option,
    o.location,
    o.search_radius AS radius,
    o.tags,
    o.photo,
    o.status,
    o.created_date,
    u.name AS owner_name,
    upper(left(trim(u.name), 1)) AS owner_initial,
    u.is_verified AS verified,
    u.trust_score,
    u.is_active
FROM offers o
JOIN users u ON u.user_id = o.user_id
LEFT JOIN categories c ON c.category_id = o.category_id;

-- ============================================================================
-- 27. SEARCH NEEDS - matches Needs.jsx fields and filters
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_search_needs_frontend(
    p_radius NUMERIC DEFAULT 5,
    p_query TEXT DEFAULT NULL,
    p_category VARCHAR DEFAULT NULL,
    p_urgency VARCHAR DEFAULT NULL,
    p_verified_only BOOLEAN DEFAULT FALSE,
    p_sort VARCHAR DEFAULT 'latest'
)
RETURNS TABLE(
    id BIGINT,
    title VARCHAR,
    description TEXT,
    category VARCHAR,
    urgency VARCHAR,
    duration VARCHAR,
    location VARCHAR,
    distance NUMERIC,
    tags TEXT[],
    requester_name VARCHAR,
    requester_initial TEXT,
    verified BOOLEAN,
    trust_score NUMERIC,
    "time" TEXT,
    status post_status
)
LANGUAGE sql
AS $$
    SELECT
        n.need_id,
        n.title,
        n.description,
        c.category_name,
        n.urgency,
        n.duration,
        n.location,
        NULL::NUMERIC AS distance,
        n.tags,
        u.name,
        upper(left(trim(u.name), 1)),
        u.is_verified,
        u.trust_score,
        to_char(n.created_date, 'DD Mon YYYY HH24:MI'),
        n.status
    FROM needs n
    JOIN users u ON u.user_id = n.user_id
    LEFT JOIN categories c ON c.category_id = n.category_id
    WHERE n.status = 'active'
      AND u.is_active = TRUE
      AND (
            p_query IS NULL OR trim(p_query) = ''
            OR n.title ILIKE '%' || trim(p_query) || '%'
            OR n.description ILIKE '%' || trim(p_query) || '%'
            OR n.location ILIKE '%' || trim(p_query) || '%'
            OR u.name ILIKE '%' || trim(p_query) || '%'
      )
      AND (
            p_category IS NULL OR trim(p_category) = ''
            OR lower(p_category) = 'all'
            OR c.category_name = p_category
      )
      AND (
            p_urgency IS NULL OR trim(p_urgency) = ''
            OR lower(p_urgency) = 'all'
            OR n.urgency = lower(p_urgency)
      )
      AND (
            NOT COALESCE(p_verified_only, FALSE)
            OR u.is_verified = TRUE
      )
    ORDER BY n.created_date DESC;
$$;

-- ============================================================================
-- 28. SEARCH OFFERS - matches Offers.jsx fields and filters
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_search_offers_frontend(
    p_radius NUMERIC DEFAULT 5,
    p_query TEXT DEFAULT NULL,
    p_category VARCHAR DEFAULT NULL,
    p_condition VARCHAR DEFAULT NULL,
    p_verified_only BOOLEAN DEFAULT FALSE,
    p_sort VARCHAR DEFAULT 'latest'
)
RETURNS TABLE(
    id BIGINT,
    title VARCHAR,
    description TEXT,
    category VARCHAR,
    condition VARCHAR,
    availability VARCHAR,
    pickup_option VARCHAR,
    location VARCHAR,
    distance NUMERIC,
    tags TEXT[],
    owner_name VARCHAR,
    owner_initial TEXT,
    verified BOOLEAN,
    trust_score NUMERIC,
    "time" TEXT,
    status post_status
)
LANGUAGE sql
AS $$
    SELECT
        o.offer_id,
        o.title,
        o.description,
        c.category_name,
        o.condition,
        o.availability,
        o.pickup_option,
        o.location,
        NULL::NUMERIC AS distance,
        o.tags,
        u.name,
        upper(left(trim(u.name), 1)),
        u.is_verified,
        u.trust_score,
        to_char(o.created_date, 'DD Mon YYYY HH24:MI'),
        o.status
    FROM offers o
    JOIN users u ON u.user_id = o.user_id
    LEFT JOIN categories c ON c.category_id = o.category_id
    WHERE o.status = 'active'
      AND u.is_active = TRUE
      AND (
            p_query IS NULL OR trim(p_query) = ''
            OR o.title ILIKE '%' || trim(p_query) || '%'
            OR o.description ILIKE '%' || trim(p_query) || '%'
            OR o.location ILIKE '%' || trim(p_query) || '%'
            OR u.name ILIKE '%' || trim(p_query) || '%'
      )
      AND (
            p_category IS NULL OR trim(p_category) = ''
            OR lower(p_category) = 'all'
            OR c.category_name = p_category
      )
      AND (
            p_condition IS NULL OR trim(p_condition) = ''
            OR lower(p_condition) = 'all'
            OR o.condition = p_condition
      )
      AND (
            NOT COALESCE(p_verified_only, FALSE)
            OR u.is_verified = TRUE
      )
    ORDER BY o.created_date DESC;
$$;

-- ============================================================================
-- 29. GET SINGLE NEED / OFFER FOR DETAIL PAGES
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_get_need_frontend(
    p_need_id BIGINT
)
RETURNS TABLE(
    id BIGINT,
    title VARCHAR,
    description TEXT,
    category VARCHAR,
    urgency VARCHAR,
    duration VARCHAR,
    location VARCHAR,
    distance NUMERIC,
    tags TEXT[],
    requester_name VARCHAR,
    requester_initial TEXT,
    verified BOOLEAN,
    trust_score NUMERIC,
    "time" TEXT,
    photo TEXT,
    status post_status
)
LANGUAGE sql
AS $$
    SELECT
        n.need_id,
        n.title,
        n.description,
        c.category_name,
        n.urgency,
        n.duration,
        n.location,
        NULL::NUMERIC,
        n.tags,
        u.name,
        upper(left(trim(u.name),1)),
        u.is_verified,
        u.trust_score,
        to_char(n.created_date,'DD Mon YYYY HH24:MI'),
        n.photo,
        n.status
    FROM needs n
    JOIN users u ON u.user_id = n.user_id
    LEFT JOIN categories c ON c.category_id = n.category_id
    WHERE n.need_id = p_need_id;
$$;

CREATE OR REPLACE FUNCTION fn_get_offer_frontend(
    p_offer_id BIGINT
)
RETURNS TABLE(
    id BIGINT,
    title VARCHAR,
    description TEXT,
    category VARCHAR,
    condition VARCHAR,
    availability VARCHAR,
    pickup_option VARCHAR,
    location VARCHAR,
    distance NUMERIC,
    tags TEXT[],
    owner_name VARCHAR,
    owner_initial TEXT,
    verified BOOLEAN,
    trust_score NUMERIC,
    "time" TEXT,
    photo TEXT,
    status post_status
)
LANGUAGE sql
AS $$
    SELECT
        o.offer_id,
        o.title,
        o.description,
        c.category_name,
        o.condition,
        o.availability,
        o.pickup_option,
        o.location,
        NULL::NUMERIC,
        o.tags,
        u.name,
        upper(left(trim(u.name),1)),
        u.is_verified,
        u.trust_score,
        to_char(o.created_date,'DD Mon YYYY HH24:MI'),
        o.photo,
        o.status
    FROM offers o
    JOIN users u ON u.user_id = o.user_id
    LEFT JOIN categories c ON c.category_id = o.category_id
    WHERE o.offer_id = p_offer_id;
$$;

-- ============================================================================
-- 30. REMOVE OWN NEED / OFFER
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_remove_need(
    IN p_user_id BIGINT,
    IN p_need_id BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE needs
    SET status = 'removed'
    WHERE need_id = p_need_id
      AND user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Need not found or not owned by user';
    END IF;

    CALL sp_log_activity(
        p_user_id, 'NEED_REMOVED', p_need_id, 'Need removed'
    );
END;
$$;

CREATE OR REPLACE PROCEDURE sp_remove_offer(
    IN p_user_id BIGINT,
    IN p_offer_id BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE offers
    SET status = 'removed'
    WHERE offer_id = p_offer_id
      AND user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Offer not found or not owned by user';
    END IF;

    CALL sp_log_activity(
        p_user_id, 'OFFER_REMOVED', p_offer_id, 'Offer removed'
    );
END;
$$;

-- ============================================================================
-- 31. BOOKMARK FUNCTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_is_bookmarked(
    p_user_id BIGINT,
    p_item_id BIGINT,
    p_item_type VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    IF lower(p_item_type) = 'need' THEN
        RETURN EXISTS (
            SELECT 1 FROM bookmarks
            WHERE user_id = p_user_id AND need_id = p_item_id
        );
    ELSIF lower(p_item_type) = 'offer' THEN
        RETURN EXISTS (
            SELECT 1 FROM bookmarks
            WHERE user_id = p_user_id AND offer_id = p_item_id
        );
    ELSE
        RAISE EXCEPTION 'item_type must be need or offer';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_toggle_bookmark(
    p_user_id BIGINT,
    p_item_id BIGINT,
    p_item_type VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    v_exists := fn_is_bookmarked(p_user_id, p_item_id, p_item_type);

    IF v_exists THEN
        IF lower(p_item_type) = 'need' THEN
            DELETE FROM bookmarks
            WHERE user_id = p_user_id AND need_id = p_item_id;
        ELSE
            DELETE FROM bookmarks
            WHERE user_id = p_user_id AND offer_id = p_item_id;
        END IF;
        RETURN FALSE;
    ELSE
        IF lower(p_item_type) = 'need' THEN
            IF NOT EXISTS (SELECT 1 FROM needs WHERE need_id = p_item_id) THEN
                RAISE EXCEPTION 'Need % not found', p_item_id;
            END IF;

            INSERT INTO bookmarks(user_id, need_id)
            VALUES (p_user_id, p_item_id);
        ELSE
            IF NOT EXISTS (SELECT 1 FROM offers WHERE offer_id = p_item_id) THEN
                RAISE EXCEPTION 'Offer % not found', p_item_id;
            END IF;

            INSERT INTO bookmarks(user_id, offer_id)
            VALUES (p_user_id, p_item_id);
        END IF;

        RETURN TRUE;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_bookmarks(
    p_user_id BIGINT
)
RETURNS TABLE(
    id BIGINT,
    bookmark_type VARCHAR,
    title VARCHAR,
    description TEXT,
    location VARCHAR,
    distance NUMERIC,
    "time" TEXT,
    urgency VARCHAR,
    condition VARCHAR,
    category VARCHAR,
    tags TEXT[],
    requester_initial TEXT,
    requester_name VARCHAR,
    owner_initial TEXT,
    owner_name VARCHAR,
    verified BOOLEAN
)
LANGUAGE sql
AS $$
    SELECT
        n.need_id,
        'need'::VARCHAR,
        n.title,
        n.description,
        n.location,
        0::NUMERIC,
        to_char(n.created_date,'DD Mon YYYY HH24:MI'),
        n.urgency,
        NULL::VARCHAR,
        c.category_name,
        n.tags,
        upper(left(trim(u.name),1)),
        u.name,
        NULL::TEXT,
        NULL::VARCHAR,
        u.is_verified
    FROM bookmarks b
    JOIN needs n ON n.need_id = b.need_id
    JOIN users u ON u.user_id = n.user_id
    LEFT JOIN categories c ON c.category_id = n.category_id
    WHERE b.user_id = p_user_id

    UNION ALL

    SELECT
        o.offer_id,
        'offer'::VARCHAR,
        o.title,
        o.description,
        o.location,
        0::NUMERIC,
        to_char(o.created_date,'DD Mon YYYY HH24:MI'),
        NULL::VARCHAR,
        o.condition,
        c.category_name,
        o.tags,
        NULL::TEXT,
        NULL::VARCHAR,
        upper(left(trim(u.name),1)),
        u.name,
        u.is_verified
    FROM bookmarks b
    JOIN offers o ON o.offer_id = b.offer_id
    JOIN users u ON u.user_id = o.user_id
    LEFT JOIN categories c ON c.category_id = o.category_id
    WHERE b.user_id = p_user_id

    ORDER BY 7 DESC;
$$;

-- ============================================================================
-- 32. RESPOND TO NEED
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_respond_to_need(
    IN p_need_id BIGINT,
    IN p_user_id BIGINT,
    IN p_offer_id BIGINT DEFAULT NULL,
    IN p_message TEXT DEFAULT NULL,
    INOUT p_response_id BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_status post_status;
    v_owner BIGINT;
BEGIN
    SELECT status, user_id
    INTO v_status, v_owner
    FROM needs
    WHERE need_id = p_need_id;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Need % does not exist', p_need_id;
    END IF;

    IF v_status <> 'active' THEN
        RAISE EXCEPTION 'Need is not active';
    END IF;

    IF v_owner = p_user_id THEN
        RAISE EXCEPTION 'A user cannot respond to their own need';
    END IF;

    IF p_offer_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM offers
        WHERE offer_id = p_offer_id
          AND user_id = p_user_id
          AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Offer % is invalid for this user', p_offer_id;
    END IF;

    IF EXISTS (
        SELECT 1 FROM responses
        WHERE need_id = p_need_id
          AND user_id = p_user_id
          AND status = 'pending'
    ) THEN
        RAISE EXCEPTION 'You already have a pending response for this need';
    END IF;

    INSERT INTO responses(need_id, offer_id, user_id, message)
    VALUES (p_need_id, p_offer_id, p_user_id, p_message)
    RETURNING response_id INTO p_response_id;

    CALL sp_log_activity(
        p_user_id, 'RESPONSE_SENT', p_response_id,
        'Responded to need ' || p_need_id
    );
END;
$$;

-- ============================================================================
-- 33. ACCEPT / REJECT RESPONSE
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_accept_response(
    IN p_response_id BIGINT,
    IN p_actor_user_id BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_need_id BIGINT;
    v_need_owner BIGINT;
    v_responder BIGINT;
BEGIN
    SELECT r.need_id, n.user_id, r.user_id
    INTO v_need_id, v_need_owner, v_responder
    FROM responses r
    JOIN needs n ON n.need_id = r.need_id
    WHERE r.response_id = p_response_id;

    IF v_need_id IS NULL THEN
        RAISE EXCEPTION 'Response % does not exist', p_response_id;
    END IF;

    IF v_need_owner <> p_actor_user_id THEN
        RAISE EXCEPTION 'Only the need owner can accept a response';
    END IF;

    UPDATE responses
    SET status = 'accepted', responded_date = CURRENT_TIMESTAMP
    WHERE response_id = p_response_id
      AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Response is not pending';
    END IF;

    UPDATE responses
    SET status = 'rejected', responded_date = CURRENT_TIMESTAMP
    WHERE need_id = v_need_id
      AND response_id <> p_response_id
      AND status = 'pending';

    CALL sp_log_activity(
        v_need_owner, 'RESPONSE_ACCEPTED', p_response_id,
        'Accepted response ' || p_response_id
    );

    CALL sp_log_activity(
        v_responder, 'RESPONSE_WAS_ACCEPTED', p_response_id,
        'Your response was accepted'
    );
END;
$$;

CREATE OR REPLACE PROCEDURE sp_reject_response(
    IN p_response_id BIGINT,
    IN p_actor_user_id BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_owner BIGINT;
    v_responder BIGINT;
BEGIN
    SELECT n.user_id, r.user_id
    INTO v_owner, v_responder
    FROM responses r
    JOIN needs n ON n.need_id = r.need_id
    WHERE r.response_id = p_response_id;

    IF v_owner IS NULL THEN
        RAISE EXCEPTION 'Response % does not exist', p_response_id;
    END IF;

    IF v_owner <> p_actor_user_id THEN
        RAISE EXCEPTION 'Only the need owner can reject a response';
    END IF;

    UPDATE responses
    SET status = 'rejected', responded_date = CURRENT_TIMESTAMP
    WHERE response_id = p_response_id
      AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Response is not pending';
    END IF;

    CALL sp_log_activity(
        v_responder, 'RESPONSE_REJECTED', p_response_id,
        'Your response was rejected'
    );
END;
$$;

-- ============================================================================
-- 34. COMPLETE EXCHANGE
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_mark_exchange_completed(
    IN p_need_id BIGINT,
    IN p_response_id BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_owner BIGINT;
    v_responder BIGINT;
    v_status response_status;
BEGIN
    SELECT n.user_id, r.user_id, r.status
    INTO v_owner, v_responder, v_status
    FROM needs n
    JOIN responses r ON r.need_id = n.need_id
    WHERE n.need_id = p_need_id
      AND r.response_id = p_response_id;

    IF v_owner IS NULL THEN
        RAISE EXCEPTION 'Need/response combination not found';
    END IF;

    IF v_status <> 'accepted' THEN
        RAISE EXCEPTION 'Response must be accepted before completion';
    END IF;

    UPDATE needs
    SET status = 'fulfilled'
    WHERE need_id = p_need_id;

    CALL sp_log_activity(
        v_owner, 'EXCHANGE_COMPLETED', p_need_id,
        'Marked need ' || p_need_id || ' as completed'
    );

    CALL sp_log_activity(
        v_responder, 'EXCHANGE_COMPLETED', p_need_id,
        'Fulfilled need ' || p_need_id
    );
END;
$$;

-- ============================================================================
-- 35. RATINGS / REVIEWS
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_add_rating(
    IN p_reviewer_id BIGINT,
    IN p_rated_user_id BIGINT,
    IN p_rating_value SMALLINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_avg NUMERIC;
BEGIN
    IF p_reviewer_id = p_rated_user_id THEN
        RAISE EXCEPTION 'A user cannot rate themselves';
    END IF;

    IF p_rating_value NOT BETWEEN 1 AND 5 THEN
        RAISE EXCEPTION 'Rating must be between 1 and 5';
    END IF;

    INSERT INTO ratings(
        reviewer_id, rated_user_id, rating_value
    )
    VALUES (
        p_reviewer_id, p_rated_user_id, p_rating_value
    );

    SELECT AVG(rating_value)::NUMERIC
    INTO v_avg
    FROM ratings
    WHERE rated_user_id = p_rated_user_id;

    -- Preserve the original project meaning of trust_score while keeping
    -- the database value on a 0-100 scale.
    UPDATE users
    SET trust_score = ROUND((v_avg / 5.0) * 100.0, 2)
    WHERE user_id = p_rated_user_id;

    CALL sp_log_activity(
        p_reviewer_id, 'RATING_GIVEN', p_rated_user_id,
        'Rated user ' || p_rated_user_id || ' with ' || p_rating_value
    );
END;
$$;

CREATE OR REPLACE PROCEDURE sp_add_review(
    IN p_reviewer_id BIGINT,
    IN p_reviewed_user_id BIGINT,
    IN p_review_text TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_reviewer_id = p_reviewed_user_id THEN
        RAISE EXCEPTION 'A user cannot review themselves';
    END IF;

    IF NULLIF(trim(p_review_text), '') IS NULL THEN
        RAISE EXCEPTION 'Review text is required';
    END IF;

    INSERT INTO reviews(
        reviewer_id, reviewed_user_id, review_text
    )
    VALUES (
        p_reviewer_id, p_reviewed_user_id, trim(p_review_text)
    );

    CALL sp_log_activity(
        p_reviewer_id, 'REVIEW_GIVEN', p_reviewed_user_id,
        'Reviewed user ' || p_reviewed_user_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_reviews(
    p_user_id BIGINT
)
RETURNS TABLE(
    reviewer_name VARCHAR,
    rating SMALLINT,
    review_text TEXT,
    created_date TIMESTAMP
)
LANGUAGE sql
AS $$
    SELECT
        u.name,
        r.rating_value,
        rv.review_text,
        rv.created_date
    FROM reviews rv
    JOIN users u ON u.user_id = rv.reviewer_id
    LEFT JOIN ratings r
      ON r.reviewer_id = rv.reviewer_id
     AND r.rated_user_id = rv.reviewed_user_id
     AND r.created_date::DATE = rv.created_date::DATE
    WHERE rv.reviewed_user_id = p_user_id
    ORDER BY rv.created_date DESC;
$$;

-- ============================================================================
-- 36. CONVERSATIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_get_or_create_conversation(
    p_user_id BIGINT,
    p_other_user_id BIGINT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_one BIGINT;
    v_two BIGINT;
    v_id BIGINT;
BEGIN
    IF p_user_id = p_other_user_id THEN
        RAISE EXCEPTION 'Cannot create a conversation with yourself';
    END IF;

    v_one := LEAST(p_user_id, p_other_user_id);
    v_two := GREATEST(p_user_id, p_other_user_id);

    SELECT conversation_id
    INTO v_id
    FROM conversations
    WHERE user_one_id = v_one
      AND user_two_id = v_two;

    IF v_id IS NULL THEN
        INSERT INTO conversations(user_one_id, user_two_id)
        VALUES (v_one, v_two)
        RETURNING conversation_id INTO v_id;
    END IF;

    RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_conversations(
    p_user_id BIGINT
)
RETURNS TABLE(
    id BIGINT,
    name VARCHAR,
    initial TEXT,
    online BOOLEAN,
    unread BIGINT,
    updated_at TIMESTAMP
)
LANGUAGE sql
AS $$
    SELECT
        c.conversation_id,
        CASE
            WHEN c.user_one_id = p_user_id THEN u2.name
            ELSE u1.name
        END,
        CASE
            WHEN c.user_one_id = p_user_id
                THEN upper(left(trim(u2.name),1))
            ELSE upper(left(trim(u1.name),1))
        END,
        FALSE,
        (
            SELECT COUNT(*)
            FROM messages m
            WHERE m.conversation_id = c.conversation_id
              AND m.sender_id <> p_user_id
              AND m.is_read = FALSE
        ),
        c.updated_date
    FROM conversations c
    JOIN users u1 ON u1.user_id = c.user_one_id
    JOIN users u2 ON u2.user_id = c.user_two_id
    WHERE c.user_one_id = p_user_id
       OR c.user_two_id = p_user_id
    ORDER BY c.updated_date DESC;
$$;

-- ============================================================================
-- 37. MESSAGES
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_get_messages(
    p_user_id BIGINT,
    p_conversation_id BIGINT
)
RETURNS TABLE(
    id BIGINT,
    sender_id BIGINT,
    sender_name VARCHAR,
    message_text TEXT,
    message_from VARCHAR,
    message_time TEXT,
    is_read BOOLEAN
)
LANGUAGE sql
AS $$
    SELECT
        m.message_id,
        m.sender_id,
        u.name,
        m.message_text,
        CASE WHEN m.sender_id = p_user_id THEN 'me' ELSE 'them' END,
        to_char(m.created_date,'HH12:MI AM'),
        m.is_read
    FROM messages m
    JOIN users u ON u.user_id = m.sender_id
    JOIN conversations c ON c.conversation_id = m.conversation_id
    WHERE m.conversation_id = p_conversation_id
      AND (c.user_one_id = p_user_id OR c.user_two_id = p_user_id)
    ORDER BY m.created_date ASC;
$$;

CREATE OR REPLACE FUNCTION fn_send_message(
    p_user_id BIGINT,
    p_conversation_id BIGINT,
    p_text TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_message_id BIGINT;
BEGIN
    IF NULLIF(trim(p_text), '') IS NULL THEN
        RAISE EXCEPTION 'Message cannot be empty';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM conversations
        WHERE conversation_id = p_conversation_id
          AND (user_one_id = p_user_id OR user_two_id = p_user_id)
    ) THEN
        RAISE EXCEPTION 'Conversation not found or access denied';
    END IF;

    INSERT INTO messages(
        conversation_id, sender_id, message_text
    )
    VALUES (
        p_conversation_id, p_user_id, trim(p_text)
    )
    RETURNING message_id INTO v_message_id;

    UPDATE conversations
    SET updated_date = CURRENT_TIMESTAMP
    WHERE conversation_id = p_conversation_id;

    RETURN v_message_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_mark_conversation_read(
    IN p_user_id BIGINT,
    IN p_conversation_id BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE messages m
    SET is_read = TRUE
    FROM conversations c
    WHERE m.conversation_id = c.conversation_id
      AND c.conversation_id = p_conversation_id
      AND (c.user_one_id = p_user_id OR c.user_two_id = p_user_id)
      AND m.sender_id <> p_user_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_delete_conversation(
    IN p_user_id BIGINT,
    IN p_conversation_id BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM conversations
    WHERE conversation_id = p_conversation_id
      AND (user_one_id = p_user_id OR user_two_id = p_user_id);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conversation not found or access denied';
    END IF;
END;
$$;

-- ============================================================================
-- 38. USER DASHBOARD
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_user_dashboard_stats(
    p_user_id BIGINT
)
RETURNS TABLE(
    total_needs BIGINT,
    total_offers BIGINT,
    total_responses BIGINT,
    total_completed BIGINT,
    average_rating NUMERIC,
    trust_score NUMERIC
)
LANGUAGE sql
AS $$
    SELECT
        (SELECT COUNT(*) FROM needs WHERE user_id = p_user_id),
        (SELECT COUNT(*) FROM offers WHERE user_id = p_user_id),
        (SELECT COUNT(*) FROM responses WHERE user_id = p_user_id),
        (SELECT COUNT(*) FROM needs
         WHERE user_id = p_user_id AND status = 'fulfilled'),
        (SELECT ROUND(AVG(rating_value),2)
         FROM ratings WHERE rated_user_id = p_user_id),
        (SELECT trust_score FROM users WHERE user_id = p_user_id);
$$;

CREATE OR REPLACE FUNCTION fn_user_activity_history(
    p_user_id BIGINT
)
RETURNS TABLE(
    activity_id BIGINT,
    activity_type VARCHAR,
    reference_id BIGINT,
    description TEXT,
    created_date TIMESTAMP
)
LANGUAGE sql
AS $$
    SELECT
        a.activity_id,
        a.activity_type,
        a.reference_id,
        a.description,
        a.created_date
    FROM activity_history a
    WHERE a.user_id = p_user_id
    ORDER BY a.created_date DESC;
$$;

-- ============================================================================
-- 39. DASHBOARD NEARBY DATA
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_dashboard_nearby_needs(
    p_user_id BIGINT,
    p_radius NUMERIC DEFAULT 5
)
RETURNS TABLE(
    id BIGINT,
    title VARCHAR,
    owner VARCHAR,
    distance NUMERIC,
    location VARCHAR,
    urgency VARCHAR
)
LANGUAGE sql
AS $$
    SELECT
        n.need_id,
        n.title,
        u.name,
        NULL::NUMERIC,
        n.location,
        n.urgency
    FROM needs n
    JOIN users u ON u.user_id = n.user_id
    WHERE n.status = 'active'
      AND n.user_id <> p_user_id
      AND u.is_active = TRUE
    ORDER BY n.created_date DESC
    LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION fn_dashboard_nearby_offers(
    p_user_id BIGINT,
    p_radius NUMERIC DEFAULT 5
)
RETURNS TABLE(
    id BIGINT,
    title VARCHAR,
    owner VARCHAR,
    distance NUMERIC,
    location VARCHAR,
    type VARCHAR
)
LANGUAGE sql
AS $$
    SELECT
        o.offer_id,
        o.title,
        u.name,
        NULL::NUMERIC,
        o.location,
        CASE
            WHEN o.pickup_option = 'Can deliver' THEN 'Service'
            ELSE 'Item'
        END
    FROM offers o
    JOIN users u ON u.user_id = o.user_id
    WHERE o.status = 'active'
      AND o.user_id <> p_user_id
      AND u.is_active = TRUE
    ORDER BY o.created_date DESC
    LIMIT 10;
$$;

-- ============================================================================
-- 40. ADMIN
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_register_admin(
    IN p_name VARCHAR,
    IN p_username VARCHAR,
    IN p_email VARCHAR,
    IN p_password TEXT,
    INOUT p_admin_id BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM admin
        WHERE lower(username) = lower(trim(p_username))
           OR lower(email) = lower(trim(p_email))
    ) THEN
        RAISE EXCEPTION 'Admin username or email already exists';
    END IF;

    INSERT INTO admin(name, username, email, password_hash)
    VALUES (
        trim(p_name), trim(p_username), lower(trim(p_email)),
        crypt(p_password, gen_salt('bf'))
    )
    RETURNING admin_id INTO p_admin_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_admin_remove_post(
    IN p_post_type VARCHAR,
    IN p_post_id BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF lower(p_post_type) = 'need' THEN
        UPDATE needs SET status = 'removed' WHERE need_id = p_post_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Need % not found', p_post_id;
        END IF;
    ELSIF lower(p_post_type) = 'offer' THEN
        UPDATE offers SET status = 'removed' WHERE offer_id = p_post_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Offer % not found', p_post_id;
        END IF;
    ELSE
        RAISE EXCEPTION 'post_type must be need or offer';
    END IF;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_admin_deactivate_user(
    IN p_user_id BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE users SET is_active = FALSE WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User % not found', p_user_id;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_admin_dashboard_stats()
RETURNS TABLE(
    total_users BIGINT,
    active_needs BIGINT,
    active_offers BIGINT,
    total_completed BIGINT,
    total_responses BIGINT,
    resolved_today BIGINT,
    pending_responses BIGINT,
    verified_users BIGINT
)
LANGUAGE sql
AS $$
    SELECT
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE),
        (SELECT COUNT(*) FROM needs WHERE status = 'active'),
        (SELECT COUNT(*) FROM offers WHERE status = 'active'),
        (SELECT COUNT(*) FROM needs WHERE status = 'fulfilled'),
        (SELECT COUNT(*) FROM responses),
        (SELECT COUNT(*) FROM needs
         WHERE status = 'fulfilled'
           AND created_date::DATE = CURRENT_DATE),
        (SELECT COUNT(*) FROM responses WHERE status = 'pending'),
        (SELECT COUNT(*) FROM users
         WHERE is_active = TRUE AND is_verified = TRUE);
$$;

-- ============================================================================
-- 41. ADMIN RECENT ACTIVITY
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_admin_recent_activity(
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
    user_name VARCHAR,
    activity_type VARCHAR,
    category VARCHAR,
    status VARCHAR,
    created_date TIMESTAMP
)
LANGUAGE sql
AS $$
    SELECT
        u.name,
        CASE
            WHEN a.activity_type LIKE '%NEED%' THEN 'Need'
            WHEN a.activity_type LIKE '%OFFER%' THEN 'Offer'
            WHEN a.activity_type LIKE '%RESPONSE%' THEN 'Response'
            ELSE a.activity_type
        END,
        COALESCE(
            (
                SELECT c.category_name
                FROM needs n
                LEFT JOIN categories c ON c.category_id = n.category_id
                WHERE n.need_id = a.reference_id
            ),
            (
                SELECT c.category_name
                FROM offers o
                LEFT JOIN categories c ON c.category_id = o.category_id
                WHERE o.offer_id = a.reference_id
            ),
            '—'
        ),
        CASE
            WHEN a.activity_type IN
                ('NEED_POSTED','OFFER_POSTED','RESPONSE_SENT')
                THEN 'Pending'
            WHEN a.activity_type IN
                ('RESPONSE_ACCEPTED','RESPONSE_WAS_ACCEPTED')
                THEN 'Approved'
            WHEN a.activity_type = 'EXCHANGE_COMPLETED'
                THEN 'Verified'
            ELSE 'Info'
        END,
        a.created_date
    FROM activity_history a
    JOIN users u ON u.user_id = a.user_id
    ORDER BY a.created_date DESC
    LIMIT GREATEST(COALESCE(p_limit,20),1);
$$;

-- ============================================================================
-- 42. REPORTING
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_report_need(
    IN p_reporter_id BIGINT,
    IN p_need_id BIGINT,
    IN p_reason TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO reports(reporter_id, need_id, reason)
    VALUES (p_reporter_id, p_need_id, trim(p_reason));
END;
$$;

CREATE OR REPLACE PROCEDURE sp_report_offer(
    IN p_reporter_id BIGINT,
    IN p_offer_id BIGINT,
    IN p_reason TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO reports(reporter_id, offer_id, reason)
    VALUES (p_reporter_id, p_offer_id, trim(p_reason));
END;
$$;

-- ============================================================================
-- 43. SEED CATEGORIES MATCHING CURRENT JSX
-- ============================================================================
INSERT INTO categories(category_name, category_description) VALUES
('Food', 'Meals, groceries and food items'),
('Medicine', 'Medicines and health-related assistance'),
('Transport', 'Rides, pickups and transport help'),
('Tools', 'Hand tools and power tools'),
('Household', 'Household items and assistance'),
('Education', 'Books, tutoring and learning support'),
('Equipment', 'Equipment and useful devices')
ON CONFLICT (category_name) DO NOTHING;

-- ============================================================================
-- ============================================================================
-- 44-45. OPTIONAL DEMO DATA - SINGLE PL/pgSQL BLOCK
-- PostgreSQL does not allow subqueries directly as CALL arguments, and
-- procedures with INOUT parameters require writable variables.  This block
-- handles both requirements safely in one execution.
-- ============================================================================
DO $$
DECLARE
    v_asha_id BIGINT := NULL;
    v_ravi_id BIGINT := NULL;
    v_admin_id BIGINT := NULL;
    v_need_id BIGINT := NULL;
    v_need_id_2 BIGINT := NULL;
    v_offer_id BIGINT := NULL;
    v_offer_id_2 BIGINT := NULL;
BEGIN
    -- Register demo admin
    CALL sp_register_admin(
        'Admin User', 'admin', 'admin@example.com', 'admin123',
        v_admin_id
    );

    -- Register demo users and capture their generated IDs.
    CALL sp_register_user(
        'Asha Menon', 'asha', 'asha@example.com', 'pass123',
        '9876543210', 'Coimbatore',
        5.0, v_asha_id
    );

    CALL sp_register_user(
        'Ravi Kumar', 'ravi', 'ravi@example.com', 'pass456',
        '9123456780', 'Coimbatore',
        5.0, v_ravi_id
    );

    UPDATE users
    SET is_verified = TRUE
    WHERE user_id IN (v_asha_id, v_ravi_id);

    -- Create demo needs.
    CALL sp_post_need(
        v_asha_id,
        'Tools',
        'Borrow a drill for weekend DIY',
        'Looking for a drill for a small home project this weekend.',
        'medium',
        '2 days',
        'Coimbatore',
        5.0,
        NULL,
        ARRAY['Tools']::TEXT[],
        v_need_id
    );

    CALL sp_post_need(
        v_ravi_id,
        'Transport',
        'Emergency ride to hospital',
        'Need urgent local transport support.',
        'emergency',
        'Flexible',
        'Coimbatore',
        5.0,
        NULL,
        ARRAY['Transport']::TEXT[],
        v_need_id_2
    );

    -- Create demo offers.
    CALL sp_post_offer(
        v_ravi_id,
        'Equipment',
        'Laptop repair & setup',
        'Can help with basic laptop repair and setup.',
        'Good',
        'Weekends',
        'Can deliver',
        'Coimbatore',
        5.0,
        NULL,
        ARRAY['Equipment']::TEXT[],
        v_offer_id
    );

    CALL sp_post_offer(
        v_asha_id,
        'Household',
        'Borrow a cycle for evening ride',
        'A cycle is available for a short neighborhood ride.',
        'Good',
        'Evenings',
        'Pickup only',
        'Coimbatore',
        5.0,
        NULL,
        ARRAY['Household']::TEXT[],
        v_offer_id_2
    );
END;
$$;

-- 46. ONE-RUN VERIFICATION
-- These SELECTs do not modify data. They let pgAdmin4 show the result of the
-- complete script immediately after execution.
-- ============================================================================
SELECT 'users' AS object_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 'needs', COUNT(*) FROM needs
UNION ALL
SELECT 'offers', COUNT(*) FROM offers
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'bookmarks', COUNT(*) FROM bookmarks
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
ORDER BY object_name;

SELECT id, title, category, urgency, location, distance,
       requester_name, requester_initial, verified, "time"
FROM fn_search_needs_frontend(5, NULL, 'All', 'All', FALSE, 'latest');

SELECT id, title, category, condition, availability, pickup_option,
       location, distance, owner_name, owner_initial, verified, "time"
FROM fn_search_offers_frontend(5, NULL, 'All', 'All', FALSE, 'latest');
