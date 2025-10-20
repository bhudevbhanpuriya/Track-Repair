export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: Date;
}

export interface Laptop {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  serialNumber?: string;
  issue: string;
  description?: string;
  isWarranty: boolean;
  warrantyExpiry?: Date;
  estimatedCost: number;
  actualCost?: number;
  images?: string[];
  createdAt: Date;
}

export interface RepairTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  laptopId: string;
  status: 'received' | 'diagnosis' | 'repair' | 'testing' | 'completed' | 'delivered';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  thirdPartyRepair?: {
    vendorName: string;
    sentDate: Date;
    expectedReturn: Date;
    cost: number;
    status: 'sent' | 'in-progress' | 'completed' | 'returned';
  };
  statusHistory: {
    status: string;
    timestamp: Date;
    notes?: string;
  }[];
  finalCost?: number;
  completedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

export interface StatusColors {
  received: string;
  diagnosis: string;
  repair: string;
  testing: string;
  completed: string;
  delivered: string;
}