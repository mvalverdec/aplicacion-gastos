import type { Expense } from './expense';

export type DashboardSummary = {
  amountCrc: number;
  amountUsd: number;
  count: number;
  averageCrc: number;
  averageUsd: number;
  needsReview: number;
  exchangeRate: {
    date: string;
    rate: number | null;
    source: string;
    indicator: number;
  };
  conversionIssues: Array<{
    id: number;
    currency: string;
    status: string;
  }>;
};

export type CategoryBreakdown = {
  category: string;
  amountCrc: number;
  amountUsd: number;
  count: number;
};

export type MonthBreakdown = {
  month: string;
  amountCrc: number;
  amountUsd: number;
  count: number;
};

export type Dashboard = {
  summary: DashboardSummary;
  byCategory: CategoryBreakdown[];
  byMonth: MonthBreakdown[];
  byMerchant: Array<{ merchant: string; amountCrc: number; amountUsd: number; count: number }>;
  paymentMethods: Array<{ method: string; amountCrc: number; amountUsd: number; count: number }>;
  recentExpenses: Expense[];
};
