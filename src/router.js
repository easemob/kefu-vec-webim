import React, { useState, useEffect } from 'react'
import { useRoutes } from 'react-router-dom'
import Loading from './components/Loading'
import '@/ws/webim.config'
import ws from './ws'

const Video = React.lazy(() => import('./pages/video'))
const Reserve = React.lazy(() => import('./pages/reserve'))
const Transfer = React.lazy(() => import('./pages/transfer')) // 预约中间页，里面都是跳转逻辑

export default function Router() {
    const [init, setInit] = useState(false)

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

    useEffect(() => {
        async function getWs() {
            await ws.initConnection()
            console.log('init end', Date.now())
            setInit(true)
        }
        getWs()
    }, [])

    return init ? element : <Loading />
}
