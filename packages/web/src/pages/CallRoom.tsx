import { useParams, useNavigate } from 'react-router-dom'

export function CallRoom() {
  const { roomName } = useParams<{ roomName: string }>()
  const navigate = useNavigate()

  if (!roomName) {
    return (
      <div className="text-center py-32 text-dark-400">
        <p className="text-xl mb-2">No room specified</p>
        <button onClick={() => navigate('/bookings')} className="btn-primary mt-4">
          Go to Bookings
        </button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-700">
        <h2 className="font-semibold">Video Call</h2>
        <button
          onClick={() => navigate('/bookings')}
          className="text-sm text-dark-300 hover:text-white transition-colors"
        >
          Leave &rarr;
        </button>
      </div>
      <div className="flex-1">
        <iframe
          src={`https://camvo.daily.co/${roomName}?t=video`}
          className="w-full h-full border-0"
          allow="microphone; camera; display-capture"
          allowFullScreen
          title="Daily.co Video Call"
        />
      </div>
    </div>
  )
}