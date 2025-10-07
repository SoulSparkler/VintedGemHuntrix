import ConfidenceScore from '../ConfidenceScore';

export default function ConfidenceScoreExample() {
  return (
    <div className="space-y-4 p-6">
      <ConfidenceScore score={95} />
      <ConfidenceScore score={72} />
      <ConfidenceScore score={45} />
    </div>
  );
}
