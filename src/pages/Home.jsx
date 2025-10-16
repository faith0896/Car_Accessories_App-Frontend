import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import hook
import Home1 from "../Images/Home1.jpg";
import Home2 from "../Images/Home2.jpg";

export default function Home() {
    const images = [Home1, Home2];
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate(); //  Initialize navigate

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    const handleShopNow = () => {
        navigate("/shop"); //  Navigate to /shop
    };

    return (
        <>
            {/* Notification Bar */}
            <div className="notification-bar">
                We are available 24/7. Need help?
            </div>

            {/* Header */}
            <header className="header">
                <div className="logo">Car Accessories Store</div>
            </header>

            {/* Main Banner */}
            <section className="main-banner">
                <div className="banner-text">
                    <div className="small-text">WEEKEND SPECIAL OFFER</div>
                    <h1>
                        PREMIUM QUALITY <br />
                        CAR PARTS & ACCESSORIES
                    </h1>
                    <p>Your one-stop shop for all car essentials</p>
                    <button className="shop-now-btn" onClick={handleShopNow}>
                        Shop Now
                    </button>
                </div>
                <div className="banner-image">
                    <img src={images[currentIndex]} alt="Banner" />
                </div>
            </section>

            <style>
                {`
          .notification-bar {
            background-color: transparent;
            color: black;
            text-align: center;
            padding: 6px 0;
            font-size: 0.9rem;
            font-weight: 600;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 40px;
            background: white;
            color: black;
            font-weight: bold;
            font-family: Arial, sans-serif;
          }

          .logo {
            font-size: 1.2rem;
            color: black;
          }

          .main-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 30px 40px;
            background: white;
          }

          .banner-text {
            max-width: 50%;
          }

          .small-text {
            font-size: 0.8rem;
            color: #777;
            letter-spacing: 2px;
            margin-bottom: 10px;
            font-weight: 600;
          }

          .main-banner h1 {
            font-size: 2.8rem;
            font-weight: 900;
            margin-bottom: 15px;
            color: black;
          }

          .main-banner p {
            font-size: 1.2rem;
            margin-bottom: 25px;
            color: #333;
          }

          .shop-now-btn {
            background-color: transparent;
            color: black;
            padding: 10px 22px;
            border: 1px solid black;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s ease;
          }

          .shop-now-btn:hover {
            background-color: black;
            color: white;
          }

          .banner-image img {
            width: 400px;
            border-radius: 10px;
          }

          @media(max-width: 900px) {
            .main-banner {
              flex-direction: column;
              text-align: center;
            }

            .banner-text, .banner-image {
              max-width: 100%;
            }

            .banner-image img {
              width: 100%;
              max-width: 350px;
              margin-top: 20px;
            }
          }
        `}
            </style>
        </>
    );
}
