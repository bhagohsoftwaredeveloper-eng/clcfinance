import { query } from '../db/connection';

export const getAllEvents = () => query.all('SELECT * FROM events');

export const createEvent = (event: any) =>
  query.run(
    'INSERT INTO events (id, title, date, description, resource) VALUES (?, ?, ?, ?, ?)',
    [event.id, event.title, event.date, event.description, event.resource]
  );

export const updateEvent = (id: string, event: any) =>
  query.run(
    'UPDATE events SET title = ?, date = ?, description = ?, resource = ? WHERE id = ?',
    [event.title, event.date, event.description, event.resource, id]
  );

export const deleteEvent = (id: string) =>
  query.run('DELETE FROM events WHERE id = ?', [id]);
