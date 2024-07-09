export interface TProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images?: [string];
  isDeleted?: boolean;
  createdAt: Date;
}
