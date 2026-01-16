export interface Destination {
  name: string;
  province: string;
  routes: string;
  image: string;
}

export const mockDestinations: Destination[] = [
  {
    name: "Fansipan",
    province: "Lào Cai",
    routes: "3 cung đường chính",
    image: "https://images.unsplash.com/photo-1589308078059-be141a7a401c?w=800"
  },
  {
    name: "Mù Cang Chải",
    province: "Yên Bái",
    routes: "5 cung đường lúa chín",
    image: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=800"
  },
  {
    name: "Tà Xùa",
    province: "Sơn La",
    routes: "Săn mây đỉnh cao",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800"
  },
  {
    name: "Thác Bản Giốc",
    province: "Cao Bằng",
    routes: "Vẻ đẹp hùng vĩ",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
  },
  {
    name: "Ky Quan San",
    province: "Lào Cai",
    routes: "Bạch Mộc Lương Tử",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"
  }
];
