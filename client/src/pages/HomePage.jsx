import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import Introduction from '../components/Introduction'
import FeatureCard from '../components/FeatureCard'
import HowitWorks from '../components/HowitWorks'
import Faq from '../components/Faq'
import Footer from '../components/Footer'

const HomePage = () => {
  return (
    <div>

        <Navbar/>
        <HeroSection/>
        <Introduction/>
        <FeatureCard/>
        <HowitWorks/>
        <Faq/>
        <Footer/>

    </div>
  )
}

export default HomePage