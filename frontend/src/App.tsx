import React from 'react';
import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CustomerForm from './components/CustomerForm';
import LaptopForm from './components/LaptopForm';
import TrackingBoard from './components/TrackingBoard';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Customer, Laptop, RepairTicket } from './types';
import { sendSMSNotification, sendWhatsAppNotification, generateCompletionMessage, generateStatusUpdateMessage } from './utils/notifications';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [laptops, setLaptops] = useLocalStorage<Laptop[]>('laptops', []);
  const [tickets, setTickets] = useLocalStorage<RepairTicket[]>('tickets', []);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showLaptopForm, setShowLaptopForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RT${year}${month}${day}${random}`;
  };

  const handleCustomerSubmit = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    setSelectedCustomerId(newCustomer.id);
    setShowCustomerForm(false);
    setShowLaptopForm(true);
  };

  const handleLaptopSubmit = (laptopData: Omit<Laptop, 'id' | 'createdAt'>) => {
    const newLaptop: Laptop = {
      ...laptopData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    const newTicket: RepairTicket = {
      id: Date.now().toString() + '_ticket',
      ticketNumber: generateTicketNumber(),
      customerId: laptopData.customerId,
      laptopId: newLaptop.id,
      status: 'received',
      priority: 'medium',
      statusHistory: [{
        status: 'received',
        timestamp: new Date(),
        notes: 'Laptop received for repair'
      }],
      createdAt: new Date(),
    };

    setLaptops(prev => [...prev, newLaptop]);
    setTickets(prev => [...prev, newTicket]);
    setShowLaptopForm(false);
    setCurrentPage('tracking');
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: RepairTicket['status']) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        const updatedTicket = {
          ...ticket,
          status: newStatus,
          statusHistory: [
            ...ticket.statusHistory,
            {
              status: newStatus,
              timestamp: new Date(),
              notes: `Status updated to ${newStatus}`
            }
          ],
          ...(newStatus === 'completed' && { completedAt: new Date() }),
          ...(newStatus === 'delivered' && { deliveredAt: new Date() })
        };

        // Send notifications for completed status
        if (newStatus === 'completed') {
          const customer = customers.find(c => c.id === ticket.customerId);
          if (customer) {
            const message = generateCompletionMessage(ticket.ticketNumber, customer.name);
            sendSMSNotification(customer.phone, message);
            if (customer.email) {
              // In production, also send email notification
            }
          }
        }

        return updatedTicket;
      }
      return ticket;
    }));
  };

  const handleTicketClick = (ticket: RepairTicket) => {
    // In a full implementation, this would open a detailed ticket view
    console.log('Ticket clicked:', ticket);
  };

  const renderCurrentPage = () => {
    if (showCustomerForm) {
      return (
        <CustomerForm
          onSubmit={handleCustomerSubmit}
          onCancel={() => setShowCustomerForm(false)}
        />
      );
    }

    if (showLaptopForm) {
      return (
        <LaptopForm
          customerId={selectedCustomerId}
          onSubmit={handleLaptopSubmit}
          onCancel={() => {
            setShowLaptopForm(false);
            setSelectedCustomerId('');
          }}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard tickets={tickets} />;
      case 'customers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Customers</h2>
              <button
                onClick={() => setShowCustomerForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                Add New Customer
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Repairs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {customers.map(customer => (
                    <tr key={customer.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-white">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{customer.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{customer.email || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {tickets.filter(t => t.customerId === customer.id).length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'tracking':
        return (
          <TrackingBoard
            tickets={tickets}
            onTicketClick={handleTicketClick}
            onStatusUpdate={handleStatusUpdate}
          />
        );
      default:
        return <Dashboard tickets={tickets} />;
    }
  };
  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;
