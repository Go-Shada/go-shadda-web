export type Role = 'customer' | 'vendor' | 'admin';

export interface UserProfile {
  displayName?: string;
  avatarUrl?: string;
  campus?: string;
}

export interface UserDTO {
  _id: string;
  email: string;
  role: Role;
  profile?: UserProfile;
  vendorId?: string;
}

export interface VendorDTO {
  _id: string;
  storeName: string;
  bio?: string;
  ratings?: number;
}

export interface ProductVariantDTO {
  size: string;
  color: string;
  stock: number;
}

export interface ProductDTO {
  _id: string;
  vendorId: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  categories?: string[];
  variants?: ProductVariantDTO[];
}

export interface OrderItemDTO {
  productId: string;
  quantity: number;
  price: number;
  variant?: { size?: string; color?: string };
}

export interface OrderDTO {
  _id: string;
  customerId: string;
  vendorId: string;
  items: OrderItemDTO[];
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  tracking?: string;
}
