interface ProgressStepsProps {
  totalSteps: number;
  currentStep: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ totalSteps, currentStep }) => {
  return (
    <div className="flex justify-between mb-8">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            index + 1 <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div className={`w-12 h-1 ${
              index + 1 < currentStep ? 'bg-blue-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;