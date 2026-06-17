import { query } from '../db/connection';

export const getAllMembers = () => query.all('SELECT * FROM members');

export const createMember = (member: any) =>
  query.run(
    'INSERT INTO members (id, name, email, phone, join_date, avatar_url, address, network) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [member.id, member.name, member.email, member.phone, member.join_date, member.avatar_url, member.address, member.network]
  );

export const updateMember = (id: string, member: any) =>
  query.run(
    'UPDATE members SET name = ?, email = ?, phone = ?, join_date = ?, avatar_url = ?, address = ?, network = ? WHERE id = ?',
    [member.name, member.email, member.phone, member.join_date, member.avatar_url, member.address, member.network, id]
  );

export const deleteMember = (id: string) =>
  query.run('DELETE FROM members WHERE id = ?', [id]);
