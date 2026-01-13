import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Star,
  Search,
  Eye,
  Trash2,
  MessageSquare,
  TrendingUp,
  Users,
  Mountain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminService, type TripReviewResponse } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { SecureAvatar } from '@/components/ui/SecureAvatar';


const AdminReviews = () => {
  const [reviews, setReviews] = useState<TripReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<TripReviewResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getReviews({ size: 100 });
      setReviews(response.data.content);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const query = searchQuery.toLowerCase();
    return (
      review.userFullName.toLowerCase().includes(query) ||
      review.comment.toLowerCase().includes(query)
    );
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  const handleToggleVisibility = async (review: TripReviewResponse) => {
    try {
      await adminService.hideReview(review.id);
      setReviews(prev =>
        prev.map(r =>
          r.id === review.id ? { ...r, isVisible: !r.isVisible } : r
        )
      );
      toast.success(
        review.isVisible
          ? `Đã ẩn đánh giá của ${review.userFullName}`
          : `Đã hiện đánh giá của ${review.userFullName}`
      );
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái hiển thị');
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;
    try {
      await adminService.deleteReview(selectedReview.id);
      setReviews(prev => prev.filter(r => r.id !== selectedReview.id));
      toast.success('Đã xóa đánh giá');
      setIsDeleteOpen(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Có lỗi xảy ra khi xóa đánh giá');
    }
  };

  const openDetailModal = (review: TripReviewResponse) => {
    setSelectedReview(review);
    setIsDetailOpen(true);
  };

  const openDeleteModal = (review: TripReviewResponse) => {
    setSelectedReview(review);
    setIsDeleteOpen(true);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClass,
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý đánh giá</h1>
          <p className="text-muted-foreground">
            Xem và quản lý đánh giá từ người dùng
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{averageRating}</p>
                  <p className="text-sm text-muted-foreground">Điểm trung bình</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reviews.length}</p>
                  <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {reviews.filter(r => r.rating >= 4).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Đánh giá tốt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(reviews.map(r => r.userId)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Người đánh giá</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phân bố đánh giá</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium">{star}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Danh sách đánh giá</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Đang tải danh sách đánh giá...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không có đánh giá nào</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người đánh giá</TableHead>
                    <TableHead>Chuyến đi</TableHead>
                    <TableHead>Đánh giá</TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <SecureAvatar
                            src={review.userAvatar}
                            className="h-8 w-8"
                            fallback={
                              <span className="bg-primary/10 text-primary text-xs">
                                {review.userFullName.charAt(0)}
                              </span>
                            }
                          />
                          <span className="font-medium">{review.userFullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mountain className="h-4 w-4" />
                          <span className="max-w-[150px] truncate">{review.tripId}</span>
                        </div>
                      </TableCell>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell>
                        <p className="max-w-[200px] truncate text-muted-foreground">
                          {review.comment}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: vi })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            review.isVisible
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {review.isVisible ? 'Hiển thị' : 'Đã ẩn'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailModal(review)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleVisibility(review)}
                          >
                            {review.isVisible ? (
                              <span className="text-xs">Ẩn</span>
                            ) : (
                              <span className="text-xs">Hiện</span>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDeleteModal(review)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle>Chi tiết đánh giá</DialogTitle>
                <DialogDescription>
                  Đánh giá từ {selectedReview.userFullName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <SecureAvatar
                    src={selectedReview.userAvatar}
                    className="h-12 w-12"
                    fallback={
                      <span className="bg-primary/10 text-primary">
                        {selectedReview.userFullName.charAt(0)}
                      </span>
                    }
                  />
                  <div>
                    <p className="font-medium">{selectedReview.userFullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedReview.createdAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-primary" />
                    <span className="font-medium">Chuyến đi ID: {selectedReview.tripId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating, 'md')}
                    <span className="text-sm text-muted-foreground">
                      ({selectedReview.rating}/5 sao)
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Nội dung đánh giá:</p>
                  <p className="text-muted-foreground">{selectedReview.comment}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm">Trạng thái:</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      selectedReview.isVisible
                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {selectedReview.isVisible ? 'Đang hiển thị' : 'Đã ẩn'}
                  </Badge>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Đóng
                </Button>
                <Button
                  variant={selectedReview.isVisible ? "secondary" : "default"}
                  onClick={() => {
                    handleToggleVisibility(selectedReview);
                    setSelectedReview({ ...selectedReview, isVisible: !selectedReview.isVisible });
                  }}
                >
                  {selectedReview.isVisible ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa đánh giá của "{selectedReview?.userFullName}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReviews;
