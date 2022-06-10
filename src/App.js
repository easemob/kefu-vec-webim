import React, { Suspense } from 'react'
import '@/assets/css/icon.scss'
import '@/assets/css/common.scss'
import '@/ws/webim.config'
import Loading from './components/Loading'

import ws from './ws'

const Video = React.lazy(() => {
    return ws.initConnection().then(() => import('./pages/video'))
})

export default function App() {
    return <React.Fragment>
        <Suspense fallback={<Loading />}>
            <Video />
        </Suspense>
    </React.Fragment>
}
