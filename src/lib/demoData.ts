export interface DemoProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  totalBeds: number;
  occupiedBeds: number;
}

export interface DemoBed {
  id: string;
  bedNumber: string;
  status: "occupied" | "vacant";
  tenantName?: string;
  tenantId?: string;
}

export interface DemoRoom {
  id: string;
  roomNumber: string;
  floor: number;
  type: string; // e.g. "Double Sharing (AC)"
  rent: number;
  sharingType: number;
  beds: DemoBed[];
  amenities: string[];
  propertyId: string;
}

export interface DemoTenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomNumber: string;
  bedNumber: string;
  rentAmount: number;
  depositAmount: number;
  joinDate: string;
  paymentStatus: "Paid" | "Pending" | "Overdue";
  dueAmount: number;
  propertyId: string;
}

export interface DemoPayment {
  id: string;
  receiptNo: string;
  tenantName: string;
  roomNumber: string;
  amount: number;
  type: string; // "rent" | "deposit" | "maintenance"
  method: "UPI" | "Cash" | "Bank Transfer";
  date: string;
  status: "Successful" | "Pending";
  propertyId: string;
}

export interface DemoExpense {
  id: string;
  category: "Electricity" | "Water" | "Internet" | "Cleaning" | "Groceries" | "Maintenance";
  title: string;
  amount: number;
  date: string;
  vendor: string;
  paymentMethod: "UPI" | "Cash" | "Bank Transfer";
  propertyId: string;
}

export interface DemoComplaint {
  id: string;
  ticketId: string;
  tenantName: string;
  roomNumber: string;
  title: string;
  description: string;
  category: "Plumbing" | "WiFi" | "Electrical" | "Cleaning" | "Appliance";
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  date: string;
  propertyId: string;
}

export interface DemoNotice {
  id: string;
  title: string;
  content: string;
  date: string;
  category: "Important" | "Event" | "Maintenance" | "General";
  propertyId: string;
}

export interface DemoMealPlan {
  day: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
}

// ── Sample Datasets ────────────────────────────────────────────────────────────

export const DEMO_PROPERTIES: DemoProperty[] = [
  {
    id: "demo-prop-1",
    name: "Sunrise Luxury PG (HSR Layout)",
    address: "24th Main Rd, Sector 1, HSR Layout",
    city: "Bengaluru",
    totalBeds: 28,
    occupiedBeds: 25,
  },
  {
    id: "demo-prop-2",
    name: "Comfort Stay PG (Koramangala)",
    address: "5th Block, Near Jyoti Nivas College, Koramangala",
    city: "Bengaluru",
    totalBeds: 20,
    occupiedBeds: 17,
  },
];

