// Types untuk aplikasi SCM Master Admin

export interface KPICard {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  status: 'normal' | 'warning' | 'critical';
  icon: string;
}

export interface ChartDatapoint {
  date: string;
  efficiency: number;
  consumption: number;
}

export interface SystemAlert {
  id: string;
  date: string;
  module: string;
  message: string;
  status: 'resolved' | 'pending' | 'critical';
  severity: 'low' | 'medium' | 'high';
}

export interface MenuItemType {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface AdminUser {
  name: string;
  role: string;
  avatar?: string;
}
