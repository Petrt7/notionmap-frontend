import { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyCtQqdjRPi9njWQ8XwortNNXfjka0ANVaA"; // ← 請替換成你自己的 API 金鑰

export default function NotionMapViewer() {
    const params = new URLSearchParams(window.location.search);
    const defaultQuery = params.get("query") || "台北車站";
    const [query, setQuery] = useState(defaultQuery);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<google.maps.Map>();

    useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => initMap();
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (mapInstance.current) {
            searchPlace(query);
        }
    }, [query]);

    function initMap() {
        if (mapRef.current) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
                center: { lat: 25.033964, lng: 121.564468 },
                zoom: 15,
            });
            searchPlace(query);
        }
    }

    function searchPlace(place: string) {
        if (!mapInstance.current) return;

        const service = new google.maps.places.PlacesService(mapInstance.current);
        const request = {
            query: place,
            fields: ["name", "geometry"],
        };

        service.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
                const location = results[0].geometry?.location;
                if (location) {
                    mapInstance.current?.setCenter(location);
                    new google.maps.Marker({
                        map: mapInstance.current,
                        position: location,
                    });
                }
            }
        });
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">Notion 地圖查看器</h1>

            <input
                type="text"
                placeholder="輸入地點..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full max-w-md px-4 py-2 border rounded-xl shadow-sm mb-4"
            />

            <div
                className="w-full max-w-4xl aspect-video border-2 border-gray-200 rounded-2xl overflow-hidden"
                ref={mapRef}
            />
        </div>
    );
}
