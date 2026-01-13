import { CreatedTrip } from "./trip-types";

interface TripServicesProps {
    createdTrip: CreatedTrip | null;
}

export const TripServices = ({ createdTrip }: TripServicesProps) => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-foreground mb-3">Chi phí bao gồm</h3>
                    {createdTrip?.includedCosts && createdTrip.includedCosts.length > 0 ? (
                        <ul className="space-y-2 text-muted-foreground">
                            {createdTrip.includedCosts.map((item, index) => (
                                <li key={index}>
                                    • {item.content}
                                    {item.cost && <span className="text-foreground font-medium"> - {item.cost}</span>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className="space-y-2 text-muted-foreground">
                            <li>• Xe đưa đón từ Hà Nội</li>
                            <li>• Leader dẫn đường</li>
                            <li>• Lều trại, túi ngủ</li>
                            <li>• Bảo hiểm du lịch</li>
                            <li>• Các bữa ăn theo chương trình</li>
                        </ul>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-3">Chi phí chưa bao gồm / phát sinh</h3>
                    {createdTrip?.additionalCosts && createdTrip.additionalCosts.length > 0 ? (
                        <ul className="space-y-2 text-muted-foreground">
                            {createdTrip.additionalCosts.map((item, index) => (
                                <li key={index}>
                                    • {item.content}
                                    {item.cost && <span className="text-foreground font-medium"> - {item.cost}</span>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className="space-y-2 text-muted-foreground">
                            <li>• Porter (nếu cần)</li>
                            <li>• Đồ uống riêng</li>
                            <li>• Chi phí cá nhân khác</li>
                        </ul>
                    )}
                </div>
            </div>
            {createdTrip?.costNotes && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Lưu ý:</h4>
                    <p className="text-muted-foreground">{createdTrip.costNotes}</p>
                </div>
            )}
        </>
    );
};
