import { CustomerTable } from '../customer-table';

export default function CustomerTableExample() {
  return (
    <CustomerTable 
      onViewCustomer={(id) => console.log('View customer:', id)}
    />
  );
}