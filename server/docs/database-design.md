# Database Design: Daily Scrum Master Selector

## Overview

PostgreSQL database schema design for the scrum master rotation application. The schema supports fair rotation algorithms, content management, and team analytics while maintaining data privacy and performance.

### Design Principles

1. **Normalized Schema**: Reduces data redundancy and maintains referential integrity
2. **Privacy-First**: Minimal personal information collection
3. **Performance-Optimized**: Efficient indexes for sub-100ms queries
4. **Scalable**: Supports 10,000+ concurrent teams
5. **Audit Trail**: Complete history preservation for transparency

### Database Configuration

```sql
-- Database settings for optimal performance
-- postgresql.conf settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
max_connections = 200
```

## Core Tables

### teams

Central entity representing scrum teams with sharing and configuration.

```sql
CREATE TABLE teams (
    id VARCHAR(8) PRIMARY KEY,
    short_code VARCHAR(4) UNIQUE NOT NULL,
    name VARCHAR(50) DEFAULT 'Scrum Team',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE,
    admin_session_id VARCHAR(64)
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_teams_short_code ON teams(short_code);
CREATE INDEX idx_teams_last_active_at ON teams(last_active_at) WHERE NOT is_archived;
CREATE INDEX idx_teams_admin_session ON teams(admin_session_id) WHERE admin_session_id IS NOT NULL;

-- Constraints
ALTER TABLE teams ADD CONSTRAINT chk_teams_id_format
    CHECK (id ~ '^[a-zA-Z0-9]{8}$');
ALTER TABLE teams ADD CONSTRAINT chk_teams_short_code_format
    CHECK (short_code ~ '^[A-Z]{4}$');
ALTER TABLE teams ADD CONSTRAINT chk_teams_name_length
    CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 50);
```

**Business Rules:**
- ID: 8-character alphanumeric hash (URL-safe)
- Short code: 4 uppercase letters excluding confusing chars (O, I)
- Auto-archival after 90 days of inactivity
- Admin session tied to browser session

### members

Team members with rotation positions and status tracking.

```sql
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id VARCHAR(8) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(30) NOT NULL,
    position INTEGER NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    last_selected_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_members_team_id ON members(team_id);
CREATE UNIQUE INDEX idx_members_team_position ON members(team_id, position) WHERE is_active;
CREATE INDEX idx_members_team_active ON members(team_id, is_active);
CREATE INDEX idx_members_last_selected ON members(last_selected_at) WHERE last_selected_at IS NOT NULL;

-- Constraints
ALTER TABLE members ADD CONSTRAINT chk_members_name_length
    CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 30);
ALTER TABLE members ADD CONSTRAINT chk_members_position_valid
    CHECK (position >= 0);
```

**Business Rules:**
- Position determines rotation order (0-indexed)
- Name is display-only, no validation beyond length
- Soft delete using is_active flag
- Unique position per team for active members only

### rotation_queues

Maintains current rotation state and algorithm configuration per team.

```sql
CREATE TABLE rotation_queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id VARCHAR(8) UNIQUE NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    current_position INTEGER DEFAULT 0,
    queue_order JSONB NOT NULL,
    last_shuffled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_selections INTEGER DEFAULT 0,
    algorithm VARCHAR(20) DEFAULT 'fair_cycle'
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_rotation_queues_team_id ON rotation_queues(team_id);
CREATE INDEX idx_rotation_queues_algorithm ON rotation_queues(algorithm);

-- Constraints
ALTER TABLE rotation_queues ADD CONSTRAINT chk_rotation_current_position
    CHECK (current_position >= 0);
ALTER TABLE rotation_queues ADD CONSTRAINT chk_rotation_queue_order
    CHECK (jsonb_typeof(queue_order) = 'array');
ALTER TABLE rotation_queues ADD CONSTRAINT chk_rotation_algorithm
    CHECK (algorithm IN ('fair_cycle', 'random', 'manual'));
```

**Business Rules:**
- One rotation queue per team
- queue_order stores array of member UUIDs
- current_position wraps around at array length
- Algorithm field allows future rotation strategies

### selections

Historical record of all scrum master selections for audit and fairness.

