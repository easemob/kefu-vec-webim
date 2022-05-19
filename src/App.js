import React from 'react'
import Video from './pages/video'
import '@/assets/css/icon.scss'
import '@/assets/css/common.scss'
import '@/ws/webim.config'

import ws from './ws'

ws.initConnection();

export default function App() {
    return <Video></Video>
}
