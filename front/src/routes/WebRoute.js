import React from 'react'


export const WebRoute = [
    {
        path: '/',
        element: <LandingMain />,
        index: true
    },
    {
        path: '/login',
        element: <Login />,

    },
    {
        path: '/forget-password',
        element: <ForgotPassword />,
    },
    {
        path: '/register',
        element: <Register />,
    },

]