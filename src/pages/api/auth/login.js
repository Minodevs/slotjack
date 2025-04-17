import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-slotjack-2023';
const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

// Get users from JSON file database
const getUsers = () => {
  if (!fs.existsSync(DB_PATH)) {
    return {};
  }
  
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users database:', error);
    return {};
  }
};

// Update user in database
const updateUser = (email, updates) => {
  try {
    const users = getUsers();
    if (users[email]) {
      users[email] = { ...users[email], ...updates };
      fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre zorunludur' });
    }
    
    const emailLower = email.toLowerCase();
    const users = getUsers();
    
    // Check if user exists
    if (!users[emailLower]) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı. Lütfen kayıt olun.' });
    }
    
    const user = users[emailLower];
    
    // Check password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Hatalı şifre. Lütfen tekrar deneyin.' });
    }
    
    // Update last login time
    updateUser(emailLower, { lastLogin: Date.now() });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: emailLower,
        name: user.name,
        rank: user.rank
      }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return token and user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
} 