import type { Expense } from './expense';

export type DashboardSummary = {
  total: number;
  count: number;
  average: number;
  needsReview: number;
};

export type CategoryBreakdown = {
  category: string;
  total: number;
  count: number;
};

export type MonthBreakdown = {
  month: string;
  total: number;
  count: number;
};

export type Dashboard = {
  summary: DashboardSummary;
  byCategory: CategoryBreakdown[];
  byMonth: MonthBreakdown[];
  byMerchant: Array<{ merchant: string; total: number; count: number }>;
  paymentMethods: Array<{ method: string; total: number; count: number }>;
  recentExpenses: Expense[];
};
