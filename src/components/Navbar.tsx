"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Camera,
  Monitor,
  AlertTriangle,
  Users,
} from "lucide-react";
import ResetButton from "./ResetButton";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Cameras", href: "/cameras", icon: Camera },
  { label: "Scenes", href: "/justfordemo", icon: Monitor },
  { label: "Incidents", href: "/incidents", icon: AlertTriangle },
  { label: "Users", href: "/justfordemo", icon: Users },
];

const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full h-16 bg-gradient-to-r from-black to-gray-900 text-white shadow-md flex items-center justify-between px-6">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3">
        
        <h1 className="text-xl font-bold">Secure Sight</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex gap-6 items-center text-sm font-medium">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-2 px-2 py-1 rounded-md hover:text-yellow-400 transition ${
              pathname === href ? "text-yellow-400" : "text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
            <div className="text-white">Bhuwanesh Thapa</div>
          
        </div>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 text-gray-200 rounded-md shadow-lg py-2 z-50">
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-900">
              Profile
            </button>
            <div className="px-0 py-0">
              <ResetButton />
            </div>
            <button className="w-full text-left px-4 py-0 text-sm text-red-600 hover:bg-red-100">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
