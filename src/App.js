import {Routes, Route, Navigate} from "react-router-dom";

import Layout from './components/Layout';
import Register from './components/Main/Register';
import Auth from './components/Main/Auth';
import Recover from './components/Main/Recover';
import RecoverForm from './components/Main/RecoverForm';
import Confirm from './components/Main/Confirm';
import UserProfile from './components/Main/UserProfile';
import ErrorPage from './components/Main/ErrorPage';
import Categories from './components/Main/Categories';
import AllPosts from './components/Main/AllPosts';
import Post from './components/Main/Post';
import Users from './components/Main/Users';
import CategoryPosts from './components/Main/CategoryPosts';
import AdminPanel from "./components/Main/AdminPanel";
import React , { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";


function App() {
  return (
    <div>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Auth />}/>
            <Route path="/register" element={<Register />}/>
            <Route path="/recover" element={<Recover />}/>
            <Route path="/confirm/:token" element={<Confirm />} />
            <Route path="/reset-password/:token" element={<RecoverForm />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/posts" element={<AllPosts />} />
            <Route path="posts/category/:categoryId" element={< CategoryPosts />} />
            <Route path="/posts/post/:postId" element={<Post />} />
            <Route path="/users" element={<Users />} />
            <Route path="/profile/0" element={<Auth />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<ErrorPage></ErrorPage>}/>
          </Route>
        </Routes>
    </div>
  );
}

export default App;
