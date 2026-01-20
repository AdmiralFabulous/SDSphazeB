interface OrderItemData {
  id: string;
  name: string;
  quantity: number;
  price: number;
  config?: string | null;
}

interface ItemsListProps {
  items: OrderItemData[];
}

export function ItemsList({ items }: ItemsListProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const parseConfig = (configStr?: string | null) => {
    if (!configStr) return null;
    try {
      return JSON.parse(configStr);
    } catch {
      return configStr;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Order Items</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left py-3 px-2 font-semibold text-gray-700">Item</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Qty</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">Price</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.config && (
                      <details className="mt-1 cursor-pointer">
                        <summary className="text-xs text-gray-600 hover:text-gray-800">
                          View Config
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                          {typeof item.config === 'string'
                            ? JSON.stringify(parseConfig(item.config), null, 2)
                            : JSON.stringify(item.config, null, 2)
                          }
                        </pre>
                      </details>
                    )}
                  </div>
                </td>
                <td className="py-3 px-2 text-center">{item.quantity}</td>
                <td className="py-3 px-2 text-right">${item.price.toFixed(2)}</td>
                <td className="py-3 px-2 text-right font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="text-right">
          <p className="text-gray-600">Subtotal: <span className="font-semibold">${subtotal.toFixed(2)}</span></p>
        </div>
      </div>
    </div>
  );
}
