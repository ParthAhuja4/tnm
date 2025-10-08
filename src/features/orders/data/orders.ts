export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'partially_refunded';

export interface OrderItem {
  sku: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderTimelineEvent {
  time: string;
  title: string;
  description: string;
}

export interface OrderAddress {
  name: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderSummary {
  label: string;
  value: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: string;
  paymentStatus: PaymentStatus;
  amount: number;
  destination: string;
  tags: string[];
  status: string;
  financialStatus: PaymentStatus;
  fulfillmentStatus: 'fulfilled' | 'unfulfilled' | 'partial';
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  items: OrderItem[];
  timeline: OrderTimelineEvent[];
  summary: OrderSummary[];
}

export const ORDERS: Order[] = [
  {
    id: 'ORD-2048',
    orderNumber: '2048',
    orderDate: '2025-06-15T11:32:00+05:30',
    deliveryDate: '2025-06-16T09:00:00+05:30',
    customer: {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98765 32145'
    },
    notes: 'Deliver before 10 AM, gate code 4521.',
    paymentStatus: 'paid',
    amount: 13250,
    destination: 'Koramangala Depot',
    tags: ['Wholesale', 'Vegetables'],
    status: 'Processing',
    financialStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    totals: {
      subtotal: 12500,
      shipping: 350,
      tax: 650,
      discount: 250,
      total: 13250
    },
    billingAddress: {
      name: 'Priya Sharma',
      company: 'Farmerr Collective',
      line1: '18, Lakeside Residency',
      line2: 'Phase 2',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      country: 'India',
      phone: '+91 98765 32145'
    },
    shippingAddress: {
      name: 'Priya Sharma',
      company: 'Farmerr Collective',
      line1: 'Warehouse #7, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560095',
      country: 'India',
      phone: '+91 98765 32145'
    },
    items: [
      {
        sku: 'VEG-TMT-5KG',
        productName: 'Tomato Heirloom (5 kg crate)',
        quantity: 12,
        price: 480,
        total: 5760
      },
      {
        sku: 'VEG-SPN-3KG',
        productName: 'Spinach Organic (3 kg bundle)',
        quantity: 10,
        price: 260,
        total: 2600
      },
      {
        sku: 'FRU-BAN-12KG',
        productName: 'Banana Yelakki (12 kg box)',
        quantity: 5,
        price: 620,
        total: 3100
      }
    ],
    timeline: [
      {
        time: '15 Jun • 11:32 AM',
        title: 'Order placed',
        description: 'Customer confirmed order through dashboard.'
      },
      {
        time: '15 Jun • 11:35 AM',
        title: 'Payment received',
        description: 'UPI payment captured successfully.'
      },
      {
        time: '15 Jun • 02:10 PM',
        title: 'Inventory reserved',
        description: 'Skus reserved from Warehouse 3 (Bengaluru).'
      }
    ],
    summary: [
      { label: 'Order Channel', value: 'TNM Web Portal' },
      { label: 'Delivery Slot', value: '16 Jun • 7:00-10:00 AM' },
      { label: 'Logistics Partner', value: 'Farmerr Fleet' },
      { label: 'Payment Method', value: 'UPI - GPay' }
    ]
  },
  {
    id: 'ORD-2047',
    orderNumber: '2047',
    orderDate: '2025-06-15T09:18:00+05:30',
    deliveryDate: '2025-06-15T17:00:00+05:30',
    customer: {
      name: 'Ravi Patel',
      email: 'ravi.patel@freshmart.in',
      phone: '+91 91234 56780'
    },
    notes: 'Leave crates at receiving dock 2.',
    paymentStatus: 'paid',
    amount: 12860,
    destination: 'FreshMart Whitefield',
    tags: ['Retail', 'Priority'],
    status: 'Delivered',
    financialStatus: 'paid',
    fulfillmentStatus: 'fulfilled',
    totals: {
      subtotal: 12000,
      shipping: 200,
      tax: 860,
      discount: 200,
      total: 12860
    },
    billingAddress: {
      name: 'FreshMart India Pvt Ltd',
      line1: '41, Hosur Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560068',
      country: 'India',
      phone: '+91 91234 56780'
    },
    shippingAddress: {
      name: 'Receiving - FreshMart Whitefield',
      line1: 'Plot 9B, EPIP Zone',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      country: 'India',
      phone: '+91 91234 56780'
    },
    items: [
      {
        sku: 'FRU-APP-10KG',
        productName: 'Apple Shimla (10 kg box)',
        quantity: 6,
        price: 830,
        total: 4980
      },
      {
        sku: 'VEG-PTT-20KG',
        productName: 'Potato Premium (20 kg sack)',
        quantity: 4,
        price: 700,
        total: 2800
      },
      {
        sku: 'VEG-CAR-15KG',
        productName: 'Carrot Ooty (15 kg crate)',
        quantity: 3,
        price: 820,
        total: 2460
      }
    ],
    timeline: [
      {
        time: '15 Jun • 09:18 AM',
        title: 'Order placed',
        description: 'Retail partner placed order via API integration.'
      },
      {
        time: '15 Jun • 09:20 AM',
        title: 'Payment received',
        description: 'Invoice marked as paid via NEFT.'
      },
      {
        time: '15 Jun • 12:45 PM',
        title: 'Order dispatched',
        description: 'Dispatched via Farmerr Fleet vehicle KA05 FM 9834.'
      },
      {
        time: '15 Jun • 04:55 PM',
        title: 'Order delivered',
        description: 'Delivery acknowledged by FreshMart receiving supervisor.'
      }
    ],
    summary: [
      { label: 'Order Channel', value: 'Retail API' },
      { label: 'Delivery Slot', value: '15 Jun • 4:00-6:00 PM' },
      { label: 'Logistics Partner', value: 'Farmerr Fleet' },
      { label: 'Payment Method', value: 'NEFT - ICICI Bank' }
    ]
  }
];

export const getOrderById = (orderId: string): Order | undefined =>
  ORDERS.find((order) => order.id === orderId || order.orderNumber === orderId);
