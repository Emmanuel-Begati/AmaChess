-- AmaChess Database Initialization Script
-- This script sets up the initial database configuration

-- Enable useful PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- Create indexes for better performance on common queries
-- These will be created by Prisma migrations, but included here for reference

-- Grant additional permissions for the application user
GRANT USAGE ON SCHEMA public TO amachess_user;
GRANT CREATE ON SCHEMA public TO amachess_user;

-- Set up some database-level configurations for better performance
ALTER DATABASE amachess_db SET timezone TO 'UTC';
ALTER DATABASE amachess_db SET log_statement TO 'none';
ALTER DATABASE amachess_db SET log_min_duration_statement TO 1000;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Output success message
SELECT 'AmaChess database initialized successfully!' as message;
