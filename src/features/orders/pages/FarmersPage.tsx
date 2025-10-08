const FarmersPage = () => (
  <div className="card shadow-sm border-0">
    <div className="card-body p-10 text-center">
      <h1 className="fw-bold text-gray-900 mb-3">Orders Farmers Directory</h1>
      <p className="text-muted fs-6 mb-6">
        Connect this view to your orders farmers listing. This placeholder keeps
        the layout consistent.
      </p>
      <div className="d-flex flex-wrap justify-content-center gap-3">
        <div className="hover:!bg-blue-900 rounded hover:!text-white">
          <button type="button" className="btn btn-primary px-6">
            Add Farmer
          </button>
        </div>
        <button type="button" className="btn btn-light px-6">
          Import from CSV
        </button>
      </div>
    </div>
  </div>
);

export default FarmersPage;
