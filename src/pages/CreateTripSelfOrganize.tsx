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
import { userTripService, type CreateUserTripPayload, type DifficultyLevel, type DurationType } from "@/services/api";
import { Loader2 } from "lucide-react";

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

  isDraft: string;
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
  isDraft: "true"
};

const mapDifficulty = (difficulty: string): DifficultyLevel => {
  const map: Record<string, DifficultyLevel> = {
    'easy': 'EASY',
    'moderate': 'MEDIUM',
    'hard': 'HARD',
    'expert': 'EXTREME',
  };
  return map[difficulty.toLowerCase()] || 'MEDIUM';
};

const mapDurationType = (type: string): DurationType => {
  return type === 'single-day' ? 'SINGLE_DAY' : 'MULTI_DAY';
};

const formDataToPayload = (formData: TripFormData, isDraft: boolean): CreateUserTripPayload => {
  return {
    name: formData.name,
    location: formData.location,
    difficulty: mapDifficulty(formData.difficulty),
    description: formData.description,
    departureDate: formData.departureDate?.toISOString() || new Date().toISOString(),
    registrationDeadline: formData.registrationDeadline?.toISOString() || new Date().toISOString(),
    contactEmail: formData.contactEmail,
    contactPhone: formData.contactPhone,
    expectedPorterCount: formData.expectedPorterCount,
    discussionLink: formData.discussionLink || undefined,
    images: formData.images.length > 0 ? formData.images : undefined,
    durationType: mapDurationType(formData.durationType),
    durationDays: formData.durationDays,
    schedule: formData.schedule
      .filter(s => s.time || s.content)
      .map(s => ({
        time: s.time,
        content: s.content,
      })),
    includedCosts: formData.includedCosts
      .filter(c => c.content)
      .map(c => ({
        content: c.content,
        cost: c.cost,
      })),
    additionalCosts: formData.additionalCosts
      .filter(c => c.content)
      .map(c => ({
        content: c.content,
        cost: c.cost,
      })),
    costNotes: formData.costNotes || undefined,
    preparations: formData.preparations.filter(p => p.trim() !== ''),
    isDraft,
  };
};

const CreateTripSelfOrganize = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [formData, setFormData] = useState<TripFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editTripId = searchParams.get('edit');
  const isEditMode = !!editTripId;

  useEffect(() => {
    const fetchTrip = async () => {
      if (editTripId) {
        setIsSubmitting(true);
        try {
          const response = await userTripService.getTripById(editTripId);
          const tripToEdit = response.data;
          setFormData({
            name: tripToEdit.name || "",
            location: tripToEdit.location || "",
            difficulty: (tripToEdit.difficulty || "").toLowerCase(),
            description: tripToEdit.description || "",
            departureDate: tripToEdit.departureDate ? new Date(tripToEdit.departureDate) : undefined,
            registrationDeadline: tripToEdit.registrationDeadline ? new Date(tripToEdit.registrationDeadline) : undefined,
            contactEmail: tripToEdit.contactEmail || "",
            contactPhone: tripToEdit.contactPhone || "",
            expectedPorterCount: tripToEdit.expectedPorterCount || 1,
            discussionLink: tripToEdit.discussionLink || "",
            images: tripToEdit.images || [],
            durationType: tripToEdit.durationType === 'SINGLE_DAY' ? 'single-day' : 'multi-day',
            durationDays: tripToEdit.durationDays || "2N1D",
            schedule: tripToEdit.schedule?.map(s => ({ time: s.time, content: s.content })) || [{ time: "", content: "" }],
            includedCosts: tripToEdit.includedCosts?.map(c => ({ content: c.content, cost: c.cost || "" })) || [{ content: "", cost: "" }],
            additionalCosts: tripToEdit.additionalCosts?.map(c => ({ content: c.content, cost: c.cost || "" })) || [{ content: "", cost: "" }],
            costNotes: tripToEdit.costNotes || "",
            preparations: tripToEdit.preparations || [""],
            isDraft: tripToEdit.isDraft ? "true" : "false",
          });
        } catch (error) {
          console.error("Fetch trip error:", error);
          toast.error("Không thể tải thông tin chuyến đi");
          navigate("/my-trips");
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    fetchTrip();
  }, [editTripId, navigate]);

  const handleSaveDraft = async () => {
    if (!formData.name) {
      toast.error("Vui lòng nhập tên chuyến đi");
      setActiveTab("basic-info");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = formDataToPayload(formData, true);
      await userTripService.createTrip(payload);
      toast.success("Đã lưu nháp thành công!");
      navigate("/my-trips");
    } catch (error) {
      console.error("Save draft error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.location || !formData.difficulty) {
      toast.error("Vui lòng điền đầy đủ thông tin cơ bản");
      setActiveTab("basic-info");
      return;
    }

    if (!formData.departureDate || !formData.registrationDeadline) {
      toast.error("Vui lòng chọn ngày khởi hành và hạn đăng ký");
      setActiveTab("basic-info");
      return;
    }

    if (!formData.contactEmail || !formData.contactPhone) {
      toast.error("Vui lòng nhập thông tin liên hệ");
      setActiveTab("basic-info");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = formDataToPayload(formData, false);
      const response = await userTripService.createTrip(payload);
      toast.success("Đã tạo chuyến đi thành công!");
      navigate(`/trip/${response.data.id}`);
    } catch (error) {
      console.error("Create trip error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.location || !formData.difficulty) {
      toast.error("Vui lòng điền đầy đủ thông tin cơ bản");
      setActiveTab("basic-info");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = formDataToPayload(formData, false);
      await userTripService.updateTrip(editTripId!, payload);
      toast.success("Đã cập nhật chuyến đi thành công!");
      navigate(`/trip/${editTripId}`);
    } catch (error) {
      console.error("Update trip error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
                <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button onClick={handleUpdate} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu nháp
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Tạo chuyến
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
