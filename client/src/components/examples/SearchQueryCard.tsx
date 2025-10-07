import SearchQueryCard from '../SearchQueryCard';

export default function SearchQueryCardExample() {
  return (
    <div className="p-6 max-w-md">
      <SearchQueryCard
        searchLabel="Mystery Jewellery Silver"
        vintedUrl="https://www.vinted.com/catalog?search_text=mystery+jewellery+silver"
        scanFrequency={3}
        confidenceThreshold={80}
        isActive={true}
        lastScannedAt={new Date(Date.now() - 2 * 60 * 60 * 1000)}
        status="active"
        onToggle={() => console.log('Toggle triggered')}
        onEdit={() => console.log('Edit triggered')}
        onDelete={() => console.log('Delete triggered')}
        onTrigger={() => console.log('Trigger scan')}
      />
    </div>
  );
}
