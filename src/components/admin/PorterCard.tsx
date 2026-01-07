import { ExternalLink, Mail, Phone, MoreHorizontal, Check, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Porter, porterStatusLabels } from '@/data/mockPorters';

interface PorterCardProps {
  porter: Porter;
  onApprove: (porterId: string) => void;
  onReject: (porterId: string) => void;
}

const getStatusBadge = (status: Porter['status']) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">Chờ duyệt</Badge>;
    case 'approved':
      return <Badge className="bg-green-100 text-green-700 border-green-200">Đã duyệt</Badge>;
    case 'rejected':
      return <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">Từ chối</Badge>;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const PorterCard = ({ porter, onApprove, onReject }: PorterCardProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-card border border-border rounded-xl gap-4">
      {/* Porter Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3">
          {/* Avatar placeholder */}
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-semibold text-lg">
              {porter.name.charAt(0)}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{porter.name}</h3>
              {getStatusBadge(porter.status)}
            </div>
            
            <p className="text-sm text-muted-foreground mt-0.5">
              {porter.experience}
            </p>
            
            {/* Contact info */}
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{porter.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>{porter.phone}</span>
              </div>
            </div>

            {/* Profile link */}
            <div className="flex items-center gap-2 mt-2">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <a 
                href={porter.profileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Xem hồ sơ ({porter.profileType})
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Reject reason if rejected */}
            {porter.status === 'rejected' && porter.rejectReason && (
              <div className="mt-2 p-2 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>Lý do từ chối:</strong> {porter.rejectReason}
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              Đăng ký: {formatDate(porter.appliedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {porter.status === 'pending' && (
          <>
            <Button 
              size="sm" 
              onClick={() => onApprove(porter.id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-4 w-4 mr-1" />
              Duyệt
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onReject(porter.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Từ chối
            </Button>
          </>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem>Liên hệ Porter</DropdownMenuItem>
            <DropdownMenuSeparator />
            {porter.status === 'approved' && (
              <DropdownMenuItem className="text-destructive">
                Thu hồi duyệt
              </DropdownMenuItem>
            )}
            {porter.status === 'rejected' && (
              <DropdownMenuItem>Xem xét lại</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
