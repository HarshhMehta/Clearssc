import React from "react";
import { assets } from "../assets/assets_frontend/assets";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div
      style={{ backgroundColor: "rgb(20, 27, 49)" }}
      className="min-h-screen text-white px-10 py-5 flex flex-col justify-center items-center"
    >
      <div className="max-w-7xl w-full font-bold flex flex-col items-center">
        
        {/* About Us Heading */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl mt-10 sm:text-4xl font-extrabold mb-12"
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
              className="text-2xl text-white mt-4 text-center md:text-left"
            >
              Our Vision
            </motion.b>
            <p className="text-gray-300 text-center md:text-left">
              Our vision at <span className="text-green-300 font-semibold">ClearScan</span> is to provide access to advanced medical imaging services that prioritize preventative health and patient-centered care.
            </p>
          </motion.div>
        </div>

        {/* Why Choose Us */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-3xl mt-28"
        >
          <p>
            Why <span className="text-green-300 font-semibold">Choose Us</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 text-gray-300 w-full max-w-5xl justify-items-center">
          {[
            {
              title: "Preventative Care",
              desc: "Our Screening MRI scans help detect potential health issues before they become serious.",
            },
            {
              title: "Accurate Results",
              desc: "Our experienced Radiologists and advanced technology ensure accurate and timely results.",
            },
            {
              title: "Comprehensive Scans",
              desc: "We offer a range of preventative scans to meet your specific health needs.",
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="border border-gray-600 p-8 rounded-xl bg-white/5 hover:bg-green-400 hover:text-white transition-all duration-300 shadow-lg max-w-xs w-full"
            >
              <h3 className="text-xl font-semibold mb-3 text-center">{card.title}</h3>
              <p className="text-center">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
