module.exports = (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AMN Recruiter Dashboard API',
    version: '1.0.0'
  });
};
