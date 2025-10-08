import { useEffect } from "react";

type AssetKind = "script" | "style";

type AssetEl = HTMLLinkElement | HTMLScriptElement;

const ensureAsset = (
  kind: AssetKind,
  hrefOrSrc: string,
  attrs: Record<string, string> = {}
) => {
  const selector = `${
    kind === "style" ? "link" : "script"
  }[data-orders="${hrefOrSrc}"]`;
  const existing = document.querySelector<AssetEl>(selector);

  const element: AssetEl =
    existing ??
    (kind === "style"
      ? Object.assign(document.createElement("link"), {
          rel: "stylesheet",
          href: hrefOrSrc,
        })
      : Object.assign(document.createElement("script"), {
          src: hrefOrSrc,
          async: attrs.async === "true",
          defer: attrs.defer === "true",
        }));

  if (!existing) {
    element.dataset.orders = hrefOrSrc;
    Object.entries(attrs).forEach(([key, value]) => {
      if (key !== "async" && key !== "defer") {
        element.setAttribute(key, value);
      }
    });
    document.head.appendChild(element);
  }

  return () => element.remove();
};

export const useOrdersAssets = () => {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    cleanups.push(
      ensureAsset(
        "style",
        "https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700"
      )
    );
    cleanups.push(
      ensureAsset(
        "style",
        "/assets/admin/plugins/custom/fullcalendar/fullcalendar.bundle.css"
      )
    );
    cleanups.push(
      ensureAsset(
        "style",
        "/assets/admin/plugins/custom/datatables/datatables.bundle.css"
      )
    );
    cleanups.push(
      ensureAsset("style", "/assets/admin/plugins/global/plugins.bundle.css")
    );
    cleanups.push(ensureAsset("style", "/assets/admin/css/style.bundle.css"));

    cleanups.push(
      ensureAsset(
        "script",
        "https://www.googletagmanager.com/gtag/js?id=UA-37564768-1",
        {
          async: "true",
        }
      )
    );
    cleanups.push(
      ensureAsset("script", "/assets/admin/plugins/global/plugins.bundle.js", {
        defer: "true",
      })
    );
    cleanups.push(
      ensureAsset("script", "/assets/admin/js/scripts.bundle.js", {
        defer: "true",
      })
    );
    cleanups.push(
      ensureAsset("script", "/assets/admin/js/lib/index.js", { defer: "true" })
    );
    cleanups.push(
      ensureAsset("script", "/assets/admin/js/lib/xy.js", { defer: "true" })
    );
    cleanups.push(
      ensureAsset("script", "/assets/admin/js/lib/Animated.js", {
        defer: "true",
      })
    );
    cleanups.push(
      ensureAsset(
        "script",
        "/assets/admin/plugins/custom/datatables/datatables.bundle.js",
        { defer: "true" }
      )
    );
    cleanups.push(
      ensureAsset("script", "/assets/admin/js/widgets.bundle.js", {
        defer: "true",
      })
    );
    cleanups.push(
      ensureAsset("script", "/assets/admin/js/custom/widgets.js", {
        defer: "true",
      })
    );

    // favicon: set once if you want the icon while inside orders
    const faviconCleanup = ensureAsset(
      "style",
      "/assets/admin/media/logos/farmerr.fav.webp",
      {
        rel: "icon",
      }
    );
    cleanups.push(faviconCleanup);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);
};
