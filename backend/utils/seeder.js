const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Reservation = require('../models/Reservation');
const Order = require('../models/Order');
const InventoryItem = require('../models/Inventory');
const Transaction = require('../models/Transaction');

// Kết nối cơ sở dữ liệu
connectDB();

// Xóa tất cả dữ liệu hiện có
const clearData = async () => {
  try {
    await User.deleteMany();
    await MenuItem.deleteMany();
    await Reservation.deleteMany();
    await Order.deleteMany();
    await InventoryItem.deleteMany();
    await Transaction.deleteMany();
    console.log('Đã xóa tất cả dữ liệu');
  } catch (error) {
    console.error('Lỗi khi xóa dữ liệu:', error);
    process.exit(1);
  }
};

// Tạo dữ liệu người dùng
const createUsers = async () => {
  try {
    const adminPin = await bcrypt.hash('123456', 10);
    const staffPin = await bcrypt.hash('123456', 10);

    const users = [
      {
        name: 'Quản Lý',
        phone: '0987654321',
        email: 'admin@quananque.com',
        role: 'admin',
        pin: adminPin
      },
      {
        name: 'Nhân Viên',
        phone: '0987654322',
        email: 'staff@quananque.com',
        role: 'staff',
        pin: staffPin
      },
      {
        name: 'Nguyễn Văn A',
        phone: '0987654323',
        email: 'nguyenvana@example.com',
        role: 'customer'
      }
    ];

    await User.insertMany(users);
    console.log('Đã tạo dữ liệu người dùng');
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu người dùng:', error);
    process.exit(1);
  }
};

