export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <h1 className="text-5xl font-bold mb-4">404</h1>

      <p className="text-lg text-gray-400 mb-6">
        Page not found
      </p>

      <a
        href="/"
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
      >
        Go Back Home
      </a>
    </div>
  );
}