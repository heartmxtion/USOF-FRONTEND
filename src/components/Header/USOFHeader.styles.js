import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import TextField from "@mui/material/TextField";
import { NavLink, Link } from "react-router-dom";

export const Header = styled(AppBar)({
  color: "#dddddd",
  background: "#23252B",
  top: "0",
  width: "100%",
  height: "6rem",
  position: "sticky",
});

export const Logo = styled(Link)({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  textDecoration: "none",
  color: "inherit",
  "& img": {
    height: "6rem",
    width: "auto",
    marginRight: "1rem",
  },
});

export const HeaderList = styled(List)({
  display: "flex",
  alignItems: "center",
  listStyle: "none",
  marginTop: "0.8rem",
  color: "#dddddd",
  marginLeft: "120px"
});

export const Search = styled(Box)({
  display: "flex",
  alignItems: "center",
  marginTop: "10px",
  fontSize: "1.3rem",
  fontWeight: "650",
  zIndex: "2",
  position: "relative",
  color: "#dddddd",
});

export const HeaderContainer = styled(Toolbar)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  height: "100%",
  margin: "0 2rem",
});

export const StyledLink = styled(Link)({
  color: "inherit",
  fontWeight: "650",
  textDecoration: "none",
  fontSize: "1.3rem",
  transition: "color 0.3s ease",
  "&:hover": {
    color: "#5282de",
    textShadow: "0 0 1em #5282de",
    transition: "color 0.3s ease",
  },
})

export const SearchWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  marginRight: "20px",
})

export const SearchInputWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  "& p": {
    marginRight: "30px",
  },
})

export const SearchResultsWrapper = styled(Box)({
  width: "12rem",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "rgba(226, 226, 226, 0.788)",
  position: "absolute",
  top: "70%",
  left: "32%",
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
})

export const SearchResultsContent = styled(Link)({
  marginTop: "0.4rem",
  display: "flex",
  fontSize: "small",
  "&:hover": {
    borderLeft: "2px solid #5282de",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  "& img": {
    width: "3rem",
  },
})

export const SearchResultsContentText = styled(Box)({
  marginLeft: "0.2rem",
  color: "black",
})

export const StyledNavLink = styled(NavLink)({
  color: "inherit",
  fontWeight: "650",
  textDecoration: "none",
  fontSize: "1.3rem",
  transition: "color 0.3s ease",
  "&.active": {
    color: "#5282de",
  },
  "&:hover": {
    color: "#5282de",
    textShadow: "0 0 1em #5282de",
    transition: "color 0.3s ease",
  },
})

export const Searchs = styled(TextField)({
  "& .MuiInputBase-root": {
    width: "12rem",
    height: "2rem",
    color: "white",
    backgroundColor: "#2d2f37",
  },
  "& .MuiInputBase-input": {
    color: "inherit",
    fontSize: "1rem",
    fontWeight: "normal",
    position: "relative",
    paddingTop: "10px",
    paddingLeft: "-10px",
  },
  "&:hover": {
    boxShadow: "0 0 1em #5282de",
  },
})
