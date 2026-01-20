import React from 'react';

interface Customer {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  shippingAddress?: string;
}

interface CustomerInfoProps {
  customer: Customer;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer }) => {
  return (
    <div className="customer-info">
      <div className="info-section">
        <h2>Customer Information</h2>

        {customer.name && (
          <div className="info-field">
            <label>Name</label>
            <p>{customer.name}</p>
          </div>
        )}

        {customer.email && (
          <div className="info-field">
            <label>Email</label>
            <p>{customer.email}</p>
          </div>
        )}

        {customer.phone && (
          <div className="info-field">
            <label>Phone</label>
            <p>{customer.phone}</p>
          </div>
        )}

        {customer.shippingAddress && (
          <div className="info-field">
            <label>Shipping Address</label>
            <p>{customer.shippingAddress}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInfo;
