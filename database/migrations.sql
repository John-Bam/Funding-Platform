-- Create Database
CREATE DATABASE funding_platform;

-- Connect to the Database
\c funding_platform;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users Table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  address TEXT,
  date_of_birth DATE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('Admin', 'Innovator', 'Investor', 'EscrowManager')) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('PendingApproval', 'Verified', 'Rejected', 'Suspended')) DEFAULT 'PendingApproval',
  reset_token UUID,
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create User Preferences Table
CREATE TABLE user_preferences (
  preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  sdg_alignment TEXT[],
  geo_focus VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Projects Table
CREATE TABLE projects (
  project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  innovator_id UUID NOT NULL REFERENCES users(user_id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('PendingApproval', 'SeekingFunding', 'PartiallyFunded', 'FullyFunded', 'InProgress', 'Completed', 'Rejected')) DEFAULT 'PendingApproval',
  funding_goal DECIMAL(15, 2) NOT NULL,
  current_funding DECIMAL(15, 2) DEFAULT 0,
  sdg_alignment TEXT[], -- Sustainable Development Goals alignment
  geo_focus VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Project Documents Table
CREATE TABLE project_documents (
  document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(project_id),
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  document_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(user_id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Milestones Table
CREATE TABLE milestones (
  milestone_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(project_id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  target_completion_date DATE NOT NULL,
  funding_required DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Planned', 'InProgress', 'PendingVerification', 'Approved', 'Rejected')) DEFAULT 'Planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Milestone Verifications Table
CREATE TABLE milestone_verifications (
  verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID NOT NULL REFERENCES milestones(milestone_id),
  submitted_by UUID NOT NULL REFERENCES users(user_id),
  status VARCHAR(20) CHECK (status IN ('PendingReview', 'Approved', 'Rejected')) DEFAULT 'PendingReview',
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verification_date TIMESTAMP,
  verified_by UUID REFERENCES users(user_id),
  comments TEXT
);

-- Create Verification Documents Table
CREATE TABLE verification_documents (
  document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES milestone_verifications(verification_id),
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  document_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Escrow Transactions Table
CREATE TABLE escrow_transactions (
  transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(project_id),
  milestone_id UUID NOT NULL REFERENCES milestones(milestone_id),
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Locked', 'Released', 'Refunded')) DEFAULT 'Locked',
  locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  released_at TIMESTAMP,
  released_by UUID REFERENCES users(user_id)
);

-- Create Investors Table
CREATE TABLE investors (
  investor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  preferred_sdg TEXT[],
  preferred_geo TEXT[],
  investment_min DECIMAL(15, 2),
  investment_max DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Investments Table
CREATE TABLE investments (
  investment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID NOT NULL REFERENCES investors(investor_id),
  project_id UUID NOT NULL REFERENCES projects(project_id),
  amount DECIMAL(15, 2) NOT NULL,
  investment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  syndicate_id UUID -- Can be null for direct investments
);

-- Create Investor Syndicates Table
CREATE TABLE investor_syndicates (
  syndicate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  initiated_by UUID NOT NULL REFERENCES investors(investor_id),
  status VARCHAR(20) CHECK (status IN ('Forming', 'OpenForContributions', 'Active', 'Closed')) DEFAULT 'Forming',
  voting_threshold INTEGER NOT NULL DEFAULT 51, -- Percentage required for approval
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Syndicate Members Table
CREATE TABLE syndicate_members (
  member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  syndicate_id UUID NOT NULL REFERENCES investor_syndicates(syndicate_id),
  investor_id UUID NOT NULL REFERENCES investors(investor_id),
  contribution_amount DECIMAL(15, 2) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Milestone Votes Table
CREATE TABLE milestone_votes (
  vote_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES milestone_verifications(verification_id),
  investor_id UUID NOT NULL REFERENCES investors(investor_id),
  syndicate_id UUID REFERENCES investor_syndicates(syndicate_id),
  vote BOOLEAN NOT NULL, -- true = yes, false = no
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  comments TEXT
);

-- Create Notifications Table
CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  related_entity_type VARCHAR(50), -- e.g., 'project', 'milestone', 'user'
  related_entity_id UUID -- Generic reference to the entity ID
);

-- Create Audit Logs Table
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50)
);

-- Create initial admin user (password: admin123)
INSERT INTO users (
  email, 
  password_hash, 
  full_name, 
  date_of_birth, 
  role, 
  status
) VALUES (
  'admin@innocapforge.com',
  '$2a$10$rJMQ88GV1tSfnAvQhye1AOy.pjhbGYGQRnJQj6sNOeP65rSRImn0i', -- bcrypt hash for 'admin123'
  'System Administrator',
  '1980-01-01',
  'Admin',
  'Verified'
);