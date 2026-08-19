const crypto = require("crypto");

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function requireWrite(req, res, next) {
  const expected = process.env.WRITE_KEY || "";
  if (!expected) return next();

  const provided =
    req.get("x-write-key") ||
    (req.get("authorization") || "").replace(/^Bearer\s+/i, "");

  if (!provided || !safeEqual(provided, expected)) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "A valid write key is required to change tickets.",
    });
  }
  next();
}

module.exports = { requireWrite };
