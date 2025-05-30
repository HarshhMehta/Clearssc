import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 },
  }),
};

const ServiceCard = ({ title, price, description, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={cardVariants}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 8px 20px rgba(208, 224, 87, 0.3)",
      }}
      style={{ backgroundColor: "#141B31" }}
      className="rounded-lg shadow-md p-6 border border-gray-200 transition-all flex flex-col justify-between"
    >
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p style={{ color: "#D0E057" }} className="text-2xl font-bold mb-3">
          ${price}
        </p>
        <p className="text-white mb-6">{description}</p>
      </div>

      <motion.button
        onClick={() => {
          navigate("/doctors");
          window.scrollTo(0, 0);
        }}
        whileHover={{
          scale: 1.07,
          boxShadow: "0 8px 20px rgba(208, 224, 87, 0.4)",
        }}
        whileTap={{ scale: 0.95 }}
        style={{ backgroundColor: "#D0E057" }}
        className="text-black font-bold py-3 px-6 rounded-full transition-all self-start"
      >
        Book Now
      </motion.button>
    </motion.div>
  );
};

const ServicesOffering = () => {
  const services = [
    {
      id: 1,
      title: "Whole Body MRI - Standard",
      price: "2800",
      description: "Head, Neck, Chest, Abdomen, Pelvis and Spine",
    },
    {
      id: 2,
      title: "Whole Body MRI - Plus",
      price: "3200",
      description: "Head, Neck, Chest, Abdomen, Pelvis, Spine and Knees",
    },
    {
      id: 3,
      title: "Whole Body MRI - Light",
      price: "2500",
      description: "Head, Neck, Chest, Abdomen and Pelvis",
    },
    {
      id: 4,
      title: "Prostate MRI",
      price: "1750",
      description: "Screening for Prostate Cancer",
    },
    {
      id: 5,
      title: "Breast MRI",
      price: "1750",
      description: "Screening for Breast Cancer in risk females",
    },
    {
      id: 6,
      title: "Cardiac Calcium Score",
      price: "800",
      description: "Screening for Coronary Artery Disease",
    },
  ];

  return (
    <div style={{ backgroundColor: "white" }} className="w-full   mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <h2 className="text-3xl mt-20 font-bold text-black mb-4">
          Explore Our Offerings
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Comprehensive MRI services tailored to your health needs
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            price={service.price}
            description={service.description}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default ServicesOffering;
