import React from 'react';
import './ContactUs.css';

const ContactUs = () => (
  
    <div className="contact-page container">
      <h1>Contact Us</h1>
      <div className="contact-content">
        <section className="contact-info">
          <h2>Get in Touch</h2>
          <p>Email: support@toolify.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </section>
        <section className="contact-form">
          <h2>Send a Message</h2>
          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows="5" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </section>
      </div>
    </div>
    
);

export default ContactUs; 