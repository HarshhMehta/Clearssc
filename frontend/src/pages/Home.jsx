import React from 'react'
import Header from '../Components/Header'
import TopDoctors from '../Components/TopDoctors'
import Banner from '../Components/Banner'
import WhyChooseUs from '../Components/Whychooseus'
import About from './About'
import FAQ from '../Components/faq'
import Contact from './Contact'

const Home = () => {
  return (
    <>
      <section id="header" className="scroll-mt-24">
        <Header />
      </section>
      
      <section id="about">
        <About />
      </section>
      
      <section id="services" className="scroll-mt-24">
        <TopDoctors />

      </section>
      <section id="WhyChooseUs" className="scroll-mt-24">

        <WhyChooseUs />
      </section>
      
      <section id="faq" className="scroll-mt-24">
        <FAQ />
      </section>
      <section id="contact" className="scroll-mt-24">
        <Contact />
      </section>
      <section id="" className="scroll-mt-24">
        <Banner />
      </section>
     
    </>
  )
}

export default Home