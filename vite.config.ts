
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path";
import svgr from "vite-plugin-svgr";


// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    host: "localhost",
    port: 5173,

    proxy:{'/api':{target: 'https://localhost:32769/',changeOrigin: true, secure: false}},


  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  
  assetsInclude: ['**/*.lottie'],

});
