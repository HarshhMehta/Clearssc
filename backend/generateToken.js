import jwt from 'jsonwebtoken';


const secret = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1IiwiaWF0IjoxNzQ3ODQzNTM1fQ.IoJPVgF6Qakj0UcjovumwsE_80BSiGRR9Ea_KaHUvDU"; // Apna JWT_SECRET (jo .env mein hai)

const token = jwt.sign({ id: userId }, secret);

console.log(token);
