import React from 'react';
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  ChefHat,
  CheckCircle2,
  Boxes,
  TriangleAlert,
  Wrench,
  Users,
  Truck,
  Car,
  Bus,
  HandHeart,
  DollarSign,
  Ticket,
  Home,
  CircleCheck,
  CircleX,
  Clock3,
  ShieldCheck,
  Star,
  Info,
  Receipt,
  X,
  Menu,
  Heart,
  Briefcase,
  Cake,
  Sparkles,
  PartyPopper,
  Calendar,
  User,
  Zap,
  ChevronLeft,
  ChevronRight,
  Smile,
  UtensilsCrossed,
  LayoutGrid,
  Settings,
  Moon,
  Sun,
  Bell, // Import Bell icon
  LogOut, // Import LogOut icon
} from 'lucide-react';

/**
 * Central icon registry for the app.
 * Use string keys in page data structures, and render via renderAppIcon.
 */
export const ICON_MAP = {
  dashboard: LayoutDashboard,

  halls: Building2,
  bookings: ClipboardList,
  menu: ChefHat,
  quality: CheckCircle2,

  inventory: Boxes,
  damage: TriangleAlert,
  maintenance: Wrench,
  vendors: HandHeart,

  fleet: Truck,
  drivers: Users,

  // Dashboard stat/utility icons
  newHall: Building2,
  newBooking: ClipboardList,
  newRental: Ticket,
  vehicles: Truck,

  totalBookings: Receipt,
  pending: Clock3,
  confirmed: CircleCheck,
  revenue: DollarSign,
  alerts: TriangleAlert,
  monthlyBookings: ClipboardList,
  monthlyRentals: Ticket,
  monthlyCatering: ChefHat,
  monthlyVehicles: Truck,

  userManagement: Users,
  hallManagement: Building2,
  maintenanceManagement: Wrench,

  // Catering category icons
  appetizer: HandHeart,
  main: ChefHat,
  dessert: Star,
  beverage: Info,

  // Vehicle types
  car: Car,
  van: Truck,
  bus: Bus,
  truck: Truck,

  // Generic
  check: CircleCheck,
  warning: TriangleAlert,
  close: X,
  burger: Menu,
  themeSun: Sun,
  themeMoon: Moon,
  bell: Bell, // Map 'bell' to the imported Bell icon
  logOut: LogOut, // Map 'logOut' to the imported LogOut icon
  party: Star,
  heart: Heart,
  briefcase: Briefcase,
  cake: Cake,
  sparkles: Sparkles,
  partyPopper: PartyPopper,
  calendar: Calendar,
  user: User,
  zap: Zap,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  smile: Smile,
  utensilsCrossed: UtensilsCrossed,
  layoutGrid: LayoutGrid,
  uptime: Zap,
};

export function renderAppIcon(name, props = {}) {
  const Comp = ICON_MAP[name];
  if (!Comp) return null;
  return <Comp {...props} />;
}
