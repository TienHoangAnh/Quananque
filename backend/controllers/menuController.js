const MenuItem = require('../models/MenuItem');

// @desc    Lấy tất cả món ăn trong thực đơn
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({});
    res.json(menuItems);
  } catch (error) {
    console.error('Lỗi lấy thực đơn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy chi tiết món ăn theo ID
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (menuItem) {
      res.json(menuItem);
    } else {
      res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }
  } catch (error) {
    console.error('Lỗi lấy chi tiết món ăn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Tạo món ăn mới
// @route   POST /api/menu
// @access  Private/Admin
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, costPrice, category, image, available, popular } = req.body;

    const menuItem = new MenuItem({
      name,
      description,
      price,
      costPrice,
      category,
      image: image || 'default-food.jpg',
      available: available !== undefined ? available : true,
      popular: popular !== undefined ? popular : false
    });

    const createdMenuItem = await menuItem.save();
    res.status(201).json(createdMenuItem);
  } catch (error) {
    console.error('Lỗi tạo món ăn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Cập nhật món ăn
// @route   PUT /api/menu/:id
// @access  Private/Admin
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, costPrice, category, image, available, popular } = req.body;

    const menuItem = await MenuItem.findById(req.params.id);

    if (menuItem) {
      menuItem.name = name || menuItem.name;
      menuItem.description = description || menuItem.description;
      menuItem.price = price || menuItem.price;
      menuItem.costPrice = costPrice || menuItem.costPrice;
      menuItem.category = category || menuItem.category;
      menuItem.image = image || menuItem.image;
      menuItem.available = available !== undefined ? available : menuItem.available;
      menuItem.popular = popular !== undefined ? popular : menuItem.popular;

      const updatedMenuItem = await menuItem.save();
      res.json(updatedMenuItem);
    } else {
      res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }
  } catch (error) {
    console.error('Lỗi cập nhật món ăn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Xóa món ăn
// @route   DELETE /api/menu/:id
// @access  Private/Admin
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (menuItem) {
      await menuItem.remove();
      res.json({ message: 'Đã xóa món ăn' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }
  } catch (error) {
    console.error('Lỗi xóa món ăn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 