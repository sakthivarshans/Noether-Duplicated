import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to the AI Study Assistant</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your personal AI-powered tool to summarize texts, answer questions, and supercharge your learning.
        </p>
        <div className="space-x-4">
          <Link href="/signup">
            <span className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 cursor-pointer">
              Get Started
            </span>
          </Link>
          <Link href="/signin">
            <span className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md border border-blue-600 hover:bg-gray-100 cursor-pointer">
              Sign In
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
