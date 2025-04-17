import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-slotjack-2023';
const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Get users from JSON file database
const getUsers = () => {
  ensureDirectoryExists(path.dirname(DB_PATH));
  
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}), 'utf8');
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

// Save users to JSON file database
const saveUsers = (users) => {
  ensureDirectoryExists(path.dirname(DB_PATH));
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), 'utf8');
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const emailLower = email.toLowerCase();
    const users = getUsers();
    
    // Check if user already exists
    if (users[emailLower]) {
      return res.status(409).json({ error: 'Bu e-posta adresi zaten kullanılıyor. Lütfen giriş yapmayı deneyin.' });
    }
    
    // Create new user
    const userId = uuidv4();
    const newUser = {
      id: userId,
      email: emailLower,
      password, // In production, hash this password
      name,
      rank: emailLower === 'sezarpaypals2@gmail.com' ? 'admin' : 'normal',
      isVerified: false,
      jackPoints: 500,
      hasReceivedInitialBonus: true,
      transactions: [
        {
          id: uuidv4(),
          amount: 500,
          description: 'Hoş Geldin Bonusu! Tebrikler, siteye kayıt olduğunuz için bonus JackPoints kazandınız.',
          timestamp: Date.now(),
          type: 'bonus'
        }
      ],
      createdAt: Date.now(),
      lastLogin: Date.now()
    };
    
    // Save user to database
    users[emailLower] = newUser;
    saveUsers(users);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: userId, 
        email: emailLower,
        name,
        rank: newUser.rank
      }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return token and user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error during registration' });
  }
} 