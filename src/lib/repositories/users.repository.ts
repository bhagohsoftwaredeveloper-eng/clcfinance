import { query } from '../db/connection';

/** Parse the JSON-encoded permissions column into an object. */
const withParsedPermissions = (user: any) => {
  if (user && typeof user.permissions === 'string') {
    user.permissions = JSON.parse(user.permissions);
  }
  return user;
};

export const getAllUsers = async () => {
  const users = await query.all('SELECT * FROM users');
  return users.map(withParsedPermissions);
};

export const getUserById = async (id: string) => {
  const user = await query.get('SELECT * FROM users WHERE id = ?', [id]);
  return user ? withParsedPermissions(user) : user;
};

export const getUserByUsername = async (username: string) => {
  const user = await query.get('SELECT * FROM users WHERE username = ?', [username]);
  return user ? withParsedPermissions(user) : user;
};

export const createUser = (user: any) =>
  query.run(
    'INSERT INTO users (id, name, username, role, password, permissions) VALUES (?, ?, ?, ?, ?, ?)',
    [user.id, user.name, user.username, user.role, user.password, JSON.stringify(user.permissions)]
  );

export const updateUser = (id: string, user: any) =>
  query.run(
    'UPDATE users SET name = ?, username = ?, role = ?, password = IFNULL(?, password), permissions = ? WHERE id = ?',
    [user.name, user.username, user.role, user.password || null, JSON.stringify(user.permissions), id]
  );

export const deleteUser = (id: string) =>
  query.run('DELETE FROM users WHERE id = ?', [id]);
