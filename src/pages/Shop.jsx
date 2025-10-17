import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import axios from "axios";

export default function Shop() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Replace this with your real backend URL
    const PRODUCTS_API = "http://localhost:8080/CarAccessories/product/all";

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(PRODUCTS_API);
                setProducts(res.data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const renderCollection = (title, products) => (
        <div className="collection-box" key={title}>
            <h2 className="shop-title">{title}</h2>
            <div className="products-scroll">
                {products.map((prod) => (
                    <div key={prod.productId} className="product-card">
                        <div className="product-image-box">
                            <img
                                src={`http://localhost:8080/CarAccessories/uploads/images/${prod.imageURL}`} // <-- fixed here
                                alt={prod.name}
                                className="product-image"
                                onError={(e) => {
                                    e.target.src = "/placeholder.png"; // fallback image if broken
                                }}
                            />
                        </div>
                        <div className="product-info">
                            <h3>{prod.name}</h3>
                            <p>
                                <strong>Brand:</strong> {prod.brand}
                            </p>
                            <p>
                                <strong>Size:</strong> {prod.size}
                            </p>
                            <p>
                                <strong>Material:</strong> {prod.material}
                            </p>
                            <p>{prod.description}</p>
                            <p>R {Number(prod.price).toFixed(2)}</p>
                            <p>
                                <strong>Stock:</strong> {prod.stockQuantity}
                            </p>
                            <button className="add-to-cart" onClick={() => addToCart(prod)}>
                                ADD TO CART
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const grouped = products.reduce((acc, p) => {
        if (!p.category) p.category = "Uncategorized";
        acc[p.category] = acc[p.category] || [];
        acc[p.category].push(p);
        return acc;
    }, {});

    if (loading) return <p style={{ textAlign: "center" }}>Loading products...</p>;
    if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
    if (products.length === 0) return <p style={{ textAlign: "center" }}>No products found.</p>;

    return (
        <div className="shop-container">
            {Object.keys(grouped).map((cat) => renderCollection(cat, grouped[cat]))}

            <style>{`
            html, body, #root {
                    height: 100%;
                    margin: 0;
                    background-color: #f0f0f0;
                }
        .shop-container { padding: 20px; max-width: 1200px; margin: auto; }
        .collection-box { border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 15px 0; margin-bottom: 30px; }
        .shop-title { font-size: 24px; font-weight: bold; margin-bottom: 15px; text-align: center; }
        .products-scroll { display: flex; overflow-x: auto; gap: 20px; padding-bottom: 10px; scrollbar-width: none; }
        .products-scroll::-webkit-scrollbar { display: none; }
        .product-card { flex: 0 0 auto; width: 200px; background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; transition: transform 0.2s ease; }
        .product-card:hover { transform: translateY(-5px); }
        .product-image-box { width: 100%; height: 150px; border-radius: 8px; display: flex; justify-content: center; align-items: center; overflow: hidden; background-color: #f9f9f9; margin-bottom: 10px; }
        .product-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
        .product-image:hover { transform: scale(1.1); }
        .product-info { text-align: center; }
        .product-info h3 { font-size: 16px; font-weight: 600; margin-bottom: 5px; }
        .product-info p { color: #555; margin-bottom: 5px; }
        .add-to-cart { background: #09c; border: none; padding: 8px 12px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 3px 6px rgba(0,0,0,0.15); }
        .add-to-cart:hover { background: #0073aa; transform: translateY(-2px); }
        .add-to-cart:active { transform: scale(0.95); background: #0073aa; }
      `}</style>
        </div>
    );
}