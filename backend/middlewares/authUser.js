import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    console.log("=== AUTH MIDDLEWARE DEBUG ===");
    console.log("Headers received:", req.headers);
    console.log("Authorization header:", req.headers["authorization"]);
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      console.log("No authorization header found");
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please login again.",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted token:", token);
    
    if (!token) {
      console.log("No token found after splitting");
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please login again.",
      });
    }

    console.log("Attempting to verify token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded);
    
    // FIX: Set both req.user and req.userId
    req.user = { id: decoded.id };
    req.userId = decoded.id; // This was missing!
    
    console.log("Decoded userId:", decoded.id);
    console.log("Set req.user:", req.user);
    console.log("Set req.userId to:", req.userId);
    console.log("=== AUTH MIDDLEWARE SUCCESS ===");
    
    next();
  } catch (error) {
    console.log("=== AUTH MIDDLEWARE ERROR ===");
    console.log("Auth Error:", error.message);
    console.log("Error name:", error.name);
    if (error.name === 'JsonWebTokenError') {
      console.log("Invalid token format or signature");
    } else if (error.name === 'TokenExpiredError') {
      console.log("Token has expired");
    }
    console.log("=== END AUTH ERROR ===");
    
    res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token",
      error: error.message 
    });
  }
};

export { authUser };