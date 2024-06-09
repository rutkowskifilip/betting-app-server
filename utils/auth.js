const jwt = require("./jwt");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Nieuprawniony dostęp");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await jwt.verifyToken(token);
    if (!decoded) {
      return res.status(401).send("Nieuprawniony dostęp");
    }

    next();
  } catch (error) {
    return res.status(401).send("Nieuprawniony dostęp");
  }
};

module.exports = auth;
