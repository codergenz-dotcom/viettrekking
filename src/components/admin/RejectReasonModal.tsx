import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RejectReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  porterName: string;
  onConfirm: (reason: string) => void;
}

export const RejectReasonModal = ({
  open,
  onOpenChange,
  porterName,
  onConfirm,
}: RejectReasonModalProps) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Từ chối Porter</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do từ chối hồ sơ của <strong>{porterName}</strong>. 
            Lý do này sẽ được gửi đến Porter.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do từ chối *</Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do từ chối..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Xác nhận từ chối
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
