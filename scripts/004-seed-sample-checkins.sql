-- Insert sample check-ins for demo user (only if table exists and user exists)
DO $$
BEGIN
    -- Check if the table exists and user exists before inserting
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_checkins') 
       AND EXISTS (SELECT FROM users WHERE email = 'demo@mindtune.com') THEN
        
        -- Get the demo user ID
        INSERT INTO daily_checkins (
            user_id, 
            checkin_date, 
            mood_rating, 
            stress_level, 
            energy_level, 
            sleep_quality, 
            anxiety_level, 
            notes, 
            activities, 
            gratitude_notes, 
            goals_achieved
        )
        SELECT 
            u.id,
            CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 14),
            (RANDOM() * 4 + 6)::INTEGER, -- mood 6-10
            (RANDOM() * 5 + 3)::INTEGER, -- stress 3-7
            (RANDOM() * 4 + 5)::INTEGER, -- energy 5-8
            (RANDOM() * 3 + 7)::INTEGER, -- sleep 7-9
            (RANDOM() * 4 + 2)::INTEGER, -- anxiety 2-5
            CASE 
                WHEN RANDOM() > 0.7 THEN 'Had a productive day today!'
                WHEN RANDOM() > 0.4 THEN 'Feeling grateful for the small things.'
                ELSE NULL
            END,
            CASE 
                WHEN RANDOM() > 0.5 THEN '["exercise", "meditation"]'::jsonb
                ELSE '["reading", "rest"]'::jsonb
            END,
            CASE 
                WHEN RANDOM() > 0.6 THEN 'Grateful for family and health'
                ELSE NULL
            END,
            (RANDOM() * 3)::INTEGER -- goals 0-2
        FROM users u 
        WHERE u.email = 'demo@mindtune.com'
        ON CONFLICT (user_id, checkin_date) DO NOTHING;
        
        RAISE NOTICE 'Sample check-ins inserted successfully';
    ELSE
        RAISE NOTICE 'Skipping sample data - table or user does not exist';
    END IF;
END $$;
