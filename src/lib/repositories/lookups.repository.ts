import { query } from '../db/connection';

/**
 * The lookup tables (categories, service times, giving types, networks) all
 * share the same shape: an id, a single label column, and a created_at. This
 * factory builds the CRUD helpers for one of them so we don't repeat the same
 * four functions five times.
 */
function lookupRepository(table: string, labelColumn: 'name' | 'time') {
  return {
    getAll: () => query.all(`SELECT * FROM ${table} ORDER BY ${labelColumn}`),
    create: (id: string, label: string) =>
      query.run(`INSERT INTO ${table} (id, ${labelColumn}, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`, [id, label]),
    update: (id: string, label: string) =>
      query.run(`UPDATE ${table} SET ${labelColumn} = ? WHERE id = ?`, [label, id]),
    remove: (id: string) =>
      query.run(`DELETE FROM ${table} WHERE id = ?`, [id]),
  };
}

const donationCategories = lookupRepository('donation_categories', 'name');
const expenseCategories = lookupRepository('expense_categories', 'name');
const serviceTimes = lookupRepository('service_times', 'time');
const givingTypes = lookupRepository('giving_types', 'name');
const networks = lookupRepository('networks', 'name');

// --- Donation categories ---
export const getAllDonationCategories = () => donationCategories.getAll();
export const createDonationCategory = (category: { id: string; name: string }) =>
  donationCategories.create(category.id, category.name);
export const updateDonationCategory = (id: string, name: string) => donationCategories.update(id, name);
export const deleteDonationCategory = (id: string) => donationCategories.remove(id);

// --- Expense categories ---
export const getAllExpenseCategories = () => expenseCategories.getAll();
export const createExpenseCategory = (category: { id: string; name: string }) =>
  expenseCategories.create(category.id, category.name);
export const updateExpenseCategory = (id: string, name: string) => expenseCategories.update(id, name);
export const deleteExpenseCategory = (id: string) => expenseCategories.remove(id);

// --- Service times ---
export const getAllServiceTimes = () => serviceTimes.getAll();
export const createServiceTime = (serviceTime: { id: string; time: string }) =>
  serviceTimes.create(serviceTime.id, serviceTime.time);
export const updateServiceTime = (id: string, time: string) => serviceTimes.update(id, time);
export const deleteServiceTime = (id: string) => serviceTimes.remove(id);

// --- Giving types ---
export const getAllGivingTypes = () => givingTypes.getAll();
export const createGivingType = (givingType: { id: string; name: string }) =>
  givingTypes.create(givingType.id, givingType.name);
export const updateGivingType = (id: string, name: string) => givingTypes.update(id, name);
export const deleteGivingType = (id: string) => givingTypes.remove(id);

// --- Networks ---
export const getAllNetworks = () => networks.getAll();
export const createNetwork = (network: { id: string; name: string }) =>
  networks.create(network.id, network.name);
export const updateNetwork = (id: string, name: string) => networks.update(id, name);
export const deleteNetwork = (id: string) => networks.remove(id);
