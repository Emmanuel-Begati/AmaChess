#!/bin/bash

# AmaChess PostgreSQL Setup Script
# Run this script to set up PostgreSQL database for AmaChess

echo "🚀 Setting up PostgreSQL for AmaChess..."

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   Download from: https://www.postgresql.org/download/"
    exit 1
fi

# Database configuration
DB_NAME="amachess_db"
DB_USER="amachess_user"
DB_PASSWORD="amachess_password"

echo "📋 Database Configuration:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""

# Function to run SQL commands
run_sql() {
    local sql="$1"
    echo "🔧 Running: $sql"
    sudo -u postgres psql -c "$sql"
}

# Create database and user
echo "🗄️  Creating database and user..."

# Create user
run_sql "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

# Create database
run_sql "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Grant privileges
run_sql "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Connect to the database and grant schema privileges
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"

echo "✅ Database setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env file with the correct DATABASE_URL"
echo "2. Run: npm run db:migrate"
echo "3. Run: npm run db:seed"
echo ""
echo "🔗 Your DATABASE_URL should be:"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public\""
