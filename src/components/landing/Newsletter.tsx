import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

export const Newsletter = () => {
  return (
    <section className="py-20 bg-primary/10">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Sẵn sàng cho chuyến phiêu lưu tiếp theo?
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground mb-8"
          >
            Đăng ký nhận thông tin về các tour mới, ưu đãi đặc biệt, và mẹo trekking hữu ích từ BKTreking.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input 
              type="email" 
              placeholder="Nhập email của bạn"
              className="flex-1 bg-background"
            />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button className="bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4 mr-2" />
                Đăng ký
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm text-muted-foreground mt-4"
          >
            Chúng tôi cam kết bảo mật thông tin của bạn. Bạn có thể hủy đăng ký bất cứ lúc nào.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};