export const DEMO_ROOMS: DemoRoom[] = [
  {
    id: "room-101",
    propertyId: "demo-prop-1",
    roomNumber: "101",
    floor: 1,
    type: "Double Sharing (AC)",
    rent: 12500,
    sharingType: 2,
    amenities: ["Attached Bathroom", "AC", "WiFi", "Smart TV", "Wardrobe"],
    beds: [
      { id: "b101-1", bedNumber: "Bed A", status: "occupied", tenantName: "Rahul Sharma", tenantId: "t-1" },
      { id: "b101-2", bedNumber: "Bed B", status: "occupied", tenantName: "Amit Verma", tenantId: "t-2" },
    ],
  },
  {
    id: "room-102",
    propertyId: "demo-prop-1",
    roomNumber: "102",
    floor: 1,
    type: "Single Room (AC)",
    rent: 18000,
    sharingType: 1,
    amenities: ["Attached Bathroom", "AC", "WiFi", "Balcony", "Study Desk"],
    beds: [
      { id: "b102-1", bedNumber: "Bed A", status: "occupied", tenantName: "Priya Sundaram", tenantId: "t-3" },
    ],
  },
  {
    id: "room-103",
    propertyId: "demo-prop-1",
    roomNumber: "103",
    floor: 1,
    type: "Triple Sharing (Non-AC)",
    rent: 9500,
    sharingType: 3,
    amenities: ["Shared Bathroom", "WiFi", "Wardrobe", "Ceiling Fan"],
    beds: [
      { id: "b103-1", bedNumber: "Bed A", status: "occupied", tenantName: "Vikram Reddy", tenantId: "t-4" },
      { id: "b103-2", bedNumber: "Bed B", status: "occupied", tenantName: "Karthik Raja", tenantId: "t-5" },
      { id: "b103-3", bedNumber: "Bed C", status: "vacant" },
    ],
  },
  {
    id: "room-201",
    propertyId: "demo-prop-1",
    roomNumber: "201",
    floor: 2,
    type: "Double Sharing (AC)",
    rent: 13000,
    sharingType: 2,
    amenities: ["Attached Bathroom", "AC", "WiFi", "Balcony"],
    beds: [
      { id: "b201-1", bedNumber: "Bed A", status: "occupied", tenantName: "Siddharth Rao", tenantId: "t-6" },
      { id: "b201-2", bedNumber: "Bed B", status: "occupied", tenantName: "Rohan Gupta", tenantId: "t-7" },
    ],
  },
  {
    id: "room-202",
    propertyId: "demo-prop-1",
    roomNumber: "202",
    floor: 2,
    type: "Double Sharing (Non-AC)",
    rent: 10500,
    sharingType: 2,
    amenities: ["Attached Bathroom", "WiFi", "Wardrobe"],
    beds: [
      { id: "b202-1", bedNumber: "Bed A", status: "occupied", tenantName: "Deepak Mehta", tenantId: "t-8" },
      { id: "b202-2", bedNumber: "Bed B", status: "vacant" },
    ],
  },
  {
    id: "room-301",
    propertyId: "demo-prop-1",
    roomNumber: "301",
    floor: 3,
    type: "Four Sharing (Non-AC)",
    rent: 8500,
    sharingType: 4,
    amenities: ["Shared Bathroom", "WiFi", "Individual Lockers"],
    beds: [
      { id: "b301-1", bedNumber: "Bed A", status: "occupied", tenantName: "Manish Kumar", tenantId: "t-9" },
      { id: "b301-2", bedNumber: "Bed B", status: "occupied", tenantName: "Suresh Nair", tenantId: "t-10" },
      { id: "b301-3", bedNumber: "Bed C", status: "occupied", tenantName: "Ankit Joshi", tenantId: "t-11" },
      { id: "b301-4", bedNumber: "Bed D", status: "vacant" },
    ],
  },
  // Property 2 Rooms
  {
    id: "room-c101",
    propertyId: "demo-prop-2",
    roomNumber: "C-101",
    floor: 1,
    type: "Double Sharing (AC)",
    rent: 14000,
    sharingType: 2,
    amenities: ["Attached Bathroom", "AC", "High Speed WiFi", "Fridge"],
    beds: [
      { id: "bc101-1", bedNumber: "Bed A", status: "occupied", tenantName: "Neha Kapoor", tenantId: "t-12" },
      { id: "bc101-2", bedNumber: "Bed B", status: "occupied", tenantName: "Ananya Iyer", tenantId: "t-13" },
    ],
  },
  {
    id: "room-c102",
    propertyId: "demo-prop-2",
    roomNumber: "C-102",
    floor: 1,
    type: "Single Room (AC)",
    rent: 19500,
    sharingType: 1,
    amenities: ["Attached Bathroom", "AC", "Balcony", "Smart Desk"],
    beds: [
      { id: "bc102-1", bedNumber: "Bed A", status: "occupied", tenantName: "Varun Malhotra", tenantId: "t-14" },
    ],
  },
];

