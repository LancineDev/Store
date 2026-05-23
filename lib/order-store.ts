import "server-only";
import fs from "fs";
import path from "path";

export type Order = {
  id: string
  items: Array<{
    product: { id: string; name: string; price: number }
    quantity: number
    size?: string
    color?: string
  }>
  total: number
  shipping: number
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
    country: string
    paymentMethod: string
    deliveryOption: string
  }
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
}

const dataFile = path.join(process.cwd(), "data", "orders.json");

export function getOrders(): Order[] {
  try {
    if (!fs.existsSync(dataFile)) {
      fs.mkdirSync(path.dirname(dataFile), { recursive: true });
      fs.writeFileSync(dataFile, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const raw = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(orders, null, 2), "utf-8");
}

export function addOrder(order: Order): void {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
}

export function updateOrderStatus(orderId: string, status: Order['status']): boolean {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return false;

  orders[orderIndex].status = status;
  saveOrders(orders);
  return true;
}