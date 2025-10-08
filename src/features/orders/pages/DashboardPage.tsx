import { Link } from "react-router-dom";

type Stat = {
  label: string;
  value: number | string;
  change: string;
  currency?: boolean;
};

const stats: Stat[] = [
  { label: "Total Orders", value: "1,240", change: "+12.5%" },
  { label: "Active Farmers", value: "320", change: "+4.1%" },
  { label: "Pending Payouts", value: 184500, change: "-1.2%", currency: true },
  { label: "Support Tickets", value: "27", change: "-5.0%" },
];

const recentOrders = [
  {
    id: "ORD-2048",
    customer: "Priya Sharma",
    status: "Processing",
    amount: 13250,
    date: "2025-06-15",
  },
  {
    id: "ORD-2047",
    customer: "Ravi Patel",
    status: "Delivered",
    amount: 12860,
    date: "2025-06-15",
  },
  {
    id: "ORD-2046",
    customer: "Anita Singh",
    status: "Awaiting Pickup",
    amount: 14120,
    date: "2025-06-14",
  },
  {
    id: "ORD-2045",
    customer: "Mohit Verma",
    status: "Cancelled",
    amount: 980,
    date: "2025-06-14",
  },
];

const activityFeed = [
  {
    time: "09:45 AM",
    title: "New farmer registration",
    description: "Ramesh Gupta added 12 new SKUs to inventory",
  },
  {
    time: "08:10 AM",
    title: "Bulk order placed",
    description: "EcoFresh Retail requested 350 kg of tomatoes",
  },
  {
    time: "Yesterday",
    title: "Payout processed",
    description: "INR 1,50,000 released to 24 farmers",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value);

const DashboardPage = () => (
  <div className="d-flex flex-column gap-10">
    <section className="card shadow-sm border-0">
      <div className="card-body p-5 p-lg-10">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-6">
          <div>
            <h1 className="fw-bold text-gray-900 mb-3">
              Farmerr operations overview
            </h1>
            <p className="text-muted fs-6 mb-5 mb-lg-0">
              Monitor real-time order health, farmer activity, and payouts for
              the TNM orders console.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-3">
            <div className="hover:!bg-blue-900 rounded hover:!text-white">
              <Link to="../." className="btn btn-primary px-6" relative="path">
                View Orders
              </Link>
            </div>
            <div className="hover:!bg-blue-900 rounded hover:!text-white">
              <Link
                to="../farmers"
                className="btn btn-outline btn-outline-primary btn-active-primary px-6"
                relative="path"
              >
                Manage Farmers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="row g-5">
      {stats.map((stat) => (
        <div className="col-12 col-md-6 col-xl-3" key={stat.label}>
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-5">
              <span className="text-muted fw-semibold fs-7 text-uppercase">
                {stat.label}
              </span>
              <h2 className="fw-bold text-gray-900 my-3">
                {stat.currency
                  ? formatCurrency(Number(stat.value))
                  : stat.value}
              </h2>
              <span
                className={`badge ${
                  stat.change.startsWith("+")
                    ? "badge-light-success"
                    : "badge-light-danger"
                }`}
              >
                {stat.change} vs last week
              </span>
            </div>
          </div>
        </div>
      ))}
    </section>

    <section className="row g-5">
      <div className="col-12 col-xl-8">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-header align-items-center">
            <h3 className="card-title fw-bold">Recent Orders</h3>
            <div className="card-toolbar">
              <Link
                to="../orders"
                className="btn btn-sm btn-light-primary"
                relative="path"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="text-muted fw-semibold text-uppercase fs-7">
                  <tr>
                    <th className="ps-5">Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th className="text-end pe-5">Amount</th>
                    <th className="text-end pe-5">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="ps-5">
                        <Link
                          to={`../orders/${order.id}`}
                          className="text-gray-900 fw-semibold"
                          relative="path"
                        >
                          {order.id}
                        </Link>
                      </td>
                      <td>{order.customer}</td>
                      <td>
                        <span className="badge badge-light-primary">
                          {order.status}
                        </span>
                      </td>
                      <td className="text-end pe-5">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="text-end pe-5">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-xl-4">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-header align-items-center">
            <h3 className="card-title fw-bold">Latest Activity</h3>
            <div className="card-toolbar">
              <span className="badge badge-light fs-7">Live feed</span>
            </div>
          </div>
          <div className="card-body">
            <div className="timeline">
              {activityFeed.map((activity) => (
                <div className="timeline-item" key={activity.title}>
                  <div className="timeline-line w-40px" />
                  <div className="timeline-icon">
                    <i className="ki-outline ki-discount fs-2 text-primary" />
                  </div>
                  <div className="timeline-content ps-3">
                    <div className="fs-7 text-muted">{activity.time}</div>
                    <div className="fs-6 fw-semibold text-gray-900">
                      {activity.title}
                    </div>
                    <div className="text-muted fs-7">
                      {activity.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default DashboardPage;
