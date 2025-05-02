import React from 'react';
import { formatCurrency } from '../lib/notification';
import { Logo } from './Logo';

interface BillProps {
  order: {
    id: string;
    table_number: number;
    created_at: string;
    total_amount: number;
    order_items: Array<{
      item_name: string;
      quantity: number;
      price: number;
      image_url?: string;
    }>;
  };
}

const COMPANY_INFO = {
  name: "C Square CAFE",
  legal: "(A UNIT OF SQUARE FOODS PVT. LTD.)",
  tagline: "TASTE FEEL REPEAT",
  address: "123, MAIN STREET, CITY CENTER",
  city: "JAIPUR, RAJASTHAN",
  phone: "Phone: +91 8209349602",
  gstin: "GSTIN: 08AABCS1429B1Z1",
  tin: "TIN: 08262974040",
};

export const Bill: React.FC<BillProps> = ({ order }) => {
  const subtotal = order.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = 0;
  const cgst = (subtotal - discount) * 0.025;
  const sgst = (subtotal - discount) * 0.025;
  const serviceCharge = (subtotal - discount) * 0.10;
  const total = subtotal - discount + cgst + sgst + serviceCharge;

  const formattedDate = new Date(order.created_at).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Get the first item's image for the bill footer
  const firstItemImage = order.order_items[0]?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="p-8 bg-white" id="bill-print">
      <div className="text-center mb-6">
        <p className="text-sm">Guest Copy</p>
        <div className="flex justify-center mb-2">
          <Logo className="w-16 h-16" />
        </div>
        <h1 className="text-xl font-bold text-brown-900">{COMPANY_INFO.name}</h1>
        <p className="text-sm">{COMPANY_INFO.legal}</p>
        <p className="text-sm font-medium tracking-wide text-brown-900">{COMPANY_INFO.tagline}</p>
        <p className="text-sm">{COMPANY_INFO.address}</p>
        <p className="text-sm">{COMPANY_INFO.city}</p>
        <p className="text-sm">{COMPANY_INFO.phone}</p>
        <div className="text-sm mt-2">
          <p>{COMPANY_INFO.gstin}</p>
          <p>{COMPANY_INFO.tin}</p>
        </div>
      </div>

      <div className="border-t border-b border-dashed border-gray-300 py-2 mb-4">
        <div className="flex justify-between text-sm">
          <div>
            <p>Bill No: {order.id.slice(0, 8)}</p>
            <p>Date: {formattedDate}</p>
          </div>
          <div>
            <p>Table: {order.table_number}</p>
            <p>Server: STAFF</p>
          </div>
        </div>
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr className="text-left text-sm">
            <th>Item Name</th>
            <th className="text-center">Qty</th>
            <th className="text-right">Rate</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((item, index) => (
            <tr key={index} className="text-sm">
              <td>{item.item_name}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">{formatCurrency(item.price)}</td>
              <td className="text-right">{formatCurrency(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed border-gray-300 pt-2">
        <div className="flex justify-between text-sm">
          <span>Sub Total</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span>CGST @ 2.5%</span>
          <span>{formatCurrency(cgst)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>SGST @ 2.5%</span>
          <span>{formatCurrency(sgst)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Service Charge @ 10%</span>
          <span>{formatCurrency(serviceCharge)}</span>
        </div>
        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-dashed border-gray-300">
          <span>Total Amount</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="text-center mt-6">
        <div className="w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden">
          <img 
            src={firstItemImage} 
            alt="Order Item" 
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-sm">Thank you for visiting!</p>
        <p className="font-medium text-brown-900 text-sm">TASTE FEEL REPEAT</p>
      </div>
    </div>
  );
};