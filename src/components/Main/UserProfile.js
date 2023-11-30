import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Posts from "./Posts";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Grid,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Autocomplete,
} from "@mui/material";
import { Avatar } from "@mui/material";
import StyledRating from "./StyledRating";
import { jwtDecode } from "jwt-decode";

function UserProfile() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({ name: "", login: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [postsKey, setPostsKey] = useState(0);
  const jwtToken = localStorage.getItem("jwtToken");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [config, setConfig] = useState("");
  const navigate = useNavigate();
  const [newPostData, setNewPostData] = useState({
    title: "",
    description: "",
    content: "",
    categories: [],
  });

  const [uploadPostFile, setUploadPostFile] = useState([]);

  const headers = {
    Authorization: `Bearer ${jwtToken}`,
  };
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleFileUpload = (e) => {
    const files = e.target.files;
    setUploadPostFile([...uploadPostFile, ...files]);
  };
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/users/${userId}`
        );
        const data = response.data;
        setUserData(data);
        setConfig(`http://localhost:3000/api/posts/user/${userId}`);
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userId]);

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/categories"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Ошибка при получении категорий:", error);
      }
    }

    fetchCategories();
  }, []);

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategories(newValue);
  };

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.full_name || "",
        login: userData.login || "",
        email: userData.email || "",
      });
      setPostsKey((prevKey) => prevKey + 1);
    }
  }, [userData, config]);
  if (loading) {
    return (
      <Container style={{ textAlign: "center", marginTop: "10%" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container style={{ textAlign: "center", marginTop: "10%" }}>
        <Typography variant="h5" gutterBottom>
          Не удалось загрузить данные пользователя.
        </Typography>
      </Container>
    );
  }

  const handleSaveChanges = (e) => {
    e.preventDefault();
    try {
      axios
        .patch(
          `http://localhost:3000/api/users/${userId}`,
          {
            userId: userId,
            fullName: formData.name,
            email: formData.email,
            login: formData.login,
          },
          { headers: headers }
        )
        .then((response) => {
          setIsEditing(false);
          window.location.reload();
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
      console.error("Ошибка при отправке изменённых данных:", error);
    }
  };
  const handleEditProfile = (e) => {
    e.preventDefault();
    axios
      .post(
        "http://localhost:3000/api/users/edit",
        {
          userId: userId,
        },
        { headers: headers }
      )
      .then((response) => {
        setIsEditing(true);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          localStorage.removeItem("jwtToken");
          navigate("/");
          alert("Token expired");
          window.location.reload();
        }
      });
  };

  const handleCancelEdit = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/api/auth/logout", {}, { headers: headers })
      .then((response) => {
        localStorage.removeItem("jwtToken");
        navigate("/");
        window.location.reload();
      })
      .catch((error) => {
        if (error.response.status === 401) {
          localStorage.removeItem("jwtToken");
          navigate("/");
          alert("Token expired");
          window.location.reload();
        }
        console.error(error);
      });
  };

  const handleOpenDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };
  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
  };

  const handleDeleteProfile = () => {
    axios
      .delete(`http://localhost:3000/api/users/${userId}`, { headers: headers })
      .then((response) => {
        if('admin' !== (jwtToken != null ? jwtDecode(jwtToken).role : "")){
          localStorage.removeItem("jwtToken");
          navigate("/");
        } else {
          window.location.reload();
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          localStorage.removeItem("jwtToken");
          navigate("/");
          alert("Token expired");
          window.location.reload();
        }
        console.error("Ошибка при удалении профиля:", error);
      });

    setShowDeleteConfirmation(false);
  };

  const handleAvatarChange = () => {
    inputRef.current.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const userAvatar = new FormData();
      userAvatar.append("avatar", file);
      await axios
        .patch(`http://localhost:3000/api/users/update/avatar`, userAvatar, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          const data = response.data;
          console.log(data);
          window.location.reload();
        })
        .catch((error) => {
          console.error("Ошибка при загрузке аватара:", error);
          if (error.response.status === 401) {
            localStorage.removeItem("jwtToken");
            navigate("/");
            alert("Token expired");
            window.location.reload();
          }
        });
    }
  };

  const handleCreatePost = () => {
    setIsCreatingPost(true);
  };

  const handleNewPostChange = (e) => {
    const { name, value } = e.target;
    setNewPostData({
      ...newPostData,
      [name]: value,
    });
  };

  const handleCancelCreatePost = () => {
    setIsCreatingPost(false);
  };

  const handleCreateNewPost = async () => {
    const requiredFields = ["title", "description", "content"];

    for (const field of requiredFields) {
      if (!newPostData[field]) {
        alert(`Поле ${field} обязательно для заполнения`);
        return;
      }
    }
    try {
      const postData = new FormData();
      postData.append("authorId", userId);
      postData.append("title", newPostData.title);
      postData.append("description", newPostData.description);
      postData.append("content", newPostData.content);
      const selectedCategoryIds = selectedCategories.map(
        (category) => category.id
      );
      postData.append("categories", selectedCategoryIds.join(","));
      uploadPostFile.forEach((file) => {
        postData.append("files", file);
      });
      await axios
        .post(`http://localhost:3000/api/posts`, postData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          console.log("Пост успешно создан:", response.data);
          setNewPostData({
            title: "",
            description: "",
            content: "",
            categories: [],
            files: [],
          });
          setSelectedCategories([]);
          setIsCreatingPost(false);
          setPostsKey((prevKey) => prevKey + 1);
        })
        .catch((error) => {
          console.error("Ошибка при создании публикации", error);
          if (error.response.status === 401) {
            localStorage.removeItem("jwtToken");
            navigate("/");
            alert("Token expired");
            window.location.reload();
          }
        });
    } catch (error) {
      console.error("Ошибка при создании поста:", error);
    }
  };

  return (
    <Box>
      <Container style={{ marginTop: "2rem", paddingBottom: "130px" }}>
        <Paper elevation={3} style={{ padding: "20px" }}>
          <Typography variant="h4" gutterBottom>
            User's profile
          </Typography>
          <Avatar
            src={`http://localhost:3000/${userData.avatar}`}
            sx={{ width: 100, height: 100, marginBottom: 2 }}
            onClick={handleAvatarChange}
          />
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarUpload}
            ref={inputRef}
          />
          {isEditing ? (
            <form onSubmit={handleSaveChanges}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                margin="normal"
                name="name"
                value={formData.name !== null ? formData.name : undefined}
                onChange={handleChange}
              />
              <TextField
                label="Login"
                variant="outlined"
                fullWidth
                margin="normal"
                name="login"
                value={formData.login}
                onChange={handleChange}
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Grid container justifyContent="space-between">
                <Box>
                  <Button variant="contained" color="primary" type="submit">
                    Save changes
                  </Button>
                  <Button
                    style={{ marginLeft: "8px" }}
                    variant="contained"
                    color="inherit"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleOpenDeleteConfirmation}
                >
                  Delete account
                </Button>
              </Grid>
              <Dialog
                open={showDeleteConfirmation}
                onClose={handleCloseDeleteConfirmation}
              >
                <DialogTitle>Delete confirmation</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to delete your account? This action
                    irreversible and will lead to the complete removal of
                    everything associated with your profile including: login,
                    password.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleCloseDeleteConfirmation}
                    color="primary"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleDeleteProfile} color="error">
                    Delete account
                  </Button>
                </DialogActions>
              </Dialog>
            </form>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Name: {userData.full_name}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Login: {userData.login}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Email: {userData.email}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Rating: {userData.rating === 0 ? 0 : userData.rating} <br />
                <StyledRating
                  rating={userData.rating === 0 ? 0 : userData.rating}
                />
              </Typography>
              {userData.id ===
              (jwtToken != null ? jwtDecode(jwtToken).userId : "") ? (
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleEditProfile}
                  >
                    Edit profile
                  </Button>
                  <Button
                    style={{ marginLeft: "8px" }}
                    variant="contained"
                    color="primary"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Box>
              ) : (
                <>
                  {"admin" ===
                    (jwtToken != null ? jwtDecode(jwtToken).role : "") && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleEditProfile}
                    >
                      Edit profile
                    </Button>
                  )}
                </>
              )}
            </Box>
          )}
        </Paper>
        {isEditing ? null : (
          <Paper elevation={3} style={{ padding: "20px", marginTop: "1px" }}>
            <Box style={{ display: "flex" }}>
              <Typography variant="h5" gutterBottom>
                User's posts
              </Typography>
              {userData.id ===
                (jwtToken != null ? jwtDecode(jwtToken).userId : "") && (
                <Button
                  variant="outlined"
                  style={{ marginBottom: "5px", marginLeft: "5px" }}
                  onClick={handleCreatePost}
                >
                  Create
                </Button>
              )}
            </Box>
            <Posts key={postsKey} config={config}></Posts>
            <Dialog open={isCreatingPost} onClose={handleCancelCreatePost}>
              <DialogTitle>Creating of new post</DialogTitle>
              <DialogContent>
                <TextField
                  label="Title"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="title"
                  value={newPostData.title}
                  onChange={handleNewPostChange}
                  required
                />
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="description"
                  value={newPostData.description}
                  onChange={handleNewPostChange}
                  required
                />
                {categories && (
                  <Autocomplete
                    multiple
                    id="categories"
                    options={categories}
                    getOptionLabel={(option) => option.title}
                    value={selectedCategories}
                    onChange={handleCategoryChange}
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
                  value={newPostData.content}
                  onChange={handleNewPostChange}
                  required
                  style={{ width: "100%", resize: "none", border: "none" }}
                />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelCreatePost} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleCreateNewPost} color="primary">
                  Create post
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default UserProfile;
