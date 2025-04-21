import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/register
 * Handle user registration with Supabase Auth
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Register API called');
    const { email, password, name } = await request.json();
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) {
      console.error('Supabase registration error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error.message || 'Registration failed' 
        },
        { status: 400 }
      );
    }
    
    if (!data.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User registration failed' 
        },
        { status: 400 }
      );
    }
    
    // Create a profile in Supabase
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: email,
        name: name || email.split('@')[0],
        jackPoints: 500, // Initial bonus
        lastUpdated: new Date().getTime(),
        hasReceivedInitialBonus: true,
        rank: 'normal',
        isVerified: false,
      }, { onConflict: 'id' })
      .select()
      .single();
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue even if profile creation fails
    }
    
    // Create user object
    const user = {
      id: data.user.id,
      email: data.user.email || '',
      name: name || data.user.email?.split('@')[0] || 'User',
      jackPoints: 500,
      lastUpdated: new Date().getTime(),
      hasReceivedInitialBonus: true,
      rank: 'normal',
      isVerified: false,
    };
    
    // Return success response
    return NextResponse.json({
      success: true,
      user,
      token: data.session?.access_token || '',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Registration failed' 
      },
      { status: 400 }
    );
  }
} 