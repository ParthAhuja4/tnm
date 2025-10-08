import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ORDERS, type Order } from "../data/orders";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const OrdersListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") ?? ""
  );
  const [paymentStatus, setPaymentStatus] = useState(
    () => searchParams.get("paymentStatus") ?? ""
  );

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    return ORDERS.filter((order) => {
      const matchesStatus = paymentStatus
        ? order.paymentStatus === paymentStatus
        : true;
      const matchesSearch = normalizedSearch
        ? [
            order.id,
            order.orderNumber,
            order.customer.name,
            order.customer.email,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [searchValue, paymentStatus]);

  const totals = useMemo(() => {
    const ordersToday = ORDERS.length;
    const amountToday = ORDERS.reduce((acc, order) => acc + order.amount, 0);
    return {
      ordersToday,
      amountToday,
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    }
    if (paymentStatus) {
      params.set("paymentStatus", paymentStatus);
    }
    setSearchParams(params);
  };

  const handleRowClick = (order: Order) => {
    navigate(order.id);
  };

  return (
    <div className="d-flex flex-column flex-column-fluid gap-6">
      <div id="kt_app_toolbar" className="app-toolbar d-flex pb-3 pb-lg-5">
        <div className="d-flex flex-stack flex-row-fluid">
          <div className="d-flex flex-column flex-row-fluid">
            <div className="page-title d-flex align-items-center me-3">
              <h1 className="page-heading d-flex flex-column justify-content-center text-gray-900 fw-bold fs-lg-2x gap-2">
                <span>Orders</span>
              </h1>
            </div>
            <ul className="breadcrumb breadcrumb-separatorless fw-semibold mb-3 fs-7">
              <li className="breadcrumb-item text-gray-700 fw-bold lh-1">
                <Link
                  to="../dashboard"
                  className="text-gray-700 text-hover-primary"
                  relative="path"
                >
                  <i className="ki-outline ki-home text-gray-700 fs-6" />
                </Link>
              </li>
              <li className="breadcrumb-item">
                <i className="ki-outline ki-right fs-7 text-gray-700 mx-n1" />
              </li>
              <li className="breadcrumb-item text-gray-700 fw-bold lh-1">
                Dashboard
              </li>
              <li className="breadcrumb-item">
                <i className="ki-outline ki-right fs-7 text-gray-700 mx-n1" />
              </li>
              <li className="breadcrumb-item text-gray-700 fw-bold lh-1">
                Orders
              </li>
              <li className="breadcrumb-item">
                <i className="ki-outline ki-right fs-7 text-gray-700 mx-n1" />
              </li>
              <li className="breadcrumb-item text-gray-700">Orders List</li>
            </ul>
          </div>
          <div className="d-flex align-self-center flex-center flex-shrink-0">
            <button
              type="button"
              className="btn btn-sm ms-3 px-4 py-3 !text-black !bg-gray-400 hover:!bg-black hover:!text-white"
            >
              Update <span className="d-none d-sm-inline">Order</span>
            </button>
          </div>
        </div>
      </div>

      <div id="kt_app_content" className="app-content flex-column-fluid">
        <div className="card card-flush">
          <div className="card-header align-items-center py-5 gap-2 gap-md-5">
            <div className="d-flex">
              <div className="border border-gray-300 border-dashed rounded min-w-200px w-200 py-2 px-4 me-6">
                <span className="fs-8 text-gray-500 fw-bold">
                  Today&apos;s Orders
                </span>
                <div className="fs-2 fw-bold text-success">
                  {totals.ordersToday}
                </div>
              </div>
              <div className="border border-gray-300 border-dashed rounded min-w-200px w-200 py-2 px-4">
                <span className="fs-8 text-gray-500 fw-bold">Total Amount</span>
                <div className="fs-2 fw-bold text-success">
                  {formatCurrency(totals.amountToday)}
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="d-flex flex-wrap justify-content-end align-items-center py-3 px-2 gap-3"
            >
              <div className="card-title d-flex gap-3">
                <select
                  name="payment_status"
                  className="form-select w-auto"
                  value={paymentStatus}
                  onChange={(event) => setPaymentStatus(event.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                  <option value="partially_refunded">Partially Refunded</option>
                  <option value="pending">Pending</option>
                </select>
                <div className="d-flex align-items-center position-relative my-1">
                  <i className="ki-outline ki-magnifier fs-3 position-absolute ms-4" />
                  <input
                    type="text"
                    className="form-control form-control-solid w-250px ps-12"
                    name="search"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search Order"
                  />
                </div>
              </div>
              <div className="hover:!bg-blue-900 rounded hover:!text-white">
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="card-body pt-0 table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-5">
              <thead>
                <tr className="text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0">
                  <th>Order</th>
                  <th>Date</th>
                  <th>Delivery Date</th>
                  <th>Customer</th>
                  <th>Notes</th>
                  <th>Payment Status</th>
                  <th>Amount</th>
                  <th>Destination</th>
                </tr>
              </thead>
              <tbody className="fw-semibold text-gray-600">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(order)}
                  >
                    <td>
                      <div className="d-flex align-items-center">
                        <div>
                          <Link
                            to={order.id}
                            className="text-gray-800 text-hover-primary fs-5 fw-bold"
                            onClick={(event) => event.stopPropagation()}
                            relative="path"
                          >
                            #{order.orderNumber}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="pe-0">
                      <span className="fw-bold">
                        {formatDate(order.orderDate)}
                      </span>
                    </td>
                    <td className="pe-0">
                      <span className="fw-bold">
                        {formatDate(order.deliveryDate)}
                      </span>
                    </td>
                    <td className="pe-0">
                      <span className="fw-bold">{order.customer.name}</span>
                      <div className="text-muted fs-8">
                        {order.customer.email}
                      </div>
                    </td>
                    <td className="pe-0">{order.notes ?? "—"}</td>
                    <td className="pe-0">
                      <span className="badge badge-light-success text-uppercase">
                        {order.paymentStatus.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="pe-0">{formatCurrency(order.amount)}</td>
                    <td className="pe-0">{order.destination}</td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-muted">
                      No orders match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersListPage;
