import React, { useState } from "react"
import { Wrapper, Header } from "./style"
import intl from 'react-intl-universal'
import { Tabs, Toast } from 'antd-mobile'
import Records from "./records"
import MyReserve from "./myreserve"
import Login from './Login'
import { useRecoilState, useRecoilValue } from "recoil"
import { tenantIdState, visitorInfoState, showLoginState } from "@/store/reserve"
import { delVisitorInfo } from '@/assets/storage/cookie'
import { userLogout } from '@/assets/http/reserve'
import utils from '@/tools/utils'

let top = window.top === window.self // false 在iframe里面 true不在

export default function Reserve() {
    const [selectTab, setSelectTab] = useState('reserve')
    const tenantId = useRecoilValue(tenantIdState)
    const [isShowLogin, setShowLogin] = useRecoilState(showLoginState)
    const [visitorInfo, setVisitorInfoState] = useRecoilState(visitorInfoState(tenantId))

    const handleChangeTab = key => {
        if (!isLogin && key === 'records') {
            setShowLogin(true)
            return
        }
        setSelectTab(key)
    }

    const handleLogin = () => {
        setShowLogin(true)
    }

    const handleLogout = async () => {
        const { status } = await userLogout(tenantId, visitorInfo.loginUser.userId, visitorInfo.token)
        if (status === 'OK') {
            delVisitorInfo(tenantId)
            setVisitorInfoState(null)

            setSelectTab('reserve')
        } else {
            Toast.show({
                icon: 'fail',
                content: intl.get('logout_fail')
            })
        }
    }

    const isLogin = visitorInfo ? true : false;

    return <Wrapper top={top} className={`${utils.isMobile ? 'full_screen' : ''}`}>
        <Header>
            <span>{intl.get('reserve_header')}</span>
            {!isLogin ? <span onClick={handleLogin}>{intl.get('reserve_login')}</span> : <span onClick={handleLogout}>{intl.get('reserve_loginout')}</span>}
        </Header>
        {
            isShowLogin ? <Login
                tenantId={tenantId}
                setShowLogin={setShowLogin}
                setVisitorInfoState={setVisitorInfoState}
            /> : (
                <Tabs activeKey={selectTab} onChange={handleChangeTab} style={{'--active-line-height': 0, '--content-padding': 0}}>
                    <Tabs.Tab className={selectTab === 'reserve' ? 'selected' : ''} title={intl.get('reserve_tab')} key='reserve'>
                        <MyReserve isLogin={isLogin} setShowLogin={setShowLogin} tenantId={tenantId} />
                    </Tabs.Tab>
                    <Tabs.Tab className={selectTab === 'records' ? 'selected' : ''} title={intl.get('reserve_tab_records')} key='records'>
                        <Records
                            tenantId={tenantId}
                            selectTab={selectTab}
                        />
                    </Tabs.Tab>
                </Tabs>
            )
        }
    </Wrapper>
}
