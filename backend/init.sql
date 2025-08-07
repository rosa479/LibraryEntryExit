-- Drop existing tables if needed
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS students;

-- Create students table
CREATE TABLE students (
    roll VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL
);

-- Create logs table
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    roll VARCHAR NOT NULL REFERENCES students(roll) ON DELETE CASCADE,
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(5) NOT NULL CHECK (event_type IN ('entry', 'exit')),
    laptop TEXT DEFAULT NULL,
    books TEXT[] DEFAULT NULL,
    stay_duration INTERVAL DEFAULT NULL
);

-- Indexes for performance
CREATE INDEX idx_logs_roll ON logs (roll);
CREATE INDEX idx_logs_event_time ON logs (event_time);
CREATE INDEX idx_logs_event_type ON logs (event_type);
CREATE INDEX idx_logs_roll_event_time ON logs (roll, event_time DESC);

-- Optional: partial index for filtering fast
CREATE INDEX idx_entry_logs ON logs (roll) WHERE event_type = 'entry';
CREATE INDEX idx_exit_logs ON logs (roll) WHERE event_type = 'exit';