export const DEMO_TENANTS: DemoTenant[] = [
  {
    id: "t-1",
    propertyId: "demo-prop-1",
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul.sharma@example.com",
    roomNumber: "101",
    bedNumber: "Bed A",
    rentAmount: 12500,
    depositAmount: 25000,
    joinDate: "2025-11-01",
    paymentStatus: "Paid",
    dueAmount: 0,
  },
  {
    id: "t-2",
    propertyId: "demo-prop-1",
    name: "Amit Verma",
    phone: "+91 98123 45678",
    email: "amit.verma@example.com",
    roomNumber: "101",
    bedNumber: "Bed B",
    rentAmount: 12500,
    depositAmount: 25000,
    joinDate: "2025-12-15",
    paymentStatus: "Pending",
    dueAmount: 12500,
  },
  {
    id: "t-3",
    propertyId: "demo-prop-1",
    name: "Priya Sundaram",
    phone: "+91 97456 12389",
    email: "priya.sundaram@example.com",
    roomNumber: "102",
    bedNumber: "Bed A",
    rentAmount: 18000,
    depositAmount: 36000,
    joinDate: "2025-08-01",
    paymentStatus: "Paid",
    dueAmount: 0,
  },
  {
    id: "t-4",
    propertyId: "demo-prop-1",
    name: "Vikram Reddy",
    phone: "+91 96321 87450",
    email: "vikram.reddy@example.com",
    roomNumber: "103",
    bedNumber: "Bed A",
    rentAmount: 9500,
    depositAmount: 19000,
    joinDate: "2026-01-10",
    paymentStatus: "Overdue",
    dueAmount: 9500,
  },
  {
    id: "t-5",
    propertyId: "demo-prop-1",
    name: "Karthik Raja",
    phone: "+91 95123 78940",
    email: "karthik.raja@example.com",
    roomNumber: "103",
    bedNumber: "Bed B",
    rentAmount: 9500,
    depositAmount: 19000,
    joinDate: "2026-02-01",
    paymentStatus: "Paid",
    dueAmount: 0,
  },
  {
    id: "t-6",
    propertyId: "demo-prop-1",
    name: "Siddharth Rao",
    phone: "+91 94789 65230",
    email: "siddharth.rao@example.com",
    roomNumber: "201",
    bedNumber: "Bed A",
    rentAmount: 13000,
    depositAmount: 26000,
    joinDate: "2025-10-05",
    paymentStatus: "Paid",
    dueAmount: 0,
  },
  {
    id: "t-7",
    propertyId: "demo-prop-1",
    name: "Rohan Gupta",
    phone: "+91 93654 12789",
    email: "rohan.gupta@example.com",
    roomNumber: "201",
    bedNumber: "Bed B",
    rentAmount: 13000,
    depositAmount: 26000,
    joinDate: "2025-11-20",
    paymentStatus: "Paid",
    dueAmount: 0,
  },
  {
    id: "t-8",
    propertyId: "demo-prop-1",
    name: "Deepak Mehta",
    phone: "+91 92147 85369",
    email: "deepak.mehta@example.com",
    roomNumber: "202",
    bedNumber: "Bed A",
    rentAmount: 10500,
    depositAmount: 21000,
    joinDate: "2025-09-01",
    paymentStatus: "Pending",
    dueAmount: 6000,
  },
  {
    id: "t-12",
    propertyId: "demo-prop-2",
    name: "Neha Kapoor",
    phone: "+91 91234 56789",
    email: "neha.kapoor@example.com",
    roomNumber: "C-101",
    bedNumber: "Bed A",
    rentAmount: 14000,
    depositAmount: 28000,
    joinDate: "2025-07-01",
    paymentStatus: "Paid",
    dueAmount: 0,
  },
  {
    id: "t-13",
    propertyId: "demo-prop-2",
    name: "Ananya Iyer",
    phone: "+91 90123 45678",
    email: "ananya.iyer@example.com",
    roomNumber: "C-101",
    bedNumber: "Bed B",
    rentAmount: 14000,
    depositAmount: 28000,
    joinDate: "2025-09-15",
    paymentStatus: "Paid",
    dueAmount: 0,
  },
];

