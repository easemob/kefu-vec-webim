import React, { Suspense } from 'react'
import '@/assets/css/icon.scss'
import '@/assets/css/common.scss'
import '@/ws/webim.config'
import Loading from './components/Loading'
import intl from 'react-intl-universal'
import queryString from 'query-string'
import Router from './router'
import { HashRouter, BrowserRouter } from 'react-router-dom'
import { RecoilRoot } from 'recoil'

var lang = queryString.parse(location.search).lang || 'zh-CN'

const locales = {
    "en-US": require('@/assets/locales/en-US').default,
    "zh-CN": require('@/assets/locales/zh-CN').default,
}
intl.init({
    currentLocale: lang,
    locales
})

export default function App() {
    return <React.Fragment>
        <RecoilRoot>
            <Suspense fallback={<Loading />}>
                <BrowserRouter>
                    <Router />
                </BrowserRouter>
            </Suspense>
        </RecoilRoot>
    </React.Fragment>
}
