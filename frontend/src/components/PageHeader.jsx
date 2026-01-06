import { useNavigate } from 'react-router-dom';

function PageHeader({ title, showBack = false, backTo = null }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="text-blue-500 hover:text-blue-700 text-2xl"
          >
            ←
          </button>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
    </div>
  );
}

export default PageHeader;