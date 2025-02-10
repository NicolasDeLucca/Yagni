type UserRole = 
  'admin' | 
  'kitchen_supervisor' | 
  'premise_supervisor' | 
  'kitchen_device' | 
  'refrigerator_device' | 
  'employee' | 
  'client';

interface User {
  name: string;
  role: UserRole;
}

interface ClientUser extends User {
  email: string;
  cellphone: string;
  paymentMethods: string[];
}

export { User, ClientUser, UserRole}