```sql
CREATE TABLE selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id VARCHAR(8) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    selected_date DATE NOT NULL,
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    selection_method VARCHAR(20) DEFAULT 'automatic',
    skip_reason TEXT
);

-- Indexes for performance
CREATE INDEX idx_selections_team_id ON selections(team_id);
CREATE INDEX idx_selections_member_id ON selections(member_id);
CREATE UNIQUE INDEX idx_selections_team_date ON selections(team_id, selected_date);
CREATE INDEX idx_selections_date ON selections(selected_date);
CREATE INDEX idx_selections_method ON selections(selection_method);

-- Constraints
ALTER TABLE selections ADD CONSTRAINT chk_selections_method
    CHECK (selection_method IN ('automatic', 'manual_override'));
ALTER TABLE selections ADD CONSTRAINT chk_selections_skip_reason_length
    CHECK (LENGTH(skip_reason) <= 500);
```

**Business Rules:**
- One selection per team per day maximum
- Immutable records (no updates after creation)
- selected_date in team's timezone
- Foreign key constraint prevents member deletion with history

### availability_periods

Tracks out-of-office periods for rotation skipping with overlap support.

```sql
CREATE TABLE availability_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    reason VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_availability_member_id ON availability_periods(member_id);
CREATE INDEX idx_availability_dates ON availability_periods(member_id, start_date, end_date) WHERE is_active;
CREATE INDEX idx_availability_active ON availability_periods(is_active, start_date) WHERE is_active;

-- Constraints
ALTER TABLE availability_periods ADD CONSTRAINT chk_availability_dates
    CHECK (end_date IS NULL OR end_date >= start_date);
ALTER TABLE availability_periods ADD CONSTRAINT chk_availability_reason_length
    CHECK (LENGTH(reason) <= 200);
```

**Business Rules:**
- start_date/end_date in member's team timezone
- end_date = NULL for indefinite unavailability
- Overlapping periods allowed (union logic)
- Soft delete using is_active flag

## Content Management Tables

### standup_tips

Educational content library for daily standup improvement.

```sql
CREATE TABLE standup_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(30) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    target_team_size VARCHAR(20) DEFAULT 'any',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_standup_tips_category ON standup_tips(category, is_active) WHERE is_active;
CREATE INDEX idx_standup_tips_difficulty ON standup_tips(difficulty, is_active) WHERE is_active;
CREATE INDEX idx_standup_tips_team_size ON standup_tips(target_team_size, is_active) WHERE is_active;
CREATE INDEX idx_standup_tips_active ON standup_tips(is_active, created_at) WHERE is_active;

-- Constraints
ALTER TABLE standup_tips ADD CONSTRAINT chk_tips_title_length
    CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 100);
ALTER TABLE standup_tips ADD CONSTRAINT chk_tips_content_length
    CHECK (LENGTH(content) >= 10 AND LENGTH(content) <= 2000);
ALTER TABLE standup_tips ADD CONSTRAINT chk_tips_category
    CHECK (category IN ('time_management', 'engagement', 'problem_solving', 'facilitation', 'retrospectives'));
ALTER TABLE standup_tips ADD CONSTRAINT chk_tips_difficulty
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE standup_tips ADD CONSTRAINT chk_tips_team_size
    CHECK (target_team_size IN ('small', 'medium', 'large', 'any'));
```

**Business Rules:**
- Minimum 50+ active tips to prevent repetition
- Content appropriate for professional environment
- Categorized for targeted delivery
- Updated timestamp for content versioning

### quiz_questions

Daily trivia questions for team engagement and learning.

```sql
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    correct_answer VARCHAR(500) NOT NULL,
    options JSONB NOT NULL,
    category VARCHAR(30) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    explanation TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quiz_category ON quiz_questions(category, is_active) WHERE is_active;
CREATE INDEX idx_quiz_difficulty ON quiz_questions(difficulty, is_active) WHERE is_active;
CREATE INDEX idx_quiz_active ON quiz_questions(is_active, created_at) WHERE is_active;

-- Constraints
ALTER TABLE quiz_questions ADD CONSTRAINT chk_quiz_question_length
    CHECK (LENGTH(question) >= 10 AND LENGTH(question) <= 1000);
ALTER TABLE quiz_questions ADD CONSTRAINT chk_quiz_answer_length
    CHECK (LENGTH(correct_answer) >= 1 AND LENGTH(correct_answer) <= 500);
ALTER TABLE quiz_questions ADD CONSTRAINT chk_quiz_options_format
    CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) >= 2);
ALTER TABLE quiz_questions ADD CONSTRAINT chk_quiz_category
    CHECK (category IN ('tech', 'general', 'team_building', 'agile', 'software_engineering'));
ALTER TABLE quiz_questions ADD CONSTRAINT chk_quiz_difficulty
    CHECK (difficulty IN ('easy', 'medium', 'hard'));
ALTER TABLE quiz_questions ADD CONSTRAINT chk_quiz_explanation_length
    CHECK (explanation IS NULL OR LENGTH(explanation) <= 1000);
```

