
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  const rootElement = document.getElementById("root");
  console.log('main.tsx: root element found?', !!rootElement);
  
  if (!rootElement) {
    console.error('ERROR: #root element not found!');
    document.body.innerHTML = '<h1 style="color: red; padding: 20px;">ERROR: #root element not found</h1>';
  } else {
    createRoot(rootElement).render(<App />);
    console.log('React app mounted successfully');
  }
  