import { CreatedTrip } from "./trip-types";

interface TripScheduleProps {
    createdTrip: CreatedTrip | null;
}

export const TripSchedule = ({ createdTrip }: TripScheduleProps) => {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Lịch trình chi tiết</h3>
            {createdTrip?.schedule && createdTrip.schedule.length > 0 ? (
                <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4">
                        <ul className="space-y-2 text-muted-foreground">
                            {createdTrip.schedule.map((item, index) => (
                                <li key={index}>
                                    {item.time && <span className="font-medium">{item.time} - </span>}
                                    {item.content}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-3">Ngày 1</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>• 5:00 - Tập trung xuất phát</li>
                            <li>• 8:00 - Đến điểm leo núi, ăn sáng</li>
                            <li>• 9:00 - Bắt đầu hành trình</li>
                            <li>• 12:00 - Nghỉ trưa</li>
                            <li>• 17:00 - Đến điểm cắm trại</li>
                        </ul>
                    </div>
                    <div className="border border-border rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-3">Ngày 2</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>• 4:00 - Thức dậy, săn mây</li>
                            <li>• 6:00 - Ăn sáng</li>
                            <li>• 7:00 - Xuống núi</li>
                            <li>• 12:00 - Về đến điểm xuất phát</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
