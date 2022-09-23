import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from 'easy-peasy';
import store from '@/store';
import PhotoGrid from '@/pages/photo-grid';
import Single from '@/pages/single';

export default function Root() {
  return (
    <>
      <StoreProvider store={store}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <h1>
            <Link to="/">Reduxstagram</Link>
          </h1>
          <Routes>
            <Route index={true} element={<PhotoGrid />}></Route>
            <Route path="/view/:postId" element={<Single />} />
            <Route path={'*'} element={<Navigate to={'/'} />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </>
  );
}
