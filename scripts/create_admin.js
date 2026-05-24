#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

function usage() {
  console.log('Usage: node scripts/create_admin.js <email> <password>');
  process.exit(1);
}

const [,, email, password] = process.argv;
if (!email || !password) usage();

const usersFile = path.join(process.cwd(), 'data', 'users.json');
function readUsers() {
  try {
    if (!fs.existsSync(usersFile)) return [];
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  } catch (e) {
    console.error('Failed reading users file:', e.message);
    return [];
  }
}

function writeUsers(users) {
  fs.mkdirSync(path.dirname(usersFile), { recursive: true });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

const users = readUsers();
const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
if (existing) {
  console.log('User already exists, updating password and role to admin.');
  existing.passwordHash = bcrypt.hashSync(password, 10);
  existing.role = 'admin';
  writeUsers(users);
  console.log('Updated user:', email);
  process.exit(0);
}

const user = {
  id: randomUUID(),
  email: email.toLowerCase(),
  name: email.split('@')[0],
  passwordHash: bcrypt.hashSync(password, 10),
  role: 'admin',
};
users.push(user);
writeUsers(users);
console.log('Created admin user:', email);
