import React from 'react'
import Header from '../Components/Header'

import TopDoctors from '../Components/TopDoctors'
import Banner from '../Components/Banner'
import WhyChooseUs from '../Components/Whychooseus'


const Home = () => {
  return (
    <>
      <Header />
      
      {/* <ServicesOffering/> */}
      {/* <SpecialityMenu /> */}
      <TopDoctors />
      <WhyChooseUs/>
      
      <Banner />
    </>
  )
}

export default Home