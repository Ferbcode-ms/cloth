"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Eye, Download, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
}

interface Customer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  customer: Customer;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered";
  createdAt: string;
}

interface AdminOrdersClientProps {
  initialOrders: Order[];
}

export default function AdminOrdersClient({
  initialOrders,
}: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch orders with date filter
  const fetchOrders = async (date?: string) => {
    setLoading(true);
    try {
      const url = date ? `/api/admin/orders?date=${date}` : "/api/admin/orders";
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
        setSelectedOrders(new Set()); // Clear selections
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle date filter change
  const handleDateFilterChange = (date: string) => {
    setDateFilter(date);
    if (date) {
      fetchOrders(date);
    } else {
      fetchOrders();
    }
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Filter today's orders
  const filterTodayOrders = () => {
    const today = getTodayDate();
    setDateFilter(today);
    fetchOrders(today);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateFilter("");
    fetchOrders();
  };

  // Toggle order selection
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Select all orders
  const selectAllOrders = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o._id)));
    }
  };

  // Export orders to CSV
  const exportToCSV = (ordersToExport: Order[]) => {
    if (ordersToExport.length === 0) {
      toast.warning("No orders to export");
      return;
    }

    // CSV headers
    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Phone",
      "Email",
      "Address",
      "City",
      "State",
      "Pincode",
      "Items",
      "Total Amount",
      "Status",
    ];

    // Convert orders to CSV rows
    const rows = ordersToExport.map((order) => {
      const itemsStr = order.items
        .map(
          (item) =>
            `${item.title} (${item.color}, ${item.size}) x${item.quantity}`
        )
        .join("; ");

      return [
        order._id,
        new Date(order.createdAt).toLocaleString(),
        order.customer.name,
        order.customer.phone,
        order.customer.email || "",
        order.customer.address,
        order.customer.city,
        order.customer.state,
        order.customer.pincode,
        itemsStr,
        order.totalAmount.toString(),
        order.status,
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download today's orders
  const downloadTodayOrders = async () => {
    const today = getTodayDate();
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders?date=${today}`);
      const data = await response.json();
      if (response.ok && data.orders) {
        exportToCSV(data.orders);
      } else {
        toast.error("Failed to fetch today's orders");
      }
    } catch (error) {
      console.error("Error fetching today's orders:", error);
      toast.error("Failed to fetch today's orders");
    } finally {
      setLoading(false);
    }
  };

  // Download selected orders
  const downloadSelectedOrders = () => {
    const selected = orders.filter((order) => selectedOrders.has(order._id));
    exportToCSV(selected);
  };

  // Generate invoice HTML
  const generateInvoiceHTML = (order: Order): string => {
    const invoiceNumber = `INV-${order._id.slice(-8).toUpperCase()}`;
    const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Calculate subtotal (already in totalAmount, but showing for clarity)
    const subtotal = order.totalAmount;
    const tax = 0; // No tax currently
    const total = subtotal;

    // Payment due date (7 days from order date)
    const paymentDueDate = new Date(order.createdAt);
    paymentDueDate.setDate(paymentDueDate.getDate() + 7);
    const dueDateFormatted = paymentDueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const itemsHTML = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 500; color: #111827;">${item.title}</div>
          <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">
            ${item.color} - ${item.size}
          </div>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280;">
          ₹${item.price.toLocaleString("en-IN")}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500; color: #111827;">
          ₹${(item.price * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>
    `
      )
      .join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #fafafa;
      color: #111827;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 60px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 60px;
    }
    .logo {
      font-size: 72px;
      font-weight: 300;
      line-height: 1;
      color: #111827;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      font-size: 48px;
      font-weight: 700;
      letter-spacing: 2px;
      margin-bottom: 16px;
    }
    .invoice-info {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.8;
    }
    .billed-to {
      margin-bottom: 40px;
    }
    .billed-to h2 {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 16px;
      color: #111827;
    }
    .billed-to p {
      font-size: 14px;
      color: #374151;
      margin-bottom: 4px;
    }
    .separator {
      height: 1px;
      background-color: #e5e7eb;
      margin: 30px 0;
    }
    .items-table {
      width: 100%;
      margin: 30px 0;
    }
    .items-table thead th {
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      padding: 12px 0;
      border-bottom: 2px solid #e5e7eb;
    }
    .items-table thead th:last-child {
      text-align: right;
    }
    .items-table thead th:nth-child(2),
    .items-table thead th:nth-child(3) {
      text-align: center;
    }
    .summary {
      margin-top: 30px;
      text-align: right;
    }
    .summary-row {
      display: flex;
      justify-content: flex-end;
      padding: 8px 0;
      font-size: 14px;
    }
    .summary-label {
      width: 150px;
      text-align: right;
      color: #6b7280;
      padding-right: 20px;
    }
    .summary-value {
      width: 120px;
      text-align: right;
      color: #111827;
    }
    .summary-total {
      border-top: 2px solid #e5e7eb;
      padding-top: 12px;
      margin-top: 12px;
      font-weight: 700;
      font-size: 18px;
    }
    .summary-total .summary-label,
    .summary-total .summary-value {
      color: #111827;
    }
    .footer {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .thank-you {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 20px;
    }
    .payment-info h3 {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      color: #111827;
    }
    .payment-info p {
      font-size: 14px;
      color: #374151;
      margin-bottom: 4px;
    }
    .signature {
      text-align: right;
    }
    .signature-name {
      font-family: 'Brush Script MT', cursive;
      font-size: 24px;
      margin-bottom: 8px;
      color: #111827;
    }
    .signature-address {
      font-size: 12px;
      color: #6b7280;
      margin-top: 30px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .invoice-container {
        box-shadow: none;
        padding: 40px;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo">&</div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <div class="invoice-info">
          <div>Invoice No. ${invoiceNumber}</div>
          <div>${invoiceDate}</div>
        </div>
      </div>
    </div>

    <div class="billed-to">
      <h2>BILLED TO:</h2>
      <p><strong>${order.customer.name}</strong></p>
      <p>${order.customer.phone}</p>
      ${order.customer.email ? `<p>${order.customer.email}</p>` : ""}
      <p>${order.customer.address}</p>
      <p>${order.customer.city}, ${order.customer.state} ${
      order.customer.pincode
    }</p>
    </div>

    <div class="separator"></div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-row">
        <div class="summary-label">Subtotal</div>
        <div class="summary-value">₹${subtotal.toLocaleString("en-IN")}</div>
      </div>
      <div class="summary-row">
        <div class="summary-label">Tax (0%)</div>
        <div class="summary-value">₹${tax.toLocaleString("en-IN")}</div>
      </div>
      <div class="summary-row summary-total">
        <div class="summary-label">Total</div>
        <div class="summary-value">₹${total.toLocaleString("en-IN")}</div>
      </div>
    </div>

    <div class="footer">
      <div>
        <div class="thank-you">Thank you!</div>
        <div class="payment-info">
          <h3>PAYMENT INFORMATION</h3>
          <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
          <p><strong>Order Date:</strong> ${orderDate}</p>
          <p><strong>Payment Due:</strong> ${dueDateFormatted}</p>
          <p><strong>Order Status:</strong> ${order.status}</p>
        </div>
      </div>
      <div class="signature">
        <div class="signature-name">Your Store</div>
        <div class="signature-address">
          <p>E-commerce Store</p>
          <p>Contact us for any queries</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  };

  // Download invoice as PDF
  const downloadInvoice = (order: Order) => {
    const invoiceHTML = generateInvoiceHTML(order);
    const invoiceNumber = `INV-${order._id.slice(-8).toUpperCase()}`;

    // Create a new window with the invoice HTML
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.warning("Please allow pop-ups to download the invoice");
      return;
    }

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();

    // Wait for content to load, then print/save
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order");

      const { order } = await response.json();
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: order.status } : o
        )
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: order.status });
      }
      toast.success("Order status updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions: Order["status"][] = [
    "Pending",
    "Confirmed",
    "Packed",
    "Shipped",
    "Delivered",
  ];

  const getStatusVariant = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "outline";
      case "Confirmed":
        return "default";
      case "Packed":
        return "secondary";
      case "Shipped":
        return "default";
      case "Delivered":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div>
      <div className="flex justify-between flex-col sm:flex-row items-start sm:items-center mb-6">
        <h1 className="text-4xl font-bold text-textPrimary">Orders</h1>
        <div className="flex gap-2 flex-col sm:flex-row mt-2 sm:mt-0">
          <Button
            variant="outline"
            onClick={downloadTodayOrders}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Today's Orders
          </Button>
          <Button
            variant="outline"
            onClick={downloadSelectedOrders}
            disabled={selectedOrders.size === 0 || loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Selected ({selectedOrders.size})
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Filter by Date
              </label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                  className="max-w-xs"
                />
                <Button
                  variant="outline"
                  onClick={filterTodayOrders}
                  disabled={loading}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Today
                </Button>
                <Button
                  variant="ghost"
                  onClick={clearDateFilter}
                  disabled={!dateFilter || loading}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    orders.length > 0 && selectedOrders.size === orders.length
                  }
                  onCheckedChange={selectAllOrders}
                />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <p className="text-sm text-textSecondary">
                    {loading ? "Loading..." : "No orders found."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.has(order._id)}
                      onCheckedChange={() => toggleOrderSelection(order._id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {order._id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-textPrimary">
                      {order.customer.name}
                    </div>
                    <div className="text-sm text-textSecondary">
                      {order.customer.phone}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{order.totalAmount}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status) as any}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-textSecondary">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadInvoice(order)}
                        title="Download Invoice"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Invoice
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order._id, e.target.value)
                        }
                        disabled={updating}
                        className={cn(
                          "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                          "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-4xl font-serif font-light text-textPrimary">
                Order Details
              </CardTitle>
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    selectedOrder && downloadInvoice(selectedOrder)
                  }
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedOrder(null)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-light text-textSecondary mb-4">
                    Order Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xs text-textSecondary">
                      <span className="text-textPrimary">Order ID:</span>{" "}
                      {selectedOrder._id}
                    </p>
                    <div className="text-xs text-textSecondary flex items-center">
                      <span className="text-textPrimary">Status:</span>{" "}
                      <Badge
                        variant={getStatusVariant(selectedOrder.status) as any}
                        className="ml-2"
                      >
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-textSecondary">
                      <span className="text-textPrimary">Date:</span>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-textSecondary">
                      <span className="text-textPrimary">Total:</span> ₹
                      {selectedOrder.totalAmount}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-light text-textSecondary mb-4">
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xs text-textSecondary">
                      <span className="text-textPrimary">Name:</span>{" "}
                      {selectedOrder.customer.name}
                    </p>
                    <p className="text-xs text-textSecondary">
                      <span className="text-textPrimary">Phone:</span>{" "}
                      {selectedOrder.customer.phone}
                    </p>
                    {selectedOrder.customer.email && (
                      <p className="text-xs text-textSecondary">
                        <span className="text-textPrimary">Email:</span>{" "}
                        {selectedOrder.customer.email}
                      </p>
                    )}
                    <p className="text-xs text-textSecondary">
                      <span className="text-textPrimary">Address:</span>{" "}
                      {selectedOrder.customer.address}
                    </p>
                    <p className="text-xs text-textSecondary">
                      <span className="text-textPrimary">City:</span>{" "}
                      {selectedOrder.customer.city}
                    </p>
                    <p className="text-xs text-textSecondary">
                      <span className="text-textPrimary">State:</span>{" "}
                      {selectedOrder.customer.state}
                    </p>
                    <p className="text-xs text-textSecondary">
                      <span className="text-textPrimary">Pincode:</span>{" "}
                      {selectedOrder.customer.pincode}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-light text-textSecondary mb-4">
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p className="text-sm font-medium text-textPrimary mb-1">
                            {item.title}
                          </p>
                          <p className="text-xs text-textSecondary mb-2">
                            {item.color} - {item.size} × {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-textPrimary">
                            ₹{item.price * item.quantity}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
