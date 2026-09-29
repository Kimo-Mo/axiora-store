import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface UserFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  isActiveFilter: string;
  onIsActiveChange: (value: string) => void;
  providerFilter: string;
  onProviderChange: (value: string) => void;
  isVerifiedFilter: string;
  onIsVerifiedChange: (value: string) => void;
}

/**
 * Shadcn Select shows blank when value is "". We normalize "" → "all"
 * so the placeholder always shows correctly.
 */
function selectValue(val: string) {
  return val === '' ? 'all' : val;
}

export function UserFilters({
  searchValue,
  onSearchChange,
  roleFilter,
  onRoleChange,
  isActiveFilter,
  onIsActiveChange,
  providerFilter,
  onProviderChange,
  isVerifiedFilter,
  onIsVerifiedChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      {/* Search */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search users..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Role filter */}
      <Select value={selectValue(roleFilter)} onValueChange={onRoleChange}>
        <SelectTrigger className="w-full sm:w-36 h-9">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="seller">Seller</SelectItem>
          <SelectItem value="developer">Developer</SelectItem>
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select value={selectValue(isActiveFilter)} onValueChange={onIsActiveChange}>
        <SelectTrigger className="w-full sm:w-36 h-9">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Provider filter */}
      <Select value={selectValue(providerFilter)} onValueChange={onProviderChange}>
        <SelectTrigger className="w-full sm:w-36 h-9">
          <SelectValue placeholder="All Providers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Providers</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="google">Google</SelectItem>
          <SelectItem value="facebook">Facebook</SelectItem>
        </SelectContent>
      </Select>

      {/* Verified filter */}
      <Select value={selectValue(isVerifiedFilter)} onValueChange={onIsVerifiedChange}>
        <SelectTrigger className="w-full sm:w-36 h-9">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="true">Verified</SelectItem>
          <SelectItem value="false">Unverified</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
