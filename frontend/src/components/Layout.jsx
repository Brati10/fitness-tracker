import Navigation from "./Navigation";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <Navigation />
    </div>
  );
}

export default Layout;
