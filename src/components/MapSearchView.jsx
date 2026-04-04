import { useState, useEffect, useRef, useCallback } from "react";
import "../styles/MapSearchView.css";

export default function MapSearchView({ onAddPlace }) {
  const [mapProvider, setMapProvider] = useState("google");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);

  const clearMarkers = useCallback(() => {
    markers.current.forEach((m) => {
      if (m.setMap) m.setMap(null);
    });
    markers.current = [];
  }, []);

  const initGoogleMap = useCallback(() => {
    if (!window.google || !window.google.maps || !mapContainer.current) return;

    mapInstance.current = new window.google.maps.Map(mapContainer.current, {
      center: { lat: 37.5665, lng: 126.978 },
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
    });
  }, []);

  const initKakaoMap = useCallback(() => {
    if (!window.kakao || !window.kakao.maps || !mapContainer.current) return;

    window.kakao.maps.load(() => {
      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.978656),
        level: 3,
      };
      mapInstance.current = new window.kakao.maps.Map(
        mapContainer.current,
        options,
      );
    });
  }, []);

  useEffect(() => {
    const loadScripts = () => {
      if (!document.getElementById("google-maps-script")) {
        const gScript = document.createElement("script");
        gScript.id = "google-maps-script";
        gScript.src =
          "https://maps.googleapis.com/maps/api/js?key=AIzaSyC-xHXy7Rz52cXcED1FYej0_mC0PEXlTC0&libraries=places";
        gScript.async = true;
        gScript.onload = initGoogleMap;
        document.head.appendChild(gScript);
      } else {
        initGoogleMap();
      }

      if (!document.getElementById("kakao-map-script")) {
        const kScript = document.createElement("script");
        kScript.id = "kakao-map-script";
        kScript.src =
          "//dapi.kakao.com/v2/maps/sdk.js?appkey=614d7804ccdf491e881609d62667019d&libraries=services&autoload=false";
        kScript.async = true;
        kScript.onload = initKakaoMap;
        document.head.appendChild(kScript);
      } else {
        initKakaoMap();
      }
    };

    loadScripts();
  }, [initGoogleMap, initKakaoMap]);

  useEffect(() => {
    if (mapProvider === "google") {
      initGoogleMap();
    } else {
      initKakaoMap();
    }
  }, [mapProvider, initGoogleMap, initKakaoMap]);

  const handleSearch = () => {
    if (!searchKeyword.trim()) return;

    if (mapProvider === "google") {
      const service = new window.google.maps.places.PlacesService(
        mapInstance.current,
      );
      service.textSearch({ query: searchKeyword }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const formattedResults = results.map((r) => ({
            id: r.place_id,
            name: r.name,
            address: r.formatted_address,
          }));
          setSearchResults(formattedResults);

          clearMarkers();
          const bounds = new window.google.maps.LatLngBounds();
          results.forEach((place) => {
            const marker = new window.google.maps.Marker({
              map: mapInstance.current,
              position: place.geometry.location,
              title: place.name,
            });
            markers.current.push(marker);
            bounds.extend(place.geometry.location);
          });
          mapInstance.current.fitBounds(bounds);
        }
      });
    } else {
      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(searchKeyword, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const formattedResults = data.map((r) => ({
            id: r.id,
            name: r.place_name,
            address: r.address_name,
          }));
          setSearchResults(formattedResults);

          clearMarkers();
          const bounds = new window.kakao.maps.LatLngBounds();
          data.forEach((place) => {
            const position = new window.kakao.maps.LatLng(place.y, place.x);
            const marker = new window.kakao.maps.Marker({
              map: mapInstance.current,
              position: position,
            });
            markers.current.push(marker);
            bounds.extend(position);
          });
          mapInstance.current.setBounds(bounds);
        }
      });
    }
  };

  return (
    <div className="map-view-container">
      <div className="map-header">
        <div>
          <h2 className="text-[32px] font-bold text-[#1d1d1f] tracking-tight">
            지도 및 장소 검색
          </h2>
          <p className="text-[#86868b] mt-1 text-[15px]">
            선택한 지도 엔진으로 장소를 검색할 수 있습니다.
          </p>
        </div>

        <div className="map-toggle-container">
          <div
            className="map-toggle-slider"
            style={{
              left: mapProvider === "google" ? "4px" : "calc(50% + 0px)",
            }}
          />
          <button
            className={`map-toggle-btn ${mapProvider === "google" ? "active" : "inactive"}`}
            onClick={() => setMapProvider("google")}
          >
            Google Maps
          </button>
          <button
            className={`map-toggle-btn ${mapProvider === "kakao" ? "active" : "inactive"}`}
            onClick={() => setMapProvider("kakao")}
          >
            Kakao Maps
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 h-[calc(100vh-220px)]">
        <div className="map-search-panel">
          <div className="map-search-box">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="장소 이름 검색"
              className="map-search-input"
            />
            <button onClick={handleSearch} className="map-search-btn">
              검색
            </button>
          </div>

          <div className="map-result-box flex flex-col overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((place) => (
                <div
                  key={place.id}
                  className="p-4 border-b border-[#f5f5f7] hover:bg-[#f5f5f7] flex justify-between items-center w-full text-left"
                >
                  <div className="flex-1 mr-4">
                    <h3 className="font-semibold text-[15px]">{place.name}</h3>
                    <p className="text-[12px] text-[#86868b] line-clamp-1">
                      {place.address}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onAddPlace({
                        place_name: place.name,
                        address_name: place.address,
                      })
                    }
                    className="px-4 py-2 bg-[#007aff] text-white text-[13px] font-medium rounded-lg hover:bg-[#005bb5] transition-colors whitespace-nowrap"
                  >
                    일정에 추가
                  </button>
                </div>
              ))
            ) : (
              <div className="py-20 text-[#86868b] text-center font-medium">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="map-render-area flex-1">
          <div
            ref={mapContainer}
            className="w-full h-full rounded-[24px]"
          ></div>
        </div>
      </div>
    </div>
  );
}
