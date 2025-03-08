import React from 'react';
import './About.css'; // Assuming you have a CSS file for styling

const AboutUs = () => (
  <div className="about-page container">
    <h1>About Us</h1>
    <section className="about-intro">
      <p>
        Welcome to Toolifye Online! We are dedicated to providing high-quality online tools that help you streamline your workflow, boost productivity, and achieve your goals. Our mission is to empower users by offering intuitive, reliable, and innovative solutions tailored to your needs.
      </p>
    </section>
    <section className="about-team">
      <h2>Our Team</h2>
      <p>
        Our team consists of experienced professionals in software development, design, and customer support. We are passionate about technology and committed to delivering the best experience possible.
      </p>
    </section>
    <section className="about-values">
      <h2>Our Values</h2>
      <ul>
        <li><strong>Innovation:</strong> Continuously evolving our tools to meet your changing needs.</li>
        <li><strong>Quality:</strong> Prioritizing user experience and reliability in every product we offer.</li>
        <li><strong>Transparency:</strong> Ensuring clear communication and honesty in all our operations.</li>
      </ul>
    </section>
    <section className="about-goals">
      <h2>Our Goals</h2>
      <p>
        We aim to become your trusted partner in digital productivity, constantly improving and expanding our toolset to serve a growing community of users around the globe.
      </p>
    </section>
    <section className="about-mission">
      <h2>Our Mission</h2>
      <p>
        Our mission is to provide accessible and effective online tools that enhance productivity and creativity for individuals and businesses alike. We strive to create a user-friendly environment that fosters innovation and collaboration.
      </p>
    </section>
    <section className="about-vision">
      <h2>Our Vision</h2>
      <p>
        We envision a world where technology seamlessly integrates into everyday tasks, empowering users to achieve their full potential. Our goal is to lead the way in providing tools that are not only functional but also enjoyable to use.
      </p>
    </section>
  </div>
);

export default AboutUs;
