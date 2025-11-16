import { useEffect, useMemo, useState } from "react";
import { contracts } from "../data/contracts";

interface Props {
  categories: string[];
  activeKey: string;
  onSelect: (k: string) => void;
  query: string;               // remains for compatibility (unused)
  onQuery: (q: string) => void; // remains for compatibility (unused)

  /** Optional: open mobile drawer (e.g. via header burger) */
  mobileOpen?: boolean;
  /** Optional: close drawer (overlay click etc.) */
  onCloseMobile?: () => void;
}

export default function Sidebar({
  categories,
  activeKey,
  onSelect,
  query: _unusedQuery,
  onQuery: _unusedOnQuery,
  mobileOpen,
  onCloseMobile,
}: Props) {
  // === Breakpoint detection (md = 768px) ===
  const [isMdUp, setIsMdUp] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const onResize = () => setIsMdUp(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // === Categories (fallback) ===
  const fallbackCategories = useMemo(() => {
    const set = new Set(
      contracts.map((c) => c.category).filter((c): c is string => !!c && typeof c === "string")
    );
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, []);

  const visibleCategories =
    Array.isArray(categories) && categories.length > 0 ? categories : fallbackCategories;

  // === Visibility: on mobile only when mobileOpen=true; on desktop always visible
  const showAsDrawer = !isMdUp;
  const visible = isMdUp || !!mobileOpen;

  if (!visible) return null;

  // === Styling (desktop vs drawer) ===
  const asideBase: React.CSSProperties = {
    width: 288,
    display: "flex",
    flexDirection: "column",
    borderRight: isMdUp ? "1px solid rgba(0,0,0,.1)" : "none",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px) saturate(160%)",
    height: "100%",
  };

  const drawerStyles: React.CSSProperties = showAsDrawer
    ? {
        position: "fixed",
        inset: "0 auto 0 0",
        zIndex: 30,
        height: "100dvh",
        boxShadow: "0 10px 30px rgba(0,0,0,.2)",
      }
    : {};

  const overlayStyles: React.CSSProperties = showAsDrawer
    ? {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.25)",
        backdropFilter: "blur(2px)",
        zIndex: 20,
      }
    : {};

  return (
    <>
      {/* Overlay (mobile only) */}
      {showAsDrawer && (
        <div
          role="button"
          aria-label="Close sidebar"
          onClick={onCloseMobile}
          style={overlayStyles}
        />
      )}

      <aside style={{ ...asideBase, ...drawerStyles }}>
        {/* --- Navigation --- */}
        <nav style={{ padding: 16, overflowY: "auto", flex: 1 }}>
          {/* Mobile: small header with close button */}
          {!isMdUp && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <strong style={{ letterSpacing: "-0.01em" }}>Categories</strong>
              <button
                onClick={onCloseMobile}
                style={{
                  border: "1px solid rgba(0,0,0,.12)",
                  background: "#fff",
                  borderRadius: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          )}

          {isMdUp && (
            <div
              style={{
                fontSize: 10,
                color: "#6b7280",
                textTransform: "uppercase",
                marginBottom: 8,
                letterSpacing: "0.06em",
              }}
            >
              Categories
            </div>
          )}

          {visibleCategories.length === 0 ? (
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              No categories found.
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {visibleCategories.map((key) => {
                const isActive = activeKey === key;
                const count =
                  key === "ALL"
                    ? contracts.length
                    : contracts.filter((c) => c.category === key).length;

                const baseBtn: React.CSSProperties = {
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid transparent",
                  background: isActive ? "rgba(0,0,0,0.05)" : "transparent",
                  fontSize: 14,
                  color: isActive ? "#111" : "#374151",
                  cursor: "pointer",
                  transition: "all .2s ease",
                };

                return (
                  <li key={key} style={{ marginBottom: 6 }}>
                    <button
                      onClick={() => {
                        onSelect(key);
                        if (showAsDrawer && onCloseMobile) onCloseMobile();
                      }}
                      style={baseBtn}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span>{key}</span>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>{count}</span>
                    </button>
                  </li>
                );
              })}

              <li
                style={{
                  borderTop: "1px solid rgba(0,0,0,.1)",
                  marginTop: 10,
                  paddingTop: 10,
                }}
              >
                <button
                  onClick={() => {
                    onSelect("ABOUT");
                    if (showAsDrawer && onCloseMobile) onCloseMobile();
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid transparent",
                    background:
                      activeKey === "ABOUT" ? "rgba(0,0,0,0.05)" : "transparent",
                    fontSize: 14,
                    color: activeKey === "ABOUT" ? "#111" : "#374151",
                    cursor: "pointer",
                    transition: "all .2s ease",
                  }}
                >
                  About us
                </button>
              </li>
            </ul>
          )}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: 14,
            fontSize: 12,
            color: "#6b7280",
            borderTop: "1px solid rgba(0,0,0,.08)",
            textAlign: "center",
          }}
        >
          Local demo – no real data.
        </div>
      </aside>
    </>
  );
}
