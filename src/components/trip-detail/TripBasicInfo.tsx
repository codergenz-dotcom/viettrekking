import React, { useEffect, useState } from "react";
import { MapPin, Calendar, User, Backpack, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Trip, difficultyLabels } from "@/data/mockTrips";
import { mockAdminUsers } from "@/data/mockUsers";
import { CreatedTrip } from "./trip-types";
import { formatDate, getDifficultyClass, formatPrice } from "./trip-utils";
import { api } from "@/lib/axios";

interface TripBasicInfoProps {
    trip: Trip;
    createdTrip: CreatedTrip | null;
    isRegistrationClosed: boolean;
    actions?: React.ReactNode;
}

export const TripBasicInfo = ({ trip, createdTrip, isRegistrationClosed, actions }: TripBasicInfoProps) => {
    const organizer = mockAdminUsers.find(u => u.id === trip.organizerId);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const tripImage = trip.image || createdTrip?.images?.[0];

    useEffect(() => {
        if (!tripImage) return;

        let active = true;
        const fetchImage = async () => {
            // Check UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const isUUID = uuidRegex.test(tripImage);

            const isBackendImage = isUUID || !tripImage.startsWith('http') ||
                tripImage.includes('localhost:8080') ||
                (import.meta.env.VITE_API_BASE_URL && tripImage.startsWith(import.meta.env.VITE_API_BASE_URL));

            if (isBackendImage) {
                try {
                    let fetchUrl = tripImage;

                    // Convert UUID to API path
                    if (isUUID) {
                        fetchUrl = `/api/v1/images/${tripImage}`;
                    } else if (tripImage.startsWith('http')) {
                        try {
                            const urlObj = new URL(tripImage);
                            if (urlObj.origin.includes('localhost:8080') ||
                                (import.meta.env.VITE_API_BASE_URL && urlObj.origin === new URL(import.meta.env.VITE_API_BASE_URL).origin)) {
                                fetchUrl = urlObj.pathname + urlObj.search;
                            }
                        } catch (e) { }
                    }

                    const response = await api.get(fetchUrl, { responseType: 'blob' });
                    if (active) {
                        const blobUrl = URL.createObjectURL(response.data);
                        setImagePreview(blobUrl);
                    }
                } catch (error) {
                    console.error("Failed to load secure image:", error);
                }
            } else {
                setImagePreview(tripImage);
            }
        };

        fetchImage();

        return () => {
            active = false;
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [tripImage]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - Trip Info */}
            <div className="lg:col-span-2 space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                        {trip.name}
                    </h2>
                    <p className="text-muted-foreground">{trip.description}</p>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="text-foreground">
                            <span className="text-muted-foreground">Địa điểm:</span>{" "}
                            {trip.location}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">Độ khó:</span>
                        <Badge className={`${getDifficultyClass(trip.difficulty)} border`}>
                            {difficultyLabels[trip.difficulty]}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="text-foreground">
                            <span className="text-muted-foreground">Khởi hành:</span>{" "}
                            {formatDate(trip.departureDate)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="text-foreground">
                            <span className="text-muted-foreground">Thời hạn đăng ký:</span>{" "}
                            {formatDate(trip.registrationDeadline)}
                            {isRegistrationClosed && (
                                <Badge variant="destructive" className="ml-2">
                                    Đã hết hạn
                                </Badge>
                            )}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary" />
                        <span className="text-foreground">
                            <span className="text-muted-foreground">Leader:</span>{" "}
                            {trip.leaders} người
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Backpack className="h-5 w-5 text-primary" />
                        <span className="text-foreground">
                            <span className="text-muted-foreground">Porter:</span>{" "}
                            {trip.portersAvailable}/{trip.portersNeeded} người
                        </span>
                    </div>

                    {/* Organizer Info */}
                    {organizer && (
                        <div className="pt-4 border-t border-border">
                            <h3 className="font-medium text-foreground mb-3">Người hỗ trợ:</h3>
                            <div
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => window.open(`/profile/${organizer.id}`, '_blank')}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {organizer.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">{organizer.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{organizer.email}</p>
                                </div>
                                <Badge variant="secondary" className="shrink-0">
                                    {organizer.role === 'porter' ? 'Porter' : organizer.role === 'admin' ? 'Admin' : 'User'}
                                </Badge>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                    <h3 className="font-medium text-foreground">Liên hệ:</h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{createdTrip?.contactEmail || (createdTrip as any)?.contactEmail || "contact@viettrekking.com"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{createdTrip?.contactPhone || (createdTrip as any)?.contactPhone || "0123 456 789"} (Zalo)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right - Image & Price & Actions */}
            <div className="space-y-4">
                <div className="aspect-[4/3] rounded-xl bg-muted flex items-center justify-center border border-border overflow-hidden">
                    {(imagePreview || tripImage) ? (
                        <img
                            src={imagePreview || tripImage}
                            alt={trip.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <span className="text-sm">Ảnh chuyến đi</span>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Giá ước tính</p>
                    <p className="text-2xl font-bold text-primary">
                        {formatPrice(trip.estimatedPrice)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Còn {trip.spotsRemaining}/{trip.totalSpots} chỗ
                    </p>
                </div>

                {/* Actions moved here */}
                {actions && (
                    <div className="pt-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};
