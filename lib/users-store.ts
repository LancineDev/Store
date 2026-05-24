import "server-only";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export type UserRole = "user" | "admin";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  role: UserRole;
};

const usersFile = path.join(process.cwd(), "data", "users.json");

function readUsers(): UserRecord[] {
  try {
    if (!fs.existsSync(usersFile)) return [];
    return JSON.parse(fs.readFileSync(usersFile, "utf-8")) as UserRecord[];
  } catch {
    return [];
  }
}

function writeUsers(users: UserRecord[]) {
  fs.mkdirSync(path.dirname(usersFile), { recursive: true });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf-8");
}

export function isAdminEmail(email: string): boolean {
  const list = (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

function roleForEmail(email: string, existing?: UserRole): UserRole {
  if (existing === "admin") return "admin";
  if (isAdminEmail(email)) return "admin";
  return existing ?? "user";
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createCredentialsUser(
  email: string,
  password: string,
  name: string
): { ok: true; user: UserRecord } | { ok: false; error: string } {
  if (findUserByEmail(email)) {
    return { ok: false, error: "Un compte existe déjà avec cet e-mail." };
  }
  const users = readUsers();
  const id = randomUUID();
  const role = roleForEmail(email);
  const user: UserRecord = {
    id,
    email: email.toLowerCase(),
    name,
    passwordHash: bcrypt.hashSync(password, 10),
    role,
  };
  users.push(user);
  writeUsers(users);
  return { ok: true, user };
}

export function validateCredentials(
  email: string,
  password: string
): UserRecord | null {
  const user = findUserByEmail(email);
  if (!user?.passwordHash) return null;
  if (!bcrypt.compareSync(password, user.passwordHash)) return null;
  const r = roleForEmail(user.email, user.role);
  if (r !== user.role) {
    const users = readUsers();
    const i = users.findIndex((u) => u.id === user.id);
    if (i >= 0) {
      users[i] = { ...users[i], role: r };
      writeUsers(users);
    }
    return { ...user, role: r };
  }
  return user;
}

export function upsertOAuthUser(email: string, name: string): UserRecord {
  const users = readUsers();
  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    const r = roleForEmail(user.email, user.role);
    if (r !== user.role || user.name !== name) {
      user = { ...user, name, role: r };
      const i = users.findIndex((u) => u.id === user!.id);
      users[i] = user;
      writeUsers(users);
    }
    return user;
  }
  const id = randomUUID();
  const role = roleForEmail(email);
  user = { id, email: email.toLowerCase(), name, role };
  users.push(user);
  writeUsers(users);
  return user;
}
