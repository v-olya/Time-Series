import { useState, useRef, useCallback, useEffect } from 'react';

export function useMLForecasts<T extends string>(
  seriesData: Record<T, { date: string; value: number }[]> | null | undefined,
  productsToShow: T[],
  productLabels: Record<T, string>,
) {
  const [mlForecasts, setMlForecasts] = useState<Record<string, { date: string; value: number }[]>>({});
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState('');
  const abortRef = useRef(false);

  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  const startTraining = useCallback(async () => {
    if (!seriesData) return;
    abortRef.current = false;
    setIsTraining(true);
    const newForecasts: Record<string, { date: string; value: number }[]> = {};

    try {
      setTrainingStatus('Loading TensorFlow...');
      const { trainAndPredict } = await import('../../lib/inBrowserForecasts');
      
      if (abortRef.current) return;

      for (const productKey of productsToShow) {
        if (abortRef.current) return;
        setTrainingStatus(`Training ${productLabels[productKey]}...`);
        const rawSeries = seriesData[productKey];
        if (rawSeries && rawSeries.length > 0) {
          const prediction = await trainAndPredict(rawSeries, (epoch, loss) => {
            if (abortRef.current) return;
            if (epoch % 5 === 0) {
              setTrainingStatus(`Training ${productLabels[productKey]}... (Loss: ${loss.toFixed(4)})`);
            }
          });
          if (abortRef.current) return;
          newForecasts[productKey] = prediction;
        }
      }
      if (!abortRef.current) {
        setMlForecasts((prev) => ({ ...prev, ...newForecasts }));
      }
    } catch (e) {
      console.error('Training failed', e);
    } finally {
      if (!abortRef.current) {
        setIsTraining(false);
        setTrainingStatus('');
      }
    }
  }, [seriesData, productsToShow, productLabels]);

  const clearForecasts = useCallback(() => {
    setMlForecasts({});
  }, []);

  const hasMlForecasts = Object.keys(mlForecasts).length > 0;

  return {
    mlForecasts,
    isTraining,
    trainingStatus,
    startTraining,
    clearForecasts,
    hasMlForecasts,
  };
}
