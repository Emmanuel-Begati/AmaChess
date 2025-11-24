#!/bin/bash

# AmaChess Database Setup Script
# This script helps you set up the PostgreSQL database

echo "🗄️  AmaChess Database Setup"
echo "================================"
echo ""

# Check if PostgreSQL is running
if ! pgrep -x postgres > /dev/null; then
    echo "❌ PostgreSQL is not running. Please start it first:"
    echo "   sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Generate a random password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

echo "📝 Database Configuration:"
echo "   Database: amachess_production"
echo "   User: amachess_user"
echo "   Password: $DB_PASSWORD"
echo ""

# Create SQL commands
cat > /tmp/setup_amachess.sql << EOF
-- Create database user
CREATE USER amachess_user WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE amachess_production OWNER amachess_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE amachess_production TO amachess_user;

-- Connect to the database and grant schema privileges
\c amachess_production
GRANT ALL ON SCHEMA public TO amachess_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO amachess_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO amachess_user;
EOF

echo "🔧 Creating database and user..."
echo ""
echo "Please run this command as a user with PostgreSQL access:"
echo ""
echo "sudo -u postgres psql -f /tmp/setup_amachess.sql"
echo ""
echo "After running the above command, update your .env file with:"
echo ""
echo "DATABASE_URL=\"postgresql://amachess_user:$DB_PASSWORD@localhost:5432/amachess_production?schema=public\""
echo ""
echo "Or run this to update automatically:"
echo ""
echo "sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"postgresql://amachess_user:$DB_PASSWORD@localhost:5432/amachess_production?schema=public\"|' amachess-backend/.env"
echo ""
