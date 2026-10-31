-- Initialization script for PostgreSQL container

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year_level INTEGER NOT NULL CHECK (year_level >= 1)
);

-- Seed initial records for testing
INSERT INTO students (student_number, first_name, last_name, course, year_level)
VALUES
    ('2026-0001', 'Juan', 'Dela Cruz', 'BSIT', 3),
    ('2026-0002', 'Maria', 'Santos', 'BSCS', 2),
    ('2026-0003', 'John', 'Doe', 'BSIS', 1)
ON CONFLICT (student_number) DO NOTHING;

