import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripName: string;
  tripId: string;
  onSubmit: (tripId: string, rating: number, feedback: string) => void | Promise<void>;
}

export const ReviewDialog = ({
  open,
  onOpenChange,
  tripName,
  tripId,
  onSubmit,
}: ReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (feedback.trim().length < 10) {
      toast.error('Vui lòng nhập ít nhất 10 ký tự cho phản hồi');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(tripId, rating, feedback.trim());
      setRating(0);
      setFeedback('');
      onOpenChange(false);
    } catch (error) {
      console.error("Review submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setFeedback('');
    onOpenChange(false);
  };

  const ratingLabels = [
    '',
    'Rất tệ',
    'Tệ',
    'Bình thường',
    'Tốt',
    'Tuyệt vời',
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Đánh giá chuyến đi
          </DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm của bạn về chuyến đi "{tripName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Bạn đánh giá chuyến đi như thế nào?
            </label>
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  >
                    <Star
                      className={cn(
                        'h-8 w-8 transition-colors',
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-muted-foreground min-h-[20px]">
                {ratingLabels[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Phản hồi của bạn
            </label>
            <Textarea
              placeholder="Chia sẻ những điều bạn thích về chuyến đi, điều gì có thể cải thiện..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tối thiểu 10 ký tự</span>
              <span>{feedback.length}/500</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
