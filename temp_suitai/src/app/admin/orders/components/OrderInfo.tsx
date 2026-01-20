interface OrderInfoProps {
  orderNumber: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
}

export function OrderInfo({
  orderNumber,
  status,
  totalPrice,
  createdAt,
  updatedAt,
  notes
}: OrderInfoProps) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-gray-600 text-sm font-medium">Order Number</p>
          <p className="text-lg font-semibold">{orderNumber}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">Status</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">Total Price</p>
          <p className="text-lg font-semibold">${totalPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-600 text-sm font-medium">Created</p>
          <p className="text-sm">{formatDate(createdAt)}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">Last Updated</p>
          <p className="text-sm">{formatDate(updatedAt)}</p>
        </div>
      </div>

      {notes && (
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">Notes</p>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{notes}</p>
        </div>
      )}
    </div>
  );
}
