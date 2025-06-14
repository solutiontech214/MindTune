-- Create daily check-ins table
CREATE TABLE IF NOT EXISTS daily_checkins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,
    mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 10),
    stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
    energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
    sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    anxiety_level INTEGER NOT NULL CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
    notes TEXT,
    activities JSONB DEFAULT '[]'::jsonb,
    gratitude_notes TEXT,
    goals_achieved INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, checkin_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON daily_checkins(user_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON daily_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_checkins_user_month ON daily_checkins(user_id, EXTRACT(YEAR FROM checkin_date), EXTRACT(MONTH FROM checkin_date));
