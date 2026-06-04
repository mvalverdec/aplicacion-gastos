export type Category = {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
  parentId: number | null;
  isSystem: boolean;
};
