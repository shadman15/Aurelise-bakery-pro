import React from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: "left" | "right" | "top" | "bottom";
  title?: string;
}

const positionClasses = {
  left: "left-0 top-0 h-full w-80",
  right: "right-0 top-0 h-full w-80",
  top: "top-0 left-0 w-full h-64",
  bottom: "bottom-0 left-0 w-full h-64",
};

const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  children,
  position = "right",
  title,
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed bg-white shadow-lg transform transition-transform duration-300 ${
          positionClasses[position]
        } ${open ? "translate-x-0 translate-y-0" : position === "right"
            ? "translate-x-full"
            : position === "left"
            ? "-translate-x-full"
            : position === "top"
            ? "-translate-y-full"
            : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="font-semibold">{title}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;