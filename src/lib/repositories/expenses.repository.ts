import { query } from '../db/connection';

export const getAllExpenses = () => query.all('SELECT * FROM expenses');

export const createExpense = (expense: any) =>
  query.run(
    'INSERT INTO expenses (id, description, amount, date, category, recorded_by_id) VALUES (?, ?, ?, ?, ?, ?)',
    [expense.id, expense.description, expense.amount, expense.date, expense.category, expense.recorded_by_id]
  );

export const updateExpense = (id: string, expense: any) =>
  query.run(
    'UPDATE expenses SET description = ?, amount = ?, date = ?, category = ?, recorded_by_id = ? WHERE id = ?',
    [expense.description, expense.amount, expense.date, expense.category, expense.recorded_by_id, id]
  );

export const deleteExpense = (id: string) =>
  query.run('DELETE FROM expenses WHERE id = ?', [id]);

/** Optional date-range filter, ordered newest first. */
export const getExpensesWithFilters = (startDate?: string, endDate?: string) => {
  let sql = 'SELECT * FROM expenses WHERE 1=1';
  const params: any[] = [];
  if (startDate) {
    sql += ' AND date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    sql += ' AND date <= ?';
    params.push(endDate);
  }
  sql += ' ORDER BY date DESC';
  return query.all(sql, params);
};
