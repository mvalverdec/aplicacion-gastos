export type Expense = {
  id: number;
  importId: number | null;
  categoryId: number | null;
  categoryName: string | null;
  date: string | null;
  merchant: string | null;
  description: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  documentNumber: string | null;
  confidence: number | null;
  needsReview: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
