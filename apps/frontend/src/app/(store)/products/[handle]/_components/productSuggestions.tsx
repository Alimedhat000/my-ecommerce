export default function ProductSuggestions() {
  return (
    <section className="container mx-auto mt-20">
      <h2 className="mb-4 text-xl font-semibold">You may also like</h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {[1, 2, 3, 4].map((_, i) => (
          <div
            key={i}
            className="flex h-40 items-center justify-center rounded bg-gray-100"
          >
            Product {i + 1}
          </div>
        ))}
      </div>
    </section>
  );
}
