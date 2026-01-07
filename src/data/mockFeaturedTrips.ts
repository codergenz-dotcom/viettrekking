export interface FeaturedTrip {
  id: number;
  title: string;
  location: string;
  description: string;
  image: string;
  duration: string;
  groupSize: string;
  price: string;
  originalPrice?: string;
  rating: number;
  difficulty: string;
}

export const mockFeaturedTrips: FeaturedTrip[] = [
  {
    id: 1,
    title: "Fansipan - Nóc nhà Đông Dương",
    location: "Sapa, Lào Cai",
    description: "Chinh phục đỉnh núi cao nhất Việt Nam với đội ngũ HDV chuyên nghiệp",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
    duration: "3 ngày",
    groupSize: "2-6 người",
    price: "2.500.000",
    originalPrice: "3.000.000",
    rating: 4.9,
    difficulty: "Khó"
  },
  {
    id: 2,
    title: "Tà Xùa - Săn mây",
    location: "Bắc Yên, Sơn La",
    description: "Trải nghiệm thiên đường săn mây nổi tiếng nhất Tây Bắc",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    duration: "2 ngày",
    groupSize: "4-8 người",
    price: "1.800.000",
    rating: 4.8,
    difficulty: "Trung bình"
  },
  {
    id: 3,
    title: "Pù Luông - Thung lũng xanh",
    location: "Bá Thước, Thanh Hóa",
    description: "Khám phục vùng đất hoang sơ đẹp mượt mà như tranh vẽ đẹp",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
    duration: "3 ngày",
    groupSize: "4-10 người",
    price: "2.200.000",
    rating: 4.7,
    difficulty: "Dễ"
  },
  {
    id: 4,
    title: "Lảo Thẩn - Bản làng trên mây",
    location: "Y Tý, Lào Cai",
    description: "Khám phá vẻ đẹp nguyên sơ của Y Tý với những cánh đồng terraces",
    image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800",
    duration: "4 ngày",
    groupSize: "2-6 người",
    price: "1.900.000",
    rating: 4.8,
    difficulty: "Khó"
  },
  {
    id: 5,
    title: "Bạch Mộc Lương Tử",
    location: "Bát Xát, Lào Cai",
    description: "Chinh phục đỉnh núi cao thứ 4 Việt Nam",
    image: "https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=800",
    duration: "3 ngày",
    groupSize: "4-8 người",
    price: "3.200.000",
    rating: 4.7,
    difficulty: "Rất khó"
  },
  {
    id: 6,
    title: "Hà Giang Loop",
    location: "Đồng Văn, Hà Giang",
    description: "Hành trình cao nguyên đá Đồng Văn",
    image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800",
    duration: "4 ngày",
    groupSize: "4-10 người",
    price: "2.800.000",
    rating: 4.6,
    difficulty: "Trung bình"
  }
];

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Dễ":
      return "bg-green-100 text-green-700";
    case "Trung bình":
      return "bg-yellow-100 text-yellow-700";
    case "Khó":
      return "bg-orange-100 text-orange-700";
    case "Rất khó":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};