export const DEMO_PAYMENTS: DemoPayment[] = [
  {
    id: "pay-101",
    propertyId: "demo-prop-1",
    receiptNo: "REC-2026-001",
    tenantName: "Rahul Sharma",
    roomNumber: "101",
    amount: 12500,
    type: "rent",
    method: "UPI",
    date: "2026-07-02",
    status: "Successful",
  },
  {
    id: "pay-102",
    propertyId: "demo-prop-1",
    receiptNo: "REC-2026-002",
    tenantName: "Priya Sundaram",
    roomNumber: "102",
    amount: 18000,
    type: "rent",
    method: "Bank Transfer",
    date: "2026-07-03",
    status: "Successful",
  },
  {
    id: "pay-103",
    propertyId: "demo-prop-1",
    receiptNo: "REC-2026-003",
    tenantName: "Siddharth Rao",
    roomNumber: "201",
    amount: 13000,
    type: "rent",
    method: "UPI",
    date: "2026-07-05",
    status: "Successful",
  },
  {
    id: "pay-104",
    propertyId: "demo-prop-1",
    receiptNo: "REC-2026-004",
    tenantName: "Rohan Gupta",
    roomNumber: "201",
    amount: 13000,
    type: "rent",
    method: "Cash",
    date: "2026-07-06",
    status: "Successful",
  },
  {
    id: "pay-105",
    propertyId: "demo-prop-1",
    receiptNo: "REC-2026-005",
    tenantName: "Karthik Raja",
    roomNumber: "103",
    amount: 9500,
    type: "rent",
    method: "UPI",
    date: "2026-07-07",
    status: "Successful",
  },
  {
    id: "pay-106",
    propertyId: "demo-prop-2",
    receiptNo: "REC-2026-006",
    tenantName: "Neha Kapoor",
    roomNumber: "C-101",
    amount: 14000,
    type: "rent",
    method: "UPI",
    date: "2026-07-01",
    status: "Successful",
  },
  {
    id: "pay-107",
    propertyId: "demo-prop-2",
    receiptNo: "REC-2026-007",
    tenantName: "Ananya Iyer",
    roomNumber: "C-101",
    amount: 14000,
    type: "rent",
    method: "Bank Transfer",
    date: "2026-07-04",
    status: "Successful",
  },
];

export const DEMO_EXPENSES: DemoExpense[] = [
  {
    id: "exp-1",
    propertyId: "demo-prop-1",
    title: "BESCOM Electricity Bill (July)",
    category: "Electricity",
    amount: 18450,
    date: "2026-07-10",
    vendor: "BESCOM Bengaluru",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "exp-2",
    propertyId: "demo-prop-1",
    title: "ACT Fibernet Broadband 500Mbps",
    category: "Internet",
    amount: 3540,
    date: "2026-07-05",
    vendor: "ACT Fibernet",
    paymentMethod: "UPI",
  },
  {
    id: "exp-3",
    propertyId: "demo-prop-1",
    title: "Water Tanker Supply (4 loads)",
    category: "Water",
    amount: 5200,
    date: "2026-07-12",
    vendor: "Cauvery Water Tankers",
    paymentMethod: "Cash",
  },
  {
    id: "exp-4",
    propertyId: "demo-prop-1",
    title: "Daily Kitchen Vegetables & Provisions",
    category: "Groceries",
    amount: 14200,
    date: "2026-07-15",
    vendor: "Reliance Fresh / Local Vendor",
    paymentMethod: "UPI",
  },
  {
    id: "exp-5",
    propertyId: "demo-prop-1",
    title: "Deep Cleaning & Pest Control",
    category: "Cleaning",
    amount: 3800,
    date: "2026-07-18",
    vendor: "Urban Company",
    paymentMethod: "UPI",
  },
];

export const DEMO_COMPLAINTS: DemoComplaint[] = [
  {
    id: "cmp-101",
    ticketId: "TKT-801",
    propertyId: "demo-prop-1",
    tenantName: "Rahul Sharma",
    roomNumber: "101",
    title: "WiFi internet lagging during evening hours",
    description: "Signal strength is weak in bed B area, speed drops below 5 Mbps between 8 PM to 11 PM.",
    category: "WiFi",
    priority: "Medium",
    status: "In Progress",
    date: "2026-07-22",
  },
  {
    id: "cmp-102",
    ticketId: "TKT-802",
    propertyId: "demo-prop-1",
    tenantName: "Vikram Reddy",
    roomNumber: "103",
    title: "Bathroom tap leaking continuously",
    description: "The washbasin cold water tap leaks drop by drop continuously causing noise at night.",
    category: "Plumbing",
    priority: "High",
    status: "Open",
    date: "2026-07-24",
  },
  {
    id: "cmp-103",
    ticketId: "TKT-803",
    propertyId: "demo-prop-1",
    tenantName: "Priya Sundaram",
    roomNumber: "102",
    title: "AC remote battery replacement & filter cleaning",
    description: "AC cooling reduced slightly, filter requires vacuum cleaning.",
    category: "Appliance",
    priority: "Low",
    status: "Resolved",
    date: "2026-07-19",
  },
  {
    id: "cmp-104",
    ticketId: "TKT-804",
    propertyId: "demo-prop-2",
    tenantName: "Neha Kapoor",
    roomNumber: "C-101",
    title: "Balcony light bulb fused",
    description: "Balcony LED tube light needs replacement.",
    category: "Electrical",
    priority: "Low",
    status: "Resolved",
    date: "2026-07-20",
  },
];