// Tạo dữ liệu món ăn
const createMenuItems = async () => {
  try {
    const menuItems = [
      {
        name: 'Gà kho gừng',
        description: 'Gà ta kho với gừng, nước mắm, đường và gia vị đặc trưng.',
        price: 150000,
        costPrice: 100000,
        category: 'Món chính',
        image: 'ga-kho-gung.jpg',
        available: true,
        popular: true
      },
      {
        name: 'Cá kho tộ',
        description: 'Cá lóc kho trong tộ đất với nước dừa, nước mắm và tiêu.',
        price: 130000,
        costPrice: 85000,
        category: 'Món chính',
        image: 'ca-kho-to.jpg',
        available: true,
        popular: true
      },
      {
        name: 'Canh chua',
        description: 'Canh chua với cá lóc, đậu bắp, giá, me, rau thơm và gia vị.',
        price: 80000,
        costPrice: 50000,
        category: 'Món chính',
        image: 'canh-chua.jpg',
        available: true,
        popular: false
      },
      {
        name: 'Rau muống xào tỏi',
        description: 'Rau muống tươi xào với tỏi và dầu ăn.',
        price: 50000,
        costPrice: 25000,
        category: 'Món chính',
        image: 'rau-muong-xao-toi.jpg',
        available: true,
        popular: false
      },
      {
        name: 'Gỏi ngó sen tôm thịt',
        description: 'Gỏi với ngó sen giòn, tôm, thịt heo luộc và rau thơm.',
        price: 90000,
        costPrice: 60000,
        category: 'Khai vị',
        image: 'goi-ngo-sen.jpg',
        available: true,
        popular: true
      },
      {
        name: 'Chè sen long nhãn',
        description: 'Chè ngọt với hạt sen, long nhãn và đường phèn.',
        price: 40000,
        costPrice: 20000,
        category: 'Tráng miệng',
        image: 'che-sen.jpg',
        available: true,
        popular: false
      },
      {
        name: 'Nước sâm',
        description: 'Nước sâm mát với đá và các loại hạt.',
        price: 25000,
        costPrice: 10000,
        category: 'Đồ uống',
        image: 'nuoc-sam.jpg',
        available: true,
        popular: true
      },
      {
        name: 'Cơm niêu',
        description: 'Cơm được nấu trong niêu đất, thơm và dẻo.',
        price: 30000,
        costPrice: 15000,
        category: 'Món chính',
        image: 'com-nieu.jpg',
        available: true,
        popular: true
      },
      {
        name: 'Thịt kho tàu',
        description: 'Thịt ba chỉ kho với trứng, nước dừa và gia vị truyền thống.',
        price: 120000,
        costPrice: 80000,
        category: 'Món chính',
        image: 'thit-kho-tau.jpg',
        available: true,
        popular: true
      },
      {
        name: 'Trà đá',
        description: 'Trà tươi với đá.',
        price: 10000,
        costPrice: 3000,
        category: 'Đồ uống',
        image: 'tra-da.jpg',
        available: true,
        popular: true
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log('Đã tạo dữ liệu món ăn');
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu món ăn:', error);
    process.exit(1);
  }
};

// Tạo dữ liệu đặt bàn
const createReservations = async () => {
  try {
    // Lấy ngày hôm nay
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reservations = [
      {
        customerName: 'Nguyễn Văn A',
        phone: '0987654323',
        email: 'nguyenvana@example.com',
        date: today,
        time: '18:00',
        people: 4,
        specialRequests: 'Bàn gần cửa sổ',
        status: 'confirmed',
        table: 'Bàn 5'
      },
      {
        customerName: 'Trần Thị B',
        phone: '0987654324',
        email: 'tranthib@example.com',
        date: tomorrow,
        time: '19:00',
        people: 6,
        specialRequests: 'Có trẻ em',
        status: 'pending'
      },
      {
        customerName: 'Lê Văn C',
        phone: '0987654325',
        email: 'levanc@example.com',
        date: tomorrow,
        time: '12:00',
        people: 2,
        specialRequests: '',
        status: 'confirmed',
        table: 'Bàn 3'
      }
    ];

    await Reservation.insertMany(reservations);
    console.log('Đã tạo dữ liệu đặt bàn');
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu đặt bàn:', error);
    process.exit(1);
  }
};

// Tạo dữ liệu đơn hàng
const createOrders = async () => {
  try {
    // Lấy reservation đầu tiên để tạo đơn hàng liên kết
    const firstReservation = await Reservation.findOne({});
    
    // Lấy danh sách món ăn
    const menuItems = await MenuItem.find({});
    
    if (menuItems.length < 3) {
      throw new Error('Không đủ món ăn để tạo đơn hàng mẫu');
    }

    const orders = [
      {
        customerName: 'Nguyễn Văn A',
        phone: '0987654323',
        email: 'nguyenvana@example.com',
        items: [
          {
            menuItem: menuItems[0]._id,
            name: menuItems[0].name,
            price: menuItems[0].price,
            quantity: 1,
            note: 'Ít cay'
          },
          {
            menuItem: menuItems[1]._id,
            name: menuItems[1].name,
            price: menuItems[1].price,
            quantity: 1,
            note: ''
          }
        ],
        reservationId: firstReservation._id,
        totalAmount: menuItems[0].price + menuItems[1].price,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        serveTime: new Date(),
        note: ''
      },
      {
        customerName: 'Trần Thị B',
        phone: '0987654324',
        email: 'tranthib@example.com',
        items: [
          {
            menuItem: menuItems[2]._id,
            name: menuItems[2].name,
            price: menuItems[2].price,
            quantity: 2,
            note: ''
          },
          {
            menuItem: menuItems[3]._id,
            name: menuItems[3].name,
            price: menuItems[3].price,
            quantity: 1,
            note: ''
          }
        ],
        totalAmount: menuItems[2].price * 2 + menuItems[3].price,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: 'cash',
        note: 'Đặt hàng qua điện thoại'
      }
    ];

    await Order.insertMany(orders);
    console.log('Đã tạo dữ liệu đơn hàng');
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu đơn hàng:', error);
    process.exit(1);
  }
};

// Tạo dữ liệu hàng tồn kho
const createInventoryItems = async () => {
  try {
    const inventoryItems = [
      {
        name: 'Gạo',
        unit: 'kg',
        quantity: 50,
        costPerUnit: 15000,
        supplier: 'Cung cấp gạo Miền Tây',
        category: 'Nguyên liệu',
        minimumStock: 10
      },
      {
        name: 'Thịt heo',
        unit: 'kg',
        quantity: 15,
        costPerUnit: 120000,
        supplier: 'Lò mổ An Phú',
        category: 'Nguyên liệu',
        minimumStock: 5
      },
      {
        name: 'Thịt gà',
        unit: 'kg',
        quantity: 10,
        costPerUnit: 100000,
        supplier: 'Trại gà Tân Phú',
        category: 'Nguyên liệu',
        minimumStock: 3
      },
      {
        name: 'Rau muống',
        unit: 'kg',
        quantity: 8,
        costPerUnit: 15000,
        supplier: 'Vườn rau Hòa Bình',
        category: 'Nguyên liệu',
        minimumStock: 2
      },
      {
        name: 'Nước mắm',
        unit: 'chai',
        quantity: 20,
        costPerUnit: 30000,
        supplier: 'Đại lý gia vị Minh Hương',
        category: 'Gia vị',
        minimumStock: 5
      },
      {
        name: 'Coca Cola',
        unit: 'thùng',
        quantity: 5,
        costPerUnit: 180000,
        supplier: 'Đại lý nước giải khát Thành Công',
        category: 'Đồ uống',
        minimumStock: 2
      }
    ];

    await InventoryItem.insertMany(inventoryItems);
    console.log('Đã tạo dữ liệu hàng tồn kho');
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu hàng tồn kho:', error);
    process.exit(1);
  }
};

// Tạo dữ liệu giao dịch nhập xuất
const createTransactions = async () => {
  try {
    // Lấy admin user
    const admin = await User.findOne({ role: 'admin' });
    
    // Lấy danh sách hàng tồn kho
    const inventoryItems = await InventoryItem.find({});
    
    // Lấy một đơn hàng để tạo giao dịch xuất liên kết
    const order = await Order.findOne({});

    if (inventoryItems.length < 2) {
      throw new Error('Không đủ hàng tồn kho để tạo giao dịch mẫu');
    }

    const transactions = [
      {
        type: 'import',
        items: [
          {
            item: inventoryItems[0]._id,
            name: inventoryItems[0].name,
            quantity: 30,
            cost: 30 * inventoryItems[0].costPerUnit
          },
          {
            item: inventoryItems[1]._id,
            name: inventoryItems[1].name,
            quantity: 10,
            cost: 10 * inventoryItems[1].costPerUnit
          }
        ],
        totalAmount: 30 * inventoryItems[0].costPerUnit + 10 * inventoryItems[1].costPerUnit,
        note: 'Nhập hàng định kỳ',
        supplier: 'Nhà cung cấp ABC',
        createdBy: admin._id
      },
      {
        type: 'export',
        items: [
          {
            item: inventoryItems[0]._id,
            name: inventoryItems[0].name,
            quantity: 5,
            cost: 5 * inventoryItems[0].costPerUnit
          }
        ],
        totalAmount: 5 * inventoryItems[0].costPerUnit,
        note: 'Xuất cho đơn hàng',
        orderId: order._id,
        createdBy: admin._id
      }
    ];

    await Transaction.insertMany(transactions);
    console.log('Đã tạo dữ liệu giao dịch nhập xuất');
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu giao dịch:', error);
    process.exit(1);
  }
};

// Chạy các hàm tạo dữ liệu theo thứ tự
const importData = async () => {
  try {
    await clearData();
    await createUsers();
    await createMenuItems();
    await createReservations();
    await createInventoryItems();
    await createOrders();
    await createTransactions();

    console.log('Đã nhập dữ liệu thành công');
    process.exit();
  } catch (error) {
    console.error('Lỗi khi nhập dữ liệu:', error);
    process.exit(1);
  }
};

// Chạy script
importData(); 