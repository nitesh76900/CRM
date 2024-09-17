import React from 'react'
import './App.css'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import {HomePage, LoginPage, SignupPage, UserDashboardPage} from './Pages/allPages'
import {MeetingRequestPage, ProjectStatusPage , QueryPage} from './Components/allComponents'

function App() {

  const router  = createBrowserRouter([
    {
      path:'/',
      element:<HomePage/>
    },
    {
      path:'/login',
      element:<LoginPage/>
    },
    {
      path:'/signup',
      element:<SignupPage/>
    },
    {
      path:'/userDashboard',
      element:<UserDashboardPage/>
    },
    {
      path:'/meeting-request',
      element:<MeetingRequestPage/>
    },
    {
      path:'/project-status',
      element:<ProjectStatusPage/>
    },
    {
      path:'/query',
      element:<QueryPage/>
    }
  ])

  return (
    <RouterProvider router={router}>
      <LoginPage/>
      <SignupPage/>
      <UserDashboardPage/>
    </RouterProvider>
  )
}

export default App
