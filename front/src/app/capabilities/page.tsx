'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CapabilitiesPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        /* === FIXES === */
        /* Remove default margin and padding from all elements */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Ensure html takes up the full viewport height and remove scrollbars on the body itself */
        html {
          height: 100%;
        }
        
        body {
          overflow-x: hidden; /* Prevents horizontal scrolling */
          /* Don't set height constraint on body to allow vertical scrolling */
        }

        @import url('https://fonts.googleapis.com/css?family=Courgette|Roboto');

        /* Global styles */
        p {
          font-family: 'Roboto', sans-serif;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        blockquote {
          position: relative;
          padding-left: 1.5rem;
          font-family: 'Courgette', serif;
          font-size: 2rem;
          line-height: 1.25;
          letter-spacing: -0.05rem;
        }

        blockquote:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 6px;
          height: 100%;
          background-color: #10b981;
          border-radius: 60px;
        }

        /* Fixed background image element */
        figure {
          display: flex;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
        }

        /* Hero section */
        .hero {
          position: relative;
          width: 100vw;
          height: 100vh;
        }

        .hero:nth-child(1) figure {
          background-image: url('/agriculture-analysis.jpg');
        }

        .hero:nth-child(2) figure {
          background-image: url('/drought-detection.jpg');
        }

        .hero:nth-child(3) figure {
          background-image: url('/urban-growth.jpg');
        }

        .hero:nth-child(4) figure {
          background-image: url('/deforestation-monitoring.jpg');
        }

        .hero-inner {
          position: absolute;
          overflow: hidden;
          width: 100%;
          height: 100%;
          clip: rect(0, auto, auto, 0);
        }

        @supports (-webkit-overflow-scrolling: touch) {
          .hero-inner {
            clip: unset;
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
          }
        }

        .hero__title {
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: 0;
          left: 0;
          padding: 0 1rem;
          width: 100%;
          height: 100%;
          color: white;
          font-family: 'Courgette', serif;
          font-size: 8vw;
          letter-spacing: -0.125rem;
          text-align: center;
        }

        @media (min-width: 1200px) {
          .hero__title {
            font-size: 6rem;
          }
        }

        /* Content section */
        .content {
          position: relative;
          margin: 0 auto 8rem;
          padding: 2rem;
          background-color: white;
        }

        .content:before {
          content: '';
          display: block;
          position: absolute;
          top: -100px;
          left: 0;
          width: 100%;
          height: 100px;
          background-color: white;
          z-index: 99;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }

        .content__inner {
          margin: 0 auto;
          max-width: 700px;
        }

        .content__inner > *+* {
          margin-top: 1.5rem;
        }

        .content__inner > blockquote {
          margin: 3rem 0;
        }

        .content__title {
          font-family: 'Courgette', serif;
          font-size: 3rem;
          line-height: 1.25;
          letter-spacing: -0.125rem;
          text-align: center;
        }

        @media (min-width: 600px) {
          .content__title {
            font-size: 4rem;
          }
        }

        .content__author {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4rem;
          width: 100%;
          font-family: 'Courgette', serif;
          font-size: 1.5rem;
          letter-spacing: -0.125rem;
          text-align: center;
        }

        .content__author:before,
        .content__author:after {
          content: '';
          flex: 1;
          height: 2px;
          background-color: #10b981;
        }

        .content__author:before {
          margin-right: 1rem;
        }

        .content__author:after {
          margin-left: 1rem;
        }
      `}</style>
      
      <section className="hero">
        <div className="hero-inner" id="section-0">
          <figure></figure>
          <h2 className="hero__title">Monitor Crop Health at Scale</h2>
        </div>
      </section>
      
      <section className="hero">
        <div className="hero-inner" id="section-1">
          <figure></figure>
          <h2 className="hero__title">Detect Water Stress Before Crisis</h2>
        </div>
      </section>
      
      <section className="hero">
        <div className="hero-inner" id="section-2">
          <figure></figure>
          <h2 className="hero__title">Track Urban Development Patterns</h2>
        </div>
      </section>
      
      <section className="hero">
        <div className="hero-inner" id="section-3">
          <figure></figure>
          <h2 className="hero__title">Protect Forests with Early Detection</h2>
        </div>
      </section>
      
      <section className="content">
        <article className="content__inner">
          <h1 className="content__title">How Misbar Africa Transforms Satellite Data into Actionable Intelligence</h1>
          <h3 className="content__author">By Misbar Africa Team</h3>

          <p>Misbar Africa harnesses the power of Earth observation satellites to provide comprehensive environmental analysis across the African continent. Our platform integrates multiple data sources and advanced analytical techniques to deliver insights that drive informed decision-making for agriculture, conservation, urban planning, and resource management.</p>

          <p>Using Copernicus Sentinel-2 satellite imagery, we process multispectral data through sophisticated algorithms to calculate vegetation health indices, detect environmental changes, and identify patterns invisible to the human eye. Our system provides real-time monitoring capabilities with historical context, enabling users to understand not just current conditions, but trends over time.</p>

          <p>The platform's strength lies in its ability to transform complex satellite data into intuitive visualizations and actionable insights. Whether you're a farmer monitoring crop health, a conservationist tracking deforestation, or an urban planner managing development, our tools provide the specific intelligence needed for your unique requirements.</p>

          <p>Our artificial intelligence integration takes analysis further by interpreting patterns, predicting trends, and providing recommendations based on decades of environmental data. This AI-powered insight helps users anticipate challenges and opportunities before they become apparent through traditional monitoring methods.</p>
          
          <blockquote>We don't just show you satellite images - we help you understand what they mean for your specific needs and goals.</blockquote>

          <p>The technology behind Misbar Africa combines multiple spectral indices including NDVI for vegetation health, NDWI for water content, EVI for enhanced vegetation analysis, and thermal imaging for surface temperature monitoring. Each index provides a different lens through which to understand environmental conditions and changes.</p>

          <p>By making this powerful technology accessible through an intuitive web platform, we're democratizing environmental intelligence across Africa. Organizations of all sizes can now access the same level of satellite analysis previously available only to large government agencies and multinational corporations.</p>
          
          <p>Our commitment is to continue advancing these capabilities, integrating new data sources, and developing specialized tools for different African contexts and challenges. The future of environmental management is data-driven, and Misbar Africa is making that future accessible today.</p>
          
          <blockquote>Every pixel tells a story - we help you read it.</blockquote>

          <p>Join us in harnessing the power of satellite technology to build a more sustainable, resilient, and prosperous Africa. Whether you're monitoring agricultural lands, protecting natural resources, or planning urban development, Misbar Africa provides the intelligence you need to make informed, data-driven decisions.</p>

          <p>The platform is designed for scalability, serving individual researchers, small organizations, and large institutions alike. Our flexible architecture ensures that as your needs grow, our capabilities grow with you, providing increasingly sophisticated analysis and deeper insights over time.</p>
        </article>
      </section>
    </>
  )
}