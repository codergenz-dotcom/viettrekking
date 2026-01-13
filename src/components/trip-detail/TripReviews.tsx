import { Star, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TripReview } from "./trip-types";

interface TripReviewsProps {
    reviews: TripReview[];
    isLoading?: boolean;
}

export const TripReviews = ({ reviews, isLoading }: TripReviewsProps) => {
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Đang tải đánh giá...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Đánh giá từ người tham gia
                    <Badge variant="secondary">{reviews.length}</Badge>
                </h3>
                {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= avgRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {avgRating.toFixed(1)}/5
                        </span>
                    </div>
                )}
            </div>

            {reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="p-4 border border-border rounded-lg bg-muted/30"
                        >
                            <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {review.userName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-foreground">{review.userName}</p>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="flex mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-4 w-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">{review.feedback}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">Chưa có đánh giá nào cho chuyến đi này.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Đánh giá sẽ xuất hiện sau khi chuyến đi hoàn thành.
                    </p>
                </div>
            )}
        </div>
    );
};
