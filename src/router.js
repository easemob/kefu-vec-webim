import React from 'react'
import { useRoutes } from 'react-router-dom'
import ws from './ws'

const Video = React.lazy(async () => {
    await ws.initConnection()

    return import('./pages/video')
})

const Reserve = React.lazy(() => import('./pages/reserve'))

export default function Router() {
    const element = useRoutes([
        {
            path: "/",
            element: <Video />
        },
        {
            path: '/reserve',
            element: <Reserve />
        }
    ])

    return element
}
