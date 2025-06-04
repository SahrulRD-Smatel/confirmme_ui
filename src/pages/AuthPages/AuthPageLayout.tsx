import React from "react";
import GridShape from "../../components/common/GridShape";

import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-red-900 dark:bg-white/5 lg:grid">
          <div className="relative flex flex-col items-center justify-center z-1 px-6">
            {/* ===== Common Grid Shape Start ===== */}
            <GridShape />

            {/* ===== Wide Image with Rounded Edges ===== */}
            <img
              src="/images/logo/slogan.png" // pastikan path-nya benar
              alt="Illustration"
              className="w-full max-w-lg h-auto mb-4 object-contain rounded-2xl shadow-lg"
            />

            {/* ===== Caption Below Image ===== */}
            <p className="text-center text-gray-400 dark:text-white/60 max-w-md">
              Kelola Layanan dengan Mudah, Transparan, dan Profesional!
            </p>
          </div>
        </div>

        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
