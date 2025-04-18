interface RatingResultProps {
  imageUrl: string;
  rating: any;
  loading: boolean;
  onReset: () => void;
}

export default function RatingResult({ imageUrl, rating, loading, onReset }: RatingResultProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md mb-8">
        <img 
          src={imageUrl} 
          alt="Uploaded outfit" 
          className="w-full h-auto rounded-lg shadow-md"
        />
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p>AI is analyzing your outfit...</p>
        </div>
      ) : rating ? (
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-center mb-4">
            <div className="text-5xl font-bold">{rating.score}/10</div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Feedback:</h3>
            <p className="whitespace-pre-line">{rating.feedback}</p>
          </div>
          
          {rating.suggestions && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Suggestions:</h3>
              <p className="whitespace-pre-line">{rating.suggestions}</p>
            </div>
          )}
          
          <button
            onClick={onReset}
            className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Rate Another Outfit
          </button>
        </div>
      ) : (
        <p>Something went wrong. Please try again.</p>
      )}
    </div>
  );
} 