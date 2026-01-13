import { Play, Flag, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Trip } from "@/data/mockTrips";
import { Registration, TripStatusData } from "./trip-types";
import { formatDate } from "./trip-utils";

interface TripActionsProps {
    trip: Trip;
    tripId: string;
    isOrganizer: boolean;
    currentUserRegistration?: Registration;
    isRegistrationClosed: boolean;
    tripStatus: TripStatusData | null;
    onJoin: () => void;
    onEdit: () => void;
    onCancel: () => void;
    onStart: () => void;
    onComplete: () => void;
}

export const TripActions = ({
    trip,
    tripId,
    isOrganizer,
    currentUserRegistration,
    isRegistrationClosed,
    tripStatus,
    onJoin,
    onEdit,
    onCancel,
    onStart,
    onComplete,
}: TripActionsProps) => {
    const isTripInProgress = tripStatus?.status === 'in_progress';
    const isTripCompleted = tripStatus?.status === 'completed';

    return (
        <div className="space-y-2">
            {isOrganizer ? (
                <>
                    {isTripCompleted ? (
                        <div className="w-full h-12 flex items-center justify-center rounded-md border bg-green-50 border-green-200">
                            <Badge className="bg-green-100 text-green-800 border-0 text-sm">
                                <Flag className="h-4 w-4 mr-1" />
                                Đã hoàn thành
                            </Badge>
                        </div>
                    ) : isTripInProgress ? (
                        <Button
                            onClick={onComplete}
                            className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700"
                        >
                            <Flag className="h-5 w-5 mr-2" />
                            Đánh dấu hoàn thành
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={onStart}
                                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                            >
                                <Play className="h-5 w-5 mr-2" />
                                Bắt đầu chuyến đi
                            </Button>
                            <Button
                                onClick={onEdit}
                                variant="outline"
                                className="w-full h-12 text-base font-semibold"
                            >
                                Chỉnh sửa chuyến đi
                            </Button>
                            <Button
                                onClick={onCancel}
                                variant="destructive"
                                className="w-full h-12 text-base font-semibold"
                            >
                                Hủy chuyến đi
                            </Button>
                        </>
                    )}
                </>
            ) : currentUserRegistration ? (
                <>
                    {currentUserRegistration.status === "PENDING" && (
                        <Button disabled className="w-full h-12 text-base font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 opacity-100">
                            Đang chờ duyệt
                        </Button>
                    )}
                    {currentUserRegistration.status === "APPROVED" && (
                        <Button disabled className="w-full h-12 text-base font-semibold bg-green-100 text-green-800 hover:bg-green-100 border-green-200 opacity-100">
                            Đã tham gia
                        </Button>
                    )}
                    {currentUserRegistration.status === "REJECTED" && (
                        <Button disabled variant="destructive" className="w-full h-12 text-base font-semibold opacity-100">
                            Đã bị từ chối
                        </Button>
                    )}
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        {currentUserRegistration.status === "PENDING"
                            ? "Đăng ký của bạn đang chờ người tổ chức phê duyệt"
                            : currentUserRegistration.status === "APPROVED"
                                ? "Bạn đã là thành viên của chuyến đi này"
                                : "Đăng ký của bạn đã bị từ chối"}
                    </p>
                </>
            ) : isRegistrationClosed ? (
                <>
                    <Button
                        disabled
                        className="w-full h-12 text-base font-semibold"
                    >
                        Đã hết hạn đăng ký
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        Thời hạn đăng ký đã kết thúc vào {formatDate(trip.registrationDeadline)}
                    </p>
                </>
            ) : (
                <Button
                    onClick={onJoin}
                    className="w-full h-12 text-base font-semibold"
                >
                    Tham gia
                </Button>
            )}

            {/* Discussion Button */}
            <Button
                variant="outline"
                onClick={() => window.open(`/chat?tripId=${tripId}`, '_blank')}
                className="w-full h-12 text-base font-medium gap-2"
            >
                <MessageCircle className="h-5 w-5" />
                Thảo luận
            </Button>
        </div>
    );
};
