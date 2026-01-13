import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Registration } from "./trip-types";

interface TripMembersProps {
    registrations: Registration[];
    onApprove: (registrationId: string) => void;
    onReject: (registrationId: string) => void;
}

export const TripMembers = ({ registrations, onApprove, onReject }: TripMembersProps) => {
    const pendingRegistrations = registrations.filter((r) => r.status === "PENDING");
    const approvedRegistrations = registrations.filter((r) => r.status === "APPROVED");
    const rejectedRegistrations = registrations.filter((r) => r.status === "REJECTED");

    return (
        <div className="space-y-6">
            {/* Pending registrations */}
            <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    Đơn đăng ký chờ duyệt
                    {pendingRegistrations.length > 0 && (
                        <Badge variant="secondary">{pendingRegistrations.length}</Badge>
                    )}
                </h3>
                {pendingRegistrations.length > 0 ? (
                    <div className="space-y-3">
                        {pendingRegistrations.map((reg, index) => (
                            <div
                                key={reg.id}
                                className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground w-6">{index + 1}.</span>
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {reg.name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-foreground">{reg.name}</p>
                                        <p className="text-sm text-muted-foreground">{reg.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => onApprove(reg.id)}
                                        className="gap-1"
                                    >
                                        <Check className="h-4 w-4" />
                                        Duyệt
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onReject(reg.id)}
                                        className="gap-1"
                                    >
                                        <X className="h-4 w-4" />
                                        Từ chối
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">Không có đơn đăng ký nào đang chờ duyệt.</p>
                )}
            </div>

            {/* Approved members */}
            <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    Danh sách thành viên
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {approvedRegistrations.length}
                    </Badge>
                </h3>
                {approvedRegistrations.length > 0 ? (
                    <div className="space-y-2">
                        {approvedRegistrations.map((reg, index) => (
                            <div
                                key={reg.id}
                                className="flex items-center justify-between p-3 border border-border rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground w-6">{index + 1}.</span>
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-green-100 text-green-800 text-sm">
                                            {reg.name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-foreground">{reg.name}</p>
                                        <p className="text-xs text-muted-foreground">{reg.email} • {reg.phone}</p>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800 border-0">
                                    Đã duyệt
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">Chưa có thành viên nào.</p>
                )}
            </div>

            {/* Rejected registrations */}
            {rejectedRegistrations.length > 0 && (
                <div>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        Đã từ chối
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                            {rejectedRegistrations.length}
                        </Badge>
                    </h3>
                    <div className="space-y-2">
                        {rejectedRegistrations.map((reg, index) => (
                            <div
                                key={reg.id}
                                className="flex items-center justify-between p-3 border border-border rounded-lg opacity-60"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground w-6">{index + 1}.</span>
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-red-100 text-red-800 text-sm">
                                            {reg.name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="font-medium text-foreground">{reg.name}</p>
                                </div>
                                <Badge variant="outline" className="text-red-600 border-red-200">
                                    Từ chối
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
