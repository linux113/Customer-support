function notFound(req, res, next) {
  res.status(404).json({
    error: "Not Found",
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error("[api]", err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Internal Server Error" : err.message,
    message:
      status === 500
        ? "Something went wrong while talking to the database. Please try again."
        : err.message,
    details: err.details || undefined,
  });
}

module.exports = { notFound, errorHandler };
