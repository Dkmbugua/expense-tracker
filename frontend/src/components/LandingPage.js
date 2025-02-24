import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const testimonialsRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    document.title = "ExpenseTracker - Master Your Finances";
  }, []);

  return (
    <div className="landing-page">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-links">
          <button onClick={() => scrollToSection(homeRef)}>Home</button>
          <button onClick={() => scrollToSection(aboutRef)}>About</button>
          <button onClick={() => scrollToSection(testimonialsRef)}>Testimonials</button>
          <button onClick={() => scrollToSection(contactRef)}>Contact</button>
        </div>
      </nav>

      {/* Side Navigation */}
      <nav className="side-nav">
        <Link to="/signup" className="nav-button">Sign Up</Link>
        <Link to="/login" className="nav-button">Login</Link>
      </nav>

      {/* Sections */}
      <section ref={homeRef} className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Master Your Finances with ExpenseTracker</h1>
            <p className="hero-subtitle">
              Smart tools for budgeting, saving, and spending wisely—designed for Kenyan students!
            </p>
            <div className="cta-buttons">
              <Link to="/signup" className="cta-button primary">
                Get Started
              </Link>
              <Link to="/login" className="cta-button secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section ref={aboutRef} className="about">
        <div className="container">
          <h2>About ExpenseTracker</h2>
          <p>
            ExpenseTracker is your ultimate financial companion, built specifically for KCA University students and other Kenyan university learners. Since 2023, we’ve helped thousands of students—
          </p>
        </div>
      </section>

      <section ref={testimonialsRef} className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>"This app transformed my financial life!"</p>
            <h3>- Sarah Johnson</h3>
          </div>
          <div className="testimonial-card">
            <p>"Easy to use and incredibly effective!"</p>
            <h3>- Michael Lee</h3>
          </div>
        </div>
      </section>

      <footer ref={contactRef} className="contact">
        <div className="contact-info">
          <h3>Contact Us</h3>
          <p>Email: support@expensetracker.com</p>
          <p>Phone: +1-800-123-4567</p>
          <div className="social-links">
            <a href="#twitter"><i className="fab fa-twitter"></i></a>
            <a href="#facebook"><i className="fab fa-facebook"></i></a>
            <a href="#linkedin"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
        <p className="copyright">© 2025 ExpenseTracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;