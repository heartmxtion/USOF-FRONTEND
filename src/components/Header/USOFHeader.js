import axios from "axios";
import { React, useState, useEffect, useRef } from "react";
import { ListItem, Avatar, Tooltip, Box } from "@mui/material";
import { AdminPanelSettings } from "@mui/icons-material";
import {
  Header,
  Logo,
  HeaderList,
  Search,
  HeaderContainer,
  StyledNavLink,
  SearchWrapper,
  SearchInputWrapper,
  Searchs,
  SearchResultsContent,
  SearchResultsContentText,
  SearchResultsWrapper,
} from "./USOFHeader.styles";
import { jwtDecode } from "jwt-decode";

function USOFHeader() {
  const [error, setError] = useState(null);
  const [findedUsers, setFindedUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef(null);
  const jwtToken = localStorage.getItem("jwtToken");
  const [userData, setUserData] = useState([]);
  const currentUserId = jwtToken != null ? jwtDecode(jwtToken).userId : 0;

  async function userSearch(props) {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/search/users?search=${props}`
      );
      const users = response.data;
      const findedUsers = users.list;
      setFindedUsers(findedUsers);
      console.log(findedUsers);
    } catch (error) {
      console.error(error);
      if (error.response.status === 404) {
        searchResetter();
      }
      setError("Failed to fetch searched user");
    }
  }

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/users/${currentUserId}`
        );
        const data = response.data;
        setUserData(data);
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
      }
    }
    if (currentUserId !== 0) {
      fetchUserData();
    }
  }, [currentUserId]);

  function searchHandler(event) {
    const searchValue = event.target.value;
    setSearchValue(searchValue);
    userSearch(searchValue);
  }

  function searchResetter() {
    setSearchValue("");
    setFindedUsers([]);
  }

  return (
    <Header>
      <HeaderContainer>
        <Logo to={`/profile/${currentUserId}`}>
          <img src={process.env.PUBLIC_URL + "/usof.PNG"} alt="logo" />
          <h1>USOF</h1>
        </Logo>
        <HeaderList>
          <ListItem>
            {userData.role === "admin" ? (
              <StyledNavLink
                to={`/admin`}
                sx={{
                  marginLeft: "-8rem",
                  marginRight: "8rem",
                  width: "175px",
                }}
              >
                Admin panel
                <AdminPanelSettings />
              </StyledNavLink>
            ) : null}
            {currentUserId !== 0 ? (
              <Tooltip title="Show profile" placement="bottom">
                <StyledNavLink
                  sx={{ display: "flex", paddingRight: "20px", width: "190px" }}
                  to={`/profile/${currentUserId}`}
                >
                  <Avatar
                    src={`http://localhost:3000/${userData.avatar}`}
                    sx={{ width: 55, height: 55, marginRight: "5px" }}
                  />
                  {userData.login}<br/> role: {userData.role}
                </StyledNavLink>
              </Tooltip>
            ) : (
              <StyledNavLink to="/">Authorization</StyledNavLink>
            )}
          </ListItem>
          <ListItem>
            <StyledNavLink to="/posts">Posts</StyledNavLink>
          </ListItem>
          <ListItem>
            <StyledNavLink to="/categories">Categories</StyledNavLink>
          </ListItem>
          <ListItem>
            <StyledNavLink to="/users">Users</StyledNavLink>
          </ListItem>
        </HeaderList>
        <Search>
          <SearchWrapper>
            <SearchInputWrapper>
              <p>Search:</p>
              <Searchs
                variant="filled"
                ref={inputRef}
                value={searchValue}
                type="search"
                onChange={searchHandler}
              />
            </SearchInputWrapper>
            <SearchResultsWrapper>
              {findedUsers.length > 0
                ? findedUsers.map((user, index) => (
                    <SearchResultsContent
                      key={index}
                      to={"profile/" + user.id}
                      onClick={searchResetter}
                    >
                      <Avatar
                        src={`http://localhost:3000/${user.avatar}`}
                        sx={{ width: 50, height: 50 }}
                      />
                      <SearchResultsContentText>
                        <strong>{user.login}</strong>
                        <br />
                      </SearchResultsContentText>
                    </SearchResultsContent>
                  ))
                : null}
            </SearchResultsWrapper>
          </SearchWrapper>
        </Search>
      </HeaderContainer>
    </Header>
  );
}

export default USOFHeader;
