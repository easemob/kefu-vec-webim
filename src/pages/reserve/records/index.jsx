import React from "react"
import { Wrapper, Content, Item, Container, Cancel } from './style'
import { Modal, Toast } from 'antd-mobile'
import intl from 'react-intl-universal'


export default function Records() {

    const handleCancelButton = (id) => {
        console.log(id)
        Modal.alert({
            title: '提示',
            content: '取消后不可恢复，确定要取消预定吗？',
            showCloseButton: true,
            confirmText: '确定',
            onConfirm: () => handleCancel()
        })
    }

    const handleCancel = () => {
        Toast.show({
            content: intl.get('reserve_cancel_succ'),
            position: 'top',
        })
    }

    return <Wrapper>
        <Container>
            <Item>
                <Content>预约人：赵海洋</Content>
                <Content>状态：预约</Content>
            </Item>
            <Item>
                <Content>预约业务：认证</Content>
            </Item>
            <Item>
                <Content>预约时间：2022-6-6</Content>
            </Item>
            <Item>
                <Content>建议时间：2022-2-23 09:23:23-10:23:23</Content>
                <Cancel onClick={handleCancelButton.bind(this, 2222)}>取消</Cancel>
            </Item>
        </Container>
        <Container>
            <Item>
                <Content>预约人：赵海洋</Content>
                <Content>状态：预约</Content>
            </Item>
            <Item>
                <Content>预约业务：认证</Content>
            </Item>
            <Item>
                <Content>预约时间：2022-6-6</Content>
            </Item>
            <Item>
                <Content>建议时间：2022-2-23 09:23:23-10:23:23</Content>
                <Cancel onClick={handleCancelButton}>取消</Cancel>
            </Item>
        </Container>
    </Wrapper>
}
