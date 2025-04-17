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

// Save users to JSON file database
const saveUsers = (users) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), 'utf8');
};

// Verify JWT token from request
const verifyToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export default function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify token
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
    
    const { id, email } = decoded;
    const emailLower = email.toLowerCase();
    
    // Get user data
    const users = getUsers();
    if (!users[emailLower]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get profile updates from request body
    const updates = req.body;
    const allowedUpdates = ['name', 'avatar', 'phoneNumber', 'socialAccounts'];
    
    // Filter out disallowed fields
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    // Apply updates
    users[emailLower] = {
      ...users[emailLower],
      ...filteredUpdates,
      lastUpdated: Date.now()
    };
    
    // Save updated users
    saveUsers(users);
    
    // Return updated user without password
    const { password, ...userWithoutPassword } = users[emailLower];
    
    return res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Server error updating profile' });
  }
} 