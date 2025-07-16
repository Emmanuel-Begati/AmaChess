@echo off
REM AmaChess PostgreSQL Setup Script for Windows
REM Run this script as Administrator to set up PostgreSQL database for AmaChess

echo 🚀 Setting up PostgreSQL for AmaChess...

REM Check if PostgreSQL is installed
where psql >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL is not installed or not in PATH.
    echo    Please install PostgreSQL first from: https://www.postgresql.org/download/windows/
    echo    Make sure to add PostgreSQL bin directory to your PATH
    pause
    exit /b 1
)

REM Database configuration
set DB_NAME=amachess_db
set DB_USER=amachess_user
set DB_PASSWORD=amachess_password

echo 📋 Database Configuration:
echo    Database: %DB_NAME%
echo    User: %DB_USER%
echo    Password: %DB_PASSWORD%
echo.

echo 🗄️ Creating database and user...
echo Please enter your PostgreSQL superuser password when prompted.
echo.

REM Create user and database
psql -U postgres -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';"
psql -U postgres -c "CREATE DATABASE %DB_NAME% OWNER %DB_USER%;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;"

REM Grant schema privileges
psql -U postgres -d %DB_NAME% -c "GRANT ALL ON SCHEMA public TO %DB_USER%;"
psql -U postgres -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO %DB_USER%;"
psql -U postgres -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO %DB_USER%;"

echo.
echo ✅ Database setup complete!
echo.
echo 📝 Next steps:
echo 1. Update your .env file with the correct DATABASE_URL
echo 2. Run: npm run db:migrate
echo 3. Run: npm run db:seed
echo.
echo 🔗 Your DATABASE_URL should be:
echo DATABASE_URL="postgresql://%DB_USER%:%DB_PASSWORD%@localhost:5432/%DB_NAME%?schema=public"
echo.
pause
