-- Insert sample user (password is 'password123' hashed)
INSERT INTO users (email, name, password_hash, age, weight, height, fitness_goal) 
VALUES (
    'demo@fitlife.com', 
    'Demo User', 
    '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ',
    25, 
    70.5, 
    175.0, 
    'bulking'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample todos
INSERT INTO todos (user_id, text, priority, completed) 
SELECT 
    u.id,
    unnest(ARRAY['Morning workout', 'Meal prep for the week', 'Buy protein powder', 'Schedule doctor appointment']),
    unnest(ARRAY['high', 'medium', 'low', 'medium']),
    unnest(ARRAY[true, false, false, false])
FROM users u WHERE u.email = 'demo@fitlife.com';

-- Insert sample workout
INSERT INTO workouts (user_id, muscle_group, duration, notes, workout_date)
SELECT 
    u.id,
    'Chest',
    60,
    'Great pump today!',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM users u WHERE u.email = 'demo@fitlife.com';

-- Insert sample exercises for the workout
INSERT INTO exercises (workout_id, name, sets, reps, weight)
SELECT 
    w.id,
    unnest(ARRAY['Bench Press', 'Incline Dumbbell Press', 'Chest Flyes']),
    unnest(ARRAY[4, 3, 3]),
    unnest(ARRAY[8, 10, 12]),
    unnest(ARRAY[135.0, 60.0, 30.0])
FROM workouts w 
JOIN users u ON w.user_id = u.id 
WHERE u.email = 'demo@fitlife.com';
