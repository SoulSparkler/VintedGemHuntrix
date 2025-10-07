import ManualScanForm from '../ManualScanForm';

export default function ManualScanFormExample() {
  return (
    <div className="p-6 max-w-2xl">
      <ManualScanForm
        onScan={(url) => console.log('Scanning URL:', url)}
        isScanning={false}
      />
    </div>
  );
}
