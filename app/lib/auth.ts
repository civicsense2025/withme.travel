import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export async function createToken(user: { id: string; email: string }) {
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return token;
}

export async function verifyUser(email: string, password: string) {
  const user = await fakeUserLookup(email);
  if (user && await bcrypt.compare(password, user.password)) {
    return user;
  }
  return null;
}

export async function createUser({
  email,
  password,
  username,
}: {
  email: string;
  password: string;
  username: string;
}) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now().toString(), email, username, password: hashedPassword };
  return newUser;
}

async function fakeUserLookup(email: string) {
  // Fake user lookup for demonstration. Replace with actual DB query.
  if (email === 'test@example.com') {
    return { id: '123', email, password: await bcrypt.hash('password', 10), username: 'test' };
  }
  return null;
}
