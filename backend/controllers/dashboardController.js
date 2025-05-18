const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Reservation = require('../models/Reservation');
const Transaction = require('../models/Transaction');

// @desc    Lấy tổng quan doanh thu hôm nay
// @route   GET /api/dashboard/today
// @access  Private
exports.getTodayStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Lấy doanh thu hôm nay
    const orders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    const orderCount = orders.length;
    const paidOrders = orders.filter(order => order.paymentStatus === 'paid').length;

    // Lấy số lượng đặt bàn hôm nay
    const reservations = await Reservation.find({
      date: { $gte: today, $lt: tomorrow }
    });
    const reservationCount = reservations.length;

    res.json({
      date: today,
      totalRevenue,
      orderCount,
      paidOrders,
      reservationCount
    });
  } catch (error) {
    console.error('Lỗi lấy thống kê hôm nay:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy tổng quan doanh thu theo khoảng thời gian
// @route   GET /api/dashboard/revenue
// @access  Private
exports.getRevenueStats = async (req, res) => {
  try {
    const { period, start, end } = req.query;
    let startDate, endDate;

    // Xác định khoảng thời gian
    if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'custom' && start && end) {
      startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Mặc định 7 ngày gần nhất
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    // Lấy doanh thu trong khoảng thời gian
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: 1 });

    // Tính tổng doanh thu
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    
    // Nhóm theo ngày
    const revenueByDay = {};
    orders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (!revenueByDay[dateStr]) {
        revenueByDay[dateStr] = 0;
      }
      revenueByDay[dateStr] += order.totalAmount;
    });

    // Chuyển thành mảng để dễ xử lý ở frontend
    const revenueData = Object.keys(revenueByDay).map(date => ({
      date,
      revenue: revenueByDay[date]
    }));

    res.json({
      startDate,
      endDate,
      totalRevenue,
      orderCount: orders.length,
      revenueData
    });
  } catch (error) {
    console.error('Lỗi lấy thống kê doanh thu:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy món ăn bán chạy
// @route   GET /api/dashboard/top-items
// @access  Private
exports.getTopItems = async (req, res) => {
  try {
    const { limit = 5, period } = req.query;
    
    let dateFilter = {};
    if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateFilter = { createdAt: { $gte: today, $lt: tomorrow } };
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    // Lấy tất cả đơn hàng trong khoảng thời gian
    const orders = await Order.find(dateFilter);
    
    // Tính tổng số lượng mỗi món
    const itemCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const itemId = item.menuItem.toString();
        if (!itemCounts[itemId]) {
          itemCounts[itemId] = {
            id: itemId,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        itemCounts[itemId].quantity += item.quantity;
        itemCounts[itemId].revenue += item.quantity * item.price;
      });
    });

    // Chuyển thành mảng và sắp xếp
    const topItems = Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, parseInt(limit));

    res.json(topItems);
  } catch (error) {
    console.error('Lỗi lấy thống kê món ăn bán chạy:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy thống kê lợi nhuận
// @route   GET /api/dashboard/profit
// @access  Private
exports.getProfitStats = async (req, res) => {
  try {
    const { period } = req.query;
    
    let startDate, endDate;
    if (period === 'today') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Mặc định today
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    // Lấy doanh thu (đơn hàng đã thanh toán)
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'paid'
    });
    
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Lấy chi phí (giao dịch nhập hàng)
    const imports = await Transaction.find({
      type: 'import',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const totalCost = imports.reduce((acc, transaction) => acc + transaction.totalAmount, 0);

    // Tính lợi nhuận
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue * 100) : 0;

    res.json({
      period,
      startDate,
      endDate,
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin
    });
  } catch (error) {
    console.error('Lỗi lấy thống kê lợi nhuận:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 