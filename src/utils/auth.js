import { createClient } from '@/lib/supabase/client';
import { addTransaction } from '@/services/TransactionsService';

// Token storage key (keeping for backward compatibility)
const TOKEN_KEY = 'slotjack_auth_token';
const USER_KEY = 'slotjack_user';

/**
 * Initialize Supabase client
 * Memoize the client to avoid creating multiple instances
 */
let supabaseClient = null;
const getSupabaseClient = async () => {
  if (!supabaseClient) {
    try {
      supabaseClient = await createClient();
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      throw new Error('Authentication service unavailable');
    }
  }
  return supabaseClient;
};

/**
 * Save auth token to localStorage (for backward compatibility)
 */
export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Get auth token from localStorage
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * Remove auth token from localStorage
 */
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Save user data to localStorage
 */
export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
};

/**
 * Remove user data from localStorage
 */
export const removeUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Register a new user with Supabase
 */
export const register = async (email, password, name) => {
  try {
    const supabase = await getSupabaseClient();
    
    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (authError) {
      console.error('Supabase registration error:', authError);
      throw new Error(authError.message || 'Registration failed');
    }
    
    if (!authData.user) {
      throw new Error('Registration succeeded but no user was returned');
    }
    
    // Format user data properly for the calling code's expected structure
    const userData = {
      id: authData.user.id,
      email: authData.user.email,
      name: name || authData.user.email.split('@')[0],
      jackPoints: 500,
      transactions: [],
      lastUpdated: new Date().getTime(),
      hasReceivedInitialBonus: true,
      rank: 'normal', // This will be mapped to enum by the context
      isVerified: false,
      avatar: null,
      phoneNumber: null,
      phoneVerified: false,
      socialAccounts: {}
    };
    
    // Create a profile in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email,
        name: name || authData.user.email.split('@')[0],
        jackPoints: 500, // Initial points
        lastUpdated: userData.lastUpdated,
        hasReceivedInitialBonus: true,
        rank: 'normal',
        isVerified: false,
        transactions: [],
      }, { onConflict: 'id' })
      .select()
      .single();
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue even if profile creation fails, we can fix it later
    }
    
    // Store user data
    setUser(userData);
    setToken(authData.session?.access_token || '');
    
    // Create a registration transaction
    try {
      await addTransaction({
        userId: authData.user.id,
        userEmail: email,
        userName: name || email.split('@')[0],
        amount: 500,
        description: 'Registration bonus',
        timestamp: Date.now(),
        type: 'bonus'
      });
    } catch (txError) {
      console.error('Failed to create registration transaction:', txError);
    }
    
    return { user: userData, token: authData.session?.access_token };
  } catch (error) {
    console.error('Registration error:', error);
    throw error instanceof Error ? error : new Error('Registration failed');
  }
};

/**
 * Log in a user with Supabase
 */
