import React from "react";
import { assets } from "../assets/assets_frontend/assets";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div
      style={{ backgroundColor: "rgb(20, 27, 49)" }}
      className="text-white px-10 py-16"
    >
      <div className="max-w-7xl mb-20 w-full font-bold mx-auto">
        
        {/* About Us Heading */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl sm:text-4xl font-extrabold mb-12"
        >
          <p>
            ABOUT <span className="text-green-300">US</span>
          </p>
        </motion.div>

        {/* About Us Content */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">
          <motion.img
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[360px] rounded-xl shadow-lg"
            src={assets.about_image}
            alt="About ClearScan"
          />

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col text-lg gap-6 md:w-2/4 text-gray-300"
          >
            <p className="text-center md:text-left">
              At <span className="text-green-300 font-semibold">ClearScan</span>, we are committed to making advanced medical imaging accessible, with a focus on preventative care and patient-centered service. Our comprehensive MRI packages are designed to detect potential health issues early, empowering you to take control of your health.
            </p>
            <p className="text-center md:text-left">
              With expert radiologists, state-of-the-art technology, and easy online appointment booking, we ensure accurate results and a seamless experience from start to finish.
            </p>

            <motion.b 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-2xl text-white text-center md:text-left"
            >
              Our Vision
            </motion.b>
            <p className="text-gray-300 text-center md:text-left">
              Our vision at <span className="text-green-300 font-semibold">ClearScan</span> is to provide access to advanced medical imaging services that prioritize preventative health and patient-centered care.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;