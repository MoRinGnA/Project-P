import { useState, useEffect, useRef, useCallback } from "react";
import AddScheduleModal from "./AddScheduleModal";
import "../styles/MapSearchView.css";

export default function MapSearchView({
  onAddPlace,
  mapSearchState,
  mapProvider,
  setMapProvider,
  days = [1],
  activeDay = 1,
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 모달에 전달할 장소 정보 상태
  const [pendingPlace, setPendingPlace] = useState(null);

  const googleMapContainer = useRef(null);
  const kakaoMapContainer = useRef(null);
  const googleMapInstance = useRef(null);
  const kakaoMapInstance = useRef(null);
  const markers = useRef([]);

  const clearMarkers = useCallback(() => {
    markers.current.forEach((m) => {
      if (m.setMap) m.setMap(null);
    });
    markers.current = [];
  }, []);

  const initGoogleMap = useCallback(() => {
    if (!window.google || !window.google.maps || !googleMapContainer.current)
      return;

    if (!googleMapInstance.current) {
      googleMapInstance.current = new window.google.maps.Map(
        googleMapContainer.current,
        {
          center: { lat: 37.5665, lng: 126.978 },
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
        },
      );
    }
    setIsMapReady(true);
  }, []);

  const initKakaoMap = useCallback(() => {
    if (!window.kakao || !window.kakao.maps || !kakaoMapContainer.current)
      return;

    window.kakao.maps.load(() => {
      if (!kakaoMapInstance.current) {
        const options = {
          center: new window.kakao.maps.LatLng(37.566826, 126.978656),
          level: 3,
        };
        kakaoMapInstance.current = new window.kakao.maps.Map(
          kakaoMapContainer.current,
          options,
        );
      }
      setIsMapReady(true);
    });
  }, []);

  useEffect(() => {
    if (mapProvider === "kakao" && kakaoMapInstance.current && window.kakao) {
      window.kakao.maps.load(() => {
        kakaoMapInstance.current.relayout();
        kakaoMapInstance.current.setCenter(
          new window.kakao.maps.LatLng(37.566826, 126.978656),
        );
      });
    }
  }, [mapProvider]);

  const sortRelevantResults = (results, keyword) => {
    const query = keyword.toLowerCase().replace(/\s+/g, "");
    return results.sort((a, b) => {
      const aName = a.name.toLowerCase().replace(/\s+/g, "");
      const bName = b.name.toLowerCase().replace(/\s+/g, "");

      if (aName === query && bName !== query) return -1;
      if (bName === query && aName !== query) return 1;

      if (aName.includes(query) && !bName.includes(query)) return -1;
      if (!aName.includes(query) && bName.includes(query)) return 1;

      return 0;
    });
  };

  const performSearch = useCallback(
    (keyword, fromClick = false) => {
      if (!keyword.trim()) return;

      setIsSearching(true);

      if (mapProvider === "google") {
        if (!googleMapInstance.current) return;
        const service = new window.google.maps.places.PlacesService(
          googleMapInstance.current,
        );
        service.textSearch({ query: keyword }, (results, status) => {
          setIsSearching(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const formattedResults = results.map((r) => ({
              id: r.place_id,
              name: r.name,
              address: r.formatted_address,
              position: r.geometry.location,
            }));

            const sortedResults = sortRelevantResults(
              formattedResults,
              keyword,
            );
            setSearchResults(sortedResults);

            clearMarkers();
            const bounds = new window.google.maps.LatLngBounds();
            sortedResults.forEach((place) => {
              const marker = new window.google.maps.Marker({
                map: googleMapInstance.current,
                position: place.position,
                title: place.name,
              });
              markers.current.push(marker);
              bounds.extend(place.position);
            });
            googleMapInstance.current.fitBounds(bounds);
          } else {
            setSearchResults([]);
          }
        });
      } else {
        if (!window.kakao || !kakaoMapInstance.current) return;
        const ps = new window.kakao.maps.services.Places();
        const cleanKeyword = keyword
          .replace(/\([^)]*\)/g, "")
          .replace(/ 방문| 식사| 관람| 투어| 산책/g, "")
          .trim();

        ps.keywordSearch(cleanKeyword, (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            setIsSearching(false);
            const formattedResults = data.map((r) => ({
              id: r.id,
              name: r.place_name,
              address: r.address_name,
              position: new window.kakao.maps.LatLng(r.y, r.x),
            }));

            const sortedResults = sortRelevantResults(
              formattedResults,
              cleanKeyword,
            );
            setSearchResults(sortedResults);

            clearMarkers();
            const bounds = new window.kakao.maps.LatLngBounds();
            sortedResults.forEach((place) => {
              const marker = new window.kakao.maps.Marker({
                map: kakaoMapInstance.current,
                position: place.position,
              });
              markers.current.push(marker);
              bounds.extend(place.position);
            });
            kakaoMapInstance.current.setBounds(bounds);
          } else {
            if (fromClick) {
              setMapProvider("google");
            } else {
              setIsSearching(false);
              setSearchResults([]);
            }
          }
        });
      }
    },
    [mapProvider, clearMarkers, setMapProvider],
  );

  useEffect(() => {
    setIsMapReady(false);
    const loadScripts = () => {
      if (!document.getElementById("google-maps-script")) {
        const gScript = document.createElement("script");
        gScript.id = "google-maps-script";
        gScript.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        gScript.async = true;
        gScript.onload = initGoogleMap;
        document.head.appendChild(gScript);
      } else {
        initGoogleMap();
      }

      if (!document.getElementById("kakao-map-script")) {
        const kScript = document.createElement("script");
        kScript.id = "kakao-map-script";
        kScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAPS_API_KEY}&libraries=services&autoload=false`;
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
    if (isMapReady && mapSearchState && mapSearchState.query) {
      setSearchKeyword(mapSearchState.query);
      const timeoutId = setTimeout(() => {
        performSearch(mapSearchState.query, mapSearchState.fromClick);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isMapReady, mapSearchState, performSearch]);

  const handleSearch = () => {
    performSearch(searchKeyword, false);
  };

  return (
    <div className="map-view-container relative">
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

      <div className="flex flex-1 gap-6 h-[calc(100vh-220px)] relative">
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
            {isSearching ? (
              <div className="py-20 text-[#007aff] text-center font-medium animate-pulse">
                장소를 찾고 있습니다...
              </div>
            ) : searchResults.length > 0 ? (
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
                      setPendingPlace({
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
                <br />
                <span className="text-[13px] mt-2 block">
                  해외 장소이거나 구체적인 주소라면 Google Maps를 이용해보세요.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="map-render-area flex-1 relative rounded-[24px] overflow-hidden bg-[#f5f5f7]">
          <div
            ref={googleMapContainer}
            className="absolute inset-0"
            style={{ display: mapProvider === "google" ? "block" : "none" }}
          ></div>

          <div
            ref={kakaoMapContainer}
            className="absolute inset-0"
            style={{ display: mapProvider === "kakao" ? "block" : "none" }}
          ></div>

          {/* 분리된 모달 컴포넌트 렌더링 */}
          <AddScheduleModal
            place={pendingPlace}
            days={days}
            activeDay={activeDay}
            onClose={() => setPendingPlace(null)}
            onAdd={onAddPlace}
          />
        </div>
      </div>
    </div>
  );
}
