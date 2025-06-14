-- Create user sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on session_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);

-- Create index on user_id for faster user session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);
