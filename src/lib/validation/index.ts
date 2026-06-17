/**
 * Server-side validators for the core financial entities.
 *
 * Each validator returns an error message string when the payload is invalid,
 * or `null` when it is valid — so API routes can do:
 *
 *   const error = validateDonation(body);
 *   if (error) return NextResponse.json({ error }, { status: 400 });
 */

export type ValidationResult = string | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EVENT_RESOURCES = ['Main Hall', 'Community Room', 'Chapel'] as const;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isValidDate = (value: unknown): boolean =>
  value != null && !isNaN(new Date(value as any).getTime());

const isPositiveAmount = (value: unknown): boolean => {
  const amount = Number(value);
  return !isNaN(amount) && amount > 0;
};

export function validateDonation(donation: any): ValidationResult {
  if (!donation || typeof donation !== 'object') return 'Invalid request body';
  if (!isNonEmptyString(donation.donorName)) return 'Donor name is required';
  if (!isPositiveAmount(donation.amount)) return 'Amount must be a number greater than 0';
  if (!isValidDate(donation.date)) return 'A valid date is required';
  if (!isNonEmptyString(donation.category)) return 'Category is required';
  return null;
}

export function validateExpense(expense: any): ValidationResult {
  if (!expense || typeof expense !== 'object') return 'Invalid request body';
  if (!isNonEmptyString(expense.description)) return 'Description is required';
  if (!isPositiveAmount(expense.amount)) return 'Amount must be a number greater than 0';
  if (!isValidDate(expense.date)) return 'A valid date is required';
  if (!isNonEmptyString(expense.category)) return 'Category is required';
  return null;
}

export function validateEvent(event: any): ValidationResult {
  if (!event || typeof event !== 'object') return 'Invalid request body';
  if (!isNonEmptyString(event.title)) return 'Title is required';
  if (!isValidDate(event.date)) return 'A valid date is required';
  if (!EVENT_RESOURCES.includes(event.resource)) {
    return `Resource must be one of: ${EVENT_RESOURCES.join(', ')}`;
  }
  return null;
}

export function validateMember(member: any): ValidationResult {
  if (!member || typeof member !== 'object') return 'Invalid request body';
  if (!isNonEmptyString(member.name)) return 'Name is required';
  if (!isNonEmptyString(member.network)) return 'Network is required';
  if (isNonEmptyString(member.email) && !EMAIL_RE.test(member.email.trim())) {
    return 'Email address is not valid';
  }
  return null;
}