**Business Rules:**
- Minimum 100+ active questions to prevent repetition
- Options stored as JSON array for flexibility
- Multiple choice format with 2-6 options
- Educational explanations encouraged

### content_views

Tracks content delivery to prevent repetition within specified periods.

```sql
CREATE TABLE content_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id VARCHAR(8) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    content_type VARCHAR(10) NOT NULL,
    content_id UUID NOT NULL,
    viewed_date DATE NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_content_views_team_id ON content_views(team_id);
CREATE UNIQUE INDEX idx_content_views_unique ON content_views(team_id, content_type, content_id, viewed_date);
CREATE INDEX idx_content_views_repetition ON content_views(team_id, content_type, viewed_date);
CREATE INDEX idx_content_views_cleanup ON content_views(viewed_date) WHERE viewed_date < CURRENT_DATE - INTERVAL '60 days';

-- Constraints
ALTER TABLE content_views ADD CONSTRAINT chk_content_type
    CHECK (content_type IN ('tip', 'quiz'));
```

**Business Rules:**
- Prevents tip repetition within 14 days
- Prevents quiz repetition within 30 days
- One view per content item per team per day
- Automatic cleanup of old records

## Analytics and Feedback Tables

### quiz_responses

Captures team quiz participation for engagement analytics.

```sql
CREATE TABLE quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id VARCHAR(8) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    member_name VARCHAR(30),
    answer VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quiz_responses_team_id ON quiz_responses(team_id);
CREATE INDEX idx_quiz_responses_question_id ON quiz_responses(question_id);
CREATE INDEX idx_quiz_responses_team_question ON quiz_responses(team_id, question_id);
CREATE INDEX idx_quiz_responses_correctness ON quiz_responses(question_id, is_correct);

-- Constraints
ALTER TABLE quiz_responses ADD CONSTRAINT chk_quiz_response_answer_length
    CHECK (LENGTH(answer) >= 1 AND LENGTH(answer) <= 500);
ALTER TABLE quiz_responses ADD CONSTRAINT chk_quiz_response_member_length
    CHECK (member_name IS NULL OR LENGTH(member_name) <= 30);
```

**Business Rules:**
- Anonymous participation supported (NULL member_name)
- Answer stored for pattern analysis
- Correctness calculated at submission time
- Team-level aggregation for statistics

### tip_feedback

Collects tip helpfulness ratings for content improvement.

```sql
CREATE TABLE tip_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id VARCHAR(8) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    tip_id UUID NOT NULL REFERENCES standup_tips(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    member_name VARCHAR(30),
    comment TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tip_feedback_team_id ON tip_feedback(team_id);
CREATE INDEX idx_tip_feedback_tip_id ON tip_feedback(tip_id);
CREATE INDEX idx_tip_feedback_rating ON tip_feedback(tip_id, rating);

-- Constraints
ALTER TABLE tip_feedback ADD CONSTRAINT chk_tip_feedback_rating
    CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE tip_feedback ADD CONSTRAINT chk_tip_feedback_member_length
    CHECK (member_name IS NULL OR LENGTH(member_name) <= 30);
ALTER TABLE tip_feedback ADD CONSTRAINT chk_tip_feedback_comment_length
    CHECK (comment IS NULL OR LENGTH(comment) <= 1000);
```

**Business Rules:**
- 1-5 star rating system
- Anonymous feedback supported
- Optional comments for qualitative insights
- Aggregation for content quality metrics

## Views and Computed Data

### active_team_members

View for efficiently querying active team members with rotation info.

