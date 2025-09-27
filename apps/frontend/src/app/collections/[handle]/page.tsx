import React from "react";

type ProductPageProps = {
  params: { handle: string };
};

export default async function ProductPage({ params }: ProductPageProps) {
  return <div>Collection {params.handle}</div>;
}
