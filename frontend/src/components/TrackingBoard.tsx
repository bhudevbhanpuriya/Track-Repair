import React from 'react';
import { Clock, AlertTriangle, Wrench, CheckCircle, Package, ExternalLink } from 'lucide-react';
import { RepairTicket, StatusColors } from '../types';

interface TrackingBoardProps {
  tickets: RepairTicket[];
  onTicketClick: (ticket: RepairTicket) => void;
  onStatusUpdate: (ticketId: string, newStatus: RepairTicket['status']) => void;
}

const TrackingBoard: React.FC<TrackingBoardProps> = ({ tickets, onTicketClick, onStatusUpdate }) => {
  const statusConfig = {
    received: { 
      label: 'Received', 
      icon: Package, 
      color: 'bg-red-600', 
      textColor: 'text-red-100',
      borderColor: 'border-red-500'
    },
    diagnosis: { 
      label: 'Diagnosis', 
      icon: AlertTriangle, 
      color: 'bg-orange-600', 
      textColor: 'text-orange-100',
      borderColor: 'border-orange-500'
    },
    repair: { 
      label: 'Under Repair', 
      icon: Wrench, 
      color: 'bg-yellow-600', 
      textColor: 'text-yellow-100',
      borderColor: 'border-yellow-500'
    },
    testing: { 
      label: 'Testing', 
      icon: Clock, 
      color: 'bg-blue-600', 
      textColor: 'text-blue-100',
      borderColor: 'border-blue-500'
    },
    completed: { 
      label: 'Completed', 
      icon: CheckCircle, 
      color: 'bg-green-600', 
      textColor: 'text-green-100',
      borderColor: 'border-green-500'
    },
    delivered: { 
      label: 'Delivered', 
      icon: CheckCircle, 
      color: 'bg-gray-600', 
      textColor: 'text-gray-100',
      borderColor: 'border-gray-500'
    }
  };

  const getTicketsByStatus = (status: RepairTicket['status']) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Repair Tracking Board</h2>
        <div className="text-sm text-gray-400">
          Total Active Tickets: {tickets.filter(t => t.status !== 'delivered').length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusTickets = getTicketsByStatus(status as RepairTicket['status']);
          const Icon = config.icon;

          return (
            <div key={status} className="bg-gray-800 rounded-lg border border-gray-700">
              <div className={`${config.color} ${config.textColor} p-4 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <h3 className="font-semibold">{config.label}</h3>
                  </div>
                  <span className="bg-black bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    {statusTickets.length}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {statusTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => onTicketClick(ticket)}
                    className={`p-3 bg-gray-700 rounded-lg border ${config.borderColor} cursor-pointer hover:bg-gray-600 transition-colors`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm">#{ticket.ticketNumber}</div>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`} />
                    </div>
                    
                    <div className="text-xs text-gray-300 mb-2">
                      {formatDate(ticket.createdAt)}
                    </div>

                    {ticket.thirdPartyRepair && (
                      <div className="flex items-center text-xs text-blue-400 mb-2">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {ticket.thirdPartyRepair.vendorName}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <select
                        value={ticket.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          onStatusUpdate(ticket.id, e.target.value as RepairTicket['status']);
                        }}
                        className="text-xs bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {Object.entries(statusConfig).map(([key, value]) => (
                          <option key={key} value={key}>{value.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {statusTickets.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tickets</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingBoard;