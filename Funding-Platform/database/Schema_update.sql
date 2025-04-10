-- ===============================================
-- FUNDING PLATFORM DATABASE REBUILD SCRIPT
-- ===============================================
-- This script completely rebuilds the database with all required tables
-- and proper relationships, constraints, and indexes.
-- It also includes sample data for testing purposes.

-- Start by dropping all existing tables if they exist (in reverse order of dependencies)
DO $$ 
DECLARE
    tables TEXT[] := ARRAY[
        'interaction_reactions', 'project_interactions', 'user_achievements', 'achievement_definitions',
        'investment_simulations', 'syndicate_votes', 'syndicate_members', 'investor_syndicates',
        'milestone_documents', 'milestone_verifications', 'escrow_disputes', 'escrow_accounts',
        'state_transitions', 'messages', 'notifications', 'transactions', 'investments',
        'investors', 'team_members', 'project_documents', 'project_updates', 'milestones',
        'projects', 'user_sessions', 'wallets', 'txn_status_table', 'transaction_types',
        'payment_methods', 'users'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || t || ' CASCADE';
    END LOOP;
END $$;

-- Also drop types and extensions
DO $$ 
DECLARE
    types TEXT[] := ARRAY[
        'achievement_type', 'interaction_type', 'badge_level', 'user_role', 'user_status',
        'project_status', 'milestone_status', 'txn_status_enum', 'syndicate_status',
        'notification_priority', 'entity_type'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY types
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || t || ' CASCADE';
    END LOOP;
END $$;

-- ===============================================
-- SETUP EXTENSIONS
-- ===============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================
-- CREATE ENUMERATION TYPES
-- ===============================================

-- Create enumeration types for status values
CREATE TYPE user_role AS ENUM ('Admin', 'Investor', 'Innovator', 'EscrowManager');
CREATE TYPE user_status AS ENUM ('PendingApproval', 'Verified', 'Rejected', 'Suspended');
CREATE TYPE project_status AS ENUM ('Draft', 'PendingApproval', 'SeekingFunding', 'PartiallyFunded', 'FullyFunded', 'InProgress', 'UnderReview', 'Declining', 'Restructuring', 'Completed', 'Rejected');
CREATE TYPE milestone_status AS ENUM ('Planned', 'Active', 'InProgress', 'Completed', 'PendingVerification', 'Approved', 'Rejected');
CREATE TYPE txn_status_enum AS ENUM ('Initiated', 'Pending', 'Verified', 'Completed', 'Rejected', 'Canceled');
CREATE TYPE syndicate_status AS ENUM ('Proposed', 'Forming', 'Active', 'Completed', 'Dissolved', 'Canceled');
CREATE TYPE notification_priority AS ENUM ('critical', 'important', 'standard', 'informational');
CREATE TYPE entity_type AS ENUM ('user', 'project', 'milestone', 'transaction', 'syndicate', 'escrow');
CREATE TYPE achievement_type AS ENUM (
    'first_investment',
    'first_syndicate',
    'milestone_completed',
    'project_funded',
    'project_completed',
    'referral_completed',
    'social_share',
    'feedback_provided',
    'top_investor',
    'sdg_supporter',
    'early_adopter',
    'profile_completed'
);
CREATE TYPE interaction_type AS ENUM (
    'like',
    'question',
    'comment',
    'endorsement',
    'share'
);
CREATE TYPE badge_level AS ENUM (
    'bronze',
    'silver',
    'gold',
    'platinum'
);
-- ===============================================
-- CREATE TABLES - CORE ENTITIES
-- ===============================================

-- 1. Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    address TEXT,
    date_of_birth DATE NOT NULL,
    role user_role NOT NULL,
    status user_status DEFAULT 'PendingApproval',
    profile_image_url VARCHAR(255),
    reset_token UUID,
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user email
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- 2. Wallets table
CREATE TABLE wallets (
    wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_wallet UNIQUE (user_id)
);

CREATE INDEX idx_wallets_user ON wallets(user_id);

-- 3. Transaction types table
CREATE TABLE transaction_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- 4. Transaction status table
CREATE TABLE txn_status_table (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- 5. Payment methods table
CREATE TABLE payment_methods (
    method_id SERIAL PRIMARY KEY,
    method_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. Transactions table
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(wallet_id),
    type_id INTEGER NOT NULL REFERENCES transaction_types(type_id),
    status_id INTEGER NOT NULL REFERENCES txn_status_table(status_id),
    amount DECIMAL(15, 2) NOT NULL,
    payment_method_id INTEGER REFERENCES payment_methods(method_id),
    external_reference VARCHAR(255),
    proof_document_path VARCHAR(500),
    notes TEXT,
    reference_id UUID, -- Optional reference to relevant entity (project_id, escrow_id, etc.)
    reference_type VARCHAR(50), -- Type of entity referenced (project, escrow, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(user_id)
);

-- Create indexes on transactions
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_type_id ON transactions(type_id);
CREATE INDEX idx_transactions_status_id ON transactions(status_id);
CREATE INDEX idx_transactions_reference_id ON transactions(reference_id);

-- 7. Projects table
CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    innovator_id UUID NOT NULL REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    short_description VARCHAR(500) NOT NULL,
    full_description TEXT,
    impact_statement TEXT,
    category VARCHAR(100) NOT NULL,
    status project_status DEFAULT 'Draft',
    funding_goal DECIMAL(15, 2) NOT NULL,
    min_investment DECIMAL(15, 2) DEFAULT 1000.00,
    current_funding DECIMAL(15, 2) DEFAULT 0.00,
    duration_months INTEGER DEFAULT 12,
    share_price DECIMAL(15, 2),
    sdg_alignment TEXT[] DEFAULT '{}',
    geo_focus VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_date TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    -- Social/interactive fields
    social_score INTEGER DEFAULT 0,
    trending_rank INTEGER,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    featured_until TIMESTAMP WITH TIME ZONE
);

-- Create indexes on projects
CREATE INDEX idx_projects_innovator ON projects(innovator_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);

-- 8. Milestones table
CREATE TABLE milestones (
    milestone_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    target_completion_date TIMESTAMP WITH TIME ZONE,
    actual_completion_date TIMESTAMP WITH TIME ZONE,
    funding_required DECIMAL(15, 2) NOT NULL,
    status milestone_status DEFAULT 'Planned',
    display_order INTEGER,
    verification_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    celebration_triggered BOOLEAN DEFAULT FALSE,
    celebration_message TEXT
);

-- Create indexes on milestones
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);

-- 9. Milestone verification table
CREATE TABLE milestone_verifications (
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID NOT NULL REFERENCES milestones(milestone_id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(user_id),
    status VARCHAR(50) DEFAULT 'PendingReview',
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verification_date TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(user_id),
    rejection_reason TEXT,
    quality_score DECIMAL(3, 1),
    notes TEXT
);

CREATE INDEX idx_milestone_verifications_milestone ON milestone_verifications(milestone_id);

-- 10. Investors table (extension of users)
CREATE TABLE investors (
    investor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    preferred_sdg TEXT[] DEFAULT '{}',
    preferred_geo TEXT[] DEFAULT '{}',
    investment_min DECIMAL(15, 2),
    investment_max DECIMAL(15, 2),
    accredited_investor BOOLEAN DEFAULT FALSE,
    kyc_verified BOOLEAN DEFAULT FALSE,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    impact_score INTEGER DEFAULT 0,
    achievement_points INTEGER DEFAULT 0,
    activity_level VARCHAR(20) DEFAULT 'new',
    syndicate_reputation DECIMAL(3,1),
    CONSTRAINT unique_user_investor UNIQUE (user_id)
);

-- Create index on investors
CREATE INDEX idx_investors_user ON investors(user_id);

-- 11. Investments table
CREATE TABLE investments (
    investment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_id UUID NOT NULL REFERENCES investors(investor_id),
    project_id UUID NOT NULL REFERENCES projects(project_id),
    amount DECIMAL(15, 2) NOT NULL,
    share_count INTEGER,
    share_percentage DECIMAL(5, 2),
    share_price DECIMAL(15, 2),
    investment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    impact_score INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    investment_note TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE
);

-- Create indexes on investments
CREATE INDEX idx_investments_investor ON investments(investor_id);
CREATE INDEX idx_investments_project ON investments(project_id);

-- 12. Escrow accounts table
CREATE TABLE escrow_accounts (
    escrow_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID NOT NULL REFERENCES milestones(milestone_id),
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Locked', 'Released', 'Returned', 'Partially_Released')),
    return_reason TEXT,
    partial_amount DECIMAL(15, 2),
    released_by UUID REFERENCES users(user_id),
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_escrow_accounts_milestone_id ON escrow_accounts(milestone_id);
CREATE INDEX idx_escrow_accounts_status ON escrow_accounts(status);

-- 13. Escrow disputes table
CREATE TABLE escrow_disputes (
    dispute_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrow_accounts(escrow_id),
    raised_by UUID NOT NULL REFERENCES users(user_id),
    reason VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Open', 'Resolved', 'Closed')),
    resolution TEXT,
    resolution_action VARCHAR(50) CHECK (resolution_action IN ('release', 'return', 'partial_release')),
    resolution_amount DECIMAL(15, 2),
    resolved_by UUID REFERENCES users(user_id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index for performance
CREATE INDEX idx_escrow_disputes_escrow_id ON escrow_disputes(escrow_id);

-- 14. Notifications table
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type entity_type,
    related_entity_id UUID,
    priority notification_priority DEFAULT 'standard',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    target_role user_role -- If null, targeted to specific user_id, otherwise to all users with role
);

-- Create indexes on notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_role ON notifications(target_role);

-- 15. State transitions table (audit log)
CREATE TABLE state_transitions (
    transition_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL,
    entity_type entity_type NOT NULL,
    from_state VARCHAR(50) NOT NULL,
    to_state VARCHAR(50) NOT NULL,
    reason TEXT,
    performed_by UUID REFERENCES users(user_id),
    transition_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on state transitions
CREATE INDEX idx_state_transitions_entity ON state_transitions(entity_id, entity_type);
CREATE INDEX idx_state_transitions_date ON state_transitions(transition_date);

-- ===============================================
-- CREATE TABLES - ADDITIONAL FEATURES
-- ===============================================

-- 16. Project updates table
CREATE TABLE project_updates (
    update_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    attachment_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id)
);

CREATE INDEX idx_project_updates_project ON project_updates(project_id);

-- 17. Project documents table
CREATE TABLE project_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by UUID REFERENCES users(user_id),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    document_type VARCHAR(100),
    file_size INTEGER,
    is_public BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_project_documents_project ON project_documents(project_id);

-- 18. Team members table
CREATE TABLE team_members (
    member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    bio TEXT,
    contact_email VARCHAR(255),
    social_links JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_team_members_project ON team_members(project_id);

-- 19. Milestone documents table
CREATE TABLE milestone_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_id UUID NOT NULL REFERENCES milestone_verifications(verification_id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by UUID REFERENCES users(user_id),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    document_type VARCHAR(100),
    file_size INTEGER
);

CREATE INDEX idx_milestone_documents_verification ON milestone_documents(verification_id);

-- 20. Investor syndicates table
CREATE TABLE investor_syndicates (
    syndicate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID NOT NULL REFERENCES projects(project_id),
    initiator_id UUID NOT NULL REFERENCES investors(investor_id),
    min_contribution DECIMAL(15, 2) NOT NULL,
    voting_threshold DECIMAL(5, 2) NOT NULL,
    status syndicate_status DEFAULT 'Proposed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investor_syndicates_project ON investor_syndicates(project_id);
CREATE INDEX idx_investor_syndicates_initiator ON investor_syndicates(initiator_id);

-- 21. Syndicate members table
CREATE TABLE syndicate_members (
    syndicate_id UUID NOT NULL REFERENCES investor_syndicates(syndicate_id),
    member_id UUID NOT NULL REFERENCES investors(investor_id),
    contribution_amount DECIMAL(15, 2) NOT NULL,
    voting_power DECIMAL(5, 2) DEFAULT 0.00,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (syndicate_id, member_id)
);

CREATE INDEX idx_syndicate_members_member ON syndicate_members(member_id);

-- 22. Syndicate votes table
CREATE TABLE syndicate_votes (
    verification_id UUID NOT NULL REFERENCES milestone_verifications(verification_id),
    member_id UUID NOT NULL REFERENCES investors(investor_id),
    vote BOOLEAN NOT NULL,
    comment TEXT,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (verification_id, member_id)
);

CREATE INDEX idx_syndicate_votes_member ON syndicate_votes(member_id);

-- 23. User sessions table
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- 24. Messages table
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES users(user_id),
    to_user_id UUID NOT NULL REFERENCES users(user_id),
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    related_entity_type entity_type,
    related_entity_id UUID,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    response_id UUID REFERENCES messages(message_id)
);

CREATE INDEX idx_messages_from ON messages(from_user_id);
CREATE INDEX idx_messages_to ON messages(to_user_id);
CREATE INDEX idx_messages_read ON messages(read);
CREATE INDEX idx_messages_created ON messages(created_at);

-- 25. Achievement definitions table
CREATE TABLE achievement_definitions (
    achievement_code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    achievement_type achievement_type NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    badge_level badge_level,
    icon_path VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    achievement_conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievement_definitions_type ON achievement_definitions(achievement_type);

-- 26. User achievements table
CREATE TABLE user_achievements (
    user_achievement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    achievement_code VARCHAR(50) NOT NULL REFERENCES achievement_definitions(achievement_code),
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    related_entity_id UUID,
    related_entity_type entity_type,
    progress INTEGER DEFAULT 100, -- For partial achievements (percentage)
    metadata JSONB,
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_code)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_code ON user_achievements(achievement_code);

-- 27. Investment simulations table
CREATE TABLE investment_simulations (
    simulation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    simulated_share_percentage DECIMAL(5, 2),
    simulated_share_count INTEGER,
    simulated_voting_power DECIMAL(5, 2),
    simulated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    converted_to_investment BOOLEAN DEFAULT FALSE,
    conversion_date TIMESTAMP WITH TIME ZONE,
    investment_id UUID REFERENCES investments(investment_id),
    metadata JSONB
);

CREATE INDEX idx_investment_simulations_user ON investment_simulations(user_id);
CREATE INDEX idx_investment_simulations_project ON investment_simulations(project_id);
CREATE INDEX idx_investment_simulations_converted ON investment_simulations(converted_to_investment);

-- 28. Project social interactions table
CREATE TABLE project_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    interaction_type interaction_type NOT NULL,
    content TEXT,
    parent_interaction_id UUID REFERENCES project_interactions(interaction_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    hidden_reason TEXT
);

CREATE INDEX idx_project_interactions_project ON project_interactions(project_id);
CREATE INDEX idx_project_interactions_user ON project_interactions(user_id);
CREATE INDEX idx_project_interactions_type ON project_interactions(interaction_type);
CREATE INDEX idx_project_interactions_parent ON project_interactions(parent_interaction_id);

-- 29. Interaction reactions table
CREATE TABLE interaction_reactions (
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    interaction_id UUID NOT NULL REFERENCES project_interactions(interaction_id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL, -- 'like', 'helpful', 'insightful', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, interaction_id, reaction_type)
);

-- 30. Performance metrics table
CREATE TABLE performance_metrics (
    metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    measurement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    schedule_variance DECIMAL(5, 2),
    budget_efficiency DECIMAL(5, 2),
    quality_index DECIMAL(3, 1),
    responsiveness DECIMAL(5, 2),
    overall_score DECIMAL(5, 2),
    flag_status VARCHAR(50), -- none, yellow, red
    notes TEXT,
    CONSTRAINT unique_project_date UNIQUE (project_id, measurement_date)
);

CREATE INDEX idx_performance_metrics_project ON performance_metrics(project_id);
CREATE INDEX idx_performance_metrics_date ON performance_metrics(measurement_date);

-- ===============================================
-- CREATE FUNCTIONS AND TRIGGERS
-- ===============================================

-- 1. Function to update modified timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to update escrow account timestamp
CREATE OR REPLACE FUNCTION update_escrow_account_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status AND 
       NEW.status IN ('Released', 'Returned', 'Partially_Released') THEN
        NEW.released_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to record state transitions
CREATE OR REPLACE FUNCTION record_state_transition(
    p_entity_id UUID,
    p_entity_type entity_type,
    p_from_state VARCHAR(50),
    p_to_state VARCHAR(50),
    p_performed_by UUID,
    p_reason TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_transition_id UUID;
BEGIN
    INSERT INTO state_transitions(
        entity_id,
        entity_type,
        from_state,
        to_state,
        performed_by,
        reason,
        transition_date
    ) VALUES (
        p_entity_id,
        p_entity_type,
        p_from_state,
        p_to_state,
        p_performed_by,
        p_reason,
        CURRENT_TIMESTAMP
    ) RETURNING transition_id INTO v_transition_id;
    
    RETURN v_transition_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to handle project state changes
CREATE OR REPLACE FUNCTION handle_project_state_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to FullyFunded, update start_date
    IF NEW.status = 'FullyFunded' AND OLD.status != 'FullyFunded' THEN
        NEW.start_date = NOW();
    END IF;
    
    -- If status changed to Completed, update end_date
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        NEW.end_date = NOW();
    END IF;
    
    -- If status changed to PendingApproval, update submitted_date
    IF NEW.status = 'PendingApproval' AND OLD.status != 'PendingApproval' THEN
        NEW.submitted_date = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to handle milestone completion
CREATE OR REPLACE FUNCTION handle_milestone_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to Approved, update actual_completion_date
    IF NEW.status = 'Approved' AND OLD.status != 'Approved' THEN
        NEW.actual_completion_date = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to auto-activate next milestone
CREATE OR REPLACE FUNCTION activate_next_milestone()
RETURNS TRIGGER AS $$
DECLARE
    next_milestone_id UUID;
BEGIN
    -- Only proceed if current milestone was approved
    IF NEW.status = 'Approved' AND OLD.status != 'Approved' THEN
        -- Find the next milestone in sequence
        SELECT milestone_id INTO next_milestone_id
        FROM milestones
        WHERE 
            project_id = NEW.project_id AND
            status = 'Planned' AND
            (display_order IS NULL OR 
             display_order > (SELECT COALESCE(display_order, 0) FROM milestones WHERE milestone_id = NEW.milestone_id))
        ORDER BY COALESCE(display_order, 999), created_at
        LIMIT 1;
        
        -- If a next milestone exists, activate it
        IF next_milestone_id IS NOT NULL THEN
            UPDATE milestones
            SET status = 'Active'
            WHERE milestone_id = next_milestone_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to update trending projects (continued)
CREATE OR REPLACE FUNCTION update_trending_projects()
RETURNS VOID AS $$
BEGIN
    -- Calculate trending rank based on recent activity and social score
    UPDATE projects p
    SET trending_rank = subquery.rank
    FROM (
        SELECT 
            project_id, 
            RANK() OVER (
                ORDER BY 
                    -- Recent activity weighted more heavily
                    CASE 
                        WHEN last_activity_at > NOW() - INTERVAL '24 hours' THEN social_score * 3
                        WHEN last_activity_at > NOW() - INTERVAL '3 days' THEN social_score * 2
                        WHEN last_activity_at > NOW() - INTERVAL '7 days' THEN social_score * 1.5
                        ELSE social_score
                    END DESC,
                    -- Then by funding percentage
                    (current_funding / funding_goal) DESC,
                    -- Then by creation date (newer first)
                    created_at DESC
            ) as rank
        FROM projects
        WHERE status IN ('SeekingFunding', 'PartiallyFunded')
    ) AS subquery
    WHERE p.project_id = subquery.project_id;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- CREATE STATE TRANSITION FUNCTIONS
-- ===============================================

-- Create functions to track state changes
CREATE OR REPLACE FUNCTION track_user_state_changes() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM record_state_transition(
            NEW.user_id,
            'user',
            OLD.status::VARCHAR,
            NEW.status::VARCHAR,
            COALESCE(current_setting('app.current_user_id', true)::UUID, NEW.user_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION track_project_state_changes() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM record_state_transition(
            NEW.project_id,
            'project',
            OLD.status::VARCHAR,
            NEW.status::VARCHAR,
            COALESCE(current_setting('app.current_user_id', true)::UUID, NEW.innovator_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION track_milestone_state_changes() RETURNS TRIGGER AS $$
DECLARE
    v_project_innovator_id UUID;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Get the project innovator for this milestone
        SELECT p.innovator_id INTO v_project_innovator_id
        FROM projects p
        JOIN milestones m ON p.project_id = m.project_id
        WHERE m.milestone_id = NEW.milestone_id;

        PERFORM record_state_transition(
            NEW.milestone_id,
            'milestone',
            OLD.status::VARCHAR,
            NEW.status::VARCHAR,
            COALESCE(current_setting('app.current_user_id', true)::UUID, v_project_innovator_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- CREATE TRIGGERS
-- ===============================================

-- 1. Timestamps update triggers
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_wallets_modtime
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_transactions_modtime
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_projects_modtime
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_milestones_modtime
    BEFORE UPDATE ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_investors_modtime
    BEFORE UPDATE ON investors
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_investments_modtime
    BEFORE UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_escrow_timestamp_general
    BEFORE UPDATE ON escrow_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_escrow_dispute_timestamp
    BEFORE UPDATE ON escrow_disputes
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 2. Escrow status change trigger
CREATE TRIGGER update_escrow_timestamp_status
    BEFORE UPDATE ON escrow_accounts
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_escrow_account_timestamp();

-- 3. State tracking triggers
CREATE TRIGGER user_state_change_trigger
    AFTER UPDATE ON users
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION track_user_state_changes();

CREATE TRIGGER project_state_change_trigger
    AFTER UPDATE ON projects
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION track_project_state_changes();

CREATE TRIGGER milestone_state_change_trigger
    AFTER UPDATE ON milestones
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION track_milestone_state_changes();

-- 4. Project and milestone triggers
CREATE TRIGGER handle_project_state_trigger
    BEFORE UPDATE ON projects
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION handle_project_state_change();

CREATE TRIGGER handle_milestone_completion_trigger
    BEFORE UPDATE ON milestones
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION handle_milestone_completion();

CREATE TRIGGER activate_next_milestone_trigger
    AFTER UPDATE ON milestones
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION activate_next_milestone();

-- ===============================================
-- INSERT DEFAULT DATA
-- ===============================================

-- 1. Insert transaction types
INSERT INTO transaction_types (type_name, description) VALUES
('deposit', 'Funds deposited into wallet'),
('withdrawal', 'Funds withdrawn from wallet'),
('investment', 'Funds invested in a project'),
('escrow_lock', 'Funds locked in escrow'),
('escrow_release', 'Funds released from escrow'),
('escrow_return', 'Funds returned from escrow'),
('escrow_partial_release', 'Funds partially released from escrow'),
('fee', 'Platform fee'),
('return', 'Investment return payment');

-- 2. Insert transaction status values
INSERT INTO txn_status_table (status_name, description) VALUES
('initiated', 'Transaction has been initiated'),
('pending', 'Transaction is pending verification'),
('verified', 'Transaction has been verified'),
('completed', 'Transaction has been completed'),
('rejected', 'Transaction has been rejected'),
('canceled', 'Transaction has been canceled');

-- 3. Insert payment methods
INSERT INTO payment_methods (method_name, description) VALUES
('bank_transfer', 'Bank transfer or wire'),
('credit_card', 'Credit or debit card'),
('cryptocurrency', 'Cryptocurrency payment'),
('platform_credit', 'Platform credit or internal transfer');

-- 4. Insert achievement definitions
INSERT INTO achievement_definitions 
(achievement_code, name, description, achievement_type, points, badge_level, icon_path) 
VALUES
('FIRST_INVESTMENT', 'First Investment', 'Made your first investment in a project', 'first_investment', 100, 'bronze', '/images/achievements/first_investment.png'),
('FIRST_SYNDICATE', 'Syndicate Leader', 'Created your first investment syndicate', 'first_syndicate', 200, 'silver', '/images/achievements/first_syndicate.png'),
('MILESTONE_MASTER', 'Milestone Master', 'Funded a project that completed 5 milestones', 'milestone_completed', 300, 'gold', '/images/achievements/milestone_master.png'),
('PROJECT_FUNDER', 'Project Funder', 'Helped a project reach its funding goal', 'project_funded', 150, 'silver', '/images/achievements/project_funder.png'),
('PROJECT_COMPLETER', 'Project Completer', 'Invested in a project that reached completion', 'project_completed', 500, 'gold', '/images/achievements/project_completer.png'),
('SOCIAL_BUTTERFLY', 'Social Butterfly', 'Shared 10 projects on social media', 'social_share', 100, 'bronze', '/images/achievements/social_butterfly.png'),
('SDG_CHAMPION', 'SDG Champion', 'Invested in projects supporting all 17 SDGs', 'sdg_supporter', 1000, 'platinum', '/images/achievements/sdg_champion.png'),
('PERFECT_PROFILE', 'Perfect Profile', 'Completed 100% of your profile information', 'profile_completed', 50, 'bronze', '/images/achievements/perfect_profile.png');

-- ===============================================
-- CREATE SAMPLE USERS
-- ===============================================

-- Create admin user with password 'password'
INSERT INTO users (
    email, password_hash, full_name, phone_number, date_of_birth, role, status
) VALUES (
    'admin@innocapforge.com',
    '$2b$10$3euPcmQFCiblsZeEu5s7p.9wVJRzVJCVpKP85YEQBZIhc.bvW.k9a',
    'System Administrator',
    '+1-555-123-4567',
    '1980-01-01',
    'Admin',
    'Verified'
);

-- Create escrow manager user with password 'password'
INSERT INTO users (
    email, password_hash, full_name, phone_number, date_of_birth, role, status
) VALUES (
    'escrow@innocapforge.com',
    '$2b$10$MKugOc.0ywSYQQ1MUySQWelEvkHWMHEPIdI0G4HE/.eMsz9hm1Lky',
    'Escrow Manager',
    '+1-555-765-4321',
    '1985-05-15',
    'EscrowManager',
    'Verified'
);

-- Create Innovator users with password 'password'
INSERT INTO users (
    email, password_hash, full_name, phone_number, date_of_birth, role, status
) VALUES (
    'john@example.com',
    '$2b$10$ukrtPFHt9mfz44oyPSJ7XeG57WpqMC8vNsndROZ0U91aTUX5lYzgu',
    'John Doe',
    '+1-555-123-1111',
    '1982-06-15',
    'Innovator',
    'Verified'
);

INSERT INTO users (
    email, password_hash, full_name, phone_number, date_of_birth, role, status
) VALUES (
    'sarah@example.com',
    '$2b$10$ukrtPFHt9mfz44oyPSJ7XeG57WpqMC8vNsndROZ0U91aTUX5lYzgu',
    'Sarah Johnson',
    '+1-555-123-2222',
    '1985-08-22',
    'Innovator',
    'Verified'
);

-- Create Investor users with password 'password'
INSERT INTO users (
    email, password_hash, full_name, phone_number, date_of_birth, role, status
) VALUES (
    'michael@example.com',
    '$2b$10$ukrtPFHt9mfz44oyPSJ7XeG57WpqMC8vNsndROZ0U91aTUX5lYzgu',
    'Michael Brown',
    '+1-555-123-3333',
    '1975-03-10',
    'Investor',
    'Verified'
);

INSERT INTO users (
    email, password_hash, full_name, phone_number, date_of_birth, role, status
) VALUES (
    'emily@example.com',
    '$2b$10$ukrtPFHt9mfz44oyPSJ7XeG57WpqMC8vNsndROZ0U91aTUX5lYzgu',
    'Emily Chen',
    '+1-555-123-4444',
    '1980-11-05',
    'Investor',
    'Verified'
);

-- ===============================================
-- CREATE WALLETS & INVESTOR PROFILES
-- ===============================================

-- Create wallets for each user
DO $$
DECLARE
    admin_id UUID;
    escrow_id UUID;
    john_id UUID;
    sarah_id UUID;
    michael_id UUID;
    emily_id UUID;
BEGIN
    -- Get user IDs
    SELECT user_id INTO admin_id FROM users WHERE email = 'admin@innocapforge.com';
    SELECT user_id INTO escrow_id FROM users WHERE email = 'escrow@innocapforge.com';
    SELECT user_id INTO john_id FROM users WHERE email = 'john@example.com';
    SELECT user_id INTO sarah_id FROM users WHERE email = 'sarah@example.com';
    SELECT user_id INTO michael_id FROM users WHERE email = 'michael@example.com';
    SELECT user_id INTO emily_id FROM users WHERE email = 'emily@example.com';
    
    -- Create wallets for each user
    INSERT INTO wallets (user_id, balance) VALUES
    (admin_id, 10000.00),
    (escrow_id, 5000.00),
    (john_id, 5000.00),
    (sarah_id, 3500.00),
    (michael_id, 150000.00),
    (emily_id, 200000.00);
    
    -- Create investor profiles for the investor users
    INSERT INTO investors (
        user_id, preferred_sdg, preferred_geo, investment_min, investment_max, 
        accredited_investor, kyc_verified, bio
    ) VALUES (
        michael_id,
        ARRAY['SDG 2', 'SDG 6', 'SDG 7'], -- Zero Hunger, Clean Water, Clean Energy
        ARRAY['Africa', 'Southeast Asia'],
        5000.00,
        100000.00,
        TRUE,
        TRUE,
        'Impact investor focused on sustainable agriculture and clean water projects.'
    );
    
    INSERT INTO investors (
        user_id, preferred_sdg, preferred_geo, investment_min, investment_max, 
        accredited_investor, kyc_verified, bio
    ) VALUES (
        emily_id,
        ARRAY['SDG 6', 'SDG 7', 'SDG 13'], -- Clean Water, Clean Energy, Climate Action
        ARRAY['India', 'Southeast Asia', 'Africa'],
        10000.00,
        250000.00,
        TRUE,
        TRUE,
        'Tech entrepreneur turned impact investor with a focus on climate solutions.'
    );
END $$;

-- ===============================================
-- CREATE SAMPLE PROJECTS
-- ===============================================

DO $$
DECLARE
    john_id UUID;
    sarah_id UUID;
    agri_project_id UUID;
    water_project_id UUID;
BEGIN
    -- Get innovator IDs
    SELECT user_id INTO john_id FROM users WHERE email = 'john@example.com';
    SELECT user_id INTO sarah_id FROM users WHERE email = 'sarah@example.com';
    
    -- Create Smart Agriculture project
    INSERT INTO projects (
        innovator_id, title, short_description, full_description, category, 
        status, funding_goal, current_funding, min_investment, 
        sdg_alignment, geo_focus, social_score, view_count
    ) VALUES (
        john_id,
        'Smart Agriculture System',
        'Sustainable farming using IoT sensors and AI for crop optimization.',
        'Our Smart Agriculture System combines IoT sensors, AI analytics, and sustainable farming practices to optimize crop yields while minimizing environmental impact. The system monitors soil conditions, weather patterns, and crop health in real-time, providing actionable insights to farmers. This technology is particularly valuable in regions facing climate challenges and food security issues.',
        'AgriTech',
        'SeekingFunding',
        50000.00,
        15000.00,
        1000.00,
        ARRAY['SDG 2', 'SDG 12'], -- Zero Hunger, Responsible Consumption
        'Sub-Saharan Africa',
        45,
        120
    ) RETURNING project_id INTO agri_project_id;
    
    -- Create Clean Water project
    INSERT INTO projects (
        innovator_id, title, short_description, full_description, category, 
        status, funding_goal, current_funding, min_investment, 
        sdg_alignment, geo_focus, social_score, view_count
    ) VALUES (
        sarah_id,
        'Clean Water Initiative',
        'Water purification technology for rural communities using renewable energy.',
        'The Clean Water Initiative develops and deploys solar-powered water purification systems for rural communities without access to clean drinking water. Our technology is cost-effective, requires minimal maintenance, and can be deployed in remote areas. The systems remove contaminants, bacteria, and viruses, providing safe drinking water for communities that previously relied on contaminated sources, significantly reducing waterborne diseases.',
        'CleanTech',
        'PartiallyFunded',
        75000.00,
        56250.00,
        2000.00,
        ARRAY['SDG 6', 'SDG 7'], -- Clean Water and Sanitation, Affordable and Clean Energy
        'Southeast Asia and East Africa',
        68,
        245
    ) RETURNING project_id INTO water_project_id;
    
    -- Update last_activity_at for trending calculation
    UPDATE projects SET last_activity_at = CURRENT_TIMESTAMP - INTERVAL '2 days' WHERE project_id = agri_project_id;
    UPDATE projects SET last_activity_at = CURRENT_TIMESTAMP - INTERVAL '6 hours' WHERE project_id = water_project_id;
    
    -- Call the function to update trending ranks
    PERFORM update_trending_projects();
END $$;

-- ===============================================
-- CREATE MILESTONES FOR PROJECTS
-- ===============================================

DO $$
DECLARE
    agri_project_id UUID;
    water_project_id UUID;
    milestone_id1 UUID;
    milestone_id2 UUID;
    milestone_id3 UUID;
    milestone_id4 UUID;
BEGIN
    -- Get project IDs
    SELECT project_id INTO agri_project_id FROM projects WHERE title = 'Smart Agriculture System';
    SELECT project_id INTO water_project_id FROM projects WHERE title = 'Clean Water Initiative';
    
    -- Create milestones for Smart Agriculture project
    INSERT INTO milestones (
        project_id, title, description, start_date, target_completion_date,
        funding_required, verification_method, display_order, status
    ) VALUES (
        agri_project_id,
        'Prototype Sensor Development',
        'Develop and test IoT sensor arrays for soil moisture, temperature, and nutrient monitoring.',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '3 months',
        12000.00,
        'Working prototype demonstration with sensor readings and data transmission.',
        1,
        'Active'
    ) RETURNING milestone_id INTO milestone_id1;
    
    INSERT INTO milestones (
        project_id, title, description, start_date, target_completion_date,
        funding_required, verification_method, display_order, status
    ) VALUES (
        agri_project_id,
        'AI Analytics Platform',
        'Develop machine learning algorithms for crop optimization based on sensor data.',
        CURRENT_TIMESTAMP + INTERVAL '3 months',
        CURRENT_TIMESTAMP + INTERVAL '6 months',
        18000.00,
        'Demonstration of predictive algorithms with test data sets.',
        2,
        'Planned'
    ) RETURNING milestone_id INTO milestone_id2;
    
    INSERT INTO milestones (
        project_id, title, description, start_date, target_completion_date,
        funding_required, verification_method, display_order, status
    ) VALUES (
        agri_project_id,
        'Field Testing',
        'Deploy the system in test farms across target regions.',
        CURRENT_TIMESTAMP + INTERVAL '6 months',
        CURRENT_TIMESTAMP + INTERVAL '9 months',
        20000.00,
        'Field test reports with performance metrics and farmer feedback.',
        3,
        'Planned'
    );
    
    -- Create milestones for Clean Water project
    INSERT INTO milestones (
        project_id, title, description, start_date, target_completion_date,
        funding_required, verification_method, display_order, status
    ) VALUES (
        water_project_id,
        'Purification Unit Design',
        'Finalize the design of the solar-powered water purification unit.',
        CURRENT_TIMESTAMP - INTERVAL '1 month',
        CURRENT_TIMESTAMP + INTERVAL '1 month',
        15000.00,
        'Detailed engineering designs and specifications.',
        1,
        'Completed'
    ) RETURNING milestone_id INTO milestone_id3;
    
    INSERT INTO milestones (
        project_id, title, description, start_date, target_completion_date,
        funding_required, verification_method, display_order, status
    ) VALUES (
        water_project_id,
        'Prototype Production',
        'Build and test 5 prototype purification units.',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '3 months',
        25000.00,
        'Working prototype with water quality test results.',
        2,
        'Active'
    ) RETURNING milestone_id INTO milestone_id4;
    
    INSERT INTO milestones (
        project_id, title, description, start_date, target_completion_date,
        funding_required, verification_method, display_order, status
    ) VALUES (
        water_project_id,
        'Pilot Deployment',
        'Deploy 10 units in selected villages and monitor performance.',
        CURRENT_TIMESTAMP + INTERVAL '3 months',
        CURRENT_TIMESTAMP + INTERVAL '6 months',
        35000.00,
        'Installation reports, performance metrics, and community feedback.',
        3,
        'Planned'
    );
    
    -- Create escrow account for first active milestone of each project
    INSERT INTO escrow_accounts (
        milestone_id, amount, status
    ) VALUES (
        milestone_id1, 12000.00, 'Locked'
    );
    
    INSERT INTO escrow_accounts (
        milestone_id, amount, status
    ) VALUES (
        milestone_id4, 25000.00, 'Locked'
    );
END $$;

-- ===============================================
-- CREATE SAMPLE INVESTMENTS
-- ===============================================

DO $$
DECLARE
    michael_investor_id UUID;
    emily_investor_id UUID;
    agri_project_id UUID;
    water_project_id UUID;
BEGIN
    -- Get investor IDs
    SELECT investor_id INTO michael_investor_id FROM investors i JOIN users u ON i.user_id = u.user_id WHERE u.email = 'michael@example.com';
    SELECT investor_id INTO emily_investor_id FROM investors i JOIN users u ON i.user_id = u.user_id WHERE u.email = 'emily@example.com';
    
    -- Get project IDs
    SELECT project_id INTO agri_project_id FROM projects WHERE title = 'Smart Agriculture System';
    SELECT project_id INTO water_project_id FROM projects WHERE title = 'Clean Water Initiative';
    
    -- Create investments
    INSERT INTO investments (
        investor_id, project_id, amount, share_percentage, investment_note
    ) VALUES (
        michael_investor_id,
        agri_project_id,
        10000.00,
        20.00,
        'I believe this technology can transform agriculture in drought-prone regions.'
    );
    
    INSERT INTO investments (
        investor_id, project_id, amount, share_percentage, investment_note
    ) VALUES (
        emily_investor_id,
        agri_project_id,
        5000.00,
        10.00,
        'Supporting innovative sustainable agriculture solutions.'
    );
    
    INSERT INTO investments (
        investor_id, project_id, amount, share_percentage, investment_note
    ) VALUES (
        emily_investor_id,
        water_project_id,
        40000.00,
        53.33,
        'Clean water access is a fundamental human right. Excited to support this initiative.'
    );
    
    INSERT INTO investments (
        investor_id, project_id, amount, share_percentage, investment_note
    ) VALUES (
        michael_investor_id,
        water_project_id,
        16250.00,
        21.67,
        'This aligns perfectly with my focus on water infrastructure in developing regions.'
    );
END $$;

-- ===============================================
-- CREATE SAMPLE NOTIFICATIONS
-- ===============================================

DO $$
DECLARE
    john_id UUID;
    sarah_id UUID;
    michael_id UUID;
    emily_id UUID;
    admin_id UUID;
    escrow_id UUID;
    agri_project_id UUID;
    water_project_id UUID;
BEGIN
    -- Get user IDs
    SELECT user_id INTO john_id FROM users WHERE email = 'john@example.com';
    SELECT user_id INTO sarah_id FROM users WHERE email = 'sarah@example.com';
    SELECT user_id INTO michael_id FROM users WHERE email = 'michael@example.com';
    SELECT user_id INTO emily_id FROM users WHERE email = 'emily@example.com';
    SELECT user_id INTO admin_id FROM users WHERE email = 'admin@innocapforge.com';
    SELECT user_id INTO escrow_id FROM users WHERE email = 'escrow@innocapforge.com';
    
    -- Get project IDs
    SELECT project_id INTO agri_project_id FROM projects WHERE title = 'Smart Agriculture System';
    SELECT project_id INTO water_project_id FROM projects WHERE title = 'Clean Water Initiative';
    
    -- Create notifications for innovators
    INSERT INTO notifications (
        user_id, title, message, related_entity_type, related_entity_id, read
    ) VALUES (
        john_id,
        'New Investment Received',
        'Your project "Smart Agriculture System" has received a new investment of $10,000 from Michael Brown.',
        'project',
        agri_project_id,
        FALSE
    );
    
    INSERT INTO notifications (
        user_id, title, message, related_entity_type, related_entity_id, read
    ) VALUES (
        john_id,
        'New Investment Received',
        'Your project "Smart Agriculture System" has received a new investment of $5,000 from Emily Chen.',
        'project',
        agri_project_id,
        FALSE
    );
    
    INSERT INTO notifications (
        user_id, title, message, related_entity_type, related_entity_id, read
    ) VALUES (
        sarah_id,
        'New Investment Received',
        'Your project "Clean Water Initiative" has received a new investment of $40,000 from Emily Chen.',
        'project',
        water_project_id,
        FALSE
    );
    
    INSERT INTO notifications (
        user_id, title, message, related_entity_type, related_entity_id, read
    ) VALUES (
        sarah_id,
        'New Investment Received',
        'Your project "Clean Water Initiative" has received a new investment of $16,250 from Michael Brown.',
        'project',
        water_project_id,
        TRUE
    );
    
    INSERT INTO notifications (
        user_id, title, message, related_entity_type, related_entity_id, read
    ) VALUES (
        sarah_id,
        'Milestone Status Update',
        'Your milestone "Purification Unit Design" has been completed.',
        'milestone',
        NULL,
        TRUE
    );
    
    -- Create notifications for investors
    INSERT INTO notifications (
        user_id, title, message, related_entity_type, related_entity_id, read
    ) VALUES (
        michael_id,
        'New Project Match',
        'A new project matching your investment preferences has been published.',
        'project',
        NULL,
        FALSE
    );
    
    INSERT INTO notifications (
        user_id, title, message, related_entity_type, related_entity_id, read
    ) VALUES (
        emily_id,
        'Milestone Completed',
        'The "Purification Unit Design" milestone has been completed for the Clean Water Initiative project you invested in.',
        'milestone',
        NULL,
        FALSE
    );
    
    -- Create notifications for admin
    INSERT INTO notifications (
        user_id, title, message, related_entity_type, related_entity_id, read, priority
    ) VALUES (
        admin_id,
        'New User Registration',
        'Several new users have registered on the platform this week.',
        'user',
        NULL,
        FALSE,
        'standard'
    );
    
    INSERT INTO notifications (
        user_id, title, message, related_entity_type, related_entity_id, read, priority
    ) VALUES (
        admin_id,
        'Funding Goal Reached',
        'The Clean Water Initiative project has reached 75% of its funding goal.',
        'project',
        water_project_id,
        FALSE,
        'important'
    );
    
    -- Create notifications for escrow manager
    INSERT INTO notifications (
        user_id, title, message, related_entity_type, related_entity_id, read, priority
    ) VALUES (
        escrow_id,
        'Escrow Accounts Created',
        'Two new escrow accounts have been created and require monitoring.',
        'escrow',
        NULL,
        FALSE,
        'important'
    );
    
    -- Create role-based notifications
    INSERT INTO notifications (
        target_role, title, message, priority
    ) VALUES (
        'Investor',
        'New Investment Opportunities',
        'Check out the latest sustainable development projects seeking funding!',
        'standard'
    );
    
    INSERT INTO notifications (
        target_role, title, message, priority
    ) VALUES (
        'Innovator',
        'Tips for Project Success',
        'Learn how to create compelling project milestones that attract investors.',
        'informational'
    );
END $$;

-- ===============================================
-- CREATE SAMPLE TRANSACTIONS
-- ===============================================

DO $$
DECLARE
    michael_wallet_id UUID;
    emily_wallet_id UUID;
    john_wallet_id UUID;
    deposit_type_id INTEGER;
    investment_type_id INTEGER;
    completed_status_id INTEGER;
BEGIN
    -- Get wallet IDs
    SELECT w.wallet_id INTO michael_wallet_id FROM wallets w JOIN users u ON w.user_id = u.user_id WHERE u.email = 'michael@example.com';
    SELECT w.wallet_id INTO emily_wallet_id FROM wallets w JOIN users u ON w.user_id = u.user_id WHERE u.email = 'emily@example.com';
    SELECT w.wallet_id INTO john_wallet_id FROM wallets w JOIN users u ON w.user_id = u.user_id WHERE u.email = 'john@example.com';
    
 -- Get transaction type IDs and status IDs
    SELECT type_id INTO deposit_type_id FROM transaction_types WHERE type_name = 'deposit';
    SELECT type_id INTO investment_type_id FROM transaction_types WHERE type_name = 'investment';
    SELECT status_id INTO completed_status_id FROM txn_status_table WHERE status_name = 'completed';
    
    -- Create deposit transactions
    INSERT INTO transactions (
        wallet_id, type_id, status_id, amount, notes, completed_at
    ) VALUES (
        michael_wallet_id,
        deposit_type_id,
        completed_status_id,
        100000.00,
        'Initial deposit',
        CURRENT_TIMESTAMP - INTERVAL '1 month'
    );
    
    INSERT INTO transactions (
        wallet_id, type_id, status_id, amount, notes, completed_at
    ) VALUES (
        emily_wallet_id,
        deposit_type_id,
        completed_status_id,
        150000.00,
        'Initial deposit',
        CURRENT_TIMESTAMP - INTERVAL '3 weeks'
    );
    
    -- Create investment transactions
    INSERT INTO transactions (
        wallet_id, type_id, status_id, amount, notes, completed_at
    ) VALUES (
        michael_wallet_id,
        investment_type_id,
        completed_status_id,
        10000.00,
        'Investment in Smart Agriculture System',
        CURRENT_TIMESTAMP - INTERVAL '2 weeks'
    );
    
    INSERT INTO transactions (
        wallet_id, type_id, status_id, amount, notes, completed_at
    ) VALUES (
        michael_wallet_id,
        investment_type_id,
        completed_status_id,
        16250.00,
        'Investment in Clean Water Initiative',
        CURRENT_TIMESTAMP - INTERVAL '1 week'
    );
    
    INSERT INTO transactions (
        wallet_id, type_id, status_id, amount, notes, completed_at
    ) VALUES (
        emily_wallet_id,
        investment_type_id,
        completed_status_id,
        5000.00,
        'Investment in Smart Agriculture System',
        CURRENT_TIMESTAMP - INTERVAL '10 days'
    );
    
    INSERT INTO transactions (
        wallet_id, type_id, status_id, amount, notes, completed_at
    ) VALUES (
        emily_wallet_id,
        investment_type_id,
        completed_status_id,
        40000.00,
        'Investment in Clean Water Initiative',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    );
END $$;

-- ===============================================
-- CREATE SAMPLE PROJECT UPDATES
-- ===============================================

DO $$
DECLARE
    john_id UUID;
    sarah_id UUID;
    agri_project_id UUID;
    water_project_id UUID;
BEGIN
    -- Get user IDs
    SELECT user_id INTO john_id FROM users WHERE email = 'john@example.com';
    SELECT user_id INTO sarah_id FROM users WHERE email = 'sarah@example.com';
    
    -- Get project IDs
    SELECT project_id INTO agri_project_id FROM projects WHERE title = 'Smart Agriculture System';
    SELECT project_id INTO water_project_id FROM projects WHERE title = 'Clean Water Initiative';
    
    -- Create project updates
    INSERT INTO project_updates (
        project_id, title, content, created_by, created_at
    ) VALUES (
        agri_project_id,
        'Initial Sensor Prototypes Completed',
        'We have successfully developed the first prototypes of our soil moisture and temperature sensors. Initial tests show promising results with 95% accuracy compared to laboratory equipment. Next steps include integrating the nutrient monitoring capabilities and improving power efficiency.',
        john_id,
        CURRENT_TIMESTAMP - INTERVAL '10 days'
    );
    
    INSERT INTO project_updates (
        project_id, title, content, created_by, created_at
    ) VALUES (
        agri_project_id,
        'Partnership with Agricultural Research Institute',
        'We are excited to announce our partnership with the Regional Agricultural Research Institute. This collaboration will provide us with access to testing facilities and expertise in crop science, significantly accelerating our development timeline.',
        john_id,
        CURRENT_TIMESTAMP - INTERVAL '3 days'
    );
    
    INSERT INTO project_updates (
        project_id, title, content, created_by, created_at
    ) VALUES (
        water_project_id,
        'Purification Design Completed and Validated',
        'We have finalized the design of our solar-powered water purification system. The design has been validated by engineering experts and meets all safety and performance requirements. Laboratory tests confirm that the system effectively removes 99.9% of contaminants, bacteria, and viruses from water samples.',
        sarah_id,
        CURRENT_TIMESTAMP - INTERVAL '25 days'
    );
    
    INSERT INTO project_updates (
        project_id, title, content, created_by, created_at
    ) VALUES (
        water_project_id,
        'First Prototype Built and Functioning',
        'We have completed building the first prototype of our water purification system. Initial tests show it can purify up to 500 liters of water per day using only solar power. We are now working on optimizing the design for production and reducing materials cost.',
        sarah_id,
        CURRENT_TIMESTAMP - INTERVAL '7 days'
    );
    
    INSERT INTO project_updates (
        project_id, title, content, created_by, created_at
    ) VALUES (
        water_project_id,
        'Community Partnership Established',
        'We have established partnerships with three villages in East Africa for our pilot deployment. These communities currently rely on contaminated water sources and will serve as our first implementation sites. Local community leaders are enthusiastic about the project and will help with installation and maintenance training.',
        sarah_id,
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    );
END $$;

-- ===============================================
-- CREATE TEAM MEMBERS
-- ===============================================

DO $$
DECLARE
    agri_project_id UUID;
    water_project_id UUID;
BEGIN
    -- Get project IDs
    SELECT project_id INTO agri_project_id FROM projects WHERE title = 'Smart Agriculture System';
    SELECT project_id INTO water_project_id FROM projects WHERE title = 'Clean Water Initiative';
    
    -- Create team members for Smart Agriculture project
    INSERT INTO team_members (
        project_id, name, role, bio, contact_email
    ) VALUES (
        agri_project_id,
        'David Kim',
        'Lead Engineer',
        'Electrical engineer with 10 years of experience in IoT sensor development and embedded systems.',
        'david.kim@example.com'
    );
    
    INSERT INTO team_members (
        project_id, name, role, bio, contact_email
    ) VALUES (
        agri_project_id,
        'Maria Rodriguez',
        'Data Scientist',
        'Agricultural data scientist specializing in crop optimization algorithms and predictive analytics.',
        'maria.rodriguez@example.com'
    );
    
    INSERT INTO team_members (
        project_id, name, role, bio, contact_email
    ) VALUES (
        agri_project_id,
        'Samuel Osei',
        'Field Operations',
        'Agricultural expert with extensive experience working with farmers in Sub-Saharan Africa.',
        'samuel.osei@example.com'
    );
    
    -- Create team members for Clean Water project
    INSERT INTO team_members (
        project_id, name, role, bio, contact_email
    ) VALUES (
        water_project_id,
        'Aisha Patel',
        'Water Systems Engineer',
        'Environmental engineer specialized in water purification technology with experience in developing regions.',
        'aisha.patel@example.com'
    );
    
    INSERT INTO team_members (
        project_id, name, role, bio, contact_email
    ) VALUES (
        water_project_id,
        'Thomas Nguyen',
        'Solar Energy Specialist',
        'Renewable energy expert focused on solar power systems for off-grid applications.',
        'thomas.nguyen@example.com'
    );
    
    INSERT INTO team_members (
        project_id, name, role, bio, contact_email
    ) VALUES (
        water_project_id,
        'Grace Mwangi',
        'Community Liaison',
        'Public health professional with extensive experience in water access projects across East Africa.',
        'grace.mwangi@example.com'
    );
END $$;

-- ===============================================
-- CREATE SOCIAL INTERACTIONS
-- ===============================================

DO $$
DECLARE
    michael_id UUID;
    emily_id UUID;
    admin_id UUID;
    john_id UUID;
    sarah_id UUID;
    agri_project_id UUID;
    water_project_id UUID;
    comment_id UUID;
BEGIN
    -- Get user IDs
    SELECT user_id INTO michael_id FROM users WHERE email = 'michael@example.com';
    SELECT user_id INTO emily_id FROM users WHERE email = 'emily@example.com';
    SELECT user_id INTO admin_id FROM users WHERE email = 'admin@innocapforge.com';
    SELECT user_id INTO john_id FROM users WHERE email = 'john@example.com';
    SELECT user_id INTO sarah_id FROM users WHERE email = 'sarah@example.com';
    
    -- Get project IDs
    SELECT project_id INTO agri_project_id FROM projects WHERE title = 'Smart Agriculture System';
    SELECT project_id INTO water_project_id FROM projects WHERE title = 'Clean Water Initiative';
    
    -- Create interactions for Smart Agriculture project
    INSERT INTO project_interactions (
        project_id, user_id, interaction_type, content, created_at
    ) VALUES (
        agri_project_id,
        michael_id,
        'question',
        'How do the sensors perform in extremely dry conditions? I''m particularly interested in drought resilience.',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    ) RETURNING interaction_id INTO comment_id;
    
    -- Add reply to the question
    INSERT INTO project_interactions (
        project_id, user_id, interaction_type, content, parent_interaction_id, created_at
    ) VALUES (
        agri_project_id,
        john_id,
        'comment',
        'Great question! Our sensors are specifically designed to work in arid conditions. We use capacitive sensing technology that can detect even minimal soil moisture levels. In our lab tests, they maintained accuracy down to 5% soil moisture content.',
        comment_id,
        CURRENT_TIMESTAMP - INTERVAL '4 days 6 hours'
    );
    
    -- Add another comment
    INSERT INTO project_interactions (
        project_id, user_id, interaction_type, content, created_at
    ) VALUES (
        agri_project_id,
        emily_id,
        'endorsement',
        'I''ve reviewed the technical specifications of this project and I''m impressed by the power efficiency of the sensors. This will be crucial for deployment in rural areas with limited energy infrastructure.',
        CURRENT_TIMESTAMP - INTERVAL '3 days'
    );
    
    -- Create interactions for Clean Water project
    INSERT INTO project_interactions (
        project_id, user_id, interaction_type, content, created_at
    ) VALUES (
        water_project_id,
        emily_id,
        'question',
        'What is the expected lifespan of the purification membranes, and how easily can they be replaced by local communities?',
        CURRENT_TIMESTAMP - INTERVAL '10 days'
    ) RETURNING interaction_id INTO comment_id;
    
    -- Add reply to the question
    INSERT INTO project_interactions (
        project_id, user_id, interaction_type, content, parent_interaction_id, created_at
    ) VALUES (
        water_project_id,
        sarah_id,
        'comment',
        'The membranes are designed to last 2-3 years with regular maintenance. We''ve created a simple cartridge system that allows for easy replacement without technical training. Each community will receive training and a supply of replacement cartridges as part of the initial deployment.',
        comment_id,
        CURRENT_TIMESTAMP - INTERVAL '9 days 12 hours'
    );
    
    -- Add likes to interactions
    INSERT INTO interaction_reactions (user_id, interaction_id, reaction_type)
    SELECT michael_id, interaction_id, 'like'
    FROM project_interactions
    WHERE user_id = sarah_id;
    
    INSERT INTO interaction_reactions (user_id, interaction_id, reaction_type)
    SELECT emily_id, interaction_id, 'like'
    FROM project_interactions
    WHERE user_id = john_id;
    
    INSERT INTO interaction_reactions (user_id, interaction_id, reaction_type)
    SELECT admin_id, interaction_id, 'like'
    FROM project_interactions
    WHERE content LIKE '%technical specifications%';
END $$;

-- ===============================================
-- FINAL DATABASE SETUP COMPLETED
-- ===============================================

-- Notify completion
DO $$
BEGIN
    RAISE NOTICE 'Database rebuild completed successfully!';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- 6 users (admin, escrow manager, 2 innovators, 2 investors)';
    RAISE NOTICE '- 2 projects with milestones and team members';
    RAISE NOTICE '- Sample investments, transactions, and social interactions';
END $$;

CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);