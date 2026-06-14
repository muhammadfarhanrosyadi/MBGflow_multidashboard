import { useState } from 'react';
import '../styles/aiPrediction.css';

interface AIPredictionData {
  beras: number;
  telur: number;
  minyak: number;
}

export default function AIPrediction() {
  const [predictions, setPredictions] = useState<AIPredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(false);
    
    try {
      const response = await fetch('http://localhost:5000/api/ai/predict-stock');
      const data = await response.json();
      
      if (data.success) {
        setPredictions(data.predictions);
        setGenerated(true);
        console.log('AI prediction generated:', data.predictions);
        
        // Reset generated state after 2 seconds
        setTimeout(() => setGenerated(false), 2000);
      } else {
        console.error('Failed to generate prediction');
      }
    } catch (error) {
      console.error('Error fetching prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  // Default display if no predictions yet
  const displayPredictions = predictions || {
    beras: 150,
    telur: 320,
    minyak: 45
  };

  return (
    <div className="ai-prediction-card">
      <h2>Prediksi AI Minggu Depan</h2>
      <div className="prediction-list">
        <div className="prediction-item">
          <div className="prediction-icon">🌾</div>
          <div className="prediction-content">
            <div className="prediction-item-name">Beras</div>
            <div className="prediction-quantity">{displayPredictions.beras} kg</div>
          </div>
        </div>
        <div className="prediction-item">
          <div className="prediction-icon">🥚</div>
          <div className="prediction-content">
            <div className="prediction-item-name">Telur</div>
            <div className="prediction-quantity">{displayPredictions.telur} butir</div>
          </div>
        </div>
        <div className="prediction-item">
          <div className="prediction-icon">🫧</div>
          <div className="prediction-content">
            <div className="prediction-item-name">Minyak Goreng</div>
            <div className="prediction-quantity">{displayPredictions.minyak} liter</div>
          </div>
        </div>
      </div>
      <button 
        className={`btn-generate ${generated ? 'generated' : ''}`}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? '⏳ Loading...' : generated ? '✓ Prediksi Dibuat' : 'Generate Prediksi'}
      </button>
    </div>
  );
}