```sql
CREATE VIEW active_team_members AS
SELECT
    m.id,
    m.team_id,
    m.name,
    m.position,
    m.joined_at,
    m.last_selected_at,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM availability_periods ap
            WHERE ap.member_id = m.id
            AND ap.is_active = TRUE
            AND CURRENT_DATE BETWEEN ap.start_date AND COALESCE(ap.end_date, CURRENT_DATE)
        ) THEN FALSE
        ELSE TRUE
    END AS is_available_today,
    COALESCE(
        (SELECT COUNT(*) FROM selections s WHERE s.member_id = m.id),
        0
    ) AS total_selections,
    COALESCE(
        CURRENT_DATE - (SELECT MAX(s.selected_date) FROM selections s WHERE s.member_id = m.id),
        999
    ) AS days_since_last_selection
FROM members m
WHERE m.is_active = TRUE;
```

### team_fairness_metrics

View for calculating rotation fairness statistics.

```sql
CREATE VIEW team_fairness_metrics AS
SELECT
    t.id AS team_id,
    t.name AS team_name,
    COUNT(m.id) AS active_members,
    COALESCE(AVG(atm.total_selections), 0) AS avg_selections_per_member,
    COALESCE(STDDEV(atm.total_selections), 0) AS selection_std_deviation,
    CASE
        WHEN COUNT(m.id) > 0 AND STDDEV(atm.total_selections) > 0
        THEN 1 - (STDDEV(atm.total_selections) / NULLIF(AVG(atm.total_selections), 0))
        ELSE 1
    END AS fairness_coefficient
FROM teams t
JOIN members m ON t.id = m.team_id AND m.is_active = TRUE
LEFT JOIN active_team_members atm ON m.id = atm.id
WHERE t.is_archived = FALSE
GROUP BY t.id, t.name;
```

## Functions and Stored Procedures

### get_next_scrum_master

Function to determine next scrum master using fair rotation algorithm.

```sql
CREATE OR REPLACE FUNCTION get_next_scrum_master(p_team_id VARCHAR(8), p_target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    member_id UUID,
    member_name VARCHAR(30),
    selection_method VARCHAR(20),
    confidence VARCHAR(10)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_queue_record rotation_queues%ROWTYPE;
    v_available_members UUID[];
    v_selected_member_id UUID;
    v_selected_member_name VARCHAR(30);
    v_method VARCHAR(20) := 'automatic';
    v_confidence VARCHAR(10) := 'high';
BEGIN
    -- Get rotation queue for team
    SELECT * INTO v_queue_record
    FROM rotation_queues
    WHERE team_id = p_team_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No rotation queue found for team %', p_team_id;
    END IF;

    -- Get available members for target date
    WITH available_members AS (
        SELECT m.id
        FROM members m
        WHERE m.team_id = p_team_id
        AND m.is_active = TRUE
        AND NOT EXISTS (
            SELECT 1 FROM availability_periods ap
            WHERE ap.member_id = m.id
            AND ap.is_active = TRUE
            AND p_target_date BETWEEN ap.start_date AND COALESCE(ap.end_date, p_target_date)
        )
        ORDER BY m.position
    )
    SELECT ARRAY_AGG(id) INTO v_available_members FROM available_members;

    -- Handle edge cases
    IF array_length(v_available_members, 1) IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, 'No one available'::VARCHAR(30), 'automatic'::VARCHAR(20), 'low'::VARCHAR(10);
        RETURN;
    END IF;

    IF array_length(v_available_members, 1) = 1 THEN
        v_confidence := 'medium';
    END IF;

    -- Find next available member in queue order
    FOR i IN 0..jsonb_array_length(v_queue_record.queue_order)-1 LOOP
        v_selected_member_id := (v_queue_record.queue_order->>((v_queue_record.current_position + i) % jsonb_array_length(v_queue_record.queue_order)))::UUID;

        IF v_selected_member_id = ANY(v_available_members) THEN
            EXIT;
        END IF;
    END LOOP;

    -- Get member name
    SELECT name INTO v_selected_member_name
    FROM members
    WHERE id = v_selected_member_id;

    RETURN QUERY SELECT v_selected_member_id, v_selected_member_name, v_method, v_confidence;
END;
$$;
```

### record_selection

