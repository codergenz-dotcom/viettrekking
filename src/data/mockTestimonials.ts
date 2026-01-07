export interface Testimonial {
  name: string;
  avatar: string;
  tour: string;
  date: string;
  rating: number;
  content: string;
}

export const mockTestimonials: Testimonial[] = [
  {
    name: "Nguyễn Minh Tuấn",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    tour: "Tour Fansipan",
    date: "15 tháng 1, 2024",
    rating: 5,
    content: "Trải nghiệm tuyệt vời! Hướng dẫn viên rất chuyên nghiệp và nhiệt tình. Cảnh đẹp ngoài sức tưởng tượng. Chắc chắn sẽ quay lại!"
  },
  {
    name: "Trần Thị Hương",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    tour: "Tour Tà Xùa",
    date: "18 tháng 3, 2024",
    rating: 5,
    content: "Lần đầu đi trekking và tôi có thể nói là hoàn toàn khổng thể nào quên. Team BKTreking rất chu đáo, tự chuẩn bị tỉ mỉ đặc biệt hỗ trợ trên đường đi."
  },
  {
    name: "Phạm Văn Đức",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    tour: "Tour Lảo Thẩn",
    date: "2 tháng 1, 2024",
    rating: 5,
    content: "Đã trải nghiệm nhiều tour trekking nhưng đây là ấn tượng nhất. Lịch trình hợp lý, đồ ăn ngon, và đặc biệt là vibe cảm của đoàn siêu thân thiện."
  }
];
