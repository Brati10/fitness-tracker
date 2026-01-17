function EmptyState({ message, icon = "📭" }) {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

export default EmptyState;
