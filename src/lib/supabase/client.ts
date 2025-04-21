import { createBrowserClient } from '@supabase/ssr'

// Helper function to add delay for retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to test Supabase connectivity
export const testSupabaseConnection = async (client: any) => {
  try {
    // Try a simple query that should work even if tables don't exist
    const { error } = await client.from('health_check').select('*').limit(1).maybeSingle();
    
    // If we get a "relation does not exist" error, that's actually OK
    // It means our connection works but the table doesn't exist
    if (error) {
      if (error.message && (
        error.message.includes('relation "health_check" does not exist') ||
        error.message.includes('does not exist')
      )) {
        console.log('Supabase connection test successful (health_check table not found)');
        return { success: true, online: true };
      }
      
      // Any other error means there's a problem
      console.error('Supabase connection test failed:', error);
      return { success: false, error, online: false };
    }
    
    // If no error, connection is good
    return { success: true, online: true };
  } catch (error) {
    console.error('Supabase connection test exception:', error);
    return { 
      success: false, 
      error, 
      online: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
};

export const createClient = async (retryCount = 2) => {
  try {
    console.log('Creating browser-side Supabase client...');
    
    // Get environment variables and clean any white space or line breaks
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    
    // Check if environment variables are properly configured
    if (!supabaseUrl || supabaseUrl === 'your-supabase-project-url' || 
        !supabaseKey || supabaseKey === 'your-supabase-anon-key') {
      console.warn('Supabase is not properly configured. Using local storage authentication only.');
      return null;
    }
    
    // Validate URL format to prevent invalid URL errors
    try {
      new URL(supabaseUrl);
    } catch (error) {
      console.error('Invalid Supabase URL format:', error);
      return null;
    }
    
    // Initialize with retries
    let lastError = null;
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(`Attempt ${attempt} of ${retryCount} to create browser Supabase client`);
        
        // Use basic initialization for browser client
        const client = createBrowserClient(supabaseUrl, supabaseKey);
        
        // Test connectivity (but don't fail if just the table doesn't exist)
        const connectionTest = await testSupabaseConnection(client);
        if (!connectionTest.success) {
          console.warn(`Connection test failed on attempt ${attempt}:`, connectionTest.error);
          throw new Error(connectionTest.message || 'Connection test failed');
        }
        
        console.log('Supabase browser client created and verified successfully');
        return client;
      } catch (clientError) {
        lastError = clientError;
        console.error(`Failed to initialize browser Supabase client (attempt ${attempt}/${retryCount}):`, clientError);
        
        if (attempt < retryCount) {
          // Shorter backoff for browser: 300ms, 600ms
          const backoffTime = Math.min(300 * Math.pow(2, attempt - 1), 3000);
          console.log(`Retrying in ${backoffTime}ms...`);
          await delay(backoffTime);
        }
      }
    }
    
    // If we've exhausted all retries, return null instead of throwing
    console.error(`Supabase browser client initialization failed after ${retryCount} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
    return null;
  } catch (error) {
    console.error('Error creating Supabase browser client:', error);
    return null;
  }
} 