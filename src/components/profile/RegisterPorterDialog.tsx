import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { userTripService, type SubmitPorterApplicationRequest } from "@/services/api";
import { Loader2 } from "lucide-react";

interface RegisterPorterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    currentPhone?: string;
}

export const RegisterPorterDialog = ({
    open,
    onOpenChange,
    onSuccess,
    currentPhone = "",
}: RegisterPorterDialogProps) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<SubmitPorterApplicationRequest>({
        name: "",
        phone: currentPhone,
        experience: "",
        cvUrl: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.phone.trim() || !formData.experience.trim() || !formData.cvUrl.trim()) {
            toast({
                variant: "destructive",
                title: "Thiếu thông tin",
                description: "Vui lòng nhập đầy đủ họ tên, số điện thoại, kinh nghiệm và link hồ sơ.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await userTripService.applyForPorter(formData);
            toast({
                title: "Gửi đăng ký thành công",
                description: "Yêu cầu của bạn đã được gửi và đang chờ phê duyệt.",
            });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to submit porter application:", error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể gửi yêu cầu. Vui lòng thử lại sau.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Đăng ký trở thành Người hỗ trợ</DialogTitle>
                        <DialogDescription>
                            Gửi thông tin để đăng ký trở thành người hỗ trợ/porter.
                            Admin sẽ xem xét hồ sơ của bạn.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Họ tên
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="col-span-3"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                SĐT
                            </Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                className="col-span-3"
                                placeholder="0912..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="experience" className="text-right">
                                Kinh nghiệm
                            </Label>
                            <Textarea
                                id="experience"
                                value={formData.experience}
                                onChange={(e) =>
                                    setFormData({ ...formData, experience: e.target.value })
                                }
                                className="col-span-3"
                                placeholder="Mô tả kinh nghiệm trekking, dẫn đoàn..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cvUrl" className="text-right">
                                Link HS
                            </Label>
                            <Input
                                id="cvUrl"
                                value={formData.cvUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, cvUrl: e.target.value })
                                }
                                className="col-span-3"
                                placeholder="Link CV/Profile (Google Drive...)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Gửi đăng ký
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
