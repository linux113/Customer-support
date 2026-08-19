function notFound(req, res) {
  res.status(404).json({
    error: "Not Found",
    message: "That resource does not exist.",
  });
}

function errorHandler(err, req, res, next) {
  console.error("[api]", err && err.message ? err.message : err);

  if (res.headersSent) {
    return next(err);
  }

  const status = Number(err.status) || 500;
  const safeClientStatus = status >= 400 && status < 500 ? status : 500;

  res.status(safeClientStatus).json({
    error: safeClientStatus === 500 ? "Internal Server Error" : "Request Error",
    message:
      safeClientStatus === 500
        ? "Something went wrong. Please try again."
        : err.message || "Invalid request.",
  });
}

module.exports = { notFound, errorHandler };
