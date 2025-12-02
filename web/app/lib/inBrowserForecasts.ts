import * as tf from '@tensorflow/tfjs';
import { TimePoint } from './types';
import { addMonths, denormalize, normalize } from './helpers';
import { ML_TRAINING_MESSSAGES } from './const';

const WINDOW_SIZE = 12; // Look 1 year back
const PREDICTION_HORIZON = 6;
// Keep modest to avoid long UI freezes
const EPOCHS = 50;

function createDataset(data: number[], windowSize: number) {
  const X = [];
  const y = [];
  
  for (let i = 0; i < data.length - windowSize; i++) {
    X.push(data.slice(i, i + windowSize));
    y.push(data[i + windowSize]);
  }
  
  return {
    inputs: tf.tensor2d(X, [X.length, windowSize]),
    labels: tf.tensor2d(y, [y.length, 1]),
  };
}

export async function trainAndPredict(
  series: TimePoint[], 
  onEpochEnd?: (epoch: number, loss: number) => void,
): Promise<TimePoint[]> {
  if (series.length < WINDOW_SIZE + 2) {
    console.warn(ML_TRAINING_MESSSAGES.NOT_ENOUGH_DATA);
    return [];
  }
  const values = series.map((p) => p.value);
  const { normalized, min, range } = normalize(values);
  
  const { inputs, labels } = createDataset(normalized, WINDOW_SIZE);

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [WINDOW_SIZE], units: 32, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  // Train the model
  await model.fit(inputs, labels, {
    epochs: EPOCHS,
    shuffle: true,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        if (onEpochEnd && logs) onEpochEnd(epoch, logs.loss as number);
        await tf.nextFrame(); // Yield to avoid freezing the UI
      },
    },
  });

  // Predict (Auto-regressive)
  let currentWindow = normalized.slice(-WINDOW_SIZE);
  const predictions: number[] = [];

  for (let i = 0; i < PREDICTION_HORIZON; i++) {
    const inputTensor = tf.tensor2d([currentWindow], [1, WINDOW_SIZE]);
    const predTensor = model.predict(inputTensor) as tf.Tensor;
    const predValue = predTensor.dataSync()[0];
    
    predictions.push(predValue);
    
    // Update window: remove first, add prediction
    currentWindow = [...currentWindow.slice(1), predValue];
    
    inputTensor.dispose();
    predTensor.dispose();
  }

  inputs.dispose();
  labels.dispose();
  model.dispose();

  // Format Output
  const lastDate = series[series.length - 1].date;
  
  return predictions.map((val, idx) => ({
    date: addMonths(lastDate, idx + 1),
    value: denormalize(val, min, range),
  }));
}
