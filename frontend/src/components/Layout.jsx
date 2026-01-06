import NavigationBar from './NavigationBar';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* pb-20 = padding bottom für die Navigation Bar */}
      {children}
      <NavigationBar />
    </div>
  );
}

export default Layout;