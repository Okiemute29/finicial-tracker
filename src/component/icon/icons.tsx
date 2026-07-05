import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Goal,
  LayoutDashboard,
  Loader2,
  Menu,
  Moon,
  Pencil,
  PiggyBank,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Sun,
  Trash2,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  alertTriangle: AlertTriangle,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  bell: Bell,
  budget: PiggyBank,
  calendar: CalendarDays,
  check: Check,
  chevronDown: ChevronDown,
  close: X,
  dashboard: LayoutDashboard,
  download: Download,
  eye: Eye,
  eyeOff: EyeOff,
  goal: Goal,
  loader: Loader2,
  menu: Menu,
  money: CircleDollarSign,
  moon: Moon,
  netWorth: Wallet,
  edit: Pencil,
  plus: Plus,
  receipt: ReceiptText,
  search: Search,
  settings: Settings,
  sun: Sun,
  trash: Trash2,
  transaction: CreditCard,
  trend: TrendingUp,
  chart: BarChart3,
  user: User,
};

type IconProps = {
  name: keyof typeof icons | string;
  iconClass?: string;
};

export default function Icon({ name, iconClass = "h-4 w-4" }: IconProps) {
  const Component = icons[name] ?? CircleDollarSign;
  return <Component className={iconClass} aria-hidden="true" />;
}
