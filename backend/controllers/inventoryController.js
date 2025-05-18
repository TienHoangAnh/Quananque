const InventoryItem = require('../models/Inventory');
const Transaction = require('../models/Transaction');

// @desc    Lấy tất cả hàng tồn kho
// @route   GET /api/inventory
// @access  Private
exports.getInventory = async (req, res) => {
  try {
    const inventoryItems = await InventoryItem.find({}).sort({ category: 1, name: 1 });
    res.json(inventoryItems);
  } catch (error) {
    console.error('Lỗi lấy danh sách hàng tồn kho:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy chi tiết hàng tồn kho theo ID
// @route   GET /api/inventory/:id
// @access  Private
exports.getInventoryItemById = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id);
    if (inventoryItem) {
      res.json(inventoryItem);
    } else {
      res.status(404).json({ message: 'Không tìm thấy hàng tồn kho' });
    }
  } catch (error) {
    console.error('Lỗi lấy chi tiết hàng tồn kho:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Tạo hàng tồn kho mới
// @route   POST /api/inventory
// @access  Private
exports.createInventoryItem = async (req, res) => {
  try {
    const { name, unit, quantity, costPerUnit, supplier, category, minimumStock } = req.body;

    const inventoryItem = new InventoryItem({
      name,
      unit,
      quantity: quantity || 0,
      costPerUnit,
      supplier: supplier || '',
      category: category || 'Nguyên liệu',
      minimumStock: minimumStock || 5
    });

    const createdItem = await inventoryItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Lỗi tạo hàng tồn kho:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Cập nhật hàng tồn kho
// @route   PUT /api/inventory/:id
// @access  Private
exports.updateInventoryItem = async (req, res) => {
  try {
    const { name, unit, quantity, costPerUnit, supplier, category, minimumStock } = req.body;

    const inventoryItem = await InventoryItem.findById(req.params.id);

    if (inventoryItem) {
      inventoryItem.name = name || inventoryItem.name;
      inventoryItem.unit = unit || inventoryItem.unit;
      inventoryItem.quantity = quantity !== undefined ? quantity : inventoryItem.quantity;
      inventoryItem.costPerUnit = costPerUnit || inventoryItem.costPerUnit;
      inventoryItem.supplier = supplier !== undefined ? supplier : inventoryItem.supplier;
      inventoryItem.category = category || inventoryItem.category;
      inventoryItem.minimumStock = minimumStock || inventoryItem.minimumStock;

      const updatedItem = await inventoryItem.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Không tìm thấy hàng tồn kho' });
    }
  } catch (error) {
    console.error('Lỗi cập nhật hàng tồn kho:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Xóa hàng tồn kho
// @route   DELETE /api/inventory/:id
// @access  Private
exports.deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id);

    if (inventoryItem) {
      await inventoryItem.remove();
      res.json({ message: 'Đã xóa hàng tồn kho' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy hàng tồn kho' });
    }
  } catch (error) {
    console.error('Lỗi xóa hàng tồn kho:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Tạo giao dịch nhập hàng
// @route   POST /api/inventory/import
// @access  Private
exports.importInventory = async (req, res) => {
  try {
    const { items, totalAmount, note, supplier, createdBy } = req.body;
    console.log('Bắt đầu nhập kho:', { items: items.length, totalAmount, supplier });

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Vui lòng nhập danh sách hàng nhập' });
    }

    // Tạo transaction mới
    const transaction = new Transaction({
      type: 'import',
      items: [],
      totalAmount,
      note: note || 'Nhập kho'
    });

    // Đảm bảo dữ liệu hợp lệ trước khi lưu
    try {
      // Thêm supplier chỉ khi không phải null, undefined hoặc chuỗi rỗng
      if (supplier && supplier.trim() !== '') {
        transaction.supplier = supplier;
      }

      // Thêm createdBy nếu có
      if (createdBy) {
        transaction.createdBy = createdBy;
      }

      // Cập nhật số lượng trong kho và thêm vào transaction
      for (const item of items) {
        const inventoryItem = await InventoryItem.findById(item.item);
        if (!inventoryItem) {
          return res.status(404).json({ message: `Không tìm thấy hàng ${item.item}` });
        }

        // Thêm vào giao dịch
        transaction.items.push({
          item: inventoryItem._id,
          name: inventoryItem.name,
          quantity: item.quantity,
          cost: item.cost
        });

        // Cập nhật số lượng
        inventoryItem.quantity += item.quantity;
        await inventoryItem.save();
      }

      console.log('Đã cập nhật số lượng tồn kho, chuẩn bị lưu giao dịch nhập kho');
      const createdTransaction = await transaction.save();
      console.log('Đã lưu giao dịch nhập kho thành công với ID:', createdTransaction._id);
      res.status(201).json(createdTransaction);
    } catch (validationError) {
      console.error('Lỗi khi lưu giao dịch nhập kho:', validationError);
      return res.status(400).json({ 
        message: 'Lỗi dữ liệu khi lưu giao dịch nhập kho',
        error: validationError.message
      });
    }
  } catch (error) {
    console.error('Lỗi nhập hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Tạo giao dịch xuất hàng
// @route   POST /api/inventory/export
// @access  Private
exports.exportInventory = async (req, res) => {
  try {
    const { items, totalAmount, note, orderId, createdBy } = req.body;
    console.log('Bắt đầu xuất kho:', { items: items.length, totalAmount, note, orderId });

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Vui lòng nhập danh sách hàng xuất' });
    }

    // Tạo transaction mới
    const transaction = new Transaction({
      type: 'export',
      items: [],
      totalAmount,
      note: note || 'Xuất kho'
    });

    // Đảm bảo dữ liệu hợp lệ trước khi lưu
    try {
      // Thêm orderId chỉ khi không phải null, undefined hoặc chuỗi rỗng
      if (orderId && orderId.trim() !== '') {
        transaction.orderId = orderId;
      }

      // Thêm createdBy nếu có
      if (createdBy) {
        transaction.createdBy = createdBy;
      }

      // Cập nhật số lượng trong kho và thêm vào transaction
      for (const item of items) {
        const inventoryItem = await InventoryItem.findById(item.item);
        if (!inventoryItem) {
          return res.status(404).json({ message: `Không tìm thấy hàng ${item.item}` });
        }

        // Kiểm tra số lượng
        if (inventoryItem.quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Số lượng xuất ${item.quantity} vượt quá số lượng tồn kho ${inventoryItem.quantity} cho hàng ${inventoryItem.name}` 
          });
        }

        // Thêm vào giao dịch
        transaction.items.push({
          item: inventoryItem._id,
          name: inventoryItem.name,
          quantity: item.quantity,
          cost: inventoryItem.costPerUnit * item.quantity
        });

        // Cập nhật số lượng
        inventoryItem.quantity -= item.quantity;
        await inventoryItem.save();
      }

      console.log('Đã cập nhật số lượng tồn kho, chuẩn bị lưu giao dịch');
      const createdTransaction = await transaction.save();
      console.log('Đã lưu giao dịch thành công với ID:', createdTransaction._id);
      res.status(201).json(createdTransaction);
    } catch (validationError) {
      console.error('Lỗi khi lưu giao dịch xuất kho:', validationError);
      // Trả về thông báo lỗi chi tiết hơn
      return res.status(400).json({ 
        message: 'Lỗi dữ liệu khi lưu giao dịch',
        error: validationError.message
      });
    }
  } catch (error) {
    console.error('Lỗi xuất hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy tất cả giao dịch
// @route   GET /api/inventory/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    console.log('Đang lấy danh sách giao dịch...');
    const transactions = await Transaction.find({})
      .populate('createdBy', 'name')
      .populate('orderId', 'customerName')
      .sort({ createdAt: -1 });
    
    console.log(`Tìm thấy ${transactions.length} giao dịch`);
    console.log('Mẫu giao dịch:', transactions.length > 0 ? JSON.stringify(transactions[0]) : 'Không có giao dịch');
    
    res.json(transactions);
  } catch (error) {
    console.error('Lỗi lấy danh sách giao dịch:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 