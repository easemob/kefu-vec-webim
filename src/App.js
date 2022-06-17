import React, { Suspense } from 'react'
import '@/assets/css/icon.scss'
import '@/assets/css/common.scss'
import '@/ws/webim.config'
import Loading from './components/Loading'
import intl from 'react-intl-universal'
import queryString from 'query-string'

import ws from './ws'

var lang = queryString.parse(location.search).lang || 'zh-CN'

const locales = {
    "en-US": require('@/assets/locales/en-US').default,
    "zh-CN": require('@/assets/locales/zh-CN').default,
}

const Video = React.lazy(async () => {
    await Promise.all([
        ws.initConnection(),
        intl.init({
            currentLocale: lang,
            locales
        })
    ])

    return import('./pages/video')
})

export default function App() {
    return <React.Fragment>
        <Suspense fallback={<Loading />}>
            <Video />
        </Suspense>
    </React.Fragment>
}
