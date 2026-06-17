import { query } from '../db/connection';

export const getAllDonations = () => query.all('SELECT * FROM donations');

export const createDonation = (donation: any) =>
  query.run(
    'INSERT INTO donations (id, donor_name, member_id, amount, date, category, giving_type_id, service_time, recorded_by_id, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [donation.id, donation.donor_name, donation.member_id, donation.amount, donation.date, donation.category, donation.giving_type_id, donation.service_time, donation.recorded_by_id, donation.reference]
  );

export const updateDonation = (id: string, donation: any) =>
  query.run(
    'UPDATE donations SET donor_name = ?, member_id = ?, amount = ?, date = ?, category = ?, giving_type_id = ?, service_time = ?, recorded_by_id = ?, reference = ? WHERE id = ?',
    [donation.donor_name, donation.member_id, donation.amount, donation.date, donation.category, donation.giving_type_id, donation.service_time, donation.recorded_by_id, donation.reference, id]
  );

export const deleteDonation = (id: string) =>
  query.run('DELETE FROM donations WHERE id = ?', [id]);

/** Optional date-range filter, ordered newest first. */
export const getDonationsWithFilters = (startDate?: string, endDate?: string) => {
  let sql = 'SELECT * FROM donations WHERE 1=1';
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

export const getDistinctServiceTimes = async () => {
  const rows = await query.all<{ service_time: string }>(
    'SELECT DISTINCT service_time FROM donations WHERE service_time IS NOT NULL'
  );
  return rows.map((row) => row.service_time);
};
