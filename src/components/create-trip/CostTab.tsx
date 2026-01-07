import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { TripFormData } from "@/pages/CreateTripSelfOrganize";

interface CostTableProps {
  items: { content: string; cost: string }[];
  onUpdate: (index: number, field: "content" | "cost", value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  addLabel: string;
}

const CostTable = ({
  items,
  onUpdate,
  onRemove,
  onAdd,
  addLabel,
}: CostTableProps) => (
  <div className="space-y-3">
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 bg-muted/50 border-b border-border">
        <div className="col-span-1 p-3 text-sm font-medium text-muted-foreground"></div>
        <div className="col-span-6 p-3 text-sm font-medium border-l border-border">
          Nội dung
        </div>
        <div className="col-span-4 p-3 text-sm font-medium border-l border-border">
          Chi phí
        </div>
        <div className="col-span-1 p-3"></div>
      </div>

      {/* Rows */}
      {items.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-12 border-b border-border last:border-b-0"
        >
          <div className="col-span-1 p-3 flex items-center justify-center text-muted-foreground">
            {index + 1}
          </div>
          <div className="col-span-6 p-2 border-l border-border">
            <Input
              placeholder="Mô tả chi phí..."
              value={item.content}
              onChange={(e) => onUpdate(index, "content", e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="col-span-4 p-2 border-l border-border">
            <Input
              placeholder="VD: 500,000đ"
              value={item.cost}
              onChange={(e) => onUpdate(index, "cost", e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="col-span-1 p-2 flex items-center justify-center border-l border-border">
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>

    <Button variant="outline" size="sm" onClick={onAdd} className="gap-1">
      <Plus className="h-4 w-4" />
      {addLabel}
    </Button>
  </div>
);

interface CostTabProps {
  formData: TripFormData;
  updateFormData: (updates: Partial<TripFormData>) => void;
}

export const CostTab = ({ formData, updateFormData }: CostTabProps) => {
  const addIncludedCost = () => {
    updateFormData({
      includedCosts: [...formData.includedCosts, { content: "", cost: "" }],
    });
  };

  const removeIncludedCost = (index: number) => {
    updateFormData({
      includedCosts: formData.includedCosts.filter((_, i) => i !== index),
    });
  };

  const updateIncludedCost = (
    index: number,
    field: "content" | "cost",
    value: string
  ) => {
    const newCosts = [...formData.includedCosts];
    newCosts[index] = { ...newCosts[index], [field]: value };
    updateFormData({ includedCosts: newCosts });
  };

  const addAdditionalCost = () => {
    updateFormData({
      additionalCosts: [...formData.additionalCosts, { content: "", cost: "" }],
    });
  };

  const removeAdditionalCost = (index: number) => {
    updateFormData({
      additionalCosts: formData.additionalCosts.filter((_, i) => i !== index),
    });
  };

  const updateAdditionalCost = (
    index: number,
    field: "content" | "cost",
    value: string
  ) => {
    const newCosts = [...formData.additionalCosts];
    newCosts[index] = { ...newCosts[index], [field]: value };
    updateFormData({ additionalCosts: newCosts });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Included costs */}
        <div className="space-y-3">
          <Label>Chi phí bao gồm:</Label>
          <CostTable
            items={formData.includedCosts}
            onUpdate={updateIncludedCost}
            onRemove={removeIncludedCost}
            onAdd={addIncludedCost}
            addLabel="Thêm chi phí"
          />
        </div>

        {/* Additional costs */}
        <div className="space-y-3">
          <Label>Chi phí có thể phát sinh / thêm:</Label>
          <CostTable
            items={formData.additionalCosts}
            onUpdate={updateAdditionalCost}
            onRemove={removeAdditionalCost}
            onAdd={addAdditionalCost}
            addLabel="Thêm chi phí"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <Label htmlFor="costNotes">Lưu ý:</Label>
        <Textarea
          id="costNotes"
          placeholder="VD: Liên hệ với nhà xe? Kiểm tra lán nghỉ/địa điểm nghỉ..."
          value={formData.costNotes}
          onChange={(e) => updateFormData({ costNotes: e.target.value })}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};
