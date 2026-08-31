-- ==========================================================================
-- AI-Powered Societal Innovation Collaboration Portal
-- PostgreSQL schema (SIH prototype)
-- ==========================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('GOVERNMENT', 'UNIVERSITY', 'INDUSTRY', 'COMMUNITY')),
    description TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('CITIZEN', 'GOVERNMENT', 'UNIVERSITY', 'INDUSTRY', 'ADMIN')),
    organization_id INTEGER REFERENCES organizations(id),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    challenge_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. CH-JH-2026-001
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    domain VARCHAR(100),
    people_affected INTEGER,
    district VARCHAR(100),
    block VARCHAR(100),
    village VARCHAR(100),
    existing_interventions TEXT,
    image_url VARCHAR(500),
    submitted_by INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED'
        CHECK (status IN (
            'SUBMITTED', 'AI_ANALYSIS', 'PENDING_VALIDATION', 'VALIDATED', 'REJECTED',
            'INFO_REQUESTED', 'HEI_MATCHED', 'ADOPTED', 'IN_PROGRESS', 'DEPLOYED', 'CLOSED'
        )),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_ai_analysis (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    domain VARCHAR(100),
    priority VARCHAR(20) CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    severity_score NUMERIC(4,2),
    impact_score NUMERIC(4,2),
    required_skills JSONB,
    embedding_ref VARCHAR(255), -- placeholder reference to a stored embedding vector
    analyzed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS universities (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    expertise_summary TEXT,
    active_projects_count INTEGER DEFAULT 0,
    students_count INTEGER DEFAULT 0,
    faculty_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS university_expertise (
    id SERIAL PRIMARY KEY,
    university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
    domain VARCHAR(100) NOT NULL,
    strength_score NUMERIC(4,2) DEFAULT 0 -- 0-100
);

CREATE TABLE IF NOT EXISTS challenge_matches (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2), -- percentage
    reasons JSONB,
    ranked_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER REFERENCES challenges(id),
    university_id INTEGER REFERENCES universities(id),
    title VARCHAR(255) NOT NULL,
    faculty_mentor VARCHAR(255),
    objectives TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'TEAM_FORMATION'
        CHECK (status IN (
            'TEAM_FORMATION', 'PROTOTYPE', 'TESTING', 'PILOT', 'DEPLOYMENT', 'COMPLETED'
        )),
    industry_partner_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100), -- e.g. Student Lead, Faculty Mentor, Developer
    email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS industry_partners (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    contact_email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS industry_interest (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    industry_partner_id INTEGER REFERENCES industry_partners(id) ON DELETE CASCADE,
    interest_type VARCHAR(50) CHECK (interest_type IN ('EXPRESS_INTEREST', 'MENTORSHIP', 'RESOURCES', 'FUNDING')),
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestones (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    stage VARCHAR(50), -- matches project lifecycle stage
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'DONE')),
    due_date DATE,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS impact_metrics (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    beneficiaries INTEGER,
    schools_reached INTEGER,
    unsafe_usage_reduction_pct NUMERIC(5,2),
    estimated_annual_savings NUMERIC(12,2),
    community_satisfaction_pct NUMERIC(5,2),
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_domain ON challenges(domain);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_matches_challenge ON challenge_matches(challenge_id);
