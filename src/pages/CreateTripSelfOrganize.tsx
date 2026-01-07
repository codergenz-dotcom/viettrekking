import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "@/components/create-trip/BasicInfoTab";
import { ScheduleTab } from "@/components/create-trip/ScheduleTab";
import { CostTab } from "@/components/create-trip/CostTab";
import { PreparationTab } from "@/components/create-trip/PreparationTab";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface TripFormData {
  name: string;
  location: string;
  difficulty: string;
  description: string;
  departureDate: Date | undefined;
  registrationDeadline: Date | undefined;
  contactEmail: string;
  contactPhone: string;
  expectedPorterCount: number;
  discussionLink: string;
  images: string[];

  durationType: "multi-day" | "single-day";
  durationDays: string;
  schedule: { time: string; content: string }[];

  includedCosts: { content: string; cost: string }[];
  additionalCosts: { content: string; cost: string }[];
  costNotes: string;

  preparations: string[];
}

const parseCostString = (cost: string): number => {
  if (!cost) return 0;
  let cleaned = cost.toLowerCase().replace(/[^\d.,trđk]/g, '');

  if (cleaned.includes('tr')) {
    const num = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return num * 1000000;
  }

  if (cleaned.includes('k')) {
    const num = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return num * 1000;
  }

  cleaned = cleaned.replace(/,/g, '').replace('đ', '');
  return parseFloat(cleaned) || 0;
};

const calculateEstimatedPrice = (includedCosts: { content: string; cost: string }[]): number => {
  return includedCosts.reduce((sum, item) => sum + parseCostString(item.cost), 0);
};

const initialFormData: TripFormData = {
  name: "",
  location: "",
  difficulty: "",
  description: "",
  departureDate: undefined,
  registrationDeadline: undefined,
  contactEmail: "",
  contactPhone: "",
  expectedPorterCount: 1,
  discussionLink: "",
  images: [],
  durationType: "multi-day",
  durationDays: "2N1D",
  schedule: [{ time: "", content: "" }],
  includedCosts: [{ content: "", cost: "" }],
  additionalCosts: [{ content: "", cost: "" }],
  costNotes: "",
  preparations: [""],
};

const CreateTripSelfOrganize = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [formData, setFormData] = useState<TripFormData>(initialFormData);

  const editTripId = searchParams.get('edit');
  const isEditMode = !!editTripId;

  useEffect(() => {
    if (editTripId) {
      const stored = localStorage.getItem('createdTrips');
      if (stored) {
        const trips = JSON.parse(stored);
        const tripToEdit = trips.find((t: { id: string }) => t.id === editTripId);
        if (tripToEdit) {
          setFormData({
            name: tripToEdit.name || "",
            location: tripToEdit.location || "",
            difficulty: tripToEdit.difficulty || "",
            description: tripToEdit.description || "",
            departureDate: tripToEdit.departureDate ? new Date(tripToEdit.departureDate) : undefined,
            registrationDeadline: tripToEdit.registrationDeadline ? new Date(tripToEdit.registrationDeadline) : undefined,
            contactEmail: tripToEdit.contactEmail || "",
            contactPhone: tripToEdit.contactPhone || "",
            expectedPorterCount: tripToEdit.expectedPorterCount || 1,
            discussionLink: tripToEdit.discussionLink || "",
            images: tripToEdit.images || [],
            durationType: tripToEdit.durationType || "multi-day",
            durationDays: tripToEdit.durationDays || "2N1D",
            schedule: tripToEdit.schedule || [{ time: "", content: "" }],
            includedCosts: tripToEdit.includedCosts || [{ content: "", cost: "" }],
            additionalCosts: tripToEdit.additionalCosts || [{ content: "", cost: "" }],
            costNotes: tripToEdit.costNotes || "",
            preparations: tripToEdit.preparations || [""],
          });
        }
      }
    }
  }, [editTripId]);

  const handleSaveDraft = () => {
    const drafts = JSON.parse(localStorage.getItem("tripDrafts") || "[]");
    const newDraft = {
      id: `draft-${Date.now()}`,
      ...formData,
      status: "draft",
      createdBy: currentUser?.id,
      createdAt: new Date().toISOString(),
    };
    drafts.push(newDraft);
    localStorage.setItem("tripDrafts", JSON.stringify(drafts));
    toast.success("Đã lưu nháp thành công!");
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.location || !formData.difficulty) {
      toast.error("Vui lòng điền đầy đủ thông tin cơ bản");
      setActiveTab("basic-info");
      return;
    }

    const trips = JSON.parse(localStorage.getItem("createdTrips") || "[]");
    const newTrip = {
      id: `trip-${Date.now()}`,
      ...formData,
      status: "approved",
      createdBy: currentUser?.id,
      createdByName: currentUser?.name,
      createdAt: new Date().toISOString(),
      image: formData.images[0] || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      date: formData.departureDate?.toISOString() || new Date().toISOString(),
      participants: 0,
      maxParticipants: 20,
      estimatedPrice: calculateEstimatedPrice(formData.includedCosts),
    };
    trips.push(newTrip);
    localStorage.setItem("createdTrips", JSON.stringify(trips));
    
    toast.success("Đã gửi chuyến đi để duyệt!");
    navigate("/trips");
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.location || !formData.difficulty) {
      toast.error("Vui lòng điền đầy đủ thông tin cơ bản");
      setActiveTab("basic-info");
      return;
    }

    const trips = JSON.parse(localStorage.getItem("createdTrips") || "[]");
    const updatedTrips = trips.map((t: { id: string }) =>
      t.id === editTripId
        ? {
            ...t,
            ...formData,
            image: formData.images[0] || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
            date: formData.departureDate?.toISOString() || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            estimatedPrice: calculateEstimatedPrice(formData.includedCosts),
          }
        : t
    );
    localStorage.setItem("createdTrips", JSON.stringify(updatedTrips));
    toast.success("Đã cập nhật chuyến đi!");
    navigate(`/trip/${editTripId}`);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const updateFormData = (updates: Partial<TripFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-center text-foreground mb-6">
          {isEditMode ? "Chỉnh sửa chuyến đi" : "Tạo chuyến"}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="basic-info">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="schedule">Lịch trình</TabsTrigger>
            <TabsTrigger value="cost">Chi phí</TabsTrigger>
            <TabsTrigger value="preparation">Lưu ý chuẩn bị</TabsTrigger>
          </TabsList>

          <div className="border border-border rounded-xl bg-card p-6 min-h-[500px]">
            <TabsContent value="basic-info" className="mt-0">
              <BasicInfoTab formData={formData} updateFormData={updateFormData} />
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <ScheduleTab formData={formData} updateFormData={updateFormData} />
            </TabsContent>

            <TabsContent value="cost" className="mt-0">
              <CostTab formData={formData} updateFormData={updateFormData} />
            </TabsContent>

            <TabsContent value="preparation" className="mt-0">
              <PreparationTab formData={formData} updateFormData={updateFormData} />
            </TabsContent>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-6">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Hủy
                </Button>
                <Button onClick={handleUpdate}>
                  Lưu
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleSaveDraft}>
                  Nháp
                </Button>
                <Button onClick={handleSubmit}>
                  Gửi duyệt
                </Button>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateTripSelfOrganize;
