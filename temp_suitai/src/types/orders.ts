export interface Order {
  id: string;
  user_id: string;
  current_state: string;
  total_amount: number | null;
  created_at: string;
  updated_at: string;
  items?: {
    count: number;
  }[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedOrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrdersQueryParams {
  status?: string;
  page?: string;
  limit?: string;
}
