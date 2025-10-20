import React from 'react';
import { BarChart3, DollarSign, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { RepairTicket } from '../types';

interface DashboardProps {
  tickets: RepairTicket[];
}

const Dashboard: React.FC<DashboardProps> = ({ tickets }) => {
  const stats = {
    totalTickets: tickets.length,
    activeTickets: tickets.filter(t => t.status !== 'delivered').length,
    completedToday: tickets.filter(t => 
      t.status === 'completed' && 
      new Date(t.completedAt || '').toDateString() === new Date().toDateString()
    ).length,
    totalRevenue: tickets
      .filter(t => t.finalCost)
      .reduce((sum, t) => sum + (t.finalCost || 0), 0),
    avgRepairTime: calculateAvgRepairTime(tickets),
    pendingDelivery: tickets.filter(t => t.status === 'completed').length
  };

  function calculateAvgRepairTime(tickets: RepairTicket[]): number {
    const completedTickets = tickets.filter(t => t.completedAt);
    if (completedTickets.length === 0) return 0;
    
    const totalTime = completedTickets.reduce((sum, ticket) => {
      const start = new Date(ticket.createdAt).getTime();
      const end = new Date(ticket.completedAt!).getTime();
      return sum + (end - start);
    }, 0);
    
    return Math.round(totalTime / completedTickets.length / (1000 * 60 * 60 * 24)); // days
  }

  const statusDistribution = {
    received: tickets.filter(t => t.status === 'received').length,
    diagnosis: tickets.filter(t => t.status === 'diagnosis').length,
    repair: tickets.filter(t => t.status === 'repair').length,
    testing: tickets.filter(t => t.status === 'testing').length,
    completed: tickets.filter(t => t.status === 'completed').length,
    delivered: tickets.filter(t => t.status === 'delivered').length,
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    change?: string;
  }> = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className="text-green-400 text-sm mt-1 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Tickets"
          value={stats.totalTickets}
          icon={BarChart3}
          color="bg-blue-600"
          change="+12% from last month"
        />
        <StatCard
          title="Active Repairs"
          value={stats.activeTickets}
          icon={Clock}
          color="bg-yellow-600"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          icon={CheckCircle}
          color="bg-green-600"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-600"
          change="+8% from last month"
        />
        <StatCard
          title="Avg Repair Time"
          value={`${stats.avgRepairTime} days`}
          icon={Clock}
          color="bg-indigo-600"
        />
        <StatCard
          title="Pending Delivery"
          value={stats.pendingDelivery}
          icon={AlertTriangle}
          color="bg-red-600"
        />
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const percentage = stats.totalTickets > 0 ? (count / stats.totalTickets) * 100 : 0;
              const colors = {
                received: 'bg-red-600',
                diagnosis: 'bg-orange-600',
                repair: 'bg-yellow-600',
                testing: 'bg-blue-600',
                completed: 'bg-green-600',
                delivered: 'bg-gray-600'
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colors[status as keyof typeof colors]}`} />
                    <span className="capitalize text-gray-300">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{count}</span>
                    <span className="text-gray-400 text-sm">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {tickets
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                  <div>
                    <p className="text-white font-medium">#{ticket.ticketNumber}</p>
                    <p className="text-gray-400 text-sm capitalize">{ticket.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;