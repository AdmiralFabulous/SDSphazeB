interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

interface CustomerSidebarProps {
  customer: CustomerData;
}

export function CustomerSidebar({ customer }: CustomerSidebarProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Customer Info</h2>

      <div className="space-y-4">
        <div>
          <p className="text-gray-600 text-sm font-medium">Name</p>
          <p className="text-lg font-semibold">{customer.name}</p>
        </div>

        <div>
          <p className="text-gray-600 text-sm font-medium">Email</p>
          <a
            href={`mailto:${customer.email}`}
            className="text-blue-600 hover:text-blue-800 break-all"
          >
            {customer.email}
          </a>
        </div>

        {customer.phone && (
          <div>
            <p className="text-gray-600 text-sm font-medium">Phone</p>
            <a
              href={`tel:${customer.phone}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {customer.phone}
            </a>
          </div>
        )}

        {(customer.address || customer.city || customer.state || customer.zipCode) && (
          <div className="pt-4 border-t">
            <p className="text-gray-600 text-sm font-medium mb-2">Address</p>
            <div className="text-sm text-gray-700">
              {customer.address && <p>{customer.address}</p>}
              <p>
                {[customer.city, customer.state, customer.zipCode]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
