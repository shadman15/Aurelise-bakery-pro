import { useLocation } from "react-router-dom";
import CatalogGrid from "../components/CatalogGrid";
import { useState } from "react";

const dummyProducts = [
	{ id: 1, name: "Chocolate Croissant", price: 3.5 },
	{ id: 2, name: "Almond Tart", price: 4.0 },
	{ id: 3, name: "Baguette", price: 2.0 },
	{ id: 4, name: "Eclair", price: 3.0 },
	{ id: 5, name: "Chocolate Cake", price: 6.0 },
	{ id: 6, name: "Vanilla Cake", price: 5.5 },
	{ id: 7, name: "Red Velvet Cake", price: 7.0 },
];

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

const Catalog = ({ onAddToCart }: { onAddToCart: (product: any) => void }) => {
	const [products] = useState(dummyProducts);
	const query = useQuery();
	const search = query.get("search")?.toLowerCase() || "";

	const filtered = search
		? products.filter((p) => p.name.toLowerCase().includes(search))
		: products;

	return <CatalogGrid products={filtered} onAddToCart={onAddToCart} />;
};

export default Catalog;