import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  Box,
  Container,
  List,
  ListItem,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  ThumbUpAlt,
  ThumbUpOffAlt,
  ThumbDownAlt,
  ThumbDownOffAlt,
} from "@mui/icons-material";
import axios from "axios";
import User from "./User";
import Comment from "./Comment";
import { useInView } from "react-intersection-observer";
import { jwtDecode } from "jwt-decode";

function Post() {
  const { postId } = useParams();
  const [postData, setPostData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPostData, setEditedPostData] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);

  const jwtToken = localStorage.getItem("jwtToken");
  const headers = {
    Authorization: `Bearer ${jwtToken}`,
  };
  const [ref, inView] = useInView({
    triggerOnce: true,
  });
  useEffect(() => {
    if (inView) {
      loadMoreComments();
    }
    // eslint-disable-next-line
  }, [inView]);

  const handlePostEdit = () => {
    setIsEditing(true);
    setEditedPostData(postData);
  };

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

  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/categories"
        );
        setAllCategories(
          response.data.map((category) => ({
            id: category.id,
            title: category.title,
          }))
        );
      } catch (error) {
        console.error("Ошибка при получении категорий:", error);
      }
    }

    fetchCategories();
  }, []);

  async function loadMoreComments() {
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await axios.get(
        `http://localhost:3000/api/posts/${postId}/comments?page=${nextPage}`,
        { headers: headers }
      );
      const newComments = response.data;
      setComments((prevComments) => [...prevComments, ...newComments]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Ошибка при загрузке следующей порции постов:", error);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    async function fetchPostFiles() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/posts/${postId}/files`
        );
        const files = response.data;

        console.log(files);
        setFiles(files);
      } catch (error) {
        console.error("Ошибка при получении файлов: ", error);
      }
    }
    fetchPostFiles();
  }, [postId]);

  useEffect(() => {
    async function fetchReactions() {
      const userId = jwtToken != null ? jwtDecode(jwtToken).userId : null;
      try {
        axios
          .get(`http://localhost:3000/api/like/posts/${postId}`)
          .then((response) => {
            const data = response.data;
            const likes = data.likes;
            const dislikes = data.dislikes;
            setLikes(likes.length);
            setDislikes(dislikes.length);
            const liked = likes.some((like) => like.author_id === userId);
            const disliked = dislikes.some(
              (dislike) => dislike.author_id === userId
            );
            if (liked === true) {
              setUserLiked(!userLiked);
            }
            if (disliked === true) {
              setUserDisliked(!userDisliked);
            }
            console.log(likes);
          });
      } catch (error) {
        console.error("Ошибка при получении реакций: ", error);
      }
    }
    fetchReactions();
    // eslint-disable-next-line
  }, [postId, jwtToken]);

  function handleLike() {
    if (userLiked === false) {
      axios
        .post(
          `http://localhost:3000/api/like/posts/${postId}`,
          { type: "like" },
          { headers: headers }
        )
        .then((response) => {
          setUserLiked(!userLiked);
          setUserDisliked(false);
          setLikes(likes + 1);
        })
        .catch((error) => {
          console.error("Ошибка при сохранении лайка:", error);
          if (error.response.status === 401) {
            localStorage.removeItem("jwtToken");
            navigate("/");
            alert("Token expired");
            window.location.reload();
          }
        });
    } else {
      axios
        .delete(`http://localhost:3000/api/like/posts/${postId}`, {
          headers: headers,
        })
        .then((response) => {
          setUserLiked(!userLiked);
          setLikes(likes - 1);
        })
        .catch((error) => {
          console.error("Ошибка при сохранении лайка:", error);
          if (error.response.status === 401) {
            localStorage.removeItem("jwtToken");
            navigate("/");
            alert("Token expired");
            window.location.reload();
          }
        });
    }
    if (userDisliked === true) {
      setDislikes(dislikes - 1);
    }
  }

  function handleDislike() {
    if (userDisliked === false) {
      axios
        .post(
          `http://localhost:3000/api/like/posts/${postId}`,
          { type: "dislike" },
          { headers: headers }
        )
        .then((response) => {
          setUserDisliked(!userDisliked);
          setUserLiked(false);
          setDislikes(dislikes + 1);
        })
        .catch((error) => {
          console.error("Ошибка при сохранении лайка:", error);
          if (error.response.status === 401) {
            localStorage.removeItem("jwtToken");
            navigate("/");
            alert("Token expired");
            window.location.reload();
          }
        });
    } else {
      axios
        .delete(`http://localhost:3000/api/like/posts/${postId}`, {
          headers: headers,
        })
        .then((response) => {
          setUserDisliked(!userDisliked);
          setDislikes(dislikes - 1);
        })
        .catch((error) => {
          console.error("Ошибка при сохранении лайка:", error);
          if (error.response.status === 401) {
            localStorage.removeItem("jwtToken");
            navigate("/");
            alert("Token expired");
            window.location.reload();
          }
        });
    }
    if (userLiked === true) {
      setLikes(likes - 1);
    }
  }

  const updateComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/posts/${postId}/comments`
      );
      const updatedComments = response.data;
      setCurrentPage(0);
      setComments(updatedComments);
    } catch (error) {
      console.error("Ошибка при загрузке комментариев:", error);
    }
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    setUploadPostFile([...uploadPostFile, ...files]);
  };
  useEffect(() => {
    async function fetchPostCategories() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/${postId}/categories`
        );
        const categories = response.data;
        setCategories(categories);
        setSelectedCategories(
          categories.map((category) => ({
            id: category.id,
            title: category.title,
          }))
        );
      } catch (error) {
        console.error("Ошибка при получении категорий: ", error);
      }
    }

    async function fetchPostData() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/posts/${postId}`
        );
        const post = response.data;
        setPostData(post);
      } catch (error) {
        console.error("Ошибка при получении поста: ", error);
      }
    }
    fetchPostCategories();
    fetchPostData();
  }, [postId]);

  useEffect(() => {
    if (postData) {
      console.log(postData);
      async function fetchUserData(userId) {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/users/${userId}`
          );
          const user = response.data;
          setUserData(user);
        } catch (error) {
          console.error("Ошибка при получении данных пользователя:", error);
        }
      }
      fetchUserData(postData.author_id);
    }
  }, [postData]);

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

  function handleCommentChange(event) {
    setComment(event.target.value);
  }

  async function handleCommentSubmit() {
    const userId = jwtToken != null ? jwtDecode(jwtToken).userId : null;

    if (!userId) {
      console.error("Ошибка: Пользователь не авторизован");
      alert("Пожалуйста, сперва авторизуйтесь!");
      navigate("/");
      return;
    }
    if (comment === "") {
      return;
    }
    try {
      await axios
        .post(
          `http://localhost:3000/api/posts/${postId}/comments`,
          {
            parentId: 0,
            content: comment,
          },
          { headers: headers }
        )
        .then((response) => {
          const newComment = response.data;
          comments.unshift(newComment);
          setComment("");
        })
        .catch((error) => {
          if (error.response.status === 401) {
            localStorage.removeItem("jwtToken");
            navigate("/");
            alert("Token expired");
            window.location.reload();
          }
        });
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
    }
  }
  async function handleDownload(filePath) {
    try {
      const file = filePath.split("/").pop();
      const response = await axios.get(
        `http://localhost:3000/api/files/${file}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filePath);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Ошибка при скачивании файла: ", error);
    }
  }

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategories(newValue);
  };

  const [uploadPostFile, setUploadPostFile] = useState([]);
  const handleSaveChanges = () => {
    try {
      const postData = new FormData();
      const selectedCategoryIds = selectedCategories.map(
        (category) => category.id
      );
      postData.append("title", editedPostData.title);
      postData.append("description", editedPostData.description);
      postData.append("content", editedPostData.content);
      postData.append("categories", selectedCategoryIds.join(","));
      uploadPostFile.forEach((file) => {
        postData.append("files", file);
      });
      axios
        .patch(`http://localhost:3000/api/posts/${postId}`, postData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          setIsEditing(false);
          window.location.reload();
        })
        .catch((error) => {
          console.error("Ошибка при редактировании публикации", error);
          if (error.response.status === 401) {
            localStorage.removeItem("jwtToken");
            navigate("/");
            alert("Token expired");
            window.location.reload();
          }
        });
    } catch (error) {
      console.error("Ошибка при сохранении изменений публикации: ", error);
    }
  };

  const handleOpenDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };
  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
  };

  const handleDeletePost = () => {
    axios
      .delete(`http://localhost:3000/api/posts/${postId}`, { headers: headers })
      .then((response) => {
        const userId = jwtToken != null ? jwtDecode(jwtToken).userId : null;
        navigate(`/profile/${userId}`);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          localStorage.removeItem("jwtToken");
          navigate("/");
          alert("Token expired");
          window.location.reload();
        }
        console.error("Ошибка при удалении публикации:", error);
      });

    setShowDeleteConfirmation(false);
  };

  const handleOpenStatusChange = () => {
    setShowStatusChange(true);
  };

  const handleCloseStatusChange = () => {
    setShowStatusChange(false);
  };

  const handleStatusChangeConfirm = () => {
    axios
      .patch(
        `http://localhost:3000/api/status/posts/${postId}`,
        {},
        {
          headers: headers,
        }
      )
      .then((response) => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("Ошибка при изменении статуса публикации", error);
        if (error.response.status === 401) {
          localStorage.removeItem("jwtToken");
          navigate("/");
          alert("Token expired");
          window.location.reload();
        }
      });
  };

  return (
    <Container style={{ marginTop: "2rem", paddingBottom: "80px" }}>
      {isEditing ? (
        <Box>
          <Paper
            elevation={3}
            style={{ padding: "20px", marginBottom: "10px" }}
          >
            <Typography variant="h5" gutterBottom>
              Editing
            </Typography>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              margin="normal"
              name="title"
              value={editedPostData ? editedPostData.title : ""}
              onChange={(e) =>
                setEditedPostData({
                  ...editedPostData,
                  title: e.target.value,
                })
              }
              required
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              margin="normal"
              name="description"
              value={editedPostData ? editedPostData.description : ""}
              onChange={(e) =>
                setEditedPostData({
                  ...editedPostData,
                  description: e.target.value,
                })
              }
              required
            />
            {categories && (
              <Autocomplete
                multiple
                id="categories"
                options={allCategories}
                value={selectedCategories}
                onChange={handleCategoryChange}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Categories"
                  />
                )}
              />
            )}
            <textarea
              rows={15}
              name="content"
              placeholder="Content"
              value={editedPostData.content}
              onChange={(e) =>
                setEditedPostData({
                  ...editedPostData,
                  content: e.target.value,
                })
              }
              required
              style={{ width: "100%", resize: "none", border: "none" }}
            />
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
            />
            <br />
            <br />
            <Alert severity="warning">
              Warning! Uploaded files are not detected when editing. Make sure
              you download everything you need.
            </Alert>
            <br />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveChanges}
                >
                  Save changes
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  style={{ marginLeft: "8px" }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </Box>
              <Button
                variant="outlined"
                color="error"
                onClick={handleOpenDeleteConfirmation}
              >
                Delete post
              </Button>
            </Box>
            <Dialog
              open={showDeleteConfirmation}
              onClose={handleCloseDeleteConfirmation}
            >
              <DialogTitle>Delete confirmation</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this post? This action
                  irreversible and will lead to the complete removal of
                  everything associated with your post including all files and
                  comments.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteConfirmation} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleDeletePost} color="error">
                  Delete post
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Box>
      ) : (
        <Box>
          <Paper
            elevation={3}
            style={{ padding: "20px", marginBottom: "10px" }}
          >
            {userData && (
              <Box>
                <Box style={{ display: "flex", marginBottom: "20px" }}>
                  <User userData={userData} />
                  <Box
                    style={{
                      marginLeft: "10px",
                      marginTop: "5px",
                      display: "flex",
                    }}
                  >
                    <Dialog
                      open={showStatusChange}
                      onClose={handleCloseStatusChange}
                    >
                      <DialogTitle>Changing status</DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          Are you sure you want to change the status of this
                          post? If the publication status is active, other users
                          can see and comment on it, otherwise this is not
                          possible.
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={handleCloseStatusChange}
                          color="primary"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleStatusChangeConfirm}
                          color="error"
                        >
                          Change status
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <Box style={{ width: "950px" }}>
                      <Typography variant="h6" gutterBottom>
                        Title: {postData.title}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        Description: {postData.description}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        Categories:{" "}
                        {categories
                          .map((category) => category.title)
                          .join(", ")}
                      </Typography>
                      {postData.author_id ===
                      (jwtToken != null ? jwtDecode(jwtToken).userId : "") ? (
                        <>
                          <Button
                            sx={{ left: "-8px" }}
                            onClick={handlePostEdit}
                          >
                            Edit
                          </Button>
                          <Button
                            sx={{ left: "-8px" }}
                            onClick={handleOpenStatusChange}
                          >
                            Change status
                          </Button>
                        </>
                      ) : (
                        <>
                          {"admin" ===
                          (jwtToken != null ? jwtDecode(jwtToken).role : "") ? (
                            <>
                              <Button
                                sx={{ left: "-8px" }}
                                onClick={handleOpenStatusChange}
                              >
                                Change status
                              </Button>
                              <Button onClick={handleDeletePost} color="error">
                                Delete post
                              </Button>
                            </>
                          ) : null}
                        </>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Date: {formatDate(postData.publish_date)}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        Status: {postData.status}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <textarea
                  rows={25}
                  value={postData ? postData.content : ""}
                  readOnly
                  style={{ width: "100%", resize: "none", border: "none" }}
                />
                <Box style={{ display: "flex" }}>
                  <Box style={{ width: "800px" }}>
                    <Typography variant="h6" gutterBottom>
                      Attached files:
                    </Typography>
                    <List>
                      {files.map((file) => (
                        <ListItem key={file.id}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleDownload(file.file_path)}
                          >
                            Download{" "}
                            {truncateText(file.file_path.split("/").pop(), 20)}
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Reactions:
                    </Typography>
                    <Button
                      variant={"text"}
                      color="primary"
                      onClick={handleLike}
                    >
                      {userLiked ? <ThumbUpAlt /> : <ThumbUpOffAlt />}
                      {likes}
                    </Button>
                    <Button
                      variant={"text"}
                      color="secondary"
                      onClick={handleDislike}
                    >
                      {userDisliked ? <ThumbDownAlt /> : <ThumbDownOffAlt />}
                      {dislikes}
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
          {postData ? (
            <Paper
              elevation={3}
              style={{ padding: "20px", marginBottom: "40px" }}
            >
              <Typography variant="h6" gutterBottom>
                Comments:
              </Typography>
              {postData.status === "active" ? (
                <>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    variant="outlined"
                    label="Write a comment"
                    value={comment}
                    onChange={handleCommentChange}
                    margin="normal"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCommentSubmit}
                  >
                    Send a comment
                  </Button>
                </>
              ) : null}
              <List>
                {comments.map((comment) => (
                  <Box key={comment.id}>
                    <Comment
                      comment={comment}
                      updateComments={updateComments}
                      postData={postData}
                    />
                  </Box>
                ))}
              </List>
              {loadingMore && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    margin: "20px",
                  }}
                >
                  <CircularProgress />
                </div>
              )}
              <div style={{ height: "10px" }} ref={loadingMore ? null : ref} />
            </Paper>
          ) : null}
        </Box>
      )}
    </Container>
  );
}

export default Post;
