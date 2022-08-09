import React, { useState } from "react";
import { Input, Toast} from 'antd-mobile'
import { AddContainer, AddHeader, AddContent, AddItem, AddItemLabel, AddButton} from './style'
import intl from 'react-intl-universal'
import { createTask } from '@/assets/http/reserve'
import { useRecoilValue } from "recoil"
import { visitorInfoState } from "@/store/reserve"

export default function AddReserve(props) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const visitorInfo = useRecoilValue(visitorInfoState(props.tenantId))

    const handleAdd = async () => {
        const { status } = await createTask({
            tenantId: props.tenantId,
            creatorId: visitorInfo.loginUser.userId,
            subscribeTimePeriod: `${props.date} ${props.week} ${props.time}`,
            visitorName: name,
            contact: phone,
            resourceDetailId: props.rest.resourceDetailId,
            token: visitorInfo.token,
            noticeBeforeMinutes: 10,
            businessId: props.business.id
        })
        if (status === 'OK') {
            Toast.show({
                content: intl.get('reserve_add_succ'),
                position: 'top',
            })
            props.setAddVisible && props.setAddVisible(false)
            props.handleRestList && props.handleRestList()
    
            setName('')
            setPhone('')
        } else {
            Toast.show({
                icon: 'fail',
                content: intl.get('reserve_add_fail'),
            })
        }
    }
 
    return <AddContainer>
        <AddHeader>预约信息确认</AddHeader>
        <AddContent>
            <AddItem>
                <AddItemLabel>预约业务：</AddItemLabel>
                <Input value={props.business ? props.business.name : ''} readOnly />
            </AddItem>
            <AddItem>
                <AddItemLabel>预约时间：</AddItemLabel>
                <Input value={`${props.date} ${props.week} ${props.time}`} readOnly />
            </AddItem>
            <AddItem>
                <AddItemLabel>名称：</AddItemLabel>
                <Input value={name} onChange={val => setName(val)} />
            </AddItem>
            <AddItem>
                <AddItemLabel>联系方式：</AddItemLabel>
                <Input value={phone} onChange={val => setPhone(val)} />
            </AddItem>
            <AddButton onClick={handleAdd}>确认预约</AddButton>
        </AddContent>
    </AddContainer>
}