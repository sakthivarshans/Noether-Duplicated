import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseClient';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [textToSummarize, setTextToSummarize] = useState('');
  const [questionContext, setQuestionContext] = useState('');
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/signin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const makeApiCall = async (endpoint, body) => {
    setIsLoading(true);
    setAiResponse('');
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();
      setAiResponse(data.summary || data.answer);
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
      setAiResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user.displayName || user.email}!</h1>
          <button onClick={handleSignOut} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Sign Out
          </button>
        </div>

        {/* Summarizer */}
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Summarize Text</h2>
          <textarea
            className="w-full p-2 border rounded"
            rows="5"
            placeholder="Paste text here to summarize..."
            value={textToSummarize}
            onChange={(e) => setTextToSummarize(e.target.value)}
          />
          <button
            onClick={() => makeApiCall('summarize', { text: textToSummarize })}
            disabled={isLoading || !textToSummarize}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 hover:bg-blue-600"
          >
            {isLoading ? 'Processing...' : 'Summarize'}
          </button>
        </div>

        {/* Ask AI */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
          <textarea
            className="w-full p-2 border rounded"
            rows="5"
            placeholder="Provide context (optional)..."
            value={questionContext}
            onChange={(e) => setQuestionContext(e.target.value)}
          />
          <input
            type="text"
            className="w-full mt-2 p-2 border rounded"
            placeholder="Your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            onClick={() => makeApiCall('ask-ai', { context: questionContext, question })}
            disabled={isLoading || !question}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400 hover:bg-green-600"
          >
            {isLoading ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="mt-8 p-4 bg-gray-50 border rounded-lg">
            <h3 className="text-lg font-semibold">AI Response:</h3>
            <p className="mt-2 whitespace-pre-wrap">{aiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}
