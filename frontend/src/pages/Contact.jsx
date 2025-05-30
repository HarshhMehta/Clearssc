import React from "react";
import { assets } from "../assets/assets_frontend/assets";

const Contact = () => {
  return (
    <>
      <div className="mx-16 sm:mx-24 md:mx-28 lg:mx-32 overflow-x-hidden">
        <div className="text-center text-2xl text-gray-500 pt-10">
          <p>
            CONTACT <span className="text-gray-700 font-semibold ">US</span>
          </p>
        </div>
        <div className="flex flex-col justify-center my-10 md:flex-row gap-10 mb-28 text-sm">
          <img
            className="w-full max-w-[360px]"
            src={assets.contact_image}
            alt=""
          />
          <div className="flex flex-col justify-center items-start  gap-6">
            <p className="text-gray-600 text-lg font-semibold">Our OFFICE</p>
            <p className="text-gray-500">
            Offers convenient Screening MRI scans in the heart of downtown Toronto. Our location is easily accessible and our team is dedicated to providing top-notch service.
            </p>
            <p className="text-gray-500">
              Tel: (415) 555‑0132 <br /> Email: expample@gmail.com{" "}
            </p>
            <p className="text-gray-600 text-lg font-semibold">
              Careers at ClearScan{" "}
            </p>
            <p className="text-gray-500">
              {" "}
              Learn more about our teams and job openings.
            </p>
           
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
