import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";

import "./style.scss";

import { fetchDataFromApi } from "../../utils/api";
import ContentWrapper from "../../components/contentWrapper/ContentWrapper";
import MovieCard from "../../components/movieCard/MovieCard";
import Spinner from "../../components/spinner/Spinner";
import noResults from "../../assets/no-results.png";

const SearchResult = () => {
  const [data, setData] = useState({});
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const { query } = useParams();

  const fetchInitialData = () => {
    setLoading(true);
    fetchDataFromApi(`/search/multi?query=${query}&page=${pageNum}`)
      .then((res) => {
        setData(res);
        setPageNum(pageNum + 1); 
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching initial data:", error);
        setLoading(false);
      });
  };

  const fetchNextPageData = () => {
    fetchDataFromApi(`/search/multi?query=${query}&page=${pageNum}`)
      .then((res) => {
        if (data?.results) {
          setData({
            ...data,
            results: [...data?.results, ...res.results],
          });
        } else {
          setData(res);
        }
        setPageNum(pageNum + 1);
      })
      .catch((error) => {
        console.error("Error fetching next page data:", error);
      });
  };

  useEffect(() => {
    setPageNum(1); 
    fetchInitialData();
  }, [query]);

  return (
    <div className="searchResultsPage">
      {loading && <Spinner initial={true} />}
      {!loading && (
        <ContentWrapper>
          {data?.results && data?.results?.length > 0 ? (
            <>
              <div className="pageTitle">
                {`Search ${
                  data.total_results > 1 ? "results" : "result"
                } of '${query}'`}
              </div>
              <InfiniteScroll
                className="content"
                dataLength={data?.results?.length || []}
                next={fetchNextPageData}
                hasMore={pageNum <= data?.total_pages}
                loader={<Spinner />}
              >
                {data?.results.map((item, index) => {
                  if (item.media_type === "person") return null; 
                  return (
                    <MovieCard key={index} data={item} fromSearch={true} />
                  );
                })}
              </InfiniteScroll>
            </>
          ) : (
            <span className="resultNotFound">Sorry, Results not found!</span>
          )}
        </ContentWrapper>
      )}
    </div>
  );
};

export default SearchResult;