export const DEMO_FOOD_MENU: DemoMealPlan[] = [
  {
    day: "Monday",
    breakfast: "Idli, Vada, Sambar & Coconut Chutney",
    lunch: "Rice, Dal Tadka, Chapati, Paneer Butter Masala, Curd",
    snacks: "Tea / Coffee & Veg Cutlet",
    dinner: "Veg Biryani, Raita, Chapati & Mixed Veg Curry",
  },
  {
    day: "Tuesday",
    breakfast: "Aloo Paratha with Curd & Pickle",
    lunch: "Rice, Sambar, Chapati, Bhindi Fry, Rasam",
    snacks: "Tea / Coffee & Onion Pakoda",
    dinner: "Roti, Egg Curry / Paneer Korma, Rice, Dal",
  },
  {
    day: "Wednesday",
    breakfast: "Masala Dosa & Mint Chutney",
    lunch: "Rice, Rajma Masala, Chapati, Potato Fry, Salad",
    snacks: "Tea / Coffee & Samosa",
    dinner: "Special Chicken Curry / Kadai Paneer, Jeera Rice, Butter Naan",
  },
  {
    day: "Thursday",
    breakfast: "Puri Sagu / Chole Bhature",
    lunch: "Rice, Dal Makhani, Chapati, Mix Veg Sabzi, Butter Milk",
    snacks: "Tea / Coffee & Bhel Puri",
    dinner: "Roti, Chana Masala, Rice, Rasam & Sweet Gulab Jamun",
  },
  {
    day: "Friday",
    breakfast: "Poha with Roasted Peanuts & Tea",
    lunch: "Rice, Drumstick Sambar, Chapati, Capsicum Masala, Curd",
    snacks: "Tea / Coffee & Corn Cheese Balls",
    dinner: "Fried Rice, Veg Manchurian, Chapati & Dal",
  },
  {
    day: "Saturday",
    breakfast: "Upma & Kesari Bath (Chow Chow Bath)",
    lunch: "Rice, Chole Masala, Chapati, Cabbage Poriyal, Papad",
    snacks: "Tea / Coffee & Biscuit Platter",
    dinner: "Roti, Mushroom Masala, Rice, Dal & Kheer",
  },
  {
    day: "Sunday",
    breakfast: "Uttapam / Set Dosa with Chutney",
    lunch: "Special Hyderabadi Chicken Biryani / Paneer Biryani, Raita, Salan",
    snacks: "Tea / Coffee & French Fries",
    dinner: "Light Khichdi, Kadhi, Chapati & Fruit Salad",
  },
];

export const DEMO_NOTICES: DemoNotice[] = [
  {
    id: "not-1",
    propertyId: "demo-prop-1",
    title: "Monthly Rent Payment Reminder — July 2026",
    content: "Kindly clear your July monthly rent before the 5th to avoid late fee charges. Payment receipts are automatically generated in PGmate.",
    date: "2026-07-01",
    category: "Important",
  },
  {
    id: "not-2",
    propertyId: "demo-prop-1",
    title: "Overhead Water Tank Cleaning Schedule",
    content: "Water supply will be temporarily turned off on Sunday between 10:00 AM and 1:00 PM for scheduled tank sanitization.",
    date: "2026-07-14",
    category: "Maintenance",
  },
  {
    id: "not-3",
    propertyId: "demo-prop-1",
    title: "High-Speed Fiber Internet Upgrade Complete",
    content: "We have upgraded all routers on Floor 1, 2, and 3 to 500 Mbps mesh Wi-Fi. Check room notice board for new Wi-Fi passcode.",
    date: "2026-07-18",
    category: "General",
  },
  {
    id: "not-4",
    propertyId: "demo-prop-2",
    title: "Weekend Barbecue & Game Night",
    content: "Join us this Saturday evening on the terrace for music, barbecue, and board games! Everyone is invited.",
    date: "2026-07-20",
    category: "Event",
  },
];
