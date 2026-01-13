import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TripDialogsProps {
    showSuccessModal: boolean;
    showCancelDialog: boolean;
    showStartDialog: boolean;
    showCompleteDialog: boolean;
    onSuccessClose: () => void;
    onCancelClose: () => void;
    onCancelConfirm: () => void;
    onStartClose: () => void;
    onStartConfirm: () => void;
    onCompleteClose: () => void;
    onCompleteConfirm: () => void;
}

export const TripDialogs = ({
    showSuccessModal,
    showCancelDialog,
    showStartDialog,
    showCompleteDialog,
    onSuccessClose,
    onCancelClose,
    onCancelConfirm,
    onStartClose,
    onStartConfirm,
    onCompleteClose,
    onCompleteConfirm,
}: TripDialogsProps) => {
    return (
        <>
            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={onSuccessClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">Thông báo thành công</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center py-8">
                        <CheckCircle className="h-16 w-16 text-primary mb-4" />
                        <p className="text-lg font-medium text-foreground text-center">
                            Đăng ký tham gia thành công
                        </p>
                        <p className="text-muted-foreground text-center mt-2">
                            Chúng tôi sẽ liên hệ với bạn sớm nhất.
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <Button onClick={onSuccessClose}>
                            Đóng
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={onCancelClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận hủy chuyến đi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn hủy chuyến đi này không? Hành động này không thể hoàn tác và tất cả thành viên đã đăng ký sẽ được thông báo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Quay lại</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onCancelConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Xác nhận hủy
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Start Trip Confirmation Dialog */}
            <AlertDialog open={showStartDialog} onOpenChange={onStartClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận bắt đầu chuyến đi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn bắt đầu chuyến đi này không? Sau khi bắt đầu, bạn sẽ không thể chỉnh sửa hoặc hủy chuyến đi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Quay lại</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onStartConfirm}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Xác nhận bắt đầu
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Complete Trip Confirmation Dialog */}
            <AlertDialog open={showCompleteDialog} onOpenChange={onCompleteClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận hoàn thành chuyến đi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn đánh dấu chuyến đi này là đã hoàn thành không? Chuyến đi sẽ được chuyển vào danh sách hoàn thành và người tham gia có thể đánh giá.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Quay lại</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onCompleteConfirm}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Xác nhận hoàn thành
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
