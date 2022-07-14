import React from "react";
import { Content } from './style'
import { Container, Title, Name, Time } from '../style' 

export default function Img({data: {nicename, date, src}}) {
    const pos = 'left'

    return <Container>
        <Title pos={pos}>
            <Name>{nicename}</Name>
            <Time>{date}</Time>
        </Title>
        <Content pos={pos} src={src}>
        </Content>
    </Container>
}
