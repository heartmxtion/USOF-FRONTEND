import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
  TextField,
} from "@mui/material";
import HoverTransition from "./HoverTransition";
import HoverTransitionEdit from "./HoverTransitionEdit";
import { jwtDecode } from "jwt-decode";

function Categories() {
  const [categories, setCategories] = useState([]);
  const jwtToken = localStorage.getItem("jwtToken");
  const navigate = useNavigate();

  async function fetchCategories() {
    try {
      const response = await axios.get("http://localhost:3000/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Ошибка при получении категорий:", error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const initialCategoryFormData = {
    title: "",
    description: "",
  };

  const [categoryFormData, setCategoryFormData] = useState(
    initialCategoryFormData
  );

  const handleCategoryFormChange = (event) => {
    setCategoryFormData({
      ...categoryFormData,
      [event.target.name]: event.target.value,
    });
  };

  const headers = {
    Authorization: `Bearer ${jwtToken}`,
  };

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    async function fetchSpecifiedCategories() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/categories/${selectedCategoryId}`
        );
        setCategoryFormData({
          title: response.data.title,
          description: response.data.description,
        });
      } catch (error) {
        console.error("Ошибка при получении категорий:", error);
      }
    }

    if (selectedCategoryId !== null) {
      fetchSpecifiedCategories();
    }
  }, [selectedCategoryId]);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleOpenDeleteConfirmation = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setShowDeleteConfirmation(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setSelectedCategoryId(null);
    setShowDeleteConfirmation(false);
  };

  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleOpenEditDialog = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedCategoryId(null);
    setShowEditDialog(false);
  };

  const handleEdit = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/api/categories/${selectedCategoryId}`,
        categoryFormData,
        { headers: headers }
      ).then((response)=>{
        fetchCategories();
        handleCloseEditDialog();
      })

    } catch (error) {
      if (error.response.status === 401) {
        localStorage.removeItem("jwtToken");
        navigate("/");
        alert("Token expired");
        window.location.reload();
      }
      console.error("Ошибка при редактировании категории:", error);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/categories/${selectedCategoryId}`,
        { headers: headers }
      );
      fetchCategories();
      handleCloseDeleteConfirmation();
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.removeItem("jwtToken");
        navigate("/");
        alert("Token expired");
        window.location.reload();
      }
      console.error("Ошибка при удалении категории:", error);
    }
  };

  return (
    <Container style={{ marginTop: "2rem", paddingBottom: "8rem" }}>
      <Paper elevation={3} style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          List of categories
        </Typography>
        <List
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
            gap: "10px",
          }}
        >
          <Dialog open={showEditDialog} onClose={handleCloseEditDialog}>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogContent>
              <TextField
                required
                autoFocus
                margin="dense"
                id="title"
                name="title"
                label="Title"
                type="text"
                fullWidth
                value={categoryFormData.title}
                onChange={handleCategoryFormChange}
              />
              <TextField
                required
                margin="dense"
                id="description"
                name="description"
                label="Description"
                type="text"
                fullWidth
                value={categoryFormData.description}
                onChange={handleCategoryFormChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditDialog}>Cancel</Button>
              <Button onClick={handleEdit} color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={showDeleteConfirmation}
            onClose={handleCloseDeleteConfirmation}
          >
            <DialogTitle>Delete confirmation</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this category? This is action
                irreversible and will lead to the deletion of the category, and
                in it will disappear in all publications where it was used.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteConfirmation} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDeleteCategory} color="error">
                Delete category
              </Button>
            </DialogActions>
          </Dialog>
          {categories.map((category) => (
            <Paper
              key={category.id}
              elevation={3}
              style={{
                width: "100%",
                minHeight: "150px",
                maxHeight: "200px",
                flex: "1 0 auto",
              }}
            >
              <ListItem
                style={{
                  display: "grid",
                  gridTemplateRows: "auto 1fr auto",
                  gap: "10px",
                  height: "100%",
                }}
              >
                <Link
                  to={`/posts/category/${category.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <ListItemText
                    primary={category.title}
                    secondary={truncateText(category.description, 370)}
                  />
                </Link>
                {"admin" ===
                  (jwtToken != null ? jwtDecode(jwtToken).role : "") && (
                  <Box sx={{ textAlign: "right" }}>
                    <HoverTransitionEdit
                      activation={() => handleOpenEditDialog(category.id)}
                    />
                    <HoverTransition
                      activation={() =>
                        handleOpenDeleteConfirmation(category.id)
                      }
                    />
                  </Box>
                )}
              </ListItem>
            </Paper>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default Categories;
