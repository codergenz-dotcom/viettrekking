import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Calendar as CalendarIcon, Gauge, Search } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [location, setLocation] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (date) params.set("date", format(date, "yyyy-MM-dd"));
    if (difficulty) params.set("difficulty", difficulty);
    
    navigate(`/trips${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative h-screen flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
          >
            Khám phá những cung đường{" "}
            <span className="text-primary">trekking</span> tuyệt vời nhất{" "}
            <span className="text-primary">Việt Nam</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/80 mb-8"
          >
            Từ những đỉnh núi hùng vĩ đến các thung lũng xanh mướt, chúng tôi mang đến cho bạn những trải nghiệm trekking an toàn và đáng nhớ.
          </motion.p>
          
          {/* Search Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl p-4 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 border-r border-border pr-4">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="border-0 shadow-none focus:ring-0 min-w-0">
                    <SelectValue placeholder="Chọn điểm đến" className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sapa">Sapa</SelectItem>
                    <SelectItem value="Hà Giang">Hà Giang</SelectItem>
                    <SelectItem value="Tây Bắc">Tây Bắc</SelectItem>
                    <SelectItem value="Tây Nguyên">Tây Nguyên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 border-r border-border pr-4">
                <CalendarIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "justify-start text-left font-normal border-0 shadow-none hover:bg-transparent px-2",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date ? format(date, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-center gap-2 border-r border-border pr-4">
                <Gauge className="h-5 w-5 text-muted-foreground" />
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="border-0 shadow-none focus:ring-0">
                    <SelectValue placeholder="Độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Dễ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="hard">Khó</SelectItem>
                    <SelectItem value="extreme">Rất khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90 h-full">
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
            </div>
          </motion.div>
          
          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex gap-12 mt-8"
          >
            <div>
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-white/70">Cung đường</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-white/70">Khách hàng</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">4.9</p>
              <p className="text-white/70">Đánh giá</p>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/70 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
