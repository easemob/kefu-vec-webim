import React from 'react'
import { useRoutes } from 'react-router-dom'
import ws from './ws'

const Video = React.lazy(async () => {
    await ws.initConnection()

    return import('./pages/video')
})

const Reserve = React.lazy(() => import('./pages/reserve'))
const Transfer = React.lazy(() => import('./pages/transfer')) // 预约中间页，里面都是跳转逻辑

export default function Router() {
    const element = useRoutes([
        {
            path: "/",
            element: <Video />
        },
        {
            path: '/reserve',
            element: <Reserve />
        },
        {
            path: '/transfer',
            element: <Transfer />
        }
    ])

    return element
}
