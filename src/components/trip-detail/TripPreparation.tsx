import { CreatedTrip } from "./trip-types";

interface TripPreparationProps {
    createdTrip: CreatedTrip | null;
}

export const TripPreparation = ({ createdTrip }: TripPreparationProps) => {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Cần chuẩn bị</h3>
            {createdTrip?.preparations && createdTrip.preparations.length > 0 && createdTrip.preparations.some(p => p.trim()) ? (
                <ul className="space-y-2 text-muted-foreground">
                    {createdTrip.preparations.filter(p => p.trim()).map((item, index) => (
                        <li key={index}>• {item}</li>
                    ))}
                </ul>
            ) : (
                <ul className="space-y-2 text-muted-foreground">
                    <li>• Giày leo núi chuyên dụng</li>
                    <li>• Áo khoác chống nước, giữ ấm</li>
                    <li>• Đèn pin/đèn đội đầu</li>
                    <li>• Bình nước cá nhân (ít nhất 1.5L)</li>
                    <li>• Đồ dùng cá nhân (khăn, kem chống nắng...)</li>
                    <li>• Thuốc cá nhân (nếu có)</li>
                    <li>• Găng tay, mũ/nón</li>
                    <li>• Gậy leo núi (nếu có)</li>
                </ul>
            )}
        </div>
    );
};
