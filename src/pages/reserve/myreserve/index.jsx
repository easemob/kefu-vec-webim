import React, { Suspense, useCallback, useEffect, useState } from "react"
import { Wrapper, Header, Container, ReserveRest, ReserveRestTip, ReserveRestButton, ReserveFull, SevenDays } from "./style"
import moment from 'moment'
import AddReserve from './addReserve'
import { businessList, sevenDays as httpSevenDays, restBusiness } from '@/assets/http/reserve' 

const weekName = {
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
    7: '周日'
}

export default function MyReserve({isLogin, setShowLogin, tenantId}) {
    const [business, setBusiness] = useState(null) // 业务类型
    const [date, setDate] = useState(moment().format('YYYY-MM-DD')) // 选中日期
    const [restList, setRestList] = useState([])
    const [rest, setRest] = useState(null)
    const [addVisible, setAddVisible] = useState(false)
    const [basicColumns, setBasicColumns] = useState([])
    const [sevenDays, setSevenDays] = useState([])

    const handleReserve = item => {
        setRest(item)
        if (!isLogin) {
            setShowLogin(true)
            return
        }
        setAddVisible(true)
    }

    // 上周
    const handlePrevDays = () => {
        getDays(moment(sevenDays.shift().subscribeDate).add(-7, 'd').format('YYYY-MM-DD'))
    }

    // 下周
    const handleNextDays = () => {
        getDays(moment(sevenDays.pop().subscribeDate).add(+1, 'd').format('YYYY-MM-DD'))
    }

    const getDays = async d => {
        const { entities } = await httpSevenDays(tenantId, d)
        setSevenDays(entities)
    }

    // 业务列表和日期
    const getBusinessListAndDays = async () => {
        const [businessListData, httpSevenDaysData] = await Promise.all([
            businessList(tenantId),
            httpSevenDays(tenantId, date)
        ])

        businessListData.status === 'OK' && setBasicColumns(businessListData.entities)
        httpSevenDaysData.status === 'OK' && setSevenDays(httpSevenDaysData.entities)
    }

    // 剩余资源
    const getRestBusiness = async () => {
        if (business && date) {
            const { status, entities } = await restBusiness(tenantId, business.id, date)
            status === 'OK' && setRestList(entities)
            setAddVisible(false)
        }
    }

    // 处理剩余资源列表
    const handleRestList = () => {
        setRestList(oList => oList.map(t => t.surplusId === rest.surplusId ? Object.assign({}, t, {surplusReservationNum: t.surplusReservationNum - 1}) : t))
    }

    useEffect(() => {
        getRestBusiness()
    }, [business, date])

    useEffect(() => {
        getBusinessListAndDays()
    }, [])
    
    useEffect(() => {
        setAddVisible(false)
    }, [isLogin])

    return <Wrapper>
        <Header>
            {basicColumns.map(item => <span key={item.id} className={business && (item.id === business.id) ? 'selected' : ''} onClick={e => setBusiness(item)}>{item.name}</span>)}
        </Header>
        <SevenDays>
            <span
                style={{transform: 'rotate(180deg)'}}
                className="icon-next"
                onClick={handlePrevDays}
                ></span>
            <div>
                {sevenDays.map(item => <div key={item.subscribeDate} onClick={e => setDate(item.subscribeDate)} className={item.subscribeDate === date ? 'selected' : ''}>
                    <span>{weekName[item.week]}</span>
                    <span>{item.subscribeDate.split('-').slice(1).join('-')}</span>
                </div>)}
            </div>
            <span
                className="icon-next"
                onClick={handleNextDays}></span>
        </SevenDays>
        <Container>
            {restList.length ? restList.map(item => (
                <ReserveRest key={item.surplusId}>
                    <ReserveRestTip>
                        {item.timePeriod ? <i>{item.timePeriod}</i> : ''}
                    </ReserveRestTip>
                    <ReserveRestTip>
                        剩余<i>{item.surplusReservationNum || 0}</i>个
                    </ReserveRestTip>
                    {item.surplusReservationNum > 0 ? <ReserveRestButton onClick={() => handleReserve(item)}>预约</ReserveRestButton> : <ReserveFull>约满</ReserveFull>}
                </ReserveRest>
            )) : null}
            {addVisible && <AddReserve
                tenantId={tenantId}
                business={business}
                rest={rest}
                date={date}
                week={(() => {
                    let p = sevenDays.find(({subscribeDate}) => subscribeDate === date)
                    return weekName[p.week]
                })()}
                time={rest.timePeriod || ''}
                setAddVisible={setAddVisible}
                handleRestList={handleRestList}
            />}
        </Container>
    </Wrapper>
}
