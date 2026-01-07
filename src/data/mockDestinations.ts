export interface Destination {
  name: string;
  routes: string;
  image: string;
}

export const mockDestinations: Destination[] = [
  {
    name: "Sapa",
    routes: "15 cung đường",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800"
  },
  {
    name: "Hà Giang",
    routes: "12 cung đường",
    image: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=800"
  },
  {
    name: "Tây Bắc",
    routes: "18 cung đường",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
  },
  {
    name: "Tây Nguyên",
    routes: "8 cung đường",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"
  }
];
