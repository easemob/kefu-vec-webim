import React, { useState } from "react";
import { Input, Toast} from 'antd-mobile'
import { AddContainer, AddHeader, AddContent, AddItem, AddItemLabel, AddButton} from './style'
import intl from 'react-intl-universal'

export default function AddReserve(props) {
    const [idCard, setIdCard] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')

    const handleAdd = () => {
        console.log(111, {props, ...{idCard, name, phone}})
        Toast.show({
            content: intl.get('reserve_add_succ'),
            position: 'top',
        })
        props.setAddVisible && props.setAddVisible(false)

        setIdCard('')
        setName('')
        setPhone('')
    }
 
    return <AddContainer>
        <AddHeader>预约信息确认</AddHeader>
        <AddContent>
            <AddItem>
                <AddItemLabel>预约业务：</AddItemLabel>
                <Input value={props.type} readOnly />
            </AddItem>
            <AddItem>
                <AddItemLabel>预约时间：</AddItemLabel>
                <Input value={props.date} readOnly />
            </AddItem>
            <AddItem>
                <AddItemLabel>身份ID：</AddItemLabel>
                <Input value={idCard} onChange={val => setIdCard(val)} />
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