-- Ensure RLS is enabled
ALTER DATABASE postgres SET "anon.facstaff_search.enabled" TO off;

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    jackPoints INTEGER DEFAULT 0,
    transactions JSONB DEFAULT '[]'::jsonb,
    lastUpdated BIGINT,
    hasReceivedInitialBonus BOOLEAN DEFAULT FALSE,
    rank TEXT DEFAULT 'normal',
    isVerified BOOLEAN DEFAULT FALSE,
    avatar TEXT,
    phoneNumber TEXT,
    phoneVerified BOOLEAN DEFAULT FALSE,
    socialAccounts JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table for storing user transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID REFERENCES profiles(id) NOT NULL,
    userEmail TEXT NOT NULL,
    userName TEXT,
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    type TEXT NOT NULL,
    userPhone TEXT,
    userSocialMedia JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a health check table for connectivity testing
CREATE TABLE IF NOT EXISTS public.health_check (
    id SERIAL PRIMARY KEY,
    status TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allow public read access to profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles FOR SELECT
    USING (true);

-- Allow users to update their own profiles
CREATE POLICY "Users can update their own profiles."
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Allow anon read access to transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transactions are viewable by everyone."
    ON public.transactions FOR SELECT
    USING (true);

-- Allow anon read access to health check
ALTER TABLE public.health_check ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Health check is viewable by everyone."
    ON public.health_check FOR SELECT
    USING (true);

-- Health check data
INSERT INTO public.health_check (status) VALUES ('online') ON CONFLICT DO NOTHING;

-- Create PostgreSQL function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, jackPoints, lastUpdated)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        500,
        extract(epoch from now()) * 1000
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(userId);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Function to sync transactions with user points
CREATE OR REPLACE FUNCTION sync_user_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's points in the profiles table
  -- This assumes you have a profiles table with points field
  UPDATE profiles
  SET points = (
    SELECT COALESCE(SUM(CASE 
      WHEN type = 'spend' THEN -amount 
      ELSE amount 
    END), 0)
    FROM transactions
    WHERE userId = NEW.userId
  )
  WHERE id = NEW.userId;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update points when transactions change
DROP TRIGGER IF EXISTS update_user_points ON transactions;
CREATE TRIGGER update_user_points
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION sync_user_points(); 