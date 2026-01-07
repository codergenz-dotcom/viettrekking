import { Shield, Award, Headphones, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: UserCheck,
    title: "Hướng dẫn viên chuyên nghiệp",
    description: "Đội ngũ hướng dẫn viên giàu kinh nghiệm, am hiểu địa hình và văn hóa địa phương."
  },
  {
    icon: Shield,
    title: "An toàn là trên hết",
    description: "Trang bị đầy đủ thiết bị an toàn, bảo hiểm và quy trình xử lý tình huống khẩn cấp."
  },
  {
    icon: Award,
    title: "Chất lượng hàng đầu",
    description: "Cam kết mang đến trải nghiệm tốt nhất với dịch vụ chuyên nghiệp và tận tâm."
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    description: "Luôn sẵn sàng hỗ trợ bạn mọi lúc, từ lúc đặt tour đến khi hoàn thành hành trình."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5 }
  }
};

export const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tại sao chọn <span className="text-primary">VietTrekking</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Với hơn 10 năm kinh nghiệm, chúng tôi tự hào là đơn vị hàng đầu trong lĩnh vực trekking và du lịch mạo hiểm tại Việt Nam.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group text-center p-6 bg-background rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: index * 0.1 }}
                className="w-16 h-16 bg-primary/10 group-hover:bg-primary rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300"
              >
                <feature.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
              </motion.div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
