function LoadingSpinner({ text = "Lädt..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
      <p className="text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  );
}

export default LoadingSpinner;
