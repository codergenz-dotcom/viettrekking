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
import { adminService, type PorterApplicationStatus, type PorterApplicationListItem } from '@/services/api';
import { Loader2 } from 'lucide-react';



export const PorterApprovalList = () => {
  const { toast } = useToast();
  const [porters, setPorters] = useState<PorterApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PorterApplicationStatus | 'ALL'>('ALL');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPorter, setSelectedPorter] = useState<PorterApplicationListItem | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchPorters = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: 0,
        size: 100,
      };

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await adminService.getPorterApplications(params);
      setPorters(response.data.content);
    } catch (error) {
      console.error('Fetch porters error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách Porter.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPorters();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const pendingCount = porters.filter((p) => p.status === 'PENDING').length;

  const handleApprove = async (porterId: string) => {
    setIsProcessing(porterId);
    try {
      await adminService.approvePorter(porterId);

      toast({
        title: 'Đã duyệt Porter',
        description: `Hồ sơ đã được duyệt thành công.`,
      });

      fetchPorters();
    } catch (error) {
      console.error('Approve porter error:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectClick = (porterId: string) => {
    const porter = porters.find((p) => p.id === porterId);
    if (porter) {
      setSelectedPorter(porter);
      setRejectModalOpen(true);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedPorter) return;

    setIsProcessing(selectedPorter.id);
    try {
      await adminService.rejectPorter(selectedPorter.id, { reason });

      toast({
        title: 'Đã từ chối Porter',
        description: `Đã từ chối hồ sơ thành công.`,
        variant: 'destructive',
      });
      setSelectedPorter(null);
      fetchPorters();
    } catch (error) {
      console.error('Reject porter error:', error);
    } finally {
      setIsProcessing(null);
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
          onValueChange={(value) => setStatusFilter(value as PorterApplicationStatus | 'ALL')}
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">Chờ duyệt</SelectItem>
            <SelectItem value="APPROVED">Đã duyệt</SelectItem>
            <SelectItem value="REJECTED">Từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Porter List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-card border border-border rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Đang tải danh sách...</p>
          </div>
        ) : porters.length > 0 ? (
          porters.map((porter) => (
            <PorterCard
              key={porter.id}
              porter={porter}
              onApprove={handleApprove}
              onReject={handleRejectClick}
              isProcessing={isProcessing === porter.id}
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

