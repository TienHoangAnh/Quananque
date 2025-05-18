const Reservation = require('../models/Reservation');

// @desc    Lấy tất cả đặt bàn
// @route   GET /api/reservations
// @access  Private
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({}).sort({ date: 1, time: 1 });
    res.json(reservations);
  } catch (error) {
    console.error('Lỗi lấy danh sách đặt bàn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy chi tiết đặt bàn theo ID
// @route   GET /api/reservations/:id
// @access  Private
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (reservation) {
      res.json(reservation);
    } else {
      res.status(404).json({ message: 'Không tìm thấy thông tin đặt bàn' });
    }
  } catch (error) {
    console.error('Lỗi lấy chi tiết đặt bàn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Tạo đặt bàn mới
// @route   POST /api/reservations
// @access  Public
exports.createReservation = async (req, res) => {
  try {
    const { customerName, phone, email, date, time, people, specialRequests } = req.body;

    if (!customerName || !phone || !date || !time || !people) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin cần thiết' });
    }

    const reservation = new Reservation({
      customerName,
      phone,
      email,
      date,
      time,
      people,
      specialRequests: specialRequests || '',
      status: 'pending'
    });

    const createdReservation = await reservation.save();
    res.status(201).json(createdReservation);
  } catch (error) {
    console.error('Lỗi tạo đặt bàn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Cập nhật trạng thái đặt bàn
// @route   PUT /api/reservations/:id
// @access  Private
exports.updateReservation = async (req, res) => {
  try {
    const { status, table, customerName, phone, email, date, time, people, specialRequests } = req.body;

    const reservation = await Reservation.findById(req.params.id);

    if (reservation) {
      reservation.status = status || reservation.status;
      reservation.table = table || reservation.table;
      reservation.customerName = customerName || reservation.customerName;
      reservation.phone = phone || reservation.phone;
      reservation.email = email || reservation.email;
      reservation.date = date || reservation.date;
      reservation.time = time || reservation.time;
      reservation.people = people || reservation.people;
      reservation.specialRequests = specialRequests !== undefined ? specialRequests : reservation.specialRequests;

      const updatedReservation = await reservation.save();
      res.json(updatedReservation);
    } else {
      res.status(404).json({ message: 'Không tìm thấy thông tin đặt bàn' });
    }
  } catch (error) {
    console.error('Lỗi cập nhật đặt bàn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Hủy đặt bàn
// @route   DELETE /api/reservations/:id
// @access  Private
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (reservation) {
      await reservation.remove();
      res.json({ message: 'Đã xóa đặt bàn' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy thông tin đặt bàn' });
    }
  } catch (error) {
    console.error('Lỗi xóa đặt bàn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 