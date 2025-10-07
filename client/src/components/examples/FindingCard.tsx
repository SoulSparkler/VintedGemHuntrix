import FindingCard from '../FindingCard';

export default function FindingCardExample() {
  return (
    <div className="p-6 max-w-md">
      <FindingCard
        listingTitle="Vintage Pearl Necklace - Mystery Bundle"
        listingUrl="https://www.vinted.com/items/12345"
        price="€15.00"
        confidenceScore={92}
        detectedMaterials={["14K Gold", "Real Pearl"]}
        aiReasoning="Clear 585 hallmark visible on clasp in photo 2. Pearl shows natural luster and irregular surface texture consistent with genuine pearls. Professional craftsmanship evident in setting."
        foundAt={new Date(Date.now() - 4 * 60 * 60 * 1000)}
        onDelete={() => console.log('Delete finding')}
      />
    </div>
  );
}
