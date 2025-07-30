export type Role = 'user' | 'admin' | 'doctor';

export type PaymentMethod = 'stripe' | 'mpesa' | 'paypal' | 'cash';

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Failed';

export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export type ConsultationStatus = 'Pending' | 'Completed';

export type ConsultationType = 'initial' | 'follow-up' | 'review';
