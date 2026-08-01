export const getHealthStatus = (_req, res) => {
  return res.status(200).json({
    status: 'OK',
  });
};
