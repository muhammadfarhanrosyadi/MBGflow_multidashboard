// AI Prediction Service - Simple moving average for stock prediction

function predictStockConsumption(consumptionData) {
  // consumptionData: array of consumption values [100, 120, 140, 130, 150, 170, 160]
  
  if (!Array.isArray(consumptionData) || consumptionData.length === 0) {
    return null;
  }

  // Calculate simple moving average (last 3 days average)
  const recentDays = Math.min(3, consumptionData.length);
  const recentConsumption = consumptionData.slice(-recentDays);
  const average = recentConsumption.reduce((sum, val) => sum + val, 0) / recentConsumption.length;

  // Predict for next week (7 days) with slight increase trend
  const trend = 1.05; // 5% increase factor
  const prediction = Math.round(average * 7 * trend);

  return prediction;
}

function generateStockPrediction() {
  // Dummy consumption data for different ingredients
  const consumptionPatterns = {
    beras: [100, 120, 140, 130, 150, 170, 160],
    telur: [45, 50, 55, 52, 58, 65, 62],
    minyak: [8, 9, 10, 9.5, 11, 12, 11.5]
  };

  const predictions = {};

  // Predict for each ingredient
  predictions.beras = predictStockConsumption(consumptionPatterns.beras);
  predictions.telur = predictStockConsumption(consumptionPatterns.telur) * 5; // Convert to butir
  predictions.minyak = Math.round(predictStockConsumption(consumptionPatterns.minyak) * 10) / 10; // Liter

  return predictions;
}

module.exports = {
  predictStockConsumption,
  generateStockPrediction
};
