import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderAPI.getOrders();
            setOrders(data);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="order-list">
            <h2>Danh sách đơn hàng</h2>
            {orders.length === 0 ? (
                <p>Không có đơn hàng nào.</p>
            ) : (
                <div className="orders-grid">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <h3>Đơn hàng #{order._id}</h3>
                            <p>Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p>Trạng thái: {order.status}</p>
                            <p>Tổng tiền: {order.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
                            <button 
                                onClick={() => window.location.href = `/orders/${order._id}`}
                                className="view-details-btn"
                            >
                                Xem chi tiết
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderList; 