Function to record a selection and update rotation queue.

```sql
CREATE OR REPLACE FUNCTION record_selection(
    p_team_id VARCHAR(8),
    p_member_id UUID,
    p_selected_date DATE DEFAULT CURRENT_DATE,
    p_method VARCHAR(20) DEFAULT 'automatic',
    p_skip_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_selection_id UUID;
    v_queue_record rotation_queues%ROWTYPE;
    v_member_position INTEGER;
    v_new_position INTEGER;
BEGIN
    -- Check if selection already exists for this date
    IF EXISTS (SELECT 1 FROM selections WHERE team_id = p_team_id AND selected_date = p_selected_date) THEN
        RAISE EXCEPTION 'Selection already exists for team % on date %', p_team_id, p_selected_date;
    END IF;

    -- Record the selection
    INSERT INTO selections (team_id, member_id, selected_date, selection_method, skip_reason)
    VALUES (p_team_id, p_member_id, p_selected_date, p_method, p_skip_reason)
    RETURNING id INTO v_selection_id;

    -- Update member's last selected timestamp
    UPDATE members
    SET last_selected_at = NOW()
    WHERE id = p_member_id;

    -- Update rotation queue
    SELECT * INTO v_queue_record FROM rotation_queues WHERE team_id = p_team_id;

    -- Find member position in queue
    FOR i IN 0..jsonb_array_length(v_queue_record.queue_order)-1 LOOP
        IF (v_queue_record.queue_order->>i)::UUID = p_member_id THEN
            v_member_position := i;
            EXIT;
        END IF;
    END LOOP;

    -- Calculate new queue position (next after selected member)
    v_new_position := (v_member_position + 1) % jsonb_array_length(v_queue_record.queue_order);

    -- Update rotation queue
    UPDATE rotation_queues
    SET
        current_position = v_new_position,
        total_selections = total_selections + 1
    WHERE team_id = p_team_id;

    RETURN v_selection_id;
END;
$$;
```

## Indexing Strategy

### Primary Indexes

All tables have optimized primary key indexes:
- **UUID columns**: Use btree indexes (default)
- **VARCHAR columns**: Use btree indexes with length consideration
- **Composite keys**: Ordered by query frequency

### Query-Specific Indexes

1. **Team Access Patterns**
```sql
-- Fast team lookup by share code
CREATE UNIQUE INDEX idx_teams_short_code ON teams(short_code);

-- Admin session validation
CREATE INDEX idx_teams_admin_session ON teams(admin_session_id)
WHERE admin_session_id IS NOT NULL;
```

2. **Rotation Performance**
```sql
-- Active team members for rotation
CREATE INDEX idx_members_team_active ON members(team_id, is_active);

-- Selection history by date
CREATE INDEX idx_selections_date ON selections(selected_date);
```

3. **Content Delivery**
```sql
-- Available content selection
CREATE INDEX idx_standup_tips_active ON standup_tips(is_active, created_at)
WHERE is_active;

-- Repetition prevention
CREATE INDEX idx_content_views_repetition ON content_views(team_id, content_type, viewed_date);
```

### Partial Indexes

Optimized indexes for filtered queries:
```sql
-- Only index active records
CREATE INDEX idx_members_active_position ON members(team_id, position)
WHERE is_active = TRUE;

-- Only index future availability periods
CREATE INDEX idx_availability_future ON availability_periods(member_id, start_date)
WHERE is_active = TRUE AND end_date >= CURRENT_DATE;
```

## Performance Optimization

### Query Performance Targets

- **Team lookup**: < 5ms
- **Selection calculation**: < 100ms
- **Content delivery**: < 50ms
- **History queries**: < 200ms
- **Analytics aggregation**: < 500ms

### Optimization Strategies

1. **Connection Pooling**
```sql
-- Connection pool settings
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
```

2. **Query Optimization**
```sql
-- Analyze table statistics regularly
ANALYZE teams;
ANALYZE members;
ANALYZE selections;
```

3. **Partitioning Strategy**
```sql
-- Partition selections by date for large datasets
CREATE TABLE selections_2024 PARTITION OF selections
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Monitoring Queries

Performance monitoring views:

```sql
-- Slow query detection
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- Index usage analysis
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

## Data Lifecycle Management

