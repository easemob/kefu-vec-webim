import React, { useState } from "react"
import { Wrapper, Header, ReserveButton, Container, ReserveRest, ReserveRestTip, ReserveRestButton, ReserveFull } from "./style"
import { Picker } from 'antd-mobile'
import { Calendar } from 'react-h5-calendar'
import moment from 'moment'
import AddReserve from './addReserve'

export default function MyReserve() {
    const [visible, setVisible] = useState(false)
    const [value, setValue] = useState('')
    const [date, setDate] = useState(moment().format('YYYY-MM-DD'))
    const [restNum, setRestNum] = useState(12)
    const [addVisible, setAddVisible] = useState(false)

    const basicColumns = [
        [
            { label: '周一', value: 'Mon' },
            { label: '周二', value: 'Tues' },
            { label: '周三', value: 'Wed' },
            { label: '周四', value: 'Thur' },
            { label: '周五', value: 'Fri' },
        ]
    ]

    const handleReserve = () => {
        setAddVisible(true)
    }

    return <Wrapper>
        <Header>
            <span>预约业务</span>
            <ReserveButton
                onClick={() => {
                setVisible(true)
                }}
            >
                选择
            </ReserveButton>
            <Picker
                columns={basicColumns}
                visible={visible}
                onClose={() => {
                    setVisible(false)
                }}
                value={value}
                onConfirm={v => {
                    setValue(v)
                }}
            />
        </Header>
        <Calendar
            onDateClick={date => setDate(date.format('YYYY-MM-DD'))}
            currentDate={date}
            showType={'week'}
        />
        <Container>
            <ReserveRest>
                <ReserveRestTip>剩余<i>{restNum}</i>个</ReserveRestTip>
                {restNum > 0 ? <ReserveRestButton onClick={handleReserve}>预约</ReserveRestButton> : <ReserveFull>约满</ReserveFull>}
            </ReserveRest>
            {addVisible && <AddReserve
                type={value}
                date={date}
                setAddVisible={setAddVisible}
            />}
        </Container>
    </Wrapper>
}
