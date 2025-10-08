import { type PropsWithChildren, type ReactNode } from "react";
import { NavLink, Outlet, useMatch, useResolvedPath } from "react-router-dom";
import { useOrdersAssets } from "../../hooks/useOrdersAssets";

interface NavItem {
  label: string;
  href: string;
  exact?: boolean;
}

const primaryNavItems: NavItem[] = [
  { label: "Dashboard", href: "dashboard", exact: true },
  { label: "Orders", href: ".", exact: true },
  { label: "Farmers", href: "farmers", exact: true },
];

const quickLinks = [
  { label: "About", href: "#", target: "_blank" },
  { label: "Support", href: "#", target: "_blank" },
  { label: "Purchase", href: "#", target: "_blank" },
];

const useNavMatch = (href: string, exact?: boolean) => {
  const resolved = useResolvedPath(href);
  return Boolean(
    useMatch({
      path: resolved.pathname,
      end: exact ?? false,
    })
  );
};

const HeaderNavItem = ({ item }: { item: NavItem }) => {
  const active = useNavMatch(item.href, item.exact);

  return (
    <div
      className={`menu-item menu-lg-down-accordion me-0 me-lg-2 ${
        active ? "here show menu-here-bg" : ""
      }`}
    >
      <span className="menu-link">
        <NavLink
          to={item.href}
          end={item.exact}
          relative={item.href.startsWith("/") ? undefined : "path"}
        >
          <span className="menu-title">{item.label}</span>
        </NavLink>
        <span className="menu-arrow d-lg-none" />
      </span>
    </div>
  );
};

const Header = () => (
  <div
    id="kt_app_header"
    className="app-header"
    data-kt-sticky="true"
    data-kt-sticky-activate="true"
    data-kt-sticky-name="app-header-sticky"
    data-kt-sticky-offset="{default: '200px', lg: '300px'}"
  >
    <div
      className="app-container container-xxl d-flex align-items-stretch justify-content-between"
      id="kt_app_header_container"
    >
      <div
        className="app-header-wrapper d-flex flex-grow-1 align-items-stretch justify-content-between"
        id="kt_app_header_wrapper"
      >
        <div className="app-header-logo d-flex flex-shrink-0 align-items-center justify-content-between justify-content-lg-center">
          <button
            className="btn btn-icon btn-color-gray-600 btn-active-color-primary ms-n3 me-2 d-flex d-lg-none"
            id="kt_app_sidebar_toggle"
            type="button"
          >
            <i className="ki-outline ki-abstract-14 fs-2" />
          </button>
          <NavLink
            to="../dashboard"
            className="d-flex align-items-center"
            relative="path"
          >
            <img
              alt="Logo"
              src="/assets/admin/media/logos/Farmerr_logo.svg"
              className="h-30px h-lg-40px theme-light-show"
            />
          </NavLink>
        </div>
        <div
          id="kt_app_header_menu_wrapper"
          className="d-flex align-items-center w-100"
        >
          <div
            className="app-header-menu app-header-mobile-drawer align-items-start align-items-lg-center w-100"
            data-kt-drawer="true"
            data-kt-drawer-name="app-header-menu"
            data-kt-drawer-activate="{default: true, lg: false}"
            data-kt-drawer-overlay="true"
            data-kt-drawer-width="250px"
            data-kt-drawer-direction="end"
            data-kt-drawer-toggle="#kt_app_header_menu_toggle"
            data-kt-swapper="true"
            data-kt-swapper-mode="{default: 'append', lg: 'prepend'}"
            data-kt-swapper-parent="{default: '#kt_app_body', lg: '#kt_app_header_menu_wrapper'}"
          >
            <div
              className="menu menu-rounded menu-column menu-lg-row menu-active-bg menu-state-primary menu-title-gray-700 menu-arrow-gray-500 menu-bullet-gray-500 my-5 my-lg-0 align-items-stretch fw-semibold px-2 px-lg-0"
              id="#kt_header_menu"
              data-kt-menu="true"
            >
              {primaryNavItems.map((item) => (
                <HeaderNavItem key={item.label} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <div
    id="kt_app_footer"
    className="app-footer d-flex flex-column flex-md-row align-items-center flex-center flex-md-stack py-2 py-lg-4"
  >
    <div className="text-gray-900 order-2 order-md-1">
      <span className="text-muted fw-semibold me-1">2024&copy;</span>
      <a
        href="https://thenightmarketer.com/"
        target="_blank"
        rel="noreferrer"
        className="text-gray-800 text-hover-primary"
      >
        The Night Marketer
      </a>
    </div>
    <ul className="menu menu-gray-600 menu-hover-primary fw-semibold order-1">
      {quickLinks.map((item) => (
        <li className="menu-item" key={item.label}>
          <a
            href={item.href}
            target={item.target}
            rel="noreferrer"
            className="menu-link px-2"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const ScrollTop = () => (
  <button
    id="kt_scrolltop"
    className="scrolltop"
    data-kt-scrolltop="true"
    type="button"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  >
    <i className="ki-outline ki-arrow-up" />
  </button>
);

const Main = ({ children }: PropsWithChildren<{}>) => (
  <div className="app-main flex-column flex-row-fluid" id="kt_app_main">
    <div className="py-10 px-5 px-lg-10">{children}</div>
    <Footer />
  </div>
);

const PageWrapper = ({ children }: { children: ReactNode }) => (
  <div className="app-wrapper flex-column flex-row-fluid">
    <div className="app-container container-xxxl d-flex flex-row-fluid">
      <Main>{children}</Main>
    </div>
  </div>
);

const AppLayout = () => {
  useOrdersAssets();
  return (
    <div
      className="d-flex flex-column flex-root app-root bg-white"
      id="kt_app_root"
    >
      <div className="app-page flex-column flex-column-fluid" id="kt_app_page">
        <Header />
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </div>
      <ScrollTop />
    </div>
  );
};

export default AppLayout;
