import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material";
import User from "./User";
import { useInView } from "react-intersection-observer";
import { jwtDecode } from "jwt-decode";

function Posts({config, sortBy, startDate, endDate, selectedStatus }) {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const jwtToken = localStorage.getItem("jwtToken");
  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  useEffect(() => {
    if(inView) {
      loadMorePosts();
    }
    // eslint-disable-next-line
  }, [inView])

  const headers = {
    Authorization: `Bearer ${jwtToken}`,
  };

  async function loadMorePosts() {
    setLoadingMore(true);
    let endpoint = `${config}?`;
    if (sortBy) {
      endpoint += `sortBy=${sortBy}`;
    }
    if (startDate) {
      endpoint += `&startDate=${startDate}`;
    }
    if (endDate) {
      endpoint += `&endDate=${endDate}`;
    }
    if (selectedStatus) {
      endpoint += `&selectedStatus=${selectedStatus}&`;
    }
    endpoint += `page=${currentPage}`;

    console.log(endpoint);
    try {
        const response = await axios.get(endpoint);
      const posts = response.data;
      await fetchPostsCategories(posts);
      const users = await Promise.all(
        posts.map((post) => fetchUserData(post.author_id))
      );
      setUsersData((prevUsers) => [...prevUsers, ...users]);
      setPosts((prevPosts) => [...prevPosts, ...posts]);
      setCurrentPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Ошибка при загрузке следующей порции постов:", error);
    } finally {
      setLoadingMore(false);
    }
  }

  async function fetchUserData(userId) {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/users/${userId}`
      );
      const user = response.data;
      return user;
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
      return null;
    }
  }

  async function fetchPostsCategories(posts) {
    const categoriesPromises = posts.map(async (post) => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/${post.id}/categories`
        );
        const categories = response.data;
        return { postId: post.id, categories };
      } catch (error) {
        console.error("Ошибка при получении категорий: ", error);
        return { postId: post.id, categories: [] };
      }
    });

    Promise.all(categoriesPromises).then((categoriesData) => {
      setCategories((prevCategoriesData) => [
        ...prevCategoriesData,
        ...categoriesData,
      ]);
    });
  }

  function formatCategories(categories) {
    if (categories) {
      return categories.map((category) => category.title).join(", ");
    } else {
      return "No categories";
    }
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    } else {
      let truncatedText = text.substring(0, maxLength);
      while (truncatedText.charAt(truncatedText.length - 1) === " ") {
        truncatedText = truncatedText.slice(0, -1);
      }
      return truncatedText + "...";
    }
  }

  function formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <Box>
      {posts.map((post) => (
        <Paper
          elevation={3}
          style={{ padding: "15px", margin: "10px" }}
          key={post.id}
        >
          <NavLink
            to={`/posts/post/${post.id}`}
            style={{
              display: "flex",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Box style={{ marginRight: "15px" }}>
              <User
                userData={usersData.find((user) => user.id === post.author_id)}
              />
            </Box>
            <Box style={{ width: "750px" }}>
              <Typography>
                Categories:{" "}
                {formatCategories(
                  categories.find((data) => data.postId === post.id)?.categories
                ) || "No categories"}
              </Typography>
              <Typography variant="h6">
                {truncateText(post.title, 70)}
              </Typography>
              <Typography>{truncateText(post.description, 80)}</Typography>
            </Box>
            <Box style={{ textAlign: "right" }}>
              {formatDate(post.publish_date)}<br/><br/><br/>
              Status: {post.status}
            </Box>
          </NavLink>
        </Paper>
      ))}
      {loadingMore && (
        <div
          style={{ display: "flex", justifyContent: "center", margin: "20px" }}
        >
          <CircularProgress />
        </div>
      )}
      <div style={{ height: "10px" }} ref={loadingMore ? null : ref} />
    </Box>
  );
}

export default Posts;
