-- AuraOS Supabase Schema
-- Auto-purging tasks and productivity data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table with auto-expiry functionality
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes for performance
  INDEX idx_tasks_user_id (user_id),
  INDEX idx_tasks_status (status),
  INDEX idx_tasks_expires_at (expires_at),
  INDEX idx_tasks_created_at (created_at)
);

-- Development logs table
CREATE TABLE IF NOT EXISTS dev_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_dev_logs_user_id (user_id),
  INDEX idx_dev_logs_created_at (created_at),
  INDEX idx_dev_logs_completed (completed)
);

-- Archived tasks (for completed tasks before deletion)
CREATE TABLE IF NOT EXISTS archived_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  original_task_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  priority TEXT,
  tags TEXT[] DEFAULT '{}',
  original_created_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_archived_tasks_user_id (user_id),
  INDEX idx_archived_tasks_archived_at (archived_at)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  location TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  
  -- Indexes
  INDEX idx_events_user_id (user_id),
  INDEX idx_events_event_date (event_date),
  INDEX idx_events_status (status),
  INDEX idx_events_expires_at (expires_at)
);

-- Widget configurations
CREATE TABLE IF NOT EXISTS widget_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 1,
  height INTEGER DEFAULT 1,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_widget_configs_user_id (user_id),
  INDEX idx_widget_configs_type (widget_type),
  INDEX idx_widget_configs_active (is_active)
);

-- Auto-purging function for expired tasks
CREATE OR REPLACE FUNCTION purge_expired_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Archive completed tasks older than 24 hours
  INSERT INTO archived_tasks (
    user_id, original_task_id, title, description, status, priority, 
    tags, original_created_at, completed_at
  )
  SELECT 
    user_id, id, title, description, status, priority, 
    tags, created_at, completed_at
  FROM tasks
  WHERE status = 'completed' 
    AND completed_at < NOW() - INTERVAL '24 hours';
  
  -- Delete archived tasks from main table
  DELETE FROM tasks 
  WHERE status = 'completed' 
    AND completed_at < NOW() - INTERVAL '24 hours';
  
  -- Delete expired tasks
  DELETE FROM tasks 
  WHERE expires_at < NOW();
  
  -- Delete expired events
  DELETE FROM events 
  WHERE expires_at < NOW() 
    AND status IN ('completed', 'cancelled');
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dev_logs_updated_at
  BEFORE UPDATE ON dev_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widget_configs_updated_at
  BEFORE UPDATE ON widget_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Dev logs policies
CREATE POLICY "Users can view own dev logs" ON dev_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dev logs" ON dev_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dev logs" ON dev_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dev logs" ON dev_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Users can view own events" ON events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (auth.uid() = user_id);

-- Widget configs policies
CREATE POLICY "Users can view own widget configs" ON widget_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own widget configs" ON widget_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widget configs" ON widget_configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own widget configs" ON widget_configs
  FOR DELETE USING (auth.uid() = user_id);

-- Archived tasks policies
CREATE POLICY "Users can view own archived tasks" ON archived_tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Scheduled cleanup function (run every hour)
-- Note: This would be set up via Supabase Dashboard or pg_cron extension
-- SELECT cron.schedule('purge-expired-tasks', '0 * * * *', 'SELECT purge_expired_tasks();');

-- Sample data for testing
-- INSERT INTO profiles (id, username, full_name) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'demo', 'Demo User');

-- INSERT INTO tasks (user_id, title, description, priority, tags)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000000', 'Build AuraOS', 'Create the futuristic OS web app', 'high', ARRAY['development', 'nextjs']),
--   ('00000000-0000-0000-0000-000000000000', 'Setup Supabase', 'Configure database and auth', 'medium', ARRAY['database', 'backend']),
--   ('00000000-0000-0000-0000-000000000000', 'Design UI', 'Create glassmorphism components', 'medium', ARRAY['design', 'frontend']);
