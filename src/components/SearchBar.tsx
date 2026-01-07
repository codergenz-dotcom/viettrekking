import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Tìm theo tên núi, địa điểm, leader…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 h-12 text-base bg-card border-border/60 shadow-sm focus-visible:ring-primary/30 focus-visible:border-primary/50 rounded-xl"
      />
    </div>
  );
};