export const login = async (email, password) => {
  try {
    const supabase = await getSupabaseClient();
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      console.error('Supabase login error:', authError);
      throw new Error(authError.message || 'Login failed');
    }
    
    if (!authData.user) {
      throw new Error('Login succeeded but no user was returned');
    }
    
    // Initialize default user data
    let userData = {
      id: authData.user.id,
      email: authData.user.email,
      name: authData.user.user_metadata?.name || authData.user.email.split('@')[0],
      jackPoints: 0,
      transactions: [],
      lastUpdated: new Date().getTime(),
      hasReceivedInitialBonus: false,
      rank: 'normal',
      isVerified: authData.user.email_confirmed_at != null,
      avatar: null,
      phoneNumber: null,
      phoneVerified: false,
      socialAccounts: {}
    };
    
    // Get user profile from database
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    // If profile exists, use that data
    if (profileData && !profileError) {
      userData = {
        ...userData,
        name: profileData.name || userData.name,
        jackPoints: profileData.jackPoints || 0,
        transactions: profileData.transactions || [],
        lastUpdated: profileData.lastUpdated || userData.lastUpdated,
        hasReceivedInitialBonus: profileData.hasReceivedInitialBonus || false,
        rank: profileData.rank || 'normal',
        avatar: profileData.avatar || null,
        phoneNumber: profileData.phoneNumber || null,
        phoneVerified: profileData.phoneVerified || false,
        socialAccounts: profileData.socialAccounts || {},
        isVerified: profileData.isVerified || userData.isVerified,
      };
    } else if (profileError) {
      console.error('Error fetching profile:', profileError);
      // Create profile if it doesn't exist
      const { error: createProfileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || authData.user.email.split('@')[0],
          jackPoints: 10, // Initial points for login
          lastUpdated: userData.lastUpdated,
          hasReceivedInitialBonus: false,
          rank: 'normal',
          isVerified: authData.user.email_confirmed_at != null,
        });
      
      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
      }
    }
    
    // Store user data
    setUser(userData);
    setToken(authData.session?.access_token || '');
    
    // Create a login transaction
    try {
      await addTransaction({
        userId: authData.user.id,
        userEmail: userData.email,
        userName: userData.name,
        amount: 10,
        description: 'Login bonus',
        timestamp: Date.now(),
        type: 'bonus'
      });
    } catch (txError) {
      console.error('Failed to create login transaction:', txError);
    }
    
    return { user: userData, token: authData.session?.access_token };
  } catch (error) {
    console.error('Login error:', error);
    throw error instanceof Error ? error : new Error('Login failed');
  }
};

/**
 * Log out a user with Supabase
 */
export const logout = async () => {
  try {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase logout error:', error);
    }
    
    // Clean up local storage regardless of server response
    removeToken();
    removeUser();
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Still clean up local storage
    removeToken();
    removeUser();
    throw error;
  }
};

/**
 * Check if user is authenticated with Supabase
 */
export const isAuthenticated = async () => {
  try {
    const supabase = await getSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
      return false;
    }
    
    return !!session;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

/**
 * Get current user from Supabase
 */
export const getCurrentUser = async () => {
  try {
    const supabase = await getSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      removeToken();
      removeUser();
      throw new Error('Failed to get user profile');
    }
    
    // Get user profile from database
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to get user profile data');
    }
    
    return profileData;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * Update user profile in Supabase
 */
export const updateProfile = async (data) => {
  try {
    console.log('Updating profile with data:', data);
    
    // First update local storage user data
    const currentUser = getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...data };
      
      // Special handling for social accounts to ensure they're properly merged
      if (data.socialAccounts) {
        // Make sure we don't lose existing social account data
        updatedUser.socialAccounts = {
          ...(currentUser.socialAccounts || {}),
          ...data.socialAccounts
        };
        console.log('Updated social accounts:', updatedUser.socialAccounts);
      }
      
      // Update last updated timestamp
      updatedUser.lastUpdated = Date.now();
      
      // Save to localStorage
      setUser(updatedUser);
      
      // Also persist social accounts separately for redundancy
      if (updatedUser.socialAccounts) {
        localStorage.setItem('user_social_accounts', JSON.stringify(updatedUser.socialAccounts));
      }
    }
    
    // Try to update in Supabase if available
    const supabase = await getSupabaseClient();
    if (!supabase) {
      console.log('Supabase client not available. Profile updated only in localStorage.');
      return { user: currentUser };
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.warn('Not authenticated with Supabase. Profile updated only in localStorage.');
      return { user: currentUser };
    }
    
    // Prepare data for Supabase update
    let supabaseData = { ...data };
    
    // Special handling for timestamp to ensure it's in the correct format
    if (!supabaseData.lastUpdated) {
      supabaseData.lastUpdated = Date.now();
    }
    
    // Update profile in database
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(supabaseData)
      .eq('id', user.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Profile update error in Supabase:', updateError);
      console.log('Profile was updated in localStorage but not in Supabase.');
      return { user: currentUser };
    }
    
    console.log('Profile updated successfully in both localStorage and Supabase:', updatedProfile);
    return { user: updatedProfile };
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}; 