### Archival Strategy

1. **Team Archival**
```sql
-- Mark teams inactive after 90 days
UPDATE teams
SET is_archived = TRUE
WHERE last_active_at < NOW() - INTERVAL '90 days'
AND NOT is_archived;
```

2. **Data Cleanup**
```sql
-- Clean old content views (keep 60 days)
DELETE FROM content_views
WHERE viewed_date < CURRENT_DATE - INTERVAL '60 days';

-- Archive old quiz responses (keep 1 year)
DELETE FROM quiz_responses
WHERE responded_at < NOW() - INTERVAL '1 year';
```

### Backup Strategy

1. **Full Backup** (Weekly)
```bash
pg_dump -Fc scrummaster_db > backup_$(date +%Y%m%d).dump
```

2. **Incremental Backup** (Daily)
```sql
-- WAL archiving for point-in-time recovery
archive_mode = on
archive_command = 'cp %p /backup/archive/%f'
```

### Migration Support

1. **Team Export**
```sql
-- Export complete team data
SELECT json_build_object(
    'team', row_to_json(t),
    'members', (SELECT json_agg(row_to_json(m)) FROM members m WHERE m.team_id = t.id),
    'selections', (SELECT json_agg(row_to_json(s)) FROM selections s WHERE s.team_id = t.id),
    'rotation_queue', (SELECT row_to_json(rq) FROM rotation_queues rq WHERE rq.team_id = t.id)
) as team_export
FROM teams t
WHERE t.id = $1;
```

2. **Team Import**
```sql
-- Import team data with conflict resolution
INSERT INTO teams (id, short_code, name, timezone, created_at)
VALUES (...)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    timezone = EXCLUDED.timezone;
```

## Security Considerations

### Data Encryption

1. **At Rest**
```sql
-- Enable database encryption
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = 'server.crt';
ALTER SYSTEM SET ssl_key_file = 'server.key';
```

2. **In Transit**
```sql
-- Force SSL connections
ALTER SYSTEM SET ssl_mode = 'require';
```

### Access Control

1. **Application User**
```sql
-- Limited privileges for application
CREATE USER scrummaster_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE scrummaster_db TO scrummaster_app;
GRANT USAGE ON SCHEMA public TO scrummaster_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO scrummaster_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO scrummaster_app;
```

2. **Read-Only Analytics**
```sql
-- Analytics user with limited access
CREATE USER scrummaster_analytics WITH PASSWORD 'analytics_password';
GRANT CONNECT ON DATABASE scrummaster_db TO scrummaster_analytics;
GRANT SELECT ON teams, members, selections, quiz_responses, tip_feedback TO scrummaster_analytics;
```

### Audit Logging

1. **Connection Logging**
```sql
log_connections = on
log_disconnections = on
log_duration = on
log_statement = 'mod'
```

2. **Data Changes**
```sql
-- Trigger-based audit trail for sensitive operations
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50),
    operation VARCHAR(10),
    old_values JSONB,
    new_values JSONB,
    user_name VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Disaster Recovery

### Recovery Procedures

1. **Point-in-Time Recovery**
```bash
# Restore from backup to specific timestamp
pg_restore -d scrummaster_db backup_20240115.dump
```

2. **Corruption Recovery**
```sql
-- Regenerate rotation queues if corrupted
TRUNCATE rotation_queues;
INSERT INTO rotation_queues (team_id, queue_order, current_position)
SELECT
    t.id,
    jsonb_agg(m.id ORDER BY m.position),
    0
FROM teams t
JOIN members m ON t.id = m.team_id AND m.is_active = TRUE
WHERE NOT t.is_archived
GROUP BY t.id;
```

### Health Monitoring

1. **Database Health Checks**
```sql
-- Monitor critical metrics
SELECT
    'teams' as table_name,
    COUNT(*) as total_rows,
    COUNT(*) FILTER (WHERE NOT is_archived) as active_rows
FROM teams
UNION ALL
SELECT
    'active_members',
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active)
FROM members;
```

2. **Performance Monitoring**
```sql
-- Key performance indicators
SELECT
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_tup_hot_upd as hot_updates
FROM pg_stat_user_tables
WHERE tablename IN ('teams', 'members', 'selections', 'rotation_queues');
```