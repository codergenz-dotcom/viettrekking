import { useState, useMemo, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PorterCard } from './PorterCard';
import { RejectReasonModal } from './RejectReasonModal';
import { useToast } from '@/hooks/use-toast';
import { mockPorters, type Porter, type PorterStatus } from '@/data/mockPorters';

const PORTER_APPLICATIONS_KEY = 'porterApplications';

const getPorterApplications = (): Porter[] => {
  const stored = localStorage.getItem(PORTER_APPLICATIONS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(PORTER_APPLICATIONS_KEY, JSON.stringify(mockPorters));
  return mockPorters;
};

const savePorterApplications = (porters: Porter[]) => {
  localStorage.setItem(PORTER_APPLICATIONS_KEY, JSON.stringify(porters));
};

export const PorterApprovalList = () => {
  const { toast } = useToast();
  const [porters, setPorters] = useState<Porter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PorterStatus | 'all'>('all');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPorter, setSelectedPorter] = useState<Porter | null>(null);

  useEffect(() => {
    setPorters(getPorterApplications());
  }, []);

  const filteredPorters = useMemo(() => {
    let result = [...porters];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (porter) =>
          porter.name.toLowerCase().includes(query) ||
          porter.email.toLowerCase().includes(query) ||
          porter.phone.includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((porter) => porter.status === statusFilter);
    }

    result.sort(
      (a, b) =>
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );

    return result;
  }, [porters, searchQuery, statusFilter]);

  const pendingCount = porters.filter((p) => p.status === 'pending').length;

  const handleApprove = (porterId: string) => {
    const updated = porters.map((p) =>
      p.id === porterId ? { ...p, status: 'approved' as PorterStatus } : p
    );
    setPorters(updated);
    savePorterApplications(updated);

    const approvedPorter = updated.find((p) => p.id === porterId);
    if (approvedPorter) {
      const approvedList = JSON.parse(localStorage.getItem('approvedPorters') || '[]');
      approvedList.push({
        odId: approvedPorter.id,
        odName: approvedPorter.name,
        email: approvedPorter.email,
        approvedAt: new Date().toISOString(),
      });
      localStorage.setItem('approvedPorters', JSON.stringify(approvedList));
    }

    toast({
      title: 'Đã duyệt Porter',
      description: `${approvedPorter?.name} đã được duyệt thành công.`,
    });
  };

  const handleRejectClick = (porterId: string) => {
    const porter = porters.find((p) => p.id === porterId);
    if (porter) {
      setSelectedPorter(porter);
      setRejectModalOpen(true);
    }
  };

  const handleRejectConfirm = (reason: string) => {
    if (selectedPorter) {
      const updated = porters.map((p) =>
        p.id === selectedPorter.id
          ? { ...p, status: 'rejected' as PorterStatus, rejectReason: reason }
          : p
      );
      setPorters(updated);
      savePorterApplications(updated);

      toast({
        title: 'Đã từ chối Porter',
        description: `Đã từ chối hồ sơ của ${selectedPorter.name}.`,
        variant: 'destructive',
      });
      setSelectedPorter(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Duyệt Porter</h1>
          <p className="text-muted-foreground">
            {pendingCount > 0
              ? `Có ${pendingCount} hồ sơ đang chờ duyệt`
              : 'Không có hồ sơ chờ duyệt'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as PorterStatus | 'all')}
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Chờ duyệt</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
            <SelectItem value="rejected">Từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Porter List */}
      <div className="space-y-3">
        {filteredPorters.length > 0 ? (
          filteredPorters.map((porter) => (
            <PorterCard
              key={porter.id}
              porter={porter}
              onApprove={handleApprove}
              onReject={handleRejectClick}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground">
              Không tìm thấy Porter nào phù hợp
            </p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <RejectReasonModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        porterName={selectedPorter?.name || ''}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
};
