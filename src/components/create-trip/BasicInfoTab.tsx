import { useRef, useState, useEffect } from "react";
import { X, ImagePlus, Users, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import type { TripFormData } from "@/pages/CreateTripSelfOrganize";
import { imageService } from "@/services/api";
import { toast } from "sonner";
import { api } from "@/lib/axios";

interface BasicInfoTabProps {
  formData: TripFormData;
  updateFormData: (updates: Partial<TripFormData>) => void;
}

const trekLocations = [
  { value: "Fansipan - Lào Cai", difficulty: "hard" },
  { value: "Tà Xùa - Sơn La", difficulty: "hard" },
  { value: "Bạch Mộc Lương Tử - Lào Cai", difficulty: "expert" },
  { value: "Lảo Thẩn - Lào Cai", difficulty: "hard" },
  { value: "Nhìu Cồ San - Lào Cai", difficulty: "expert" },
  { value: "Ky Quan San - Lào Cai", difficulty: "expert" },
  { value: "Tà Chì Nhù - Yên Bái", difficulty: "hard" },
  { value: "Lùng Cúng - Yên Bái", difficulty: "hard" },
  { value: "Mù Cang Chải - Yên Bái", difficulty: "medium" },
  { value: "Pù Luông - Thanh Hóa", difficulty: "medium" },
  { value: "Mẫu Sơn - Lạng Sơn", difficulty: "medium" },
  { value: "Phia Oắc - Cao Bằng", difficulty: "hard" },
  { value: "Đỉnh Lũng Cú - Hà Giang", difficulty: "medium" },
  { value: "Hoàng Su Phì - Hà Giang", difficulty: "hard" },
  { value: "Tà Năng - Phan Dũng", difficulty: "hard" },
  { value: "Sơn Đoòng - Quảng Bình", difficulty: "expert" },
  { value: "Hang Én - Quảng Bình", difficulty: "hard" },
  { value: "Bạch Mã - Huế", difficulty: "medium" },
  { value: "Ngọc Linh - Kon Tum", difficulty: "expert" },
  { value: "Chư Yang Sin - Đắk Lắk", difficulty: "hard" },
  { value: "Langbiang - Lâm Đồng", difficulty: "easy" },
  { value: "Bidoup - Lâm Đồng", difficulty: "medium" },
  { value: "Núi Bà Đen - Tây Ninh", difficulty: "easy" },
  { value: "Núi Chứa Chan - Đồng Nai", difficulty: "easy" },
];

const difficulties = [
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
  { value: "expert", label: "Chuyên gia" },
];

export const BasicInfoTab = ({ formData, updateFormData }: BasicInfoTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewMap, setPreviewMap] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      Object.values(previewMap).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      const newPreviews: Record<string, string> = { ...previewMap };
      let hasChanges = false;

      for (const imgUrl of formData.images) {
        if (newPreviews[imgUrl]) continue;

        // Check UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isUUID = uuidRegex.test(imgUrl);

        const isBackendImage = isUUID || !imgUrl.startsWith('http') ||
          (import.meta.env.VITE_API_BASE_URL && imgUrl.startsWith(import.meta.env.VITE_API_BASE_URL));

        if (isBackendImage) {
          try {
            let fetchUrl = imgUrl;

            // Convert UUID to API path
            if (isUUID) {
              fetchUrl = `/api/v1/images/${imgUrl}`;
            } else if (imgUrl.startsWith('http')) {
              try {
                const urlObj = new URL(imgUrl);
                if (import.meta.env.VITE_API_BASE_URL && urlObj.origin === new URL(import.meta.env.VITE_API_BASE_URL).origin) {
                  fetchUrl = urlObj.pathname + urlObj.search;
                }
              } catch (e) { }
            }

            const response = await api.get(fetchUrl, { responseType: 'blob' });
            const blobUrl = URL.createObjectURL(response.data);
            newPreviews[imgUrl] = blobUrl;
            hasChanges = true;
          } catch (error) {
            console.error("Failed to load image preview securely:", imgUrl, error);
            newPreviews[imgUrl] = imgUrl;
            hasChanges = true;
          }
        } else {
          newPreviews[imgUrl] = imgUrl;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setPreviewMap(newPreviews);
      }
    };

    if (formData.images.length > 0) {
      fetchImages();
    }
  }, [formData.images]);

  const handleLocationChange = (value: string) => {
    const selectedLocation = trekLocations.find((loc) => loc.value === value);
    updateFormData({
      location: value,
      difficulty: selectedLocation?.difficulty || formData.difficulty,
    });
    setLocationOpen(false);
  };

  const handleCustomLocation = () => {
    if (locationSearch.trim()) {
      updateFormData({ location: locationSearch.trim() });
      setLocationOpen(false);
      setLocationSearch("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImageIds: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Upload file và lấy ID
        const uploadResponse = await imageService.uploadImage(file);
        const imageId = uploadResponse.data.id;

        console.log('Image uploaded, ID:', imageId);
        newImageIds.push(imageId);
      }

      // Lưu image IDs vào formData
      updateFormData({ images: [...formData.images, ...newImageIds] });
      toast.success(`Đã tải lên ${files.length} ảnh`);
    } catch (error) {
      console.error("Upload images error:", error);
      toast.error("Tải ảnh thất bại");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData({ images: newImages });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side - Form fields */}
      <div className="lg:col-span-2 space-y-5">
        {/* Trip name */}
        <div className="space-y-2">
          <Label htmlFor="name">Tên chuyến:</Label>
          <Input
            id="name"
            placeholder="Nhập tên chuyến đi"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
          />
        </div>

        {/* Location - Combobox cho phép chọn hoặc nhập tự do */}
        <div className="space-y-2">
          <Label>Địa điểm:</Label>
          <Popover open={locationOpen} onOpenChange={setLocationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={locationOpen}
                className="w-full justify-between bg-background font-normal"
              >
                {formData.location || "Chọn hoặc nhập địa điểm..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-background" align="start">
              <Command>
                <CommandInput
                  placeholder="Tìm địa điểm trek..."
                  value={locationSearch}
                  onValueChange={setLocationSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    <div className="py-2 px-3 text-sm">
                      <p className="text-muted-foreground mb-2">Không tìm thấy "{locationSearch}"</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCustomLocation}
                        className="w-full"
                      >
                        Thêm "{locationSearch}" làm địa điểm mới
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup heading="Địa điểm phổ biến">
                    {trekLocations.map((loc) => (
                      <CommandItem
                        key={loc.value}
                        value={loc.value}
                        onSelect={() => handleLocationChange(loc.value)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.location === loc.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {loc.value}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label>Độ khó:</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => updateFormData({ difficulty: value })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Chọn độ khó" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {difficulties.map((diff) => (
                <SelectItem key={diff.value} value={diff.value}>
                  {diff.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.location && (
            <p className="text-xs text-muted-foreground">
              Gợi ý dựa trên địa điểm, có thể thay đổi
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả:</Label>
          <Textarea
            id="description"
            placeholder="Mô tả chi tiết về chuyến đi..."
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows={3}
          />
        </div>

        {/* Departure date */}
        <div className="space-y-2">
          <Label>Khởi hành:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.departureDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.departureDate
                  ? format(formData.departureDate, "PPP", { locale: vi })
                  : "Chọn ngày khởi hành"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background" align="start">
              <Calendar
                mode="single"
                selected={formData.departureDate}
                onSelect={(date) => updateFormData({ departureDate: date })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Registration deadline */}
        <div className="space-y-2">
          <Label>Đóng tour/thời hạn đăng ký:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.registrationDeadline && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.registrationDeadline
                  ? format(formData.registrationDeadline, "PPP", { locale: vi })
                  : "Chọn thời hạn đăng ký"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background" align="start">
              <Calendar
                mode="single"
                selected={formData.registrationDeadline}
                onSelect={(date) => updateFormData({ registrationDeadline: date })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Expected Porter Count */}
        <div className="space-y-2">
          <Label htmlFor="expectedPorterCount" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Số lượng Porter dự kiến:
          </Label>
          <Input
            id="expectedPorterCount"
            type="number"
            min={1}
            max={50}
            placeholder="Nhập số lượng"
            value={formData.expectedPorterCount}
            onChange={(e) => updateFormData({ expectedPorterCount: parseInt(e.target.value) || 1 })}
            className="w-32"
          />
        </div>

        {/* Contact info */}
        <div className="space-y-2">
          <Label>Liên hệ:</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => updateFormData({ contactEmail: e.target.value })}
            />
            <Input
              placeholder="SĐT (Zalo)"
              value={formData.contactPhone}
              onChange={(e) => updateFormData({ contactPhone: e.target.value })}
            />
          </div>
        </div>

        {/* Discussion group link */}
        {/* <div className="space-y-2">
          <Label htmlFor="discussionLink">Link nhóm thảo luận:</Label>
          <Input
            id="discussionLink"
            placeholder="https://..."
            value={formData.discussionLink}
            onChange={(e) => updateFormData({ discussionLink: e.target.value })}
          />
        </div> */}
      </div>

      {/* Right side - Image upload */}
      <div className="space-y-3">
        <Label>Thêm ảnh</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Image preview grid */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {formData.images.map((img, index) => (
              <div key={index} className="relative group aspect-video">
                <img
                  src={previewMap[img] || img}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                    Ảnh bìa
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px] bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer",
            isUploading && "opacity-50 cursor-wait"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
          ) : (
            <ImagePlus className="h-12 w-12 text-muted-foreground mb-3" />
          )}
          <p className="text-sm text-muted-foreground text-center">
            {isUploading ? "Đang tải ảnh lên..." : "Kéo thả hoặc click để tải ảnh lên"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ảnh đầu tiên hiển thị trên card trip
          </p>
        </div>
      </div>
    </div>
  );
};
