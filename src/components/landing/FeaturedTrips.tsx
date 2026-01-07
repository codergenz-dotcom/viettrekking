import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { mockTrips, difficultyLabels } from "@/data/mockTrips";

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "hard":
      return "bg-orange-100 text-orange-700";
    case "extreme":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const tripImages = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800",
  "https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=800",
  "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800",
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN").format(price);
};

const featuredTrips = mockTrips.slice(0, 6).map((trip, index) => ({
  ...trip,
  image: trip.image || tripImages[index] || tripImages[0],
}));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export const FeaturedTrips = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Cung đường <span className="text-primary">nổi bật</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Khám phá những cung trekking được yêu thích nhất, từ những đỉnh núi hùng vĩ đến các thung lũng xanh mướt.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featuredTrips.map((trip) => (
            <motion.div
              key={trip.id}
              variants={itemVariants}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border"
            >
              <div className="relative">
                <img
                  src={trip.image}
                  alt={trip.name}
                  className="w-full h-48 object-cover"
                />
                <Badge className={`absolute top-3 left-3 ${getDifficultyColor(trip.difficulty)}`}>
                  {difficultyLabels[trip.difficulty]}
                </Badge>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  {trip.location}
                </div>

                <h3 className="font-semibold text-lg mb-2 text-foreground">{trip.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{trip.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {trip.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {trip.totalSpots} người
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{formatPrice(trip.estimatedPrice)}đ</span>
                  <Link to={`/trip/${trip.id}`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Chi tiết
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link to="/trips">
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
              Xem tất cả cung đường
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
