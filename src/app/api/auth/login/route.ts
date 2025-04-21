import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/login
 * Handle user login with Supabase Auth
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Login API called');
    const { email, password } = await request.json();
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Supabase login error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error.message || 'Authentication failed' 
        },
        { status: 401 }
      );
    }
    
    if (!data.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 401 }
      );
    }
    
    // Get user profile from database
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // If profile doesn't exist, create one
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          jackPoints: 10,
          lastUpdated: new Date().getTime(),
        });
      
      if (upsertError) {
        console.error('Error creating profile:', upsertError);
      }
    }
    
    // Create user object
    const user = {
      id: data.user.id,
      email: data.user.email || '',
      name: profileData?.name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
      jackPoints: profileData?.jackPoints || 10,
      lastUpdated: profileData?.lastUpdated || new Date().getTime(),
      hasReceivedInitialBonus: profileData?.hasReceivedInitialBonus || false,
      rank: profileData?.rank || 'normal',
      isVerified: data.user.email_confirmed_at != null || profileData?.isVerified || false,
    };
    
    // Return success response
    return NextResponse.json({
      success: true,
      user,
      token: data.session?.access_token || '',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Authentication failed' 
      },
      { status: 401 }
    );
  }
} 