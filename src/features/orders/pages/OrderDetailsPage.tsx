import { Link, useParams } from 'react-router-dom';
import { getOrderById } from '../data/orders';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(value);

const formatDate = (iso: string, withTime = true) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(withTime && { hour: '2-digit', minute: '2-digit' })
  }).format(new Date(iso));

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const order = orderId ? getOrderById(orderId) : undefined;

  if (!order) {
    return (
      <div className="d-flex flex-column gap-6">
        <div className="alert alert-danger">
          <div className="alert-text">
            Order <strong>{orderId}</strong> could not be found. Return to the{' '}
            <Link to=".." className="text-white fw-bold text-hover-light" relative="path">
              orders list
            </Link>
            .
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column flex-column-fluid gap-6">
      <div id="kt_app_toolbar" className="app-toolbar d-flex pb-3 pb-lg-5">
        <div className="d-flex flex-stack flex-row-fluid">
          <div className="d-flex flex-column flex-row-fluid">
            <div className="page-title d-flex align-items-center me-3">
              <h1 className="page-heading d-flex flex-column justify-content-center text-gray-900 fw-bold fs-lg-2x gap-2">
                <span>Order Details</span>
                <span className="fs-4 text-muted fw-semibold">#{order.orderNumber}</span>
              </h1>
            </div>
            <ul className="breadcrumb breadcrumb-separatorless fw-semibold mb-3 fs-7">
              <li className="breadcrumb-item text-gray-700 fw-bold lh-1">
                <Link to="../dashboard" className="text-gray-700 text-hover-primary" relative="path">
                  <i className="ki-outline ki-home text-gray-700 fs-6" />
                </Link>
              </li>
              <li className="breadcrumb-item">
                <i className="ki-outline ki-right fs-7 text-gray-700 mx-n1" />
              </li>
              <li className="breadcrumb-item text-gray-700 fw-bold lh-1">Dashboard</li>
              <li className="breadcrumb-item">
                <i className="ki-outline ki-right fs-7 text-gray-700 mx-n1" />
              </li>
              <li className="breadcrumb-item text-gray-700 fw-bold lh-1">Orders</li>
              <li className="breadcrumb-item">
                <i className="ki-outline ki-right fs-7 text-gray-700 mx-n1" />
              </li>
              <li className="breadcrumb-item text-gray-700">Order Details</li>
            </ul>
          </div>
          <div className="d-flex align-self-center flex-center flex-shrink-0 gap-3">
            <button type="button" className="btn btn-sm btn-info px-4 py-3">
              Packing Slip
            </button>
            <button type="button" className="btn btn-sm btn-primary px-4 py-3">
              Create Zoho Order
            </button>
          </div>
        </div>
      </div>

      <div id="kt_app_content" className="app-content flex-column-fluid">
        <div className="row g-5 g-xl-10">
          <div className="col-12 col-xl-8">
            <div className="card shadow-sm border-0 mb-5">
              <div className="card-body p-5 d-flex flex-wrap gap-5">
                <div>
                  <div className="text-muted fs-7">Order placed</div>
                  <div className="fw-bold fs-5">{formatDate(order.orderDate)}</div>
                </div>
                <div>
                  <div className="text-muted fs-7">Delivery window</div>
                  <div className="fw-bold fs-5">
                    {formatDate(order.deliveryDate, false)}
                    <span className="text-muted fs-7 d-block">Farmerr Fleet</span>
                  </div>
                </div>
                <div>
                  <div className="text-muted fs-7">Payment status</div>
                  <span className="badge badge-light-success text-uppercase">
                    {order.paymentStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <div className="text-muted fs-7">Fulfilment status</div>
                  <span className="badge badge-light-warning text-uppercase">
                    {order.fulfillmentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-header border-0 align-items-center">
                <h3 className="card-title fw-bold">Line items</h3>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="bg-light">
                      <tr className="text-muted fw-semibold text-uppercase fs-7">
                        <th className="ps-5">Product</th>
                        <th>SKU</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Price</th>
                        <th className="text-end pe-5">Total</th>
                      </tr>
                    </thead>
                    <tbody className="fw-semibold text-gray-700">
                      {order.items.map((item) => (
                        <tr key={item.sku}>
                          <td className="ps-5">
                            <div className="fw-bold">{item.productName}</div>
                          </td>
                          <td>{item.sku}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">{formatCurrency(item.price)}</td>
                          <td className="text-end pe-5">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer border-0 bg-light p-5">
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-bold">{formatCurrency(order.totals.subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Shipping</span>
                    <span className="fw-bold">{formatCurrency(order.totals.shipping)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Tax</span>
                    <span className="fw-bold">{formatCurrency(order.totals.tax)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Discount</span>
                    <span className="fw-bold text-danger">
                      -{formatCurrency(order.totals.discount)}
                    </span>
                  </div>
                  <div className="separator my-2" />
                  <div className="d-flex justify-content-between fs-4 fw-bold">
                    <span>Total due</span>
                    <span>{formatCurrency(order.totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card shadow-sm border-0 mb-5">
              <div className="card-header border-0">
                <h3 className="card-title fw-bold">Customer</h3>
              </div>
              <div className="card-body d-flex flex-column gap-4">
                <div>
                  <div className="fw-bold text-gray-900">{order.customer.name}</div>
                  <div className="text-muted fs-7">{order.customer.email}</div>
                  <div className="text-muted fs-7">{order.customer.phone}</div>
                </div>
                {order.tags.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {order.tags.map((tag) => (
                      <span key={tag} className="badge badge-light-primary text-uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {order.notes && (
                  <div className="alert alert-light-primary mb-0">
                    <div className="alert-text">{order.notes}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="card shadow-sm border-0 mb-5">
              <div className="card-header border-0">
                <h3 className="card-title fw-bold">Order summary</h3>
              </div>
              <div className="card-body d-flex flex-column gap-4">
                {order.summary.map((entry) => (
                  <div key={entry.label} className="d-flex justify-content-between">
                    <span className="text-muted">{entry.label}</span>
                    <span className="fw-bold text-gray-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card shadow-sm border-0 mb-5">
              <div className="card-header border-0">
                <h3 className="card-title fw-bold">Addresses</h3>
              </div>
              <div className="card-body d-flex flex-column gap-4">
                <div>
                  <div className="fw-bold text-gray-900 mb-2">Billing</div>
                  <address className="text-muted mb-0">
                    <div>{order.billingAddress.name}</div>
                    {order.billingAddress.company && <div>{order.billingAddress.company}</div>}
                    <div>{order.billingAddress.line1}</div>
                    {order.billingAddress.line2 && <div>{order.billingAddress.line2}</div>}
                    <div>
                      {order.billingAddress.city}, {order.billingAddress.state}{' '}
                      {order.billingAddress.postalCode}
                    </div>
                    <div>{order.billingAddress.country}</div>
                    {order.billingAddress.phone && <div>{order.billingAddress.phone}</div>}
                  </address>
                </div>
                <div className="separator" />
                <div>
                  <div className="fw-bold text-gray-900 mb-2">Shipping</div>
                  <address className="text-muted mb-0">
                    <div>{order.shippingAddress.name}</div>
                    {order.shippingAddress.company && <div>{order.shippingAddress.company}</div>}
                    <div>{order.shippingAddress.line1}</div>
                    {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                    <div>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                      {order.shippingAddress.postalCode}
                    </div>
                    <div>{order.shippingAddress.country}</div>
                    {order.shippingAddress.phone && <div>{order.shippingAddress.phone}</div>}
                  </address>
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-header border-0">
                <h3 className="card-title fw-bold">Timeline</h3>
              </div>
              <div className="card-body">
                <div className="timeline">
                  {order.timeline.map((event) => (
                    <div className="timeline-item" key={event.title}>
                      <div className="timeline-line w-40px" />
                      <div className="timeline-icon">
                        <i className="ki-outline ki-flag fs-2 text-primary" />
                      </div>
                      <div className="timeline-content ps-3">
                        <div className="fs-7 text-muted">{event.time}</div>
                        <div className="fs-6 fw-semibold text-gray-900">{event.title}</div>
                        <div className="text-muted fs-7">{event.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
