import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { TripFormData } from "@/pages/CreateTripSelfOrganize";

interface PreparationTabProps {
  formData: TripFormData;
  updateFormData: (updates: Partial<TripFormData>) => void;
}

export const PreparationTab = ({ formData, updateFormData }: PreparationTabProps) => {
  const addPreparation = () => {
    updateFormData({
      preparations: [...formData.preparations, ""],
    });
  };

  const removePreparation = (index: number) => {
    updateFormData({
      preparations: formData.preparations.filter((_, i) => i !== index),
    });
  };

  const updatePreparation = (index: number, value: string) => {
    const newPreparations = [...formData.preparations];
    newPreparations[index] = value;
    updateFormData({ preparations: newPreparations });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Chuẩn bị</Label>
        <div className="border border-border rounded-lg overflow-hidden">
          {formData.preparations.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 border-b border-border last:border-b-0 p-3"
            >
              <span className="text-muted-foreground w-6 text-center">
                {index + 1}
              </span>
              <Input
                placeholder="VD: Giày leo núi, áo khoác, đèn pin..."
                value={item}
                onChange={(e) => updatePreparation(index, e.target.value)}
                className="flex-1 border-0 shadow-none focus-visible:ring-0"
              />
              {formData.preparations.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removePreparation(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={addPreparation}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Thêm mục chuẩn bị
        </Button>
      </div>
    </div>
  );
};
