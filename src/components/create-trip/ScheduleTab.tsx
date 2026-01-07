import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { TripFormData } from "@/pages/CreateTripSelfOrganize";

interface ScheduleTabProps {
  formData: TripFormData;
  updateFormData: (updates: Partial<TripFormData>) => void;
}

export const ScheduleTab = ({ formData, updateFormData }: ScheduleTabProps) => {
  const addScheduleItem = () => {
    updateFormData({
      schedule: [...formData.schedule, { time: "", content: "" }],
    });
  };

  const removeScheduleItem = (index: number) => {
    updateFormData({
      schedule: formData.schedule.filter((_, i) => i !== index),
    });
  };

  const updateScheduleItem = (
    index: number,
    field: "time" | "content",
    value: string
  ) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    updateFormData({ schedule: newSchedule });
  };

  return (
    <div className="space-y-6">
      {/* Duration type */}
      <div className="space-y-3">
        <Label>Thời gian của chuyến:</Label>
        <RadioGroup
          value={formData.durationType}
          onValueChange={(value: "multi-day" | "single-day") =>
            updateFormData({ durationType: value })
          }
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="multi-day" id="multi-day" />
            <Label htmlFor="multi-day" className="font-normal cursor-pointer">
              Nhiều ngày
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single-day" id="single-day" />
            <Label htmlFor="single-day" className="font-normal cursor-pointer">
              Trong ngày
            </Label>
          </div>
        </RadioGroup>

        {/* Duration days input - only show when multi-day is selected */}
        {formData.durationType === "multi-day" && (
          <div className="flex items-center gap-3 mt-3 p-3 bg-muted/30 rounded-lg">
            <Label htmlFor="durationDays" className="whitespace-nowrap">
              Thời gian:
            </Label>
            <Input
              id="durationDays"
              type="text"
              value={formData.durationDays}
              onChange={(e) => updateFormData({ durationDays: e.target.value })}
              className="w-32"
              placeholder="VD: 2N1D, 3N2D..."
            />
          </div>
        )}
      </div>

      {/* Detailed schedule */}
      <div className="space-y-3">
        <Label>Lịch trình chi tiết</Label>
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 bg-muted/50 border-b border-border">
            <div className="col-span-1 p-3 text-sm font-medium text-muted-foreground"></div>
            <div className="col-span-5 p-3 text-sm font-medium border-l border-border">
              Nội dung
            </div>
            <div className="col-span-5 p-3 text-sm font-medium border-l border-border">
              Thời gian
            </div>
            <div className="col-span-1 p-3"></div>
          </div>

          {/* Rows */}
          {formData.schedule.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 border-b border-border last:border-b-0"
            >
              <div className="col-span-1 p-3 flex items-center justify-center text-muted-foreground">
                {index + 1}
              </div>
              <div className="col-span-5 p-2 border-l border-border">
                <Input
                  placeholder="Mô tả hoạt động..."
                  value={item.content}
                  onChange={(e) =>
                    updateScheduleItem(index, "content", e.target.value)
                  }
                  className="border-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="col-span-5 p-2 border-l border-border">
                <Input
                  placeholder="VD: 6:00 - 8:00"
                  value={item.time}
                  onChange={(e) =>
                    updateScheduleItem(index, "time", e.target.value)
                  }
                  className="border-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="col-span-1 p-2 flex items-center justify-center border-l border-border">
                {formData.schedule.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeScheduleItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={addScheduleItem}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Thêm hoạt động
        </Button>
      </div>
    </div>
  );
};
