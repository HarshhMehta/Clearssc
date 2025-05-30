import jwt from "jsonwebtoken";

// admin authentication middleware with flexible token structure
const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Auth header:", authHeader); // Debug log
    
    if (!authHeader) {
      return res.json({
        success: false,
        message: "Not Authorised... Login again",
      });
    }

    // Check if header starts with "Bearer "
    if (!authHeader.startsWith("Bearer ")) {
      return res.json({
        success: false,
        message: "Invalid authorization format. Use 'Bearer <token>'",
      });
    }

    const adminToken = authHeader.split(" ")[1];
    console.log("Extracted token:", adminToken); // Debug log
    
    if (!adminToken || adminToken === "undefined" || adminToken === "null") {
      return res.json({
        success: false,
        message: "Not Authorised... No token provided",
      });
    }

    // Verify JWT secret exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not found in environment variables");
      return res.json({
        success: false,
        message: "Server configuration error",
      });
    }

    const tokenDecode = jwt.verify(adminToken, process.env.JWT_SECRET);
    console.log("=== FULL TOKEN DEBUG ===");
    console.log("Complete decoded token:", JSON.stringify(tokenDecode, null, 2));
    console.log("Environment ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
    console.log("======================");

    // More flexible validation - check multiple possible structures
    let tokenEmail = tokenDecode.email || tokenDecode.user || tokenDecode.adminEmail || tokenDecode.userEmail;
    let tokenRole = tokenDecode.role || tokenDecode.type || tokenDecode.userType;
    let isAdmin = tokenDecode.isAdmin;

    console.log("=== EXTRACTED VALUES ===");
    console.log("Token email:", tokenEmail);
    console.log("Token role:", tokenRole);
    console.log("Is admin flag:", isAdmin);
    console.log("=======================");

    // Check if we have valid admin credentials
    const isValidAdmin = (
      // Standard structure
      (tokenEmail === process.env.ADMIN_EMAIL && tokenRole === "admin") ||
      // Alternative structure with isAdmin flag
      (tokenEmail === process.env.ADMIN_EMAIL && isAdmin === true) ||
      // Another common structure
      (tokenEmail === process.env.ADMIN_EMAIL && tokenRole === "administrator")
    );

    if (!isValidAdmin) {
      console.log("=== VALIDATION FAILED ===");
      console.log("Expected email:", process.env.ADMIN_EMAIL);
      console.log("Token email:", tokenEmail);
      console.log("Expected role: admin (or isAdmin: true)");
      console.log("Token role:", tokenRole);
      console.log("Token isAdmin:", isAdmin);
      console.log("========================");
      
      return res.json({
        success: false,
        message: "Not Authorised... Invalid email or role",
      });
    }

    // Attach user info to request for use in next middleware/route
    req.admin = {
      email: tokenEmail,
      role: tokenRole || "admin",
      ...tokenDecode
    };
    
    console.log("✅ Admin authentication successful");
    next();
    
  } catch (error) {
    console.log("Auth error:", error);
    
    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.json({ 
        success: false, 
        message: "jwt malformed" 
      });
    } else if (error.name === "TokenExpiredError") {
      return res.json({ 
        success: false, 
        message: "Token expired" 
      });
    } else if (error.name === "NotBeforeError") {
      return res.json({ 
        success: false, 
        message: "Token not active" 
      });
    }
    
    res.json({ success: false, message: error.message });
  }
};

export { authAdmin };