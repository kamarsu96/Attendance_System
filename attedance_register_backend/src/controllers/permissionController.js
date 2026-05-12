const Permission = require('../repositories/permissionRepository');

const requestPermission = async (req, res) => {
  try {
    const { permission_date, start_time, end_time, reason } = req.body;
    const employee_id = req.userId;
    const permissionId = await Permission.create({ employee_id, permission_date, start_time, end_time, reason });
    res.status(201).send({ message: 'Permission requested', id: permissionId });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const approvePermission = async (req, res) => {
  try {
    await Permission.updateStatus(req.params.id, 'Approved');
    res.status(200).send({ message: 'Permission approved' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { requestPermission, getPermissions, approvePermission };
