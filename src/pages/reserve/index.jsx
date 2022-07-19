import React, { useState } from "react"
import { Wrapper, Header } from "./style"
import intl from 'react-intl-universal'
import { Tabs } from 'antd-mobile'
import Records from "./records"
import MyReserve from "./myreserve"

export default function Reserve() {
    const [selectTab, setSelectTab] = useState('reserve')

    const handleChangeTab = key => {
        setSelectTab(key)
    }

    return <Wrapper>
        <Header>{intl.get('reserve_header')}</Header>
        <Tabs activeKey={selectTab} onChange={handleChangeTab} style={{'--active-line-height': 0, '--content-padding': 0}}>
            <Tabs.Tab className={selectTab === 'reserve' ? 'selected' : ''} title={intl.get('reserve_tab')} key='reserve'>
                <MyReserve />
            </Tabs.Tab>
            <Tabs.Tab className={selectTab === 'records' ? 'selected' : ''} title={intl.get('reserve_tab_records')} key='records'>
                <Records />
            </Tabs.Tab>
        </Tabs>
    </Wrapper>
}
