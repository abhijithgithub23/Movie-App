const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-main transition-colors duration-300">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-transparent border-t-red-600 border-b-red-600"></div>
    </div>
  );
};

export default LoadingSpinner;