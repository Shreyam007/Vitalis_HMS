import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'vitalis_jwt_access_secret_super_secure_key_2026_x90a';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'vitalis_jwt_refresh_secret_super_secure_key_2026_b71y';

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, gender, phone, bloodGroup, emergencyContact, allergies, preExistingConditions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'patient',
    });

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const patientId = `PAT-${randomNum}`;
    const wristbandCode = `WB-${randomNum}`;

    const patient = await Patient.create({
      userId: user._id,
      patientId,
      wristbandCode,
      dateOfBirth,
      gender,
      phone,
      bloodGroup,
      emergencyContact,
      allergies: allergies || [],
      preExistingConditions: preExistingConditions || []
    });

    const tokens = generateTokens(user);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false, // dev
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Patient registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      patient,
      accessToken: tokens.accessToken
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let extraData = null;
    if (user.role === 'patient') {
      extraData = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      extraData = await Doctor.findOne({ userId: user._id });
    }

    const tokens = generateTokens(user);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: extraData
      },
      accessToken: tokens.accessToken
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

export const me = async (req, res) => {
  try {
    let extraData = null;
    if (req.user.role === 'patient') {
      extraData = await Patient.findOne({ userId: req.user._id });
    } else if (req.user.role === 'doctor') {
      extraData = await Doctor.findOne({ userId: req.user._id });
    }
    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profile: extraData
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out' });
};
