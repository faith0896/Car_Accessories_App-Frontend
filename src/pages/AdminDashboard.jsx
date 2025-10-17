import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

function AdminDashboard() {
  const { user, token, isSuperAdminOrAdmin, logout } = useAuth();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // hover states
  const [hoverAdd, setHoverAdd] = useState(false);
  const [hoverDelete, setHoverDelete] = useState(null);

  const BASE_URL = "http://localhost:8080/CarAccessories";

  useEffect(() => {
    if (!isSuperAdminOrAdmin()) {
      logout();
      window.location.href = "/";
    }
  }, [isSuperAdminOrAdmin, logout]);

  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userList = Array.isArray(response.data)
        ? response.data
        : response.data.users || response.data.data || [];
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
        logout();
      } else setError("Failed to fetch users");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/product/all`);
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const handleAddProduct = async () => {
    if (!name || !brand || !category || !size || !material || !price || !stockQuantity || !description || !imageFile) {
      setError("Please fill in all fields including the image.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("brand", brand);
    formData.append("category", category);
    formData.append("size", size);
    formData.append("material", material);
    formData.append("price", parseFloat(price));
    formData.append("stockQuantity", parseInt(stockQuantity));
    formData.append("description", description);
    formData.append("file", imageFile);

    try {
      await axios.post(`${BASE_URL}/product/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Product added successfully!");
      setName("");
      setBrand("");
      setCategory("");
      setSize("");
      setMaterial("");
      setPrice("");
      setStockQuantity("");
      setDescription("");
      setImageFile(null);
      document.querySelector('input[type="file"]').value = "";
      fetchProducts();
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
        logout();
      } else setError("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${BASE_URL}/admin/user/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User deleted successfully.");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
        logout();
      } else if (err.response?.status === 400) alert("Cannot delete this user.");
      else setError("Failed to delete user.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${BASE_URL}/admin/product/delete/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Product deleted successfully.");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
        logout();
      } else setError("Failed to delete product.");
    }
  };

  const styles = {
    container: {
      display: "flex",
      gap: "2rem",
      padding: "2rem",
      color: "#000",
    },
    panel: {
      flex: 1,
      backgroundColor: "#f0f0f0",
      padding: "1rem",
      borderRadius: "8px",
      maxHeight: "80vh",
      overflowY: "auto",
    },
    form: {
      marginBottom: "2rem",
      padding: "1rem",
      backgroundColor: "#fafafa",
      borderRadius: "8px",
      maxWidth: "600px",
      margin: "0 auto",
    },
    input: {
      width: "100%",
      marginBottom: "0.5rem",
      padding: "0.5rem",
      borderRadius: "4px",
      border: "1px solid #ccc",
    },
    button: {
      width: "100%",
      padding: "0.7rem",
      backgroundColor: hoverAdd ? "#0073aa" : "#09c",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "background-color 0.2s",
    },
    listItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "0.5rem",
      padding: "0.5rem",
      backgroundColor: "#fff",
      borderRadius: "4px",
    },
    deleteBtn: (id) => ({
      backgroundColor: hoverDelete === id ? "#0073aa" : "#09c",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      padding: "0.4rem 0.8rem",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "background-color 0.2s",
    }),
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Admin Dashboard</h1>

      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#09c",
            padding: "1rem",
            margin: "1rem auto",
            maxWidth: "600px",
            borderRadius: "4px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      <div style={styles.form}>
        <h2>Add New Product</h2>
        <input style={styles.input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={styles.input} placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
        <input style={styles.input} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input style={styles.input} placeholder="Size" value={size} onChange={(e) => setSize(e.target.value)} />
        <input style={styles.input} placeholder="Material" value={material} onChange={(e) => setMaterial(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Stock Quantity" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
        <textarea style={styles.input} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input style={styles.input} type="file" onChange={handleImageChange} />

        <button
          style={styles.button}
          onMouseEnter={() => setHoverAdd(true)}
          onMouseLeave={() => setHoverAdd(false)}
          onClick={handleAddProduct}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </div>

      <div style={styles.container}>
        <div style={styles.panel}>
          <h2>All Users</h2>
          {users.map((u) => (
            <div key={u.id} style={styles.listItem}>
              <span>
                {u.username} ({u.role})
              </span>
              <button
                style={styles.deleteBtn(u.id)}
                onMouseEnter={() => setHoverDelete(u.id)}
                onMouseLeave={() => setHoverDelete(null)}
                onClick={() => handleDeleteUser(u.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div style={styles.panel}>
          <h2>All Products</h2>
          {products.map((p) => (
            <div key={p.id} style={styles.listItem}>
              <span>
                {p.name} (${p.price})
              </span>
              <button
                style={styles.deleteBtn(p.id)}
                onMouseEnter={() => setHoverDelete(p.id)}
                onMouseLeave={() => setHoverDelete(null)}
                onClick={() => handleDeleteProduct(p.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

