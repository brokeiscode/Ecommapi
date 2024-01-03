const checkAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).send("Unauthorized access. Only Admin can do this");
  }
  next();
};

module.exports = checkAdmin;
